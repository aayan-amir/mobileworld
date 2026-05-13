const fs = require('fs');
const path = require('path');
const { hasPostgres, pool, initPostgres } = require('./postgres');

const inventoryPath = path.join(__dirname, '..', 'data', 'inventory.json');
const SELLABLE_APPROVALS = new Set(['pta', 'fu']);

async function readInventory() {
  if (hasPostgres) {
    await initPostgres();
    const { rows } = await pool.query("SELECT product FROM inventory_products ORDER BY product->>'brand', product->>'name'");
    return rows.map((row) => row.product);
  }

  if (!fs.existsSync(inventoryPath)) return [];
  return JSON.parse(fs.readFileSync(inventoryPath, 'utf8') || '[]');
}

async function writeInventory(inventory) {
  if (hasPostgres) {
    await initPostgres();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM inventory_products');
      for (const product of inventory) {
        await client.query(
          'INSERT INTO inventory_products (id, product, updated_at) VALUES ($1, $2::jsonb, NOW())',
          [product.id, JSON.stringify(product)]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return;
  }

  const tmpPath = `${inventoryPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(inventory, null, 2), 'utf8');
  fs.renameSync(tmpPath, inventoryPath);
}

function stripCost(product) {
  return {
    ...product,
    variants: (product.variants || []).map(({ costPrice, ...variant }) => variant)
  };
}

async function publicProducts(inventory) {
  const source = inventory || await readInventory();
  return source.filter((p) => p.published && SELLABLE_APPROVALS.has(p.approval)).map(stripCost);
}

function isSellable(product) {
  return Boolean(product?.published && SELLABLE_APPROVALS.has(product.approval));
}

module.exports = { inventoryPath, readInventory, writeInventory, stripCost, publicProducts, isSellable };
