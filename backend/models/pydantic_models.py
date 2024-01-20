import uuid
from typing import Optional, List
from pydantic import BaseModel


class User(BaseModel):
    id: uuid.UUID
    email_address: str
    first_name: str
    last_name: str
    password: str


class Node(BaseModel):
    title: str
    short_description: str


class Course(BaseModel):
    id: uuid.UUID
    title: str
    short_description: str
    course_owner_id: uuid.UUID
    nodes: List[Node]
