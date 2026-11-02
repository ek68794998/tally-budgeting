"""Generates seed.dev.sql: made-up dev transactions for the last 24 months, relative to today."""

import random
from dataclasses import dataclass
from pathlib import Path

MONTH_COUNT = 24
RANDOM_SEED = 68
OUTPUT_PATH = Path(__file__).with_name("seed.dev.sql")


@dataclass(frozen=True)
class Asset:
    name: str
    asset_type: str
    provider: str | None
    active: bool = True


@dataclass(frozen=True)
class Subcategory:
    label: str
    budget_cents: int
    frequency_months: int
    budget_type: str
    description: str | None = None


@dataclass(frozen=True)
class RecurringMerchant:
    merchant: str
    subcategory: str
    min_cents: int
    max_cents: int
    weight: int


@dataclass(frozen=True)
class Transaction:
    months_ago: int
    day_of_month: int
    merchant: str
    subcategory: str
    amount_cents: int
    direction: str = "debit"
    account_number: int | None = None
    notes: str | None = None
    one_time: bool = False
    happiness: int = 2


ASSETS = [
    Asset("Stark Industries Checking", "liquid_asset", "chase"),
    Asset("Wakanda Savings", "liquid_asset", None),
    Asset("Avengers Rewards Card", "short_term_liability", "apple"),
    Asset("Pym Particle 401k", "fixed_asset", "fidelity", active=False),
]

CHECKING, SAVINGS, CREDIT_CARD = 1, 2, 3

CATEGORIES = {
    "Food": [
        Subcategory("Groceries", 60000, 1, "expense", "Grocery store food and home supplies"),
        Subcategory("Restaurants", 30000, 1, "expense"),
    ],
    "Home": [
        Subcategory("Rent", 240000, 1, "expense", "Apartment or house rental expenses"),
        Subcategory("Utilities", 20000, 1, "expense"),
    ],
    "Transport": [
        Subcategory("Gas", 12000, 1, "expense", "Gas for cars, hover jets, or whatever Stark needs"),
        Subcategory("Subway", 13000, 1, "expense"),
    ],
    "Fun": [
        Subcategory("Entertainment", 15000, 1, "expense", "Movies and events"),
        Subcategory("Shopping", 25000, 1, "expense"),
    ],
    "Income": [
        Subcategory("Paycheck", 450000, 1, "income", "Income from work"),
        Subcategory("Refunds", 0, 1, "neutral"),
    ],
}

NEEDS_HEAVY_CATEGORIES = {"Home", "Food", "Transport"}

RECURRING_MERCHANTS = [
    RecurringMerchant("Delmars Deli-Grocery", "Groceries", 400, 2500, 5),
    RecurringMerchant("Target", "Groceries", 900, 9000, 3),
    RecurringMerchant("Trader Joe's Astoria", "Groceries", 2500, 9500, 3),
    RecurringMerchant("Prachya Thai", "Restaurants", 3000, 8000, 2),
    RecurringMerchant("Coney Island Hot Dogs", "Restaurants", 600, 1800, 2),
    RecurringMerchant("Shake Shack Madison Sq", "Restaurants", 1200, 3200, 2),
    RecurringMerchant("Citi Bike", "Subway", 400, 1900, 2),
    RecurringMerchant("MTA Subway", "Subway", 290, 2900, 3),
    RecurringMerchant("Shell Queens Blvd", "Gas", 3000, 6500, 1),
    RecurringMerchant("Lincoln Memorial Gift Shop", "Shopping", 1500, 9000, 1),
    RecurringMerchant("Apple Services", "Entertainment", 299, 1599, 1),
    RecurringMerchant("Sanctum Sanctorum Tours", "Entertainment", 2500, 7500, 1),
    RecurringMerchant("Stark Expo Tickets", "Entertainment", 4500, 12000, 1),
    RecurringMerchant("Daily Planet Newsstand", "Shopping", 300, 1500, 1),
    RecurringMerchant("Kamar-Taj Yoga", "Entertainment", 2000, 4500, 1),
]

NOTES_POOL = [
    "Split with Pepper",
    "Birthday gift for Bucky",
    "Reimbursable by SHIELD",
    "Late-night run after patrol",
    "Tony's treat, paying him back",
    "Date night with Gwen",
    "Bought in bulk for the team",
    "Price jumped again",
    "Used coupon from Nick Fury",
    "Needed it for the Quinjet",
]

# Weighted towards checking and the credit card; None means no account.
EVERYDAY_ACCOUNT_NUMBERS = [CHECKING, CHECKING, CHECKING, SAVINGS, CREDIT_CARD, CREDIT_CARD, None]

EVERYDAY_PURCHASES_PER_MONTH = 14
NOTE_PROBABILITY = 0.3


def sql_literal(value: str | None) -> str:
    return "NULL" if value is None else "'" + value.replace("'", "''") + "'"


def random_day(first: int = 1, last: int = 28) -> int:
    return random.randint(first, last)


