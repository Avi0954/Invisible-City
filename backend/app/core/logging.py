import logging
import sys
from app.core.config import settings


class CustomFormatter(logging.Formatter):
    """Custom structured log formatter providing clear context for logs."""
    
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: blue + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, self.format_str)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


def setup_logging():
    """Initializes system-wide structured logging."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(CustomFormatter())
    
    logging.basicConfig(
        level=log_level,
        handlers=[handler],
        force=True
    )
    
    # Suppress verbose third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    
    logger = logging.getLogger("invisible_city")
    logger.info(f"Logging initialized at level: {settings.LOG_LEVEL.upper()}")
    return logger


logger = setup_logging()
