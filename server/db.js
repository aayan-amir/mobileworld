const path = require('path');
const Database = require('better-sqlite3');

if (process.env.DATABASE_URL) {
  module.exports = null;
  return;
}

const db = new Database(path.join(__dirname, 'data', 'orders.sqlite'));

db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    google_id TEXT UNIQUE
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    payment_method TEXT DEFAULT 'meezan_bank',
    screenshot_path TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    customer_id TEXT
  )
`).run();

for (const column of ['screenshot_url TEXT', 'customer_id TEXT']) {
  const name = column.split(' ')[0];
  const exists = db.prepare('PRAGMA table_info(orders)').all().some((info) => info.name === name);
  if (!exists) db.prepare(`ALTER TABLE orders ADD COLUMN ${column}`).run();
}

module.exports = db;
