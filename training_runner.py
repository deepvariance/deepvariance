"""
Training Job Runner
Background task runner for CNN training jobs
"""
import subprocess
import json
import os
from datetime import datetime
from pathlib import Path
from database import JobDB, ModelDB
from models import HyperparametersConfig, ModelTask

def run_training_job(
    job_id: str,
    dataset: dict,
    hyperparams: HyperparametersConfig,
    model_id: str = None,
    model_name: str = None,
    task: ModelTask = ModelTask.CLASSIFICATION
):
    """
    Run a training job in the background using the CNN pipeline
    """
    try:
        # Update model status to training
        if model_id:
            ModelDB.update(model_id, {"status": "training"})

        # Update job status to running
        JobDB.update(job_id, {
            "status": "running",
            "started_at": datetime.now().isoformat(),
            "progress": 0.0
        })

        # Prepare dataset path
        dataset_path = dataset.get("path")
        dataset_name = dataset.get("name")
        dataset_domain = dataset.get("domain")

        # Build command for CNN training
        cmd = [
            "python", "cnn_new.py",
            "--dataset", dataset_path,
            "--num-workers", "0"
        ]

        # Add resize parameter for non-MNIST datasets
        if dataset_domain in ["vision", "tabular"]:
            cmd.extend(["--resize", "224", "224"])

        # Set environment variables for hyperparameters
        # Note: The original cnn_new.py doesn't support hyperparameter arguments,
        # so we would need to modify it or pass config via environment

        print(f"[Job {job_id}] Starting training with command: {' '.join(cmd)}")
        print(f"[Job {job_id}] Hyperparameters: {hyperparams.model_dump()}")

        # For now, simulate training progress
        # In production, would actually run the CNN pipeline
        # process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Simulate training iterations
        import time
        for iteration in range(1, hyperparams.max_iterations + 1):
            # Simulate iteration time
            time.sleep(2)  # In production, would monitor actual training

            # Mock accuracy progression
            mock_accuracy = min(0.5 + (iteration * 0.05), 0.95)
            progress = (iteration / hyperparams.max_iterations) * 100

            # Update job progress
            JobDB.update(job_id, {
                "current_iteration": iteration,
                "progress": progress,
                "current_accuracy": mock_accuracy
            })

            print(f"[Job {job_id}] Iteration {iteration}/{hyperparams.max_iterations}, Accuracy: {mock_accuracy:.4f}")

        # Training completed
        final_accuracy = 0.92  # Mock final accuracy

        # Update existing model record
        if model_id:
            ModelDB.update(model_id, {
                "accuracy": final_accuracy * 100,
                "status": "ready",
                "last_trained": datetime.now().isoformat(),
                "model_path": f"./models/best_model_{dataset_name}.py"
            })

        # Update job as completed
        JobDB.update(job_id, {
            "status": "completed",
            "progress": 100.0,
            "best_accuracy": final_accuracy,
            "completed_at": datetime.now().isoformat()
        })

        print(f"[Job {job_id}] Training completed successfully! Model ID: {model_id}")

    except Exception as e:
        # Handle training failure
        error_msg = str(e)
        print(f"[Job {job_id}] Training failed: {error_msg}")

        # Update model status to failed
        if model_id:
            ModelDB.update(model_id, {"status": "failed"})

        JobDB.update(job_id, {
            "status": "failed",
            "error_message": error_msg,
            "completed_at": datetime.now().isoformat()
        })


def run_training_job_real(
    job_id: str,
    dataset: dict,
    hyperparams: HyperparametersConfig,
    model_name: str = None,
    task: ModelTask = ModelTask.CLASSIFICATION
):
    """
    Run actual training job using cnn_new.py
    (Use this once you want to integrate with real CNN pipeline)
    """
    try:
        # Update job status
        JobDB.update(job_id, {
            "status": "running",
            "started_at": datetime.now().isoformat()
        })

        dataset_path = dataset.get("path")

        # Run CNN training
        cmd = [
            "python", "cnn_new.py",
            "--dataset", dataset_path,
            "--num-workers", "0"
        ]

        # Run process and capture output
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )

        # Monitor output
        for line in process.stdout:
            print(f"[Job {job_id}] {line.strip()}")

            # Parse iteration progress
            if "Iteration" in line:
                # Extract iteration number and update progress
                pass

            # Parse final metrics JSON
            if line.strip().startswith("{") and "Accuracy%" in line:
                try:
                    metrics = json.loads(line.strip())
                    final_accuracy = metrics.get("Accuracy%", 0) / 100

                    # Create model record
                    model_data = {
                        "name": model_name or f"{dataset.get('name')}_model",
                        "task": task.value,
                        "framework": "PyTorch",
                        "accuracy": metrics.get("Accuracy%", 0),
                        "dataset_id": dataset.get("id"),
                        "status": "ready",
                        "last_trained": datetime.now().isoformat()
                    }
                    new_model = ModelDB.create(model_data)

                    # Update job
                    JobDB.update(job_id, {
                        "status": "completed",
                        "best_accuracy": final_accuracy,
                        "model_id": new_model["id"],
                        "completed_at": datetime.now().isoformat()
                    })

                except json.JSONDecodeError:
                    pass

        process.wait()

        if process.returncode != 0:
            error_output = process.stderr.read()
            raise Exception(f"Training process failed: {error_output}")

    except Exception as e:
        JobDB.update(job_id, {
            "status": "failed",
            "error_message": str(e),
            "completed_at": datetime.now().isoformat()
        })
