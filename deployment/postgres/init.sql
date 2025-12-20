BEGIN;

-- NOTES:
-- * "txn" used for transaction table name to avoid reserved keyword.

CREATE TYPE asset_type AS ENUM (
	'fixed_asset',           -- 0
	'liquid_asset',          -- 1
	'personal_asset',        -- 2
	'long_term_liability',   -- 3
	'short_term_liability'   -- 4
);

CREATE TYPE budget_type AS ENUM (
	'neutral',   -- 0
	'income',    -- 1
	'expense'    -- 2
);

CREATE TYPE txn_direction AS ENUM (
	'debit',   -- 0
	'credit'   -- 1
);

CREATE TABLE IF NOT EXISTS asset (
	id SERIAL PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	type asset_type,
	value BIGINT,  -- Monetary value in cents
	provider TEXT,
	active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS category (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

INSERT INTO category (id, label) VALUES (-1, 'Uncategorized');

CREATE TABLE IF NOT EXISTS subcategory (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE,
	category INTEGER NOT NULL,
	description TEXT,
	budget_amount_cents BIGINT NOT NULL DEFAULT 0,
	budget_frequency_months INTEGER NOT NULL DEFAULT 12,
	budget_type budget_type NOT NULL DEFAULT 'expense',
	FOREIGN KEY (category) REFERENCES category(id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE
);

INSERT INTO subcategory (id, label, category) VALUES (-1, 'Uncategorized', -1);

CREATE TABLE IF NOT EXISTS txn (
	id SERIAL PRIMARY KEY,
	merchant TEXT NOT NULL,
	date TIMESTAMPTZ,
	account INTEGER,
	subcategory INTEGER,
	amount_cents BIGINT NOT NULL DEFAULT 0,
	direction txn_direction NOT NULL DEFAULT 'debit',
	notes TEXT,
	FOREIGN KEY (account) REFERENCES asset(id)
		ON DELETE SET NULL
		ON UPDATE CASCADE,
	FOREIGN KEY (subcategory) REFERENCES subcategory(id)
		ON DELETE SET NULL
		ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS txn_rule (
	id SERIAL PRIMARY KEY,
	pattern TEXT NOT NULL,
	flags TEXT DEFAULT 'i',
	merchant TEXT NOT NULL,
	subcategory INTEGER,
	priority INTEGER DEFAULT 0,
	is_active BOOLEAN DEFAULT true,
	FOREIGN KEY (subcategory) REFERENCES subcategory(id)
		ON DELETE SET NULL
		ON UPDATE CASCADE
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_txn_date ON txn(date);
CREATE INDEX IF NOT EXISTS idx_txn_account ON txn(account);
CREATE INDEX IF NOT EXISTS idx_txn_subcategory ON txn(subcategory);
CREATE INDEX IF NOT EXISTS idx_subcategory_category ON subcategory(category);
CREATE INDEX IF NOT EXISTS idx_txn_rule_active ON txn_rule(is_active)
	WHERE is_active = true;

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_txn_merchant_search ON txn
	USING gin(to_tsvector('english', merchant));
CREATE INDEX IF NOT EXISTS idx_txn_notes_search ON txn
	USING gin(to_tsvector('english', coalesce(notes, '')));

COMMIT;
