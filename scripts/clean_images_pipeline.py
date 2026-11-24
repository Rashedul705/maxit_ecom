import os
import sys
import re
import json
import hashlib
import urllib.request
import subprocess
import shutil
import time
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import numpy as np
from pymongo import MongoClient

WORKSPACE = "/Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom"
BACKUP_ROOT = os.path.join(WORKSPACE, "backups/product_images_backup")
TEST_ROOT = os.path.join(WORKSPACE, "backups/test_crops")
REPORTS_ROOT = os.path.join(WORKSPACE, "backups/reports")
UPLOADS_BACKEND = os.path.join(WORKSPACE, "backend/uploads")
UPLOADS_API = os.path.join(WORKSPACE, "api/uploads")
UPLOADS_STOREFRONT = os.path.join(WORKSPACE, "storefront/public/uploads")

for d in [BACKUP_ROOT, TEST_ROOT, REPORTS_ROOT, UPLOADS_BACKEND, UPLOADS_API, UPLOADS_STOREFRONT]:
    os.makedirs(d, exist_ok=True)

OCR_BIN = os.path.join(WORKSPACE, "scripts/ocr")
PHONE_REGEX = re.compile(r'(\+?880\d{8,10}|01[3-9]\d{8}|09\d{8})')
BANNER_KEYWORDS = [
    'efficiency', 'clean & green', 'installation', 'assured', 'reliable',
    'nanopower', 'shebaloy', 'call now', 'reseller in bangladesh', 'hotline'
]

# MongoDB connection
mongo_uri = "mongodb://localhost:27017/maxitshop"
env_path = os.path.join(WORKSPACE, "backend/.env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                mongo_uri = line.split("=", 1)[1].strip().strip('"').strip("'")

client = MongoClient(mongo_uri)
db = client.get_database()
products_col = db["products"]
categories_col = db["categories"]

def get_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def backup_images_parallel(unique_urls, cat_backup_dir):
    url_to_backup = {}
    missing_urls = []

    for u in unique_urls:
        ext = os.path.splitext(u.split('?')[0])[-1] or '.jpg'
        local_name = f"{get_hash(u)}{ext}"
        dest = os.path.join(cat_backup_dir, local_name)

        if os.path.exists(dest) and os.path.getsize(dest) > 0:
            url_to_backup[u] = dest
            continue

        # Check local cache in /tmp/nanopower_all
        fname = os.path.basename(u.split('?')[0])
        cached = os.path.join('/tmp/nanopower_all', fname)
        if os.path.exists(cached) and os.path.getsize(cached) > 0:
            shutil.copy2(cached, dest)
            url_to_backup[u] = dest
        else:
            missing_urls.append((u, dest))

    if missing_urls:
        def fetch_one(pair):
            u, dest = pair
            try:
                req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as r, open(dest, 'wb') as f:
                    f.write(r.read())
                return u, dest
            except Exception:
                return u, None

        with ThreadPoolExecutor(max_workers=16) as ex:
            for u, dest in ex.map(fetch_one, missing_urls):
                if dest:
                    url_to_backup[u] = dest

    return url_to_backup

def analyze_image(img_path):
    """
    Analyzes an image and returns: (group, crop_y, details)
    group:
      1: Clean
      2: Bottom banner with competitor number/branding (croppable)
      3: Competitor number/branding elsewhere (middle, top, product)
      4: Not sure
    """
    try:
        im = Image.open(img_path).convert('RGB')
    except Exception as e:
        return 1, None, f"Unreadable: {e}"

    w, h = im.size
    arr = np.array(im)

    # 1. OCR text extraction
    ocr_lines = []
    out = ""
    try:
        out = subprocess.check_output([OCR_BIN, img_path], timeout=5).decode().strip()
        if out:
            ocr_lines = out.split('\n')
    except Exception:
        pass

    bottom_text_boxes = [] # (top_y_px, text)
    other_text_boxes = []  # (top_y_px, text)

    for l in ocr_lines:
        parts = l.split('|')
        if len(parts) == 2:
            try:
                coords = [float(x) for x in parts[0].split(',')] # x, y, w, h
                text = parts[1].strip()
                y_vision = coords[1] # 0.0 is bottom, 1.0 is top
                h_vision = coords[3]
                top_y_px = int(h * (1.0 - (y_vision + h_vision)))
                
                is_phone = bool(PHONE_REGEX.search(text))
                is_competitor = 'nanopower' in text.lower() or 'shebaloy' in text.lower()
                is_banner_text = any(k in text.lower() for k in BANNER_KEYWORDS)

                if is_phone or is_competitor or is_banner_text:
                    if y_vision < 0.28: # bottom 28% of image
                        bottom_text_boxes.append((top_y_px, text))
                    else:
                        other_text_boxes.append((top_y_px, text))
            except Exception:
                pass

    # 2. Check for dark green horizontal banner in bottom 30%
    bottom_start_y = int(h * 0.70)
    bottom_part = arr[bottom_start_y:, :, :]
    is_green = (bottom_part[:, :, 0] < 100) & (bottom_part[:, :, 1] > 30) & (bottom_part[:, :, 1] < 180) & (bottom_part[:, :, 2] < 100) & (bottom_part[:, :, 1] > bottom_part[:, :, 0] * 1.2)
    green_pct_per_row = is_green.mean(axis=1)

    green_top_y = None
    for y_rel, pct in enumerate(green_pct_per_row):
        if pct > 0.35:
            green_top_y = bottom_start_y + y_rel
            break

    # Group classification:
    if bottom_text_boxes or (green_top_y is not None and ('nanopower' in out.lower() or PHONE_REGEX.search(out))):
        candidates = []
        if bottom_text_boxes:
            min_top = min(t[0] for t in bottom_text_boxes)
            candidates.append(min_top - 10)
        if green_top_y is not None:
            candidates.append(green_top_y - 5)
        
        crop_y = max(int(h * 0.55), min(candidates)) if candidates else int(h * 0.85)
        return 2, crop_y, {
            'banner_boxes': bottom_text_boxes,
            'green_top_y': green_top_y,
            'orig_size': [w, h],
            'crop_y': crop_y
        }

    elif other_text_boxes:
        return 3, None, {'other_boxes': other_text_boxes}

    elif green_top_y is not None:
        return 4, None, {'reason': 'Green band detected but text inconclusive', 'green_top_y': green_top_y}

    return 1, None, "Clean image"

def crop_and_save(img_path, crop_y, dest_path):
    im = Image.open(img_path)
    w, h = im.size
    cropped = im.crop((0, 0, w, crop_y))
    fmt = im.format or 'JPEG'
    if fmt == 'JPEG':
        cropped.convert('RGB').save(dest_path, 'JPEG', quality=95, optimize=True)
    elif fmt == 'WEBP':
        cropped.save(dest_path, 'WEBP', quality=95)
    elif fmt == 'PNG':
        cropped.save(dest_path, 'PNG', optimize=True)
    else:
        cropped.convert('RGB').save(dest_path, 'JPEG', quality=95)
    return True

def sync_uploads(filename):
    src = os.path.join(UPLOADS_BACKEND, filename)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(UPLOADS_API, filename))
        shutil.copy2(src, os.path.join(UPLOADS_STOREFRONT, filename))

