const path = require('path');
const Database = require('better-sqlite3');

if (process.env.DATABASE_URL) {
  module.exports = null;
  return;
}

const db = new Database(path.join(__dirname, 'data', 'orders.sqlite'));

db.pragma('journal_mode = WAL');

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
    status TEXT DEFAULT 'pending',
    notes TEXT
  )
`).run();

module.exports = db;
