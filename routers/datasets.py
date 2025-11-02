"""
Dataset Management Endpoints

This module provides CRUD operations for dataset management including:
- Listing and filtering datasets
- Creating datasets from file uploads
- Updating dataset metadata
- Deleting datasets and associated files
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import zipfile
import shutil
import os
from pathlib import Path

from models import (
    DatasetUpdate,
    DatasetResponse,
    MessageResponse,
    DatasetDomain,
    DatasetReadiness
)
from database import DatasetDB

router = APIRouter()

# Constants
DATA_DIR = Path("./data")
CHUNK_SIZE = 1024 * 1024  # 1MB chunks for file streaming


def _calculate_dataset_size(dataset_dir: Path) -> tuple[int, int]:
    """
    Calculate dataset size by counting files and total bytes.

    Args:
        dataset_dir: Path to the dataset directory

    Returns:
        Tuple of (file_count, total_bytes)
    """
    file_count = 0
    total_bytes = 0

    for root, _, files in os.walk(dataset_dir):
        # Skip hidden files and macOS metadata
        visible_files = [f for f in files if not f.startswith('.') and f != '.DS_Store']
        file_count += len(visible_files)

        for file_name in visible_files:
            file_path = Path(root) / file_name
            try:
                total_bytes += file_path.stat().st_size
            except OSError:
                # Skip files that can't be accessed
                continue

    return file_count, total_bytes


def _parse_tags(tags: Optional[str]) -> List[str]:
    """
    Parse comma-separated tags string into a list.

    Args:
        tags: Comma-separated string of tags

    Returns:
        List of trimmed tag strings
    """
    if not tags:
        return []
    return [tag.strip() for tag in tags.split(',') if tag.strip()]


@router.get("", response_model=List[DatasetResponse])
async def list_datasets(
    domain: Optional[DatasetDomain] = None,
    readiness: Optional[DatasetReadiness] = None,
    search: Optional[str] = None
):
    """
    List all datasets with optional filters.

    Args:
        domain: Filter by domain (tabular, vision, text, audio)
        readiness: Filter by readiness status
        search: Search by dataset name

    Returns:
        List of datasets matching the filters
    """
    datasets = DatasetDB.get_all(
        domain=domain.value if domain else None,
        readiness=readiness.value if readiness else None,
        search=search
    )
    return datasets


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: str):
    """
    Get a specific dataset by ID.

    Args:
        dataset_id: Unique dataset identifier

    Returns:
        Dataset details

    Raises:
        HTTPException: If dataset not found
    """
    dataset = DatasetDB.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset {dataset_id} not found"
        )
    return dataset


@router.post("", response_model=DatasetResponse, status_code=201)
async def create_dataset(
    name: str = Form(...),
    domain: DatasetDomain = Form(...),
    file: UploadFile = File(...),
    tags: Optional[str] = Form(None),
    description: Optional[str] = Form(None)
):
    """
    Upload and create a new dataset.

    Supports large file uploads up to 100GB with streaming.
    Automatically extracts ZIP archives and calculates dataset size.

    Args:
        name: Dataset name (required)
        domain: Dataset domain - vision, tabular, text, or audio (required)
        file: Dataset file (ZIP archive recommended for large datasets) (required)
        tags: Comma-separated tags (optional)
        description: Dataset description (optional)

    Returns:
        DatasetResponse: Created dataset with metadata

    Raises:
        HTTPException: If file save/extraction fails or dataset already exists

    Notes:
        - The backend automatically creates storage directory at ./data/{name}/
        - ZIP files are extracted and the archive is removed
        - Dataset size is calculated by walking the directory tree
        - Vision datasets are marked as 'ready', others as 'draft'
    """
    # Ensure data directory exists
    DATA_DIR.mkdir(exist_ok=True)

    # Create dataset-specific directory
    dataset_dir = DATA_DIR / name
    if dataset_dir.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Dataset '{name}' already exists"
        )

    dataset_dir.mkdir(parents=True, exist_ok=True)
    file_path = dataset_dir / file.filename

    try:
        # Stream file to disk for efficient large file handling
        with file_path.open("wb") as buffer:
            while chunk := await file.read(CHUNK_SIZE):
                buffer.write(chunk)
    except Exception as e:
        # Clean up on failure
        if dataset_dir.exists():
            shutil.rmtree(dataset_dir)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    finally:
        await file.close()

    # Extract ZIP files automatically
    if file.filename.lower().endswith('.zip'):
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(dataset_dir)
            file_path.unlink()  # Remove ZIP after extraction
            print(f"Extracted ZIP file to {dataset_dir}")
        except zipfile.BadZipFile as e:
            shutil.rmtree(dataset_dir)
            raise HTTPException(
                status_code=400,
                detail=f"Invalid ZIP file: {str(e)}"
            )
        except Exception as e:
            shutil.rmtree(dataset_dir)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract ZIP file: {str(e)}"
            )

    # Calculate dataset statistics
    file_count, total_bytes = _calculate_dataset_size(dataset_dir)

    # Parse tags
    tag_list = _parse_tags(tags)

    # Determine readiness: vision datasets are ready immediately
    readiness = "ready" if domain.value == "vision" else "draft"

    # Build dataset record
    size_mb = total_bytes / (1024**2)
    dataset_data = {
        "name": name,
        "domain": domain.value,
        "storage": "local",
        "path": str(dataset_dir),
        "size": file_count,
        "tags": tag_list,
        "description": description or f"Dataset: {name} ({file_count} files, {size_mb:.2f} MB)",
        "readiness": readiness
    }

    new_dataset = DatasetDB.create(dataset_data)

    print(f"Dataset created: {name} | Files: {file_count} | Size: {size_mb:.2f} MB")

    return new_dataset


@router.put("/{dataset_id}", response_model=DatasetResponse)
async def update_dataset(dataset_id: str, dataset_update: DatasetUpdate):
    """
    Update dataset metadata (name, tags, description, readiness).

    Args:
        dataset_id: Unique dataset identifier
        dataset_update: Fields to update

    Returns:
        Updated dataset details

    Raises:
        HTTPException: If dataset not found
    """
    # Check if dataset exists
    existing = DatasetDB.get_by_id(dataset_id)
    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset {dataset_id} not found"
        )

    # Update dataset
    update_data = dataset_update.model_dump(exclude_unset=True)
    updated_dataset = DatasetDB.update(dataset_id, update_data)

    return updated_dataset


@router.patch("/{dataset_id}/name", response_model=DatasetResponse)
async def update_dataset_name(dataset_id: str, name: str):
    """
    Update only the dataset name (convenience endpoint).

    Args:
        dataset_id: Unique dataset identifier
        name: New dataset name

    Returns:
        Updated dataset details

    Raises:
        HTTPException: If dataset not found
    """
    existing = DatasetDB.get_by_id(dataset_id)
    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset {dataset_id} not found"
        )

    updated_dataset = DatasetDB.update(dataset_id, {"name": name})
    return updated_dataset


@router.delete("/{dataset_id}", response_model=MessageResponse)
async def delete_dataset(dataset_id: str):
    """
    Delete a dataset and all associated files.

    Args:
        dataset_id: Unique dataset identifier

    Returns:
        Success message

    Raises:
        HTTPException: If dataset not found or deletion fails
    """
    # Check if dataset exists
    dataset = DatasetDB.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset {dataset_id} not found"
        )

    # Delete files from storage
    files_deleted = False
    if dataset.get("storage") == "local":
        dataset_path = Path(dataset.get("path", ""))
        if dataset_path.exists():
            try:
                shutil.rmtree(dataset_path)
                files_deleted = True
                print(f"Deleted dataset files: {dataset_path}")
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to delete dataset files: {str(e)}"
                )

    # Delete from database
    success = DatasetDB.delete(dataset_id)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete dataset from database"
        )

    detail = "Database record and files removed" if files_deleted else "Database record removed (no files found)"
    return MessageResponse(
        message=f"Dataset '{dataset.get('name')}' deleted successfully",
        detail=detail
    )
