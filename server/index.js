require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { globalLimiter } = require('./middleware/rateLimit');

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigin = process.env.ALLOWED_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');

app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
if (allowedOrigin) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origin === allowedOrigin) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
}
app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) next();
  });
});

app.use((error, req, res, next) => {
  if (error.message?.includes('CORS')) return res.status(403).json({ error: 'Origin is not allowed.' });
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Payment screenshot must be 5MB or smaller.' });
  console.error(error);
  return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : error.message });
});

app.listen(port, () => {
  console.log(`Mobile World API running on port ${port}`);
});
