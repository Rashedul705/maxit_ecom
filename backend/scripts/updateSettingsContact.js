const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://m4xitraj_db_user:MNaWAnqeEscpG1VX@maxitshop.mcehlek.mongodb.net/maxitshop?retryWrites=true&w=majority';

async function updateSettings() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const col = mongoose.connection.db.collection('settings');
    await col.updateMany({}, {
      $set: {
        email: 'sales@m4xit.com',
        phone: '+8801733-272445',
        'contact.email': 'sales@m4xit.com',
        'contact.phone': '+8801733-272445',
        'contact.address': 'Head Office: Afroza Tower, 4th Floor, Uposhohor Newmarket, Rajshahi | LAB Office: Afroza Tower, 2nd Floor, Uposhohor Newmarket, Rajshahi',
        'header.hotline': '+8801733-272445'
      }
    });

    console.log('Settings updated successfully with sales@m4xit.com and +8801733-272445');
    process.exit(0);
  } catch (err) {
    console.error('Error updating settings:', err);
    process.exit(1);
  }
}

updateSettings();
