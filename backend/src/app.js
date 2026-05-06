// NOTE: dotenv is loaded in server.js before this module is required.
// Import env after dotenv so requireEnv() sees the values.
const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
// Relax helmet's CSP for Swagger UI (it loads inline scripts)
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Swagger UI (dev only) ────────────────────────────────────────────────────
if (env.NODE_ENV !== 'production') {
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
}

// ─── API Routes ───────────────────────────────────────────────────────────────
const BASE = '/api/v1';

app.get(`${BASE}/health`, (req, res) => res.json({ success: true, status: 'ok' }));
app.use(`${BASE}/auth`, authRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
