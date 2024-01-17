from fastapi import APIRouter, HTTPException, status, Depends
from db import getDb
from sqlalchemy.orm import Session

from models.db_models import User as UserDb
from models.pydantic_models import User as UserPyd
from models.dto_models import SignUpInfo, SignInInfo, SuccessfulUserAuth, RefreshToken

from services.config_service import config
from services import auth_service

router = APIRouter()

@router.post('/sign_in', response_model=SuccessfulUserAuth, response_model_by_alias=False)
async def attemptSignin(signinObj: SignInInfo, db: Session = Depends(getDb)):
    existing_user = db.query(UserDb).filter(UserDb.email_address == signinObj.email_address).first()
    
    if not existing_user or not auth_service.verifyPassword(signinObj.password, existing_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token = auth_service.createToken({'sub': existing_user.email_address}, config.access_token_lifetime)
    refresh_token = auth_service.createToken({'sub': existing_user.email_address}, config.refresh_token_lifetime)
    return {'access_token': access_token, 'refresh_token': refresh_token, 'token_type': 'bearer'}

@router.post('/sign_up')
async def attemptSignup(signupObj: SignUpInfo, db: Session = Depends(getDb)):
    # Validate incoming data prior to committing to db
    existing_user = db.query(UserDb).filter(UserDb.email_address == signupObj.email_address).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="There was a problem with your credentials. Please try again.",
        )

    # Commit to db
    hashedPassword = auth_service.genPasswordHash(signupObj.password)
    newUser = UserDb(
        email_address=signupObj.email_address,
        password=hashedPassword,
        first_name=signupObj.first_name,
        last_name=signupObj.last_name
    )
    db.add(newUser)
    db.commit()
    db.refresh(newUser)

@router.post('/refresh', response_model=SuccessfulUserAuth, response_model_by_alias=False)
async def revalidateAccessToken(refresh_token: RefreshToken, db: Session = Depends(getDb)):
    try:
        user = await auth_service.validateToken(token=refresh_token.refresh_token, db=db)
    except Exception as e:
        # 401 would be more technically correct, but 400 avoids the frontend error interceptor from picking it up
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Failed to refresh authentication',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token = auth_service.createToken({'sub': user.email_address}, config.access_token_lifetime)
    refresh_token = auth_service.createToken({'sub': user.email_address}, config.refresh_token_lifetime)

    return {'access_token': access_token, 'refresh_token': refresh_token, 'token_type': 'bearer'}

