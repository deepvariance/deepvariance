# PostgreSQL Migration Guide for DeepVariance

This guide will help you migrate from JSON file storage to PostgreSQL database.

## Prerequisites

1. **Install PostgreSQL** (version 15+ recommended)
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql-15`
   - Windows: Download from https://www.postgresql.org/download/

2. **Start PostgreSQL service**
   - macOS: `brew services start postgresql@15`
   - Ubuntu: `sudo systemctl start postgresql`
   - Windows: Service starts automatically

## Step 1: Create Database and User

Open PostgreSQL shell:
```bash
psql postgres
```

Run these commands:
```sql
-- Create database
CREATE DATABASE deepvariance;

-- Create user
CREATE USER deepvariance WITH PASSWORD 'deepvariance';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE deepvariance TO deepvariance;

-- Exit
\q
```

## Step 2: Set Up Schema

Connect to the database and create tables:
```bash
psql -U deepvariance -d deepvariance -f schema.sql
```

Or manually:
```bash
psql -U deepvariance -d deepvariance
```

Then paste the contents of `schema.sql` or run:
```sql
\i schema.sql
```

## Step 3: Configure Environment

1. Update your `.env` file with the DATABASE_URL:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and ensure this line is present:
   ```
   DATABASE_URL=postgresql://deepvariance:deepvariance@localhost:5432/deepvariance
   ```

## Step 4: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `sqlalchemy==2.0.23` - ORM for database operations
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `alembic==1.13.1` - Database migration tool

## Step 5: Verify Database Connection

Run the database configuration script:
```bash
python db_config.py
```

You should see:
```
DeepVariance Database Configuration
Database URL: localhost:5432/deepvariance

✓ Database connection successful!

Initialize database tables? (y/n):
```

Type `y` to create the tables (if you didn't do Step 2).

## Step 6: Migrate Existing JSON Data (Optional)

If you have existing data in `db/datasets.json`, `db/models.json`, or `db/jobs.json`:

```bash
python migrate_json_to_postgres.py
```

This will:
- Read all JSON files from the `db/` directory
- Migrate datasets, models, and jobs to PostgreSQL
- Show migration summary and statistics

## Step 7: Update Your Application Code

The `database.py` module has been updated to use PostgreSQL. Your existing API code should work without changes because the interface (DatasetDB, ModelDB, JobDB classes) remains the same.

### Before (JSON):
```python
from database import DatasetDB

# This still works the same way!
datasets = DatasetDB.get_all()
dataset = DatasetDB.get_by_id("some-id")
new_dataset = DatasetDB.create({"name": "My Dataset", ...})
```

### After (PostgreSQL):
```python
from database import DatasetDB

# Same interface - now using PostgreSQL!
datasets = DatasetDB.get_all()
dataset = DatasetDB.get_by_id("some-id")
new_dataset = DatasetDB.create({"name": "My Dataset", ...})
```

## Verification

Test the database operations:

```python
from database import DatasetDB, ModelDB

# Create a test dataset
dataset = DatasetDB.create({
    "name": "Test Dataset",
    "domain": "vision",
    "readiness": "ready",
    "total_samples": 1000
})

print(f"Created dataset: {dataset['id']}")

# Retrieve it
retrieved = DatasetDB.get_by_id(dataset['id'])
print(f"Retrieved: {retrieved['name']}")

