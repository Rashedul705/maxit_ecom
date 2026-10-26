# maxitshop - E-Commerce Platform

A high-performance, mobile-first e-commerce web platform engineered for Bangladesh, redesigned to match the layout, user experience, and structure of **https://www.nanopowerbd.com/**, featuring BDT currency (`৳`), cash on delivery (COD), real-time order tracking, Bengali-friendly ergonomics, and a decoupled 3-tier architecture.

---

## Architecture Overview

The system is split into three decoupled applications:

```
maxit_ecom/
├── api/            # REST API (Node.js, Express, MongoDB/Mongoose, JWT Auth) -> Port 5002
├── storefront/     # Customer Website (Next.js 16 App Router, Tailwind CSS)   -> Port 3001
└── admin/          # Admin Dashboard SPA (Vite, React 19, Tailwind CSS)      -> Port 5173
```

| Application | Directory | Technology | Default Port | URL |
|---|---|---|---|---|
| **API Backend** | `/api` | Node.js, Express, Mongoose, JWT | `5002` | [http://localhost:5002/api/v1](http://localhost:5002/api/v1) |
| **Storefront** | `/storefront` | Next.js 16 (App Router), Tailwind CSS, Lucide | `3001` | [http://localhost:3001](http://localhost:3001) |
| **Admin Dashboard** | `/admin` | Vite, React 19, Tailwind CSS, Lucide | `5173` | [http://localhost:5173](http://localhost:5173) |

*(Note: Port `5000` is reserved on macOS by the AirPlay Receiver `ControlCenter`, so the API runs on `5002` to guarantee zero port conflicts).*

---

## Quick Start (How to Run Locally)

You can run all three applications simultaneously in separate terminal windows:

### 1. API Backend (`/api`)
```bash
cd api
npm install
npm run dev
```
- API Base URL: `http://localhost:5002/api/v1`
- Health Check: `http://localhost:5002/api/v1/health`

### 2. Storefront Customer Web App (`/storefront`)
```bash
cd storefront
npm install
npm run dev -- -p 3001
```
- Customer Store: `http://localhost:3001`

### 3. Admin Panel (`/admin`)
```bash
cd admin
npm install
npm run dev
```
- Admin Dashboard: `http://localhost:5173`

---

## Default Admin Credentials

- **Admin URL**: `http://localhost:5173`
- **Email**: `admin@maxitshop.com`
- **Password**: `admin123456`
- **Static Admin Secret Token**: `admin_secret_token_123`

---

## Environment Variables Configuration

Each application has its own `.env` and `.env.example` file.

### 1. Backend API (`api/.env`)
```env
PORT=5002
MONGODB_URI=
JWT_SECRET=supersecretjwtkey_maxitshop_2026
IMGBB_API_KEY=
ADMIN_TOKEN=admin_secret_token_123
ADMIN_EMAIL=admin@maxitshop.com
ADMIN_PASSWORD=admin123456
CLIENT_URL=http://localhost:3001
ADMIN_URL=http://localhost:5173
```

### 2. Storefront (`storefront/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5002/api/v1
```

### 3. Admin Panel (`admin/.env`)
```env
VITE_API_BASE_URL=http://localhost:5002/api/v1
```

---

## What You Need to Provide for Production

The codebase works out of the box with zero setup using seed data and automatic in-memory fallback. When you are ready to transition to full production, provide:

1. **MongoDB Connection String (`MONGODB_URI`)**:
   - Set in `api/.env` (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/maxitshop?retryWrites=true&w=majority`).
   - If empty, the backend runs in resilient in-memory mode pre-seeded with 40 demo products, 11 categories, 10 brands, 8 banners, verified sellers, and policy pages.
2. **ImgBB API Key (`IMGBB_API_KEY`)**:
   - Set in `api/.env` to enable live direct image uploads from the admin dashboard to the ImgBB cloud CDN.
3. **Custom Brand Assets**:
   - Upload your official `maxitshop` header and footer logos via **Admin Panel &rarr; Settings &rarr; Site Settings**.
4. **Real Product Catalog**:
   - Manage categories, products, prices, and stock counts directly via the Admin Dashboard.

---

## Key Features Replicated from Reference Site (nanopowerbd.com)

1. **Header & Navigation**:
   - Top header with `maxitshop` branding, live autocomplete search dropdown, direct "Track Order" link, and dynamic cart widget showing total in Taka (`৳`) and item count.
   - Main navigation bar with **ALL CATEGORIES** toggle dropdown, Home, Sellers, Contact, and Login / Sign Up.
2. **Hero & Categories Layout**:
   - Left vertical category sidebar with 11 custom SVG category icons alongside an autoplaying hero carousel with indicators and navigation arrows.
   - Circular category thumbnail grid with hover micro-animations.
3. **Hot Deals & Product Catalog**:
   - Grouped category shelves with bold brand-orange headers and "View More" links.
   - Product cards featuring:
     - Circular red discount badge (`"X% ছাড়"`).
     - Strikethrough old price next to bold new price in BDT (`৳`).
     - `"Call for price"` display when price is 0.
     - Full-width orange `"অর্ডার করুন"` (Order Now) instant checkout button.
4. **Checkout & Order Flow**:
   - Bangladesh cascading administrative divisions and districts.
   - Automatic delivery fee calculation (Inside Dhaka `৳70`, Outside Dhaka `৳130`).
   - Cash on Delivery (COD) default payment.
   - Order confirmation screen with instant tracking link.
5. **Real-Time Order Tracking**:
   - Track order by Order Number (`ORD-...`) or Customer Phone Number.
   - 4-stage visual timeline: **Order Placed &rarr; Processing &rarr; Shipped &rarr; Delivered**.
6. **Inner Pages & CMS**:
   - Category catalog with brand filters, sort options, and pagination.
   - Product detail page with multi-image gallery, specs table, and related items.
   - Verified sellers directory with store badges and phone contact.
   - Contact page and Complaint Ticket submission form.
   - CMS policy pages: Order Procedure, Delivery Rules, Return Policy, Privacy Policy, Terms & Conditions.
7. **Mobile-First Experience**:
   - Sticky 5-tab mobile bottom navigation bar (**Category, Tracking, Home, Cart, Login**).
   - Touch-friendly drawers and responsive grid scaling.
8. **Admin Dashboard**:
   - Real-time sales and order counters.
   - Orders view with instant status updates (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).
   - **Printable Tax Invoice View** (`@media print` formatted) with invoice number, customer details, line items table, and BDT totals.
   - Full CRUD for products, categories, brands, banners, sellers, CMS pages, complaints, and newsletter subscribers.

---

## Testing the End-to-End User Flow

1. Open the Storefront at `http://localhost:3001`.
2. Browse products or search using the top header search bar.
3. Click `"অর্ডার করুন"` on any product card to go straight to checkout.
4. Fill in recipient name, phone, district, and address. Notice the delivery charge dynamically adjusts based on district.
5. Click **"কনফার্ম অর্ডার করুন"**. Note down the Order Number (e.g. `ORD-1793021900000`).
6. Click **"অর্ডার ট্র্যাক করুন"** to view the live tracking timeline.
7. Open the Admin Panel at `http://localhost:5173` and log in (`admin@maxitshop.com` / `admin123456`).
8. Navigate to **Orders** &rarr; locate the newly created order &rarr; click **"Print Invoice"** to preview the printable tax invoice.
9. Change the status from `pending` to `shipped`.
10. Return to the storefront Order Track page (`http://localhost:3001/customer/order-track`) &rarr; enter the phone number or order number &rarr; see the status updated to `Shipped` on the live timeline.

---

## Build Commands

To verify production builds:

```bash
# Verify Storefront Build (Next.js 16)
cd storefront
npm run build

# Verify Admin Dashboard Build (Vite + React 19)
cd admin
npm run build
```

---

## Documentation Links

- [SITEMAP.md](file:///Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom/SITEMAP.md) — Comprehensive sitemap of every page, section, and component.
- [DESIGN.md](file:///Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom/DESIGN.md) — Design tokens, color palette, typography, and component styling.
- [DECISIONS.md](file:///Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom/DECISIONS.md) — Technical and architectural decisions log.
- [PROGRESS.md](file:///Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom/PROGRESS.md) — Phase-by-phase completion report.
