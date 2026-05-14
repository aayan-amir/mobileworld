const jwt = require('jsonwebtoken');

function setCustomerCookie(res, customer) {
  const token = jwt.sign(
    { id: customer.id, email: customer.email, type: 'customer' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '30d' }
  );
  res.cookie('mw_customer', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

function optionalCustomer(req, res, next) {
  const token = req.cookies?.mw_customer;
  if (!token || !process.env.JWT_SECRET) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type === 'customer') req.customer = payload;
  } catch {
    res.clearCookie('mw_customer');
  }
  return next();
}

function requireCustomer(req, res, next) {
  optionalCustomer(req, res, () => {
    if (!req.customer) return res.status(401).json({ error: 'Customer login required.' });
    return next();
  });
}

module.exports = { setCustomerCookie, optionalCustomer, requireCustomer };
