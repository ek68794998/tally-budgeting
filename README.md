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
- PNPM 9 or higher
- Docker (recommended for deployment)

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

3. Start the development server:
```bash
pnpm dev
```

Once the server is running, it can be opened in a web browser by navigating to [localhost:7855](http://localhost:7855).

## Deployment

Docker is the recommended deployment method for both the application and PostgreSQL database.

_Detailed deployment instructions coming soon._

## Configuration

### Environment Variables

_TBD_

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
- **Testing**: Vitest
- **Code Quality**: ESLint, Biome
- **Database**: PostgreSQL _(in progress)_

## Contributing

This is primarily a personal project with minimal ongoing support. If you find a bug or want to add a feature, you're welcome to fork the repository or open a pull request. However, please note that there's no guarantee of specific changes being implemented or questions being answered.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Privacy

Tally is designed with privacy in mind. All data is stored locally on your own infrastructure—nothing is sent to external services or third parties.

---

**Note**: This is v1 of Tally, released as open-source for self-hosting. The codebase is under active development, and some features may change.
