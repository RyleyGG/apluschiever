#!/bin/bash

sleep 5
python3 /app/db.py
uvicorn api:app --host 0.0.0.0 --reload
