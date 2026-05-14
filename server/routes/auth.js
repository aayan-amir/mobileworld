const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { setCustomerCookie, requireCustomer } = require('../middleware/customerAuth');
const { upsertGoogleCustomer, getCustomer, updateCustomer } = require('../services/customerStore');
const { listCustomerOrders } = require('../services/orderStore');

const router = express.Router();
const phoneRegex = /^(03\d{2}[-\s]?\d{7}|\+923\d{9})$/;

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return next();
}

function appUrl(req) {
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

function callbackUrl(req) {
  return process.env.GOOGLE_CALLBACK_URL || `${appUrl(req)}/api/auth/google/callback`;
}

router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google login is not configured.' });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl(req),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get('/google/callback', asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google login is not configured.' });
  }
  if (!req.query.code) return res.status(400).json({ error: 'Google login failed.' });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: req.query.code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl(req),
      grant_type: 'authorization_code'
    })
  });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error('Google token error:', tokenData);
    return res.redirect('/login?error=google');
  }

  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok) {
    console.error('Google profile error:', profile);
    return res.redirect('/login?error=google');
  }

  const customer = await upsertGoogleCustomer(profile);
  setCustomerCookie(res, customer);
  return res.redirect('/account');
}));

router.post('/logout', (req, res) => {
  res.clearCookie('mw_customer', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
});

router.get('/me', requireCustomer, asyncHandler(async (req, res) => {
  const customer = await getCustomer(req.customer.id);
  if (!customer) return res.status(401).json({ error: 'Customer login required.' });
  res.json(customer);
}));

router.patch(
  '/me',
  requireCustomer,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
    body('phone').optional({ nullable: true }).trim().matches(phoneRegex).withMessage('Enter a valid Pakistani phone number.')
  ],
  validationError,
  asyncHandler(async (req, res) => {
    const customer = await updateCustomer(req.customer.id, req.body);
    if (!customer) return res.status(401).json({ error: 'Customer login required.' });
    res.json(customer);
  })
);

router.get('/orders', requireCustomer, asyncHandler(async (req, res) => {
  res.json(await listCustomerOrders(req.customer.id, req.customer.email));
}));

module.exports = router;