# List all
all_datasets = DatasetDB.get_all()
print(f"Total datasets: {len(all_datasets)}")
```

## Database Schema Overview

### Tables Created:

1. **datasets** - Stores uploaded datasets
   - Domain: vision or tabular
   - Readiness: draft, processing, ready, failed
   - File info, statistics, metadata

2. **models** - Stores trained models
   - Task: classification, regression, clustering, detection
   - Framework: pytorch, tensorflow, sklearn
   - Status: draft, queued, training, ready, active, failed

3. **training_runs** - Tracks individual training runs
   - Links to model and dataset
   - Progress tracking, metrics over time
   - Status: pending, queued, running, completed, failed, stopped

4. **training_logs** - Detailed logs for each run
   - Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
   - Context: epoch, batch number

5. **model_versions** - Version control for models
   - Links to training runs
   - Checkpoint paths, metrics

6. **jobs** - General background jobs
   - Flexible job system for various tasks

### Key Features:

- **UUID Primary Keys** - Using `uuid_generate_v4()`
- **JSONB Columns** - For flexible metadata and configuration storage
- **Array Support** - PostgreSQL arrays for tags
- **Foreign Keys** - Proper relationships with CASCADE/SET NULL
- **Indexes** - GIN indexes for arrays, B-tree for common queries
- **Triggers** - Auto-update `updated_at` timestamps
- **Views** - Pre-built queries for active training runs and statistics

## Useful PostgreSQL Commands

Connect to database:
```bash
psql -U deepvariance -d deepvariance
```

List all tables:
```sql
\dt
```

Describe a table:
```sql
\d datasets
```

View data:
```sql
SELECT * FROM datasets;
SELECT * FROM models;
SELECT * FROM jobs;
```

Check active training runs:
```sql
SELECT * FROM active_training_runs;
```

Get model statistics:
```sql
SELECT * FROM model_statistics;
```

Count records:
```sql
SELECT
  (SELECT COUNT(*) FROM datasets) as total_datasets,
  (SELECT COUNT(*) FROM models) as total_models,
  (SELECT COUNT(*) FROM training_runs) as total_runs;
```

## Troubleshooting

### Connection Issues

**Error**: "connection refused"
- Ensure PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
- Check if port 5432 is open: `lsof -i :5432`

**Error**: "password authentication failed"
- Verify credentials in `.env` file
- Reset password: `psql postgres -c "ALTER USER deepvariance WITH PASSWORD 'newpassword';"`

### Migration Issues

**Error**: "relation already exists"
- Tables already created, skip schema creation step
- Or drop tables: `python db_config.py` (use drop_all_tables() function with caution)

**Error**: "no such file or directory: db/datasets.json"
- Migration script is optional if you don't have existing JSON data
- Start fresh with empty PostgreSQL database

### Performance Tips

1. **Connection Pooling** - Already configured in `db_config.py`:
   - Pool size: 10 connections
   - Max overflow: 20 connections

2. **Indexes** - Already created for common queries:
   - Datasets: domain, readiness, name, created_at, tags
   - Models: task, status, framework, dataset_id, name
   - Training runs: model_id, status, created_at

3. **JSONB Queries** - Use PostgreSQL JSONB operators:
   ```sql
   -- Find models with specific hyperparameter
   SELECT * FROM models WHERE hyperparameters @> '{"learning_rate": 0.001}';
   ```

## Next Steps

1. **Alembic Migrations** - Set up Alembic for future schema changes:
   ```bash
   alembic init alembic
   ```

2. **Backup Strategy** - Set up automated backups:
   ```bash
   pg_dump -U deepvariance deepvariance > backup.sql
   ```

3. **Monitoring** - Consider using pgAdmin or similar tools for database management

4. **Production Setup** - Update credentials and connection pooling for production deployment

## Support

For issues or questions:
- Check PostgreSQL logs: `/usr/local/var/log/postgresql@15/` (macOS)
- Review SQLAlchemy documentation: https://docs.sqlalchemy.org/
- PostgreSQL documentation: https://www.postgresql.org/docs/

---

**Migration Checklist:**
- [ ] PostgreSQL installed and running
- [ ] Database and user created
- [ ] Schema applied (tables created)
- [ ] .env file configured with DATABASE_URL
- [ ] Python dependencies installed
- [ ] Database connection verified
- [ ] Existing data migrated (if applicable)
- [ ] Application tested with PostgreSQL
