# Dataset Upload API Guide

## Overview

The dataset creation endpoint has been updated to handle **file uploads with automatic size calculation and path management**.

## API Endpoint

```http
POST /api/datasets
Content-Type: multipart/form-data
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ Yes | Dataset name |
| `domain` | enum | ✅ Yes | Dataset domain: `vision`, `tabular`, `text`, or `audio` |
| `file` | file | ✅ Yes | Dataset file (ZIP recommended for large datasets) |
| `tags` | string | ❌ No | Comma-separated tags (e.g., "medical,classification,test") |
| `description` | string | ❌ No | Dataset description |

## What the Backend Does Automatically

1. ✅ **Creates storage directory** at `./data/{name}/`
2. ✅ **Streams file to disk** (handles 100GB+ files efficiently)
3. ✅ **Extracts ZIP files** automatically
4. ✅ **Calculates dataset size** (number of files)
5. ✅ **Generates description** if not provided
6. ✅ **Cleans up on errors** (removes partially uploaded files)
7. ✅ **Returns dataset record** with generated ID

## File Upload Features

### Large File Support
- Streams files in **1MB chunks** to handle large datasets (100GB+)
- Memory efficient - doesn't load entire file into RAM
- Progress can be tracked on client side

### ZIP File Handling
- Automatically detects and extracts `.zip` files
- Removes ZIP archive after extraction
- Supports nested folder structures

### Size Calculation
- Counts number of files (excludes hidden files and `.DS_Store`)
- Calculates total size in bytes
- Stores file count in `size` field

## Examples

### Example 1: Upload ZIP Dataset (cURL)

```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -F "name=lung-cancer-dataset" \
  -F "domain=vision" \
  -F "file=@/path/to/dataset.zip" \
  -F "tags=medical,classification,cancer" \
  -F "description=Lung cancer CT scan images"
```

### Example 2: Upload without Tags/Description

```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -F "name=mnist-digits" \
  -F "domain=vision" \
  -F "file=@/path/to/mnist.zip"
```

### Example 3: Using Postman

1. Open Postman
2. Create new request: `POST http://localhost:8000/api/datasets`
3. Go to **Body** tab → Select **form-data**
4. Add fields:
   - `name`: `my-dataset` (Text)
   - `domain`: `vision` (Text)
   - `file`: Select file (File)
   - `tags`: `tag1,tag2,tag3` (Text, optional)
   - `description`: `My description` (Text, optional)
5. Click **Send**

### Example 4: JavaScript/TypeScript (Frontend)

```typescript
async function uploadDataset(file: File, name: string, domain: string, tags?: string, description?: string) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('domain', domain);
  formData.append('file', file);

  if (tags) formData.append('tags', tags);
  if (description) formData.append('description', description);

  const response = await fetch('http://localhost:8000/api/datasets', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  return await response.json();
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await uploadDataset(
  file,
  'my-dataset',
  'vision',
  'medical,classification',
  'Medical imaging dataset'
);

console.log('Dataset created:', result.id);
```

### Example 5: React with File Upload

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

function DatasetUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('vision');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('http://localhost:8000/api/datasets', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      alert(`Dataset created with ID: ${data.id}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('domain', domain);
    formData.append('file', file);
    if (tags) formData.append('tags', tags);
    if (description) formData.append('description', description);

    uploadMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Dataset name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
        <option value="vision">Vision</option>
        <option value="tabular">Tabular</option>
        <option value="text">Text</option>
        <option value="audio">Audio</option>
      </select>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />

      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit" disabled={!file || !name || uploadMutation.isPending}>
        {uploadMutation.isPending ? 'Uploading...' : 'Upload Dataset'}
      </button>

      {uploadMutation.isError && <p>Error: {uploadMutation.error.message}</p>}
    </form>
  );
}
```

## Response Format

### Success Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "lung-cancer-dataset",
  "domain": "vision",
  "size": 15420,
  "readiness": "draft",
  "storage": "local",
  "path": "./data/lung-cancer-dataset",
  "tags": ["medical", "classification", "cancer"],
  "description": "Lung cancer CT scan images",
  "created_at": "2025-10-31T10:30:00",
  "updated_at": "2025-10-31T10:30:00",
  "last_modified": "2025-10-31",
  "freshness": "2025-10-31"
}
```

### Error Response (400/500)

```json
{
  "detail": "Failed to save file: Disk quota exceeded"
}
```

## Storage Structure

After uploading a dataset named `my-dataset`, the file structure will be:

```
./data/
└── my-dataset/
    ├── class1/
    │   ├── image1.jpg
    │   ├── image2.jpg
    │   └── ...
    ├── class2/
    │   ├── image1.jpg
    │   └── ...
    └── ...
```

If you uploaded a ZIP file, it will be extracted and the ZIP removed.

## Important Notes

### 1. File Size Limits

By default, FastAPI/Uvicorn may have upload size limits. For large datasets:

**Update main.py:**
```python
from fastapi import FastAPI

app = FastAPI()

# No limit on upload size
app.add_middleware(
    CORSMiddleware,
    ...
)
```

**Start uvicorn with custom settings:**
```bash
uvicorn main:app --limit-max-requests 0 --timeout-keep-alive 300
```

### 2. Supported File Types

- **ZIP files**: Automatically extracted (`.zip`, `.ZIP`)
- **Folders**: Supported if your HTTP client sends folder as multipart
- **Individual files**: Can upload single files
- **Multiple files**: Currently supports one file per request

### 3. Dataset Structure Requirements

For vision datasets (ImageFolder format):
```
dataset/
├── class1/
│   ├── img1.jpg
│   └── img2.jpg
└── class2/
    ├── img1.jpg
    └── img2.jpg
```

For other formats, structure according to your domain needs.

### 4. Tags Format

Tags should be comma-separated strings:
- ✅ Valid: `"medical,classification,test"`
- ✅ Valid: `"medical, classification, test"` (spaces trimmed)
- ❌ Invalid: `["medical", "classification"]` (arrays not supported in form-data)

### 5. Path Management

- Path is **automatically generated** as `./data/{name}/`
- You **cannot** specify custom path in the request
- Path is returned in the response for reference

### 6. Error Handling

The endpoint automatically cleans up on errors:
- If file upload fails → removes partially uploaded files
- If ZIP extraction fails → removes entire dataset directory
- Returns appropriate HTTP error codes and messages

## Testing with Postman Collection

The updated Postman collection includes the new request format:

**Request Name**: "Create Dataset (Upload File)"

**Pre-configured fields**:
- `name`: my-dataset
- `domain`: vision
- `file`: (select your file)
- `tags`: classification,medical,test (optional, disabled by default)
- `description`: My custom dataset description (optional, disabled by default)

Enable optional fields by checking the checkbox next to them.

## Comparison: Old vs New

### ❌ Old API (Removed)

```bash
# Had to specify path manually
curl -X POST "http://localhost:8000/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-dataset",
    "domain": "vision",
    "path": "./data/my-dataset",  # User provided
    "size": 10000,                # User provided
    "storage": "local",
    "tags": ["test"]
  }'
```

### ✅ New API (Current)

```bash
# Path and size calculated automatically
curl -X POST "http://localhost:8000/api/datasets" \
  -F "name=my-dataset" \
  -F "domain=vision" \
  -F "file=@dataset.zip"
# Backend handles path, size, storage automatically
```

## Summary

The new dataset creation endpoint:

✅ **Simplified** - Only name, domain, and file required
✅ **Automatic** - Path, size, and storage handled by backend
✅ **Efficient** - Streams large files (100GB+)
✅ **Smart** - Auto-extracts ZIP files
✅ **Robust** - Cleans up on errors
✅ **Flexible** - Optional tags and description

Perfect for uploading large ML datasets! 🚀
