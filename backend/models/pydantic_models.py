import uuid
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    id: uuid.UUID
    email_address: str
    first_name: str
    last_name: str
    password: str