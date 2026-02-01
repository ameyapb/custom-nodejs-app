# Node App

A structured Express.js application with PostgreSQL integration.

## Project Structure

```
src/
├── index.js              # App entry point
├── config/               # Environment and constants
├── routes/               # Route handlers
├── middleware/           # Custom middleware
├── controllers/          # Business logic
├── models/               # Data models
├── services/             # Business services
├── utils/                # Utilities and helpers
├── db/                   # Database connection and queries
└── validators/           # Input validation
tests/                    # Test files
```

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
DB_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Running the App

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

### Linting

```bash
npm run lint
```

## API Endpoints

- `GET /health` - Basic health check with uptime
- `GET /serviceHealth` - Database connectivity check

## License

ISC
