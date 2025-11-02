"""
Model Management Endpoints
Operations for trained models
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import (
    TrainedModelResponse, TrainedModelUpdate,
    MessageResponse, ModelTask, ModelStatus
)
from database import ModelDB
import shutil
from pathlib import Path

router = APIRouter()

@router.get("", response_model=List[TrainedModelResponse])
async def list_models(
    task: Optional[ModelTask] = None,
    status: Optional[ModelStatus] = None,
    search: Optional[str] = None
):
    """
    List all trained models with optional filters

    - **task**: Filter by model task (classification, regression, etc.)
    - **status**: Filter by model status (active, training, etc.)
    - **search**: Search by model name
    """
    models = ModelDB.get_all(
        task=task.value if task else None,
        status=status.value if status else None,
        search=search
    )
    return models

@router.get("/{model_id}", response_model=TrainedModelResponse)
async def get_model(model_id: str):
    """
    Get a specific model by ID
    """
    model = ModelDB.get_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    return model

@router.put("/{model_id}", response_model=TrainedModelResponse)
async def update_model(model_id: str, model_update: TrainedModelUpdate):
    """
    Update model metadata (name, tags, description)
    """
    # Check if model exists
    existing = ModelDB.get_by_id(model_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

    # Update model
    update_data = model_update.model_dump(exclude_unset=True)
    updated_model = ModelDB.update(model_id, update_data)

    return updated_model

@router.patch("/{model_id}/name", response_model=TrainedModelResponse)
async def update_model_name(model_id: str, name: str):
    """
    Update only the model name (convenience endpoint)
    """
    existing = ModelDB.get_by_id(model_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

    updated_model = ModelDB.update(model_id, {"name": name})
    return updated_model

@router.delete("/{model_id}", response_model=MessageResponse)
async def delete_model(model_id: str):
    """
    Delete a trained model

    Deletes both the model record and associated model files from storage.
    """
    # Check if model exists
    model = ModelDB.get_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

    # Delete model files
    files_deleted = False
    model_path = model.get("model_path")
    if model_path:
        model_file = Path(model_path)
        if model_file.exists():
            try:
                model_file.unlink()
                files_deleted = True
                print(f"Deleted model file: {model_path}")
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to delete model file: {str(e)}"
                )

    # Delete from database
    success = ModelDB.delete(model_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete model from database")

    return MessageResponse(
        message=f"Model '{model.get('name')}' deleted successfully",
        detail=f"Database record and files removed" if files_deleted else "Database record removed (no files found)"
    )

@router.get("/{model_id}/download")
async def download_model(model_id: str):
    """
    Download model file (placeholder - would return actual file in production)
    """
    model = ModelDB.get_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

    model_path = model.get("model_path")
    if not model_path or not Path(model_path).exists():
        raise HTTPException(
            status_code=404,
            detail="Model file not found"
        )

    # In production, would use FileResponse to return the actual file
    # from fastapi.responses import FileResponse
    # return FileResponse(model_path, filename=f"{model['name']}.py")

    return MessageResponse(
        message="Model download endpoint",
        detail=f"Model path: {model_path}"
    )
