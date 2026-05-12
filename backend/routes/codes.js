const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const requireAuth = require('../middleware/requireAuth');
const { isPublic } = require('../middleware/checkAccess');

const router = express.Router();

const CODES_FILE = path.join(__dirname, '../data/codes.json');

function loadCodes() {
  if (!fs.existsSync(CODES_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCodes(codes) {
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}

const CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % 62];
  }
  return code;
}

// Get all codes (auth required)
router.get('/', requireAuth, (req, res) => {
  res.json(loadCodes());
});

// Get or create code for a path (auth required for private files)
router.post('/', (req, res) => {
  const { path: filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  // Anonymous users can only get/create codes for public files
  const authed = req.session && req.session.user;
  if (!authed && !isPublic(filePath)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const codes = loadCodes();

  // Check if path already has a code
  for (const [code, p] of Object.entries(codes)) {
    if (p === filePath) {
      return res.json({ code, path: filePath });
    }
  }

  // Generate new code, avoid collision
  let code;
  do {
    code = generateCode();
  } while (codes[code]);

  codes[code] = filePath;
  saveCodes(codes);

  res.json({ code, path: filePath });
});

// Resolve code to path (public — needed for shared links)
router.get('/:code', (req, res) => {
  const codes = loadCodes();
  const filePath = codes[req.params.code];
  if (!filePath) {
    return res.status(404).json({ error: 'Code not found' });
  }
  res.json({ code: req.params.code, path: filePath });
});

module.exports = router;
