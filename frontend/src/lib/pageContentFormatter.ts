/**
 * pageContentFormatter.ts
 * Formats plain text / Markdown and HTML page content into clean semantic HTML
 * with Tailwind typography for storefront policy and CMS pages.
 */

export function formatInlineMarkdown(str: string): string {
  if (!str) return '';
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-800">$1</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#FF6600] underline font-semibold hover:text-[#e05a00] transition-colors">$1</a>'
    );
}

export function renderFormattedPageContent(content?: string): string {
  if (!content || typeof content !== 'string') return '';

  let trimmed = content.trim();
  if (!trimmed) return '';

  // If the content already contains rich HTML block elements, preserve and return it
  if (/<(div|p|h[1-6]|ul|ol|table)\b/i.test(trimmed)) {
    return trimmed;
  }

  // Ensure headings have surrounding empty lines for accurate block chunking
  trimmed = trimmed.replace(/^(#{1,6}\s+[^\n]+)$/gm, '\n\n$1\n\n');

  const rawBlocks = trimmed.split(/\n{2,}/);
  const htmlBlocks: string[] = [];

  for (const rawBlock of rawBlocks) {
    const b = rawBlock.trim();
    if (!b) continue;

    // Horizontal rule: --- or ***
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(b)) {
      htmlBlocks.push('<hr class="my-6 border-gray-200" />');
      continue;
    }

    // Heading format: # or ## or ###
    if (/^#{1,6}\s+/.test(b)) {
      const hashes = b.match(/^#+/)?.[0].length || 2;
      const level = Math.min(4, Math.max(2, hashes));
      const contentText = formatInlineMarkdown(b.replace(/^#{1,6}\s+/, '').trim());
      const sizeClass = level === 2 ? 'text-xl font-bold mt-8 mb-3' : level === 3 ? 'text-lg font-bold mt-6 mb-2' : 'text-base font-semibold mt-4 mb-2';
      htmlBlocks.push(`<h${level} class="${sizeClass} text-gray-900">${contentText}</h${level}>`);
      continue;
    }

    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);

    // List detection (bullet or numbered)
    const hasListLines = lines.some(l => /^[•\-\*]\s+/.test(l) || /^\d+[\.\)]\s+/.test(l));
    if (hasListLines) {
      let currentType: 'p' | 'ul' | 'ol' | null = null;
      let currentItems: string[] = [];
      const subBlocks: string[] = [];

      const flush = () => {
        if (!currentItems.length) return;
        if (currentType === 'ul') {
          const lis = currentItems.map(i => `<li class="leading-relaxed">${formatInlineMarkdown(i)}</li>`).join('');
          subBlocks.push(`<ul class="list-disc pl-5 space-y-2 my-3 text-gray-700">${lis}</ul>`);
        } else if (currentType === 'ol') {
          const lis = currentItems.map(i => `<li class="leading-relaxed">${formatInlineMarkdown(i)}</li>`).join('');
          subBlocks.push(`<ol class="list-decimal pl-5 space-y-2 my-3 text-gray-700">${lis}</ol>`);
        } else {
          subBlocks.push(`<p class="leading-relaxed mb-3 text-gray-700">${formatInlineMarkdown(currentItems.join('<br />'))}</p>`);
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
    const formatted = formatInlineMarkdown(b).replace(/\n/g, '<br />');
    htmlBlocks.push(`<p class="leading-relaxed mb-4 text-gray-700">${formatted}</p>`);
  }

  return htmlBlocks.join('\n\n');
}
