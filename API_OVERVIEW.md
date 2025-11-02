# API Overview - DeepVariance

Complete API reference for the DeepVariance REST API.

## Base URL

```
http://localhost:8000
```

## Response Format

All responses are in JSON format. Successful responses return the requested data, while errors return:

```json
{
  "detail": "Error message here"
}
```

---

## 1. Datasets API

Manage datasets for training CNN models.

### List Datasets

```http
GET /api/datasets
```

**Query Parameters:**
- `domain` (optional): Filter by domain (tabular, vision, text, audio)
- `readiness` (optional): Filter by status (ready, profiling, draft, error)
- `search` (optional): Search by name

**Example:**
```bash
curl "http://localhost:8000/api/datasets?domain=vision&readiness=ready"
```

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "mnist-dataset",
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
]
```

### Get Dataset by ID

```http
GET /api/datasets/{dataset_id}
```

### Create Dataset

```http
POST /api/datasets
Content-Type: application/json
```

**Body:**
```json
{
  "name": "my-dataset",
  "domain": "vision",
  "size": 10000,
  "storage": "local",
  "path": "./data/my-dataset",
  "tags": ["custom"],
  "description": "My custom dataset"
}
```

**Fields:**
- `name` (required): Dataset name
- `domain` (required): tabular | vision | text | audio
- `storage` (required): local | gcs | s3
- `path` (required): Path to dataset files
- `size` (optional): Number of samples
- `tags` (optional): Array of tags
- `description` (optional): Description

### Upload Dataset (ZIP)

```http
POST /api/datasets/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `name`: Dataset name
- `domain`: Dataset domain
- `file`: ZIP file containing dataset

**Example:**
```bash
curl -X POST "http://localhost:8000/api/datasets/upload" \
  -F "name=my-dataset" \
  -F "domain=vision" \
  -F "file=@./dataset.zip"
```

### Update Dataset

```http
PUT /api/datasets/{dataset_id}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "updated-name",
  "tags": ["updated"],
  "description": "Updated description",
  "readiness": "ready"
}
```

All fields are optional.

### Update Dataset Name Only

```http
PATCH /api/datasets/{dataset_id}/name?name=new-name
```

### Delete Dataset

```http
DELETE /api/datasets/{dataset_id}?delete_files=false
```

**Query Parameters:**
- `delete_files` (default: false): Also delete dataset files

---

## 2. Models API

Manage trained CNN models.

### List Models

```http
GET /api/models
```

**Query Parameters:**
- `task` (optional): Filter by task (classification, regression, clustering, detection)
- `status` (optional): Filter by status (active, ready, training, draft, failed)
- `search` (optional): Search by name

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "my-cnn-model",
    "task": "classification",
    "framework": "PyTorch",
    "version": "v0.1.0",
    "status": "ready",
    "accuracy": 92.5,
    "created_at": "2025-10-30T12:00:00",
    "updated_at": "2025-10-30T12:00:00",
    "last_trained": "2025-10-30T12:00:00",
    "dataset_id": "dataset-uuid",
    "model_path": "./models/best_model_mnist.py",
    "tags": ["production"],
    "description": "Production CNN model"
  }
]
```

### Get Model by ID

```http
GET /api/models/{model_id}
```

### Update Model

```http
PUT /api/models/{model_id}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "updated-model-name",
  "tags": ["production", "v2"],
  "description": "Updated description"
}
```

### Update Model Name Only

```http
PATCH /api/models/{model_id}/name?name=new-name
```

### Delete Model

```http
DELETE /api/models/{model_id}?delete_files=false
```

**Query Parameters:**
- `delete_files` (default: false): Also delete model files

### Download Model

```http
GET /api/models/{model_id}/download
```

Returns model file information.

---

## 3. Training Jobs API

Start and monitor CNN training jobs.

### List Jobs

```http
GET /api/jobs
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, running, completed, failed, cancelled)

**Response:**
```json
[
  {
    "id": "uuid-here",
    "dataset_id": "dataset-uuid",
    "model_id": "model-uuid",
    "status": "running",
    "progress": 45.0,
    "current_iteration": 5,
    "total_iterations": 10,
    "current_accuracy": 0.85,
    "best_accuracy": 0.87,
    "hyperparameters": {
      "learning_rate": 0.001,
      "batch_size": 32,
      "optimizer": "Adam",
      "dropout_rate": 0.2,
      "epochs": 5,
      "max_iterations": 10,
      "target_accuracy": 0.95
    },
    "created_at": "2025-10-30T12:00:00",
    "started_at": "2025-10-30T12:01:00",
    "completed_at": null,
    "error_message": null
  }
]
```

### Get Job by ID

```http
GET /api/jobs/{job_id}
```

### Start Training Job

```http
POST /api/jobs
Content-Type: application/json
```

**Body (Minimal):**
```json
{
  "dataset_id": "your-dataset-id",
  "task": "classification"
}
```

**Body (Full Configuration):**
```json
{
  "dataset_id": "your-dataset-id",
  "model_name": "my-custom-model",
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
}
```

**Fields:**
- `dataset_id` (required): ID of dataset to train on
- `model_name` (optional): Name for the trained model
- `task` (required): classification | regression | clustering | detection
- `hyperparameters` (optional): Training configuration

