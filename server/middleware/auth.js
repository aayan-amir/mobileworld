const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  const token = req.cookies?.mw_admin;
  if (!token) return res.status(401).json({ error: 'Admin login required.' });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' });
  res.cookie('mw_admin', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });
}

module.exports = { verifyJWT, setAuthCookie };
