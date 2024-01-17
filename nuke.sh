#!/bin/bash

chmod u+rwx "./setup.sh"
cd frontend
echo "Deleting frontend packages. This may take a minute..."
rm -rf node_modules
npm install
cd ../backend
docker compose down --volumes
docker compose build
cd ..
./setup.sh