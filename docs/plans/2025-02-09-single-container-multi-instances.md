# Single-Container Multi-Instance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge frontend and backend into a single Docker container for easy deployment of multiple isolated instances (one per client)

**Architecture:** Express Node.js server serves both API routes and static frontend files. Each container is a complete isolated instance with its own SQLite database, automatically detected port, and unique UUID.

**Tech Stack:** Docker, Node.js, Express, React/Vite, Prisma, SQLite, Bash scripting

---

## Task 1: Create Combined Dockerfile

**Files:**
- Create: `Dockerfile` (at root)

**Step 1: Write the Dockerfile**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Build backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/prisma ./prisma
COPY server/src ./src
RUN npx prisma generate

# Build frontend
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install --legacy-peer-deps
COPY web/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install backend production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy backend artifacts
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/src ./server/src

# Copy frontend build output
COPY --from=builder /app/web/dist ./public

# Copy startup scripts
COPY start-container.sh /app/start-container.sh
RUN chmod +x /app/start-container.sh

# Create data directory
RUN mkdir -p /app/data

# Environment
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/instance.db"

EXPOSE 3000

CMD ["/bin/sh", "/app/start-container.sh"]
```

**Step 2: Verify Dockerfile syntax**

Run: `docker build --no-cache -t logicai-n8n:test . 2>&1 | head -20`
Expected: No syntax errors, build begins

**Step 3: Commit**

```bash
git add Dockerfile
git commit -m "feat: add combined Dockerfile for single-container deployment"
```

---

## Task 2: Modify Express to Serve Static Frontend

**Files:**
- Modify: `server/src/app.ts`

**Step 1: Read current app.ts**

Run: `cat server/src/app.ts`

**Step 2: Add static file serving before API routes**

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import workflowRoutes from './routes/workflows';
import webhookRoutes from './routes/webhooks';

export function createApp(): Application {
  const app = express();

  // Middleware
  const externalPort = process.env.EXTERNAL_PORT || '3000';
  app.use(cors({
    origin: [
      `http://localhost:${externalPort}`,
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static frontend files
  app.use(express.static(path.join(__dirname, '../../public')));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/workflows', workflowRoutes);
  app.use('/webhook', webhookRoutes);

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
      });
    }
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
    });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  });

  return app;
}

export default createApp;
```

**Step 3: Test static file serving locally**

Run: `cd server && npm run dev`
Test: Open http://localhost:3001 in browser
Expected: Frontend loads, API accessible

**Step 4: Commit**

```bash
git add server/src/app.ts
git commit -m "feat: serve static frontend files with Express"
```

---

## Task 3: Create Container Startup Script

**Files:**
- Create: `start-container.sh`

**Step 1: Write startup script**

```bash
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
```

**Step 2: Test startup script locally**

Run: `chmod +x start-container.sh && ./start-container.sh`
Expected: Server starts, no errors

**Step 3: Commit**

```bash
git add start-container.sh
git commit -m "feat: add container startup script with auto-configuration"
```

---

## Task 4: Create Instance Deployment Script

**Files:**
- Create: `deploy-instance.sh`

**Step 1: Write deployment script**

```bash
#!/bin/bash
set -e

# Function to show usage
usage() {
    echo "Usage: $0 --name <instance-name> [--port <port>] [--id <instance-id>]"
    echo ""
    echo "Examples:"
    echo "  $0 --name client1"
    echo "  $0 --name staging --port 9000"
    echo "  $0 --name test --id logic-test123"
    exit 1
}

# Parse arguments
INSTANCE_NAME=""
PORT=""
INSTANCE_ID=""
QUIET=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            INSTANCE_NAME="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --id)
            INSTANCE_ID="$2"
            shift 2
            ;;
        --quiet)
            QUIET="true"
            shift
            ;;
        *)
            usage
            ;;
    esac
done

# Validate required arguments
if [ -z "$INSTANCE_NAME" ]; then
    echo "Error: --name is required"
    usage
fi

# Sanitize instance name (convert to valid container name)
CONTAINER_NAME="logic-$(echo $INSTANCE_NAME | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
VOLUME_NAME="${CONTAINER_NAME}-data"

# Generate unique ID if not provided
if [ -z "$INSTANCE_ID" ]; then
    INSTANCE_ID="logic-$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -c1-8)"
fi

echo "🚀 Deploying LogicAI-N8N Instance"
echo "================================"
echo "Instance Name: $INSTANCE_NAME"
echo "Container Name: $CONTAINER_NAME"
echo "Instance ID: $INSTANCE_ID"
echo "Volume: $VOLUME_NAME"

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container $CONTAINER_NAME already exists"
    echo "   Remove it first: docker rm -f $CONTAINER_NAME"
    exit 1
