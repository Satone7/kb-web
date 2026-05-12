const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const KB_ROOT = process.env.KB_ROOT || path.join(__dirname, '..', 'sample-kb');
const PORT = parseInt(process.env.PORT, 10) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const SESSION_COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE === 'true' || (NODE_ENV === 'production' && process.env.SESSION_COOKIE_SECURE !== 'false');

module.exports = {
  KB_ROOT: path.resolve(KB_ROOT),
  PORT,
  SESSION_SECRET,
  NODE_ENV,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  DATA_DIR: path.join(__dirname, 'data'),
  SESSION_COOKIE_SECURE,
};
