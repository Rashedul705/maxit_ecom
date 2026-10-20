# DESIGN SPECIFICATION: maxitshop (inspired by BDShop.com)

## 1. Executive Summary & Design Principles
maxitshop is designed to provide an ultra-fast, mobile-first, conversion-optimized shopping experience tailored for consumers across Bangladesh. Inspired by BDShop's high-density, informative, and trust-oriented e-commerce layout, maxitshop adopts a refined, modern aesthetic with sharp visual hierarchy, clear BDT pricing, and seamless checkout flows.

Reference screenshots are archived in `docs/reference/`:
- `desktop_home.png`
- `desktop_category.png`
- `desktop_product.png`
- `desktop_cart.png`
- `mobile_home.png`

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code | Purpose & Application |
|---|---|---|
| `primary` / `brand` | `#2563EB` (Blue-600) | Primary branding, primary CTA buttons, active state highlights, primary links |
| `primary-hover` | `#1D4ED8` (Blue-700) | Button hover states, active menu hover |
| `secondary` / `accent` | `#F97316` (Orange-500) | "Buy Now" urgent CTA, hot highlights, notice alerts |
| `secondary-hover` | `#EA580C` (Orange-600) | Secondary CTA hover states |
| `deal-accent` | `#F59E0B` (Amber-500) | Flash deals, star ratings, promo tag accents |
| `background-page` | `#F8FAFC` (Slate-50) | Main background for high contrast card display |
| `background-surface` | `#FFFFFF` (White) | Card backgrounds, drawer panels, modal surfaces |
| `background-subtle` | `#F1F5F9` (Slate-100) | Top bar, table headers, inactive filter chips |
| `text-primary` | `#0F172A` (Slate-900) | Product titles, main headings, critical data |
| `text-secondary` | `#475569` (Slate-600) | Body copy, descriptions, specifications labels |
| `text-muted` | `#94A3B8` (Slate-400) | Strikethrough old prices, breadcrumbs, placeholders |
| `price-current` | `#2563EB` | Prominent current selling price (৳) |
| `price-discount` | `#DC2626` (Red-600) | Discount percentages (`-17% OFF`), "Save ৳X" tags, stock urgency |
| `badge-discount-bg`| `#FEF2F2` (Red-50) | Background for percentage discount badge |
| `badge-discount-text`| `#DC2626` | Text for discount badge |
| `badge-stock-in` | `#ECFDF5` / `#059669` | "In Stock" pill badge |
| `border-subtle` | `#E2E8F0` (Slate-200) | Card borders, dividers, table borders |
| `border-strong` | `#CBD5E1` (Slate-300) | Form input borders, active tabs |

---

## 3. Typography & Hierarchy

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Headings**:
  - `H1` (Page / Hero Titles): 24px - 32px (mobile) to 36px (desktop), font-weight: 700
  - `H2` (Section Titles): 20px - 24px, font-weight: 700, uppercase letter-spacing: 0.025em, with color accent bar or icon
  - `H3` (Card / Sub-headings): 15px - 16px, font-weight: 600
- **Body & Captions**:
  - Regular Body: 14px (0.875rem), line-height: 1.5, font-weight: 400
  - Compact Meta / Spec text: 12px - 13px, font-weight: 400 or 500
- **Pricing & Actions**:
  - Product Card Price: 16px - 18px, font-weight: 700
  - Product Detail Main Price: 26px - 30px, font-weight: 800
  - Buttons: 14px - 15px, font-weight: 600, tracking-wide

---

## 4. Header & Navigation Architecture

### A. Top Utility Bar
- Height: 34px - 38px, background `#0F172A` (or light `#F1F5F9`)
- Content:
  - Left: Customer Hotline & WhatsApp helpline: `+880 1700-000000` | 9:00 AM - 10:00 PM
  - Right: "Track Order" link, "About Us", "Contact Us", currency indicator (BDT ৳)

### B. Main Header
- Sticky on scroll (desktop & mobile) with subtle drop shadow (`shadow-md`)
- Left: Text Logo `maxitshop` with subtle tech icon/pill badge
- Center: High-visibility Search Input:
  - Integrated search category dropdown / placeholder "Search for products, brands, or categories..."
  - Search button with magnifying icon (brand color)
  - Live interactive suggestions modal displaying matching products with thumbnails and prices
- Right:
  - Track Order shortcut icon
  - User Account / Login trigger
  - My Cart trigger with item count badge (e.g. `2`) and total price preview (e.g. `৳1,850`)

