# DeepVariance FastAPI Backend

REST API for CNN Model Training and Dataset Management, built with FastAPI and PyTorch.

## Features

- **Dataset Management**: Upload, list, update, and delete datasets
- **Model Management**: Track trained models with metadata
- **Training Jobs**: Start and monitor CNN training jobs
- **System Monitoring**: Real-time CPU/GPU metrics
- **Background Processing**: Asynchronous training job execution
- **Auto-generated Documentation**: Interactive API docs at `/docs`

## Architecture

```
dv-backend/
├── main.py                 # FastAPI application entry point
├── models.py               # Pydantic schemas and data models
├── database.py             # JSON-based storage layer
├── training_runner.py      # Background training job runner
├── cnn_new.py             # Original CNN training pipeline
├── routers/
│   ├── datasets.py        # Dataset CRUD endpoints
│   ├── models.py          # Model management endpoints
│   ├── jobs.py            # Training job endpoints
│   └── system.py          # System monitoring endpoints
├── data/                  # Dataset storage
├── models/                # Trained model storage
├── db/                    # JSON database files
└── results/               # Training results and logs
```

## Installation

### Prerequisites

- Python 3.9+
- pip
- (Optional) NVIDIA GPU with CUDA for GPU training

### Setup

1. **Clone or navigate to the backend directory**:
   ```bash
   cd /path/to/dv-backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database**:
   ```bash
   python -c "from database import initialize_db; initialize_db()"
   ```

## Running the Server

### Development Mode

Start the server with auto-reload:

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Production Mode

For production deployment:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets` | List all datasets (with filters) |
| GET | `/api/datasets/{id}` | Get dataset by ID |
| POST | `/api/datasets` | Create new dataset |
| POST | `/api/datasets/upload` | Upload dataset (ZIP) |
| PUT | `/api/datasets/{id}` | Update dataset metadata |
| PATCH | `/api/datasets/{id}/name` | Update dataset name |
| DELETE | `/api/datasets/{id}` | Delete dataset |

### Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List all models (with filters) |
| GET | `/api/models/{id}` | Get model by ID |
| PUT | `/api/models/{id}` | Update model metadata |
| PATCH | `/api/models/{id}/name` | Update model name |
| DELETE | `/api/models/{id}` | Delete model |
| GET | `/api/models/{id}/download` | Download model file |

### Training Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all training jobs |
| GET | `/api/jobs/{id}` | Get job by ID |
| POST | `/api/jobs` | Start new training job |
| POST | `/api/jobs/{id}/cancel` | Cancel running job |
| GET | `/api/jobs/{id}/logs` | Get job logs |
| DELETE | `/api/jobs/{id}` | Delete job record |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/metrics` | Get CPU/GPU metrics |
| GET | `/api/system/info` | Get system information |
| GET | `/api/system/health` | Health check |

## Usage Examples

### 1. Create a Dataset

```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mnist-custom",
    "domain": "vision",
    "size": 60000,
    "storage": "local",
    "path": "./data/mnist",
    "tags": ["digits", "classification"],
    "description": "MNIST handwritten digits dataset"
  }'
```

### 2. Upload a Dataset (ZIP file)

```bash
curl -X POST "http://localhost:8000/api/datasets/upload" \
  -F "name=my-dataset" \
  -F "domain=vision" \
  -F "file=@/path/to/dataset.zip"
```

### 3. Start a Training Job

```bash
curl -X POST "http://localhost:8000/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "your-dataset-id",
    "model_name": "my-cnn-model",
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

### 4. Monitor Training Job

```bash
# Get job status
curl "http://localhost:8000/api/jobs/{job_id}"

# Get job logs
curl "http://localhost:8000/api/jobs/{job_id}/logs"
```

### 5. List Models

```bash
# List all models
curl "http://localhost:8000/api/models"

# Filter by task
curl "http://localhost:8000/api/models?task=classification&status=ready"
```

