"""
Training Job Runner
Background task runner using the plugin-based training pipeline
"""

import traceback
from datetime import datetime
from pathlib import Path
from typing import Optional

from database import DatasetDB, JobDB, ModelDB
from hardware_utils import get_optimal_device, log_device_info
from job_logger import JobLogger
from models import HyperparametersConfig, ModelTask
from training_pipeline import (ProgressUpdate, TrainingConfig,
                               TrainingOrchestrator)


def run_training_job(
    job_id: str,
    dataset: dict,
    hyperparams: HyperparametersConfig,
    model_id: str = None,
    model_name: str = None,
    task: ModelTask = ModelTask.CLASSIFICATION,
    strategy: str = 'auto'
):
    """
    Run a training job using the plugin-based training pipeline

    Args:
        job_id: Job ID for tracking
        dataset: Dataset dictionary from database
        hyperparams: Hyperparameters configuration
        model_id: Model ID (created before training)
        model_name: Model name
        task: Training task (classification, regression, etc.)
        strategy: Training strategy (llm, native, auto)
    """
    import time
    start_time = time.time()

    # Create logger for this job
    logger = JobLogger(job_id)

    try:
        logger.info(f"Starting training job {job_id}")

        # Update model status to training
        if model_id:
            ModelDB.update(model_id, {"status": "training"})
            logger.info(f"Model {model_id} status updated to 'training'")

        # Update job status to running
        JobDB.update(job_id, {
            "status": "running",
            "started_at": datetime.now().isoformat(),
            "progress": 0.0
        })
        logger.info("Job status updated to 'running'")

        # Extract dataset info
        dataset_id = dataset.get("id")
        dataset_path = Path(dataset.get("path"))
        dataset_name = dataset.get("name")
        dataset_domain = dataset.get("domain")
        num_samples = dataset.get("size", 0)

        # Infer number of classes from dataset structure (for vision datasets)
        num_classes = _infer_num_classes(dataset_path, dataset_domain)

        logger.info(f"Dataset: {dataset_name}")
        logger.info(f"  - Samples: {num_samples}")
        logger.info(f"  - Classes: {num_classes}")
        logger.info(f"  - Domain: {dataset_domain}")

        # Detect optimal hardware device
        device, device_description = get_optimal_device()
        logger.info("")
        log_device_info(logger)
        logger.info("")
        logger.info(f"Using device: {device} - {device_description}")

        # Build training configuration
        config = TrainingConfig(
            dataset_id=dataset_id,
            dataset_path=dataset_path,
            dataset_domain=dataset_domain,
            num_classes=num_classes,
            num_samples=num_samples,
            model_id=model_id,
            model_name=model_name or f"{dataset_name}_model",
            task=task.value if isinstance(task, ModelTask) else task,
            # Hyperparameters (optional - strategy may determine)
            learning_rate=hyperparams.learning_rate if hyperparams else None,
            batch_size=hyperparams.batch_size if hyperparams else None,
            epochs=hyperparams.epochs if hyperparams else None,
            optimizer=hyperparams.optimizer if hyperparams else None,
            dropout_rate=hyperparams.dropout_rate if hyperparams else None,
            # Training config
            max_iterations=hyperparams.max_iterations if hyperparams else 10,
            target_accuracy=hyperparams.target_accuracy if hyperparams else 1.0,
            device=device,  # Adaptive: CUDA → MPS → CPU
            # Platform integration
            job_id=job_id,
            strategy=strategy
        )

        # Create orchestrator
        orchestrator = TrainingOrchestrator()

        # Define progress callback
        def on_progress(progress: ProgressUpdate):
            """Update job progress in database"""
            try:
                # Calculate overall progress percentage
                progress_percent = (progress.iteration /
                                    progress.total_iterations) * 100

                # Calculate time tracking
                elapsed_seconds = int(time.time() - start_time)

                # Estimate remaining time based on progress
                if progress_percent > 0:
                    total_estimated_seconds = int(
                        (elapsed_seconds / progress_percent) * 100)
                    remaining_seconds = max(
                        0, total_estimated_seconds - elapsed_seconds)
                else:
                    remaining_seconds = 0

                # Format time strings
                elapsed_time = _format_time(elapsed_seconds)
                estimated_remaining = _format_time(remaining_seconds)

                # Update job in database
                update_data = {
                    "progress": progress_percent,
                    "current_iteration": progress.iteration,
                    "total_iterations": progress.total_iterations,
                    "current_accuracy": progress.current_accuracy,
                    "current_loss": progress.current_loss,
                }

                # Update best metrics
                if progress.best_accuracy is not None:
                    update_data["best_accuracy"] = progress.best_accuracy

                if progress.best_loss is not None:
                    update_data["best_loss"] = progress.best_loss

                # Update classification metrics
                if progress.precision is not None:
                    update_data["precision"] = progress.precision

                if progress.recall is not None:
                    update_data["recall"] = progress.recall

                if progress.f1_score is not None:
                    update_data["f1_score"] = progress.f1_score

                if progress.status == 'failed':
                    update_data["status"] = "failed"
                    update_data["error_message"] = progress.message

                # Store time tracking in config JSONB field
                job = JobDB.get_by_id(job_id)
                if job:
                    config = job.get("config") or {}
                    config["elapsed_seconds"] = elapsed_seconds
                    config["remaining_seconds"] = remaining_seconds
                    config["elapsed_time"] = elapsed_time
                    config["estimated_remaining"] = estimated_remaining
                    update_data["config"] = config

                JobDB.update(job_id, update_data)

                # Log progress (handle None values safely)
                metrics_str = []
                if progress.current_accuracy is not None:
                    metrics_str.append(f"Acc: {progress.current_accuracy:.4f}")
                if progress.current_loss is not None:
                    metrics_str.append(f"Loss: {progress.current_loss:.4f}")
                if progress.precision is not None:
                    metrics_str.append(f"Prec: {progress.precision:.4f}")
                if progress.recall is not None:
                    metrics_str.append(f"Rec: {progress.recall:.4f}")
                if progress.f1_score is not None:
                    metrics_str.append(f"F1: {progress.f1_score:.4f}")

                metrics_info = " | ".join(
                    metrics_str) if metrics_str else "N/A"
                logger.info(
                    f"Iteration {progress.iteration}/{progress.total_iterations} - {metrics_info} - Elapsed: {elapsed_time} - Remaining: {estimated_remaining}")

                if progress.best_accuracy is not None:
                    logger.info(
                        f"  Best accuracy: {progress.best_accuracy:.4f}")
                if progress.best_loss is not None:
                    logger.info(f"  Best loss: {progress.best_loss:.4f}")

            except Exception as e:
                logger.error(f"Error updating progress: {e}")

        # Execute training
        logger.info(f"Starting training with strategy: {strategy}")
        logger.info(
            f"Hyperparameters: max_iterations={config.max_iterations}, target_accuracy={config.target_accuracy}")
        result = orchestrator.train(config, progress_callback=on_progress)

        # Check if training succeeded
        if result.success:
            logger.info("=" * 50)
            logger.info("Training completed successfully!")
            if result.final_accuracy:
                logger.info(f"Final accuracy: {result.final_accuracy:.4f}")
            if result.best_accuracy:
                logger.info(f"Best accuracy: {result.best_accuracy:.4f}")
            if result.hyperparameters:
                logger.info(f"Final hyperparameters: {result.hyperparameters}")
            if result.model_path:
                logger.info(f"Model saved to: {result.model_path}")
            logger.info("=" * 50)

            # Update model with final results
            if model_id:
                model_update = {
                    "status": "ready",
                    "last_trained": datetime.now().isoformat(),
                    "accuracy": result.final_accuracy * 100 if result.final_accuracy else None,
                    "loss": result.final_loss,
                    "model_path": str(result.model_path) if result.model_path else None,
                    "hyperparameters": result.hyperparameters,
                    "metrics": result.metrics,
                }
                ModelDB.update(model_id, model_update)
                logger.info(f"Model {model_id} updated with final results")

            # Update job as completed (preserve iteration counts!)
            job_data = JobDB.get_by_id(job_id)
            JobDB.update(job_id, {
                "status": "completed",
                "progress": 100.0,
                "current_iteration": job_data.get("total_iterations") or config.max_iterations,
                "total_iterations": job_data.get("total_iterations") or config.max_iterations,
                "best_accuracy": result.best_accuracy,
                "completed_at": datetime.now().isoformat()
            })

            logger.info(f"Job {job_id} completed successfully!")

        else:
            # Training failed
            logger.error(f"Training failed: {result.error}")

            # Update model status to failed
            if model_id:
                ModelDB.update(model_id, {"status": "failed"})
                logger.info(f"Model {model_id} marked as failed")

            # Update job as failed
            JobDB.update(job_id, {
                "status": "failed",
                "error_message": result.error,
                "completed_at": datetime.now().isoformat()
            })
            logger.info(f"Job {job_id} marked as failed")

    except Exception as e:
        # Handle unexpected errors
        error_msg = str(e)
        error_trace = traceback.format_exc()

        logger.error(f"Unexpected error: {error_msg}")
        logger.error("Full traceback:")
        for line in error_trace.split('\n'):
            if line.strip():
                logger.error(f"  {line}")

        # Update model status to failed
        if model_id:
            ModelDB.update(model_id, {"status": "failed"})

        # Update job as failed
        JobDB.update(job_id, {
            "status": "failed",
            "error_message": error_msg,
            "completed_at": datetime.now().isoformat()
        })

    finally:
        # Close logger
        logger.close()


