from pydantic import BaseModel
from models.pydantic_models import User

from typing import Optional

class SignUpInfo(BaseModel):
    email_address: str
    first_name: str
    last_name: str
    password: str

class SignInInfo(BaseModel):
    email_address: str
    password: str
    
class SuccessfulUserAuth(BaseModel):
    token_type: str
    access_token: str
    refresh_token: str
    
class RefreshToken(BaseModel):
    refresh_token: str
