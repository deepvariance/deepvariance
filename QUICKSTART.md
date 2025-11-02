# Quick Start Guide - DeepVariance API

Get the API running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd /Users/saaivigneshp/Desktop/dv-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## Step 2: Initialize Database

```bash
python -c "from database import initialize_db; initialize_db()"
```

## Step 3: Start the Server

```bash
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

## Step 4: Test the API

### Option A: Using Browser

Open http://localhost:8000/docs and try the endpoints interactively.

### Option B: Using cURL

```bash
# Health check
curl http://localhost:8000/health

# List datasets
curl http://localhost:8000/api/datasets

# Get system metrics
curl http://localhost:8000/api/system/metrics
```

### Option C: Using Postman

1. Import `DeepVariance_API.postman_collection.json`
2. Set `base_url` to `http://localhost:8000`
3. Try the requests!

## Step 5: Create Your First Dataset

```bash
# Create a dataset pointing to existing data
curl -X POST "http://localhost:8000/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-dataset",
    "domain": "vision",
    "storage": "local",
    "path": "./data/test-dataset",
    "tags": ["test"],
    "description": "Test dataset"
  }'
```

Save the `id` from the response!

## Step 6: Start a Training Job

```bash
# Replace YOUR_DATASET_ID with the ID from Step 5
curl -X POST "http://localhost:8000/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "YOUR_DATASET_ID",
    "task": "classification"
  }'
```

## Step 7: Monitor Training

```bash
# Replace YOUR_JOB_ID with the ID from Step 6
curl http://localhost:8000/api/jobs/YOUR_JOB_ID
```

## Common Issues

### Port 8000 Already in Use

```bash
# Find and kill the process
lsof -i :8000
kill -9 <PID>
```

### Import Errors

```bash
# Make sure you're in the virtual environment
which python  # Should show venv path

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### CORS Errors (Frontend Connection)

The API is configured for:
- `http://localhost:3000`
- `http://localhost:5173`

If your frontend uses a different port, edit `main.py` and add it to `allow_origins`.

## Next Steps

1. **Read the full README.md** for detailed documentation
2. **Explore the API docs** at http://localhost:8000/docs
3. **Import Postman collection** for easy testing
4. **Connect your frontend** (already configured for CORS)

## API Endpoints Summary

### Datasets
- `GET /api/datasets` - List datasets
- `POST /api/datasets` - Create dataset
- `PUT /api/datasets/{id}` - Update dataset
- `DELETE /api/datasets/{id}` - Delete dataset

### Models
- `GET /api/models` - List models
- `DELETE /api/models/{id}` - Delete model

### Training Jobs
- `POST /api/jobs` - Start training
- `GET /api/jobs/{id}` - Check status
- `POST /api/jobs/{id}/cancel` - Cancel job

### System
- `GET /api/system/metrics` - CPU/GPU metrics
- `GET /api/system/info` - System info

## Support

Check the full **README.md** for more details!
