"""
Module: db.models

Contains ORM models for the application.
"""

from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from datetime import datetime, timezone

Base = declarative_base()

class TransactionType(PyEnum):
    """
    Enum for transaction types.
    """
    DEPOSIT = "DEPOSIT"
    PREDICTION = "PREDICTION"

class User(Base):
    """
    ORM model for a user account.

    Attributes:
      id (int): primary key
      email (str): unique and indexed user email
      hashed_password (str): stored password hash
      balance (float): user credits balance
      is_admin (bool): administrative privileges flag (default False)
      is_active(bool): account active flag (default True)
      created_at (datetime): timestamp of account creation
      transactions: relationship to Transaction model
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    balance = Column(Float, default=0.0)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationship to user transactions
    transactions = relationship("Transaction", back_populates="user")

class Transaction(Base):
    """
    ORM model for user transactions (deposits or ML predictions).

    Attributes:
      id (int): primary key
      user_id (int): foreign key to users.id
      type (Enum): 'deposit' or 'prediction'
      amount (float): amount of transaction
      comment (str): optional comment for deposit transactions
      timestamp (datetime): datetime of transaction
      input_image (JSON): Base64-encoded input image stored as JSON string
      result (JSON): YOLO boxes result stored as JSON list
      user: relationship back to User model
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(TransactionType, native_enum=False), nullable=False)
    amount = Column(Float)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    input_image = Column(JSON, nullable=True)  # Base64-encoded input image stored as JSON string
    result = Column(JSON, nullable=True)  # YOLO boxes result stored as JSON list

    user = relationship("User", back_populates="transactions")
    