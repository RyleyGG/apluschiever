FROM tiangolo/uvicorn-gunicorn-fastapi:latest

COPY ./backend /app
COPY ./.env /config/.env
RUN pip install -r /app/requirements.txt