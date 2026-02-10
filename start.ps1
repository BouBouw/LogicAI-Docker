# LogicAI-N8N Quick Setup Script for Windows
# This script automates the configuration and startup of the application

Write-Host '====================================' -ForegroundColor Cyan
Write-Host 'LogicAI-N8N - Quick Setup' -ForegroundColor Cyan
Write-Host '====================================' -ForegroundColor Cyan
Write-Host ''

# Check if Docker is installed
Write-Host 'Checking Docker...' -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "OK $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host 'ERROR: Docker is not installed or not in PATH' -ForegroundColor Red
    Write-Host 'Please install Docker Desktop: https://www.docker.com/products/docker-desktop' -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

# Check if Docker Compose is available
Write-Host 'Checking Docker Compose...' -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "OK $composeVersion" -ForegroundColor Green
} catch {
    Write-Host 'ERROR: Docker Compose is not available' -ForegroundColor Red
    Read-Host 'Press Enter to exit'
    exit 1
}

Write-Host ''

# Create .env file if it doesn't exist
if (-not (Test-Path '.env')) {
    Write-Host 'Configuring environment variables...' -ForegroundColor Yellow

    # Generate random encryption key (64 hex characters)
    $bytes = New-Object byte[] 32
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    $encryptionKey = [BitConverter]::ToString($bytes).Replace('-','').ToLower()

    # Create .env file
    @"
ENCRYPTION_KEY="$encryptionKey"
CORS_ORIGIN="http://localhost"
"@ | Out-File -FilePath '.env' -Encoding UTF8

    Write-Host 'OK: .env file created with secure encryption key' -ForegroundColor Green
    Write-Host ''
} else {
    Write-Host 'OK: .env file already exists' -ForegroundColor Green
    Write-Host ''
}

# Create data folder if it doesn't exist
if (-not (Test-Path 'data')) {
    Write-Host 'Creating data folder...' -ForegroundColor Yellow
    New-Item -ItemType Directory -Path 'data' -Force | Out-Null
    Write-Host 'OK: data folder created' -ForegroundColor Green
    Write-Host ''
}

# Build Docker images
Write-Host 'Building Docker images (this may take a few minutes)...' -ForegroundColor Yellow
Write-Host '-> Backend + Frontend' -ForegroundColor Cyan
$buildResult = docker-compose build 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host 'ERROR: Failed to build images' -ForegroundColor Red
    Write-Host $buildResult
    Read-Host 'Press Enter to exit'
    exit 1
}

Write-Host 'OK: Images built successfully' -ForegroundColor Green
Write-Host ''

# Start containers
Write-Host 'Starting LogicAI-N8N...' -ForegroundColor Yellow
$upResult = docker-compose up -d 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host 'ERROR: Failed to start' -ForegroundColor Red
    Write-Host $upResult

    # Check if it's a port issue
    if ($upResult -match 'port.*already.*allocated' -or $upResult -match ' Ports are not available') {
        Write-Host ''
        Write-Host 'WARNING: Ports 5174 or 3001 are already in use' -ForegroundColor Yellow
        Write-Host 'Please stop services using these ports:' -ForegroundColor Yellow
        Write-Host '  - Port 5174: Another web server or development server' -ForegroundColor White
        Write-Host '  - Port 3001: Another LogicAI-N8N instance' -ForegroundColor White
        Write-Host ''
        Write-Host 'Or modify ports in docker-compose.yml' -ForegroundColor Yellow
    }

    Read-Host 'Press Enter to exit'
    exit 1
}

Write-Host 'OK: LogicAI-N8N started successfully' -ForegroundColor Green
Write-Host ''

# Wait a few seconds for services to start
Write-Host 'Initializing services...' -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check container status
Write-Host 'Service status:' -ForegroundColor Yellow
$status = docker-compose ps
Write-Host $status
Write-Host ''

# Display access information
Write-Host '====================================' -ForegroundColor Cyan
Write-Host 'LogicAI-N8N is ready!' -ForegroundColor Green
Write-Host '====================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Web Interface:' -ForegroundColor White
Write-Host '   http://localhost:5174' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Backend API:' -ForegroundColor White
Write-Host '   http://localhost:3001' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Documentation:' -ForegroundColor White
Write-Host '   See DOCKER_SETUP.md for more information' -ForegroundColor Gray
Write-Host ''
Write-Host 'Useful commands:' -ForegroundColor White
Write-Host '   View logs: docker-compose logs -f' -ForegroundColor Gray
Write-Host '   Stop:      docker-compose down' -ForegroundColor Gray
Write-Host '   Restart:   docker-compose restart' -ForegroundColor Gray
Write-Host ''

# Ask if user wants to open browser
$openBrowser = Read-Host 'Open web browser? (Y/n)'
if ($openBrowser -ne 'n' -and $openBrowser -ne 'N') {
    Start-Process 'http://localhost:5174'
}

Write-Host ''
Write-Host 'Press Enter to exit...' -ForegroundColor Gray
Read-Host
