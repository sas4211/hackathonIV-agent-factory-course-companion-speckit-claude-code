"""
Storage layer — reads content from local JSON seed files in development,
or from Cloudflare R2 in production.
"""
import json
import os
from pathlib import Path

from config import APP_ENV, R2_BUCKET_NAME, R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY

DATA_DIR = Path(__file__).parent / "data"


def _read_local(filename: str) -> dict | list:
    path = DATA_DIR / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _read_r2(key: str) -> dict | list:
    import boto3
    client = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    )
    obj = client.get_object(Bucket=R2_BUCKET_NAME, Key=key)
    return json.loads(obj["Body"].read())


def read(filename: str) -> dict | list:
    if APP_ENV == "development":
        return _read_local(filename)
    return _read_r2(filename)
