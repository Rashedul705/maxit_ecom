const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const rawKeys = (process.env.IMGBB_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
console.log('Available ImgBB keys:', rawKeys.length);

async function testKey(idx) {
  const key = rawKeys[idx];
  console.log(`\nTesting key [${idx}]: ${key.substring(0, 6)}...`);
  const testUrl = 'https://bdshop.com/assets/images/products/product_1783765118_6a52187e0ba99.webp';
  const res = await fetch(testUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buffer = Buffer.from(await res.arrayBuffer());
  const params = new URLSearchParams();
  params.append('image', buffer.toString('base64'));
  params.append('name', `test_key_${idx}`);

  const upRes = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: 'POST',
    body: params
  });
  const json = await upRes.json();
  console.log(`Key [${idx}] Result:`, JSON.stringify(json, null, 2));
}

async function main() {
  for (let i = 0; i < rawKeys.length; i++) {
    await testKey(i);
  }
}

main().catch(console.error);
