#!/usr/bin/env python3
"""
Deep Scanner for Phone Numbers and Competitor Watermarks on Product Images
Scans all solar, package, custom PCB, and competitor candidate images in MongoDB Atlas.
"""

import os
import sys
import re
import ssl
import time
import hashlib
import subprocess
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pymongo import MongoClient

WORKSPACE = "/Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom"
OCR_BIN = os.path.join(WORKSPACE, "scripts/ocr")
PHONE_REGEX = re.compile(r'(\+?880\d{8,10}|01[3-9]\d{8}|09\d{8})')
BANNER_KEYWORDS = ['nanopower', 'shebaloy', '09678300400', '09648300500']

CACHE_DIR = "/tmp/maxit_audit_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

mongo_uri = "mongodb+srv://m4xitraj_db_user:GJ2lRe5xng3A2CNj@maxitshop.mcehlek.mongodb.net/maxitshop?retryWrites=true&w=majority"
client = MongoClient(mongo_uri)
db = client['maxitshop']
products_col = db['products']

ctx = ssl._create_unverified_context()

def get_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def get_image_file(url):
    """Returns local file path for url or downloads it to cache."""
    if not url:
        return None
    url = url.strip()

    # Local uploads
    if url.startswith('/uploads/') or url.startswith('uploads/'):
        local_p = os.path.join(WORKSPACE, 'storefront/public', url.lstrip('/'))
        if os.path.exists(local_p):
            return local_p
        local_p2 = os.path.join(WORKSPACE, 'backend', url.lstrip('/'))
        if os.path.exists(local_p2):
            return local_p2

    # Cached file
    ext = os.path.splitext(url.split('?')[0])[-1] or '.jpg'
    cached = os.path.join(CACHE_DIR, f"{get_hash(url)}{ext}")
    if os.path.exists(cached) and os.path.getsize(cached) > 0:
        return cached

    # Remote download
    if url.startswith('http://') or url.startswith('https://'):
        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
                )
                with urllib.request.urlopen(req, timeout=8, context=ctx) as r, open(cached, 'wb') as f:
                    f.write(r.read())
                if os.path.exists(cached) and os.path.getsize(cached) > 0:
                    return cached
            except Exception:
                time.sleep(0.3)

    return None

def scan_image(url):
    """
    Scans a single image for phone numbers using OCR.
    Returns (url, found_phones, competitor_texts, position_details)
    """
    fpath = get_image_file(url)
    if not fpath or not os.path.exists(fpath):
        return url, [], [], []

    try:
        out = subprocess.check_output([OCR_BIN, fpath], timeout=6).decode().strip()
        if not out:
            return url, [], [], []

        phones = []
        competitor = []
        positions = []

        for line in out.split('\n'):
            parts = line.split('|')
            if len(parts) == 2:
                coords = [float(x) for x in parts[0].split(',')]
                txt = parts[1].strip()
                y_norm = coords[1] # 0 = bottom, 1 = top

                ph = PHONE_REGEX.findall(txt)
                if ph:
                    phones.extend(ph)
                    pos_str = "bottom" if y_norm < 0.28 else ("middle" if y_norm < 0.70 else "top")
                    positions.append((ph, pos_str, y_norm, txt))

                for kw in BANNER_KEYWORDS:
                    if kw in txt.lower():
                        competitor.append(txt)
                        pos_str = "bottom" if y_norm < 0.28 else ("middle" if y_norm < 0.70 else "top")
                        positions.append((kw, pos_str, y_norm, txt))

        return url, list(set(phones)), list(set(competitor)), positions
    except Exception:
        return url, [], [], []

def main():
    print("=" * 80, flush=True)
    print("AUDITING PRODUCTS FOR PHONE NUMBERS AND COMPETITOR WATERMARKS", flush=True)
    print("=" * 80, flush=True)

    query = {
        "$or": [
            {"category": {"$in": ["cat-solar-package", "solar-package", "cat-solar-energy", "cat-solar-inverter", "cat-solar-battery", "solar-pv-panels", "customized-circuit---pcb", "service-&-maintenance"]}},
            {"image": {"$regex": "nanopower"}},
            {"image": {"$regex": "-0\.(jpg|jpeg|webp|png)"}},
            {"title": {"$regex": "Solar|Inverter|Battery|Package|Setup|Combo", "$options": "i"}}
        ]
    }

    prods = list(products_col.find(query, {"id": 1, "title": 1, "productCode": 1, "category": 1, "image": 1, "images": 1}))
    print(f"Products in scope: {len(prods)}", flush=True)

    url_to_prods = {}
    for p in prods:
        m = p.get('image')
        if m:
            url_to_prods.setdefault(m, []).append((p.get('id'), p.get('productCode'), p.get('title'), 'main'))
        for g in (p.get('images') or []):
            if g and g != m:
                url_to_prods.setdefault(g, []).append((p.get('id'), p.get('productCode'), p.get('title'), 'gallery'))

    candidate_urls = list(url_to_prods.keys())
    print(f"Unique images to scan: {len(candidate_urls)}", flush=True)
    print("-" * 80, flush=True)

    hits = []
    scanned = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(scan_image, u): u for u in candidate_urls}
        for f in as_completed(futures):
            scanned += 1
            url, phones, competitor, positions = f.result()
            if phones or competitor:
                prod_info = url_to_prods.get(url, [('?', '?', '?', '?')])[0]
                hits.append({
                    'url': url,
                    'phones': phones,
                    'competitor': competitor,
                    'positions': positions,
                    'product': prod_info
                })
                print(f"[FOUND HIT] [{prod_info[1]}] {prod_info[2][:45]} => Phones: {phones} | Texts: {competitor}", flush=True)
            elif scanned % 50 == 0 or scanned == len(candidate_urls):
                print(f"Progress: {scanned}/{len(candidate_urls)} scanned... ({len(hits)} hits so far)", flush=True)

    print("=" * 80, flush=True)
    print(f"SCAN COMPLETE! Found {len(hits)} images with phone numbers/competitor watermarks.", flush=True)
    print("=" * 80, flush=True)

    for i, h in enumerate(hits, 1):
        pid, pcode, ptitle, img_type = h['product']
        print(f"\n{i}. Product: {ptitle} (Code: {pcode}, ID: {pid})")
        print(f"   Image ({img_type}): {h['url']}")
        print(f"   Phones: {h['phones']}")
        print(f"   Competitor mentions: {h['competitor']}")
        print(f"   Positions: {h['positions']}")

if __name__ == '__main__':
    main()
