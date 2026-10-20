const { orders, products } = require('../data/mock');

const createOrder = async ({
  customerName,
  phone,
  address,
  division,
  district,
  area,
  items,
  paymentMethod = 'cod',
  note = ''
}) => {
  // 1. Validation
  if (!customerName || !phone || !address || !division || !district || !area) {
    const error = new Error('Please provide all required shipping details: customerName, phone, address, division, district, area');
    error.statusCode = 400;
    throw error;
  }

  // BD phone validation (e.g. 017xxxxxxxx or +88017xxxxxxxx)
  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (!/(^(?:\+?88)?01[3-9]\d{8}$)/.test(cleanPhone)) {
    const error = new Error('Please enter a valid Bangladesh mobile phone number (e.g. 017XXXXXXXX)');
    error.statusCode = 400;
    throw error;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Order must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  // 2. Stock check & Subtotal calculation
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.id || p.slug === item.id);
    if (!product) {
      const error = new Error(`Product not found: ${item.id}`);
      error.statusCode = 404;
      throw error;
    }

    const qty = parseInt(item.quantity, 10) || 1;
    if (qty <= 0) {
      const error = new Error(`Invalid quantity for product ${product.title}`);
      error.statusCode = 400;
      throw error;
    }

    if (product.stock < qty) {
      const error = new Error(`Insufficient stock for ${product.title}. Only ${product.stock} available.`);
      error.statusCode = 400;
      throw error;
    }

    // Accumulate subtotal using product server price to avoid client-side tampering
    const itemTotal = product.price * qty;
    subtotal += itemTotal;

    verifiedItems.push({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      quantity: qty,
      image: product.images[0]
    });
  }

  // 3. Delivery charge calculation
  // Inside Dhaka = ৳80, Outside Dhaka = ৳130
  const isDhaka = division.trim().toLowerCase() === 'dhaka';
  const deliveryCharge = isDhaka ? 80 : 130;
  const total = subtotal + deliveryCharge;

  // 4. Stock reduction in-memory
  for (const item of verifiedItems) {
    const product = products.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.quantity;
    }
  }

  // 5. Generate Order Number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${randomSuffix}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName: customerName.trim(),
    phone: cleanPhone,
    address: address.trim(),
    division: division.trim(),
    district: district.trim(),
    area: area.trim(),
    items: verifiedItems,
    subtotal,
    deliveryCharge,
    total,
    paymentMethod: paymentMethod.toLowerCase() === 'cod' ? 'cod' : paymentMethod,
    note: note ? note.trim() : '',
    status: 'Placed',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  return newOrder;
};

const trackOrder = async ({ orderNumber, phone }) => {
  if (!orderNumber && !phone) {
    const error = new Error('Please provide an order number or phone number to track');
    error.statusCode = 400;
    throw error;
  }

  let matched = [...orders];

  if (orderNumber) {
    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    matched = matched.filter(o => o.orderNumber.toUpperCase() === cleanOrderNumber);
  }

  if (phone) {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    matched = matched.filter(o => o.phone.includes(cleanPhone));
  }

  if (matched.length === 0) {
    const error = new Error('No orders found matching the provided order number or phone');
    error.statusCode = 404;
    throw error;
  }

  return matched;
};

module.exports = {
  createOrder,
  trackOrder
};
