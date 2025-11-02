# Frontend-Backend Integration Guide

Complete guide for integrating the DeepVariance React frontend with the FastAPI backend.

---

## Quick Connection

### 1. Start Backend

```bash
cd /Users/saaivigneshp/Desktop/dv-backend
source venv/bin/activate  # If not already activated
python main.py
```

Backend runs on: **http://localhost:8000**

### 2. Start Frontend

```bash
cd /Users/saaivigneshp/Desktop/dv-frontend
npm run dev
```

Frontend runs on: **http://localhost:5173** (Vite) or **http://localhost:3000** (React)

### 3. Verify Connection

Open browser:
- Backend API docs: http://localhost:8000/docs
- Frontend app: http://localhost:5173

The frontend should now be able to make API calls to the backend!

---

## Frontend Configuration

The frontend is configured to call the backend API via the `VITE_API_BASE_URL` environment variable.

### Frontend .env file

Create or update `/Users/saaivigneshp/Desktop/dv-frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

### API Client Setup (Frontend)

If not already configured, create an API client in the frontend:

```typescript
// src/shared/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

---

## API Integration Examples

### 1. Datasets Integration

#### List Datasets

```typescript
// Frontend code
import { apiClient } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';

interface Dataset {
  id: string;
  name: string;
  domain: 'tabular' | 'vision' | 'text' | 'audio';
  size?: number;
  readiness: 'ready' | 'profiling' | 'draft' | 'error';
  storage: 'local' | 'gcs' | 's3';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useDatasets = (filters?: {
  domain?: string;
  readiness?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['datasets', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Dataset[]>('/datasets', {
        params: filters
      });
      return data;
    }
  });
};
```

#### Create Dataset

```typescript
export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dataset: {
      name: string;
      domain: string;
      storage: string;
      path: string;
      tags?: string[];
      description?: string;
    }) => {
      const { data } = await apiClient.post('/datasets', dataset);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });
};
```

#### Update Dataset Name

```typescript
export const useUpdateDatasetName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await apiClient.patch(`/datasets/${id}/name`, null, {
        params: { name }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });
};
```

#### Delete Dataset

```typescript
export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, deleteFiles = false }: {
      id: string;
      deleteFiles?: boolean
    }) => {
      await apiClient.delete(`/datasets/${id}`, {
        params: { delete_files: deleteFiles }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });
};
```

### 2. Models Integration

#### List Models

```typescript
interface Model {
  id: string;
  name: string;
  task: 'classification' | 'regression' | 'clustering' | 'detection';
  framework: string;
  version: string;
  status: 'active' | 'ready' | 'training' | 'draft' | 'failed';
  accuracy?: number;
  created_at: string;
  updated_at: string;
  last_trained?: string;
  tags: string[];
}

export const useModels = (filters?: {
  task?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['models', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Model[]>('/models', {
        params: filters
      });
      return data;
    }
  });
};
```

#### Delete Model

```typescript
export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, deleteFiles = false }: {
      id: string;
      deleteFiles?: boolean
    }) => {
      await apiClient.delete(`/models/${id}`, {
        params: { delete_files: deleteFiles }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    }
  });
};
```

### 3. Training Jobs Integration

#### Start Training Job

```typescript
interface TrainingJobCreate {
  dataset_id: string;
  model_name?: string;
  task: 'classification' | 'regression' | 'clustering' | 'detection';
  hyperparameters?: {
    learning_rate?: number;
    batch_size?: number;
    optimizer?: 'Adam' | 'SGD' | 'RMSprop';
    dropout_rate?: number;
    epochs?: number;
    max_iterations?: number;
    target_accuracy?: number;
  };
}

export const useStartTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: TrainingJobCreate) => {
      const { data } = await apiClient.post('/jobs', job);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });
};
```

#### Monitor Training Job

```typescript
interface TrainingJob {
  id: string;
  dataset_id: string;
  model_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_iteration: number;
  total_iterations: number;
  current_accuracy?: number;
  best_accuracy?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export const useTrainingJob = (jobId: string, refetchInterval = 2000) => {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: async () => {
      const { data } = await apiClient.get<TrainingJob>(`/jobs/${jobId}`);
      return data;
    },
    refetchInterval: (data) => {
      // Stop polling when job is completed/failed/cancelled
      if (data?.status && !['running', 'pending'].includes(data.status)) {
        return false;
      }
      return refetchInterval;
    }
  });
};
```

### 4. System Metrics Integration

```typescript
interface SystemMetrics {
  cpu_temp: number;
  cpu_memory_used: number;
  cpu_memory_total: number;
  cpu_memory_percent: number;
  gpu_temp?: number;
  gpu_memory_used?: number;
  gpu_memory_total?: number;
  gpu_memory_percent?: number;
  gpu_usage_percent?: number;
}

export const useSystemMetrics = (refetchInterval = 5000) => {
  return useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get<SystemMetrics>('/system/metrics');
      return data;
    },
    refetchInterval
  });
};
```

---

## React Component Examples

### Dataset List Component

