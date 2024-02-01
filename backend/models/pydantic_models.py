from typing import List

from sqlmodel import SQLModel


class Video(SQLModel, table=False):
    embed_link: str
    video_source: str


class Markdown(SQLModel, table=False):
    content: str
