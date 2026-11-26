#!/usr/bin/env python3
"""
Manual Image Cropping Utility for MaxiTShop
Crops an image based on provided coordinates or percentages.
Usage:
  python3 scripts/crop_manual.py '<json_payload>'
"""

import os
import sys
import json
import urllib.parse
import time
import subprocess
from PIL import Image

WORKSPACE = "/Users/rashedulislam/MAXIT/Maxit_Ecom/maxit_ecom"

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

def resolve_image_path(source):
    parsed_source = (source or '').strip()
    if not parsed_source:
        return None, None

    # Local file already
    if os.path.exists(parsed_source) and os.path.isfile(parsed_source):
        return parsed_source, None

    # Localhost URL
    if parsed_source.startswith("http://localhost") or parsed_source.startswith("http://127.0.0.1"):
        parsed = urllib.parse.urlparse(parsed_source)
        local_rel = parsed.path.lstrip('/')
        candidates = [
            os.path.join(WORKSPACE, 'backend', local_rel),
            os.path.join(WORKSPACE, 'backend/uploads', os.path.basename(local_rel)),
            os.path.join(WORKSPACE, 'storefront/public', local_rel),
            os.path.join(WORKSPACE, 'frontend/public', local_rel)
        ]
        for c in candidates:
            if os.path.exists(c):
                return c, None

    # Direct /uploads/ path
    if parsed_source.startswith("/uploads/") or parsed_source.startswith("uploads/"):
        candidates = [
            os.path.join(WORKSPACE, 'backend', parsed_source.lstrip('/')),
            os.path.join(WORKSPACE, 'backend/uploads', os.path.basename(parsed_source)),
            os.path.join(WORKSPACE, 'storefront/public', parsed_source.lstrip('/')),
            os.path.join(WORKSPACE, 'frontend/public', parsed_source.lstrip('/'))
        ]
        for c in candidates:
            if os.path.exists(c):
                return c, None

    # Remote URL
    if parsed_source.startswith("http://") or parsed_source.startswith("https://"):
        ext = os.path.splitext(parsed_source.split('?')[0])[-1] or '.jpg'
        temp_dest = f"/tmp/crop_download_{int(time.time() * 1000)}{ext}"
        if download_remote_image(parsed_source, temp_dest):
            return temp_dest, temp_dest

    return None, None

def crop_image(payload):
    source = payload.get("source") or payload.get("imageUrl")
    output_path = payload.get("outputPath")
    crop = payload.get("crop", {})

    if not source:
        return {"success": False, "error": "No source or imageUrl provided"}
    if not output_path:
        return {"success": False, "error": "No outputPath provided"}

    img_path, temp_file = resolve_image_path(source)
    if not img_path or not os.path.exists(img_path):
        return {"success": False, "error": f"Failed to locate or download source image: {source}"}

    try:
        with Image.open(img_path) as img:
            orig_w, orig_h = img.size

            # Check if crop is given in percentages or pixels
            unit = crop.get("unit", "px")  # 'px' or 'percent'
            x = float(crop.get("x", 0))
            y = float(crop.get("y", 0))
            w = float(crop.get("width", orig_w))
            h = float(crop.get("height", orig_h))

            if unit == "percent" or (w <= 1.0 and h <= 1.0 and (w > 0 or h > 0)):
                # If percentage is given as 0-100 or 0-1
                if w <= 1.0 and h <= 1.0:
                    left = x * orig_w
                    top = y * orig_h
                    width = w * orig_w
                    height = h * orig_h
                else:
                    left = (x / 100.0) * orig_w
                    top = (y / 100.0) * orig_h
                    width = (w / 100.0) * orig_w
                    height = (h / 100.0) * orig_h
            else:
                left = x
                top = y
                width = w
                height = h

            # Clamp coordinates
            left = max(0, min(orig_w - 1, left))
            top = max(0, min(orig_h - 1, top))
            right = max(left + 1, min(orig_w, left + width))
            bottom = max(top + 1, min(orig_h, top + height))

            box = (int(round(left)), int(round(top)), int(round(right)), int(round(bottom)))
            cropped = img.crop(box)

            # Ensure destination directory exists
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

            out_ext = os.path.splitext(output_path)[-1].lower()
            if out_ext in ['.png', '.webp'] and img.mode in ('RGBA', 'LA'):
                cropped.save(output_path, quality=95)
            else:
                if cropped.mode in ('RGBA', 'LA', 'P'):
                    # Convert to RGB with white background
                    bg = Image.new('RGB', cropped.size, (255, 255, 255))
                    if cropped.mode == 'RGBA':
                        bg.paste(cropped, mask=cropped.split()[3])
                    else:
                        bg.paste(cropped.convert('RGBA'))
                    bg.save(output_path, 'JPEG', quality=95)
                else:
                    cropped.save(output_path, 'JPEG', quality=95)

            return {
                "success": True,
                "originalWidth": orig_w,
                "originalHeight": orig_h,
                "cropBox": box,
                "croppedWidth": cropped.width,
                "croppedHeight": cropped.height,
                "outputPath": output_path
            }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: crop_manual.py '<json_payload>'"}))
        sys.exit(1)

    raw_arg = sys.argv[1]
    try:
        payload = json.loads(raw_arg)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON payload: {e}"}))
        sys.exit(1)

    result = crop_image(payload)
    print(json.dumps(result))
    if not result.get("success"):
        sys.exit(1)

if __name__ == "__main__":
    main()
