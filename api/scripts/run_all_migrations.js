const fs = require('fs');
const path = require('path');
const { runCategory } = require('./migrate_category');

const CATEGORIES = [
  'solar_package',
  'solar_inverter',
  'solar_battery',
  'solar_accessories',
  'smart_home_iot',
  'wind_energy',
  'solar_panels',
  'solar_station'
];

async function main() {
  const summaryReport = [];

  for (const cat of CATEGORIES) {
    console.log(`\n======================================================`);
    console.log(`>>> STARTING CATEGORY: ${cat}`);
    console.log(`======================================================\n`);
    try {
      const res = await runCategory(cat);
      summaryReport.push(res);
      fs.writeFileSync(
        path.join(__dirname, '../../migration_summary.json'),
        JSON.stringify(summaryReport, null, 2),
        'utf-8'
      );
    } catch (e) {
      console.error(`[FATAL] Error running category ${cat}:`, e);
      summaryReport.push({ category: cat, error: e.message });
    }
  }

  console.log('\nAll categories finished! Summary:');
  console.log(JSON.stringify(summaryReport, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

