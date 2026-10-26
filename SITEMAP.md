# SITEMAP - maxitshop (Nanopowerbd Reference Redesign)

Comprehensive sitemap mapping every page type, layout section, and constituent component based on live study of https://www.nanopowerbd.com/.

---

## 1. Storefront Application (`/storefront`)

### 1.1 Global Layout Elements (Every Page)
- **Top Header Bar**:
  - Main Logo (`maxitshop`)
  - Live Search Bar with autocomplete dropdown (`/search?keyword=...`)
  - "Track Order" direct link with truck icon (`/customer/order-track`)
  - Cart Widget with live item count badge, flyout drawer with subtotal in BDT (`৳`), and quick "অর্ডার করুন" (Checkout) button
- **Main Navigation Bar**:
  - "ALL CATEGORIES" dropdown toggle with list icon
  - Primary Nav Links: Home, Sellers, Contact
  - User Account Menu: "Login / Sign Up" with user icon
- **Mobile Header & Navigation**:
  - Sticky Mobile Header: Hamburger menu toggle, logo, mobile cart bag with count
  - Mobile Search Bar: Full-width search input with instant results popup
  - Mobile Side Drawer: Slide-out category tree with subcategories and category icons
  - Mobile Bottom Navigation Bar (Fixed 5 icons):
    1. Category (Grid icon)
    2. Tracking (Truck icon)
    3. Home (House icon)
    4. Cart (Cart icon with item count badge)
    5. Account / Login (User icon)
- **Floating Utilities**:
  - Floating WhatsApp chat widget (`#25D366`)
  - Floating Messenger chat widget (`#0084FF`)
  - Floating side cart preview button
  - Back-to-Top scroll button
- **Global Footer**:
  - Brand identity: Logo, company tagline, phone numbers, email address
  - Mobile App download badges (Google Play, Apple App Store)
  - Column 1: Useful Links (About Us, Contact Us, Sellers, All Brands)
  - Column 2: Policies & Guides (Complaints, Order Procedure, Delivery Rules, Return Policy, Privacy Policy, Terms & Conditions)
  - Newsletter Subscription Form: Input for email + "Subscribe" button
  - Social Media Links: Facebook, Instagram, YouTube, LinkedIn, WhatsApp
  - Bottom Copyright Bar: "© 2026 maxitshop. All Rights Reserved."

---

### 1.2 Homepage (`/`)
- **Hero Banner & Category Sidebar Section**:
  - Left Vertical Category Sidebar (Desktop): 10-12 main categories with custom icons and right chevrons
  - Hero Banner Carousel: Full-width slider beside sidebar with auto-play, navigation arrows, and pagination dots
- **Categories Grid**:
  - Section title: "Categories"
  - Responsive cards with circular/rounded category image and category title
- **Hot Deals Section**:
  - Section header: "Hot Deal" with animated countdown timer
  - Product carousel/grid with flash discount badges
- **Category-wise Product Sections**:
  - E.g., "Solar Energy", "Battery, BMS & Charger", "Inverters & IPS", "Electronics Parts"
  - Section Header: Category title + "View More" link button (`/category/[slug]`)
  - Product Grid (4-6 columns desktop, 2 columns mobile):
    - Discount badge ("X% ছাড়")
    - Product thumbnail image with hover zoom
    - Truncated product title (2 lines max with ellipsis)
    - 5-Star customer rating
    - Price line: Strikethrough old price (`<del>৳ X</del>`) + Current price (`৳ Y`), or "Call for price" if price is 0
    - "অর্ডার করুন" Button (Instant Add to Cart + Redirect to Checkout)
- **Featured Brands Strip**:
  - Section header: "Brands"
  - Grid/Carousel of brand logo cards with hover border transition, linking to `/brand/[slug]`

---

### 1.3 Category Page (`/category/[slug]`)
- **Breadcrumb Navigation**: Home &rarr; Category Name
- **Sidebar Filters**:
  - Subcategory checklist / accordion
  - Brand filter checkboxes
  - Price Range Slider / Min-Max inputs (BDT)
  - In-stock availability filter
