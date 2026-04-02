from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.config import settings
from app.core.database import session_scope
from app.models.models import UploadedAsset


MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def _save_db_upload(content: bytes, folder: str, filename: str, content_type: str | None) -> str:
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image is too large. Please upload a smaller file.")

    asset_id = uuid4().hex
    with session_scope() as db:
        db.add(
            UploadedAsset(
                id=asset_id,
                folder=folder,
                filename=filename,
                content_type=content_type,
                content=content,
            )
        )
        db.commit()
    # Stored under the API prefix so the frontend can resolve with API_BASE_URL origin.
    return f"/api/v1/assets/{asset_id}"


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

    # Fallback to DB-backed assets so uploads survive restarts on ephemeral hosts.
    return _save_db_upload(content, folder, filename, upload.content_type)
