const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const upload = require('../middleware/upload');
const { orderLimiter } = require('../middleware/rateLimit');
const { readInventory, writeInventory } = require('../services/inventoryStore');
const { sendOrderEmail } = require('../services/email');

const router = express.Router();
const phoneRegex = /^(03\d{2}[-\s]?\d{7}|\+923\d{9})$/;
const statusValues = new Set(['pending', 'confirmed', 'completed', 'returned']);

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return next();
}

function orderId() {
  return `MW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function parseItems(value) {
  try {
    const items = JSON.parse(value);
    if (!Array.isArray(items) || items.length === 0) return null;
    return items;
  } catch {
    return null;
  }
}

router.post(
  '/',
  orderLimiter,
  upload.single('screenshot'),
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Full name is required.'),
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    body('phone').trim().matches(phoneRegex).withMessage('Enter a valid Pakistani phone number.'),
    body('items').custom((value) => Boolean(parseItems(value))).withMessage('Cart items are required.')
  ],
  validationError,
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Payment screenshot is required.' });

    const requestedItems = parseItems(req.body.items);
    const inventory = readInventory();
    const orderItems = [];
    let total = 0;

    for (const requestItem of requestedItems) {
      const qty = Number(requestItem.qty);
      if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'Each item must have a valid quantity.' });

      const product = inventory.find((item) => item.id === requestItem.productId && item.published);
      if (!product) return res.status(400).json({ error: 'One or more products are unavailable.' });

      const variant = (product.variants || []).find((item) => item.variantId === requestItem.variantId);
      if (!variant) return res.status(400).json({ error: 'One or more variants are unavailable.' });
      if (variant.stock < qty) return res.status(400).json({ error: `${product.name} has only ${variant.stock} in stock.` });

      variant.stock -= qty;
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

    writeInventory(inventory);

    const id = orderId();
    const insert = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, items, total_amount, screenshot_path, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    insert.run(
      id,
      req.body.name.trim(),
      req.body.email.trim().toLowerCase(),
      req.body.phone.trim(),
      JSON.stringify(orderItems),
      total,
      req.file.filename
    );

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    try {
      await sendOrderEmail(order, path.join(__dirname, '..', 'uploads', req.file.filename));
    } catch (error) {
      console.error('Order email failed:', error.message);
    }

    return res.status(201).json({ orderId: id });
  }
);

router.get('/:id', param('id').trim().notEmpty().withMessage('Order ID is required.'), validationError, (req, res) => {
  const order = db.prepare('SELECT id, created_at, total_amount, status, notes FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (!statusValues.has(order.status)) return res.status(500).json({ error: 'Invalid order status.' });
  return res.json(order);
});

module.exports = router;
