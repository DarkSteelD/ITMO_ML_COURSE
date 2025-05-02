"""
Module: schemas.transaction

Contains Pydantic models for transaction operations.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from src.db.models import TransactionType
from typing import Optional, List


class TransactionBase(BaseModel):
    """
    Base schema for transaction data.

    Attributes:
      type: transaction type ('deposit' or 'prediction')
      amount: positive float credit amount
    """
    type: TransactionType = Field(..., description="Transaction type ('deposit' or 'prediction')")
    amount: float = Field(..., ge=0, description="Positive float credit amount")


class TransactionCreate(TransactionBase):
    """
    Schema for creating a new transaction.

    Attributes:
      Inherits all fields from TransactionBase.
    """
    pass


class TransactionRead(TransactionBase):
    """
    Schema for reading transaction data from API.

    Attributes:
      id: unique transaction identifier
      user_id: associated user identifier
      timestamp: datetime of transaction
      result: YOLO boxes prediction result as list of [x1, y1, x2, y2] arrays
      input_image: Base64-encoded input image for prediction
    """
    id: int = Field(..., description="Unique transaction identifier")
    user_id: int = Field(..., description="Associated user identifier")
    timestamp: datetime = Field(..., description="Datetime of transaction")
    result: Optional[List[List[float]]] = Field(
        None, description="YOLO boxes prediction result as list of [x1, y1, x2, y2] arrays"
    )
    input_image: Optional[str] = Field(
        None, description="Base64-encoded input image for prediction"
    )

    class Config:
        orm_mode = True
        use_enum_values = True
