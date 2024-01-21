#!/bin/bash

sleep 5
uvicorn api:app --host 0.0.0.0 --reload
