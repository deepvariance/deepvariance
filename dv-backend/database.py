"""
Database and Storage Layer
PostgreSQL-based database operations using SQLAlchemy ORM
"""
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db_config import SessionLocal, get_db, init_db as init_db_tables
from db_models import Dataset, Model, Job

# Storage paths for file uploads
DATA_DIR = Path("./data")
MODELS_DIR = Path("./models")
RESULTS_DIR = Path("./results")

def initialize_db():
    """Initialize database tables and directories"""
    # Create directories for file storage
    DATA_DIR.mkdir(exist_ok=True)
    MODELS_DIR.mkdir(exist_ok=True)
    RESULTS_DIR.mkdir(exist_ok=True)

    # Initialize PostgreSQL tables
    init_db_tables()
    print(f"Database initialized successfully")

def model_to_dict(model_instance) -> Dict[str, Any]:
    """Convert SQLAlchemy model instance to dictionary"""
    if model_instance is None:
        return None

    result = {}
    for column in model_instance.__table__.columns:
        # Get the actual column name in the database
        col_name = column.name

        # Map the attribute name (which might be different for 'metadata')
        attr_name = col_name
        if col_name == 'metadata':
            attr_name = 'meta_data'  # Use the Python attribute name

        value = getattr(model_instance, attr_name, None)

        # Convert UUID objects to strings
        if hasattr(value, 'hex'):  # UUID objects have a 'hex' attribute
            value = str(value)
        # Convert datetime/date objects to ISO format strings
        elif isinstance(value, datetime):
            value = value.isoformat()
        elif hasattr(value, 'isoformat'):  # Handle date objects
            value = value.isoformat()

        result[col_name] = value

    # Add 'path' field for backward compatibility (alias for file_path)
    if 'file_path' in result:
        result['path'] = result['file_path']

    # Add 'size' field (alias for total_samples) for API compatibility
    if 'total_samples' in result:
        result['size'] = result['total_samples']

    # Extract time tracking from config JSONB for Job models
    if hasattr(model_instance, 'config') and result.get('config'):
        config = result['config']
        if isinstance(config, dict):
            result['elapsed_time'] = config.get('elapsed_time')
            result['estimated_remaining'] = config.get('estimated_remaining')

    return result

# ============= Dataset Operations =============

