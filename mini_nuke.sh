#!/bin/bash

chmod u+rwx "./setup.sh"
cd frontend
npm install
cd ../backend
docker compose down --volumes
docker compose build
cd ..
./setup.sh