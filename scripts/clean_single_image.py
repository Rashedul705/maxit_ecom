#!/usr/bin/env python3
"""
Reusable Image Cleaning Utility for MaxiTShop
Cleans competitor phone numbers and footer banners from product images automatically.
Usage:
  python3 scripts/clean_single_image.py <image_path_or_url> [output_path]
"""

import os
import sys
import re
import hashlib
import urllib.request
import subprocess
from PIL import Image
import numpy as np

WORKSPACE = "/Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom"
OCR_BIN = os.path.join(WORKSPACE, "scripts/ocr")
PHONE_REGEX = re.compile(r'(\+?880\d{8,10}|01[3-9]\d{8}|09\d{8})')
BANNER_KEYWORDS = [
    'efficiency', 'clean & green', 'installation', 'assured', 'reliable',
    'nanopower', 'shebaloy', 'call now', 'reseller in bangladesh', 'hotline'
]

def clean_image(input_source, output_dest=None):
    # Download if remote URL
    temp_download = None
    if input_source.startswith("http://") or input_source.startswith("https://"):
        ext = os.path.splitext(input_source.split('?')[0])[-1] or '.jpg'
        temp_download = f"/tmp/clean_tmp_{hashlib.md5(input_source.encode()).hexdigest()[:8]}{ext}"
        req = urllib.request.Request(input_source, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r, open(temp_download, 'wb') as f:
            f.write(r.read())
        img_path = temp_download
    else:
        img_path = input_source

    if not os.path.exists(img_path):
        print(f"Error: File not found: {img_path}")
        return None

    try:
        im = Image.open(img_path).convert('RGB')
    except Exception as e:
        print(f"Error opening image: {e}")
        return None

    w, h = im.size
    arr = np.array(im)

    # 1. OCR text detection
    ocr_lines = []
    out = ""
    try:
        out = subprocess.check_output([OCR_BIN, img_path], timeout=5).decode().strip()
        if out:
            ocr_lines = out.split('\n')
    except Exception:
        pass

    bottom_text_boxes = []
    other_text_boxes = []

    for l in ocr_lines:
        parts = l.split('|')
        if len(parts) == 2:
            try:
                coords = [float(x) for x in parts[0].split(',')]
                text = parts[1].strip()
                y_vision = coords[1]
                h_vision = coords[3]
                top_y_px = int(h * (1.0 - (y_vision + h_vision)))
                
                is_phone = bool(PHONE_REGEX.search(text))
                is_competitor = 'nanopower' in text.lower() or 'shebaloy' in text.lower()
                is_banner_text = any(k in text.lower() for k in BANNER_KEYWORDS)

                if is_phone or is_competitor or is_banner_text:
                    if y_vision < 0.28:
                        bottom_text_boxes.append((top_y_px, text))
                    else:
                        other_text_boxes.append((top_y_px, text))
            except Exception:
                pass

    # 2. Check for dark green banner in bottom 30%
    bottom_start_y = int(h * 0.70)
    bottom_part = arr[bottom_start_y:, :, :]
    green_top_y = None
    if bottom_part.shape[0] > 0 and bottom_part.shape[1] > 0:
        is_green = (bottom_part[:, :, 0] < 100) & (bottom_part[:, :, 1] > 30) & (bottom_part[:, :, 1] < 180) & (bottom_part[:, :, 2] < 100) & (bottom_part[:, :, 1] > bottom_part[:, :, 0] * 1.2)
        green_pct_per_row = is_green.mean(axis=1)
        for y_rel, pct in enumerate(green_pct_per_row):
            if pct > 0.35:
                green_top_y = bottom_start_y + y_rel
                break

    # Determine crop point
    crop_needed = False
    crop_y = h

    if bottom_text_boxes or (green_top_y is not None and ('nanopower' in out.lower() or PHONE_REGEX.search(out))):
        candidates = []
        if bottom_text_boxes:
            min_top = min(t[0] for t in bottom_text_boxes)
            candidates.append(min_top - 10)
        if green_top_y is not None:
            candidates.append(green_top_y - 5)
        
        crop_y = max(int(h * 0.55), min(candidates)) if candidates else int(h * 0.85)
        crop_needed = True

    if not crop_needed:
        print("Image is already clean. No cropping needed.")
        if output_dest and output_dest != img_path:
            im.save(output_dest, quality=95)
        return img_path

    # Perform crop
    if not output_dest:
        base, ext = os.path.splitext(img_path)
        output_dest = f"{base}_clean{ext}"

    cropped = im.crop((0, 0, w, crop_y))
    cropped.save(output_dest, quality=95, optimize=True)
    print(f"Successfully cleaned image! Saved to: {output_dest} (Original height: {h}px -> Cleaned height: {crop_y}px)")
    return output_dest

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/clean_single_image.py <image_path_or_url> [output_path]")
        sys.exit(1)
    
    inp = sys.argv[1]
    out_p = sys.argv[2] if len(sys.argv) > 2 else None
    clean_image(inp, out_p)
