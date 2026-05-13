const express = require('express');
const crypto = require('crypto');
const { body, param, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const { orderLimiter } = require('../middleware/rateLimit');
const { readInventory, writeInventory, isSellable } = require('../services/inventoryStore');
const { sendOrderEmail } = require('../services/email');
const { savePaymentScreenshot } = require('../services/uploadStore');
const { createOrder, getPublicOrder } = require('../services/orderStore');

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
    const inventory = await readInventory();
    const orderItems = [];
    let total = 0;

    for (const requestItem of requestedItems) {
      const qty = Number(requestItem.qty);
      if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'Each item must have a valid quantity.' });

      const product = inventory.find((item) => item.id === requestItem.productId && isSellable(item));
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

    await writeInventory(inventory);

    const id = orderId();
    const screenshot = await savePaymentScreenshot(req.file);

    const order = await createOrder({
      id,
      customer_name: req.body.name.trim(),
      customer_email: req.body.email.trim().toLowerCase(),
      customer_phone: req.body.phone.trim(),
      items: orderItems,
      total_amount: total,
      screenshot_path: screenshot.path,
      screenshot_url: screenshot.url
    });
    res.status(201).json({ orderId: id });

    sendOrderEmail(order, screenshot).catch((error) => {
      console.error('Order email failed:', error.message);
    });
  }
);

router.get('/:id', param('id').trim().notEmpty().withMessage('Order ID is required.'), validationError, async (req, res) => {
  const order = await getPublicOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (!statusValues.has(order.status)) return res.status(500).json({ error: 'Invalid order status.' });
  return res.json(order);
});

module.exports = router;
