const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://m4xitraj_db_user:MNaWAnqeEscpG1VX@maxitshop.mcehlek.mongodb.net/maxitshop?retryWrites=true&w=majority';

const newOrder = [
  'solar-energy',
  'battery-bms-charger',
  'service-&-maintenance',
  'customized-circuit---pcb',
  'lt-ht-power-goods',
  'modules-&-sensor',
  'igbt-fet-diode-transistor',
  'electronics-parts',
  'safety---security',
  'tools---hardware',
  'automation-process-cont.'
];

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const col = mongoose.connection.db.collection('categories');

    for (let i = 0; i < newOrder.length; i++) {
      const slug = newOrder[i];
      const res = await col.updateOne({ slug }, { $set: { order: i + 1 } });
      console.log(`Updated ${slug} to order ${i + 1} (matched: ${res.matchedCount})`);
    }

    const all = await col.find({}).sort({ order: 1 }).toArray();
    console.log('\n--- Current Categories in DB ---');
    all.forEach(c => console.log(`${c.order}. ${c.name} (${c.slug})`));

    process.exit(0);
  } catch (err) {
    console.error('Error updating categories:', err);
    process.exit(1);
  }
}

run();