# The order of random calls below determines the generated data; reordering them changes the output.
def generate_month_transactions(months_ago: int) -> list[Transaction]:
    transactions = [
        Transaction(months_ago, 1, "Avengers Mansion Landlord", "Rent", 240000, account_number=CHECKING),
    ]

    utilities_day = random_day(10, 15)
    transactions.append(
        Transaction(months_ago, utilities_day, "ConEd Electric", "Utilities", random.randint(6000, 14000),
                    account_number=CHECKING)
    )

    for payday in (1, 15):
        transactions.append(
            Transaction(months_ago, payday, "Stark Industries Payroll", "Paycheck", random.randint(205000, 225000),
                        "credit", CHECKING, happiness=3)
        )

    weighted_merchants = [merchant for merchant in RECURRING_MERCHANTS for _ in range(merchant.weight)]
    for _ in range(EVERYDAY_PURCHASES_PER_MONTH):
        merchant = random.choice(weighted_merchants)
        notes = random.choice(NOTES_POOL) if random.random() < NOTE_PROBABILITY else None
        day = random_day()
        transactions.append(
            Transaction(months_ago, day, merchant.merchant, merchant.subcategory,
                        random.randint(merchant.min_cents, merchant.max_cents), "debit",
                        random.choice(EVERYDAY_ACCOUNT_NUMBERS), notes, False, random.choice([1, 2, 2, 3]))
        )

    splurge_day = random_day()
    transactions.append(
        Transaction(months_ago, splurge_day,
                    random.choice(["Stark Expo Tickets", "Sanctum Sanctorum Tours", "Lincoln Memorial Gift Shop"]),
                    random.choice(["Entertainment", "Shopping"]), random.randint(15000, 80000), "debit",
                    random.choice([CHECKING, CREDIT_CARD]), random.choice(NOTES_POOL), True, random.choice([1, 3]))
    )

    if random.random() < 0.6:
        day = random_day()
        transactions.append(
            Transaction(months_ago, day, "Avengers Tower Furniture", "Shopping", random.randint(20000, 90000),
                        "debit", CREDIT_CARD, None, True, random.choice([1, 2, 3]))
        )

    if random.random() < 0.4:
        day = random_day()
        transactions.append(
            Transaction(months_ago, day, "Apple.com/us (return)", "Refunds", random.randint(1000, 30000),
                        "credit", CREDIT_CARD, random.choice(NOTES_POOL), False, 2)
        )

    if random.random() < 0.3:
        day = random_day()
        transactions.append(
            Transaction(months_ago, day, "Quinjet Fuel Co", "Gas", random.randint(5000, 9000), "debit", None, None,
                        False, 1)
        )

    if random.random() < 0.25:
        day = random_day()
        transactions.append(
            Transaction(months_ago, day, "Hawkeye Archery Range", "Entertainment", random.randint(2000, 5000),
                        "debit", SAVINGS, None, True, 3)
        )

    return transactions


def asset_insert(asset: Asset) -> str:
    value_cents = random.randint(10000, 9000000)
    if "liab" in asset.asset_type:
        value_cents = -value_cents

    return (
        "INSERT INTO asset (name,type,value_cents,provider,active) VALUES "
        f"({sql_literal(asset.name)},{sql_literal(asset.asset_type)},{value_cents},{sql_literal(asset.provider)},"
        f"{str(asset.active).lower()}) ON CONFLICT (name) DO NOTHING;"
    )


def category_insert(category: str) -> str:
    return f"INSERT INTO category (label) VALUES ({sql_literal(category)}) ON CONFLICT (label) DO NOTHING;"


def subcategory_insert(category: str, subcategory: Subcategory) -> str:
    percent_needs = 50 if category in NEEDS_HEAVY_CATEGORIES else 10
    percent_savings = 20 if subcategory.budget_type == "income" else 0

    return (
        "INSERT INTO subcategory (label,category,description,budget_amount_cents,budget_frequency_months,"
        "budget_type,pct_needs,pct_savings) "
        f"SELECT {sql_literal(subcategory.label)},id,{sql_literal(subcategory.description)},"
        f"{subcategory.budget_cents},{subcategory.frequency_months},{sql_literal(subcategory.budget_type)},"
        f"{percent_needs},{percent_savings} FROM category WHERE label={sql_literal(category)} "
        "ON CONFLICT (label) DO NOTHING;"
    )


def transaction_insert(transaction: Transaction) -> str:
    if transaction.account_number is None:
        account_sql = "NULL"
    else:
        account_name = ASSETS[transaction.account_number - 1].name
        account_sql = f"(SELECT id FROM asset WHERE name={sql_literal(account_name)})"

    month_start = f"(date_trunc('month', current_date) - interval '{transaction.months_ago} months')::date"
    date_sql = (
        f"(LEAST({month_start} + {transaction.day_of_month - 1}, current_date) + time '12:00') AT TIME ZONE 'UTC'"
    )
    subcategory_sql = f"(SELECT id FROM subcategory WHERE label={sql_literal(transaction.subcategory)})"

    return (
        "INSERT INTO txn (merchant,date,account,subcategory,amount_cents,direction,happiness,notes,one_time) VALUES "
        f"({sql_literal(transaction.merchant)},{date_sql},{account_sql},{subcategory_sql},"
        f"{transaction.amount_cents},{sql_literal(transaction.direction)},{transaction.happiness},"
        f"{sql_literal(transaction.notes)},{str(transaction.one_time).lower()});"
    )


def main() -> None:
    random.seed(RANDOM_SEED)

    transactions = [
        transaction
        for months_ago in range(MONTH_COUNT - 1, -1, -1)
        for transaction in generate_month_transactions(months_ago)
    ]

    header = (
        f"-- Dev seed data: ~20 made-up transactions per month for the last {MONTH_COUNT} months, relative to today.\n"
        "-- Generated by seed.py; edit that and regenerate rather than editing this file.\n"
        "-- Run against an empty database; transactions are not deduplicated on re-run."
    )

    statements = [header, "BEGIN;"]
    statements += [asset_insert(asset) for asset in ASSETS]
    for category, subcategories in CATEGORIES.items():
        statements.append(category_insert(category))
        statements += [subcategory_insert(category, subcategory) for subcategory in subcategories]
    statements += [transaction_insert(transaction) for transaction in transactions]
    statements.append("COMMIT;")

    OUTPUT_PATH.write_text("\n".join(statements) + "\n")
    print(f"Wrote {len(transactions)} transactions to {OUTPUT_PATH.name}")


if __name__ == "__main__":
    main()
