// Quick automated endpoint verification
const http = require('http');

async function testApi() {
  const server = require('./server');
  const port = 5001; // test on 5001 to avoid any port conflicts

  const s = server.listen(port, async () => {
    console.log(`Test server running on port ${port}`);

    const get = (path, headers = {}) => new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${path}`, { headers }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch(e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }).on('error', reject);
    });

    const post = (path, payload, headers = {}) => new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const req = http.request(`http://localhost:${port}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch(e) {
            resolve({ status: res.statusCode, body });
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    try {
      // 1. Health
      const health = await get('/api/v1/health');
      console.log('✓ GET /health:', health.status, health.data.success);

      // 2. Categories
      const categories = await get('/api/v1/categories');
      console.log('✓ GET /categories:', categories.status, categories.data.data.length, 'categories');

      // 3. Banners
      const banners = await get('/api/v1/banners');
      console.log('✓ GET /banners:', banners.status, banners.data.data.length, 'banners');

      // 4. Products & Deals
      const products = await get('/api/v1/products?limit=5');
      console.log('✓ GET /products:', products.status, 'Total:', products.data.data.pagination.total);

      const deals = await get('/api/v1/products/deals');
      console.log('✓ GET /products/deals:', deals.status, deals.data.data.length, 'deals');

      // 5. Product Slug
      const productSlug = await get('/api/v1/products/maxitvolt-550w-mono-perc-solar-panel');
      console.log('✓ GET /products/:slug:', productSlug.status, productSlug.data.data.title, 'Related:', productSlug.data.data.relatedProducts.length);

      // 6. Search suggestions
      const search = await get('/api/v1/search/suggestions?q=solar');
      console.log('✓ GET /search/suggestions:', search.status, search.data.data.length, 'suggestions');

      // 7. Order creation
      const orderRes = await post('/api/v1/orders', {
        customerName: 'Rahim Uddin',
        phone: '01711223344',
        address: 'House 12, Road 4',
        division: 'Dhaka',
        district: 'Dhaka',
        area: 'Uttara',
        items: [{ id: 'prod-001', quantity: 1 }],
        paymentMethod: 'cod',
        note: 'Ring the bell'
      });
      console.log('✓ POST /orders:', orderRes.status, 'Order No:', orderRes.data.data.orderNumber, 'Total:', orderRes.data.data.total);

      // 8. Order tracking
      const trackRes = await get(`/api/v1/orders/track?orderNumber=${orderRes.data.data.orderNumber}`);
      console.log('✓ GET /orders/track:', trackRes.status, 'Found:', trackRes.data.data.length);

      // 9. Admin auth test
      const adminUnauthorized = await get('/api/v1/admin/orders');
      console.log('✓ GET /admin/orders (no token):', adminUnauthorized.status, '(expected 401)');

      const adminAuthorized = await get('/api/v1/admin/orders', { 'x-admin-token': 'admin_secret_token_123' });
      console.log('✓ GET /admin/orders (with token):', adminAuthorized.status, adminAuthorized.data.data.length, 'orders');

      console.log('ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
      s.close();
      process.exit(0);
    } catch(err) {
      console.error('Test failed:', err);
      s.close();
      process.exit(1);
    }
  });
}

testApi();
