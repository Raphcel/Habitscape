require('dotenv').config();
const env = require('./src/config/env');
const app = require('./src/app');
const { pool } = require('./src/config/database');

const PORT = env.PORT;

const start = async () => {
  // Verify DB connection before accepting traffic
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL ✓');
  } catch (err) {
    console.error('[DB] Failed to connect:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Habitscape API running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
  });
};

start();
