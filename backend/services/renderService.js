const { marked } = require('marked');
const hljs = require('highlight.js');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

marked.setOptions({
  headerIds: true,
  mangle: false,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (e) {
        // ignore
      }
    }
    return hljs.highlightAuto(code).value;
  },
});

function renderMarkdown(content) {
  const rawHtml = marked.parse(content);
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'strong', 'em', 'del', 's',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'sup', 'sub',
      'input',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'checked', 'disabled', 'type',
    ],
  });
  return cleanHtml;
}

function renderHTML(content) {
  // HTML files are displayed as-is in a sandboxed iframe.
  // No server-side sanitization — the iframe provides security isolation.
  return content;
}

module.exports = {
  renderMarkdown,
  renderHTML,
};
