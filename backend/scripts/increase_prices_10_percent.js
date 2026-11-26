const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

async function run(dryRun = true) {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const products = await Product.find({ price: { $gt: 0 } }).lean();
  console.log(`Found ${products.length} products with price > 0`);

  let updatedCount = 0;
  const sampleChanges = [];

  const bulkOps = [];

  for (const p of products) {
    const oldP = p.price;
    const oldRegular = p.oldPrice || 0;

    const newPrice = Math.round(oldP * 1.10);
    let newOldPrice = oldRegular > 0 ? Math.round(oldRegular * 1.10) : 0;
    if (newOldPrice > 0 && newOldPrice < newPrice) {
      newOldPrice = newPrice;
    }

    const discountPercentage = newOldPrice > newPrice
      ? Math.round(((newOldPrice - newPrice) / newOldPrice) * 100)
      : 0;

    if (newPrice !== oldP || newOldPrice !== oldRegular) {
      updatedCount++;
      if (sampleChanges.length < 10) {
        sampleChanges.push({
          id: p.id,
          title: p.title.slice(0, 45),
          price: `${oldP} -> ${newPrice}`,
          oldPrice: `${oldRegular} -> ${newOldPrice}`,
          discount: `${discountPercentage}%`
        });
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              price: newPrice,
              oldPrice: newOldPrice,
              discountPercentage
            }
          }
        }
      });
    }
  }

  console.log(`Total products to update: ${updatedCount}`);
  console.log('Sample price adjustments (+10%):');
  console.table(sampleChanges);

  if (!dryRun) {
    console.log('Executing bulk update in MongoDB...');
    const chunkSize = 1000;
    for (let i = 0; i < bulkOps.length; i += chunkSize) {
      const chunk = bulkOps.slice(i, i + chunkSize);
      const res = await Product.bulkWrite(chunk);
      console.log(`Chunk ${Math.floor(i / chunkSize) + 1}: modified ${res.modifiedCount}`);
    }
    console.log('All products successfully updated in MongoDB Atlas!');

    // Also sync local JSON fallbacks if present
    const fs = require('fs');
    const jsonPaths = [
      path.join(__dirname, '../data/products.json'),
      path.join(__dirname, '../../api/data/products.json')
    ];

    for (const jPath of jsonPaths) {
      if (fs.existsSync(jPath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(jPath, 'utf8'));
          let modifiedLocal = 0;
          const updated = raw.map(p => {
            if (p.price && p.price > 0) {
              const oldP = p.price;
              const oldRegular = p.oldPrice || 0;
              const newPrice = Math.round(oldP * 1.10);
              let newOldPrice = oldRegular > 0 ? Math.round(oldRegular * 1.10) : 0;
              if (newOldPrice > 0 && newOldPrice < newPrice) newOldPrice = newPrice;
              const discountPercentage = newOldPrice > newPrice
                ? Math.round(((newOldPrice - newPrice) / newOldPrice) * 100)
                : 0;
              modifiedLocal++;
              return {
                ...p,
                price: newPrice,
                oldPrice: newOldPrice,
                discountPercentage
              };
            }
            return p;
          });
          fs.writeFileSync(jPath, JSON.stringify(updated, null, 2), 'utf8');
          console.log(`Updated ${modifiedLocal} products in ${path.relative(process.cwd(), jPath)}`);
        } catch (jErr) {
          console.warn(`Could not update ${jPath}:`, jErr.message);
        }
      }
    }
  } else {
    console.log('DRY RUN ONLY. Pass --apply to execute changes.');
  }

  await mongoose.disconnect();
}

const isApply = process.argv.includes('--apply');
run(!isApply).catch(err => {
  console.error(err);
  process.exit(1);
});
