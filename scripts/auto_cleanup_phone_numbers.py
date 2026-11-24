#!/usr/bin/env python3
"""
Automated Batch Cleanup Script for Competitor Phone Numbers & Footer Banners
Scans product images in MongoDB Atlas, detects competitor phone numbers/banners,
crops them cleanly, saves to /uploads/clean_..., and updates MongoDB product documents.
"""

import os
import sys
import re
import json
import hashlib
import shutil
import contextlib
import io
from concurrent.futures import ThreadPoolExecutor, as_completed
from pymongo import MongoClient

WORKSPACE = "/Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom"
sys.path.insert(0, os.path.join(WORKSPACE, "scripts"))
from clean_single_image import clean_image

UPLOADS_BACKEND = os.path.join(WORKSPACE, "backend/uploads")
UPLOADS_STOREFRONT = os.path.join(WORKSPACE, "storefront/public/uploads")
UPLOADS_FRONTEND = os.path.join(WORKSPACE, "frontend/public/uploads")
UPLOADS_API = os.path.join(WORKSPACE, "api/uploads")

for d in [UPLOADS_BACKEND, UPLOADS_STOREFRONT, UPLOADS_FRONTEND, UPLOADS_API]:
    os.makedirs(d, exist_ok=True)

mongo_uri = "mongodb+srv://m4xitraj_db_user:GJ2lRe5xng3A2CNj@maxitshop.mcehlek.mongodb.net/maxitshop?retryWrites=true&w=majority"
client = MongoClient(mongo_uri)
db = client['maxitshop']
products_col = db['products']

def get_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def sync_uploads(filename):
    src = os.path.join(UPLOADS_BACKEND, filename)
    if os.path.exists(src):
        for target_dir in [UPLOADS_STOREFRONT, UPLOADS_FRONTEND, UPLOADS_API]:
            try:
                shutil.copy2(src, os.path.join(target_dir, filename))
            except Exception:
                pass

def process_single_image(url):
    """
    Returns (url, is_cleaned, new_url_or_none, details)
    """
    if not url or url.startswith("/uploads/clean_"):
        return url, False, None, "Already clean"

    ext = os.path.splitext(url.split('?')[0])[-1] or '.jpg'
    clean_filename = f"clean_{get_hash(url)}{ext}"
    dest_path = os.path.join(UPLOADS_BACKEND, clean_filename)

    try:
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
            sync_uploads(clean_filename)
            return url, True, f"/uploads/{clean_filename}", "Cleaned"

        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = clean_image(url, dest_path)

        if result and result == dest_path and os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
            sync_uploads(clean_filename)
            return url, True, f"/uploads/{clean_filename}", "Cropped banner"
        else:
            return url, False, None, "No banner detected"
    except Exception as e:
        return url, False, None, f"Error: {e}"

def main():
    print("=" * 80, flush=True)
    print("MAXITSHOP AUTOMATED COMPETITOR PHONE NUMBER & BANNER CLEANUP", flush=True)
    print("=" * 80, flush=True)

    query = {
        "$or": [
            {"image": {"$regex": r"-0\.(jpg|jpeg|webp|png)"}},
            {"image": {"$regex": r"nanopower"}},
            {"category": {"$in": ["cat-solar-package", "solar-package"]}},
            {"title": {"$regex": r"Solar Setup|Combo|Power Package", "$options": "i"}}
        ]
    }

    prods = list(products_col.find(query, {"id": 1, "title": 1, "category": 1, "image": 1, "images": 1}))
    print(f"Target products found: {len(prods)}", flush=True)

    unique_urls = set()
    url_to_titles = {}

    for p in prods:
        m = p.get('image')
        if m and not m.startswith("/uploads/clean_"):
            unique_urls.add(m)
            url_to_titles.setdefault(m, []).append(p.get('title'))

        for g in (p.get('images') or []):
            if g and not g.startswith("/uploads/clean_") and ("nanopower" in g or "-0." in g):
                unique_urls.add(g)
                url_to_titles.setdefault(g, []).append(p.get('title'))

    candidates = list(unique_urls)
    print(f"Total unique images to scan: {len(candidates)}", flush=True)
    print("-" * 80, flush=True)

    cleaned_map = {}
    processed = 0

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(process_single_image, u): u for u in candidates}
        for future in as_completed(futures):
            processed += 1
            orig_url, was_cleaned, new_url, details = future.result()
            if was_cleaned and new_url:
                cleaned_map[orig_url] = new_url
                title = url_to_titles.get(orig_url, [''])[0]
                print(f"[{processed}/{len(candidates)}] [FIXED] {title[:55]} -> {new_url}", flush=True)
            else:
                if processed % 20 == 0 or processed == len(candidates):
                    print(f"[{processed}/{len(candidates)}] Progress: {processed}/{len(candidates)} scanned | {len(cleaned_map)} fixed", flush=True)

    print("-" * 80, flush=True)
    print(f"Scanning complete! Total images cleaned: {len(cleaned_map)}", flush=True)

    if cleaned_map:
        print("\nUpdating products in MongoDB Atlas...", flush=True)
        modified_count = 0
        for orig_url, new_url in cleaned_map.items():
            r1 = products_col.update_many(
                {"image": orig_url},
                {"$set": {"image": new_url}}
            )
            r2 = products_col.update_many(
                {"images": orig_url},
                {"$set": {"images.$[elem]": new_url}},
                array_filters=[{"elem": orig_url}]
            )
            modified_count += (r1.modified_count + r2.modified_count)

        print(f"Successfully updated {modified_count} image references across products in MongoDB Atlas!", flush=True)

    print("=" * 80, flush=True)
    print("ALL DONE!", flush=True)
    print("=" * 80, flush=True)

if __name__ == "__main__":
    main()
