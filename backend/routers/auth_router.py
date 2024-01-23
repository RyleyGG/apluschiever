from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import select, Session

from models.db_models import User
from models.dto_models import SignUpInfo, SignInInfo, SuccessfulUserAuth, RefreshToken

from services.config_service import config
from services import auth_service
from services.api_utility_service import get_session

router = APIRouter()


@router.post('/sign_in', response_model=SuccessfulUserAuth, response_model_by_alias=False)
async def attempt_sign_in(signin_obj: SignInInfo, db: Session = Depends(get_session)):
    existing_user = db.exec(select(User).where(User.email_address == signin_obj.email_address)).first()

    if not existing_user or not auth_service.verify_password(signin_obj.password, existing_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token = auth_service.create_token({'sub': existing_user.email_address}, config.access_token_lifetime)
    refresh_token = auth_service.create_token({'sub': existing_user.email_address}, config.refresh_token_lifetime)
    return {'access_token': access_token, 'refresh_token': refresh_token, 'token_type': 'bearer', 'user_id': existing_user.id}


@router.post('/sign_up')
async def attempt_sign_up(signup_obj: SignUpInfo, db: Session = Depends(get_session)):
    # Validate incoming data prior to committing to db
    existing_user = db.exec(select(User).where(User.email_address == signup_obj.email_address)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="There was a problem with your credentials. Please try again.",
        )

    # Commit to db
    hashed_password = auth_service.gen_password_hash(signup_obj.password)
    new_user = User(
        email_address=signup_obj.email_address,
        password=hashed_password,
        first_name=signup_obj.first_name,
        last_name=signup_obj.last_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)


@router.post('/refresh', response_model=SuccessfulUserAuth, response_model_by_alias=False)
async def revalidate_access_token(refresh_token: RefreshToken, db: Session = Depends(get_session)):
    try:
        user = await auth_service.validate_token(token=refresh_token.refresh_token, db=db)
    except Exception as e:
        # 401 would be more technically correct, but 400 avoids the frontend error interceptor from picking it up
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Failed to refresh authentication',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token = auth_service.create_token({'sub': user.email_address}, config.access_token_lifetime)
    refresh_token = auth_service.create_token({'sub': user.email_address}, config.refresh_token_lifetime)

    return {'access_token': access_token, 'refresh_token': refresh_token, 'token_type': 'bearer', 'user_id': user.id}
