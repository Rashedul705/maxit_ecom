#!/usr/bin/env python3
"""
Replace Competitor Phone Numbers & Domains in Product Descriptions
Replaces competitor contacts with MaxiTShop's official hotline/WhatsApp: +8801733272445
"""

import re
from pymongo import MongoClient

mongo_uri = "mongodb+srv://m4xitraj_db_user:GJ2lRe5xng3A2CNj@maxitshop.mcehlek.mongodb.net/maxitshop?retryWrites=true&w=majority"
client = MongoClient(mongo_uri)
db = client['maxitshop']
products_col = db['products']

OFFICIAL_PHONE = "+8801733272445"
OFFICIAL_DOMAIN = "maxitshop.com"

def clean_text(text):
    if not text or not isinstance(text, str):
        return text
    
    orig = text
    
    # 1. StarTech printer hotline
    text = re.sub(r'Simply call 16793 or 09678002003 for seamless customer support', f'Simply call {OFFICIAL_PHONE} for customer support', text, flags=re.I)
    text = re.sub(r'09678002003', OFFICIAL_PHONE, text)
    
    # 2. NanoPower combined hotline & WhatsApp
    text = re.sub(r'\+?8801833059369\s*WhatsApp,\s*\+?8801733115391\s*HotLine', f'{OFFICIAL_PHONE} (Hotline / WhatsApp)', text, flags=re.I)
    text = re.sub(r'\+?8801833059369', OFFICIAL_PHONE, text)
    text = re.sub(r'01833059369', OFFICIAL_PHONE, text)
    text = re.sub(r'\+?8801733115391', OFFICIAL_PHONE, text)
    text = re.sub(r'01733115391', OFFICIAL_PHONE, text)
    
    # 3. Solar Kitchen / Package hotlines
    text = re.sub(r'09678300400', OFFICIAL_PHONE, text)
    text = re.sub(r'09648300500', OFFICIAL_PHONE, text)
    
    # 4. Other competitor hotlines
    text = re.sub(r'01709995446', OFFICIAL_PHONE, text)
    
    # 5. Competitor website domains
    text = re.sub(r'https?://(www\.)?nanopowerbd\.com/?', f'https://{OFFICIAL_DOMAIN}', text, flags=re.I)
    text = re.sub(r'(www\.)?nanopowerbd\.com', OFFICIAL_DOMAIN, text, flags=re.I)
    text = re.sub(r'(www\.)?nanopower\.com\.bd', OFFICIAL_DOMAIN, text, flags=re.I)
    
    return text

def main():
    print("=" * 80)
    print("REPLACING COMPETITOR PHONE NUMBERS AND DOMAINS IN MONGODB ATLAS")
    print(f"Official Target Contact: {OFFICIAL_PHONE} | Domain: {OFFICIAL_DOMAIN}")
    print("=" * 80)

    TARGET_NUMBERS = [
        r'(\+?880)?1833059369',
        r'(\+?880)?1733115391',
        r'09678300400',
        r'09648300500',
        r'09678002003',
        r'16793 or 09678002003',
        r'01709995446',
        r'www\.nanopowerbd\.com',
        r'nanopowerbd\.com',
        r'www\.nanopower\.com\.bd'
    ]
    combined_pattern = re.compile('|'.join(TARGET_NUMBERS), re.I)

    prods = list(products_col.find({}, {'id': 1, 'title': 1, 'description': 1, 'shortDescription': 1, 'specs': 1}))
    print(f"Scanning {len(prods)} products...")

    updated_count = 0
    updated_products = []

    for p in prods:
        update_fields = {}
        for field in ['description', 'shortDescription']:
            val = p.get(field)
            if val and isinstance(val, str) and combined_pattern.search(val):
                new_val = clean_text(val)
                if new_val != val:
                    update_fields[field] = new_val

        # Also clean specs if present
        specs = p.get('specs')
        if specs and isinstance(specs, dict):
            new_specs = {}
            specs_changed = False
            for k, v in specs.items():
                if isinstance(v, str) and combined_pattern.search(v):
                    new_specs[k] = clean_text(v)
                    specs_changed = True
                else:
                    new_specs[k] = v
            if specs_changed:
                update_fields['specs'] = new_specs

        if update_fields:
            products_col.update_one({'_id': p['_id']}, {'$set': update_fields})
            updated_count += 1
            updated_products.append((p.get('id'), p.get('title'), list(update_fields.keys())))
            print(f"[{updated_count}] Updated product: [{p.get('id')}] {p.get('title')[:50]} (fields: {list(update_fields.keys())})")

    print("=" * 80)
    print(f"REPLACEMENT COMPLETE! Successfully updated {updated_count} products in MongoDB Atlas.")
    print("=" * 80)

    # Verification scan
    print("\nRunning verification scan across MongoDB Atlas...")
    remaining = []
    for p in products_col.find({}, {'id': 1, 'title': 1, 'description': 1, 'shortDescription': 1}):
        for field in ['description', 'shortDescription']:
            val = p.get(field)
            if val and isinstance(val, str) and combined_pattern.search(val):
                remaining.append((p.get('id'), p.get('title'), field))

    print(f"Remaining competitor contacts in MongoDB: {len(remaining)}")
    if len(remaining) == 0:
        print("VERIFIED: 0 competitor phone numbers or domains remain in product descriptions!")

if __name__ == '__main__':
    main()
