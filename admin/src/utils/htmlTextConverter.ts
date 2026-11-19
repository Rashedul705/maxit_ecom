/**
 * htmlTextConverter.ts
 * Utilities for converting messy scraped HTML descriptions to clean, human-readable plain text,
 * and converting plain text back to clean semantic HTML for storefront rendering.
 */

export function htmlToCleanPlainText(html?: string): string {
  if (!html || typeof html !== 'string') return '';

  let text = html;

  // 1. Remove comments, scripts, styles
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Headings -> clean line with ##
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, (_, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return clean ? `\n\n## ${clean}\n\n` : '';
  });

  // 3. List items -> bullet points
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return clean ? `\n• ${clean}` : '';
  });
  text = text.replace(/<\/(ul|ol)>/gi, '\n\n');

  // 4. Tables -> formatted text
  text = text.replace(/<tr[^>]*>(.*?)<\/tr>/gi, (_, content) => {
    const cells = (content.match(/<(td|th)[^>]*>(.*?)<\/(td|th)>/gi) || [])
      .map((cell: string) => cell.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    return cells.length > 0 ? `\n${cells.join(' : ')}` : '';
  });
  text = text.replace(/<\/table>/gi, '\n\n');

  // 5. Paragraphs & div closures
  text = text.replace(/<\/(p|div)>/gi, '\n\n');
  text = text.replace(/<br\s*[\/]?>/gi, '\n');

  // 6. Strip all remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // 7. Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // 8. Normalize line breaks: trim lines, max 2 consecutive line breaks
  const lines = text.split('\n').map(l => l.trim());
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function plainTextToCleanHtml(text?: string): string {
  if (!text || typeof text !== 'string') return '';

  const trimmed = text.trim();
  if (!trimmed) return '';

  // If the user already wrote full valid HTML block tags, preserve it
  if (/<(p|h[1-6]|ul|ol|table|div)\b/i.test(trimmed)) {
    return trimmed;
  }

  const blocks = trimmed.split(/\n{2,}/);
  const htmlBlocks = blocks.map(block => {
    let bTrimmed = block.trim();
    if (!bTrimmed) return '';

    // Inline formatting: **bold** -> <strong>, *italic* -> <em>, [title](url) -> <a>
    bTrimmed = bTrimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    bTrimmed = bTrimmed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    bTrimmed = bTrimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Heading format (starts with ## or #)
    if (/^#{1,6}\s+/.test(bTrimmed)) {
      const level = Math.min(3, Math.max(2, (bTrimmed.match(/^#+/)?.[0] || '').length));
      const content = bTrimmed.replace(/^#{1,6}\s+/, '').trim();
      return `<h${level}>${content}</h${level}>`;
    }

    // List format: all non-empty lines start with a bullet (•, -, *)
    const lines = bTrimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every(l => /^[•\-\*]\s+/.test(l))) {
      const lis = lines.map(l => `<li>${l.replace(/^[•\-\*]\s+/, '').trim()}</li>`).join('');
      return `<ul>${lis}</ul>`;
    }

    // Convert internal single newlines to <br />
    const withBr = bTrimmed.replace(/\n/g, '<br />');
    return `<p>${withBr}</p>`;
  });

  return htmlBlocks.filter(Boolean).join('\n\n');
}
