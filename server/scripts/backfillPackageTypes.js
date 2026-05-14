require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { readInventory, writeProducts, packageType, normalizeApproval } = require('../services/inventoryStore');

(async () => {
  const inventory = await readInventory();
  const updated = inventory.map((product) => {
    const pkg = packageType(product);
    const approval = normalizeApproval(product);
    return {
      ...product,
      approval,
      packageType: pkg,
      variants: (product.variants || []).map((variant) => ({
        ...variant,
        approval: variant.approval === 'boxpack' ? approval : variant.approval
      }))
    };
  });

  await writeProducts(updated);
  const counts = updated.reduce((acc, product) => {
    acc[product.packageType] = (acc[product.packageType] || 0) + 1;
    return acc;
  }, {});
  console.log(`Backfilled packageType on ${updated.length} products`);
  console.log(JSON.stringify(counts, null, 2));
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
