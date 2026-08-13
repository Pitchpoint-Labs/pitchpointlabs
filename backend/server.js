const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
 
const pool = require('./config/db');
const contactRoutes = require('./routes/contact');
 
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
 
// --- Confirm MySQL connection on startup ---
console.log('DB config check:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASSWORD
});
 
pool.getConnection()
  .then((conn) => {
    console.log('MySQL connected');
    conn.release();
  })
  .catch((err) => {
    console.error('MySQL connection failed. Full error:');
    console.error(err);
  });
 
// --- Trust proxy (needed on Render/Railway/Heroku/etc. so rate-limit & IPs work correctly) ---
app.set('trust proxy', 1);
 
// --- Security & parsing middleware ---
app.use(helmet());
app.use(express.json({ limit: '20kb' })); // small limit: this API only accepts short form payloads
 
// Logging: concise in production, verbose in development
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
 
// --- CORS: only allow the origins listed in .env (your live frontend domain(s)) ---
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
 
app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like curl/Postman with no origin, and any whitelisted origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
 
// --- Rate limiting: protects the public contact endpoint from spam/abuse ---
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many submissions. Please try again later.' },
});
 
// --- Routes ---
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Pitchpoint Labs API is running.' });
});
 
// Health check endpoint for uptime monitors / hosting platforms
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
 
app.use('/api/contact', contactLimiter, contactRoutes);
 
// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});
 
// --- Global error handler (catches CORS errors, etc.) ---
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: NODE_ENV === 'production' && status === 500 ? 'Server error.' : err.message,
  });
});
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${NODE_ENV}]`);
});
 
