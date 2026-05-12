const express = require('express');
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/requireAuth');
const { PERMISSIONS_FILE, loadPermissions } = require('../middleware/checkAccess');
const { getFileTree } = require('../services/fileService');

const router = express.Router();

function collectFiles(node, files = []) {
  if (node.type === 'file') {
    files.push(node.path);
  } else if (node.children) {
    for (const child of node.children) {
      collectFiles(child, files);
    }
  }
  return files;
}

function getDirectoryFiles(dirPath) {
  const tree = getFileTree();

  function findDirectory(node, targetPath) {
    if (node.type === 'directory') {
      if (node.path === targetPath) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = findDirectory(child, targetPath);
          if (found) return found;
        }
      }
    }
    return null;
  }

  const dirNode = findDirectory(tree, dirPath);
  if (!dirNode) {
    return null;
  }
  return collectFiles(dirNode);
}

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

// Make all files in a directory public/private (auth required)
router.post('/directory/*path', requireAuth, (req, res) => {
  const dirPath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const files = getDirectoryFiles(dirPath);
  const { public: isPublic } = req.body;

  if (files === null) {
    return res.status(404).json({ error: 'Directory not found' });
  }

  const permissions = loadPermissions();
  for (const filePath of files) {
    if (isPublic) {
      permissions[filePath] = true;
    } else {
      delete permissions[filePath];
    }
  }
  fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(permissions, null, 2));

  res.json({ directory: dirPath, public: isPublic, affectedFiles: files.length, files });
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
