const path = require('path');
const fs = require('fs');
const config = require('../config');

const PERMISSIONS_FILE = path.join(config.DATA_DIR, 'permissions.json');

function loadPermissions() {
  try {
    if (fs.existsSync(PERMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(PERMISSIONS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load permissions:', e.message);
  }
  return {};
}

function isPublic(filePath) {
  const permissions = loadPermissions();
  return !!permissions[filePath];
}

function checkAccess(req, res, next) {
  const rawPath = req.params.path || req.params[0] || req.query.path;
  const filePath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  if (!filePath) {
    return res.status(400).json({ error: 'Missing file path' });
  }

  if (isPublic(filePath)) {
    return next();
  }

  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { checkAccess, isPublic, loadPermissions, PERMISSIONS_FILE };
