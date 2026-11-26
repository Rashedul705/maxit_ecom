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
import urllib.parse
import ssl
import time
import subprocess
from PIL import Image
import numpy as np

WORKSPACE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OCR_BIN = os.path.join(WORKSPACE, "scripts/ocr")
PHONE_REGEX = re.compile(r'(\+?880\d{8,10}|01[3-9]\d{8}|09\d{8})')
BANNER_KEYWORDS = [
    'efficiency', 'clean & green', 'installation', 'assured', 'reliable',
    'nanopower', 'shebaloy', 'call now', 'reseller in bangladesh', 'hotline'
]

def download_remote_image(url, dest_path):
    """Downloads remote image forcing IPv4 with curl for fast, reliable fetching."""
    try:
        res = subprocess.run(
            [
                'curl', '-4', '-sSL', '--connect-timeout', '6', '-m', '20',
                '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                url, '-o', dest_path
            ],
            check=False,
            timeout=25
        )
        if res.returncode == 0 and os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
            return True
    except Exception as e:
        print(f"Notice: curl download failed ({e})", file=sys.stderr)

    return False

def clean_image(input_source, output_dest=None):
    temp_download = None
    parsed_source = (input_source or '').strip()

    # Resolve local /uploads/ URLs or localhost URLs
    img_path = None
    if parsed_source.startswith("http://localhost") or parsed_source.startswith("http://127.0.0.1"):
        parsed = urllib.parse.urlparse(parsed_source)
        local_rel = parsed.path.lstrip('/')
        candidates = [
            os.path.join(WORKSPACE, 'backend', local_rel),
            os.path.join(WORKSPACE, 'backend/uploads', os.path.basename(local_rel)),
            os.path.join(WORKSPACE, 'storefront/public', local_rel)
        ]
        for c in candidates:
            if os.path.exists(c):
                img_path = c
                break

    if not img_path:
        if parsed_source.startswith("http://") or parsed_source.startswith("https://"):
            ext = os.path.splitext(parsed_source.split('?')[0])[-1] or '.jpg'
            temp_download = f"/tmp/clean_tmp_{hashlib.md5(parsed_source.encode()).hexdigest()[:8]}{ext}"
            download_remote_image(parsed_source, temp_download)
            img_path = temp_download
        elif parsed_source.startswith("/uploads/") or parsed_source.startswith("uploads/"):
            candidates = [
                os.path.join(WORKSPACE, 'backend', parsed_source.lstrip('/')),
                os.path.join(WORKSPACE, 'backend/uploads', os.path.basename(parsed_source)),
                os.path.join(WORKSPACE, 'storefront/public', parsed_source.lstrip('/'))
            ]
            for c in candidates:
                if os.path.exists(c):
                    img_path = c
                    break
            if not img_path:
                img_path = os.path.join(WORKSPACE, 'backend', parsed_source.lstrip('/'))
        else:
            img_path = parsed_source

    if not os.path.exists(img_path):
        print(f"Error: File not found: {img_path}", file=sys.stderr)
        return None

    try:
        im = Image.open(img_path).convert('RGB')
    except Exception as e:
        print(f"Error opening image: {e}", file=sys.stderr)
        return None

    try:
        w, h = im.size
        arr = np.array(im)

        # 1. OCR text detection
        ocr_lines = []
        out = ""
        try:
            out = subprocess.check_output([OCR_BIN, img_path], timeout=10).decode().strip()
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
            return None

        # Perform crop
        if not output_dest:
            base, ext = os.path.splitext(img_path)
            output_dest = f"{base}_clean{ext}"

        cropped = im.crop((0, 0, w, crop_y))
        cropped.save(output_dest, quality=95, optimize=True)
        print(f"Successfully cleaned image! Saved to: {output_dest} (Original height: {h}px -> Cleaned height: {crop_y}px)")
        return output_dest
    finally:
        if temp_download and os.path.exists(temp_download) and temp_download != output_dest:
            try:
                os.remove(temp_download)
            except Exception:
                pass

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/clean_single_image.py <image_path_or_url> [output_path]")
        sys.exit(1)
    
    inp = sys.argv[1]
    out_p = sys.argv[2] if len(sys.argv) > 2 else None
    clean_image(inp, out_p)
