"""
Database Configuration and Connection Module
Handles PostgreSQL connection using SQLAlchemy
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://deepvariance:deepvariance@localhost:5432/deepvariance"
)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,        # Number of connections to maintain
    max_overflow=20,     # Max connections that can be created beyond pool_size
    echo=False,          # Set to True for SQL query logging (debugging)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Session:
    """
    Dependency function to get database session.
    Use with FastAPI Depends()

    Example:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database - create all tables.
    Run this once when setting up the application.
    """
    from db_models import (  # Import all models to ensure they're registered
        Dataset, Model, TrainingRun, TrainingLog,
        ModelVersion, Job
    )

    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def drop_all_tables():
    """
    Drop all tables - USE WITH CAUTION!
    Only for development/testing.
    """
    print("WARNING: Dropping all tables...")
    response = input("Are you sure? Type 'YES' to confirm: ")

    if response == "YES":
        Base.metadata.drop_all(bind=engine)
        print("All tables dropped!")
    else:
        print("Operation cancelled.")


def check_connection():
    """
    Check if database connection is working.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✓ Database connection successful!")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False


if __name__ == "__main__":
    # When run directly, check connection and optionally initialize database
    print("DeepVariance Database Configuration")
    print(f"Database URL: {DATABASE_URL.split('@')[1]}")  # Hide password
    print()

    if check_connection():
        print()
        choice = input("Initialize database tables? (y/n): ")
        if choice.lower() == 'y':
            init_db()
