"""
Metrics Calculation Utilities
Provides functions to calculate classification metrics like precision, recall, and F1-score
"""

from typing import Dict, Optional

import numpy as np
import torch


def calculate_classification_metrics(
    all_preds: torch.Tensor,
    all_targets: torch.Tensor,
    num_classes: int
) -> Dict[str, float]:
    """
    Calculate precision, recall, and F1-score for classification tasks

    Args:
        all_preds: Tensor of predicted class indices
        all_targets: Tensor of ground truth class indices
        num_classes: Number of classes in the dataset

    Returns:
        Dictionary containing macro-averaged metrics
    """
    # Convert to numpy for easier manipulation
    preds_np = all_preds.cpu().numpy() if torch.is_tensor(all_preds) else all_preds
    targets_np = all_targets.cpu().numpy() if torch.is_tensor(
        all_targets) else all_targets

    # Initialize per-class metrics
    precision_per_class = []
    recall_per_class = []
    f1_per_class = []

    for class_idx in range(num_classes):
        # True Positives: predicted this class and actually is this class
        tp = np.sum((preds_np == class_idx) & (targets_np == class_idx))

        # False Positives: predicted this class but actually is not
        fp = np.sum((preds_np == class_idx) & (targets_np != class_idx))

        # False Negatives: did not predict this class but actually is
        fn = np.sum((preds_np != class_idx) & (targets_np == class_idx))

        # Calculate precision for this class
        if tp + fp > 0:
            precision = tp / (tp + fp)
        else:
            precision = 0.0

        # Calculate recall for this class
        if tp + fn > 0:
            recall = tp / (tp + fn)
        else:
            recall = 0.0

        # Calculate F1-score for this class
        if precision + recall > 0:
            f1 = 2 * (precision * recall) / (precision + recall)
        else:
            f1 = 0.0

        precision_per_class.append(precision)
        recall_per_class.append(recall)
        f1_per_class.append(f1)

    # Return macro-averaged metrics (simple average across classes)
    return {
        'precision': float(np.mean(precision_per_class)),
        'recall': float(np.mean(recall_per_class)),
        'f1_score': float(np.mean(f1_per_class)),
        'precision_per_class': precision_per_class,
        'recall_per_class': recall_per_class,
        'f1_per_class': f1_per_class,
    }


def evaluate_model_with_metrics(
    model,
    dataloader,
    device: str,
    num_classes: int,
    criterion=None
) -> Dict[str, float]:
    """
    Evaluate a model and return comprehensive metrics

    Args:
        model: PyTorch model to evaluate
        dataloader: DataLoader with evaluation data
        device: Device to run evaluation on
        num_classes: Number of classes
        criterion: Loss function (optional)

    Returns:
        Dictionary with accuracy, loss, precision, recall, and F1-score
    """
    import torch.nn as nn

    if criterion is None:
        criterion = nn.CrossEntropyLoss()

    model.eval()
    all_preds = []
    all_targets = []
    total_loss = 0.0
    total_samples = 0

    with torch.no_grad():
        for inputs, targets in dataloader:
            inputs = inputs.to(device)
            targets = targets.to(device)

            outputs = model(inputs)

            # Calculate loss if criterion provided
            if criterion is not None:
                loss = criterion(outputs, targets)
                total_loss += loss.item() * targets.size(0)

            # Get predictions
            _, preds = torch.max(outputs, 1)

            # Store predictions and targets
            all_preds.append(preds)
            all_targets.append(targets)

            total_samples += targets.size(0)

    # Concatenate all predictions and targets
    all_preds = torch.cat(all_preds)
    all_targets = torch.cat(all_targets)

    # Calculate accuracy
    correct = (all_preds == all_targets).sum().item()
    accuracy = correct / total_samples if total_samples > 0 else 0.0

    # Calculate average loss
    avg_loss = total_loss / total_samples if total_samples > 0 else 0.0

    # Calculate classification metrics
    metrics = calculate_classification_metrics(
        all_preds, all_targets, num_classes)

    return {
        'accuracy': accuracy,
        'loss': avg_loss,
        'precision': metrics['precision'],
        'recall': metrics['recall'],
        'f1_score': metrics['f1_score'],
        'precision_per_class': metrics['precision_per_class'],
        'recall_per_class': metrics['recall_per_class'],
        'f1_per_class': metrics['f1_per_class'],
    }
