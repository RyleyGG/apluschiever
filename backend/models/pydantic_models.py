import uuid
from typing import List, Optional
from pydantic import Field
from sqlmodel import SQLModel


class Video(SQLModel, table=False):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4)
    embed_link: str
    video_source: str


class Markdown(SQLModel, table=False):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4)
    content: str
