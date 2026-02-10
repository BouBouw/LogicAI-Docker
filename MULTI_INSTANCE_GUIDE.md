# Multi-Instance Deployment Guide

## Table of Contents
- [Introduction](#introduction)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Deployment](#deployment)
- [Management](#management)
- [Data Persistence](#data-persistence)
- [Use Cases](#use-cases)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

---

## Introduction

Multi-instance deployment allows you to run multiple isolated LogicAI-N8N instances on a single host. Each instance operates independently with its own:
- Docker container
- PostgreSQL database
- Network port
- Data volume
- Configuration

This architecture replaces the previous multi-container docker-compose setup with a more flexible single-container approach that supports multiple deployments.

---

## Architecture

### Instance Isolation

Each LogicAI-N8N instance is completely isolated from others:

```
┌─────────────────────────────────────────────────────────────┐
│                         Host System                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  logic-client1  │  │  logic-staging  │  │ logic-prod   │ │
│  │  Port: 8080     │  │  Port: 8081     │  │ Port: 8082   │ │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │ ┌──────────┐ │ │
│  │  │Database   │  │  │  │Database   │  │  │ │Database  │ │ │
│  │  │Volume:    │  │  │  │Volume:    │  │  │ │Volume:   │ │ │
│  │  │client1-data│  │  │  │staging-data│  │  │ │prod-data │ │ │
│  │  └───────────┘  │  │  └───────────┘  │  │ └──────────┘ │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

- **Container Name**: `logic-{instance-name}` (e.g., `logic-client1`)
- **Data Volume**: `{container-name}-data` (e.g., `logic-client1-data`)
- **Port Mapping**: Host port → Container port 3000
- **Instance ID**: Unique identifier for each deployment
- **Restart Policy**: `unless-stopped` for automatic recovery

---

## Prerequisites

### System Requirements

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Not required (single-container architecture)
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Memory**: Minimum 2GB RAM per instance
- **Disk Space**: 500MB per instance (plus workflow data)

### Verify Docker Installation

```bash
# Check Docker version
docker --version

# Check Docker is running
docker ps

# Verify Docker has sufficient resources
docker info
```

### Prepare Scripts

Ensure the deployment scripts are executable:

```bash
chmod +x deploy-instance.sh
chmod +x manage-instances.sh
```

---

## Deployment

### Basic Deployment

Deploy a new instance with default settings:

```bash
./deploy-instance.sh --name client1
```

**Output:**
```
🚀 Deploying LogicAI-N8N Instance
================================
Instance Name: client1
Container Name: logic-client1
Instance ID: logic-a1b2c3d4
Volume: logic-client1-data
Port: 8080

🔨 Building Docker image...
✅ Build complete
📦 Creating container...
⏳ Waiting for container to start...
✅ Container started successfully

================================
✨ Instance deployed successfully!
================================
Instance ID:   logic-a1b2c3d4
Instance Name: client1
Container:     logic-client1
Access URL:    http://localhost:8080
Volume:        logic-client1-data
```

### Custom Port

Specify a custom port for the instance:

```bash
./deploy-instance.sh --name staging --port 9000
```

**Use Cases:**
- Avoid port conflicts
- Match organizational port schemes
- Access through specific firewall rules

### Custom Instance ID

Provide a specific instance ID:

```bash
./deploy-instance.sh --name production --id logic-prod-2024
```

**Benefits:**
- Predictable identifiers
- Integration with monitoring systems
- Easier backup management

### Quiet Mode

Deploy without automatic browser opening:

```bash
./deploy-instance.sh --name testing --quiet
```

**Ideal for:**
- Automated deployments
- CI/CD pipelines
- Batch instance creation

### Advanced Options

Combine multiple options:

```bash
./deploy-instance.sh --name client2 --port 8085 --id logic-client2-east --quiet
```

---

## Management

### List All Instances

View all deployed instances:

```bash
./manage-instances.sh list
```

**Output:**
```
📋 LogicAI-N8N Instances
======================

✅ logic-client1
   ID:       logic-a1b2c3d4
   Name:     client1
   Port:     8080
   Volume:   logic-client1-data

✅ logic-staging
   ID:       logic-staging-123
   Name:     staging
   Port:     9000
   Volume:   logic-staging-data

⏸️  logic-testing (stopped)
   ID:       logic-test-456
   Name:     testing
   Port:     8081
   Volume:   logic-testing-data
```

### View Logs

Monitor instance logs in real-time:

```bash
./manage-instances.sh logs client1
```

**Use Cases:**
- Debugging workflow issues
- Monitoring startup sequence
- Troubleshooting errors

Press `Ctrl+C` to exit log viewing.

### Stop an Instance

Gracefully stop a running instance:

```bash
./manage-instances.sh stop client1
```

**What Happens:**
- Container stops gracefully
- Data is preserved
- Port is released
- Can be restarted later

### Start a Stopped Instance

Restart a stopped instance:

```bash
./manage-instances.sh start client1
```

**Behavior:**
- Uses same configuration
- Preserves all data
- Restarts on original port

### Restart an Instance

Stop and start an instance:

```bash
./manage-instances.sh restart client1
```

**Use Cases:**
- Apply configuration changes
- Recover from errors
- Clear temporary issues

### Execute Shell

Access the container shell:

```bash
./manage-instances.sh exec client1
```

**Common Tasks:**
```bash
# View database files
ls -la /app/data

# Check environment variables
env | grep INSTANCE

# View running processes
ps aux

# Test database connection
psql -U n8n -d n8n
```

Type `exit` to leave the shell.

### Remove an Instance

Delete an instance completely:

```bash
./manage-instances.sh remove client1
```

**Interactive Prompt:**
```
🗑️  Removing instance: client1

Remove volume 'logic-client1-data' as well? (y/N): y
✅ Volume removed
✅ Instance removed
```

**Warning:** This action is irreversible. Always backup important data first.

### Prune Stopped Instances

Remove all stopped instances at once:

```bash
./manage-instances.sh prune
```

**Output:**
```
🧹 Removing all stopped LogicAI-N8N instances...
Found stopped instances:
logic-testing
logic-dev-old

Remove all stopped instances? (y/N): y
Removing: logic-testing
Removing: logic-dev-old
✅ Pruned stopped instances
```

---

## Data Persistence

### Storage Structure

Each instance uses a Docker volume for persistent storage:

```
Volume Name: logic-{instance-name}-data
Mount Point: /app/data (inside container)
Contents:
  ├── database/         # PostgreSQL data files
  ├── n8n/             # N8N configuration
  └── workflows/       # Workflow definitions
```

### Backup Data

Create a backup of an instance:

```bash
# Method 1: Backup volume to tar file
docker run --rm \
  -v logic-client1-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/client1-backup-$(date +%Y%m%d).tar.gz -C /data .

# Method 2: Export database SQL
docker exec logic-client1 pg_dump -U n8n n8n > client1-db-$(date +%Y%m%d).sql
```

### Restore Data

Restore from backup:

```bash
# Method 1: Restore from tar file
docker run --rm \
  -v logic-client1-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/client1-backup-20240210.tar.gz -C /data

# Method 2: Restore database SQL
docker exec -i logic-client1 psql -U n8n n8n < client1-db-20240210.sql
```

### Migrate Instance

Move an instance to another host:

```bash
# On source host
docker save logicai-n8n:latest > logicai-n8n-image.tar
docker run --rm \
  -v logic-client1-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/client1-data.tar.gz -C /data .

# On destination host
docker load < logicai-n8n-image.tar
docker volume create logic-client1-data
docker run --rm \
  -v logic-client1-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/client1-data.tar.gz -C /data
```

---

## Use Cases

### 1. Multi-Tenant SaaS

**Scenario:** SaaS platform hosting workflows for multiple clients

```bash
./deploy-instance.sh --name client-acme --port 8080
./deploy-instance.sh --name client-globex --port 8081
./deploy-instance.sh --name client-soylent --port 8082
```

**Benefits:**
- Complete data isolation
- Individual scaling per client
- Separate maintenance windows

### 2. Development Environments

**Scenario:** Separate dev, staging, and production environments

```bash
./deploy-instance.sh --name dev --port 8080
./deploy-instance.sh --name staging --port 8081 --id logic-staging-prod
./deploy-instance.sh --name production --port 8082 --id logic-prod-main --quiet
```

**Benefits:**
- Test workflow changes safely
- Parallel development
- Production stability

### 3. Geographic Distribution

**Scenario:** Instances for different regions

```bash
./deploy-instance.sh --name us-east --port 8080 --id logic-use1-prod
./deploy-instance.sh --name eu-west --port 8081 --id logic-ew1-prod
./deploy-instance.sh --name asia-pacific --port 8082 --id logic-ap1-prod
```

**Benefits:**
- Reduced latency
- Data sovereignty compliance
- Regional customization

### 4. Departmental Workflows

**Scenario:** Different departments need isolated automation

```bash
./deploy-instance.sh --name hr-automation --port 8080
./deploy-instance.sh --name finance-workflows --port 8081
./deploy-instance.sh --name it-operations --port 8082
```

**Benefits:**
- Departmental autonomy
- Separate access controls
- Independent resource allocation

### 5. Testing and QA

**Scenario:** Temporary instances for testing

```bash
./deploy-instance.sh --name test-feature-a --port 9000 --quiet
./deploy-instance.sh --name test-feature-b --port 9001 --quiet
```

**Benefits:**
- Parallel testing
- Easy cleanup with `prune`
- No production impact

---

## Troubleshooting

### Port Already in Use

**Problem:**
```
❌ Error: Port 8080 is already allocated
```

**Solution 1:** Specify a different port
```bash
./deploy-instance.sh --name client1 --port 8090
```

**Solution 2:** Find and stop conflicting container
```bash
./manage-instances.sh list
./manage-instances.sh stop <conflicting-instance>
```

### Container Already Exists

**Problem:**
```
❌ Error: Container logic-client1 already exists
```

**Solution:** Remove existing container first
```bash
./manage-instances.sh remove client1
./deploy-instance.sh --name client1
```

### Container Won't Start

**Problem:** Container exits immediately after starting

**Diagnosis:**
```bash
# Check container status
docker ps -a | grep logic-client1

# View error logs
docker logs logic-client1

# Inspect container
docker inspect logic-client1
```

**Common Solutions:**

1. **Port conflict:** Change port
2. **Volume corruption:** Recreate volume
3. **Resource limits:** Check Docker resources
4. **Image issues:** Rebuild image
```bash
docker build -t logicai-n8n:latest .
```

### Instance Not Accessible

**Problem:** Browser can't connect to `http://localhost:8080`

**Checklist:**

1. **Verify container is running:**
```bash
./manage-instances.sh list
```

2. **Check port mapping:**
```bash
docker port logic-client1
```

3. **Test from inside container:**
```bash
docker exec logic-client1 wget -O- http://localhost:3000
```

4. **Verify firewall rules:**
```bash
# Linux
sudo ufw status

# macOS
sudo pfctl -s rules
```

### Database Connection Errors

**Problem:** Workflows fail with database errors

**Diagnosis:**
```bash
# Check database is running
docker exec logic-client1 ps aux | grep postgres

# Test database connection
docker exec logic-client1 psql -U n8n -d n8n -c "SELECT 1;"

# Check database logs
docker exec logic-client1 cat /app/data/database/log/postgresql.log
```

**Solution:** Restart container to initialize database
```bash
./manage-instances.sh restart client1
```

### Out of Memory

**Problem:** Container keeps restarting with OOM errors

**Diagnosis:**
```bash
# Check container resource usage
docker stats logic-client1

# View system logs
dmesg | grep -i memory
```

**Solution:** Increase Docker memory limit
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase memory allocation
4. Restart Docker

### Volume Mount Issues

**Problem:** Data not persisting between restarts

**Diagnosis:**
```bash
# Check volume exists
docker volume ls | grep logic-client1

# Inspect volume details
docker volume inspect logic-client1-data

# Check volume mount in container
docker inspect logic-client1 | grep -A 10 Mounts
```

**Solution:** Recreate volume from backup
```bash
./manage-instances.sh remove client1
docker volume create logic-client1-data
# Restore from backup (see Data Persistence section)
./deploy-instance.sh --name client1 --port 8080
```

### Script Permission Denied

**Problem:**
```
bash: ./deploy-instance.sh: Permission denied
```

**Solution:**
```bash
chmod +x deploy-instance.sh
chmod +x manage-instances.sh
```

### Instance Name Already Exists

**Problem:** Want to reuse an instance name with new configuration

**Solution:**
```bash
# Remove old instance
./manage-instances.sh remove client1

# Deploy with same name
./deploy-instance.sh --name client1 --port 8090
```

---

## Examples

### Example 1: Quick Development Setup

Deploy three instances for development workflow:

```bash
# Development environment
./deploy-instance.sh --name dev --port 8080

# Feature testing
./deploy-instance.sh --name feature-a --port 8081 --quiet

# Production preview
./deploy-instance.sh --name preview --port 8082 --quiet
```

### Example 2: Production Deployment

Deploy production instances with specific IDs:

```bash
# Primary production instance
./deploy-instance.sh \
  --name production \
  --port 9000 \
  --id logic-prod-use1-2024 \
  --quiet

# DR (Disaster Recovery) instance
./deploy-instance.sh \
  --name production-dr \
  --port 9001 \
  --id logic-prod-use1-dr \
  --quiet
```

### Example 3: Client Onboarding

Automated client onboarding script:

```bash
#!/bin/bash
CLIENTS=("acme" "globex" "soylent" "initech")
PORT=8080

for client in "${CLIENTS[@]}"; do
  ./deploy-instance.sh \
    --name "$client" \
    --port "$PORT" \
    --id "logic-client-$client-$(date +%Y%m%d)" \
    --quiet

  PORT=$((PORT + 1))
  sleep 5
done

echo "✅ All clients onboarded"
./manage-instances.sh list
```

### Example 4: Temporary Testing Environment

Create test instances that are easily cleaned up:

```bash
# Deploy test instances
./deploy-instance.sh --name test-1 --port 9000 --quiet
./deploy-instance.sh --name test-2 --port 9001 --quiet

# Run tests...

# Stop all test instances
./manage-instances.sh stop test-1
./manage-instances.sh stop test-2

# Clean up when done
./manage-instances.sh prune
```

### Example 5: Backup Automation

Automated backup script for all instances:

```bash
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Get all running instances
instances=$(docker ps --filter "name=logic-" --format '{{.Names}}')

for instance in $instances; do
  echo "Backing up $instance..."

  # Backup volume
  docker run --rm \
    -v "${instance}-data:/data" \
    -v "$BACKUP_DIR:/backup" \
    alpine tar czf "/backup/${instance}.tar.gz" -C /data .
done

echo "✅ Backups saved to $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
```

### Example 6: Port Management

Find and use the next available port:

```bash
# Find highest port in use
MAX_PORT=$(docker ps --format "{{.Ports}}" | \
  grep -oP '0.0.0.0:\K[0-9]+' | \
  sort -n | \
  tail -1)

# Use next port
NEXT_PORT=$((MAX_PORT + 1))
./deploy-instance.sh --name client1 --port "$NEXT_PORT"
```

### Example 7: Instance Migration

Move an instance to a new port:

```bash
# Stop original instance
./manage-instances.sh stop client1

# Remove original container (keep volume)
docker rm logic-client1

# Deploy on new port with same volume
docker run -d \
  --name logic-client1 \
  -p 9090:3000 \
  -v logic-client1-data:/app/data \
  -e INSTANCE_ID="original-id" \
  -e INSTANCE_NAME="client1" \
  -e EXTERNAL_PORT="9090" \
  --restart unless-stopped \
  logicai-n8n:latest
```

---

## Best Practices

### Naming Conventions

Use consistent, descriptive names:
- `client-{company}`: Client instances
- `env-{environment}`: Environment-specific (dev, staging, prod)
- `test-{feature}`: Temporary test instances
- `region-{code}`: Geographic instances

### Port Allocation

Maintain a port registry:
- `8080-8099`: Development instances
- `9000-9099`: Staging instances
- `9100-9199`: Production instances
- `9200-9299`: Temporary/testing instances

### Resource Management

Monitor resource usage:
```bash
# Real-time stats
docker stats $(docker ps --filter "name=logic-" --format "{{.Names}}")

# Disk usage
docker system df -v | grep logic
```

### Backup Strategy

Implement 3-2-1 backup rule:
- **3** copies of data (original + 2 backups)
- **2** different storage types (local + remote)
- **1** offsite backup (cloud storage)

### Security Considerations

1. **Network Isolation**: Use Docker networks for sensitive instances
2. **Access Control**: Implement reverse proxy with authentication
3. **Volume Encryption**: Encrypt sensitive data at rest
4. **Regular Updates**: Keep Docker images updated
5. **Log Monitoring**: Set up log aggregation and alerting

---

## FAQ

**Q: Can I run instances on different hosts?**

A: Yes. Deploy using the same scripts on each host. For data consistency, use shared storage or replication.

**Q: How many instances can I run?**

A: Limited by host resources. Rough estimate: 2GB RAM and 500MB disk per instance. Monitor with `docker stats`.

**Q: Can instances share data?**

A: Not by design. Each instance has isolated storage. For data sharing, implement external APIs or shared database services.

**Q: Do instances need to use the same port?**

A: No. Each instance uses a unique host port, but all map to port 3000 inside their containers.

**Q: What happens during Docker host restart?**

A: Instances with `restart: unless-stopped` policy automatically restart when Docker starts.

**Q: Can I upgrade instances individually?**

A: Yes. Rebuild the image and restart specific instances:
```bash
docker build -t logicai-n8n:latest .
docker stop logic-client1 && docker rm logic-client1
./deploy-instance.sh --name client1 --port 8080
```

**Q: How do I monitor all instances?**

A: Use Docker monitoring tools or create a monitoring script:
```bash
for instance in $(docker ps --filter "name=logic-" --format "{{.Names}}"); do
  echo "=== $instance ==="
  docker inspect "$instance" --format='{{.State.Status}}'
done
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [N8N Documentation](https://docs.n8n.io/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- Project Repository: [LogicAI-N8N](https://github.com/your-org/LogicAI-N8N)

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker logs <instance-name>`
3. Open an issue on GitHub with:
   - Instance configuration
   - Error messages
   - System information

---

**Last Updated:** 2024-02-10
**Version:** 1.0.0