fi

# Find available port if not specified
if [ -z "$PORT" ]; then
    # Try ports from 8080 upwards
    for TRY_PORT in {8080..9999}; do
        if ! docker ps --format '{{.Ports}}' | grep -q ":${TRY_PORT}->"; then
            PORT=$TRY_PORT
            break
        fi
    done

    if [ -z "$PORT" ]; then
        echo "❌ Error: No available port found in range 8080-9999"
        exit 1
    fi
fi

echo "Port: $PORT"
echo ""

# Build image if needed
echo "🔨 Building Docker image..."
docker build -t logicai-n8n:latest . > /dev/null 2>&1
echo "✅ Build complete"

# Create container
echo "📦 Creating container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -v $VOLUME_NAME:/app/data \
  -e INSTANCE_ID="$INSTANCE_ID" \
  -e INSTANCE_NAME="$INSTANCE_NAME" \
  -e EXTERNAL_PORT="$PORT" \
  --restart unless-stopped \
  logicai-n8n:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps --format '{{.Status}}' | grep -q "Up"; then
    echo "✅ Container started successfully"
else
    echo "❌ Error: Container failed to start"
    docker logs $CONTAINER_NAME | tail -20
    exit 1
fi

# Display access information
echo ""
echo "================================"
echo "✨ Instance deployed successfully!"
echo "================================"
echo "Instance ID:   $INSTANCE_ID"
echo "Instance Name: $INSTANCE_NAME"
echo "Container:     $CONTAINER_NAME"
echo "Access URL:    http://localhost:$PORT"
echo "Volume:        $VOLUME_NAME"
echo ""
echo "📝 Useful commands:"
echo "   View logs:   docker logs -f $CONTAINER_NAME"
echo "   Stop:        docker stop $CONTAINER_NAME"
echo "   Start:       docker start $CONTAINER_NAME"
echo "   Remove:      docker rm -f $CONTAINER_NAME"
echo "   Shell access: docker exec -it $CONTAINER_NAME sh"
echo ""

# Open browser if not quiet mode
if [ "$QUIET" != "true" ]; then
    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:$PORT
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:$PORT 2>/dev/null || echo "Open manually: http://localhost:$PORT"
    fi
fi

echo "Done! 🎉"
```

**Step 2: Make script executable**

Run: `chmod +x deploy-instance.sh`

**Step 3: Test script help**

Run: `./deploy-instance.sh`
Expected: Usage message displayed

**Step 4: Commit**

```bash
git add deploy-instance.sh
git commit -m "feat: add instance deployment script with automatic port detection"
```

---

## Task 5: Create Instance Management Script

**Files:**
- Create: `manage-instances.sh`

**Step 1: Write management script**

```bash
#!/bin/bash

set -e

show_help() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
  list                           List all LogicAI-N8N instances
  remove <instance-name>          Remove an instance
  logs <instance-name>            Show logs for an instance
  stop <instance-name>            Stop an instance
  start <instance-name>           Start a stopped instance
  restart <instance-name>         Restart an instance
  exec <instance-name>            Execute shell in instance
  prune                          Remove all stopped instances

Examples:
  $0 list
  $0 remove client1
  $0 logs client1
  $0 prune

EOF
}

list_instances() {
    echo "📋 LogicAI-N8N Instances"
    echo "======================"
    echo ""

    # Get all LogicAI containers
    containers=$(docker ps -a --filter "name=logic-" --format '{{.Names}}')

    if [ -z "$containers" ]; then
        echo "No instances found"
        return
    fi

    for container in $containers; do
        # Get container status
        status=$(docker inspect -f '{{.State.Status}}' $container 2>/dev/null)

        # Get port mapping
        port=$(docker port $container 2>/dev/null | grep '0.0.0.0' | cut -d':' -f2 | head -1)
        [ -z "$port" ] && port="-"

        # Get instance info
        instance_id=$(docker inspect -f '{{.Config.Env}}' $container 2>/dev/null | grep -o 'INSTANCE_ID=[^ ]*' | cut -d'=' -f2)
        instance_name=$(docker inspect -f '{{.Config.Env}}' $container 2>/dev/null | grep -o 'INSTANCE_NAME=[^ ]*' | cut -d'=' -f2)

        # Get volume
        volume=$(docker inspect -f '{{.Mounts}}' $container 2>/dev/null | grep -o '"Name":"[^"]*"' | cut -d'"' -f4)
        [ -z "$volume" ] && volume="-"

        # Display
        if [ "$status" = "running" ]; then
            echo "✅ $container"
        else
            echo "⏸️  $container (stopped)"
        fi
        echo "   ID:       ${instance_id:-unknown}"
        echo "   Name:     ${instance_name:-unknown}"
        echo "   Port:     $port"
        echo "   Volume:   $volume"
        echo ""
    done
}