### C. Category Navigation Bar (Desktop) & Mega Menu
- "Shop by Category" button with hamburger icon on left:
  - Hover or click reveals multi-tier dropdown mega-menu listing all 6 top categories and their respective subcategories
- Horizontal navigation links:
  - Home, Deals of the Day (with flame badge), New Arrivals, Featured, Laptops, Mobile Phones, Accessories, Track Order

### D. Mobile Header & Drawer
- Mobile viewport (<= 768px):
  - Compact top row: Hamburger button, `maxitshop` logo, Cart button with badge
  - Full-width search bar underneath
  - Sliding Drawer navigation triggered by hamburger:
    - Search input
    - Category tree with expandable subcategories
    - Quick links: Track Order, Deals, Customer Support, Contact
    - Hotline contact button

---

## 5. Home Page Sections & Grid Layout

The home page follows BDShop's high-conversion section rhythm:

1. **Hero Banner & Category Sidebar Section**:
   - Desktop: Left vertical category list (or full width carousel with quick banner tiles on right).
   - Mobile: 100% width swipeable responsive banner slider (aspect 16:7).
2. **Key Selling Points / Trust Badges Bar**:
   - 4 items: "Cash on Delivery across BD", "Fast 2-3 Days Delivery", "7 Days Replacement Guarantee", "100% Genuine Products".
3. **Category Icons Quick Bar**:
   - Circular/Rounded cards of top 6 categories with clear SVG icons and titles.
4. **Deals of the Day (Hot Deals)**:
   - Header with flame/countdown timer accent and "View All" link.
   - Horizontal scroll / grid (2 cols mobile, 3 cols tablet, 5 cols desktop).
5. **New Arrivals Section**:
   - Highlighting latest gadgets and consumer electronics.
   - 2 cols mobile, 3 cols tablet, 5 cols desktop.
6. **Featured Categories Showcase**:
   - Section for "Mobile Phones & Gadgets", "Laptops & Computing", "Solar & Green Energy" with mini promo banners alongside product grids.
7. **"Specially for You" Infinite Grid**:
   - Curated product discovery feed with a prominent "Load More" button.

---

## 6. Product Card Anatomy

Each product card is designed to maximize click-through and purchase intent:
- **Card Container**: White background, `rounded-xl`, `border border-slate-200`, `p-3`, transition `hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5`.
- **Image Container**: Aspect ratio 1:1 (`aspect-square`), relative position, overflow-hidden, rounded-lg, smooth zoom on hover (`group-hover:scale-105`).
- **Badges**:
  - Top-left: Discount percentage pill (`-15% OFF`) in red with white text.
  - Top-right: "Hot Deal" or "New" badge when applicable.
- **Brand & Title**:
  - Brand name: 11px uppercase in slate-400.
  - Title: 14px slate-800 font-semibold, 2-line clamp (`line-clamp-2`), min-height 40px.
- **Stock Status**:
  - Green indicator dot with "In Stock" (or red "Out of Stock").
- **Price Block**:
  - Selling Price: 16px - 18px bold text in primary color (`৳1,450`).
  - Strikethrough Old Price: 13px line-through in slate-400 (`৳1,800`).
  - "Save ৳X": 11px font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded.
- **Action Button**:
  - Full-width or compact "Add to Order" / "Add to Cart" button with shopping bag icon.

---

## 7. Category Page Layout & Filtering

- **Breadcrumbs**: Home > Category > Subcategory
- **Layout**:
  - Desktop: 2-column layout (Sidebar 260px + Product Grid 3-4 columns).
  - Mobile: Full width with sticky "Filter & Sort" bottom bar opening filter drawer.
- **Sidebar Filters**:
  - Price Range Slider / Inputs (Min BDT - Max BDT) with Apply button.
  - Brands Checklist with count.
  - Availability (In Stock only toggle).
- **Sort Bar**:
  - Active filters pills with "Clear All".
  - Total items found (e.g. "Showing 24 products").
  - Sort dropdown: Newest First, Price: Low to High, Price: High to Low.
- **Pagination**: Numbered pagination (1, 2, 3... Next) and items per page indicator.

---

## 8. Product Detail Page Layout