**Hyperparameters:**
- `learning_rate` (default: 0.001): Learning rate (0 < lr ≤ 1)
- `batch_size` (default: 32): Batch size (1-512)
- `optimizer` (default: "Adam"): Adam | SGD | RMSprop
- `dropout_rate` (default: 0.2): Dropout rate (0-0.9)
- `epochs` (default: 3): Number of epochs (1-100)
- `max_iterations` (default: 10): Max agent iterations (1-50)
- `target_accuracy` (default: 1.0): Target accuracy (0-1)

**Response:**
Returns the created job with status "pending". Training starts in the background.

### Cancel Job

```http
POST /api/jobs/{job_id}/cancel
```

Cancels a pending or running job.

### Get Job Logs

```http
GET /api/jobs/{job_id}/logs
```

Returns training logs (placeholder implementation).

### Delete Job

```http
DELETE /api/jobs/{job_id}
```

Deletes a job record. Cannot delete running jobs (cancel first).

---

## 4. System API

Monitor system health and metrics.

### Get System Metrics

```http
GET /api/system/metrics
```

**Response:**
```json
{
  "cpu_temp": 55.0,
  "cpu_memory_used": 8.5,
  "cpu_memory_total": 16.0,
  "cpu_memory_percent": 53.1,
  "gpu_temp": 65.0,
  "gpu_memory_used": 4.2,
  "gpu_memory_total": 8.0,
  "gpu_memory_percent": 52.5,
  "gpu_usage_percent": 45.0
}
```

GPU fields are `null` if no GPU is available.

### Get System Info

```http
GET /api/system/info
```

**Response:**
```json
{
  "platform": "Darwin",
  "platform_version": "Darwin Kernel Version 25.1.0",
  "architecture": "arm64",
  "processor": "arm",
  "python_version": "3.10.0",
  "cpu_count": 8,
  "total_memory_gb": 16.0
}
```

### Health Check

```http
GET /api/system/health
```

**Response:**
```json
{
  "status": "healthy",
  "cpu_available": true,
  "gpu_available": false
}
```

---

## 5. Root Endpoints

### API Root

```http
GET /
```

**Response:**
```json
{
  "message": "DeepVariance API",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "running"
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

---

## Data Models

### Dataset Domain Types

- `tabular` - Tabular/structured data
- `vision` - Image data
- `text` - Text/NLP data
- `audio` - Audio data

### Dataset Readiness States

- `ready` - Ready for training
- `profiling` - Being profiled/analyzed
- `processing` - Being processed
- `draft` - Not yet ready
- `error` - Error state

### Storage Types

- `local` - Local filesystem
- `gcs` - Google Cloud Storage
- `s3` - AWS S3

### Model Task Types

- `classification` - Classification task
- `regression` - Regression task
- `clustering` - Clustering task
- `detection` - Object detection task

### Model Status

- `active` - Active/deployed model
- `ready` - Ready to use
- `training` - Currently training
- `draft` - Draft model
- `failed` - Training failed

### Job Status

- `pending` - Queued for execution
- `running` - Currently running
- `completed` - Successfully completed
- `failed` - Failed with error
- `cancelled` - Cancelled by user

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Interactive Documentation

For interactive API testing, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Example Workflows

### Workflow 1: Upload Dataset and Train Model

```bash
# 1. Upload dataset
DATASET_ID=$(curl -X POST "http://localhost:8000/api/datasets/upload" \
  -F "name=my-dataset" \
  -F "domain=vision" \
  -F "file=@dataset.zip" | jq -r '.id')

# 2. Start training
JOB_ID=$(curl -X POST "http://localhost:8000/api/jobs" \
  -H "Content-Type: application/json" \
  -d "{\"dataset_id\": \"$DATASET_ID\", \"task\": \"classification\"}" \
  | jq -r '.id')

# 3. Monitor progress
curl "http://localhost:8000/api/jobs/$JOB_ID"

# 4. Get trained model
MODEL_ID=$(curl "http://localhost:8000/api/jobs/$JOB_ID" | jq -r '.model_id')
curl "http://localhost:8000/api/models/$MODEL_ID"
```

### Workflow 2: List and Filter

```bash
# List all vision datasets that are ready
curl "http://localhost:8000/api/datasets?domain=vision&readiness=ready"

# List all classification models
curl "http://localhost:8000/api/models?task=classification"

# List all running jobs
curl "http://localhost:8000/api/jobs?status=running"
```

### Workflow 3: Update and Delete

```bash
# Update dataset name
curl -X PATCH "http://localhost:8000/api/datasets/$DATASET_ID/name?name=new-name"

# Update model metadata
curl -X PUT "http://localhost:8000/api/models/$MODEL_ID" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["production", "v2"]}'

# Delete old model
curl -X DELETE "http://localhost:8000/api/models/$OLD_MODEL_ID?delete_files=true"
```

---

## Notes

- **No Authentication**: Currently no authentication is required (add JWT later)
- **CORS**: Configured for `localhost:3000` and `localhost:5173`
- **Background Jobs**: Training runs asynchronously in background tasks
- **Storage**: JSON-based file storage (migrate to database for production)
- **Monitoring**: Real-time system metrics available via `/api/system/metrics`

---

For more information, see:
- **README.md** - Full documentation
- **QUICKSTART.md** - Quick start guide
- **Postman Collection** - Import for easy testing