class DatasetDB:
    """Dataset database operations"""

    @staticmethod
    def get_all(domain: Optional[str] = None, readiness: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all datasets with optional filters"""
        db = SessionLocal()
        try:
            query = db.query(Dataset)

            # Apply filters
            if domain:
                query = query.filter(Dataset.domain == domain)
            if readiness:
                query = query.filter(Dataset.readiness == readiness)
            if search:
                search_pattern = f"%{search}%"
                query = query.filter(Dataset.name.ilike(search_pattern))

            # Order by created_at descending (newest first)
            query = query.order_by(Dataset.created_at.desc())

            datasets = query.all()
            return [model_to_dict(d) for d in datasets]
        finally:
            db.close()

    @staticmethod
    def get_by_id(dataset_id: str) -> Optional[Dict[str, Any]]:
        """Get dataset by ID"""
        db = SessionLocal()
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            return model_to_dict(dataset)
        finally:
            db.close()

    @staticmethod
    def create(dataset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new dataset"""
        db = SessionLocal()
        try:
            # Map 'size' to 'total_samples' if provided (for API compatibility)
            total_samples = dataset_data.get("total_samples")
            if total_samples is None and "size" in dataset_data:
                total_samples = dataset_data.get("size", 0)
            if total_samples is None:
                total_samples = 0

            # Map 'path' to 'file_path' if provided
            file_path = dataset_data.get("file_path") or dataset_data.get("path")

            # Handle UUID - use provided ID or let database generate one
            dataset_id = dataset_data.get("id")

            # Create new dataset instance
            dataset_kwargs = {
                "name": dataset_data.get("name"),
                "domain": dataset_data.get("domain"),
                "readiness": dataset_data.get("readiness", "draft"),
                "description": dataset_data.get("description"),
                "structure": dataset_data.get("structure"),
                "file_path": file_path,
                "file_size": dataset_data.get("file_size"),
                "file_format": dataset_data.get("file_format"),
                "total_samples": total_samples,
                "train_samples": dataset_data.get("train_samples"),
                "val_samples": dataset_data.get("val_samples"),
                "test_samples": dataset_data.get("test_samples"),
                "tags": dataset_data.get("tags", []),
                "meta_data": dataset_data.get("metadata"),
            }

            # Add id if provided (for upload endpoint that pre-generates UUID)
            if dataset_id:
                dataset_kwargs["id"] = dataset_id

            new_dataset = Dataset(**dataset_kwargs)

            db.add(new_dataset)
            db.commit()
            db.refresh(new_dataset)

            return model_to_dict(new_dataset)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def update(dataset_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update dataset"""
        db = SessionLocal()
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()

            if not dataset:
                return None

            # Update fields
            for key, value in update_data.items():
                if value is not None and hasattr(dataset, key):
                    setattr(dataset, key, value)

            db.commit()
            db.refresh(dataset)

            return model_to_dict(dataset)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def delete(dataset_id: str) -> bool:
        """Delete dataset"""
        db = SessionLocal()
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()

            if not dataset:
                return False

            db.delete(dataset)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

# ============= Model Operations =============

class ModelDB:
    """Model database operations"""

    @staticmethod
    def get_all(task: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all models with optional filters"""
        db = SessionLocal()
        try:
            query = db.query(Model)

            # Apply filters
            if task:
                query = query.filter(Model.task == task)
            if status:
                query = query.filter(Model.status == status)
            if search:
                search_pattern = f"%{search}%"
                query = query.filter(Model.name.ilike(search_pattern))

            # Order by created_at descending (newest first)
            query = query.order_by(Model.created_at.desc())

            models = query.all()
            return [model_to_dict(m) for m in models]
        finally:
            db.close()

    @staticmethod
    def get_by_id(model_id: str) -> Optional[Dict[str, Any]]:
        """Get model by ID"""
        db = SessionLocal()
        try:
            model = db.query(Model).filter(Model.id == model_id).first()
            return model_to_dict(model)
        finally:
            db.close()

    @staticmethod
    def create(model_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new model"""
        db = SessionLocal()
        try:
            # Create new model instance
            new_model = Model(
                name=model_data.get("name"),
                description=model_data.get("description"),
                task=model_data.get("task"),
                framework=model_data.get("framework"),
                version=model_data.get("version", "v0.1.0"),
                status=model_data.get("status", "draft"),
                accuracy=model_data.get("accuracy"),
                loss=model_data.get("loss"),
                dataset_id=model_data.get("dataset_id"),
                model_path=model_data.get("model_path"),
                tags=model_data.get("tags", []),
                hyperparameters=model_data.get("hyperparameters"),
                metrics=model_data.get("metrics"),
            )

            db.add(new_model)
            db.commit()
            db.refresh(new_model)

            return model_to_dict(new_model)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def update(model_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update model"""
        db = SessionLocal()
        try:
            model = db.query(Model).filter(Model.id == model_id).first()

            if not model:
                return None

            # Update fields
            for key, value in update_data.items():
                if value is not None and hasattr(model, key):
                    setattr(model, key, value)

            db.commit()
            db.refresh(model)

            return model_to_dict(model)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def delete(model_id: str) -> bool:
        """Delete model"""
        db = SessionLocal()
        try:
            model = db.query(Model).filter(Model.id == model_id).first()

            if not model:
                return False

            db.delete(model)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

# ============= Job Operations =============

class JobDB:
    """Training job database operations"""

    @staticmethod
    def get_all(status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all jobs with optional status filter"""
        db = SessionLocal()
        try:
            query = db.query(Job)

            if status:
                query = query.filter(Job.status == status)

            # Order by created_at descending (newest first)
            query = query.order_by(Job.created_at.desc())

            jobs = query.all()
            return [model_to_dict(j) for j in jobs]
        finally:
            db.close()

    @staticmethod
    def get_by_id(job_id: str) -> Optional[Dict[str, Any]]:
        """Get job by ID"""
        db = SessionLocal()
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            return model_to_dict(job)
        finally:
            db.close()

    @staticmethod
    def create(job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new job"""
        db = SessionLocal()
        try:
            # Create new job instance
            new_job = Job(
                job_type=job_data.get("job_type", "training"),
                status=job_data.get("status", "pending"),
                progress=job_data.get("progress", 0.0),
                model_id=job_data.get("model_id"),
                dataset_id=job_data.get("dataset_id"),
                config=job_data.get("config"),
                result=job_data.get("result"),
                error=job_data.get("error"),
            )

            db.add(new_job)
            db.commit()
            db.refresh(new_job)

            return model_to_dict(new_job)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def update(job_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update job"""
        db = SessionLocal()
        try:
            job = db.query(Job).filter(Job.id == job_id).first()

            if not job:
                return None

            # Update fields
            for key, value in update_data.items():
                if value is not None and hasattr(job, key):
                    setattr(job, key, value)

            db.commit()
            db.refresh(job)

            return model_to_dict(job)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def delete(job_id: str) -> bool:
        """Delete job"""
        db = SessionLocal()
        try:
            job = db.query(Job).filter(Job.id == job_id).first()

            if not job:
                return False

            db.delete(job)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
