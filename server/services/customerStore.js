const crypto = require('crypto');
const db = require('../db');
const { hasPostgres, pool, initPostgres } = require('./postgres');

function normalizeCustomer(row) {
  return row || null;
}

async function upsertGoogleCustomer(profile) {
  const email = profile.email?.toLowerCase();
  if (!email) {
    const error = new Error('Google account did not provide an email.');
    error.status = 400;
    throw error;
  }

  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query(`
      INSERT INTO customers (id, email, name, avatar_url, google_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        google_id = EXCLUDED.google_id,
        updated_at = NOW()
      RETURNING *
    `, [crypto.randomUUID(), email, profile.name || '', profile.picture || '', profile.sub]);
    return normalizeCustomer(rows[0]);
  }

  const existing = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);
  if (existing) {
    db.prepare('UPDATE customers SET name = ?, avatar_url = ?, google_id = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?')
      .run(profile.name || '', profile.picture || '', profile.sub, email);
    return normalizeCustomer(db.prepare('SELECT * FROM customers WHERE email = ?').get(email));
  }

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO customers (id, email, name, avatar_url, google_id) VALUES (?, ?, ?, ?, ?)')
    .run(id, email, profile.name || '', profile.picture || '', profile.sub);
  return normalizeCustomer(db.prepare('SELECT * FROM customers WHERE id = ?').get(id));
}

async function getCustomer(id) {
  if (!id) return null;
  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    return normalizeCustomer(rows[0]);
  }
  return normalizeCustomer(db.prepare('SELECT * FROM customers WHERE id = ?').get(id));
}

async function updateCustomer(id, patch) {
  const current = await getCustomer(id);
  if (!current) return null;
  const name = patch.name ?? current.name;
  const phone = patch.phone ?? current.phone;

  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query(
      'UPDATE customers SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, phone, id]
    );
    return normalizeCustomer(rows[0]);
  }

  db.prepare('UPDATE customers SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, phone, id);
  return getCustomer(id);
}

module.exports = { upsertGoogleCustomer, getCustomer, updateCustomer };
