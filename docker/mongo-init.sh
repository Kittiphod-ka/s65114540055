#!/usr/bin/env bash
set -e

DUMP_DIR="/docker-entrypoint-initdb.d/dump"

# รอให้ mongod พร้อม
echo "Waiting for MongoDB to be ready..."
until mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 1
done

# restore ถ้ามีไฟล์
if [ -d "$DUMP_DIR/car" ] && [ "$(ls -A "$DUMP_DIR/car")" ]; then
  echo ">>> Restoring MongoDB database 'car'..."
  mongorestore --drop --db car "$DUMP_DIR/car" || true
  echo ">>> Restore complete."
else
  echo ">>> No dump found for 'car', skipping restore."
fi
