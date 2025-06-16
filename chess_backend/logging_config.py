"""
Logging Configuration

This module configures logging for the chess backend service.
It provides:
1. Consistent log formatting across all modules
2. Different log levels for development and production
3. File and console handlers
4. Structured logging with timestamps and module names

Usage:
    from logging_config import setup_logging
    logger = setup_logging(__name__)
"""

import logging
import logging.handlers
import os
import sys
from pathlib import Path
from typing import Optional

# Log directory setup
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Log file paths
DEBUG_LOG = LOG_DIR / "debug.log"
ERROR_LOG = LOG_DIR / "error.log"

# Log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(
    module_name: str,
    log_level: Optional[str] = None,
    log_to_file: bool = True,
) -> logging.Logger:
    """
    Set up logging for a module.

    Args:
        module_name: The name of the module (usually __name__)
        log_level: Override the default log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Whether to log to files in addition to console

    Returns:
        A configured logger instance
    """
    # Get or create logger
    logger = logging.getLogger(module_name)

    # Don't add handlers if they already exist
    if logger.handlers:
        return logger

    # Set log level from environment or default to INFO
    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(getattr(logging, log_level))

    # Create formatters
    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

    # Console handler (always present)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    if log_to_file:
        # Debug log handler (all levels)
        debug_handler = logging.handlers.RotatingFileHandler(
            DEBUG_LOG,
            maxBytes=10_000_000,  # 10MB
            backupCount=5,
            encoding="utf-8",
        )
        debug_handler.setLevel(logging.DEBUG)
        debug_handler.setFormatter(formatter)
        logger.addHandler(debug_handler)

        # Error log handler (ERROR and above)
        error_handler = logging.handlers.RotatingFileHandler(
            ERROR_LOG,
            maxBytes=10_000_000,  # 10MB
            backupCount=5,
            encoding="utf-8",
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        logger.addHandler(error_handler)

    return logger


# Add logs directory to .gitignore
def update_gitignore() -> None:
    """Add log files to .gitignore if not already present."""
    gitignore_path = Path(".gitignore")
    if not gitignore_path.exists():
        return

    log_patterns = [
        "# Log files",
        "logs/",
        "*.log",
    ]

    content = gitignore_path.read_text()
    if not any(pattern in content for pattern in log_patterns):
        with gitignore_path.open("a") as f:
            f.write("\n# Log files\nlogs/\n*.log\n")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Utility helpers for logging configuration")
    parser.add_argument(
        "--update-gitignore",
        action="store_true",
        help="Add log file patterns to the project's .gitignore",
    )
    args = parser.parse_args()

    if args.update_gitignore:
        update_gitignore()
