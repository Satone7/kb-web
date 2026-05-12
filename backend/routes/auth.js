const express = require('express');
const bcrypt = require('bcryptjs');
const config = require('../config');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== config.ADMIN_USERNAME) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, await getPasswordHash());
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.user = { username };
  res.json({ user: { username } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('kb.sid');
    res.json({ success: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session?.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

async function getPasswordHash() {
  const fs = require('fs');
  const path = require('path');
  const usersFile = path.join(config.DATA_DIR, 'users.json');

  if (fs.existsSync(usersFile)) {
    const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    if (data.passwordHash) return data.passwordHash;
  }

  // Auto-generate on first run
  const hash = await bcrypt.hash(config.ADMIN_PASSWORD, 10);
  const fs2 = require('fs');
  const path2 = require('path');
  if (!fs2.existsSync(config.DATA_DIR)) {
    fs2.mkdirSync(config.DATA_DIR, { recursive: true });
  }
  fs2.writeFileSync(usersFile, JSON.stringify({ passwordHash: hash }, null, 2));
  console.log(`[Auth] Auto-created user file at ${usersFile}`);
  console.log(`[Auth] Default password is "${config.ADMIN_PASSWORD}". Change it via ADMIN_PASSWORD env var.`);
  return hash;
}

module.exports = router;
