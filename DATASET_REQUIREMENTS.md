# Dataset Structure Requirements

This document outlines the required structure for datasets based on domain and task type.

## Supported Domains

Currently supported domains:
- **Vision**: Image datasets for classification and detection tasks
- **Tabular**: CSV/spreadsheet data for classification, regression, and clustering

## General Requirements

**All datasets must be pre-split into train and test sets before uploading.**

## Vision Datasets

### Required Structure
```
dataset_name/
├── train/
│   └── [images or class folders]
└── test/
    └── [images or class folders]
```

### Classification Task
**Structure**: ImageFolder format (folders per class)

```
dataset_name/
├── train/
│   ├── class1/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   ├── class2/
│   │   └── ...
│   └── classN/
│       └── ...
└── test/
    ├── class1/
    ├── class2/
    └── classN/
```

**Requirements**:
- Minimum 2 classes
- Minimum 10 images per class
- Same classes in both train and test directories
- Valid image formats: .jpg, .jpeg, .png, .bmp, .gif
- Minimum image size: 32x32 pixels

### Detection Task
**Structure**: Images with annotation files

```
dataset_name/
├── train/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── annotations.json (or labels/ folder, or .xml files)
└── test/
    ├── image1.jpg
    ├── image2.jpg
    └── annotations.json (or labels/ folder, or .xml files)
```

**Requirements**:
- Minimum 20 annotated images in train set
- Annotations in one of these formats:
  - COCO JSON: `annotations.json`
  - YOLO: `labels/` folder with .txt files
  - Pascal VOC: Individual .xml files per image

---

## Tabular Datasets

### Option 1: Separate Train/Test Files
**Structure**: Two CSV files

```
dataset_name/
├── train.csv
└── test.csv
```

**Requirements**:
- Both files must have identical column headers
- Minimum 50 samples in train set
- At least 2 columns (features + target for supervised tasks)

### Option 2: Single File with Split Indicator
**Structure**: One CSV with split column

```
dataset_name/
└── data.csv
```

The CSV must contain a split indicator column (one of: `split`, `set`, `subset`, `train_test`) with values like `train`/`test` or `training`/`testing`.

**Example CSV**:
```csv
feature1,feature2,target,split
1.2,3.4,0,train
2.3,4.5,1,train
3.4,5.6,0,test
...
```

### Classification Task
**Requirements**:
- Target column with at least 2 classes
- Minimum 50 training samples
- At least 1 feature column

### Regression Task
**Requirements**:
- Numeric target column with continuous values
- Minimum 50 training samples
- At least 1 feature column

### Clustering Task
**Requirements**:
- Minimum 50 samples
- At least 2 feature columns
- No target column required

---

## Upload Process

1. **Prepare your dataset** according to the structure above
2. **Create a ZIP file** of your dataset directory
3. **Upload via the UI** or API
4. **Validation runs automatically**:
   - ✅ **Ready**: Dataset passes validation and is ready for training
   - ⚠️ **Error**: Dataset has structural issues (see error message in description)
   - 📝 **Draft**: Dataset uploaded but not yet validated for a specific task

---

## Validation Error Messages

Common validation errors and how to fix them:

### "Vision dataset must have 'train' and 'test' directories"
- **Fix**: Create `train/` and `test/` folders in your dataset root

### "Classification requires at least 2 classes"
- **Fix**: Ensure you have at least 2 class folders in your dataset

### "Train and test directories must have the same classes"
- **Fix**: Make sure both train and test have folders for all classes

### "Class 'X' has only Y training images. Minimum required: 10"
- **Fix**: Add more images to the class folder (minimum 10 per class)

### "Tabular dataset must have 'train.csv' and 'test.csv' files"
- **Fix**: Split your data into train and test CSV files with the same columns

### "No valid images found in train directory"
- **Fix**: Ensure your images are in valid formats (.jpg, .png, etc.) and at least 32x32 pixels

---

## API Endpoints

### Validate Dataset
```bash
POST /api/datasets/{dataset_id}/validate?task=classification
```

Validates a dataset for a specific task and returns detailed validation results.

**Response**:
```json
{
  "valid": true,
  "dataset_id": "abc123",
  "validation": {
    "task": "classification",
    "num_classes": 3,
    "classes": ["class1", "class2", "class3"],
    "train_samples": 150,
    "test_samples": 50,
    "total_samples": 200,
    "has_split": true,
    "message": "Classification dataset validated: 3 classes, 200 images"
  }
}
```

---

## Best Practices

1. **Split Ratio**: Use 70-30 or 80-20 train-test split
2. **Balanced Classes**: Try to keep similar number of samples per class
3. **File Organization**: Use clear, consistent naming conventions
4. **Image Quality**: Higher resolution generally leads to better models
5. **Data Augmentation**: Not required at upload - handled during training
6. **File Size**: Maximum 100GB supported via streaming upload

---

## Example Datasets

### Vision Classification Example
```
cats_dogs/
├── train/
│   ├── cat/
│   │   ├── cat001.jpg
│   │   ├── cat002.jpg
│   │   └── ... (100+ images)
│   └── dog/
│       ├── dog001.jpg
│       ├── dog002.jpg
│       └── ... (100+ images)
└── test/
    ├── cat/
    │   └── ... (30+ images)
    └── dog/
        └── ... (30+ images)
```

### Tabular Classification Example
```
iris_dataset/
├── train.csv
└── test.csv
```

**train.csv**:
```csv
sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
...
```
