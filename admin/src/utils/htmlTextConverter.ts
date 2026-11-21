/**
 * htmlTextConverter.ts
 * Utilities for converting messy scraped HTML descriptions/pages to clean, human-readable plain text,
 * and converting plain text back to clean semantic HTML for storefront rendering.
 */

export function formatInlineText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#FF6600] underline font-medium hover:text-[#e05a00]">$1</a>');
}

export function htmlToCleanPlainText(html?: string): string {
  if (!html || typeof html !== 'string') return '';

  let text = html;

  // 1. Remove comments, scripts, styles
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Bold & Italic preservation
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => {
    const clean = c.replace(/<[^>]+>/g, '').trim();
    return clean ? `**${clean}**` : '';
  });
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => {
    const clean = c.replace(/<[^>]+>/g, '').trim();
    return clean ? `*${clean}*` : '';
  });

  // 3. Links preservation
  text = text.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return clean ? `[${clean}](${href})` : '';
  });

  // 4. Horizontal rule
  text = text.replace(/<hr\s*[\/]?>/gi, '\n\n---\n\n');

  // 5. Headings -> clean line with ## or ###
  text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    const hashes = '#'.repeat(Math.max(2, Math.min(4, parseInt(level, 10))));
    return clean ? `\n\n${hashes} ${clean}\n\n` : '';
  });

  // 6. Ordered lists: <ol><li>...</li></ol> -> 1. Item
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 1;
    const items: string[] = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRegex.exec(content)) !== null) {
      const itemContent = liMatch[1].replace(/<[^>]+>/g, '').trim();
      if (itemContent) {
        items.push(`${index++}. ${itemContent}`);
      }
    }
    return `\n\n${items.join('\n')}\n\n`;
  });

  // 7. Unordered lists: <ul><li>...</li></ul> -> • Item
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items: string[] = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRegex.exec(content)) !== null) {
      const itemContent = liMatch[1].replace(/<[^>]+>/g, '').trim();
      if (itemContent) {
        items.push(`• ${itemContent}`);
      }
    }
    return `\n\n${items.join('\n')}\n\n`;
  });

  // 8. Individual orphan <li> tags
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return clean ? `\n• ${clean}` : '';
  });

  // 9. Tables -> formatted text
  text = text.replace(/<tr[^>]*>(.*?)<\/tr>/gi, (_, content) => {
    const cells = (content.match(/<(td|th)[^>]*>(.*?)<\/(td|th)>/gi) || [])
      .map((cell: string) => cell.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    return cells.length > 0 ? `\n${cells.join(' : ')}` : '';
  });
  text = text.replace(/<\/table>/gi, '\n\n');

  // 10. Paragraphs & div closures
  text = text.replace(/<\/(p|div)>/gi, '\n\n');
  text = text.replace(/<br\s*[\/]?>/gi, '\n');

  // 11. Strip all remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // 12. Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // 13. Normalize line breaks: trim lines, max 2 consecutive line breaks
  const lines = text.split('\n').map(l => l.trim());
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function plainTextToCleanHtml(text?: string): string {
  if (!text || typeof text !== 'string') return '';

  let trimmed = text.trim();
  if (!trimmed) return '';

  // If the user wrote full valid HTML block tags, preserve it
  if (/^<(p|h[1-6]|ul|ol|table|div)\b/i.test(trimmed)) {
    return trimmed;
  }

  // Ensure headings have surrounding empty lines for robust block chunking
  trimmed = trimmed.replace(/^(#{1,6}\s+[^\n]+)$/gm, '\n\n$1\n\n');

  const blocks = trimmed.split(/\n{2,}/);
  const htmlBlocks: string[] = [];

  for (const rawBlock of blocks) {
    const b = rawBlock.trim();
    if (!b) continue;

    // Horizontal rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(b)) {
      htmlBlocks.push('<hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />');
      continue;
    }

    // Heading format (starts with ## or #)
    if (/^#{1,6}\s+/.test(b)) {
      const hashes = b.match(/^#+/)?.[0].length || 2;
      const level = Math.min(4, Math.max(2, hashes));
      const content = formatInlineText(b.replace(/^#{1,6}\s+/, '').trim());
      const fontSize = level === 2 ? '20px' : level === 3 ? '17px' : '15px';
      htmlBlocks.push(`<h${level} style="font-size: ${fontSize}; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 12px;">${content}</h${level}>`);
      continue;
    }

    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);

    // Check for list lines inside this block (mixed or pure)
    const hasListLines = lines.some(l => /^[•\-\*]\s+/.test(l) || /^\d+[\.\)]\s+/.test(l));
    if (hasListLines) {
      let currentType: 'p' | 'ul' | 'ol' | null = null;
      let currentItems: string[] = [];
      const subBlocks: string[] = [];

      const flush = () => {
        if (!currentItems.length) return;
        if (currentType === 'ul') {
          const lis = currentItems.map(i => `<li style="line-height: 1.6; margin-bottom: 6px;">${formatInlineText(i)}</li>`).join('');
          subBlocks.push(`<ul style="list-style-type: disc; padding-left: 24px; margin: 12px 0; color: #334155;">${lis}</ul>`);
        } else if (currentType === 'ol') {
          const lis = currentItems.map(i => `<li style="line-height: 1.6; margin-bottom: 6px;">${formatInlineText(i)}</li>`).join('');
          subBlocks.push(`<ol style="list-style-type: decimal; padding-left: 24px; margin: 12px 0; color: #334155;">${lis}</ol>`);
        } else {
          subBlocks.push(`<p style="line-height: 1.6; margin-bottom: 12px; color: #334155;">${formatInlineText(currentItems.join('<br />'))}</p>`);
        }
        currentItems = [];
        currentType = null;
      };

      for (const line of lines) {
        if (/^[•\-\*]\s+/.test(line)) {
          if (currentType !== 'ul') flush();
          currentType = 'ul';
          currentItems.push(line.replace(/^[•\-\*]\s+/, '').trim());
        } else if (/^\d+[\.\)]\s+/.test(line)) {
          if (currentType !== 'ol') flush();
          currentType = 'ol';
          currentItems.push(line.replace(/^\d+[\.\)]\s+/, '').trim());
        } else {
          if (currentType !== 'p') flush();
          currentType = 'p';
          currentItems.push(line);
        }
      }
      flush();
      htmlBlocks.push(subBlocks.join('\n'));
      continue;
    }

    // Standard paragraph with line breaks
    const formatted = formatInlineText(b).replace(/\n/g, '<br />');
    htmlBlocks.push(`<p style="line-height: 1.6; margin-bottom: 16px; color: #334155;">${formatted}</p>`);
  }

  return htmlBlocks.filter(Boolean).join('\n\n');
}
