const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_KEY } = require('../config/env');

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[Supabase] Client initialized successfully ✓');
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_KEY is missing. Image uploads to Supabase Storage are disabled.');
}

module.exports = supabase;
