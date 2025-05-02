"""
Module: core.database

Provides database connectivity using SQLAlchemy.
"""

import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@database:5432/db")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def init_db() -> None:
    """
    Initialize the database by creating all tables based on ORM models.

    Steps:
      - Import all ORM models to register them with the metadata.
      - Call Base.metadata.create_all(bind=engine).
    """
    from src.db.models import Base
    Base.metadata.create_all(bind=engine)
    # Automatically add missing 'result' column to 'transactions' table
    inspector = inspect(engine)
    columns = [column['name'] for column in inspector.get_columns('transactions')]
    if 'result' not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN result JSON"))
    # Reset any negative user balances to zero
    with engine.begin() as conn:
        conn.execute(text("UPDATE users SET balance = 0 WHERE balance < 0"))
