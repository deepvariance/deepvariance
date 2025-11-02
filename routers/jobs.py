"""
Training Job Endpoints
Manage and monitor training jobs
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from models import (
    TrainingJobCreate, TrainingJobResponse,
    MessageResponse, JobStatus, HyperparametersConfig
)
from database import DatasetDB, ModelDB, JobDB
from datetime import datetime
from training_runner import run_training_job

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
    job_request: TrainingJobCreate,
    background_tasks: BackgroundTasks
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

    # Create job record
    job_data = {
        "dataset_id": job_request.dataset_id,
        "model_id": None,
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

    # Start training in background
    background_tasks.add_task(
        run_training_job,
        job_id=new_job["id"],
        dataset=dataset,
        hyperparams=hyperparams,
        model_name=job_request.model_name,
        task=job_request.task
    )

    return new_job

@router.post("/{job_id}/cancel", response_model=MessageResponse)
async def cancel_job(job_id: str):
    """
    Cancel a running training job
    """
    job = JobDB.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    if job.get("status") not in ["pending", "running"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel job in status: {job.get('status')}"
        )

    # Update job status
    JobDB.update(job_id, {
        "status": "cancelled",
        "completed_at": datetime.now().isoformat()
    })

    return MessageResponse(
        message=f"Job {job_id} cancelled",
        detail="Training job has been cancelled"
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
async def get_job_logs(job_id: str):
    """
    Get training logs for a job (placeholder)
    """
    job = JobDB.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    # In production, would read from log files
    return {
        "job_id": job_id,
        "logs": [
            f"Job {job_id} created",
            f"Status: {job.get('status')}",
            f"Progress: {job.get('progress')}%",
            f"Current iteration: {job.get('current_iteration')}/{job.get('total_iterations')}"
        ]
    }
