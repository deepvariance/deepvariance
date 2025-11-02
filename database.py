"""
Database and Storage Layer
Simple JSON-based file storage for datasets, models, and jobs
"""
import json
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

# Storage paths
DB_DIR = Path("./db")
DATASETS_DB = DB_DIR / "datasets.json"
MODELS_DB = DB_DIR / "models.json"
JOBS_DB = DB_DIR / "jobs.json"
DATA_DIR = Path("./data")
MODELS_DIR = Path("./models")
RESULTS_DIR = Path("./results")

def initialize_db():
    """Initialize database files and directories"""
    # Create directories
    DB_DIR.mkdir(exist_ok=True)
    DATA_DIR.mkdir(exist_ok=True)
    MODELS_DIR.mkdir(exist_ok=True)
    RESULTS_DIR.mkdir(exist_ok=True)

    # Initialize JSON files
    for db_file in [DATASETS_DB, MODELS_DB, JOBS_DB]:
        if not db_file.exists():
            db_file.write_text(json.dumps([]))

    print(f"Database initialized at {DB_DIR}")

def load_db(db_file: Path) -> List[Dict[str, Any]]:
    """Load database from JSON file"""
    try:
        with open(db_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_db(db_file: Path, data: List[Dict[str, Any]]):
    """Save database to JSON file"""
    with open(db_file, 'w') as f:
        json.dump(data, f, indent=2, default=str)

def generate_id() -> str:
    """Generate unique ID"""
    return str(uuid.uuid4())

# ============= Dataset Operations =============

class DatasetDB:
    """Dataset database operations"""

    @staticmethod
    def get_all(domain: Optional[str] = None, readiness: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all datasets with optional filters"""
        datasets = load_db(DATASETS_DB)

        # Apply filters
        if domain:
            datasets = [d for d in datasets if d.get("domain") == domain]
        if readiness:
            datasets = [d for d in datasets if d.get("readiness") == readiness]
        if search:
            search_lower = search.lower()
            datasets = [d for d in datasets if search_lower in d.get("name", "").lower()]

        return datasets

    @staticmethod
    def get_by_id(dataset_id: str) -> Optional[Dict[str, Any]]:
        """Get dataset by ID"""
        datasets = load_db(DATASETS_DB)
        for dataset in datasets:
            if dataset.get("id") == dataset_id:
                return dataset
        return None

    @staticmethod
    def create(dataset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new dataset"""
        datasets = load_db(DATASETS_DB)

        new_dataset = {
            "id": generate_id(),
            "readiness": dataset_data.get("readiness", "draft"),  # Use provided readiness or default to draft
            **dataset_data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "last_modified": datetime.now().strftime("%Y-%m-%d"),
            "freshness": datetime.now().strftime("%Y-%m-%d")
        }

        datasets.append(new_dataset)
        save_db(DATASETS_DB, datasets)
        return new_dataset

    @staticmethod
    def update(dataset_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update dataset"""
        datasets = load_db(DATASETS_DB)

        for i, dataset in enumerate(datasets):
            if dataset.get("id") == dataset_id:
                # Update fields
                for key, value in update_data.items():
                    if value is not None:
                        dataset[key] = value
                dataset["updated_at"] = datetime.now().isoformat()
                datasets[i] = dataset
                save_db(DATASETS_DB, datasets)
                return dataset

        return None

    @staticmethod
    def delete(dataset_id: str) -> bool:
        """Delete dataset"""
        datasets = load_db(DATASETS_DB)
        original_len = len(datasets)
        datasets = [d for d in datasets if d.get("id") != dataset_id]

        if len(datasets) < original_len:
            save_db(DATASETS_DB, datasets)
            return True
        return False

# ============= Model Operations =============

class ModelDB:
    """Model database operations"""

    @staticmethod
    def get_all(task: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all models with optional filters"""
        models = load_db(MODELS_DB)

        # Apply filters
        if task:
            models = [m for m in models if m.get("task") == task]
        if status:
            models = [m for m in models if m.get("status") == status]
        if search:
            search_lower = search.lower()
            models = [m for m in models if search_lower in m.get("name", "").lower()]

        return models

    @staticmethod
    def get_by_id(model_id: str) -> Optional[Dict[str, Any]]:
        """Get model by ID"""
        models = load_db(MODELS_DB)
        for model in models:
            if model.get("id") == model_id:
                return model
        return None

    @staticmethod
    def create(model_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new model"""
        models = load_db(MODELS_DB)

        new_model = {
            "id": generate_id(),
            **model_data,
            "version": "v0.1.0",
            "status": "draft",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        models.append(new_model)
        save_db(MODELS_DB, models)
        return new_model

    @staticmethod
    def update(model_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update model"""
        models = load_db(MODELS_DB)

        for i, model in enumerate(models):
            if model.get("id") == model_id:
                for key, value in update_data.items():
                    if value is not None:
                        model[key] = value
                model["updated_at"] = datetime.now().isoformat()
                models[i] = model
                save_db(MODELS_DB, models)
                return model

        return None

    @staticmethod
    def delete(model_id: str) -> bool:
        """Delete model"""
        models = load_db(MODELS_DB)
        original_len = len(models)
        models = [m for m in models if m.get("id") != model_id]

        if len(models) < original_len:
            save_db(MODELS_DB, models)
            return True
        return False

# ============= Job Operations =============

class JobDB:
    """Training job database operations"""

    @staticmethod
    def get_all(status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all jobs with optional status filter"""
        jobs = load_db(JOBS_DB)

        if status:
            jobs = [j for j in jobs if j.get("status") == status]

        return jobs

    @staticmethod
    def get_by_id(job_id: str) -> Optional[Dict[str, Any]]:
        """Get job by ID"""
        jobs = load_db(JOBS_DB)
        for job in jobs:
            if job.get("id") == job_id:
                return job
        return None

    @staticmethod
    def create(job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new job"""
        jobs = load_db(JOBS_DB)

        new_job = {
            "id": generate_id(),
            **job_data,
            "status": "pending",
            "progress": 0.0,
            "current_iteration": 0,
            "created_at": datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None
        }

        jobs.append(new_job)
        save_db(JOBS_DB, jobs)
        return new_job

    @staticmethod
    def update(job_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update job"""
        jobs = load_db(JOBS_DB)

        for i, job in enumerate(jobs):
            if job.get("id") == job_id:
                for key, value in update_data.items():
                    if value is not None:
                        job[key] = value
                jobs[i] = job
                save_db(JOBS_DB, jobs)
                return job

        return None

    @staticmethod
    def delete(job_id: str) -> bool:
        """Delete job"""
        jobs = load_db(JOBS_DB)
        original_len = len(jobs)
        jobs = [j for j in jobs if j.get("id") != job_id]

        if len(jobs) < original_len:
            save_db(JOBS_DB, jobs)
            return True
        return False
