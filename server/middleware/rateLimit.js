const rateLimit = require('express-rate-limit');

const jsonHandler = (req, res) => res.status(429).json({ error: 'Too many requests. Please try again later.' });

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler
});

module.exports = { globalLimiter, orderLimiter };
