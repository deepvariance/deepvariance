# DeepVariance FastAPI Backend

**ML Training Platform** - REST API for CNN Model Training and Dataset Management

Built with FastAPI, PostgreSQL, and PyTorch

---

## 📋 Features

- **Dataset Management**: Upload, validate, and manage datasets with automatic file organization
- **Model Management**: Track trained models with hyperparameters and metrics
- **Training Jobs**: LLM-powered CNN training with iterative refinement
- **PostgreSQL Database**: Production-ready relational database with SQLAlchemy ORM
- **System Monitoring**: Real-time CPU/GPU/memory metrics
- **Background Processing**: Asynchronous training job execution
- **Auto-generated Documentation**: Interactive API docs at `/docs`

---

## 🏗️ Architecture

```
dv-backend/
├── main.py                  # FastAPI application entry point
├── models.py                # Pydantic schemas and validation
├── database.py              # Database operations (CRUD)
├── db_config.py             # PostgreSQL connection and ORM setup
├── db_models.py             # SQLAlchemy ORM models
├── training_runner.py       # Background training job runner
├── cnn_new.py              # LLM-powered CNN generation pipeline
├── routers/
│   ├── datasets.py         # Dataset CRUD endpoints
│   ├── models.py           # Model management endpoints
│   ├── jobs.py             # Training job endpoints
│   └── system.py           # System monitoring endpoints
├── data/                   # Dataset storage (UUID-based)
├── models/                 # Trained model storage
└── results/                # Training results and logs
```

### Database Schema (PostgreSQL)

- **datasets** - Dataset metadata and file references
- **models** - Trained model records with hyperparameters
- **training_runs** - Training execution history
- **training_logs** - Training log entries
- **model_versions** - Model version tracking
- **jobs** - Background job status

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **PostgreSQL 15+**
- **pip**
- (Optional) NVIDIA GPU with CUDA for GPU training

### 1. Install PostgreSQL

**macOS** (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Setup Database

```bash
# Create database and user
psql postgres -c "CREATE DATABASE deepvariance;"
psql postgres -c "CREATE USER deepvariance WITH PASSWORD 'deepvariance';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE deepvariance TO deepvariance;"
psql deepvariance -c "GRANT ALL ON SCHEMA public TO deepvariance;"
```

See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for detailed instructions.

### 3. Install Dependencies

```bash
# Navigate to backend directory
cd /path/to/dv-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and set your GROQ API key
# DATABASE_URL is already set for local PostgreSQL
```

### 5. Run the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The database tables will be **automatically created** on first startup (code-first approach).

**Access**:
- API Base: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

---

## 📚 API Endpoints

### Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets` | List datasets (filters: domain, readiness, search) |
| GET | `/api/datasets/{id}` | Get dataset by ID |
| POST | `/api/datasets` | Upload dataset (ZIP, streaming up to 100GB) |
| PUT | `/api/datasets/{id}` | Update dataset metadata |
| PATCH | `/api/datasets/{id}/name` | Update dataset name only |
| DELETE | `/api/datasets/{id}` | Delete dataset and files |

### Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List models (filters: task, status, search) |
| GET | `/api/models/{id}` | Get model by ID |
| PUT | `/api/models/{id}` | Update model metadata |
| PATCH | `/api/models/{id}/name` | Update model name only |
| DELETE | `/api/models/{id}` | Delete model and files |
| GET | `/api/models/{id}/download` | Download model file |

### Training Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List training jobs (filter: status) |
| GET | `/api/jobs/{id}` | Get job details and progress |
| POST | `/api/jobs` | Start new training job |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/metrics` | Get CPU/GPU/memory metrics |
| GET | `/api/system/health` | Health check |

---

## 💡 Usage Examples

### 1. Upload a Dataset

```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -F "name=my-vision-dataset" \
  -F "domain=vision" \
  -F "file=@/path/to/dataset.zip" \
  -F "tags=classification,animals" \
  -F "description=Animal classification dataset"
```

The backend will:
- Extract ZIP to `./data/{uuid}/`
- Validate dataset structure
- Count files automatically
- Set readiness status (ready/error)

### 2. Start a Training Job

```bash
curl -X POST "http://localhost:8000/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "your-dataset-uuid",
    "model_name": "animal-classifier",
    "task": "classification",
    "hyperparameters": {
      "learning_rate": 0.001,
      "batch_size": 32,
      "optimizer": "Adam",
      "dropout_rate": 0.2,
      "epochs": 5,
      "max_iterations": 10,
      "target_accuracy": 0.95
    }
  }'
```

The training pipeline will:
- Create model record (status: queued)
- Use GROQ API to generate CNN architecture
- Train iteratively to improve accuracy
- Save best model to `./models/`
- Update model with final hyperparameters and metrics

### 3. Monitor Training Progress

```bash
# Get job status
curl "http://localhost:8000/api/jobs/{job_id}"

# Response includes:
# - status (pending, running, completed, failed)
# - progress (0-100%)
# - current_iteration
# - current_accuracy
# - best_accuracy
```

### 4. List Trained Models

```bash
# All models
curl "http://localhost:8000/api/models"

