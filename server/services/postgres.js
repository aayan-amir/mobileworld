const { Pool } = require('pg');

const hasPostgres = Boolean(process.env.DATABASE_URL);
const pool = hasPostgres ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

let ready;

async function initPostgres() {
  if (!pool) return false;
  if (!ready) {
    ready = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS inventory_products (
          id TEXT PRIMARY KEY,
          product JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          phone TEXT,
          avatar_url TEXT,
          google_id TEXT UNIQUE
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          items JSONB NOT NULL,
          total_amount INTEGER NOT NULL,
          payment_method TEXT DEFAULT 'meezan_bank',
          screenshot_path TEXT,
          screenshot_url TEXT,
          status TEXT DEFAULT 'pending',
          notes TEXT,
          customer_id TEXT REFERENCES customers(id)
        )
      `);
      await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS screenshot_url TEXT');
      await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id TEXT REFERENCES customers(id)');
    })();
  }
  await ready;
  return true;
}

module.exports = { hasPostgres, pool, initPostgres };
