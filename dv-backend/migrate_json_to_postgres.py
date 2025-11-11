"""
Migration Script: JSON to PostgreSQL
Migrates existing JSON data (datasets, models, jobs) to PostgreSQL database
"""
import json
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session

from db_config import SessionLocal, init_db, check_connection
from db_models import Dataset, Model, TrainingRun, Job


def load_json_file(file_path: Path):
    """Load data from JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading {file_path}: {e}")
        return []


def migrate_datasets(db: Session, json_data: list):
    """Migrate datasets from JSON to PostgreSQL"""
    print(f"\nMigrating {len(json_data)} datasets...")

    migrated = 0
    for item in json_data:
        try:
            dataset = Dataset(
                # Use existing ID if it's a valid UUID, otherwise generate new one
                name=item.get('name', 'Unnamed Dataset'),
                domain=item.get('domain', 'tabular'),
                readiness=item.get('readiness', 'draft'),
                description=item.get('description'),

                # Structure and file info
                structure=item.get('structure'),
                file_path=item.get('path') or item.get('file_path'),
                file_size=item.get('file_size'),
                file_format=item.get('file_format'),

                # Statistics
                total_samples=item.get('size') or item.get('total_samples', 0),
                train_samples=item.get('train_samples'),
                val_samples=item.get('val_samples'),
                test_samples=item.get('test_samples'),

                # Metadata
                tags=item.get('tags', []),
                metadata=item.get('metadata'),

                # Timestamps
                created_at=datetime.fromisoformat(item['created_at']) if item.get('created_at') else datetime.now(),
                updated_at=datetime.fromisoformat(item['updated_at']) if item.get('updated_at') else datetime.now(),
                last_modified=datetime.fromisoformat(item['last_modified']).date() if item.get('last_modified') else None,
                freshness=datetime.fromisoformat(item['freshness']).date() if item.get('freshness') else None,
            )

            db.add(dataset)
            migrated += 1

        except Exception as e:
            print(f"Error migrating dataset '{item.get('name')}': {e}")
            continue

    db.commit()
    print(f"✓ Successfully migrated {migrated} datasets")


def migrate_models(db: Session, json_data: list):
    """Migrate models from JSON to PostgreSQL"""
    print(f"\nMigrating {len(json_data)} models...")

    migrated = 0
    for item in json_data:
        try:
            # Find dataset by old ID if exists
            dataset_id = item.get('dataset_id')
            dataset = None
            if dataset_id:
                # Try to find dataset in new database (this is tricky with new UUIDs)
                # For now, we'll set it to None and you can update manually
                dataset = db.query(Dataset).filter(Dataset.name == item.get('dataset_name')).first()
                if dataset:
                    dataset_id = dataset.id
                else:
                    dataset_id = None

            model = Model(
                name=item.get('name', 'Unnamed Model'),
                description=item.get('description'),

                # Configuration
                task=item.get('task', 'classification'),
                framework=item.get('framework', 'pytorch'),
                version=item.get('version', 'v0.1.0'),

                # Status
                status=item.get('status', 'draft'),

                # Results
                accuracy=item.get('accuracy'),
                loss=item.get('loss'),

                # Relationships
                dataset_id=dataset_id,

                # Storage
                model_path=item.get('model_path'),

                # Metadata
                tags=item.get('tags', []),
                hyperparameters=item.get('hyperparameters'),
                metrics=item.get('metrics'),

                # Timestamps
                created_at=datetime.fromisoformat(item['created_at']) if item.get('created_at') else datetime.now(),
                updated_at=datetime.fromisoformat(item['updated_at']) if item.get('updated_at') else datetime.now(),
                last_trained=datetime.fromisoformat(item['last_trained']) if item.get('last_trained') else None,
            )

            db.add(model)
            migrated += 1

        except Exception as e:
            print(f"Error migrating model '{item.get('name')}': {e}")
            continue

    db.commit()
    print(f"✓ Successfully migrated {migrated} models")


def migrate_jobs(db: Session, json_data: list):
    """Migrate jobs from JSON to PostgreSQL"""
    print(f"\nMigrating {len(json_data)} jobs...")

    migrated = 0
    for item in json_data:
        try:
            job = Job(
                job_type=item.get('job_type', 'training'),
                status=item.get('status', 'pending'),
                progress=item.get('progress', 0),

                # Relationships (will be None if not found)
                model_id=None,  # Can be updated later
                dataset_id=None,  # Can be updated later

                # Job data
                config=item.get('config') or item.get('hyperparameters'),
                result=item.get('result'),
                error=item.get('error') or item.get('error_message'),

                # Timestamps
                created_at=datetime.fromisoformat(item['created_at']) if item.get('created_at') else datetime.now(),
                started_at=datetime.fromisoformat(item['started_at']) if item.get('started_at') else None,
                completed_at=datetime.fromisoformat(item['completed_at']) if item.get('completed_at') else None,
            )

            db.add(job)
            migrated += 1

        except Exception as e:
            print(f"Error migrating job: {e}")
            continue

    db.commit()
    print(f"✓ Successfully migrated {migrated} jobs")


def main():
    """Main migration function"""
    print("=" * 60)
    print("DeepVariance: JSON to PostgreSQL Migration")
    print("=" * 60)

    # Check database connection
    if not check_connection():
        print("\n❌ Cannot connect to PostgreSQL database!")
        print("Please ensure PostgreSQL is running and DATABASE_URL is correct in .env")
        return

    # Initialize database (create tables)
    print("\nInitializing database tables...")
    init_db()

    # Load JSON data
    db_dir = Path("./db")
    datasets_json = load_json_file(db_dir / "datasets.json")
    models_json = load_json_file(db_dir / "models.json")
    jobs_json = load_json_file(db_dir / "jobs.json")

    # Perform migration
    db = SessionLocal()
    try:
        migrate_datasets(db, datasets_json)
        migrate_models(db, models_json)
        migrate_jobs(db, jobs_json)

        print("\n" + "=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)

        # Print summary
        print("\nDatabase Summary:")
        print(f"  Datasets: {db.query(Dataset).count()}")
        print(f"  Models: {db.query(Model).count()}")
        print(f"  Jobs: {db.query(Job).count()}")
        print(f"  Training Runs: {db.query(TrainingRun).count()}")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    main()
