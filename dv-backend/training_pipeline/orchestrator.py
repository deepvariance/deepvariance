"""
Training Orchestrator
Coordinates training strategies and manages the training pipeline
"""

from typing import Dict, Any, Optional, Callable, List
from pathlib import Path
import traceback

from .base import BaseTrainingStrategy, TrainingConfig, TrainingResult, ProgressUpdate
from .strategies.llm_strategy import LLMStrategy


class TrainingOrchestrator:
    """
    Orchestrates the training pipeline

    Responsibilities:
    - Select appropriate training strategy
    - Execute training with progress tracking
    - Handle errors and retries
    - Persist results
    """

    def __init__(self):
        # Register available strategies
        self.strategies: List[BaseTrainingStrategy] = [
            LLMStrategy(),
            # Add more strategies here as they're implemented:
            # NativeStrategy(),
            # TransferLearningStrategy(),
        ]

    def select_strategy(self, config: TrainingConfig) -> BaseTrainingStrategy:
        """
        Select the best training strategy for the given configuration

        Args:
            config: Training configuration

        Returns:
            Selected training strategy

        Raises:
            ValueError: If no suitable strategy found
        """
        # If strategy explicitly specified, try to find it
        if config.strategy and config.strategy != 'auto':
            for strategy in self.strategies:
                if strategy.name.lower().startswith(config.strategy.lower()):
                    if strategy.validate(config):
                        print(f"[Orchestrator] Selected strategy: {strategy.name} (explicit)")
                        return strategy
                    else:
                        raise ValueError(
                            f"Strategy '{config.strategy}' cannot handle this configuration"
                        )

            raise ValueError(f"Unknown strategy: {config.strategy}")

        # Auto-select based on dataset and task
        for strategy in self.strategies:
            if strategy.validate(config):
                print(f"[Orchestrator] Auto-selected strategy: {strategy.name}")
                return strategy

        # No strategy found
        raise ValueError(
            f"No suitable training strategy found for domain='{config.dataset_domain}', "
            f"task='{config.task}'. Available strategies: {[s.name for s in self.strategies]}"
        )

    def train(
        self,
        config: TrainingConfig,
        progress_callback: Optional[Callable[[ProgressUpdate], None]] = None
    ) -> TrainingResult:
        """
        Execute training using the most appropriate strategy

        Args:
            config: Training configuration
            progress_callback: Optional callback for progress updates

        Returns:
            TrainingResult with final metrics and model path
        """
        try:
            # Select strategy
            strategy = self.select_strategy(config)

            print(f"[Orchestrator] Starting training with {strategy.name}")
            print(f"[Orchestrator] Dataset: {config.dataset_path}")
            print(f"[Orchestrator] Model: {config.model_name} (ID: {config.model_id})")
            print(f"[Orchestrator] Task: {config.task}")
            print(f"[Orchestrator] Device: {config.device}")

            # Get default hyperparameters and merge with user overrides
            default_params = strategy.get_default_hyperparameters(config)
            final_params = self._merge_hyperparameters(config, default_params)

            print(f"[Orchestrator] Hyperparameters:")
            for key, value in final_params.items():
                print(f"  {key}: {value}")

            # Execute training
            result = strategy.train(config, progress_callback)

            # If training succeeded, merge hyperparameters into result
            if result.success:
                # Prefer hyperparameters from result (LLM may have refined them)
                if not result.hyperparameters:
                    result.hyperparameters = final_params

                print(f"[Orchestrator] Training completed successfully!")
                print(f"[Orchestrator] Final accuracy: {result.final_accuracy:.4f}" if result.final_accuracy else "[Orchestrator] Accuracy unknown")
                print(f"[Orchestrator] Model saved to: {result.model_path}")
            else:
                print(f"[Orchestrator] Training failed: {result.error}")

            return result

        except Exception as e:
            error_msg = str(e)
            error_trace = traceback.format_exc()

            print(f"[Orchestrator] Training orchestration failed: {error_msg}")
            print(error_trace)

            # Report failure through callback
            if progress_callback:
                progress_callback(
                    ProgressUpdate(
                        iteration=0,
                        total_iterations=config.max_iterations,
                        status='failed',
                        message=f'Orchestration failed: {error_msg}'
                    )
                )

            return TrainingResult(
                success=False,
                error=error_msg,
                error_traceback=error_trace
            )

    def _merge_hyperparameters(
        self,
        config: TrainingConfig,
        defaults: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge user-provided hyperparameters with strategy defaults

        User overrides take precedence over defaults.
        """
        merged = defaults.copy()

        # Override with user-provided values
        if config.learning_rate is not None:
            merged['learning_rate'] = config.learning_rate
        if config.batch_size is not None:
            merged['batch_size'] = config.batch_size
        if config.epochs is not None:
            merged['epochs'] = config.epochs
        if config.optimizer is not None:
            merged['optimizer'] = config.optimizer
        if config.dropout_rate is not None:
            merged['dropout_rate'] = config.dropout_rate

        # Training config
        merged['max_iterations'] = config.max_iterations
        merged['target_accuracy'] = config.target_accuracy
        merged['device'] = config.device

        return merged

    def get_available_strategies(self) -> List[Dict[str, Any]]:
        """Get information about available training strategies"""
        return [
            {
                'name': strategy.name,
                'type': strategy.__class__.__name__,
            }
            for strategy in self.strategies
        ]
