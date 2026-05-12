const express = require('express');
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/requireAuth');
const { PERMISSIONS_FILE, loadPermissions } = require('../middleware/checkAccess');

const router = express.Router();

// Get all permissions (auth required)
router.get('/', requireAuth, (req, res) => {
  res.json(loadPermissions());
});

// Get permission for a specific file (auth required)
router.get('/*path', requireAuth, (req, res) => {
  const filePath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const permissions = loadPermissions();
  res.json({ path: filePath, public: !!permissions[filePath] });
});

// Set permission for a specific file (auth required)
router.post('/*path', requireAuth, (req, res) => {
  const filePath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const { public: isPublic } = req.body;

  const permissions = loadPermissions();
  if (isPublic) {
    permissions[filePath] = true;
  } else {
    delete permissions[filePath];
  }

  fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(permissions, null, 2));
  res.json({ path: filePath, public: !!permissions[filePath] });
});

module.exports = router;