remove_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    # Check if container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${instance_name}$"; then
        echo "❌ Error: Instance '$instance_name' not found"
        exit 1
    fi

    echo "🗑️  Removing instance: $instance_name"

    # Stop and remove container
    docker stop $instance_name 2>/dev/null || true
    docker rm -f $instance_name

    # Ask about volume
    volume="${instance_name}-data"
    if docker volume ls -q | grep -q "^${volume}$"; then
        echo ""
        read -p "Remove volume '$volume' as well? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker volume rm $volume
            echo "✅ Volume removed"
        else
            echo "ℹ️  Volume preserved"
        fi
    fi

    echo "✅ Instance removed"
}

show_logs() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    docker logs -f $instance_name
}

stop_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    echo "⏸️  Stopping instance: $instance_name"
    docker stop $instance_name
    echo "✅ Instance stopped"
}

start_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    echo "▶️  Starting instance: $instance_name"
    docker start $instance_name
    echo "✅ Instance started"
}

restart_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    echo "🔄 Restarting instance: $instance_name"
    docker restart $instance_name
    echo "✅ Instance restarted"
}

exec_shell() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    docker exec -it $instance_name sh
}

prune_instances() {
    echo "🧹 Removing all stopped LogicAI-N8N instances..."

    # Get all stopped LogicAI containers
    stopped=$(docker ps -a --filter "name=logic-" --filter "status=exited" --format '{{.Names}}')

    if [ -z "$stopped" ]; then
        echo "No stopped instances found"
        return
    fi

    for container in $stopped; do
        echo "Removing: $container"
        docker rm -f $container > /dev/null 2>&1
    done

    echo "✅ Pruned stopped instances"
}

# Parse command
case "${1:-}" in
    list)
        list_instances
        ;;
    remove)
        remove_instance "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    stop)
        stop_instance "$2"
        ;;
    start)
        start_instance "$2"
        ;;
    restart)
        restart_instance "$2"
        ;;
    exec)
        exec_shell "$2"
        ;;
    prune)
        prune_instances
        ;;
    *)
        show_help
        exit 1
        ;;
esac
```

**Step 2: Make script executable**

Run: `chmod +x manage-instances.sh`

**Step 3: Test list command**

Run: `./manage-instances.sh list`
Expected: Lists all LogicAI-N8N instances

**Step 4: Commit**

```bash
git add manage-instances.sh
git commit -m "feat: add instance management script with list/remove/logs commands"
```

---

## Task 6: Update Prisma Schema for Instance DB

**Files:**
- Modify: `server/prisma/schema.prisma`

**Step 1: Update database URL comment**

Open `server/prisma/schema.prisma`

**Step 2: Update datasource comment**

Change the comment in the datasource section:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  // Database: /app/data/instance.db (per-instance SQLite database)
}
```

**Step 3: Verify schema**

Run: `cd server && npx prisma validate`
Expected: Schema is valid

**Step 4: Commit**

```bash
git add server/prisma/schema.prisma
git commit -m "docs: update database path comment for instance-specific DB"
```

---

## Task 7: Build and Test Combined Image

**Step 1: Build Docker image**

Run: `docker build -t logicai-n8n:latest .`

Expected: Build completes successfully with "=> => naming to docker.io/library/logicai-n8n:latest"

**Step 2: Test container creation locally**

Run: ```bash
docker run -d \
  --name logic-test \
  -p 9999:3000 \
  -v logic-test-data:/app/data \
  -e INSTANCE_ID="logic-test" \
  -e INSTANCE_NAME="Test Instance" \
  -e EXTERNAL_PORT="9999" \
  logicai-n8n:latest
```

Expected: Container created and starts

**Step 3: Verify container is running**

Run: `docker ps | grep logic-test`

Expected: Container shows as "Up" status

**Step 4: Check logs**

Run: `docker logs logic-test`

Expected: See "LogicAI-N8N Container Startup" messages

**Step 5: Test application is accessible**

Run: `curl -s http://localhost:9999/health | head -5`

Expected: `{"status":"ok","timestamp":"..."}`

**Step 6: Test frontend is served**

Run: `curl -s http://localhost:9999/ | grep -o "<title>.*</title>"`

Expected: HTML page with title

**Step 7: Test API is accessible**

Run: `curl -s http://localhost:9999/api/workflows`

Expected: JSON response (empty array `[]` if no workflows)

**Step 8: Cleanup test container**

Run: `docker stop logic-test && docker rm logic-test`

Expected: Container stopped and removed

**Step 9: Commit**

```bash
git add .
git commit -m "test: verify combined container build and functionality"
```

---

