# maxitshop

A high-performance, mobile-first e-commerce web platform engineered for Bangladesh, featuring genuine solar power solutions, flagship smartphones, laptops, and smart appliances. Layout, structural hierarchy, and user journey are closely inspired by **BDShop.com**, with custom branding (`maxitshop`), BDT currency (৳), and cash on delivery (COD).

## Architecture & Ports

| Application | Technology Stack | Port | Local URL |
|---|---|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Lucide | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | Node.js, Express, CORS, Dotenv | `5000` | [http://localhost:5000](http://localhost:5000) |

---

## Commands to Run Both Apps

### 1. Run Backend Server (Port 5000)
```bash
cd backend
npm install
npm run dev
# Or for direct execution: node server.js
```
- API Base URL: `http://localhost:5000/api/v1`
- Health Endpoint: `http://localhost:5000/api/v1/health`

### 2. Run Frontend Storefront & Admin (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
- Customer Store: `http://localhost:3000`
- Staff Admin Portal: `http://localhost:3000/admin`
- Default Admin Token: `admin_secret_token_123`

### 3. Production Build Validation
```bash
cd frontend
npm run build
```

---

## What is Done

1. **Workspace & Architecture**:
   - Clean decoupled full-stack layout (`frontend/`, `backend/`, `docs/reference/`).
   - Strict security `.gitignore` and `.env.example` templates ensuring no secrets or environment files are tracked.
   - Comprehensive design specification in `DESIGN.md` based on real browser study of BDShop.
2. **Express Backend (`backend/`)**:
   - Structured controllers, services, routes, middleware, and utils.
   - Decoupled data layer (`data/mock.js`) ready for MongoDB / Mongoose models without altering API routes.
   - 6 categories with subcategories (Solar & Green Energy, Mobile Phones, Laptops, Smart Watches, Home Appliances, Accessories).
   - 40 realistic products with rich specs, descriptions, stock, and BDT pricing.
   - 4 promotional hero banners.
   - Automated order calculations (Dhaka ৳80, Outside Dhaka ৳130, stock decrement).
   - Admin protected endpoints (`GET /admin/orders`, `PATCH /admin/orders/:id/status`, `POST/PUT/DELETE /admin/products`).
3. **Customer Shop (`frontend/src/app/(shop)/`)**:
   - **Header & Navigation**: Sticky header with text logo `maxitshop`, debounced live search suggestions popup, Track Order shortcut, and real-time Cart drawer trigger.
   - **Mega Menu**: Desktop category flyout with subcategories, and mobile drawer with expandable accordion.
   - **Home Page**: Hero banner carousel with autoplay, trust strip (COD, 2-3 days shipping, 100% genuine, 7-day replacement), category icon circles, Deals of the Day, New Arrivals, Featured, and infinite discovery grid "Specially for You" with Load More.
   - **Category Page (`/category/[slug]`)**: Price range filter, brand checklist, sorting (Newest, Price Low-High, Price High-Low), pagination, and subcategory pills.
   - **Product Detail Page (`/product/[slug]`)**: Image gallery with thumbnails, BDT pricing with "Save ৳X (-Y%)" badge, stock indicator, quantity selector, "Add to Order" and direct "Buy Now", specs tabs, related products, and Google Schema.org JSON-LD markup.
   - **Cart & Checkout**: Slide-over cart drawer, full cart page (`/cart`), and single-page checkout (`/checkout`) with Bangladesh division/district/area cascading dropdowns, delivery fee calculation, and order placement.
   - **Track Order (`/track-order`)**: Order progress step timeline (Placed → Processing → Shipped → Delivered).
   - **Static Pages**: About Us, Contact, FAQ, Shipping & Returns, Privacy Policy, Terms & Conditions.
4. **Admin Panel (`frontend/src/app/admin/`)**:
   - Protected by Next.js middleware with temporary token login.
   - Overview Dashboard with KPI stats (total orders, total revenue, active products, low stock alerts).
   - Products management table with search, Add Product modal, Edit Product modal, and Delete.
   - Orders management table with status filtering, inline status update dropdown, and Printable Tax Invoice modal.

---

## What is Next (Production Roadmap)

1. **MongoDB with Mongoose Migration**:
   - Replace in-memory `backend/data/mock.js` by connecting Mongoose schemas (`Product`, `Category`, `Order`, `Banner`) inside `backend/services/` directly.
2. **Image Upload via ImgBB**:
   - Connect `IMGBB_API_KEY` to allow multipart image uploads in `POST /api/v1/admin/products` and auto-generate thumbnail URLs.
3. **User Authentication & Customer Dashboard**:
   - Replace the dev `ADMIN_TOKEN` with JWT authentication (access & refresh tokens) and customer account management.
4. **Payment Gateway Integration**:
   - Integrate automated bKash, Nagad, and SSLCommerz payment gateways alongside Cash on Delivery.
5. **Courier API Logistics**:
   - Hook into Bangladesh courier APIs (Steadfast, Pathao, RedX) to automatically create courier consignments upon order placement.
6. **SMS Notifications**:
   - Connect SMS gateway (e.g. Greenweb, BulkSMSBD) for instant order confirmation and dispatch SMS messages to customer mobile numbers.
