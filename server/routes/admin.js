const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { body, param, query, validationResult } = require('express-validator');
const { verifyJWT, setAuthCookie } = require('../middleware/auth');
const { readInventory, writeInventory } = require('../services/inventoryStore');
const { listOrders, getOrder, updateOrder } = require('../services/orderStore');
const { resolveLocalUpload } = require('../services/uploadStore');

const router = express.Router();
const statuses = ['pending', 'confirmed', 'completed', 'returned'];

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return next();
}

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 1 }).withMessage('Password is required.')
  ],
  validationError,
  async (req, res) => {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Admin credentials are not configured.' });
    }

    const emailOk = req.body.email.trim().toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const passwordOk = await bcrypt.compare(req.body.password, process.env.ADMIN_PASSWORD_HASH);
    if (!emailOk || !passwordOk) return res.status(401).json({ error: 'Invalid email or password.' });

    setAuthCookie(res, { email: process.env.ADMIN_EMAIL });
    return res.json({ ok: true });
  }
);

router.use(verifyJWT);

router.post('/logout', (req, res) => {
  res.clearCookie('mw_admin', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
});

router.get('/me', (req, res) => res.json({ email: req.admin.email }));

router.get('/orders', query('status').optional().isIn(statuses).withMessage('Invalid status.'), validationError, async (req, res) => {
  const rows = await listOrders(req.query.status);
  res.json(rows);
});

router.patch(
  '/orders/:id',
  [
    param('id').trim().notEmpty().withMessage('Order ID is required.'),
    body('status').optional().isIn(statuses).withMessage('Invalid status.'),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 2000 }).withMessage('Notes are too long.')
  ],
  validationError,
  async (req, res) => {
    const existing = await getOrder(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Order not found.' });
    const updated = await updateOrder(req.params.id, req.body);
    res.json(updated);
  }
);

router.get('/inventory', async (req, res) => res.json(await readInventory()));

router.put('/inventory', body().isArray().withMessage('Inventory must be an array.'), validationError, async (req, res) => {
  await writeInventory(req.body);
  res.json({ ok: true, count: req.body.length });
});

router.patch('/inventory/:id', param('id').trim().notEmpty(), validationError, async (req, res) => {
  const inventory = await readInventory();
  const index = inventory.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found.' });

  const allowed = ['name', 'brand', 'category', 'condition', 'approval', 'deliverable', 'published', 'images', 'warranty', 'specs'];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) inventory[index][key] = req.body[key];
  }
  await writeInventory(inventory);
  res.json(inventory[index]);
});

router.patch('/inventory/:id/variants/:variantId', [
  param('id').trim().notEmpty(),
  param('variantId').trim().notEmpty(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be zero or higher.'),
  body('price').optional().isInt({ min: 0 }).withMessage('Price must be zero or higher.'),
  body('costPrice').optional().isInt({ min: 0 }).withMessage('Cost price must be zero or higher.')
], validationError, async (req, res) => {
  const inventory = await readInventory();
  const product = inventory.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  const variant = (product.variants || []).find((item) => item.variantId === req.params.variantId);
  if (!variant) return res.status(404).json({ error: 'Variant not found.' });
  for (const key of ['stock', 'price', 'costPrice']) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) variant[key] = Number(req.body[key]);
  }
  await writeInventory(inventory);
  res.json(variant);
});

router.delete('/inventory/:id', param('id').trim().notEmpty(), validationError, async (req, res) => {
  const next = (await readInventory()).filter((item) => item.id !== req.params.id);
  await writeInventory(next);
  res.json({ ok: true });
});

router.get('/uploads/:filename', param('filename').matches(/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i), validationError, (req, res) => {
  const filePath = resolveLocalUpload(req.params.filename);
  if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Screenshot not found.' });
  res.sendFile(filePath);
});

module.exports = router;