- **Product Listing Area**:
  - Category Banner & Title Header with total product count
  - Top Toolbar: Sort by (Newest, Price: Low to High, Price: High to Low, Popularity)
  - Responsive Product Card Grid (matching homepage design)
  - Pagination controls (Previous, Page Numbers, Next)

---

### 1.4 Product Detail Page (`/product/[slug]`)
- **Breadcrumb Navigation**: Home &rarr; Category &rarr; Product Title
- **Gallery Section**:
  - Large main image with magnifier zoom
  - Thumbnail carousel (multi-image selector)
- **Product Summary Details**:
  - Product title & Brand badge
  - Stock indicator ("In Stock" / "Stock Out")
  - Discount badge ("X% ছাড়")
  - Price display: New price in large bold font (`৳`), old price struck through, savings amount
  - If price is 0: "Call for price" with direct phone call button
  - Quantity selector (`-`, number input, `+`)
  - Action Buttons:
    - "Add to Cart" button (adds to drawer cart)
    - "অর্ডার করুন" / "Order Now" button (adds to cart & goes to `/customer/checkout`)
  - Trust badges: 100% Genuine, Cash on Delivery available, 7 Days Return
- **Tabs Section**:
  - Tab 1: Description (Rich HTML text, feature highlights)
  - Tab 2: Specifications (Structured key-value table)
  - Tab 3: Customer Reviews (Rating breakdown, review list, review submission form)
- **Related Products Carousel**: Products in the same category or brand

---

### 1.5 Brand Page (`/brand/[slug]`)
- **Brand Header**: Brand logo, brand name, verified manufacturer badge, brief bio
- **Brand Products Grid**: Filterable and sortable products under this brand
- **Brand Pagination**: Full pagination controls

---

### 1.6 Sellers Page (`/sellers`)
- **Sellers Grid**: List of registered merchants/sellers with logo, rating, total products, and "Visit Store" button
- **Become a Seller Banner**: Call to action for vendor registration

---

### 1.7 Shopping Flow & Checkout
- **Cart Page / Drawer (`/cart` & Flyout)**:
  - Table of items: Image, title, unit price, quantity increment/decrement, total, remove item
  - Subtotal, delivery fee estimate, grand total in BDT (`৳`)
  - Coupon code input box with "APPLY" button
  - "Proceed to Checkout" / "অর্ডার কনফার্ম করুন" button
- **Checkout Page (`/customer/checkout`)**:
  - Customer Information: Full Name, 11-digit Bangladeshi Mobile Number (`01xxxxxxxxx`)
  - Delivery Address: Street address, Division/City, District, Area selection
  - Delivery Method: Inside Dhaka (৳60) / Outside Dhaka (৳120) / Free Shipping
  - Payment Method Options:
    - Cash on Delivery (COD - Default)
    - bKash / Nagad / Online Payment placeholders
  - Order Notes (Optional instructions)
  - Order Summary sidebar: Item list, Subtotal, Delivery Charge, Coupon Discount, Grand Total
  - Big CTA Button: "অর্ডার কনফার্ম করুন" (Confirm Order)
- **Order Success Page (`/customer/order-success/[orderId]`)**:
  - Success checkmark icon & thank you message
  - Order ID & Invoice number
  - Delivery details summary
  - Direct button to "Track Order" or "Continue Shopping"

---

### 1.8 Order Tracking (`/customer/order-track`)
- **Search Form**: Order ID / Invoice ID + Mobile Phone Number
- **Tracking Results View**:
  - Order status badge (Pending, Confirmed, Shipped, Delivered, Cancelled)
  - Step-by-step progress timeline:
    1. Order Placed
    2. Processing & Confirmed
    3. Handed to Courier / Shipped
    4. Delivered
  - Itemized order breakdown and delivery address

---

