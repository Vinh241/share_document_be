# Bookstore API

A RESTful API for a bookstore application built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- User authentication and authorization
- Product catalog with categories, authors, and publishers
- Shopping cart management
- Order processing
- Product reviews
- Admin dashboard for managing products, orders, and users

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example`
4. Start the development server:
   ```
   npm run dev
   ```

### Using Docker

```
# Start development environment
npm run docker:dev

# Start production environment
npm run docker:prod

# Build Docker images
npm run docker:build

# Stop containers
npm run docker:down
```

## Database Management

### Backup the database

```
# Full backup
npm run db:backup

# Data only backup
npm run db:backup:data
```

### Restore a backup

```
# Replace backup_file.sql with your backup file
docker-compose exec postgres psql -U postgres bookstore -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" && docker-compose exec -T postgres psql -U postgres bookstore < ./backups/backup_file.sql
```