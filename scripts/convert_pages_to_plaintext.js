const mongoose = require('../backend/node_modules/mongoose');
const dotenv = require('../backend/node_modules/dotenv');
dotenv.config({ path: 'backend/.env' });

function htmlToCleanPlainText(html) {
  if (!html || typeof html !== 'string') return '';

  let text = html;

  // 1. Remove comments, scripts, styles
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Bold & Italic
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => {
    const clean = c.replace(/<[^>]+>/g, '').trim();
    return clean ? `**${clean}**` : '';
  });
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => {
    const clean = c.replace(/<[^>]+>/g, '').trim();
    return clean ? `*${clean}*` : '';
  });

  // 3. Links
  text = text.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return clean ? `[${clean}](${href})` : '';
  });

  // 4. Horizontal rule
  text = text.replace(/<hr\s*[\/]?>/gi, '\n\n---\n\n');

  // 5. Headings
  text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    const hashes = '#'.repeat(Math.max(2, Math.min(4, parseInt(level, 10))));
    return clean ? `\n\n${hashes} ${clean}\n\n` : '';
  });

  // 6. Ordered lists
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 1;
    const items = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(content)) !== null) {
      const itemContent = liMatch[1].replace(/<[^>]+>/g, '').trim();
      if (itemContent) {
        items.push(`${index++}. ${itemContent}`);
      }
    }
    return `\n\n${items.join('\n')}\n\n`;
  });

  // 7. Unordered lists
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
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

  // 9. Tables
  text = text.replace(/<tr[^>]*>(.*?)<\/tr>/gi, (_, content) => {
    const cells = (content.match(/<(td|th)[^>]*>(.*?)<\/(td|th)>/gi) || [])
      .map(cell => cell.replace(/<[^>]+>/g, '').trim())
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

  // 13. Normalize line breaks
  const lines = text.split('\n').map(l => l.trim());
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const DEFAULT_WARRANTY_CONTENT = `## Official Warranty & Guarantee Policy

At MaxiTShop, all products are 100% authentic, brand-new, and covered under standard manufacturer or MaxiTShop official service warranty.

### Warranty Coverage
• **Solar Inverters & Hybrid Systems:** 1 to 5 Years Official Manufacturer Warranty (as specified per model).
• **Lithium LiFePO4 Battery Packs & Smart BMS:** 1 to 3 Years Replacement / Service Warranty.
• **Solar Panels:** 10 to 25 Years Performance Output Guarantee.
• **Electronics, ESP Modules, & Accessories:** 7 Days Replacement Warranty against manufacturing defects.

### Warranty Terms & Conditions
1. **Original Invoice & Warranty Card:** Please retain your delivery invoice number or warranty card for all warranty claims.
2. **Physical / Liquid Damage Void:** The warranty does not cover physical breakage, water damage, burn marks from short circuit, or reverse polarity connection.
3. **Claim Process:** Submit a claim through our customer support or complaints portal with your Order ID and photo/video proof.
4. **Resolution Period:** Warranty repairs or replacements are typically resolved within 3 to 7 working days.`;

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    const Page = mongoose.connection.collection('pages');
    const pages = await Page.find({}).toArray();

    console.log(`Found ${pages.length} pages in database.`);

    for (const page of pages) {
      console.log(`\nProcessing: ${page.slug} (${page.title})`);
      let cleanContent = '';

      if (!page.content || page.content.trim() === '') {
        if (page.slug === 'warranty-policy') {
          cleanContent = DEFAULT_WARRANTY_CONTENT;
          console.log(`  -> Initialized empty warranty-policy with standard plain text content.`);
        }
      } else {
        cleanContent = htmlToCleanPlainText(page.content);
        console.log(`  -> Converted content (length ${page.content.length} -> ${cleanContent.length})`);
      }

      await Page.updateOne(
        { _id: page._id },
        {
          $set: {
            content: cleanContent,
            updatedAt: new Date()
          }
        }
      );
      console.log(`  -> Saved cleaned plain text to MongoDB.`);
    }

    // Also update settings.policies
    const Setting = mongoose.connection.collection('settings');
    const setting = await Setting.findOne({});
    if (setting && setting.policies) {
      console.log('\nCleaning settings.policies...');
      const cleanedPolicies = {
        terms: setting.policies.terms ? htmlToCleanPlainText(setting.policies.terms) : '',
        privacy: setting.policies.privacy ? htmlToCleanPlainText(setting.policies.privacy) : '',
        returnPolicy: setting.policies.returnPolicy ? htmlToCleanPlainText(setting.policies.returnPolicy) : '',
        shipping: setting.policies.shipping ? htmlToCleanPlainText(setting.policies.shipping) : '',
        warranty: setting.policies.warranty && setting.policies.warranty.trim()
          ? htmlToCleanPlainText(setting.policies.warranty)
          : DEFAULT_WARRANTY_CONTENT
      };

      await Setting.updateOne(
        { _id: setting._id },
        { $set: { policies: cleanedPolicies, updatedAt: new Date() } }
      );
      console.log('Successfully updated settings.policies in MongoDB.');
    }

    console.log('\nAll pages & policies successfully converted to clean plain text!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
