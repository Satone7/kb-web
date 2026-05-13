const fs = require('fs');
const path = require('path');
const config = require('../config');

const ALLOWED_EXTENSIONS = new Set(['.md', '.html', '.pdf']);

function isAllowedFile(filename) {
  return ALLOWED_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function buildTree(dir, relativePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const children = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const childTree = buildTree(fullPath, entryRelPath);
      if (childTree.children.length > 0) {
        children.push(childTree);
      }
    } else if (entry.isFile() && isAllowedFile(entry.name)) {
      children.push({
        name: entry.name,
        path: entryRelPath,
        type: 'file',
      });
    }
  }

  children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });

  return {
    name: relativePath ? path.basename(relativePath) : path.basename(dir),
    path: relativePath || '',
    type: 'directory',
    children,
  };
}

function getFileTree() {
  if (!fs.existsSync(config.KB_ROOT)) {
    throw new Error(`Knowledge base root does not exist: ${config.KB_ROOT}`);
  }
  return buildTree(config.KB_ROOT);
}

function resolveSafePath(relativePath) {
  const safePath = path.resolve(path.join(config.KB_ROOT, relativePath));
  const kbRoot = path.resolve(config.KB_ROOT);

  if (!safePath.startsWith(kbRoot)) {
    throw new Error('Path traversal attempt detected');
  }

  if (!fs.existsSync(safePath)) {
    throw new Error('File not found');
  }

  if (!safePath.startsWith(kbRoot + path.sep) && safePath !== kbRoot) {
    throw new Error('Invalid path');
  }

  return safePath;
}

function readFile(relativePath) {
  const safePath = resolveSafePath(relativePath);
  return fs.readFileSync(safePath, 'utf-8');
}

function getFileInfo(relativePath) {
  const safePath = resolveSafePath(relativePath);
  const stat = fs.statSync(safePath);
  return {
    path: relativePath,
    name: path.basename(safePath),
    ext: path.extname(safePath).toLowerCase(),
    size: stat.size,
    mtime: stat.mtime,
  };
}

module.exports = {
  getFileTree,
  resolveSafePath,
  readFile,
  getFileInfo,
  isAllowedFile,
};