- **Breadcrumbs**: Rich hierarchy breadcrumbs with JSON-LD breadcrumb schema.
- **Two-Column Main Section**:
  - **Left (45% desktop)**:
    - Main high-resolution image preview with zoom capability.
    - Thumbnails carousel underneath for multiple image views.
  - **Right (55% desktop)**:
    - Product Title: 22px - 26px font-bold text-slate-900.
    - SKU / Product ID, Brand link, Customer rating review stars.
    - Pricing Box:
      - Current price in 28px bold primary blue (`৳24,500`).
      - Old price (`৳28,000`) and "Save ৳3,500 (-12%)" badge.
    - Stock status: In Stock badge with inventory count alert.
    - Quantity Selector: Minus / input / Plus controls.
    - Two Key Action Buttons:
      - Primary CTA: "Add to Order" / "Add to Cart" (Solid Blue).
      - Immediate CTA: "Buy Now" (Solid Orange - directly navigates to Checkout with this item).
    - Delivery & Trust Perks Box:
      - Inside Dhaka: 24-48 Hours (৳80)
      - Outside Dhaka: 2-4 Days (৳130)
      - Cash on Delivery available
      - 7 Days Replacement Warranty
- **Tabs Section**:
  - Specification Table (Key-Value pairs, e.g. Processor, RAM, Battery, Warranty).
  - Detailed Description.
  - Delivery & Return Policy.
- **Related Products Carousel / Grid**: 4-5 related products from the same category.

---

## 9. Cart & Checkout (BD Localized)

### A. Cart Drawer & /cart Page
- Guest cart stored in browser `localStorage`.
- Item row: Thumbnail, title, unit price, quantity increment/decrement, remove icon.
- Delivery calculation preview.
- Subtotal, Total, "Proceed to Checkout" button.

### B. Checkout Page (/checkout)
- Single-page high-converting checkout.
- Customer Information:
  - Full Name, Mobile Phone (validated for BD 11-digit format `01XXXXXXXXX`), Detailed Address.
  - Cascading Location dropdowns:
    - Division (e.g. Dhaka, Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh)
    - District (e.g. Dhaka, Gazipur, Narayanganj, etc.)
    - Area / Thana (e.g. Mirpur, Dhanmondi, Gulshan, Uttara, etc.)
- Delivery Charge Calculation:
  - Division = Dhaka -> ৳80 Inside Dhaka delivery.
  - Outside Dhaka -> ৳130 Outside Dhaka delivery.
- Payment Method:
  - Cash on Delivery (COD) selected by default with clear instructions: "Pay with cash upon delivery to your doorstep."
- Order Notes / Instructions.
- Order Summary Sidebar with items breakdown, subtotal, shipping charge, and grand total.
- Place Order CTA button -> creates order via `POST /api/v1/orders` and redirects to confirmation.

---

## 10. Track Order Page (/track-order)
- Clean card with: Order Number input (e.g. `ORD-1729456-8291`) and Customer Phone Number.
- Status Visual Timeline:
  - Step 1: Order Placed (Time & Date)
  - Step 2: Processing / Confirmed
  - Step 3: Shipped / Handed to Courier
  - Step 4: Delivered
- Full breakdown of customer details, items ordered, and delivery charge.

---

## 11. Footer Structure
- Background: `#0F172A` (Dark slate) with light text for premium contrast.
- 4 Columns:
  1. About maxitshop: Logo, mission statement, hotline, email, trade license info, office address in Dhaka.
  2. Customer Care: Track Order, Shipping & Delivery, Return Policy, FAQ, Contact Us.
  3. Quick Links: About Us, Privacy Policy, Terms & Conditions, Deals, New Arrivals.
  4. Payment & Security: Accepted payment badges (Cash on Delivery, bKash, Nagad, Visa/Mastercard), SSL secure icon.
- Bottom Bar: Copyright © 2026 maxitshop. All rights reserved.

---

## 12. Spacing, Radius, Shadows & Sticky Elements
- **Border Radius**:
  - Buttons: `rounded-lg` (8px)
  - Cards & Panels: `rounded-xl` (12px)
  - Modals & Drawers: `rounded-2xl` (16px)
  - Badges & Pills: `rounded-full` (9999px)
- **Shadows**:
  - Cards: `shadow-sm` default, `shadow-md` on hover
  - Dropdowns & Drawers: `shadow-xl`
  - Sticky Header: `shadow-sm`
- **Sticky Elements**:
  - Main Header (top: 0, z-40)
  - Mobile bottom navigation bar / filter bar on category page
  - Floating WhatsApp / Customer Support button (bottom-right: 20px, z-50)