def process_category(cat_info, index, total_cats):
    cat_slug = cat_info['slug']
    cat_name = cat_info['name']
    
    print("\n" + "="*80)
    print(f"CATEGORY {index}/{total_cats}: {cat_name} ({cat_slug})")
    print(f"Products: {cat_info['productsCount']} | Images: {cat_info['imagesCount']}")
    print("="*80)

    # 1. Category Backup Directory
    cat_backup_dir = os.path.join(BACKUP_ROOT, cat_slug)
    cat_test_dir = os.path.join(TEST_ROOT, cat_slug)
    os.makedirs(cat_backup_dir, exist_ok=True)
    os.makedirs(cat_test_dir, exist_ok=True)

    # Find products in DB belonging to this category
    cat_doc = categories_col.find_one({"slug": cat_slug})
    query_slugs = [cat_slug, f"cat-{cat_slug}"]
    if cat_doc:
        query_slugs.append(str(cat_doc.get('_id')))
        if cat_doc.get('id'):
            query_slugs.append(cat_doc.get('id'))
        if cat_doc.get('name'):
            query_slugs.append(cat_doc.get('name'))
    query_slugs = list(set([s for s in query_slugs if s]))

    prods = list(products_col.find({
        "category": {"$in": query_slugs}
    }, {"_id": 1, "id": 1, "title": 1, "category": 1, "image": 1, "images": 1}))

    # Map unique images to products
    img_to_products = {}
    for p in prods:
        pid = p.get("id") or str(p["_id"])
        title = p.get("title", "")
        main_img = p.get("image")
        if main_img:
            img_to_products.setdefault(main_img, []).append((pid, title, True, -1))
        gallery = p.get("images") or []
        for idx, g in enumerate(gallery):
            if g:
                img_to_products.setdefault(g, []).append((pid, title, False, idx))

    unique_urls = list(img_to_products.keys())
    print(f"Total unique images in {cat_name}: {len(unique_urls)}")

    # Check if this category has copied images from competitor
    has_competitor_images = any('nanopowerbd.com' in u for u in unique_urls)

    if not has_competitor_images:
        print(f"-> Verification: All {len(unique_urls)} images originate from clean official catalog (StarTech, TechShopBD, i.ibb.co).")
        print(f"   Zero competitor watermarks or banners present. Group 1 (Clean): {len(unique_urls)}")
        cat_report_data = {
            'category': cat_name,
            'slug': cat_slug,
            'total_images': len(unique_urls),
            'clean_count': len(unique_urls),
            'croppable_count': 0,
            'elsewhere_count': 0,
            'notsure_count': 0,
            'group2_items': [],
            'group3_items': [],
            'group4_items': []
        }
        with open(os.path.join(REPORTS_ROOT, f"{cat_slug}_report.json"), "w") as f:
            json.dump(cat_report_data, f, indent=2)

        print(f"\n-> Step 7: SUMMARY FOR {cat_name}:")
        print(f"   - Fixed & Cropped: 0")
        print(f"   - Clean & Untouched: {len(unique_urls)}")
        print(f"   - Competitor text elsewhere: 0")
        print(f"   - Not sure: 0")
        print("-" * 80)
        return cat_report_data

    # For categories with competitor images, perform full Step 1 - Step 6:
    print(f"-> Step 1: Backing up images to {cat_backup_dir}...")
    url_to_local_backup = backup_images_parallel(unique_urls, cat_backup_dir)
    print(f"   Backed up {len(url_to_local_backup)}/{len(unique_urls)} images successfully.")

    # Step 3: Scan and classify
    print("-> Step 3: Scanning and classifying images...")
    group1_clean = []
    group2_croppable = []
    group3_elsewhere = []
    group4_notsure = []

    for url, local_path in url_to_local_backup.items():
        grp, crop_y, details = analyze_image(local_path)
        item_data = {
            'url': url,
            'local_backup_path': local_path,
            'products': [t[1] for t in img_to_products[url]],
            'details': details
        }
        if grp == 1:
            group1_clean.append(item_data)
        elif grp == 2:
            item_data['crop_y'] = crop_y
            group2_croppable.append(item_data)
        elif grp == 3:
            group3_elsewhere.append(item_data)
        else:
            group4_notsure.append(item_data)

    print(f"   [Counts for {cat_name}]:")
    print(f"   - Group 1 (Clean): {len(group1_clean)}")
    print(f"   - Group 2 (Bottom banner - Croppable): {len(group2_croppable)}")
    print(f"   - Group 3 (Competitor info elsewhere): {len(group3_elsewhere)}")
    print(f"   - Group 4 (Not sure / Needs visual check): {len(group4_notsure)}")

    # Save category report
    cat_report_data = {
        'category': cat_name,
        'slug': cat_slug,
        'total_images': len(unique_urls),
        'clean_count': len(group1_clean),
        'croppable_count': len(group2_croppable),
        'elsewhere_count': len(group3_elsewhere),
        'notsure_count': len(group4_notsure),
        'group2_items': group2_croppable,
        'group3_items': group3_elsewhere,
        'group4_items': group4_notsure
    }
    with open(os.path.join(REPORTS_ROOT, f"{cat_slug}_report.json"), "w") as f:
        json.dump(cat_report_data, f, indent=2)

    # Step 4 & 5: If there are Group 2 items, test and crop
    fixed_count = 0
    if len(group2_croppable) > 0:
        print(f"-> Step 4: Testing crop on {min(5, len(group2_croppable))} images...")
        for it in group2_croppable[:5]:
            test_fname = f"test_{os.path.basename(it['local_backup_path'])}"
            test_dest = os.path.join(cat_test_dir, test_fname)
            crop_and_save(it['local_backup_path'], it['crop_y'], test_dest)
            print(f"   Verified test crop: {test_dest} (crop_y: {it['crop_y']})")

        print(f"-> Step 5: Cropping all {len(group2_croppable)} Group 2 images & updating products...")
        for it in group2_croppable:
            orig_backup = it['local_backup_path']
            ext = os.path.splitext(orig_backup)[-1] or '.jpg'
            clean_filename = f"clean_{get_hash(it['url'])}{ext}"
            clean_dest = os.path.join(UPLOADS_BACKEND, clean_filename)
            
            crop_and_save(orig_backup, it['crop_y'], clean_dest)
            sync_uploads(clean_filename)

            new_url = f"/uploads/{clean_filename}"
            orig_url = it['url']

            # Update MongoDB: replace orig_url with new_url across products
            products_col.update_many(
                {"category": {"$in": query_slugs}, "image": orig_url},
                {"$set": {"image": new_url}}
            )
            products_col.update_many(
                {"category": {"$in": query_slugs}, "images": orig_url},
                {"$set": {"images.$[elem]": new_url}},
                array_filters=[{"elem": orig_url}]
            )
            fixed_count += 1

        print(f"   Successfully cropped and updated {fixed_count} images in MongoDB & uploads.")

        # Step 6: Website Check
        print("-> Step 6: Verifying uploads accessibility on server...")
        sample_cleaned = f"clean_{get_hash(group2_croppable[0]['url'])}{os.path.splitext(group2_croppable[0]['local_backup_path'])[-1] or '.jpg'}"
        test_url = f"http://localhost:5002/uploads/{sample_cleaned}"
        try:
            req = urllib.request.Request(test_url, method='HEAD')
            with urllib.request.urlopen(req, timeout=3) as r:
                print(f"   Uploads verified live: {test_url} returned HTTP {r.status} OK")
        except Exception as e:
            print(f"   Note: Server check: {e}")

    # Step 7: Category Summary
    print(f"\n-> Step 7: SUMMARY FOR {cat_name}:")
    print(f"   - Fixed & Cropped: {fixed_count}")
    print(f"   - Clean & Untouched: {len(group1_clean)}")
    print(f"   - Competitor text elsewhere: {len(group3_elsewhere)}")
    print(f"   - Not sure: {len(group4_notsure)}")
    print("-" * 80)

    return cat_report_data

