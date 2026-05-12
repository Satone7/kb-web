const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const app = express();

// Ensure data dir exists
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR, { recursive: true });
}

app.use(express.json());
app.use(cors({
  origin: config.NODE_ENV === 'development' ? 'http://localhost:5173' : false,
  credentials: true,
}));

app.use(session({
  name: 'kb.sid',
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/permissions', require('./routes/permissions'));

// Public tree endpoint (only shows public files for anonymous)
app.get('/api/public/tree', (req, res) => {
  const { getFileTree } = require('./services/fileService');
  const { isPublic } = require('./middleware/checkAccess');

  try {
    const tree = getFileTree();

    function filterPublic(node) {
      if (node.type === 'file') {
        return isPublic(node.path) ? node : null;
      }
      const filteredChildren = node.children
        .map(filterPublic)
        .filter(Boolean);
      if (filteredChildren.length === 0) return null;
      return { ...node, children: filteredChildren };
    }

    const publicTree = req.session?.user ? tree : filterPublic(tree);
    res.json(publicTree || { name: tree.name, path: '', type: 'directory', children: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve frontend static files in production
if (config.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(config.PORT, () => {
  console.log(`[KB-Web] Server running on port ${config.PORT}`);
  console.log(`[KB-Web] KB_ROOT: ${config.KB_ROOT}`);
  console.log(`[KB-Web] Environment: ${config.NODE_ENV}`);
});
