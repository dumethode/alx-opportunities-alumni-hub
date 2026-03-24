from fastapi import APIRouter

from app.api.routes import admin, auth, content, documents, private


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(content.router, tags=["content"])
api_router.include_router(private.router, tags=["private"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

