const fs = require('fs');
const path = require('path');
const { hasPostgres, pool, initPostgres } = require('./postgres');

const inventoryPath = path.join(__dirname, '..', 'data', 'inventory.json');
const SELLABLE_APPROVALS = new Set(['pta', 'fu']);

function packageType(product) {
  const raw = `${product?._importedFrom || ''} ${product?.name || ''}`.toUpperCase();
  if (product?.packageType === 'boxpack' || product?.approval === 'boxpack' || /\b(B\/P|BP|BOX\s*PACK)\b/.test(raw)) return 'boxpack';
  if (product?.packageType === 'kit' || /\bKIT\b/.test(raw)) return 'kit';
  return product?.packageType || 'kit';
}

function normalizeApproval(product) {
  if (product?.approval === 'boxpack') {
    const variantApproval = (product.variants || []).map((variant) => variant.approval).find((approval) => SELLABLE_APPROVALS.has(approval));
    return variantApproval || 'pta';
  }
  return product?.approval;
}

function normalizePublicProduct(product) {
  const approval = normalizeApproval(product);
  return {
    ...product,
    approval,
    packageType: packageType(product),
    variants: (product.variants || []).map((variant) => ({
      ...variant,
      approval: variant.approval === 'boxpack' ? approval : variant.approval
    }))
  };
}

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

async function writeProducts(products) {
  if (hasPostgres) {
    await initPostgres();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const product of products) {
        await client.query(`
          INSERT INTO inventory_products (id, product, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET product = EXCLUDED.product, updated_at = NOW()
        `, [product.id, JSON.stringify(product)]);
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

  const inventory = await readInventory();
  const byId = new Map(products.map((product) => [product.id, product]));
  await writeInventory(inventory.map((product) => byId.get(product.id) || product));
}

function stripCost(product) {
  const normalized = normalizePublicProduct(product);
  return {
    ...normalized,
    variants: (normalized.variants || []).map(({ costPrice, ...variant }) => variant)
  };
}

async function publicProducts(inventory) {
  const source = inventory || await readInventory();
  return source.filter((p) => p.published && SELLABLE_APPROVALS.has(normalizeApproval(p))).map(stripCost);
}

function isSellable(product) {
  return Boolean(product?.published && SELLABLE_APPROVALS.has(normalizeApproval(product)));
}

module.exports = { inventoryPath, readInventory, writeInventory, writeProducts, stripCost, publicProducts, isSellable, packageType, normalizeApproval };
