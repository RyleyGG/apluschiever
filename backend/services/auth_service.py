import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from services.config_service import config
from models.db_models import User as UserDb
from db import getDb
from sqlalchemy.orm import Session


pwdContext = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauthScheme = OAuth2PasswordBearer(tokenUrl="token")

def createToken(data: dict, token_lifetime: int):
    toEncode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=token_lifetime)
    toEncode.update({"exp": expire})
    encodedJwt = jwt.encode(toEncode, config.auth_secret, algorithm=config.auth_algo)
    return encodedJwt


def verifyPassword(plainPassword, hashedPassword):
    return pwdContext.verify(plainPassword, hashedPassword)


def genPasswordHash(password):
    return pwdContext.hash(password)


async def validateToken(token: str = Depends(oauthScheme), db: Session = Depends(getDb)):
    credentialsException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    tokenException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token is associated with user that actually exists
    try:
        payload = jwt.decode(token, config.auth_secret, algorithms=[config.auth_algo])
        email = payload.get('sub')
        if email is None:
            raise credentialsException
    except Exception as e:
        raise credentialsException

    user = db.query(UserDb).filter(UserDb.email_address == email).first()
    if not user:
        raise credentialsException

    # Verify that token has not expired
    try:
        exp = float(payload.get('exp'))
        if exp < datetime.now().timestamp():
            raise tokenException
    except Exception:
        raise tokenException
    
    return user