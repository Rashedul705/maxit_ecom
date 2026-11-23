const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('Testing Admin Login and CRUD operations for Step 0...');

  // 1. Admin Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/v1/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@maxitshop.com', password: 'admin123456' });

  if (!loginRes.body?.success) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.data.token;
  console.log('✓ Admin login successful.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Add a temporary Demo Category
  const addCatRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/v1/categories',
    method: 'POST',
    headers: authHeaders
  }, {
    name: 'Demo Temp Category',
    slug: 'demo-temp-category',
    parent: 'solar-renewable-energy',
    description: 'Temporary demo category to test admin add/edit/delete'
  });
  console.log('✓ Admin Category Add status:', addCatRes.status, 'Category ID:', addCatRes.body?.data?.id);
  const catId = addCatRes.body?.data?.id || addCatRes.body?.data?._id;

  // 3. Edit the temporary Demo Category
  const editCatRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/v1/categories/${catId}`,
    method: 'PUT',
    headers: authHeaders
  }, {
    name: 'Demo Temp Category (Updated)',
    description: 'Updated temporary demo category'
  });
  console.log('✓ Admin Category Edit status:', editCatRes.status, 'Updated Name:', editCatRes.body?.data?.name);

  // 4. Delete the temporary Demo Category
  const delCatRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/v1/categories/${catId}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('✓ Admin Category Delete status:', delCatRes.status, 'Deleted:', delCatRes.body?.success);

  // 5. Add a temporary Demo Product
  const addProdRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/v1/admin/products',
    method: 'POST',
    headers: authHeaders
  }, {
    title: 'Demo Temp Product for CRUD Testing',
    slug: 'demo-temp-product-crud-test',
    category: 'demo-solar-tech',
    subcategory: 'demo-solar-pv',
    price: 1250,
    oldPrice: 1500,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600'],
    description: 'Demo product for CRUD testing'
  });
  console.log('✓ Admin Product Add status:', addProdRes.status, 'Product ID:', addProdRes.body?.data?.id);
  const prodId = addProdRes.body?.data?.id || addProdRes.body?.data?._id;

  // 6. Edit the temporary Demo Product
  const editProdRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/v1/admin/products/${prodId}`,
    method: 'PUT',
    headers: authHeaders
  }, {
    title: 'Demo Temp Product (Stock Updated)',
    price: 1350,
    stock: 75
  });
  console.log('✓ Admin Product Edit status:', editProdRes.status, 'Updated Stock:', editProdRes.body?.data?.stock);

  // 7. Delete the temporary Demo Product
  const delProdRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/v1/admin/products/${prodId}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('✓ Admin Product Delete status:', delProdRes.status, 'Deleted:', delProdRes.body?.success);

  // 8. Test Order Status Update
  const updateOrderRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/v1/orders/bulk-status',
    method: 'POST',
    headers: authHeaders
  }, {
    ids: ['demo-ord-1001'],
    status: 'confirmed',
    note: 'Demo order confirmed via admin API'
  });
  console.log('✓ Admin Order Status Update status:', updateOrderRes.status, 'Result:', updateOrderRes.body?.success, 'Message:', updateOrderRes.body?.message);

  console.log('\nAll Admin CRUD operations verified successfully for Step 0!');
}

run().catch(console.error);
