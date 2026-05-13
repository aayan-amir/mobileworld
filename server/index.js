require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { globalLimiter } = require('./middleware/rateLimit');

require('./db');

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === allowedOrigin) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, req, res, next) => {
  if (error.message?.includes('CORS')) return res.status(403).json({ error: 'Origin is not allowed.' });
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Payment screenshot must be 5MB or smaller.' });
  console.error(error);
  return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : error.message });
});

app.listen(port, () => {
  console.log(`Mobile World API running on port ${port}`);
});