```typescript
// src/features/datasets/DatasetsPage.tsx
import { useDatasets, useDeleteDataset } from '@/shared/hooks/useDatasets';

export const DatasetsPage = () => {
  const [filters, setFilters] = useState({
    domain: '',
    readiness: '',
    search: ''
  });

  const { data: datasets, isLoading } = useDatasets(filters);
  const deleteMutation = useDeleteDataset();

  const handleDelete = async (id: string) => {
    if (confirm('Delete this dataset?')) {
      await deleteMutation.mutateAsync({ id, deleteFiles: false });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Filters */}
      <input
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Dataset Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Readiness</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets?.map((dataset) => (
            <tr key={dataset.id}>
              <td>{dataset.name}</td>
              <td>{dataset.domain}</td>
              <td>{dataset.readiness}</td>
              <td>
                <button onClick={() => handleDelete(dataset.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Training Job Component

```typescript
// src/features/home/HomePage.tsx
import { useStartTraining, useTrainingJob } from '@/shared/hooks/useJobs';

export const HomePage = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);

  const startTraining = useStartTraining();
  const { data: job } = useTrainingJob(jobId || '', 2000);

  const handleStartTraining = async () => {
    const result = await startTraining.mutateAsync({
      dataset_id: selectedDatasetId,
      task: 'classification'
    });
    setJobId(result.id);
  };

  return (
    <div>
      {/* Dataset Selector */}
      <select onChange={(e) => setSelectedDatasetId(e.target.value)}>
        <option>Select Dataset</option>
        {/* ... dataset options */}
      </select>

      <button onClick={handleStartTraining} disabled={!selectedDatasetId}>
        Start Training
      </button>

      {/* Training Progress */}
      {job && (
        <div>
          <h3>Training Progress</h3>
          <p>Status: {job.status}</p>
          <p>Progress: {job.progress}%</p>
          <p>Iteration: {job.current_iteration}/{job.total_iterations}</p>
          {job.current_accuracy && (
            <p>Accuracy: {(job.current_accuracy * 100).toFixed(2)}%</p>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## Testing the Integration

### 1. Test Backend Endpoints

```bash
# Test health
curl http://localhost:8000/health

# Test datasets
curl http://localhost:8000/api/datasets

# Test system metrics
curl http://localhost:8000/api/system/metrics
```

### 2. Test from Frontend

Open browser console on your frontend app and run:

```javascript
// Test API connection
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log);

// Test datasets endpoint
fetch('http://localhost:8000/api/datasets')
  .then(r => r.json())
  .then(console.log);
```

### 3. Check CORS

If you see CORS errors, verify:
1. Backend is running on port 8000
2. Frontend origin is in the `allow_origins` list in `main.py`
3. Browser console shows the actual error

---

## Common Integration Issues

### Issue 1: CORS Error

**Symptom**: Browser shows "CORS policy" error

**Solution**: Add your frontend origin to `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://your-custom-port"  # Add this
    ],
    ...
)
```

### Issue 2: Connection Refused

**Symptom**: "Failed to fetch" or "Connection refused"

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check backend port in frontend `.env`
3. Ensure firewall isn't blocking

### Issue 3: 404 Not Found

**Symptom**: API calls return 404

**Solution**:
1. Check API path includes `/api` prefix
2. Verify endpoint exists at http://localhost:8000/docs
3. Check for typos in endpoint paths

### Issue 4: Empty Data

**Symptom**: API returns empty arrays

**Solution**:
1. Database might be empty - create test data via Postman
2. Check filters aren't too restrictive
3. Verify database was initialized

---

## Sample Data for Testing

### Create Test Dataset

```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-mnist",
    "domain": "vision",
    "size": 10000,
    "storage": "local",
    "path": "./data/mnist",
    "tags": ["test", "digits"],
    "description": "Test MNIST dataset",
    "readiness": "ready"
  }'
```

### Create Multiple Test Datasets

```bash
# Dataset 1
curl -X POST "http://localhost:8000/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{"name": "cancer-images", "domain": "vision", "storage": "local", "path": "./data/cancer", "tags": ["medical"]}'

# Dataset 2
curl -X POST "http://localhost:8000/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{"name": "sentiment-text", "domain": "text", "storage": "local", "path": "./data/sentiment", "tags": ["nlp"]}'
```

---

## Environment Setup Summary

### Backend (.env)

```env
API_HOST=0.0.0.0
API_PORT=8000
GROQ_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

---

## Deployment Considerations

### Development
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- CORS: Enabled for localhost

### Production
- Backend: https://api.yourdomain.com
- Frontend: https://app.yourdomain.com
- CORS: Update to production origins
- Add authentication (JWT)
- Use HTTPS everywhere
- Use production database (PostgreSQL/MongoDB)

---

## Next Steps

1. ✅ Backend is running on port 8000
2. ✅ Frontend is configured to call port 8000
3. ⏭️ Start both servers
4. ⏭️ Test API connection from frontend
5. ⏭️ Replace mock data with API calls
6. ⏭️ Test all CRUD operations
7. ⏭️ Test training job flow
8. ⏭️ Monitor system metrics

---

## Support

If you encounter issues:
1. Check backend logs in terminal
2. Check browser console for errors
3. Test endpoints directly with curl/Postman
4. Verify CORS configuration
5. Check API documentation at http://localhost:8000/docs

The backend is ready for integration! 🚀