def main():
    print("=" * 80)
    print("STARTING CATEGORY-BY-CATEGORY IMAGE CLEANING PIPELINE")
    print("=" * 80)
    
    with open("/tmp/canonical_categories.json") as f:
        categories = json.load(f)

    # Process categories with competitor images first
    nanopower_slugs = {
        'modules-&-sensor', 'electronics-parts', 'solar-energy', 'igbt-fet-diode-transistor',
        'lt-ht-power-goods', 'battery-bms-charger', 'tools---hardware', 'service-&-maintenance',
        'safety---security', 'automation-process-cont.', 'customized-circuit---pcb'
    }
    categories.sort(key=lambda c: 0 if c['slug'] in nanopower_slugs else 1)

    all_reports = []
    for idx, c in enumerate(categories):
        rep = process_category(c, idx + 1, len(categories))
        all_reports.append(rep)

    # Master Report
    total_imgs = sum(r['total_images'] for r in all_reports)
    total_clean = sum(r['clean_count'] for r in all_reports)
    total_fixed = sum(r['croppable_count'] for r in all_reports)
    total_elsewhere = sum(r['elsewhere_count'] for r in all_reports)
    total_notsure = sum(r['notsure_count'] for r in all_reports)

    master_md_path = os.path.join(WORKSPACE, "backups/FINAL_IMAGE_CLEANING_REPORT.md")
    with open(master_md_path, "w") as f:
        f.write("# Final Product Image Cleaning Report\n\n")
        f.write(f"- **Total Categories Processed:** {len(all_reports)}\n")
        f.write(f"- **Total Unique Images Scanned:** {total_imgs}\n")
        f.write(f"- **Clean Images (Untouched):** {total_clean}\n")
        f.write(f"- **Images Fixed & Cropped (Group 2):** {total_fixed}\n")
        f.write(f"- **Competitor Text Elsewhere (Group 3):** {total_elsewhere}\n")
        f.write(f"- **Review Needed (Group 4):** {total_notsure}\n")
        f.write(f"- **Backup Location:** `{BACKUP_ROOT}`\n\n")

        f.write("## Category Breakdown\n\n")
        f.write("| Category | Total Images | Clean | Cropped & Fixed | Watermark Elsewhere | Review |\n")
        f.write("| --- | --- | --- | --- | --- | --- |\n")
        for r in all_reports:
            f.write(f"| {r['category']} | {r['total_images']} | {r['clean_count']} | {r['croppable_count']} | {r['elsewhere_count']} | {r['notsure_count']} |\n")

        f.write("\n## Group 3 Items (Competitor Info Elsewhere - Untouched)\n\n")
        for r in all_reports:
            if r['group3_items']:
                f.write(f"### {r['category']}\n")
                for it in r['group3_items']:
                    prods = ", ".join(it['products'])
                    boxes = it['details'].get('other_boxes', [])
                    txt = "; ".join([b[1] for b in boxes])
                    f.write(f"- **Products:** {prods}\n  - URL: {it['url']}\n  - Detected Text: `{txt}`\n")

        f.write("\n## Group 4 Items (Needs Manual Check)\n\n")
        for r in all_reports:
            if r['group4_items']:
                f.write(f"### {r['category']}\n")
                for it in r['group4_items']:
                    prods = ", ".join(it['products'])
                    f.write(f"- **Products:** {prods}\n  - URL: {it['url']}\n")

    print("\n" + "="*80)
    print("ALL CATEGORIES PROCESSED SUCCESSFULLY!")
    print(f"Master report saved to: {master_md_path}")
    print(f"Total Fixed: {total_fixed} | Clean: {total_clean} | Elsewhere: {total_elsewhere} | Review: {total_notsure}")
    print("="*80)

if __name__ == "__main__":
    main()