## Using Postman

Import the provided Postman collection for easy API testing:

1. Open Postman
2. Click **Import**
3. Select `DeepVariance_API.postman_collection.json`
4. Update the `base_url` variable if needed (default: `http://localhost:8000`)

The collection includes all endpoints with example requests.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# GROQ API Key (for LLM-based model generation)
GROQ_API_KEY=your_groq_api_key_here

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Storage Paths
DATA_DIR=./data
MODELS_DIR=./models
DB_DIR=./db
```

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Modify `main.py` to add additional origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://your-frontend-domain.com"],
    ...
)
```

## Database

The application uses a simple JSON-based file storage system:

- `db/datasets.json` - Dataset records
- `db/models.json` - Model records
- `db/jobs.json` - Training job records

For production use, consider migrating to a proper database (PostgreSQL, MongoDB, etc.).

## Training Pipeline

The training system integrates with the existing `cnn_new.py` pipeline:

1. **Job Creation**: Creates a job record and queues for processing
2. **Background Execution**: Runs CNN training in a background task
3. **Progress Tracking**: Updates job status and metrics during training
4. **Model Storage**: Saves trained model and creates model record
5. **Completion**: Updates job status and associates with trained model

### Training Configuration

Default hyperparameters (can be customized per job):

```python
{
  "learning_rate": 0.001,
  "batch_size": 32,
  "optimizer": "Adam",
  "dropout_rate": 0.2,
  "epochs": 3,
  "max_iterations": 10,
  "target_accuracy": 1.0
}
```

## API Response Formats

### Success Response (Dataset)

```json
{
  "id": "uuid-here",
  "name": "mnist-custom",
  "domain": "vision",
  "size": 60000,
  "readiness": "ready",
  "storage": "local",
  "path": "./data/mnist",
  "tags": ["digits", "classification"],
  "description": "MNIST dataset",
  "created_at": "2025-10-30T12:00:00",
  "updated_at": "2025-10-30T12:00:00",
  "last_modified": "2025-10-30",
  "freshness": "2025-10-30"
}
```

### Error Response

```json
{
  "detail": "Dataset not found"
}
```

## Testing

### Interactive API Documentation

Visit http://localhost:8000/docs to:
- View all endpoints
- Try out API calls
- See request/response schemas
- Download OpenAPI spec

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# List datasets
curl http://localhost:8000/api/datasets

# Get system metrics
curl http://localhost:8000/api/system/metrics
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### CORS Issues

Ensure your frontend origin is in the `allow_origins` list in `main.py`.

### Import Errors

```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Database Not Initialized

```bash
python -c "from database import initialize_db; initialize_db()"
```

## Development

### Adding New Endpoints

1. Create/modify router file in `routers/`
2. Define Pydantic models in `models.py`
3. Add database operations in `database.py`
4. Register router in `main.py`

### Code Structure

- **Routers**: Handle HTTP requests and responses
- **Models**: Pydantic schemas for validation
- **Database**: Data persistence layer
- **Training Runner**: Background job execution

## Deployment

### Docker (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t deepvariance-api .
docker run -p 8000:8000 deepvariance-api
```

### Cloud Deployment

Deploy to platforms like:
- **AWS**: EC2, ECS, or Lambda
- **Google Cloud**: Cloud Run, Compute Engine
- **Azure**: App Service, Container Instances
- **Heroku**: Container deployment

## License

[Your License Here]

## Support

For issues and questions:
- Check the API documentation at `/docs`
- Review this README
- Contact: [your-email@example.com]

## Roadmap

- [ ] Add user authentication (JWT)
- [ ] Integrate with PostgreSQL
- [ ] Real-time job progress via WebSockets
- [ ] Model versioning system
- [ ] Dataset validation and profiling
- [ ] Model serving endpoints
- [ ] Distributed training support
- [ ] Integration with cloud storage (S3, GCS)
