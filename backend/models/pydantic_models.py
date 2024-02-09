import uuid
from typing import List, Optional
from pydantic import Field
from sqlmodel import SQLModel

from models.dto_models import SupportedThirdParties


class Content(SQLModel, table=False):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4)


class Video(Content, table=False):
    embed_link: str
    video_source: str


class Markdown(Content, table=False):
    content: str


class UploadFile(Content, table=False):
    embed_link: str


class ThirdPartyResource(Content, table=False):
    embed_link: str
    video_source: SupportedThirdParties
