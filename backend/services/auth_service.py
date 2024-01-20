import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from services.config_service import config
from models.db_models import User as UserDb
from db import getDb
from sqlalchemy.orm import Session


pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_token(data: dict, token_lifetime: int):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=token_lifetime)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.auth_secret, algorithm=config.auth_algo)
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def gen_password_hash(password):
    return pwd_context.hash(password)


async def validate_token(token: str = Depends(oauth_scheme), db: Session = Depends(getDb)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token is associated with user that actually exists
    try:
        payload = jwt.decode(token, config.auth_secret, algorithms=[config.auth_algo])
        email = payload.get('sub')
        if email is None:
            raise credentials_exception
    except Exception as e:
        raise credentials_exception

    user = db.query(UserDb).filter(UserDb.email_address == email).first()
    if not user:
        raise credentials_exception

    # Verify that token has not expired
    try:
        exp = float(payload.get('exp'))
        if exp < datetime.now().timestamp():
            raise token_exception
    except Exception:
        raise token_exception
    
    return user
