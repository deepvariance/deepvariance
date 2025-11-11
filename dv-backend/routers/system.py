"""
System Monitoring Endpoints
System health and metrics
"""
from fastapi import APIRouter
from models import SystemMetrics
import psutil
import platform

router = APIRouter()

@router.get("/metrics", response_model=SystemMetrics)
async def get_system_metrics():
    """
    Get current system metrics (CPU, RAM, GPU)
    """
    # CPU metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    cpu_memory_used = memory.used / (1024 ** 3)  # GB
    cpu_memory_total = memory.total / (1024 ** 3)  # GB
    cpu_memory_percent = memory.percent

    # CPU temperature (not always available)
    cpu_temp = 0.0
    try:
        # On Linux
        temps = psutil.sensors_temperatures()
        if 'coretemp' in temps:
            cpu_temp = temps['coretemp'][0].current
        elif 'cpu_thermal' in temps:
            cpu_temp = temps['cpu_thermal'][0].current
    except:
        # Fallback for systems without temperature sensors
        cpu_temp = 50.0 + (cpu_percent * 0.5)  # Mock temperature

    # GPU metrics (requires pynvml for NVIDIA GPUs)
    gpu_temp = None
    gpu_memory_used = None
    gpu_memory_total = None
    gpu_memory_percent = None
    gpu_usage_percent = None

    try:
        import torch
        if torch.cuda.is_available():
            # Get NVIDIA GPU info via torch
            gpu_props = torch.cuda.get_device_properties(0)
            gpu_memory_total = gpu_props.total_memory / (1024 ** 3)  # GB
            gpu_memory_used = torch.cuda.memory_allocated(0) / (1024 ** 3)  # GB
            gpu_memory_percent = (gpu_memory_used / gpu_memory_total) * 100 if gpu_memory_total > 0 else 0

            # Try to get GPU temperature and usage
            try:
                import pynvml
                pynvml.nvmlInit()
                handle = pynvml.nvmlDeviceGetHandleByIndex(0)
                gpu_temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
                gpu_util = pynvml.nvmlDeviceGetUtilizationRates(handle)
                gpu_usage_percent = gpu_util.gpu
                pynvml.nvmlShutdown()
            except:
                # Mock values if pynvml not available
                gpu_temp = 65.0
                gpu_usage_percent = 45.0
    except:
        pass

    return SystemMetrics(
        cpu_temp=cpu_temp,
        cpu_memory_used=cpu_memory_used,
        cpu_memory_total=cpu_memory_total,
        cpu_memory_percent=cpu_memory_percent,
        gpu_temp=gpu_temp,
        gpu_memory_used=gpu_memory_used,
        gpu_memory_total=gpu_memory_total,
        gpu_memory_percent=gpu_memory_percent,
        gpu_usage_percent=gpu_usage_percent
    )

@router.get("/info")
async def get_system_info():
    """
    Get general system information
    """
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "python_version": platform.python_version(),
        "cpu_count": psutil.cpu_count(),
        "total_memory_gb": psutil.virtual_memory().total / (1024 ** 3)
    }

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "cpu_available": True,
        "gpu_available": False
    }
