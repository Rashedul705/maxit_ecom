# DESIGN.md - maxitshop Design System Specification

Design specifications, tokens, and aesthetic rules derived from the live study of https://www.nanopowerbd.com/, customized for `maxitshop` with BDT (`৳`) currency and Bangladesh e-commerce ergonomics.

---

## 1. Color Palette & Tokens

### 1.1 Brand & Action Colors
- **Primary Brand / Action (Call to Action)**: `#FF6600` (Vibrant Amber-Orange)
  - Used for "অর্ডার করুন" (Order Now), "Apply Coupon", Cart badges, and CTA buttons.
  - Hover: `#E65100` / `#D84315`
  - Active: `#BF360C`
- **Secondary Brand / Header Bar**: `#131A22` (Deep Navy / Charcoal Black)
  - Used for main navigation bar, footer background, and strong header accents.
  - Surface Variant: `#1A222D` / `#232F3E`
- **Tertiary Accent (Informational & Badges)**: `#0D6EFD` (Royal Blue)
  - Used for Track Order truck badge, info pills, and active filter selections.
  - Messenger Widget: `#0084FF`
  - WhatsApp Widget: `#25D366`
- **Sale & Discount Badge**:
  - Background: `#FF3B30` / `#FF6600` (Bright Crimson Orange)
  - Text: `#FFFFFF`
  - Border Radius: `50%` or `12px` rounded pill

### 1.2 Neutral & Surface Colors
- **Page Background**: `#F8F9FA` (Soft warm off-white)
- **Card & Container Surface**: `#FFFFFF` (Pure White)
- **Border Default**: `#E5E7EB` / `#EEEEEE` (Subtle 1px divider)
- **Border Muted / Hover**: `#CBD5E1` / `#D1D5DB`
- **Header Top Background**: `#FFFFFF`
- **Footer Background**: `#131A22`
- **Footer Text**: `#E8E8E8` / `#9CA3AF`

### 1.3 Typography Colors
- **Heading & Primary Text**: `#111827` / `#222222` (High contrast charcoal)
- **Secondary / Body Text**: `#4B5563` / `#666666` (Medium contrast gray)
- **Muted / Subtitle Text**: `#9CA3AF` / `#888888` (Timestamp, placeholder, specs labels)
- **Strikethrough Old Price**: `#9CA3AF` (Greyed out with line-through)
- **Current Price**: `#FF6600` / `#D84315` (Bold accent color)
- **Star Rating Fill**: `#F59E0B` (Amber 500)

---

## 2. Typography

### 2.1 Font Families
- **English / Numbers**: `'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Bengali (Bangla Text)**: `'Hind Siliguri', 'Noto Sans Bengali', sans-serif`
- **Weights**:
  - Regular: `400`
  - Medium: `500`
  - Semi-Bold: `600`
  - Bold: `700`

### 2.2 Scale & Hierarchy
| Element | Font Size | Line Height | Font Weight | Letter Spacing |
|---|---|---|---|---|
| **H1 (Page Titles)** | `24px` - `28px` | `1.3` | `700` | `-0.01em` |
| **H2 / Section Title** | `20px` - `22px` | `1.35` | `600` | `0` |
| **Product Card Title**| `14px` - `15px` | `1.4` | `500` | `0` |
| **Product Price (Current)**| `16px` - `18px` | `1.2` | `700` | `0` |
| **Product Old Price** | `13px` - `14px` | `1.2` | `400` | `0` |
| **Button Text** | `14px` - `15px` | `1` | `600` | `0.02em` |
| **Category Nav Item** | `13px` - `14px` | `1.4` | `500` | `0` |
| **Footer Links** | `13px` - `14px` | `1.6` | `400` | `0` |
| **Small Badges / Hints**| `11px` - `12px` | `1` | `600` | `0.03em` |

---

## 3. Spacing, Elevation & Shapes

### 3.1 Border Radii
- **Buttons (`.order-btn`)**: `6px` - `8px`
- **Product Cards (`.product_item`)**: `8px` - `10px`
- **Category Circular Cards**: `12px` or `50%`
- **Sale Discount Badge**: `6px` or `50%`
- **Inputs & Form Controls**: `6px` - `8px`
- **Modal Dialogs & Drawers**: `12px` - `16px`
- **Mobile Bottom Nav**: `20px 20px 0 0` (Top rounded corners)

### 3.2 Shadows & Elevation
- **Card Rest**: `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)`
- **Card Hover**: `0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`
- **Sticky Header**: `0 2px 10px rgba(0, 0, 0, 0.07)`
- **Mobile Bottom Nav**: `0 -4px 15px rgba(0, 0, 0, 0.08)`
- **Floating Action Buttons**: `0 4px 14px rgba(37, 211, 102, 0.4)` (WhatsApp), `0 4px 14px rgba(0, 132, 255, 0.4)` (Messenger)

---

## 4. Key Component Layouts & Specifications

### 4.1 Top Header & Logo Area
- **Height**: `72px` (Desktop), `60px` (Mobile)
- **Layout**: Flex row, center-aligned, container max-width `1280px`
- **Search Bar**: Centered, height `42px`, border radius `6px`, orange or dark search button on right with search icon
- **Track Order Button**: Bordered pill with truck icon and direct text
- **Cart Widget**: Icon with red/orange badge showing count, right dropdown summary with `সর্বমোট : ৳...` and direct "অর্ডার করুন" link

### 4.2 Main Nav Menu
- **Background**: `#131A22` (Dark bar)
- **Height**: `46px`
- **"ALL CATEGORIES" Button**: `#0D6EFD` or `#FF6600` or styled dark tile with list icon, fixed width matching the `col-sm-3` (approx 260px) sidebar
- **Menu Items**: Horizontal list (`Home`, `Sellers`, `Contact`), white text, hover yellow/orange
- **Login / Sign Up**: Aligned to the far right with user icon

