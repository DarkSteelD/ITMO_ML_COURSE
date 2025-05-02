"""
Module: schemas.auth

Contains Pydantic models for authentication operations.
"""

from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    Response model for JWT access token.

    Attributes:
      access_token (str): JWT token string to be used for authorization
      token_type (str): token scheme, typically "bearer"
    """
    access_token: str = Field(..., description="JWT token string")
    token_type: str = Field("bearer", description="Token scheme")


class LoginRequest(BaseModel):
    """
    Schema for user login via JSON payload.

    Attributes:
      username: user email or username
      password: user password
    """
    username: str = Field(..., description="User email or username")
    password: str = Field(..., description="User password") 