#!/bin/bash
git pull
npm install
pkill -f node || true
npm start &
echo "Update script finished. Server should be running in the background."