def _infer_num_classes(dataset_path: Path, dataset_domain: str) -> int:
    """
    Infer number of classes from dataset structure

    For vision datasets, assumes structure:
        dataset/
            train/
                class1/
                class2/
                ...
    """
    if dataset_domain == 'vision':
        # Look for class directories in train folder
        train_dir = dataset_path / 'train'
        if train_dir.exists() and train_dir.is_dir():
            # Count subdirectories (each is a class)
            class_dirs = [d for d in train_dir.iterdir(
            ) if d.is_dir() and not d.name.startswith('.')]
            return len(class_dirs)

        # Fallback: count top-level directories
        class_dirs = [d for d in dataset_path.iterdir(
        ) if d.is_dir() and not d.name.startswith('.')]
        return max(len(class_dirs), 2)  # At least binary classification

    # Default for other domains
    return 2


def _format_time(seconds: int) -> str:
    """
    Format seconds into human-readable time string

    Args:
        seconds: Total seconds

    Returns:
        Formatted time string (e.g., "2h 15m", "45m 32s", "12s")
    """
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes}m {secs}s"
    else:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        return f"{hours}h {minutes}m"


# Legacy functions for backward compatibility (deprecated)
def run_training_job_real(*args, **kwargs):
    """Deprecated: Use run_training_job instead"""
    print("[WARNING] run_training_job_real is deprecated. Use run_training_job instead.")
    return run_training_job(*args, **kwargs)
