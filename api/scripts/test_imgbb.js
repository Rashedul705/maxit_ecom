require('dotenv').config({ path: __dirname + '/../.env' });

async function testImgbb() {
  const apiKey = process.env.IMGBB_API_KEY;
  console.log('Testing imgbb with key:', apiKey ? (apiKey.substring(0, 6) + '...') : 'MISSING');
  
  const testImageUrl = 'https://www.startech.com.bd/image/cache/catalog/inverter/gospower/gospower-6kw/gospower-6kw-01-500x500.webp';
  
  // First download image buffer to ensure we bypass any hotlink protections from imgbb side
  console.log('Downloading image from Startech...');
  const imgRes = await fetch(testImageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });
  const arrayBuffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  console.log('Downloaded buffer size:', base64.length);

  console.log('Uploading to imgbb...');
  const formData = new URLSearchParams();
  formData.append('image', base64);
  
  const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });

  const json = await uploadRes.json();
  console.log('Imgbb Response status:', uploadRes.status);
  console.log('Imgbb Success:', json.success);
  if (json.data) {
    console.log('Uploaded image URL:', json.data.url);
    console.log('Display URL:', json.data.display_url);
  } else {
    console.log('Error details:', json);
  }
}

testImgbb();

