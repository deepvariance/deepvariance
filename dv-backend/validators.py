"""
Dataset Validation Module

Validates dataset structure and requirements based on domain and task type.
Ensures datasets meet minimum requirements for training.
"""
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import csv
from PIL import Image
import os


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class DatasetValidator:
    """Validates dataset structure and requirements"""

    # Minimum requirements
    MIN_SAMPLES_CLASSIFICATION = 50
    MIN_SAMPLES_REGRESSION = 50
    MIN_SAMPLES_CLUSTERING = 50
    MIN_SAMPLES_DETECTION = 20
    MIN_CLASSES = 2
    MIN_IMAGES_PER_CLASS = 10
    VALID_IMAGE_FORMATS = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
    MIN_IMAGE_SIZE = (32, 32)

    @staticmethod
    def validate_dataset(
        dataset_path: Path,
        domain: str,
        task: Optional[str] = None
    ) -> Dict:
        """
        Main validation entry point

        Args:
            dataset_path: Path to dataset directory
            domain: Dataset domain (vision, tabular)
            task: Optional task type (classification, regression, clustering, detection)

        Returns:
            Dict with validation results and metadata

        Raises:
            ValidationError: If validation fails
        """
        if domain == "vision":
            return DatasetValidator._validate_vision_dataset(dataset_path, task)
        elif domain == "tabular":
            return DatasetValidator._validate_tabular_dataset(dataset_path, task)
        else:
            raise ValidationError(
                f"Domain '{domain}' is not currently supported. "
                f"Only 'vision' and 'tabular' datasets are supported."
            )

    @staticmethod
    def _validate_vision_dataset(dataset_path: Path, task: Optional[str]) -> Dict:
        """Validate vision dataset structure"""

        # Check for train/test split
        has_train = (dataset_path / "train").exists()
        has_test = (dataset_path / "test").exists()

        if not has_train or not has_test:
            raise ValidationError(
                "Vision dataset must have 'train' and 'test' directories. "
                "Please split your dataset before uploading."
            )

        train_dir = dataset_path / "train"
        test_dir = dataset_path / "test"

        if task == "classification":
            return DatasetValidator._validate_vision_classification(train_dir, test_dir)
        elif task == "detection":
            return DatasetValidator._validate_vision_detection(train_dir, test_dir)
        else:
            # Generic vision validation
            train_images = DatasetValidator._count_images(train_dir)
            test_images = DatasetValidator._count_images(test_dir)

            if train_images == 0:
                raise ValidationError("No valid images found in train directory")
            if test_images == 0:
                raise ValidationError("No valid images found in test directory")

            return {
                "valid": True,
                "train_samples": train_images,
                "test_samples": test_images,
                "total_samples": train_images + test_images,
                "has_split": True,
                "message": "Vision dataset validated successfully"
            }

    @staticmethod
    def _validate_vision_classification(train_dir: Path, test_dir: Path) -> Dict:
        """Validate vision classification dataset (ImageFolder structure)"""

        # Get class folders in train directory
        train_classes = [d.name for d in train_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
        test_classes = [d.name for d in test_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]

        if len(train_classes) < DatasetValidator.MIN_CLASSES:
            raise ValidationError(
                f"Classification requires at least {DatasetValidator.MIN_CLASSES} classes. "
                f"Found {len(train_classes)} in train directory."
            )

        if set(train_classes) != set(test_classes):
            raise ValidationError(
                "Train and test directories must have the same classes. "
                f"Train: {train_classes}, Test: {test_classes}"
            )

        # Validate each class
        class_counts = {}
        total_train = 0
        total_test = 0

        for class_name in train_classes:
            train_class_dir = train_dir / class_name
            test_class_dir = test_dir / class_name

            train_images = DatasetValidator._count_images(train_class_dir)
            test_images = DatasetValidator._count_images(test_class_dir)

            if train_images < DatasetValidator.MIN_IMAGES_PER_CLASS:
                raise ValidationError(
                    f"Class '{class_name}' has only {train_images} training images. "
                    f"Minimum required: {DatasetValidator.MIN_IMAGES_PER_CLASS}"
                )

            class_counts[class_name] = {
                "train": train_images,
                "test": test_images,
                "total": train_images + test_images
            }

            total_train += train_images
            total_test += test_images

        return {
            "valid": True,
            "task": "classification",
            "num_classes": len(train_classes),
            "classes": train_classes,
            "class_distribution": class_counts,
            "train_samples": total_train,
            "test_samples": total_test,
            "total_samples": total_train + total_test,
            "has_split": True,
            "message": f"Classification dataset validated: {len(train_classes)} classes, {total_train + total_test} images"
        }

    @staticmethod
    def _validate_vision_detection(train_dir: Path, test_dir: Path) -> Dict:
        """Validate object detection dataset (images + annotations)"""

        # Check for images and annotations
        train_images = DatasetValidator._count_images(train_dir)
        test_images = DatasetValidator._count_images(test_dir)

        if train_images < DatasetValidator.MIN_SAMPLES_DETECTION:
            raise ValidationError(
                f"Detection requires at least {DatasetValidator.MIN_SAMPLES_DETECTION} training images. "
                f"Found {train_images}"
            )

        # Check for annotation files (common formats)
        train_annotations = (
            (train_dir / "annotations.json").exists() or
            (train_dir / "labels").exists() or
            any(train_dir.glob("*.xml"))
        )

        test_annotations = (
            (test_dir / "annotations.json").exists() or
            (test_dir / "labels").exists() or
            any(test_dir.glob("*.xml"))
        )

        if not train_annotations:
            raise ValidationError(
                "No annotation files found in train directory. "
                "Expected: annotations.json, labels/ folder, or .xml files"
            )

        if not test_annotations:
            raise ValidationError(
                "No annotation files found in test directory"
            )

        return {
            "valid": True,
            "task": "detection",
            "train_samples": train_images,
            "test_samples": test_images,
            "total_samples": train_images + test_images,
            "has_split": True,
            "has_annotations": True,
            "message": f"Detection dataset validated: {train_images + test_images} annotated images"
        }

    @staticmethod
    def _validate_tabular_dataset(dataset_path: Path, task: Optional[str]) -> Dict:
        """Validate tabular dataset structure"""

        # Check for train/test CSV files
        train_csv = dataset_path / "train.csv"
        test_csv = dataset_path / "test.csv"

        # Also check for single CSV file with train/test split indicator
        single_csv = None
        for csv_file in dataset_path.glob("*.csv"):
            if csv_file.name not in ["train.csv", "test.csv"]:
                single_csv = csv_file
                break

        if not (train_csv.exists() and test_csv.exists()) and not single_csv:
            raise ValidationError(
                "Tabular dataset must have either 'train.csv' and 'test.csv' files, "
                "or a single CSV file with train/test split indicator column. "
                "Please split your dataset before uploading."
            )

        if train_csv.exists() and test_csv.exists():
            return DatasetValidator._validate_split_csv(train_csv, test_csv, task)
        else:
            return DatasetValidator._validate_single_csv(single_csv, task)

    @staticmethod
    def _validate_split_csv(train_csv: Path, test_csv: Path, task: Optional[str]) -> Dict:
        """Validate train/test CSV files"""

        # Read headers
        with open(train_csv, 'r') as f:
            reader = csv.reader(f)
            train_headers = next(reader)
            train_rows = sum(1 for _ in reader)

        with open(test_csv, 'r') as f:
            reader = csv.reader(f)
            test_headers = next(reader)
            test_rows = sum(1 for _ in reader)

        # Validate headers match
        if train_headers != test_headers:
            raise ValidationError(
                "Train and test CSV files must have the same columns"
            )

        # Validate minimum samples
        min_samples = DatasetValidator.MIN_SAMPLES_CLASSIFICATION
        if task in ["classification", "regression", "clustering"]:
            if train_rows < min_samples:
                raise ValidationError(
                    f"{task.capitalize()} requires at least {min_samples} training samples. "
                    f"Found {train_rows}"
                )

        num_features = len(train_headers)

        # Task-specific validation
        if task == "classification":
            # Assume last column is target
            if num_features < 2:
                raise ValidationError("Classification requires at least 1 feature and 1 target column")
        elif task == "regression":
            if num_features < 2:
                raise ValidationError("Regression requires at least 1 feature and 1 target column")
        elif task == "clustering":
            if num_features < 2:
                raise ValidationError("Clustering requires at least 2 feature columns")

        return {
            "valid": True,
            "task": task,
            "train_samples": train_rows,
            "test_samples": test_rows,
            "total_samples": train_rows + test_rows,
            "num_features": num_features,
            "columns": train_headers,
            "has_split": True,
            "message": f"Tabular dataset validated: {train_rows + test_rows} samples, {num_features} features"
        }

    @staticmethod
    def _validate_single_csv(csv_file: Path, task: Optional[str]) -> Dict:
        """Validate single CSV with split indicator"""

        with open(csv_file, 'r') as f:
            reader = csv.reader(f)
            headers = next(reader)
            rows = list(reader)

        # Check for split indicator column
        split_indicators = ['split', 'set', 'subset', 'train_test']
        split_col = None
        for col in split_indicators:
            if col in [h.lower() for h in headers]:
                split_col = headers[[h.lower() for h in headers].index(col.lower())]
                break

        if not split_col:
            raise ValidationError(
                "Single CSV file must contain a split indicator column "
                "(one of: split, set, subset, train_test)"
            )

        split_col_idx = headers.index(split_col)
        train_count = sum(1 for row in rows if row[split_col_idx].lower() in ['train', 'training'])
        test_count = sum(1 for row in rows if row[split_col_idx].lower() in ['test', 'testing'])

        if train_count == 0 or test_count == 0:
            raise ValidationError(
                f"Split indicator column must contain both train and test samples. "
                f"Found {train_count} train, {test_count} test"
            )

        return {
            "valid": True,
            "task": task,
            "train_samples": train_count,
            "test_samples": test_count,
            "total_samples": len(rows),
            "num_features": len(headers) - 1,  # Exclude split column
            "columns": headers,
            "has_split": True,
            "split_column": split_col,
            "message": f"Tabular dataset validated: {len(rows)} samples, {len(headers)-1} features"
        }

    @staticmethod
    def _count_images(directory: Path) -> int:
        """Count valid image files in directory"""
        count = 0
        for file in directory.rglob("*"):
            if file.suffix.lower() in DatasetValidator.VALID_IMAGE_FORMATS:
                # Try to verify it's a valid image
                try:
                    with Image.open(file) as img:
                        width, height = img.size
                        if width >= DatasetValidator.MIN_IMAGE_SIZE[0] and \
                           height >= DatasetValidator.MIN_IMAGE_SIZE[1]:
                            count += 1
                except Exception:
                    # Skip invalid images
                    continue
        return count
