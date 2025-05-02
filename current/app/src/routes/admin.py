"""
Module: routes.admin

Contains admin-only endpoints for the application.
"""

from fastapi import APIRouter, Depends

from src.dependencies import get_current_active_admin
from src.schemas.admin import AdminTestResponse

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_active_admin)])

@router.get("/test", response_model=AdminTestResponse)
async def admin_test():
    """
    Admin test endpoint returning a simple question whose answer is 1.
    """
    return AdminTestResponse(question="What is 1 + 0?", answer=1) 