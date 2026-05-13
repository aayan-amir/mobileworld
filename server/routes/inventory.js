const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { readInventory, publicProducts, stripCost } = require('../services/inventoryStore');

const router = express.Router();

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return next();
}

router.get('/', (req, res) => {
  res.json(publicProducts());
});

router.get('/:id', param('id').trim().notEmpty().withMessage('Product ID is required.'), validationError, (req, res) => {
  const product = readInventory().find((item) => item.id === req.params.id && item.published);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  return res.json(stripCost(product));
});

module.exports = router;
