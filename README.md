<div align="center">

<img src="apps/web/public/android-chrome-192x192.png" alt="Tally logo" width="128" height="128" />

# Tally Budgeting

**A self-hosted budgeting app for privacy-conscious people who want to manage their finances manually, with a beautiful, comprehensive dashboard.**

[![Last commit](https://img.shields.io/github/last-commit/ek68794998/tally-budgeting)](https://github.com/ek68794998/tally-budgeting/commits/main)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

[Features](#features) · [Installation](#installation) · [Configuration](#configuration) · [CSV Import](#csv-import) · [Development](#development)

</div>

---

## Features

| | Feature | Description |
| --- | --- | --- |
| 📥 | **Transaction Management** | Import transactions via CSV from supported institutions or add them manually |
| 🔎 | **Transaction History** | View and search through your complete transaction history |
| 🎯 | **Budget Tracking** | Set budgets and monitor your spending against them |
| 📊 | **Spending Analysis** | Visualize your overall spending patterns and breakdowns |
| 🏦 | **Asset Tracking** | Keep track of your assets over time |
| 📈 | **Net Worth Tracking** | Monitor your net worth as it changes |
| 🏖️ | **Retirement Calculator** | Analyze and plan for your financial future |

## Screenshots

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/budget.png" alt="Budget page with spending pulse, overview alerts, and category breakdown" />
      <br />
      <em>Budget: view historic trends, and see categories where you're under- or overspending</em>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/categories.png" alt="Categories page listing budget categories and their subcategories" />
      <br />
      <em>Categories: organize spending into categories and subcategories with monthly budgets</em>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/retirement.png" alt="Retirement calculator with inputs, cumulative savings chart, and yearly table" />
      <br />
      <em>Retirement: project your savings year by year with adjustable assumptions</em>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/settings.png" alt="Settings page showing the nine available providers enabled" />
      <br />
      <em>Settings: configure theme, provider visibility, and database operations</em>
    </td>
  </tr>
</table>

## Installation

Tally runs as two Docker containers, the app and its PostgreSQL database, managed by Docker Compose. Once started, they run in the background and restart automatically after a crash or reboot.

### Requirements

- [Docker](https://docs.docker.com/get-docker/) with the Compose plugin (`docker compose version` should work)
- Git

Node.js and PNPM are not needed; the image is built inside Docker.

### Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/ek68794998/tally-budgeting.git
   cd tally-budgeting/deployment
   ```

2. Create `deployment/.env` with a database password and an app password (the password you'll use to log in). Compose refuses to start if either is missing.

   ```bash
   cat > .env <<'ENV'
   DB_PASSWORD=<choose-a-strong-database-password>
   APP_PASSWORD=<choose-a-strong-app-password>
   ENV
   ```

3. Build the image and start Tally in the background:

   ```bash
   docker compose up -d
   ```

   The first run builds the image from source, which takes a few minutes.

4. Open [http://localhost:7856](http://localhost:7856) and log in with your `APP_PASSWORD`.

> [!WARNING]
> If you access Tally from other devices, put it behind an HTTPS reverse proxy. Over plain HTTP, the password and session cookie travel in cleartext (see [Authentication](#authentication)).

### Running in the Background

Both containers use `restart: unless-stopped`, so they come back up automatically after a crash or a reboot, as long as Docker itself starts on boot:

- **Linux:** `sudo systemctl enable docker`
- **macOS/Windows:** enable **Start Docker Desktop when you sign in** in Docker Desktop's settings

To change the port, edit the `7856:3000` mapping under the `web` service in `deployment/docker-compose.yml`.

### Managing Tally

Run these from the `deployment` directory:

| Command | Description |
| --- | --- |
| `docker compose ps` | Show whether the containers are running |
| `docker compose logs -f` | Follow the logs |
| `docker compose down` | Stop Tally (your data is kept) |
| `docker compose up -d` | Start Tally again |

### Updating

Pull the latest code and rebuild the image. Database migrations are applied automatically when the app starts.

```bash
git pull
docker compose up -d --build
```

### Your Data

Your data lives in the `postgres_data` Docker volume, so it survives stopping, rebuilding, and updating the containers.

> [!CAUTION]
> `docker compose down -v` deletes the volume and **all of your data**. Don't use `-v` unless you mean to start over.

To back up and restore your data, use the **Data** section of the Settings page.

### Running on Another Machine

To run Tally on a machine without the source code (for example, a home server), build the image on a machine that has the repository, then copy it over.

1. From the repository root, build the image and save it to an archive:

   ```bash
   pnpm docker:build                # builds for linux/amd64 (most servers)
   pnpm docker:build linux/arm64    # builds for Apple Silicon Macs and ARM servers
   ```

   The archive is saved to `tally-budgeting.tar`. Pass the platform of the machine that will run Tally; `docker info --format '{{.Architecture}}'` on that machine shows it (`x86_64` is `linux/amd64`, `aarch64` is `linux/arm64`).

2. Copy `tally-budgeting.tar` and `deployment/docker-compose.yml` to a folder on the other machine, and create a `.env` next to them as in the [Quick Start](#quick-start).

3. In the copied `docker-compose.yml`, replace the entire `build` block of the `web` service with `image: tally-budgeting`. Without the source code, a leftover `build` block makes Compose fail with an error like `lstat .../apps: no such file or directory`.

   ```yaml
   services:
     web:
       image: tally-budgeting
       environment:
         # ...unchanged
   ```

4. Load the image and start Tally:

   ```bash
   docker load -i tally-budgeting.tar
   docker compose up -d
   ```

## Configuration

### Environment Variables

The web app reads the following variables. With Docker Compose, `deployment/docker-compose.yml` sets the app's variables. It builds `POSTGRES_CONNECTION_STRING` from `DB_PASSWORD` and passes `APP_PASSWORD` through; every other variable uses its default. To change one, such as `LOG_LEVEL`, add it to the `web` service's `environment` in the compose file. For local development, set these variables in `apps/web/.env.development.local` (copied from `apps/web/.env.default`).

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
| `DB_PASSWORD` | Yes (production) | `tally_dev_password` (development database only) | Password for the `tally` PostgreSQL user. Compose refuses to start if it is unset. |
| `APP_PASSWORD` | Yes (production) | — | Shared app password, passed through to the web container. Compose refuses to start if it is unset. |

### Authentication

Tally is protected by a single shared password, and the app refuses to start without one.

- **Set the password:** put `APP_PASSWORD=...` in `deployment/.env` (or `apps/web/.env.development.local` for development). To keep it out of the environment, set `APP_PASSWORD_FILE` to a file (for example a Docker secret) containing the password. Set only one of the two. The bundled compose file requires `APP_PASSWORD`, so to use `APP_PASSWORD_FILE` (or `DANGEROUSLY_DISABLE_AUTH`) with Docker Compose, replace the `APP_PASSWORD` line in the `web` service's `environment`.
- **It is a single shared credential:** there are no per-user accounts and no per-user audit trail.
- **Changing the password logs out all sessions.**
- **Using your own auth proxy:** set `DANGEROUSLY_DISABLE_AUTH=1` to turn off Tally's login. Anyone who can reach the app can then read and modify all data, so only do this when something else in front of it enforces authentication.

> [!WARNING]
> **Over plain HTTP, the password and session cookie travel in cleartext.** Put Tally behind an HTTPS reverse proxy such as Caddy or Traefik; the cookie's `Secure` flag is set automatically when the proxy sends `X-Forwarded-Proto: https`.

## CSV Import

Tally imports transactions from the CSV files that each institution exports. Upload the file as downloaded, without editing it; Tally recognizes each institution's columns and skips extra rows such as notes or summaries.

Sample files showing the expected format for each institution are in [`packages/utilities/src/dataProviders/__mocks__`](packages/utilities/src/dataProviders/__mocks__). The samples contain made-up data.

| Institution | Sample file(s) |
| --- | --- |
| Apple Wallet | `appleCardStatementMock.csv` |
| Chase Bank | `chaseStatementMock.csv` |
| Fidelity Investments | `fidelityInvestmentsStatementMock.csv` (brokerage), `fidelityHsaStatementMock.csv` (HSA), `fidelityRetirementStatementMock.csv` (retirement) |
| First Tech Federal Credit Union | `firstTechStatementMock.csv` |
| Guideline | `guidelineStatementMock.csv` |
| Rippling | `ripplingStatementMock.csv` |
| Robinhood | `robinhoodCardStatementMock.csv` (credit card), `robinhoodInvestmentsStatementMock.csv` (investments) |
| Vestwell | None yet. Expected columns: `Trade Date`, `Settlement Date`, `Transaction Type`, `Dollars`, `Funding Source`, `Contribution Year` |

## Development

This section is for working on Tally itself. To just run it, see [Installation](#installation).

### Prerequisites

- Node.js 22 or higher
- PNPM 11 (the exact version is pinned in `packageManager` in `package.json`; run `corepack enable` to use it automatically)
- Docker (for the development database)
- PostgreSQL 16 client tools (`pg_dump` and `pg_restore`), only for using database backup and restore during local development (see [Backup and Restore Tools](#backup-and-restore-tools))

### Setup

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

### Database

The development database runs in Docker. Use these commands to manage it:

| Command | Description |
| --- | --- |
| `pnpm dev:db:up` | Start the database in detached mode |
| `pnpm dev:db` | Start the database with logs |
| `pnpm dev:db:down` | Stop and remove the database container (your data is kept in the `postgres_data` volume) |

The development database uses `deployment/docker-compose.dev.yml`, which is separate from the production compose file and needs no `deployment/.env`. Its password is `tally_dev_password`, unless `DB_PASSWORD` is set in your shell or in `deployment/.env`. The password only applies when the database is first created, so changing it later has no effect on an existing volume.

### Backup and Restore Tools

The **Data** section of the Settings page downloads backups with `pg_dump` and restores them with `pg_restore`. The Docker image includes these, but in local development the app runs them from your `PATH`, so you need to install them yourself. Use the PostgreSQL 16 client tools to match the development database: an older `pg_dump` refuses to back up a newer server.

- **macOS (Homebrew):** `brew install libpq@16`, then add it to your `PATH` (`brew info libpq` shows the path), since it isn't linked automatically
- **Debian/Ubuntu:** `sudo apt install postgresql-client-16` (you may need to add the [PostgreSQL apt repository](https://www.postgresql.org/download/linux/ubuntu/) first)
- **Windows:** install the command line tools from the [PostgreSQL installer](https://www.postgresql.org/download/windows/) and add its `bin` folder to your `PATH`

Check your installation with `pg_dump --version` and `pg_restore --version`. The tools connect using `POSTGRES_CONNECTION_STRING`, so they need no further setup. Without them, the app works normally, but backup and restore show an error.

### Testing & Code Quality

| Command | Description |
| --- | --- |
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:ui` | Open the Vitest UI |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm lint` | Run ESLint and Biome checks |
| `pnpm fix:biome` | Auto-fix Biome formatting issues |
| `pnpm check-types` | Type check all packages |

### Docker Shortcuts

From the repository root, these scripts wrap Docker Compose for the production setup in `deployment/docker-compose.yml`:

| Command | Description |
| --- | --- |
| `pnpm docker:up` | Build (on first run) and start all services in the background |
| `pnpm docker:logs` | Follow the logs |
| `pnpm docker:down` | Stop all services |
| `pnpm docker:build [platform]` | Build the standalone image archive, for `linux/amd64` unless a platform is given (see [Running on Another Machine](#running-on-another-machine)) |

### Database Migrations

The schema is managed by Kysely migrations in `apps/web/app/storage/migrations/`, applied automatically when the app starts. To add one, create `000N_<name>.ts` exporting a `Migration` (typed against `Kysely<unknown>`) and append it to `migrationEntries` in `migrationProvider.ts`.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js |
| Language | TypeScript |
| Package Manager | PNPM, Turborepo |
| UI Components | HeroUI |
| Icons | Tabler Icons |
| Date/Time | Luxon |
| Testing | Vitest, @testing-library/react |
| Code Quality | ESLint, Biome |
| Database | PostgreSQL, Kysely |
| Deployment | Docker |

## Contributing

This is primarily a personal project with minimal ongoing support. If you find a bug or want to add a feature, you're welcome to fork the repository or open a pull request. However, please note that there's no guarantee of specific changes being implemented or questions being answered.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Privacy

🔒 Tally is designed with privacy in mind. All data is stored locally on your own infrastructure—nothing is sent to external services or third parties.

> [!NOTE]
> This is an early version of Tally, released as open-source for self-hosting. The codebase is under active development, and some features may change.
