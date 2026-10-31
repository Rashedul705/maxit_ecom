require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const SOURCE_FILE = path.join(__dirname, '../output/source_4_solar_battery.json');
const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const INSERTED_IDS_FILE = path.join(__dirname, '../output/source-4-inserted-ids.json');

async function insertSource4() {
  console.log('=== INSERTING SOURCE #4 DATA INTO MONGODB ATLAS ===');

  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Source file missing: ${SOURCE_FILE}`);
  }
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // Pre-insert verification
  const countBefore = await Product.countDocuments();
  const catCountBefore = await Category.countDocuments();
  console.log(`Pre-insert database counts: Products = ${countBefore}, Categories = ${catCountBefore}`);

  if (countBefore !== 253) {
    throw new Error(`Unexpected product count before insert: ${countBefore} (expected 253)`);
  }

  // 1. Insert/Upsert Category 'SOLAR BATTERY'
  const catToCreate = sourceData.categoriesToCreate[0];
  console.log(`Ensuring category '${catToCreate.name}' (${catToCreate.slug}) exists...`);

  await Category.bulkWrite([
    {
      updateOne: {
        filter: { slug: catToCreate.slug },
        update: {
          $setOnInsert: {
            id: catToCreate.id,
            name: catToCreate.name,
            slug: catToCreate.slug,
            order: catToCreate.order,
            isActive: catToCreate.isActive,
            image: catToCreate.image || '',
            icon: catToCreate.icon || '',
            description: catToCreate.description || ''
          }
        },
        upsert: true
      }
    }
  ]);

  // 2. Prepare Product operations (in chunks of 50)
  const products = sourceData.products;
  const insertedIds = [];
  const chunkSize = 50;

  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const ops = chunk.map(p => {
      insertedIds.push(p.id);
      return {
        insertOne: {
          document: {
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.price,
            oldPrice: p.oldPrice,
            discountPercentage: p.discountPercentage,
            category: p.category,
            categoryName: p.categoryName,
            brand: p.brand,
            productCode: p.productCode,
            stock: p.stock,
            image: p.image,
            images: p.images,
            shortDescription: p.shortDescription,
            keyFeatures: p.keyFeatures,
            warranty: p.warranty,
            description: p.description,
            specs: p.specs,
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            reviewsCount: p.reviewsCount || 0,
            isNewItem: p.isNewItem ?? true,
            isFeatured: p.isFeatured ?? false,
            isDeal: p.isDeal ?? false,
            isHotDeal: p.isHotDeal ?? false,
            sourceUrl: p.sourceUrl
          }
        }
      };
    });

    console.log(`Executing bulkWrite for chunk [${i + 1} - ${Math.min(i + chunkSize, products.length)}]...`);
    const bulkRes = await Product.bulkWrite(ops, { ordered: true });
    console.log(`Chunk inserted: ${bulkRes.insertedCount} documents.`);
  }

  // 3. Save inserted IDs for rollback safety
  fs.writeFileSync(INSERTED_IDS_FILE, JSON.stringify(insertedIds, null, 2), 'utf-8');
  console.log(`Saved ${insertedIds.length} inserted IDs to: ${INSERTED_IDS_FILE}`);

  // Post-insert counts
  const countAfter = await Product.countDocuments();
  const catCountAfter = await Category.countDocuments();
  console.log(`\nPost-insert database counts: Products = ${countAfter}, Categories = ${catCountAfter}`);

  await mongoose.disconnect();
  console.log('Database disconnected.');

  return {
    countBefore,
    countAfter,
    insertedCount: insertedIds.length,
    catCountBefore,
    catCountAfter
  };
}

if (require.main === module) {
  insertSource4().catch(err => {
    console.error('Fatal insertion error:', err);
    process.exit(1);
  });
}

module.exports = insertSource4;

