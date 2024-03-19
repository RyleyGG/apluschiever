from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from loguru import logger
from datetime import datetime
from os import path

config_dir = Path(__file__).parent.parent.parent / 'config'
cwd = Path(__file__).parent.parent
parent_dir = Path(__file__).parent.parent.parent
env_dir = None
if path.isdir(config_dir):
    env_dir = config_dir
else:
    env_dir = parent_dir


class Config(BaseSettings):
    postgres_password: str = ''
    auth_secret: str = ''
    auth_algo: str = 'HS256'
    access_token_lifetime: int = 30
    refresh_token_lifetime: int = 7 * 1440 # days * minutes in a day
    model_config = SettingsConfigDict(env_file=env_dir / '.env', from_attributes=True, extra='allow')
    _tests_user_id: str = None
    _tests_access_token: str = None
    _tests_teacher_id: str = None
config: Config = Config()

logger.add(cwd / 'logs' / f'{str(int(datetime.now().timestamp()))}.log')
