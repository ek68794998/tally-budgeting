# Tally Budgeting

A self-hosted budgeting application for privacy-conscious individuals who want to manage their finances manually while enjoying a beautiful, comprehensive dashboard.

## Features

- **Transaction Management**: Import transactions via CSV from supported institutions or add them manually
- **Transaction History**: View and search through your complete transaction history
- **Budget Tracking**: Set budgets and monitor your spending against them
- **Spending Analysis**: Visualize your overall spending patterns and breakdowns
- **Asset Tracking**: Keep track of your assets over time
- **Net Worth Tracking**: Monitor your net worth as it changes
- **Retirement Calculator**: Analyze and plan for your financial future

## Screenshots

_Coming soon_

## Prerequisites

- Node.js 20 or higher
- PNPM 10 or higher
- Docker (for database and deployment)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:ek68794998/tally-budgeting.git
cd tally-budgeting
```

2. Install dependencies:
```bash
pnpm install
```

3. Create your local environment file from the template, and set `POSTGRES_CONNECTION_STRING` (see [Environment Variables](#environment-variables)):
```bash
cp apps/web/.env.default apps/web/.env.development.local
```

4. Start the development database:
```bash
pnpm dev:db:up
```

5. Start the development server:
```bash
pnpm dev
```

## Development

### Database

The development database runs in Docker. Use these commands to manage it:

- `pnpm dev:db:up` - Start the database in detached mode
- `pnpm dev:db` - Start the database with logs
- `pnpm dev:db:down` - Stop and remove the database container

### Testing

- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Open the Vitest UI
- `pnpm test:coverage` - Generate coverage report

### Code Quality

- `pnpm lint` - Run ESLint and Biome checks
- `pnpm fix:biome` - Auto-fix Biome formatting issues
- `pnpm check-types` - Type check all packages

## Deployment

Docker is the recommended deployment method for both the application and PostgreSQL database.

### Building the Docker Image

```bash
pnpm docker:build
```

This builds the application image for `linux/amd64` and saves it to `tally-budgeting.tar`.

### Running with Docker Compose

Before starting, create `deployment/.env` and set a database password:

```bash
echo "DB_PASSWORD=<choose-a-strong-password>" > deployment/.env
```

Then:

```bash
# Start all services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop all services
pnpm docker:down
```

The Docker Compose configuration includes both the application and PostgreSQL database. The app is served on port `7856`.

## Configuration

### Environment Variables

The web app reads the following variables. For local development, set them in `apps/web/.env.development.local` (copied from `apps/web/.env.default`). With Docker Compose, the app's variables are set for you in `deployment/docker-compose.yml`.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `POSTGRES_CONNECTION_STRING` | Yes | — | PostgreSQL connection string. For the development database, use `postgresql://tally:tally_dev_password@localhost:5432/tally`. |
| `POSTGRES_POOL_MAXIMUM` | No | `10` | Maximum number of pooled database connections. |
| `LOG_LEVEL` | No | `info` | Backend log level: `error`, `warn`, `info`, `http`, or `debug`. |

Docker Compose itself reads one variable from `deployment/.env`:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DB_PASSWORD` | Yes (production) | `tally_dev_password` (development database only) | Password for the `tally` PostgreSQL user. |

### Authentication

_TBD_

## CSV Import

Tally supports importing transactions from CSV files. The format requirements vary by institution.

_Detailed CSV format documentation coming soon._

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Package Manager**: PNPM
- **UI Components**: HeroUI
- **Icons**: Tabler Icons
- **Date/Time**: Luxon
- **Testing**: Vitest, @testing-library/react
- **Code Quality**: ESLint, Biome
- **Database**: PostgreSQL
- **Deployment**: Docker

## Contributing

This is primarily a personal project with minimal ongoing support. If you find a bug or want to add a feature, you're welcome to fork the repository or open a pull request. However, please note that there's no guarantee of specific changes being implemented or questions being answered.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Privacy

Tally is designed with privacy in mind. All data is stored locally on your own infrastructure—nothing is sent to external services or third parties.

---

**Note**: This is v1 of Tally, released as open-source for self-hosting. The codebase is under active development, and some features may change.
