const express = require('express');
const { getFileTree, readFile, getFileInfo } = require('../services/fileService');
const { renderMarkdown, renderHTML } = require('../services/renderService');
const { searchFiles } = require('../services/searchService');
const { checkAccess } = require('../middleware/checkAccess');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Get full file tree (requires auth)
router.get('/tree', requireAuth, (req, res) => {
  try {
    res.json(getFileTree());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get file content/render (requires auth or public)
router.get('/content/*path', checkAccess, (req, res) => {
  try {
    const filePath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
    const raw = readFile(filePath);
    const info = getFileInfo(filePath);

    if (info.ext === '.md') {
      res.json({
        type: 'markdown',
        html: renderMarkdown(raw),
        raw,
        info,
      });
    } else if (info.ext === '.html') {
      res.json({
        type: 'html',
        html: renderHTML(raw),
        raw,
        info,
      });
    } else {
      res.json({ type: 'unknown', raw, info });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get file info only (requires auth or public)
router.get('/info/*path', checkAccess, (req, res) => {
  try {
    const filePath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
    res.json(getFileInfo(filePath));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search (public results only for anonymous, all for logged-in)
router.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  const { isPublic } = require('../middleware/checkAccess');
  const allResults = searchFiles(q);

  // Filter: anonymous users only see public files
  const results = req.session?.user
    ? allResults
    : allResults.filter(r => isPublic(r.path));

  res.json(results);
});

module.exports = router;
