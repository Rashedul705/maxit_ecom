/**
 * Migration Script: Normalize Moderator Permissions and Status
 * Run: node backend/scripts/migrate_moderator_permissions.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    const users = await User.find({});
    console.log(`📋 Found ${users.length} total users in database.`);

    let updatedCount = 0;

    for (const user of users) {
      let needsSave = false;

      // Ensure permissions is an array
      if (!Array.isArray(user.permissions)) {
        user.permissions = [];
        needsSave = true;
      }

      // Ensure isActive is boolean
      if (typeof user.isActive !== 'boolean') {
        user.isActive = true;
        needsSave = true;
      }

      // Normalize role
      if (user.role === 'admin') {
        // Keep as admin or super_admin
      } else if (!['super_admin', 'admin', 'moderator', 'customer'].includes(user.role)) {
        user.role = 'customer';
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
        updatedCount++;
        console.log(`  Updated user ${user.email} (${user.role}) - permissions: [${user.permissions.join(', ')}], isActive: ${user.isActive}`);
      }
    }

    console.log(`\n🎉 Migration completed successfully! Updated ${updatedCount} user record(s).`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

