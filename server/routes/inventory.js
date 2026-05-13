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
  publicProducts().then((products) => res.json(products)).catch((error) => {
    console.error(error);
    res.status(500).json({ error: 'Could not load inventory.' });
  });
});

router.get('/:id', param('id').trim().notEmpty().withMessage('Product ID is required.'), validationError, async (req, res) => {
  const product = (await readInventory()).find((item) => item.id === req.params.id && item.published);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  return res.json(stripCost(product));
});

module.exports = router;
