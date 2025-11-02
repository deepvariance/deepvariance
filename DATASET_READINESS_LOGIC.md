# Dataset Readiness Logic

## Overview

The dataset readiness status is automatically set based on the domain type when a dataset is uploaded.

## Readiness States

| State | Description | Usage |
|-------|-------------|-------|
| `ready` | Dataset is ready for training | Auto-set for vision datasets |
| `draft` | Dataset needs review/profiling | Auto-set for tabular, text, audio |
| `profiling` | Dataset is being profiled | Manual state (future use) |
| `processing` | Dataset is being processed | Manual state (future use) |
| `error` | Dataset has errors | Manual state (error handling) |

## Automatic Assignment Rules

### Vision Datasets → `ready`
**Domains**: `vision`

Vision datasets (images) are immediately ready for training after upload because:
- Image structure is standardized (folders = classes)
- No data validation needed beyond file count
- Can be used directly with ImageFolder loaders
- No missing values or data quality issues

**Example**:
```bash
POST /api/datasets
- domain: vision
- file: dataset.zip

Response:
- readiness: "ready" ✅ (automatically set)
```

### Other Datasets → `draft`
**Domains**: `tabular`, `text`, `audio`

These datasets start as draft because they may need:
- Data profiling and statistics
- Missing value analysis
- Schema validation
- Data quality checks
- Feature engineering review

**Example**:
```bash
POST /api/datasets
- domain: tabular
- file: data.csv

Response:
- readiness: "draft" (requires manual review)
```

## Manual Override

You can manually update readiness status later:

```bash
PUT /api/datasets/{id}
{
  "readiness": "ready"
}
```

## Future Enhancements

### Planned Automatic Profiling

In the future, non-vision datasets could:
1. Upload as `draft`
2. Auto-trigger profiling job → state becomes `profiling`
3. After profiling completes → state becomes `ready`
4. If errors found → state becomes `error`

### Validation Rules (Future)

**Vision**:
- ✅ Ready if: Has valid folder structure with images
- ❌ Error if: No images found, invalid structure

**Tabular**:
- ✅ Ready if: Profiling complete, schema valid, no major issues
- ⚠️ Draft if: Needs review
- ❌ Error if: Schema mismatch, all missing values

**Text**:
- ✅ Ready if: Tokenization successful, encoding valid
- ❌ Error if: Encoding issues, empty documents

**Audio**:
- ✅ Ready if: Valid audio formats, proper sample rates
- ❌ Error if: Corrupted files, unsupported formats

## Current Implementation

### Code Location

**Backend**: `/Users/saaivigneshp/Desktop/dv-backend/routers/datasets.py`

```python
# Lines 140-143
readiness = "ready" if domain.value == "vision" else "draft"

dataset_data = {
    ...
    "readiness": readiness
}
```

### Database Logic

**Backend**: `/Users/saaivigneshp/Desktop/dv-backend/database.py`

```python
# Line 90
"readiness": dataset_data.get("readiness", "draft")
```

This allows the router to override the default while maintaining backward compatibility.

## Testing

### Test Vision Dataset Upload
```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -F "name=my-vision-dataset" \
  -F "domain=vision" \
  -F "file=@images.zip"

# Expected: readiness = "ready"
```

### Test Tabular Dataset Upload
```bash
curl -X POST "http://localhost:8000/api/datasets" \
  -F "name=my-tabular-dataset" \
  -F "domain=tabular" \
  -F "file=@data.csv"

# Expected: readiness = "draft"
```

### Manual Update
```bash
curl -X PUT "http://localhost:8000/api/datasets/{id}" \
  -H "Content-Type: application/json" \
  -d '{"readiness": "ready"}'
```

## Benefits

1. **Faster Workflow**: Vision datasets can be trained immediately
2. **Safety**: Non-vision datasets require review before use
3. **Automation**: Reduces manual status updates for common cases
4. **Flexibility**: Can still override manually if needed

## Summary

- ✅ **Vision** → Ready immediately (no profiling needed)
- ⏸️ **Tabular/Text/Audio** → Draft (needs review)
- 🔧 **All** → Can be updated manually later

This aligns with best practices where image datasets have standardized structures while other formats require validation.
