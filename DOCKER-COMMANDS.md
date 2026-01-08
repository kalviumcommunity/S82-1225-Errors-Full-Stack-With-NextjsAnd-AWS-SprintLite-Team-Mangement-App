# Quick Docker Commands Reference

## First Time Setup

```bash
# 1. Create .env file for Docker Compose
DB_PASSWORD=your_secure_password_here

# 2. Build and start all services
docker-compose up -d

# 3. Run database migrations
docker-compose exec app npm run db:push

# 4. Check everything is running
docker-compose ps
```

## Daily Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app        # App logs only
docker-compose logs -f            # All services

# Stop services
docker-compose down

# Restart app after code changes
docker-compose restart app

# Rebuild after dependency changes
docker-compose up -d --build
```

## Database Management

```bash
# Access Prisma Studio
docker-compose exec app npm run db:studio

# Run migrations
docker-compose exec app npm run db:migrate

# Reset database (CAUTION: deletes all data)
docker-compose down -v
docker-compose up -d
docker-compose exec app npm run db:push
```

## Troubleshooting

```bash
# Check if containers are running
docker-compose ps

# View container logs
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# Access app container shell
docker-compose exec app sh

# Access PostgreSQL
docker-compose exec postgres psql -U sprintlite -d sprintlite

# Check Redis
docker-compose exec redis redis-cli ping
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers AND volumes (deletes data)
docker-compose down -v

# Remove Docker images
docker-compose down --rmi all
```

## Production Build

```bash
# Build production image
docker build -t sprintlite:latest .

# Run production container
docker run -p 3000:3000 \
  -e DATABASE_URL=your_db_url \
  -e NODE_ENV=production \
  sprintlite:latest
```

## Docker System Cleanup (Free Space)

```bash
# Remove unused images
docker image prune

# Remove unused containers
docker container prune

# Remove everything unused
docker system prune -a
```
