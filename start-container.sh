#!/bin/sh
set -e

echo "LogicAI-N8N Container Startup"
echo "==============================="

# Determine external port (the port mapped to container)
# Default to 3000 if not set
EXTERNAL_PORT=${EXTERNAL_PORT:-3000}

echo "External Port: $EXTERNAL_PORT"

# Set CORS origin to match external port
export CORS_ORIGIN="http://localhost:$EXTERNAL_PORT"

echo "CORS Origin: $CORS_ORIGIN"

# Get instance info
INSTANCE_ID=${INSTANCE_ID:-logic-unknown}
INSTANCE_NAME=${INSTANCE_NAME:-LogicAI Instance}

echo "Instance ID: $INSTANCE_ID"
echo "Instance Name: $INSTANCE_NAME"

# Initialize database if it doesn't exist
if [ ! -f /app/data/instance.db ]; then
    echo "Database not found. Initializing..."
    cd /app/server && npx prisma db push --skip-generate
    echo "Database initialized successfully!"
else
    echo "Database exists at /app/data/instance.db"
fi

# Start the server
echo ""
echo "Starting LogicAI-N8N server on port 3000..."
echo "Access the application at: http://localhost:$EXTERNAL_PORT"
echo "==============================="

cd /app/server
exec npx tsx src/server.ts
