import json
import logging
from typing import Any, Optional
import redis
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.Redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=2.0,
            )
            _redis_client.ping()
        except Exception as e:
            logger.warning("Failed to connect to Redis at %s: %s", settings.redis_url, e)
            _redis_client = None
    return _redis_client


def get_cached_json(key: str) -> Optional[Any]:
    client = get_redis_client()
    if not client:
        return None
    try:
        data = client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning("Error reading from Redis key %s: %s", key, e)
    return None


def set_cached_json(key: str, value: Any, expire_seconds: int = 300) -> bool:
    client = get_redis_client()
    if not client:
        return False
    try:
        serialized = json.dumps(value, default=str)
        client.setex(key, expire_seconds, serialized)
        return True
    except Exception as e:
        logger.warning("Error writing to Redis key %s: %s", key, e)
        return False


def invalidate_cache(key: str) -> bool:
    client = get_redis_client()
    if not client:
        return False
    try:
        client.delete(key)
        return True
    except Exception as e:
        logger.warning("Error deleting Redis key %s: %s", key, e)
        return False