### 4.3 Left Vertical Category Menu
- **Width**: `260px` - `280px` (col-3)
- **Container**: White background, 1px solid `#E5E7EB` border, border-radius `8px`
- **Item**:
  - Padding: `10px 14px`
  - Icon: `22px x 22px` square with clean category thumbnail/icon
  - Category Name: `13px`, font-weight 500, black text
  - Right Icon: Small gray chevron `>`
  - Hover: Background `#F3F4F6`, text color shifts to Primary `#FF6600`

### 4.4 Hero Banner Slider
- **Height**: `380px` - `420px` desktop, `180px` - `220px` mobile
- **Radius**: `8px`
- **Autoplay**: 4-5 seconds transition
- **Controls**: Soft navigation dots and left/right arrows with hover opacity

### 4.5 Product Card (`.product_item`)
- **Structure**:
  ```
  +-----------------------------------+
  | [ 10% ছাড় ]                       |
  |                                   |
  |          [ PRODUCT IMAGE ]        |
  |                                   |
  | Product Title truncated...        |
  | ★ ★ ★ ★ ★                         |
  | <del>৳ 8,000</del>  ৳ 7,200       |
  | [         অর্ডার করুন          ]   |
  +-----------------------------------+
  ```
- **Image Aspect Ratio**: `1:1` square, object-fit contain, padded
- **Sale Badge**: Positioned top-right or top-left, circular badge with percentage on top and "ছাড়" underneath
- **Title**: Truncated at 2 lines (`height: 40px`, overflow hidden, ellipsis)
- **Rating**: 5 star icons in gold
- **Pricing**: Strikethrough old price next to bold new price. If price is 0, display "Call for price"
- **Button ("অর্ডার করুন")**:
  - Full card width
  - Background `#FF6600`, text white `#FFF`, font weight 600, height `38px`
  - On click: adds product to cart and immediately redirects to `/customer/checkout`

### 4.6 Mobile Bottom Navigation
- **Height**: `60px`
- **Position**: `fixed; bottom: 0; left: 0; right: 0; z-index: 1000;`
- **Background**: `#FFFFFF` with top border-radius `16px 16px 0 0` and shadow
- **5 Tabs**:
  1. Category (`fa-th`)
  2. Tracking (`fa-truck`)
  3. Home (`fa-house`)
  4. Cart (`fa-cart-shopping` with badge)
  5. Login (`fa-user`)
- **Active State**: Primary orange icon with label

---

## 5. Responsive Breakpoints
- **Mobile Small (sm)**: `< 640px` (2 columns of product cards, full width banners, mobile bottom nav visible, desktop sidebar hidden)
- **Tablet (md)**: `640px - 768px` (2-3 columns of products)
- **Desktop (lg)**: `769px - 1024px` (3-4 columns of products, category sidebar visible)
- **Wide Desktop (xl)**: `> 1024px` (4-5 columns of products, 1280px container max-width)
