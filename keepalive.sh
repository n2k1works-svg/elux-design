#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 --hostname 0.0.0.0 2>&1
  echo "[keepalive] Server crashed, restarting in 2s..."
  sleep 2
done
