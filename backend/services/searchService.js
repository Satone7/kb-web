const fs = require('fs');
const path = require('path');
const config = require('../config');
const { isAllowedFile } = require('./fileService');

function searchFiles(query, maxResults = 50) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  function walk(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, entryRelPath);
      } else if (entry.isFile() && isAllowedFile(entry.name)) {
        const nameMatch = entry.name.toLowerCase().includes(lowerQuery);
        let contentMatch = false;
        let snippet = '';

        if (!nameMatch) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lowerContent = content.toLowerCase();
            const idx = lowerContent.indexOf(lowerQuery);
            if (idx !== -1) {
              contentMatch = true;
              const start = Math.max(0, idx - 60);
              const end = Math.min(content.length, idx + query.length + 100);
              snippet = content.slice(start, end);
            }
          } catch (e) {
            // ignore unreadable files
          }
        }

        if (nameMatch || contentMatch) {
          results.push({
            path: entryRelPath,
            name: entry.name,
            type: nameMatch ? 'name' : 'content',
            snippet: snippet || '',
          });
          if (results.length >= maxResults) return;
        }
      }
    }
  }

  walk(config.KB_ROOT);
  return results;
}

module.exports = { searchFiles };
