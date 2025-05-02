"""
Module: workers.result_consumer

Async RabbitMQ consumer to process YOLO results messages and update transactions in the DB.
"""

import os
import json
import asyncio
from aio_pika import connect_robust, IncomingMessage
import logging

from sqlalchemy.orm import Session
from src.core.database import SessionLocal
from src.db.models import Transaction, User

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq/")
YOLO_RESULTS_QUEUE = os.getenv("YOLO_RESULTS_QUEUE", "yolo_results")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

async def handle_yolo_result(message: IncomingMessage) -> None:
    async with message.process():
        payload = json.loads(message.body)
        tx_id = payload.get("transaction_id")
        boxes = payload.get("boxes")
        if tx_id is None or boxes is None:
            logger.error("Invalid YOLO result payload: %s", payload)
            return
        try:
            db: Session = SessionLocal()
            # Retrieve transaction and update result
            transaction = db.get(Transaction, tx_id)
            if not transaction:
                logger.error("Transaction %s not found", tx_id)
            else:
                transaction.result = boxes
                db.add(transaction)
                # Refund if no detections
                if not boxes:
                    user = db.get(User, transaction.user_id)
                    if user:
                        user.balance += transaction.amount
                        db.add(user)
                        logger.info(
                            "Refunded %s credits for transaction %s due to no detections",
                            transaction.amount,
                            tx_id
                        )
                db.commit()
                logger.info("Updated transaction %s with %d boxes", tx_id, len(boxes))
        except Exception as e:
            logger.error("Error processing YOLO result for tx %s: %s", tx_id, e)
        finally:
            db.close()

async def consume_results():
    # Keep retrying until RabbitMQ broker is available
    while True:
        try:
            connection = await connect_robust(RABBITMQ_URL)
            channel = await connection.channel()
            await channel.declare_queue(YOLO_RESULTS_QUEUE, durable=True)
            queue = await channel.declare_queue(YOLO_RESULTS_QUEUE, durable=True)
            await queue.consume(handle_yolo_result)
            logger.info(f"[*] Listening for YOLO results on {YOLO_RESULTS_QUEUE}...")
            break
        except Exception as conn_err:
            logger.error("Failed to connect to RabbitMQ (Yolo results), retrying in 5s: %s", conn_err)
            await asyncio.sleep(5)
    # Keep the consumer running indefinitely
    await asyncio.Future()


def start_result_consumer():
    """
    Schedule the result consumer coroutine in the event loop.
    """
    asyncio.create_task(consume_results()) 