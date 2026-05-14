const express = require('express');
const { body, param, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { readInventory, publicProducts, stripCost, isSellable } = require('../services/inventoryStore');

const router = express.Router();

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return next();
}

router.get('/', asyncHandler(async (req, res) => {
  res.json(await publicProducts());
}));

router.get('/:id', param('id').trim().notEmpty().withMessage('Product ID is required.'), validationError, asyncHandler(async (req, res) => {
  const product = (await readInventory()).find((item) => item.id === req.params.id && isSellable(item));
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  return res.json(stripCost(product));
}));

module.exports = router;
