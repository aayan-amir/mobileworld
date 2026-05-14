const db = require('../db');
const { hasPostgres, pool, initPostgres } = require('./postgres');
const { readInventory, writeProducts, isSellable } = require('./inventoryStore');

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

function makeOrderStockError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function placeOrder(order, requestedItems) {
  if (hasPostgres) {
    await initPostgres();
    const client = await pool.connect();
    const orderItems = [];
    const touchedProducts = new Map();
    let total = 0;

    try {
      await client.query('BEGIN');

      for (const requestItem of requestedItems) {
        const qty = Number(requestItem.qty);
        if (!Number.isInteger(qty) || qty < 1) throw makeOrderStockError('Each item must have a valid quantity.');

        const { rows } = await client.query(
          'SELECT product FROM inventory_products WHERE id = $1 FOR UPDATE',
          [requestItem.productId]
        );
        const product = rows[0]?.product;
        if (!isSellable(product)) throw makeOrderStockError('One or more products are unavailable.');

        const variant = (product.variants || []).find((item) => item.variantId === requestItem.variantId);
        if (!variant) throw makeOrderStockError('One or more variants are unavailable.');
        if (variant.stock < qty) throw makeOrderStockError(`${product.name} has only ${variant.stock} in stock.`);

        variant.stock -= qty;
        touchedProducts.set(product.id, product);
        const unitPrice = Number(variant.price);
        total += unitPrice * qty;
        orderItems.push({
          productId: product.id,
          variantId: variant.variantId,
          name: product.name,
          variant: `${variant.storage || 'N/A'} / ${variant.color || 'Default'} / ${variant.approval || product.approval}`,
          qty,
          price: unitPrice
        });
      }

      for (const product of touchedProducts.values()) {
        await client.query(
          'UPDATE inventory_products SET product = $1::jsonb, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(product), product.id]
        );
      }

      const { rows } = await client.query(`
        INSERT INTO orders (id, customer_name, customer_email, customer_phone, items, total_amount, screenshot_path, screenshot_url, status)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, 'pending')
        RETURNING *
      `, [
        order.id,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        JSON.stringify(orderItems),
        total,
        order.screenshot_path,
        order.screenshot_url
      ]);

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  const inventory = await readInventory();
  const touchedProducts = new Map();
  const orderItems = [];
  let total = 0;

  for (const requestItem of requestedItems) {
    const qty = Number(requestItem.qty);
    if (!Number.isInteger(qty) || qty < 1) throw makeOrderStockError('Each item must have a valid quantity.');

    const product = inventory.find((item) => item.id === requestItem.productId && isSellable(item));
    if (!product) throw makeOrderStockError('One or more products are unavailable.');

    const variant = (product.variants || []).find((item) => item.variantId === requestItem.variantId);
    if (!variant) throw makeOrderStockError('One or more variants are unavailable.');
    if (variant.stock < qty) throw makeOrderStockError(`${product.name} has only ${variant.stock} in stock.`);

    variant.stock -= qty;
    touchedProducts.set(product.id, product);
    const unitPrice = Number(variant.price);
    total += unitPrice * qty;
    orderItems.push({
      productId: product.id,
      variantId: variant.variantId,
      name: product.name,
      variant: `${variant.storage || 'N/A'} / ${variant.color || 'Default'} / ${variant.approval || product.approval}`,
      qty,
      price: unitPrice
    });
  }

  await writeProducts([...touchedProducts.values()]);
  return createOrder({ ...order, items: orderItems, total_amount: total });
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

module.exports = { createOrder, placeOrder, getOrder, getPublicOrder, listOrders, updateOrder };
