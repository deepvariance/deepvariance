"""
Hardware Detection Utilities
Adaptive hardware acceleration detection for PyTorch training
"""
import torch
import platform
from typing import Tuple


def get_optimal_device() -> Tuple[str, str]:
    """
    Detect and return the optimal compute device for PyTorch training.

    Priority:
    1. CUDA (NVIDIA GPUs) - for Linux/Windows containers and development
    2. MPS (Metal Performance Shaders) - for macOS (Apple Silicon/AMD)
    3. CPU - fallback for all platforms

    Returns:
        Tuple[str, str]: (device_name, device_description)
        - device_name: 'cuda', 'mps', or 'cpu'
        - device_description: Human-readable description
    """
    # Check for CUDA (NVIDIA GPUs)
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_count = torch.cuda.device_count()
        return ('cuda', f'CUDA ({gpu_count} GPU{"s" if gpu_count > 1 else ""}: {gpu_name})')

    # Check for MPS (Apple Silicon / macOS Metal)
    # MPS is available on macOS 12.3+ with Apple Silicon
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        system = platform.system()
        machine = platform.machine()
        return ('mps', f'Metal Performance Shaders (macOS {machine})')

    # Fallback to CPU
    cpu_info = platform.processor() or platform.machine()
    return ('cpu', f'CPU ({cpu_info})')


def get_device_info() -> dict:
    """
    Get detailed information about available compute devices.

    Returns:
        dict: Device information including type, description, and capabilities
    """
    device, description = get_optimal_device()

    info = {
        'device': device,
        'description': description,
        'platform': platform.system(),
        'python_version': platform.python_version(),
        'pytorch_version': torch.__version__,
    }

    # Add CUDA-specific information
    if device == 'cuda':
        info['cuda_version'] = torch.version.cuda
        info['gpu_count'] = torch.cuda.device_count()
        info['gpu_names'] = [torch.cuda.get_device_name(i) for i in range(torch.cuda.device_count())]

        # Get memory info for first GPU
        if torch.cuda.device_count() > 0:
            total_memory = torch.cuda.get_device_properties(0).total_memory
            info['gpu_memory_gb'] = round(total_memory / (1024**3), 2)

    # Add MPS-specific information
    elif device == 'mps':
        info['macos_version'] = platform.mac_ver()[0]
        info['architecture'] = platform.machine()

    # Add CPU-specific information
    else:
        import os
        info['cpu_cores'] = os.cpu_count()

    return info


def log_device_info(logger=None):
    """
    Log device information to console or provided logger.

    Args:
        logger: Optional logger instance. If None, prints to console.
    """
    info = get_device_info()

    log_func = logger.info if logger else print

    log_func("=" * 50)
    log_func("Hardware Configuration")
    log_func("=" * 50)
    log_func(f"Device: {info['device'].upper()}")
    log_func(f"Description: {info['description']}")
    log_func(f"Platform: {info['platform']}")
    log_func(f"PyTorch Version: {info['pytorch_version']}")

    if info['device'] == 'cuda':
        log_func(f"CUDA Version: {info['cuda_version']}")
        log_func(f"GPU Count: {info['gpu_count']}")
        log_func(f"GPU Memory: {info.get('gpu_memory_gb', 'N/A')} GB")
        for idx, gpu_name in enumerate(info['gpu_names']):
            log_func(f"  GPU {idx}: {gpu_name}")
    elif info['device'] == 'mps':
        log_func(f"macOS Version: {info['macos_version']}")
        log_func(f"Architecture: {info['architecture']}")
    else:
        log_func(f"CPU Cores: {info['cpu_cores']}")

    log_func("=" * 50)
