/**
 * Isolated Print Service for MaxiTShop Admin
 * Renders documents into a dedicated invisible iframe so the background
 * Orders Management table and UI never leak into the print preview or printed paper.
 */

export interface PrintOptions {
  title?: string;
  pageStyle?: string;
}

export const printHtmlContent = (htmlContent: string, options: PrintOptions = {}) => {
  const { title = 'MaxiTShop Print', pageStyle = '' } = options;

  // Remove any previous print iframes
  const oldIframe = document.getElementById('maxit-isolated-print-frame');
  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'maxit-isolated-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error('Failed to access print iframe document');
    return;
  }

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @media print {
            body {
              width: 100%;
            }
          }
          ${pageStyle}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  doc.open();
  doc.write(fullHtml);
  doc.close();

  // Allow images, SVGs and fonts to finish rendering
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print execution failed:', e);
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 2500);
    }
  }, 350);
};

