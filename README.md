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

- Node.js 22 or higher
- PNPM 11 (the exact version is pinned in `packageManager` in `package.json`; run `corepack enable` to use it automatically)
- Docker (for database and deployment)
- PostgreSQL 16 client tools (`pg_dump` and `pg_restore`), only for using database backup and restore during local development (see [Backup and Restore Tools](#backup-and-restore-tools))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ek68794998/tally-budgeting.git
cd tally-budgeting
```

2. Install dependencies:
```bash
pnpm install
```

3. Create your local environment file from the template, and set `APP_PASSWORD` and `POSTGRES_CONNECTION_STRING` (see [Environment Variables](#environment-variables)):
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
- `pnpm dev:db:down` - Stop and remove the database container (your data is kept in the `postgres_data` volume)

The development database uses `deployment/docker-compose.dev.yml`, which is separate from the production compose file and needs no `deployment/.env`. Its password is `tally_dev_password`, unless `DB_PASSWORD` is set in your shell or in `deployment/.env`. The password only applies when the database is first created, so changing it later has no effect on an existing volume.

### Backup and Restore Tools

The **Data** section of the Settings page downloads backups with `pg_dump` and restores them with `pg_restore`. The Docker image includes these, but in local development the app runs them from your `PATH`, so you need to install them yourself. Use the PostgreSQL 16 client tools to match the development database: an older `pg_dump` refuses to back up a newer server.

- **macOS (Homebrew):** `brew install libpq`, then add it to your `PATH` (`brew info libpq` shows the path), since it isn't linked automatically
- **Debian/Ubuntu:** `sudo apt install postgresql-client-16` (you may need to add the [PostgreSQL apt repository](https://www.postgresql.org/download/linux/ubuntu/) first)
- **Windows:** install the command line tools from the [PostgreSQL installer](https://www.postgresql.org/download/windows/) and add its `bin` folder to your `PATH`

Check your installation with `pg_dump --version` and `pg_restore --version`. The tools connect using `POSTGRES_CONNECTION_STRING`, so they need no further setup. Without them, the app works normally, but backup and restore show an error.

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

Docker Compose is the recommended way to deploy both the application and its PostgreSQL database. `deployment/docker-compose.yml` defines the deployment.

### Running with Docker Compose

Before starting, create `deployment/.env` with a database password and an app password. Compose refuses to start if either is missing.

```bash
cat > deployment/.env <<'EOF'
DB_PASSWORD=<choose-a-strong-database-password>
APP_PASSWORD=<choose-a-strong-app-password>
EOF
```

Then:

```bash
# Build the image (on first run) and start all services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop all services
pnpm docker:down
```

The Docker Compose configuration includes both the application and PostgreSQL database. The app is served on port `7856`. Compose builds the image from source the first time; after pulling new code, run `docker compose -f deployment/docker-compose.yml up -d --build` to rebuild it.

### Building a Standalone Image

```bash
pnpm docker:build
```

This builds the application image for `linux/amd64`, tags it `tally-budgeting`, and saves it to `tally-budgeting.tar`. It is mainly used to check that the image builds, and is not needed to deploy with Docker Compose. You can also use it to build on one machine and run on another: copy the archive over and load it with `docker load -i tally-budgeting.tar`.

## Configuration

### Environment Variables

The web app reads the following variables. For local development, set them in `apps/web/.env.development.local` (copied from `apps/web/.env.default`).

With Docker Compose, `deployment/docker-compose.yml` sets the app's variables. It builds `POSTGRES_CONNECTION_STRING` from `DB_PASSWORD` and passes `APP_PASSWORD` through; every other variable uses its default. To change one, such as `LOG_LEVEL`, add it to the `web` service's `environment` in the compose file.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `POSTGRES_CONNECTION_STRING` | Yes | — | PostgreSQL connection string. For the development database, use `postgresql://tally:tally_dev_password@localhost:5432/tally`. |
| `POSTGRES_POOL_MAXIMUM` | No | `10` | Maximum number of pooled database connections. |
| `LOG_LEVEL` | No | `info` | Backend log level: `error`, `warn`, `info`, `http`, or `debug`. |
| `APP_PASSWORD` | Yes (unless `APP_PASSWORD_FILE` or `DANGEROUSLY_DISABLE_AUTH` is set) | — | Shared password required to use the app. |
| `APP_PASSWORD_FILE` | No | — | Path to a file containing the password (whitespace is trimmed). Set this instead of `APP_PASSWORD`, not both. |
| `DANGEROUSLY_DISABLE_AUTH` | No | — | Set to `1` to disable authentication entirely. |

Docker Compose itself reads these variables from `deployment/.env`:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DB_PASSWORD` | Yes (production) | `tally_dev_password` (development database only) | Password for the `tally` PostgreSQL user. `pnpm docker:up` fails if it is unset. |
| `APP_PASSWORD` | Yes (production) | — | Shared app password, passed through to the web container. `pnpm docker:up` fails if it is unset. |

### Authentication

Tally is protected by a single shared password, and the app refuses to start without one.

- **Set the password:** put `APP_PASSWORD=...` in `deployment/.env` (or `apps/web/.env.development.local` for development). To keep it out of the environment, set `APP_PASSWORD_FILE` to a file (for example a Docker secret) containing the password. Set only one of the two. The bundled compose file requires `APP_PASSWORD`, so to use `APP_PASSWORD_FILE` (or `DANGEROUSLY_DISABLE_AUTH`) with Docker Compose, replace the `APP_PASSWORD` line in the `web` service's `environment`.
- **Over plain HTTP, the password and session cookie travel in cleartext.** Put Tally behind an HTTPS reverse proxy such as Caddy or Traefik; the cookie's `Secure` flag is set automatically when the proxy sends `X-Forwarded-Proto: https`.
- **It is a single shared credential:** there are no per-user accounts and no per-user audit trail.
- **Changing the password logs out all sessions.**
- **Using your own auth proxy:** set `DANGEROUSLY_DISABLE_AUTH=1` to turn off Tally's login. Anyone who can reach the app can then read and modify all data, so only do this when something else in front of it enforces authentication.

## Database Migrations

The schema is managed by Kysely migrations in `apps/web/app/storage/migrations/`, applied automatically when the app starts. To add one, create `000N_<name>.ts` exporting a `Migration` (typed against `Kysely<unknown>`) and append it to `migrationEntries` in `migrationProvider.ts`.

## CSV Import

Tally supports importing transactions from CSV files. The format requirements vary by institution.

Supported institutions:

- Apple Wallet
- Chase Bank
- Fidelity Investments
- First Tech FCU
- Guideline
- Rippling
- Robinhood
- Vestwell

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

**Note**: This is an early version of Tally, released as open-source for self-hosting. The codebase is under active development, and some features may change.
