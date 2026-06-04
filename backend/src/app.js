// NOTE: dotenv is loaded in server.js before this module is required.
// Import env after dotenv so requireEnv() sees the values.
const path = require('path');
const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const foodLogRoutes = require('./modules/food-logs/foodLog.routes');
const weightRoutes = require('./modules/weight/weight.routes');
const forecasterRoutes = require('./modules/forecaster/forecaster.routes');
const dailySummaryRoutes = require('./modules/daily-summaries/dailySummary.routes');

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
// Relax helmet's CSP so Swagger UI inline scripts work
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
// Serve uploaded food images so /uploads/<filename> is publicly accessible.
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Swagger UI ──────────────────────────────────────────────────────────────
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Habitscape API Docs',
    swaggerOptions: {
      persistAuthorization: true, // keeps token between page refreshes
    },
  })
);
// Expose the raw spec as JSON for external tools (Postman, Insomnia, etc.)
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
console.log('[Docs] Swagger UI available at http://localhost:' + env.PORT + '/docs');


// ─── API Routes ───────────────────────────────────────────────────────────────
const BASE = '/api/v1';

app.get('/', (req, res) => res.json({ success: true, status: 'ok', service: 'habitscape-api' }));
app.get(`${BASE}/health`, (req, res) => res.json({ success: true, status: 'ok' }));
app.use(`${BASE}/auth`, authRoutes);
app.use(`${BASE}/food-logs`, foodLogRoutes);
app.use(`${BASE}/weight`, weightRoutes);
app.use(`${BASE}/forecaster`, forecasterRoutes);
app.use(`${BASE}/daily-summaries`, dailySummaryRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
