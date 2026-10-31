const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");

function fetchPage(page) {
  return new Promise((resolve, reject) => {
    const url = `https://www.startech.com.bd/server-networking?page=${page}`;
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const $ = cheerio.load(data);
        const items = [];
        $(".p-item").each((i, el) => {
          const title = $(el).find(".p-item-name a").text().trim();
          const href = $(el).find(".p-item-name a").attr("href");
          const priceText = $(el).find(".p-item-price").text().trim();
          const statusText = $(el).find(".actions span, .p-item-stock").text().trim();
          if (title && href) {
            items.push({ title, href, priceText, statusText });
          }
        });
        resolve({ page, count: items.length, items });
      });
    }).on("error", reject);
  });
}

async function main() {
  console.log("Inspecting server-networking pages 1 to 17...");
  const allItems = [];
  const seenUrls = new Set();
  let duplicates = 0;

  for (let p = 1; p <= 17; p++) {
    const res = await fetchPage(p);
    console.log(`Page ${p}: ${res.count} products`);
    res.items.forEach(it => {
      if (seenUrls.has(it.href)) {
        duplicates++;
      } else {
        seenUrls.add(it.href);
        allItems.push(it);
      }
    });
    // Brief delay
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Total unique items collected: ${allItems.length} (Duplicates: ${duplicates})`);
  fs.writeFileSync("output/server_networking_listing_summary.json", JSON.stringify(allItems, null, 2));
}

main().catch(console.error);

