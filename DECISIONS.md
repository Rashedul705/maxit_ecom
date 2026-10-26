# DECISIONS.md - Architectural & Design Decisions

This document records key engineering decisions, rationale, and tradeoffs made during the redesign of `maxitshop` to match https://www.nanopowerbd.com/.

---

### Decision 1: Three-App Decoupled Architecture
- **Context**: The project requires separating the system into three distinct applications:
  1. `api`: Backend REST API with MongoDB & Mongoose.
  2. `storefront`: Customer-facing web store matching the reference site.
  3. `admin`: Dedicated management dashboard for staff and administrators.
- **Decision**:
  - `api`: Built with Node.js, Express, and Mongoose. To guarantee immediate runnable status on localhost before the user supplies live MongoDB credentials, Mongoose gracefully connects when `MONGODB_URI` is provided and falls back to a high-fidelity in-memory seed database so all endpoints operate instantly.
  - `storefront`: Built with Next.js (App Router), Tailwind CSS, Lucide Icons, and responsive mobile-first components. This delivers high SEO score, server-side pre-rendering, and instant page transitions.
  - `admin`: Built with Vite + React + Tailwind CSS + Lucide Icons. Provides a blazing-fast SPA administrative dashboard with real-time CRUD, status badges, modals, and printable invoices.

---

### Decision 2: Port Allocation Strategy (macOS & Multi-Project Safety)
- **Context**: On macOS, port `5000` is reserved by the OS AirPlay Receiver (`ControlCenter`). Additionally, ports `3000` and `5001` may have collisions if other local development servers are active.
- **Decision**:
  - **API Port**: `5002` (configurable via `PORT` in `.env`)
  - **Storefront Port**: `3000` (with fallback to `3001`)
  - **Admin Port**: `5173` (Vite default, with fallback to `3002`)
  - All ports are parameterized in `.env` and `.env.example` templates.
  - Express CORS middleware in `api` explicitly permits all these development origins as well as production domains.

---

### Decision 3: Currency & Bangladesh E-commerce Ergonomics
- **Context**: The store serves Bangladeshi customers purchasing solar energy, electronics, batteries, and appliances.
- **Decision**:
  - **Currency**: Always use Bangladeshi Taka with symbol `৳` (e.g., `৳7,200`).
  - **Zero Price Logic**: When a product price is `0`, display "Call for price" instead of `৳0.00`.
  - **Direct "অর্ডার করুন" (Order Now) Behavior**:
    - Clicking "অর্ডার করুন" on the product card or product detail immediately adds the product (quantity 1) to the active cart and redirects directly to `/customer/checkout` for maximum conversion.
    - An alternative "Add to Cart" button opens the slide-over cart drawer for multi-item shoppers.
  - **Delivery Areas**: Pre-configured for Inside Dhaka (৳60) and Outside Dhaka (৳120).

---

### Decision 4: Seed Data & Placeholders
- **Context**: The user instructed to use placeholder images and seed data (10 categories, 40 demo products, 10 brands, 8 banners). Real photos and content will be populated via the admin panel.
- **Decision**:
  - We seed authentic category names and product specifications matching the reference site taxonomy (Solar Energy, Battery & BMS, Inverters, Microcontrollers, IGBTs, Sensors, etc.).
  - High quality, fast Unsplash / SVG placeholder images are used so visual aesthetics are sharp without external 404 broken image risks.
  - An initial default administrator account (`admin@maxitshop.com` / `admin123456`) and secret token (`admin_secret_token_123`) are pre-seeded.
