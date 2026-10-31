require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function cleanStartechImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const prods = await Product.find({
    $or: [
      { image: { $regex: 'startech.com.bd' } },
      { images: { $regex: 'startech.com.bd' } }
    ]
  });

  console.log(`Found ${prods.length} products with startech.com.bd image URLs.`);

  for (const prod of prods) {
    const rawImages = prod.images || [];
    const validImages = rawImages.filter(img => !img.includes('startech.com.bd'));
    const pendingImages = rawImages.filter(img => img.includes('startech.com.bd'));

    let newImage = prod.image;
    if (newImage && newImage.includes('startech.com.bd')) {
      newImage = validImages[0] || '';
    }

    prod.image = newImage;
    prod.images = validImages;
    if (!prod.audit) prod.audit = {};
    prod.audit.pendingImages = pendingImages;
    prod.markModified('audit');

    await prod.save();
    console.log(`Updated ${prod.id} (${prod.slug}): validImages=${validImages.length}, pending=${pendingImages.length}`);
  }

  const remaining = await Product.countDocuments({
    $or: [
      { image: { $regex: 'startech.com.bd' } },
      { images: { $regex: 'startech.com.bd' } }
    ]
  });
  console.log(`Remaining products with startech.com.bd in DB: ${remaining}`);

  await mongoose.disconnect();
}

cleanStartechImages().catch(console.error);

