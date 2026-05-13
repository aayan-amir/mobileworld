const db = require('../db');
const { hasPostgres, pool, initPostgres } = require('./postgres');

function parseSqliteOrder(order) {
  if (!order) return null;
  return { ...order, items: JSON.parse(order.items) };
}

async function createOrder(order) {
  if (hasPostgres) {
    await initPostgres();
    await pool.query(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, items, total_amount, screenshot_path, screenshot_url, status)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, 'pending')
    `, [
      order.id,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      JSON.stringify(order.items),
      order.total_amount,
      order.screenshot_path,
      order.screenshot_url
    ]);
    return getOrder(order.id);
  }

  db.prepare(`
    INSERT INTO orders (id, customer_name, customer_email, customer_phone, items, total_amount, screenshot_path, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    order.id,
    order.customer_name,
    order.customer_email,
    order.customer_phone,
    JSON.stringify(order.items),
    order.total_amount,
    order.screenshot_path
  );
  return getOrder(order.id);
}

async function getOrder(id) {
  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows[0] || null;
  }
  return parseSqliteOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
}

async function getPublicOrder(id) {
  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query('SELECT id, created_at, total_amount, status, notes FROM orders WHERE id = $1', [id]);
    return rows[0] || null;
  }
  return db.prepare('SELECT id, created_at, total_amount, status, notes FROM orders WHERE id = ?').get(id) || null;
}

async function listOrders(status) {
  if (hasPostgres) {
    await initPostgres();
    const result = status
      ? await pool.query('SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC', [status])
      : await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows;
  }

  const rows = status
    ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return rows.map(parseSqliteOrder);
}

async function updateOrder(id, patch) {
  const existing = await getOrder(id);
  if (!existing) return null;

  const status = patch.status || existing.status;
  const notes = patch.notes ?? existing.notes;

  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, notes = $2 WHERE id = $3 RETURNING *',
      [status, notes, id]
    );
    return rows[0] || null;
  }

  db.prepare('UPDATE orders SET status = ?, notes = ? WHERE id = ?').run(status, notes, id);
  return getOrder(id);
}

module.exports = { createOrder, getOrder, getPublicOrder, listOrders, updateOrder };
