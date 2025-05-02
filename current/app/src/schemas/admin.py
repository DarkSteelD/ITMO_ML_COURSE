"""
Module: schemas.admin

Contains Pydantic models for admin-specific operations.
"""

from pydantic import BaseModel, Field
from typing import List
from src.schemas.balance import BalanceRead

class AdminTopUpAllResponse(BaseModel):
    """
    Response schema for topping up all balances.
    """
    message: str = Field(..., description="Summary message of the top-up operation")
    topups: List[BalanceRead] = Field(
        ..., description="List of updated balances for each user"
    )

class AdminTopUpAllRequest(BaseModel):
    """
    Request schema for topping up all user balances by a specified amount.
    """
    amount: float = Field(..., gt=0, description="Positive float amount to add to each user's balance")

class AdminTestResponse(BaseModel):
    """
    Response schema for admin test question.
    """
    question: str = Field(..., description="Test question for admins")
    answer: int = Field(..., description="Correct answer to the test question") 