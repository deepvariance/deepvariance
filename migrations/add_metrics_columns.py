"""
Database Migration: Add Metrics Columns to Jobs Table
Adds columns for loss tracking and classification metrics (precision, recall, F1-score)
"""

from db_config import engine
from sqlalchemy import text
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def migrate_add_metrics_columns():
    """Add metrics columns to jobs table"""

    migration_sql = """
    -- Add iteration tracking columns if they don't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='current_iteration'
        ) THEN
            ALTER TABLE jobs ADD COLUMN current_iteration INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='total_iterations'
        ) THEN
            ALTER TABLE jobs ADD COLUMN total_iterations INTEGER DEFAULT 10;
        END IF;
    END $$;
    
    -- Add accuracy tracking columns if they don't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='current_accuracy'
        ) THEN
            ALTER TABLE jobs ADD COLUMN current_accuracy DECIMAL(10, 6);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='best_accuracy'
        ) THEN
            ALTER TABLE jobs ADD COLUMN best_accuracy DECIMAL(10, 6);
        END IF;
    END $$;
    
    -- Add loss tracking columns
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='current_loss'
        ) THEN
            ALTER TABLE jobs ADD COLUMN current_loss DECIMAL(10, 6);
            COMMENT ON COLUMN jobs.current_loss IS 'Current training loss value';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='best_loss'
        ) THEN
            ALTER TABLE jobs ADD COLUMN best_loss DECIMAL(10, 6);
            COMMENT ON COLUMN jobs.best_loss IS 'Best (lowest) loss achieved during training';
        END IF;
    END $$;
    
    -- Add classification metrics columns
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='precision'
        ) THEN
            ALTER TABLE jobs ADD COLUMN precision DECIMAL(10, 6);
            COMMENT ON COLUMN jobs.precision IS 'Precision metric (macro-averaged across classes)';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='recall'
        ) THEN
            ALTER TABLE jobs ADD COLUMN recall DECIMAL(10, 6);
            COMMENT ON COLUMN jobs.recall IS 'Recall metric (macro-averaged across classes)';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='f1_score'
        ) THEN
            ALTER TABLE jobs ADD COLUMN f1_score DECIMAL(10, 6);
            COMMENT ON COLUMN jobs.f1_score IS 'F1-Score metric (macro-averaged across classes)';
        END IF;
    END $$;
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_jobs_current_accuracy ON jobs(current_accuracy);
    CREATE INDEX IF NOT EXISTS idx_jobs_best_accuracy ON jobs(best_accuracy);
    CREATE INDEX IF NOT EXISTS idx_jobs_current_loss ON jobs(current_loss);
    """

    try:
        with engine.connect() as conn:
            # Execute migration
            conn.execute(text(migration_sql))
            conn.commit()
            print("✅ Migration completed successfully!")
            print("   - Added current_loss column")
            print("   - Added best_loss column")
            print("   - Added precision column")
            print("   - Added recall column")
            print("   - Added f1_score column")
            print("   - Created performance indexes")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise


def rollback_migration():
    """Rollback the migration (remove added columns)"""

    rollback_sql = """
    -- Remove metrics columns
    ALTER TABLE jobs DROP COLUMN IF EXISTS current_loss;
    ALTER TABLE jobs DROP COLUMN IF EXISTS best_loss;
    ALTER TABLE jobs DROP COLUMN IF EXISTS precision;
    ALTER TABLE jobs DROP COLUMN IF EXISTS recall;
    ALTER TABLE jobs DROP COLUMN IF EXISTS f1_score;
    
    -- Remove indexes
    DROP INDEX IF EXISTS idx_jobs_current_accuracy;
    DROP INDEX IF EXISTS idx_jobs_best_accuracy;
    DROP INDEX IF EXISTS idx_jobs_current_loss;
    """

    try:
        with engine.connect() as conn:
            conn.execute(text(rollback_sql))
            conn.commit()
            print("✅ Rollback completed successfully!")

    except Exception as e:
        print(f"❌ Rollback failed: {e}")
        raise


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        print("Rolling back migration...")
        rollback_migration()
    else:
        print("Running migration to add metrics columns...")
        migrate_add_metrics_columns()