# Filter by task and status
curl "http://localhost:8000/api/models?task=classification&status=ready"

# Search by name
curl "http://localhost:8000/api/models?search=animal"
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```env
# ============= DATABASE =============
DATABASE_URL=postgresql://deepvariance:deepvariance@localhost:5432/deepvariance

# ============= API =============
API_HOST=0.0.0.0
API_PORT=8000

# ============= GROQ API KEY =============
# Required for LLM-based CNN generation
GROQ_API_KEY=your_groq_api_key_here

# ============= CORS =============
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# ============= STORAGE =============
DATA_DIR=./data
MODELS_DIR=./models
RESULTS_DIR=./results

# ============= TRAINING =============
DEFAULT_MAX_ITERATIONS=10
DEFAULT_TARGET_ACCURACY=1.0
DEFAULT_DEVICE=cpu  # cpu, cuda, or mps

# ============= LOGGING =============
LOG_LEVEL=INFO
SQL_ECHO=false
```

---

## 🔍 Training Pipeline

### LLM-Powered CNN Generation

The platform uses **GROQ API** to generate PyTorch CNN architectures:

1. **Dataset Analysis**: Analyzes dataset shape, classes, and samples
2. **Code Generation**: LLM generates PyTorch CNN code
3. **Training**: Dynamically loads and trains generated model
4. **Iterative Refinement**: Refines architecture based on accuracy (up to 10 iterations)
5. **Best Model Selection**: Saves best performing model with metrics

### Hyperparameters

The LLM **suggests and refines hyperparameters** during training:
- Learning rate
- Batch size
- Optimizer type
- Dropout rate
- Number of epochs

**Final hyperparameters are saved to the database** for reproducibility and display on the model info page.

### Training Strategies (Future)

Plugin-based architecture will support:
- **LLM Strategy**: Current GROQ-based generation
- **Native Strategy**: Traditional PyTorch training
- **Transfer Learning**: Fine-tuning pre-trained models

---

## 📊 Dataset Requirements

Datasets must follow this structure:

```
dataset.zip
├── train/
│   ├── class1/
│   │   ├── img001.jpg
│   │   └── img002.jpg
│   └── class2/
│       ├── img001.jpg
│       └── img002.jpg
├── val/      (optional)
│   ├── class1/
│   └── class2/
└── test/     (optional)
    ├── class1/
    └── class2/
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tif`, `.tiff`

See [DATASET_REQUIREMENTS.md](DATASET_REQUIREMENTS.md) for details.

---

## 🗂️ Documentation

- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Complete implementation tracking and roadmap
- **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** - Database setup and migration guide
- **[DATASET_REQUIREMENTS.md](DATASET_REQUIREMENTS.md)** - Dataset validation rules
- **Interactive API Docs**: http://localhost:8000/docs

---

## 🔧 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Check credentials
psql -U deepvariance -d deepvariance -h localhost

# Verify DATABASE_URL in .env matches your setup
```

### Port Already in Use

```bash
# Find and kill process on port 8000
lsof -i :8000
kill -9 <PID>

# Or use a different port
uvicorn main:app --port 8001
```

### Import Errors

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Training Job Fails

Check:
- GROQ API key is set in `.env`
- Dataset structure is correct
- Dataset is marked as "ready" (not "draft" or "error")

---

## 🚀 Production Deployment

### Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

```bash
docker build -t deepvariance-api .
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e GROQ_API_KEY=your_key \
  deepvariance-api
```

### Cloud Deployment

- **AWS**: RDS (PostgreSQL) + ECS/EC2
- **Google Cloud**: Cloud SQL + Cloud Run
- **Azure**: PostgreSQL Database + App Service
- **Heroku**: Postgres addon + Container deployment

---

## 📈 Roadmap

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for detailed progress tracking.

**Current Sprint**: Training Pipeline Integration
- [ ] Plugin-based training architecture
- [ ] Real training integration (currently mock)
- [ ] Hyperparameter persistence to database
- [ ] Real-time progress monitoring
- [ ] Model file management with UUID-based storage

**Future**:
- [ ] User authentication (JWT)
- [ ] Real-time job progress via WebSockets
- [ ] Model versioning API
- [ ] Model serving/inference endpoints
- [ ] Distributed training support
- [ ] Cloud storage integration (S3, GCS)

---

## 🛠️ Development

### Adding New Endpoints

1. Create/modify router file in `routers/`
2. Define Pydantic models in `models.py`
3. Add SQLAlchemy models in `db_models.py` (if needed)
4. Add database operations in `database.py`
5. Register router in `main.py`

### Database Migrations

Currently using **code-first** approach - tables are auto-created from ORM models.

For future schema changes, consider using **Alembic** for migrations.

---

## 📄 License

[Your License Here]

## 🤝 Support

For issues and questions:
- Check [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for known issues
- Review API documentation at `/docs`
- Check troubleshooting section above

---

**Built with** ❤️ **using FastAPI, PostgreSQL, and PyTorch**
