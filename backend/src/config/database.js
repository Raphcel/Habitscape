const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Sensible production defaults
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Surface idle-client errors in logs — do NOT exit the process for this
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool client error:', err.message);
});

/**
 * Run a parameterised query.
 * @param {string} text  - SQL string with $1, $2 … placeholders
 * @param {any[]}  params - Values bound to the placeholders
 */
const query = (text, params) => pool.query(text, params);

/**
 * Grab a dedicated client for transactions.
 * Always release the client in a finally block.
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
