"""
Training Job Endpoints
Manage and monitor training jobs
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import (
    TrainingJobCreate, TrainingJobResponse,
    MessageResponse, JobStatus, HyperparametersConfig
)
from database import DatasetDB, ModelDB, JobDB
from datetime import datetime
from job_worker import submit_training_job
from job_logger import JobLogger

router = APIRouter()

@router.get("", response_model=List[TrainingJobResponse])
async def list_jobs(status: Optional[JobStatus] = None):
    """
    List all training jobs with optional status filter

    - **status**: Filter by job status (pending, running, completed, failed)
    """
    jobs = JobDB.get_all(status=status.value if status else None)
    return jobs

@router.get("/{job_id}", response_model=TrainingJobResponse)
async def get_job(job_id: str):
    """
    Get a specific training job by ID
    """
    job = JobDB.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job

@router.post("", response_model=TrainingJobResponse, status_code=201)
async def create_training_job(
    job_request: TrainingJobCreate
):
    """
    Start a new training job

    Creates a training job that will train a CNN model on the specified dataset.
    The job runs in the background and can be monitored via the job ID.

    - **dataset_id**: ID of the dataset to train on
    - **model_name**: Optional name for the resulting model
    - **hyperparameters**: Optional hyperparameter configuration
    - **task**: Model task type (classification, regression, etc.)
    """
    try:
        # Validate dataset exists
        dataset = DatasetDB.get_by_id(job_request.dataset_id)
        if not dataset:
            raise HTTPException(
                status_code=404,
                detail=f"Dataset {job_request.dataset_id} not found"
            )

        # Check dataset is ready
        if dataset.get("readiness") not in ["ready", "draft"]:
            raise HTTPException(
                status_code=400,
                detail=f"Dataset must be in 'ready' or 'draft' state, currently: {dataset.get('readiness')}"
            )

        # Set default hyperparameters if not provided
        hyperparams = job_request.hyperparameters or HyperparametersConfig()

        # Get task value (handle both enum and string)
        task_value = job_request.task.value if hasattr(job_request.task, 'value') else str(job_request.task)

        # Create model record with queued status
        model_name = job_request.model_name or f"{dataset.get('name')}_model"
        model_data = {
            "name": model_name,
            "task": task_value,
            "framework": "pytorch",  # lowercase to match database constraint
            "tags": [dataset.get("name"), task_value],
            "description": f"CNN model training on {dataset.get('name')}",
            "status": "queued",
            "dataset_id": job_request.dataset_id,
        }
        new_model = ModelDB.create(model_data)

        # Create job record
        job_data = {
            "dataset_id": job_request.dataset_id,
            "model_id": new_model["id"],
            "status": "pending",
            "progress": 0.0,
            "current_iteration": 0,
            "total_iterations": hyperparams.max_iterations,
            "current_accuracy": None,
            "best_accuracy": None,
            "hyperparameters": hyperparams.model_dump(),
            "error_message": None
        }

        new_job = JobDB.create(job_data)

        # Submit training job to worker pool (runs in separate process)
        submit_training_job(
            job_id=new_job["id"],
            dataset=dataset,
            hyperparams=hyperparams.model_dump(),
            model_id=new_model["id"],
            model_name=model_name,
            task=job_request.task.value if hasattr(job_request.task, 'value') else str(job_request.task),
            strategy='auto'
        )

        return new_job
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error creating training job: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create training job: {str(e)}")

@router.post("/{job_id}/cancel", response_model=MessageResponse)
async def cancel_job(job_id: str):
    """
    Cancel a running training job
    """
    print(f"[API] Cancel endpoint called for job {job_id}")

    job = JobDB.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    print(f"[API] Job found: {job.get('id')}, status: {job.get('status')}")

    if job.get("status") not in ["pending", "running"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel job in status: {job.get('status')}"
        )

    # Try to terminate the actual training process
    print(f"[API] Getting worker pool to cancel job {job_id}")
    from job_worker import get_worker_pool
    pool = get_worker_pool()
    print(f"[API] Worker pool obtained, calling cancel_job")
    process_terminated = pool.cancel_job(job_id)
    print(f"[API] cancel_job returned: {process_terminated}")

    # Update job status to failed (valid status per DB constraint: pending, running, completed, failed)
    JobDB.update(job_id, {
        "status": "failed",
        "completed_at": datetime.now().isoformat(),
        "error_message": "Job cancelled by user"
    })

    # Also update the associated model status to failed
    if job.get("model_id"):
        ModelDB.update(job["model_id"], {
            "status": "failed"
        })

    detail = "Training job has been cancelled and marked as failed"
    if process_terminated:
        detail += " (process terminated)"
    else:
        detail += " (process was not running or already completed)"

    return MessageResponse(
        message=f"Job {job_id} cancelled",
        detail=detail
    )

@router.delete("/{job_id}", response_model=MessageResponse)
async def delete_job(job_id: str):
    """
    Delete a training job record
    """
    job = JobDB.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    # Don't allow deletion of running jobs
    if job.get("status") == "running":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a running job. Cancel it first."
        )

    success = JobDB.delete(job_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete job")

    return MessageResponse(
        message=f"Job {job_id} deleted successfully"
    )

@router.get("/{job_id}/logs")
async def get_job_logs(
    job_id: str,
    max_lines: Optional[int] = Query(default=500, description="Maximum number of log lines to return (most recent)")
):
    """
    Get training logs for a job

    Returns real-time logs from the training process.
    Logs are streamed as they are generated and can be polled for updates.

    - **job_id**: ID of the training job
    - **max_lines**: Maximum number of log lines to return (default: 500, most recent lines)
    """
    job = JobDB.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    # Read logs from file
    logs = JobLogger.read_logs(job_id, max_lines=max_lines)

    return {
        "job_id": job_id,
        "logs": logs,
        "total_lines": len(logs)
    }
