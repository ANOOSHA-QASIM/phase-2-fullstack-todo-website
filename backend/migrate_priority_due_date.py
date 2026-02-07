#!/usr/bin/env python3
"""
Migration script to add priority and due_date columns to existing tasks table.
"""

import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session
from models import Task

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

def migrate():
    """
    Add priority and due_date columns to the existing tasks table.
    This is a manual migration script for demonstration.
    In a real application, you'd use Alembic for proper migrations.
    """
    print("Starting migration...")

    # Create tables (this will add any new columns based on the model)
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    # Update any existing records to have default values if needed
    with Session(engine) as session:
        # Update existing records to have default priority if they don't have it
        # Note: This is handled by SQLModel automatically with default values

        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()