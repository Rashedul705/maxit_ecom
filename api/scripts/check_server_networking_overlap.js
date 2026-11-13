require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("../models/Product");

async function checkOverlap() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const listingItems = JSON.parse(fs.readFileSync("output/server_networking_listing_summary.json", "utf8"));
  console.log(`Checking ${listingItems.length} server-networking items against existing DB products...`);

  const existingProducts = await Product.find({}, { id: 1, slug: 1, sourceUrl: 1, title: 1 }).lean();
  console.log(`Total existing products in DB: ${existingProducts.length}`);

  const existingSourceUrls = new Set(existingProducts.filter(p => p.sourceUrl).map(p => p.sourceUrl.trim()));
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  let urlMatches = 0;
  let slugMatches = 0;

  for (const item of listingItems) {
    if (existingSourceUrls.has(item.href)) {
      console.log(`[URL Match]: ${item.href} already exists in DB!`);
      urlMatches++;
    }
  }

  console.log(`Overlap check results:`);
  console.log(`  Source URL overlaps: ${urlMatches}`);
  console.log(`  Slug overlaps: ${slugMatches}`);

  await mongoose.disconnect();
}

checkOverlap().catch(console.error);
