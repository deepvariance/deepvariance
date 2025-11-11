"""
Test script for the training pipeline
Creates a minimal dataset and tests the complete flow
"""

from training_pipeline import TrainingConfig, TrainingOrchestrator
import os
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

# Set GROQ API key
os.environ['GROQ_API_KEY'] = 'your_api_key_here'


def create_test_dataset():
    """Create a minimal test dataset with 2 classes and 10 images per class"""
    dataset_path = Path('data/test_dataset')

    # Clean up if exists
    if dataset_path.exists():
        shutil.rmtree(dataset_path)

    # Create directory structure
    for class_name in ['class_a', 'class_b']:
        class_dir = dataset_path / class_name
        class_dir.mkdir(parents=True, exist_ok=True)

        # Create 10 random images per class
        for i in range(10):
            # Create random RGB image (64x64)
            img_array = np.random.randint(0, 255, (64, 64, 3), dtype=np.uint8)
            img = Image.fromarray(img_array)
            img.save(class_dir / f'img_{i}.jpg')

    print(f"✓ Created test dataset at {dataset_path}")
    print(f"  - 2 classes (class_a, class_b)")
    print(f"  - 10 images per class")
    return dataset_path


def test_training_pipeline():
    """Test the complete training pipeline"""
    print("\n" + "="*60)
    print("Testing Training Pipeline")
    print("="*60 + "\n")

    # Create test dataset
    dataset_path = create_test_dataset()

    # Create training config
    config = TrainingConfig(
        dataset_id='test_001',
        dataset_path=dataset_path,
        dataset_domain='vision',
        num_classes=2,
        num_samples=20,
        model_id='test_model_001',
        model_name='Test Model',
        task='classification',
        max_iterations=2,  # Just 2 iterations for quick test
        target_accuracy=0.8,
        device='cpu'
    )

    print("\n📋 Training Configuration:")
    print(f"  Dataset: {config.dataset_path}")
    print(f"  Model ID: {config.model_id}")
    print(f"  Domain: {config.dataset_domain}")
    print(f"  Task: {config.task}")
    print(f"  Max iterations: {config.max_iterations}")
    print(f"  Device: {config.device}")

    # Create orchestrator
    orchestrator = TrainingOrchestrator()

    # Progress tracking
    progress_updates = []

    def progress_callback(update):
        """Track progress updates"""
        progress_updates.append(update)
        print(f"\n📊 Progress Update:")
        print(f"  Iteration: {update.iteration}/{update.total_iterations}")
        if update.current_accuracy:
            print(f"  Current accuracy: {update.current_accuracy:.4f}")
        if update.best_accuracy:
            print(f"  Best accuracy: {update.best_accuracy:.4f}")
        print(f"  Status: {update.status}")
        print(f"  Message: {update.message}")

    print("\n🚀 Starting training...\n")

    try:
        # Run training
        result = orchestrator.train(
            config, progress_callback=progress_callback)

        print("\n" + "="*60)
        print("Training Results")
        print("="*60)

        if result.success:
            print("\n✅ Training completed successfully!")
            print(f"\n📈 Final Results:")
            print(
                f"  Accuracy: {result.final_accuracy:.4f}" if result.final_accuracy else "  Accuracy: N/A")
            print(
                f"  Best accuracy: {result.best_accuracy:.4f}" if result.best_accuracy else "  Best accuracy: N/A")
            print(f"  Model path: {result.model_path}")

            if result.hyperparameters:
                print(f"\n⚙️  Hyperparameters:")
                for key, value in result.hyperparameters.items():
                    print(f"    {key}: {value}")

            if result.metrics:
                print(f"\n📊 Metrics:")
                for key, value in result.metrics.items():
                    print(f"    {key}: {value}")

            print(f"\n📝 Progress updates received: {len(progress_updates)}")

            # Verify model file exists
            if result.model_path and result.model_path.exists():
                print(f"\n✓ Model file created: {result.model_path}")
            else:
                print(f"\n⚠️  Model file not found at expected path")

            return True

        else:
            print("\n❌ Training failed!")
            print(f"  Error: {result.error}")
            if result.error_traceback:
                print(f"\n  Traceback:\n{result.error_traceback}")
            return False

    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_training_pipeline()

    print("\n" + "="*60)
    if success:
        print("✅ TEST PASSED - Training pipeline works!")
    else:
        print("❌ TEST FAILED - Check errors above")
    print("="*60 + "\n")

    exit(0 if success else 1)
