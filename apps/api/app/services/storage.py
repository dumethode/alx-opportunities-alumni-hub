from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from fastapi import HTTPException, UploadFile

from app.core.config import settings


def _save_local_upload(content: bytes, folder: str, filename: str) -> str:
    uploads_dir = Path("uploads") / folder
    uploads_dir.mkdir(parents=True, exist_ok=True)
    destination = uploads_dir / filename
    destination.write_bytes(content)
    return f"/uploads/{folder}/{filename}"


def _supabase_public_url(bucket: str, object_path: str) -> str:
    base = (settings.supabase_url or "").rstrip("/")
    encoded_path = quote(object_path, safe="/._-")
    return f"{base}/storage/v1/object/public/{bucket}/{encoded_path}"


def _save_supabase_upload(content: bytes, bucket: str, object_path: str, content_type: str) -> str:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase storage is not configured")

    base = settings.supabase_url.rstrip("/")
    encoded_path = quote(object_path, safe="/._-")
    request = Request(
        f"{base}/storage/v1/object/{bucket}/{encoded_path}",
        data=content,
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
            "Content-Type": content_type or "application/octet-stream",
            "x-upsert": "true",
        },
    )

    try:
        with urlopen(request):
            return _supabase_public_url(bucket, object_path)
    except HTTPError as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed with storage provider, {exc.reason}") from exc
    except URLError as exc:
        raise HTTPException(status_code=500, detail="Upload failed, storage provider is unreachable") from exc


def store_upload(
    upload: UploadFile,
    *,
    folder: str,
    filename: str,
    bucket: str | None,
) -> str:
    content = upload.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if settings.supabase_url and settings.supabase_service_role_key and bucket:
        return _save_supabase_upload(content, bucket, f"{folder}/{filename}", upload.content_type or "application/octet-stream")

    return _save_local_upload(content, folder, filename)
