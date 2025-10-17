# EA Trading Dashboard

Real-time trading dashboard that receives data from MT4 via API, stores it in PostgreSQL, and provides live updates through Redis and Server-Sent Events (SSE).

## Architecture

```
MT4 → POST /api/trades → PostgreSQL + Redis → Dashboard (SSE) → Real-time UI
```

## Features

- **Real-time Updates**: Live dashboard updates without page refresh
- **Multi-Account Support**: Track multiple trading accounts
- **Historical Data**: View trading history and statistics
- **Docker Ready**: Complete containerized setup

## Database Structure

- **accounts**: Store account information (acc_number, balance, equity, email)
- **history**: Daily trading records (current open + history closed trades)

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- For local development: Node.js 18+ and npm

### 1. Production Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ea-dashboard

# Start all services (PostgreSQL, Redis, Next.js app)
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Development Setup

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Or run locally (requires local PostgreSQL and Redis)
yarn install
yarn dev
```

**Note**: On Apple Silicon (M1/M2) Macs, the services use `platform: linux/amd64` for compatibility.

### 2. Access the Dashboard

- **Dashboard**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (user: postgres, password: yourpassword)
- **Redis**: localhost:6379

### 3. Test the API

Send test data to the API:

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "acc_number": 123456,
    "date": "2025-10-14",
    "balance": 10000.00,
    "equity": 10500.50,
    "current": {
      "total_trade": 5,
      "profit": 500.50,
      "lot": 1.50,
      "order_buy_count": 3,
      "order_sell_count": 2
    },
    "history": {
      "total_trade": 10,
      "profit": -200.00,
      "lot": 3.00,
      "order_buy_count": 6,
      "order_sell_count": 4,
      "win": 7,
      "loss": 3
    }
  }'
```

## Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start PostgreSQL and Redis locally
# Update DATABASE_URL and REDIS_URL in .env.local

# Run development server
npm run dev
```

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/trading
REDIS_URL=redis://localhost:6379
MT4_API_KEY=your-secret-key-here
NODE_ENV=production
```

## API Endpoints

### POST /api/trades

Receive trading data from MT4

### GET /api/trading/accounts

Get all trading accounts

### GET /api/trading/history

Get trading history with optional filters:

- `acc_number`: Filter by account number
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `limit`: Number of records (default: 30)

### GET /api/trading/stats

Get overall trading statistics

### GET /api/trading/stream

Server-Sent Events stream for real-time updates

## Docker Commands

### Production

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Development

```bash
# Start development services with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

### Database Reset

```bash
# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d
```

**Note**: The Docker setup uses npm for package management. Development mode mounts your local files for hot reload.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready -U postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d trading
```

### Redis Connection Issues

```bash
# Check Redis
docker-compose exec redis redis-cli ping
```

### Application Logs

```bash
# View Next.js app logs
docker-compose logs nextjs

# View all services logs
docker-compose logs
```

## Production Deployment

1. Update environment variables in `docker-compose.yml`
2. Change default passwords
3. Set up proper SSL/TLS
4. Configure firewall rules
5. Set up monitoring and backups

## License

MIT