## Task 8: Deploy Multiple Test Instances

**Step 1: Deploy first instance**

Run: `./deploy-instance.sh --name client1 --port 8080`

Expected: Instance created, accessible at http://localhost:8080

**Step 2: Deploy second instance**

Run: `./deploy-instance.sh --name client2 --port 8081`

Expected: Second instance created, accessible at http://localhost:8081

**Step 3: List all instances**

Run: `./manage-instances.sh list`

Expected: Shows both instances with their details

**Step 4: Verify isolation**

Run:
```bash
# Create workflow in instance 1
curl -X POST http://localhost:8080/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"Client1 Workflow","description":"Test","nodes":[],"edges":[]}'

# List workflows in instance 2
curl http://localhost:8081/api/workflows
```

Expected: Instance 2 shows empty array (data isolated)

**Step 5: Test CORS on both instances**

Open both http://localhost:8080 and http://localhost:8081 in browser

Expected: Both frontends load without CORS errors

**Step 6: Cleanup test instances**

Run: `./manage-instances.sh remove client1` and `./manage-instances.sh remove client2`

Expected: Both instances removed successfully

**Step 7: Commit**

```bash
git add .
git commit -m "test: verify multi-instance isolation and deployment"
```

---

## Task 9: Remove Old Docker Configuration Files

**Files:**
- Remove: `server/Dockerfile`
- Remove: `web/Dockerfile`
- Remove: `web/nginx.conf`
- Remove: `docker-compose.yml`
- Remove: `docker-compose.dev.yml`

**Step 1: Remove old Dockerfiles**

Run:
```bash
rm server/Dockerfile
rm web/Dockerfile
rm web/nginx.conf
rm docker-compose.yml
rm docker-compose.dev.yml
```

Expected: Files deleted

**Step 2: Verify removal**

Run: `ls -la *.yml */Dockerfile */nginx.conf 2>/dev/null || echo "Cleanup successful"`

Expected: No such files found

**Step 3: Update documentation**

Create: `MULTI_INSTANCE_GUIDE.md` explaining new deployment method

**Step 4: Commit**

```bash
git add .
git commit -m "refactor: remove old multi-container Docker setup, switch to single-container"
```

---

## Task 10: Create Documentation

**Files:**
- Create: `MULTI_INSTANCE_GUIDE.md`
- Update: `QUICKSTART.md`
- Update: `DOCKER_SETUP.md`

**Step 1: Write multi-instance guide**

Create comprehensive guide covering:
- How to deploy instances
- Port management
- Data persistence
- Troubleshooting
- Examples

**Step 2: Update QUICKSTART.md**

Change from docker-compose to single container deployment

**Step 3: Update DOCKER_SETUP.md**

Remove references to docker-compose, add single-container instructions

**Step 4: Commit**

```bash
git add MULTI_INSTANCE_GUIDE.md QUICKSTART.md DOCKER_SETUP.md
git commit -m "docs: update documentation for single-container multi-instance setup"
```

---

## Task 11: Final Verification

**Step 1: Deploy production-like instance**

Run: `./deploy-instance.sh --name prod-test --port 8080 --id logic-prod123`

**Step 2: Create workflow via UI**

Open http://localhost:8080
Create a test workflow with nodes and connections

**Step 3: Verify database persistence**

Run: `docker exec logic-prod-test ls -lh /app/data/`

Expected: instance.db file exists

**Step 4: Stop and restart instance**

Run:
```bash
./manage-instances.sh stop prod-test
./manage-instances.sh start prod-test
```

Expected: Workflow still exists after restart

**Step 5: Verify all endpoints**

Test:
- Health: `curl http://localhost:8080/health`
- Workflows: `curl http://localhost:8080/api/workflows`
- Frontend: Open in browser

**Step 6: Cleanup**

Run: `./manage-instances.sh remove prod-test`

**Step 7: Final commit**

```bash
git add .
git commit -m "test: final verification of single-container multi-instance setup"
```

---

## Verification Checklist

After implementation, verify:

- [ ] Single Dockerfile builds successfully
- [ ] Frontend loads correctly at root path
- [ ] API routes work at `/api/*`
- [ ] CORS configured correctly for dynamic ports
- [ ] Multiple instances can run simultaneously
- [ ] Each instance has isolated database
- [ ] Deployment script works with auto-port detection
- [ ] Management script can list/remove instances
- [ ] Containers can be stopped and restarted without data loss
- [ ] Health check endpoint accessible
- [ ] Database persists within container

## Success Criteria

✅ Single container serves both frontend and backend
✅ Multiple isolated instances can run on different ports
✅ Each instance has its own SQLite database
✅ Deployment is as simple as one command
✅ No port conflicts with automatic detection
✅ Data persists across container restarts
