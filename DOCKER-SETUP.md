# Daily Grind: Docker Setup Guide

This guide explains how to run the Daily Grind application using Docker, which includes all dependencies like MongoDB and Node.js.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop for Windows/Mac)

## Quick Start for Development

For development with hot reloading of both client and server:

```bash
# Start all services defined in docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up

# To rebuild containers after dependency changes
docker-compose -f docker-compose.dev.yml up --build
```

Access your application at:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000/api>

## Quick Start for Production

For production build/deployment:

```bash
# Start all services defined in docker-compose.yml
docker-compose up -d

# To rebuild containers
docker-compose up -d --build
```

Access your production application at <http://localhost:5000>

## Docker Architecture

This Docker setup consists of:

1. **MongoDB Service**: Database server with persistent storage
2. **App Service (Production)**: Combined frontend and backend in one container
   - React frontend is pre-built for production
   - Express backend serves both the API and static React files

3. **Development Services**:
   - MongoDB: Same as production
   - Server: Express backend with hot reloading
   - Client: React frontend with hot reloading

## Data Persistence

Your data is stored in Docker volumes:

- `mongodb_data`: Database files
- `app_uploads`: Uploaded files (profile images, attachments, etc.)

These volumes persist even if you remove the containers.

## Configuration

Environment variables are defined in the docker-compose files:

- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret key for authentication tokens
- Other app-specific settings

You can modify these in the docker-compose files or create a `.env` file that Docker Compose will use automatically.

## Common Commands

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access MongoDB shell
docker-compose -f docker-compose.dev.yml exec mongodb mongo daily-grind

# Restart a specific service
docker-compose -f docker-compose.dev.yml restart server
```

## Troubleshooting

**MongoDB connection issues**:

- Check if MongoDB container is running: `docker ps`
- Verify connection string in the server logs

**Server not starting**:

- Check server logs: `docker-compose -f docker-compose.dev.yml logs server`

**Client not connecting to backend**:

- Verify REACT_APP_API_URL is set correctly

**Port conflicts**:

- If ports 3000 or 5000 are already in use, modify the port mappings in docker-compose files