### 1.9 Complaint Submission (`/complaint`)
- **Complaint Header**: Guidance text for customer support and dispute resolution
- **Form Fields**:
  - Customer Name ("নাম লিখুন")
  - Mobile Phone ("০১xxx-xxxxxx")
  - Order ID / Invoice Number (Optional)
  - Complaint Details ("আপনার সমস্যাটি বিস্তারিত লিখুন...")
  - Image Attachment (Upload defect/damage proof photo)
  - Submit Button: "অভিযোগ জমা দিন" (Submit Complaint)
- **Confirmation State**: Ticket ID generated with response time notice

---

### 1.10 Static & Policy Pages (`/page/[slug]`)
- Order Procedure (`/page/order-procedure`)
- Delivery Rules (`/page/delivery-rules`)
- Return Policy (`/page/return-policy`)
- Privacy Policy (`/page/privacy-policy`)
- Terms & Conditions (`/page/terms-conditions`)
- About Us (`/site/about-us`)
- Contact Us (`/site/contact-us`) with embedded map, phone, address, and inquiry form

---

### 1.11 Customer Auth (`/customer/login` & `/customer/register`)
- Customer Login: Phone/Email + Password, "Forgot Password", direct link to Register
- Customer Register: Name, Phone, Email, Password, Confirm Password
- Customer Account Dashboard (`/customer/account`): Profile view, recent orders, order status tracking, addresses

---

## 2. Admin Dashboard Application (`/admin`)

- **Authentication**: `/login` with JWT and secure session
- **Dashboard Overview**: KPI metric cards (Total Orders, Total Revenue, Total Products, Pending Complaints), Recent Orders table, Low Stock alerts
- **Categories Management**: List, Add, Edit, Delete with Category Name, Slug, Image upload, Icon upload, Order sequence
- **Products Management**: Data table with Search & Filters, Add Product (Multiple images, Title, Slug, Category, Brand, Price, Old Price/Discount %, Stock, Specs JSON/table, Description HTML, Hot Deal toggle), Edit, Delete
- **Brands Management**: List, Add, Edit, Delete (Brand name, Logo upload, Website)
- **Banners / Sliders Management**: Hero banner sliders, promotional cards, links, display order, active toggle
- **Orders Management**: Order list with filter by status (Pending, Confirmed, Shipped, Delivered, Cancelled), Order Details modal/view, Inline Status Change, Customer info, Printable Tax Invoice view
- **Complaints Management**: View complaints submitted by customers, review attached proof images, update complaint status (New, In Review, Resolved)
- **Newsletter Subscribers**: View and export subscriber email list
- **Pages / CMS Management**: Edit Policy pages (Order procedure, Delivery rules, Return policy, Privacy policy, Terms)
- **Sellers Management**: View, approve, or manage seller directory
- **Site Settings**: Logos (Header logo, Footer logo, Favicon), Phone numbers, Contact email, Social links (Facebook, WhatsApp, YouTube), Delivery fees, SEO meta tags

---

## 3. Backend REST API (`/api`)

- Prefix: `/api/v1`
- Endpoints:
  - `GET /health`
  - `POST /auth/admin/login`, `GET /auth/me`
  - `POST /auth/customer/register`, `POST /auth/customer/login`
  - `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
  - `GET /products`, `GET /products/:slug`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
  - `GET /brands`, `POST /brands`, `PUT /brands/:id`, `DELETE /brands/:id`
  - `GET /banners`, `POST /banners`, `PUT /banners/:id`, `DELETE /banners/:id`
  - `GET /orders`, `POST /orders`, `GET /orders/:id`, `GET /orders/track`, `PATCH /orders/:id/status`
  - `GET /complaints`, `POST /complaints`, `PATCH /complaints/:id/status`
  - `GET /sellers`, `POST /sellers`
  - `GET /pages/:slug`, `PUT /pages/:slug`
  - `GET /settings`, `PUT /settings`
  - `POST /newsletter/subscribe`, `GET /newsletter/subscribers`
  - `POST /upload` (ImgBB / local fallback)
