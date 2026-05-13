const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/importInventory.js <path-to-MobileHQ.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const VALID_CATS = ['IPHONE', 'SAMSUNG', 'GOOGLE'];
const STRIP_WORDS = ['ROHANA', 'SAMIR'];
const APPROVAL_FLAGS = {
  PTA: 'pta',
  JV: 'jv',
  FU: 'fu',
  'B/P': 'boxpack',
  BP: 'boxpack',
  'NON-PTA': 'non-pta',
  NON: 'non-pta',
  CPID: 'cpid',
  MDM: 'mdm'
};

function parseApproval(name) {
  const upper = name.toUpperCase();
  for (const [flag, value] of Object.entries(APPROVAL_FLAGS)) {
    if (new RegExp(`(^|\\s)${flag.replace('/', '\\/')}($|\\s)`).test(upper)) return value;
  }
  return 'unspecified';
}

function cleanDisplayName(name) {
  let clean = name.toUpperCase();
  STRIP_WORDS.forEach((word) => {
    clean = clean.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
  });
  Object.keys(APPROVAL_FLAGS).forEach((flag) => {
    clean = clean.replace(new RegExp(`\\b${flag.replace('/', '\\/')}\\b`, 'g'), '');
  });
  return clean.replace(/\s+/g, ' ').trim();
}

function extractStorage(name) {
  const match = name.match(/(\d+)\s*(GB|TB)/i);
  return match ? `${match[1]}${match[2].toUpperCase()}` : null;
}

function extractColor(name) {
  const colors = ['BLACK', 'WHITE', 'BLUE', 'PINK', 'PURPLE', 'GREEN', 'GOLD', 'SILVER', 'RED', 'TITANIUM', 'MIDNIGHT', 'STARLIGHT', 'NATURAL', 'DESERT', 'TEAL'];
  const upper = name.toUpperCase();
  const color = colors.find((item) => upper.includes(item));
  return color ? color.charAt(0) + color.slice(1).toLowerCase() : null;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mapBrand(cat) {
  return { IPHONE: 'Apple', SAMSUNG: 'Samsung', GOOGLE: 'Google' }[cat] || cat;
}

function inferCondition(name, approval) {
  if (approval === 'boxpack') return 'new';
  if (name.toUpperCase().includes('REFURB')) return 'refurbished';
  if (approval === 'pta') return 'new';
  return 'used';
}

const phoneMap = {};
const sortedDays = [...(raw.days || [])].sort((a, b) => a.date.localeCompare(b.date));

for (const day of sortedDays) {
  if (!day.cats) continue;
  for (const [cat, value] of Object.entries(day.cats)) {
    if (!VALID_CATS.includes(cat) || !value.rows) continue;
    for (const row of value.rows) {
      phoneMap[`${cat}|||${row.name}`] = {
        cat,
        rawName: row.name,
        op: row.op || 0,
        costPerUnit: row.costPerUnit || 0,
        date: day.date
      };
    }
  }
}

const inventory = [];
const usedIds = new Map();

for (const entry of Object.values(phoneMap)) {
  if (entry.op <= 0) continue;

  const approval = parseApproval(entry.rawName);
  const displayName = cleanDisplayName(entry.rawName);
  const storage = extractStorage(entry.rawName);
  const color = extractColor(entry.rawName);
  const condition = inferCondition(entry.rawName, approval);
  const brand = mapBrand(entry.cat);
  const sellingPrice = entry.costPerUnit > 0 ? Math.ceil((entry.costPerUnit * 1.1) / 1000) * 1000 : 0;
  const baseId = slugify(`${brand}-${displayName}-${approval}`);
  const seen = usedIds.get(baseId) || 0;
  usedIds.set(baseId, seen + 1);

  inventory.push({
    id: seen ? `${baseId}-${seen + 1}` : baseId,
    name: displayName,
    brand,
    category: entry.cat,
    condition,
    approval,
    deliverable: condition !== 'used',
    published: sellingPrice > 0,
    images: [],
    warranty: '7-day checking warranty',
    specs: {
      storage: storage || 'See description',
      color: color || null,
      display: '',
      chip: '',
      camera: '',
      battery: ''
    },
    variants: [{
      variantId: crypto.randomUUID(),
      storage: storage || 'N/A',
      color: color || 'Default',
      approval,
      costPrice: entry.costPerUnit,
      price: sellingPrice,
      stock: entry.op
    }],
    _importedFrom: entry.rawName,
    _importDate: new Date().toISOString()
  });
}

inventory.sort((a, b) => {
  const order = { Apple: 0, Samsung: 1, Google: 2 };
  return ((order[a.brand] ?? 3) - (order[b.brand] ?? 3)) || a.name.localeCompare(b.name);
});

const outputPath = path.join(__dirname, '../data/inventory.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf8');

const noPrice = inventory.filter((product) => product.variants[0].price === 0).length;
console.log(`Imported ${inventory.length} in-stock products to inventory.json`);
console.log(`${noPrice} products have no price - set them in admin panel before publishing`);
console.log('Review _importedFrom field in admin to verify name parsing');
