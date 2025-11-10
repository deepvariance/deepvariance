"""
Job Logger
Captures training logs to files for real-time streaming to frontend
"""
import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional


class JobLogger:
    """Logger that writes to both console and file for a specific job"""

    def __init__(self, job_id: str, log_dir: str = "logs"):
        self.job_id = job_id
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)

        # Create log file path
        self.log_file = self.log_dir / f"{job_id}.log"

        # Create logger
        self.logger = logging.getLogger(f"job_{job_id}")
        self.logger.setLevel(logging.INFO)
        self.logger.propagate = False  # Don't propagate to root logger

        # Remove existing handlers
        self.logger.handlers.clear()

        # File handler
        file_handler = logging.FileHandler(self.log_file, mode='a', encoding='utf-8')
        file_handler.setLevel(logging.INFO)

        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)

        # Format: [timestamp] [level] message
        formatter = logging.Formatter(
            '[%(asctime)s] [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

    def info(self, message: str):
        """Log info message"""
        self.logger.info(message)

    def warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)

    def error(self, message: str):
        """Log error message"""
        self.logger.error(message)

    def debug(self, message: str):
        """Log debug message"""
        self.logger.debug(message)

    def close(self):
        """Close logger and cleanup handlers"""
        for handler in self.logger.handlers[:]:
            handler.close()
            self.logger.removeHandler(handler)

    @staticmethod
    def get_log_file_path(job_id: str, log_dir: str = "logs") -> Path:
        """Get the log file path for a job"""
        return Path(log_dir) / f"{job_id}.log"

    @staticmethod
    def read_logs(job_id: str, log_dir: str = "logs", max_lines: Optional[int] = None) -> list[dict]:
        """
        Read logs from file and return as structured list

        Args:
            job_id: Job ID
            log_dir: Log directory
            max_lines: Maximum number of lines to return (most recent)

        Returns:
            List of log entries with timestamp, level, and message
        """
        log_file = Path(log_dir) / f"{job_id}.log"

        if not log_file.exists():
            return []

        logs = []

        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()

                # Get most recent lines if max_lines specified
                if max_lines:
                    lines = lines[-max_lines:]

                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Parse log line: [timestamp] [level] message
                    try:
                        if line.startswith('['):
                            # Extract timestamp
                            end_timestamp = line.find(']', 1)
                            timestamp = line[1:end_timestamp]

                            # Extract level
                            rest = line[end_timestamp + 1:].strip()
                            if rest.startswith('['):
                                end_level = rest.find(']', 1)
                                level = rest[1:end_level]
                                message = rest[end_level + 1:].strip()
                            else:
                                level = 'INFO'
                                message = rest

                            logs.append({
                                'time': timestamp,
                                'level': level,
                                'message': message
                            })
                        else:
                            # Unstructured log line
                            logs.append({
                                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                'level': 'INFO',
                                'message': line
                            })
                    except Exception as e:
                        # If parsing fails, add as raw message
                        logs.append({
                            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            'level': 'INFO',
                            'message': line
                        })

        except Exception as e:
            return [{
                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'level': 'ERROR',
                'message': f'Failed to read logs: {str(e)}'
            }]

        return logs

    @staticmethod
    def delete_logs(job_id: str, log_dir: str = "logs") -> bool:
        """Delete log file for a job"""
        log_file = Path(log_dir) / f"{job_id}.log"
        try:
            if log_file.exists():
                log_file.unlink()
                return True
        except Exception:
            pass
        return False
