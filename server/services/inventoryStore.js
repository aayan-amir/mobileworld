const fs = require('fs');
const path = require('path');

const inventoryPath = path.join(__dirname, '..', 'data', 'inventory.json');

function readInventory() {
  if (!fs.existsSync(inventoryPath)) return [];
  return JSON.parse(fs.readFileSync(inventoryPath, 'utf8') || '[]');
}

function writeInventory(inventory) {
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

function publicProducts(inventory = readInventory()) {
  return inventory.filter((p) => p.published).map(stripCost);
}

module.exports = { inventoryPath, readInventory, writeInventory, stripCost, publicProducts };
