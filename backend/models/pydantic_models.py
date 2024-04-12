from enum import Enum
import uuid
from typing import List, Optional

from pydantic import Field
from sqlmodel import SQLModel
from sqlalchemy import LargeBinary, Column

class Content(SQLModel, table=False):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4)

class SupportedThirdParties(Enum):
    YOUTUBE = 'YouTube'

class Video(Content, table=False):
    embed_link: str
    video_source: SupportedThirdParties


class RichText(Content, table=False):
    content: str


class UploadFile(Content, table=False):
    file_name: str
    file_content: bytes = Field(sa_column=Column(LargeBinary))


class ThirdPartyResource(Content, table=False):
    embed_link: str
    resource_source: SupportedThirdParties
