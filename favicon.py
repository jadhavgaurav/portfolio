# generate_favicons.py
# Requirements: pip install pillow
#
# Usage:
#   python generate_favicons.py --input logo.png --out ./public
#
# What it generates (inside --out):
#   favicon.ico (16, 32, 48)
#   favicon-16x16.png
#   favicon-32x32.png
#   apple-touch-icon.png (180x180)
#   android-chrome-192x192.png
#   android-chrome-512x512.png
#   mstile-150x150.png
#   site.webmanifest
#   browserconfig.xml
#
# Notes:
# - If your input PNG is not square, it will be padded (transparent by default) and centered.
# - If you prefer a dark background instead of transparency, use --bg "#050505".

import argparse
import os
from PIL import Image, ImageColor

FAVICON_ICO_SIZES = [16, 32, 48]
PNG_SIZES = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
    "mstile-150x150.png": 150,
}

def ensure_square(img: Image.Image, bg_rgba=(0, 0, 0, 0)) -> Image.Image:
    """Pad image to a square canvas, centered. Keeps content intact."""
    w, h = img.size
    side = max(w, h)
    square = Image.new("RGBA", (side, side), bg_rgba)
    x = (side - w) // 2
    y = (side - h) // 2
    square.alpha_composite(img, (x, y))
    return square

def resize_high_quality(img: Image.Image, size: int) -> Image.Image:
    """High quality downscale for crisp icons."""
    return img.resize((size, size), Image.Resampling.LANCZOS)

def write_manifest(out_dir: str, theme_color: str, background_color: str):
    manifest_path = os.path.join(out_dir, "site.webmanifest")
    manifest = f'''{{
  "name": "Gaurav Vijay Jadhav",
  "short_name": "GVJ",
  "icons": [
    {{
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }},
    {{
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }}
  ],
  "theme_color": "{theme_color}",
  "background_color": "{background_color}",
  "display": "standalone"
}}
'''
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest)

def write_browserconfig(out_dir: str, tile_color: str):
    path = os.path.join(out_dir, "browserconfig.xml")
    xml = f'''<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>{tile_color}</TileColor>
    </tile>
  </msapplication>
</browserconfig>
'''
    with open(path, "w", encoding="utf-8") as f:
        f.write(xml)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True, help="Path to source PNG (logo)")
    p.add_argument("--out", default="favicons_out", help="Output directory (e.g., Next.js /public)")
    p.add_argument("--bg", default="transparent", help='Background: "transparent" or hex like "#050505"')
    p.add_argument("--theme", default="#050505", help='theme_color for site.webmanifest (default "#050505")')
    p.add_argument("--background", default="#050505", help='background_color for site.webmanifest (default "#050505")')
    args = p.parse_args()

    os.makedirs(args.out, exist_ok=True)

    img = Image.open(args.input).convert("RGBA")

    # Background handling
    if args.bg.lower() == "transparent":
        bg_rgba = (0, 0, 0, 0)
        base = ensure_square(img, bg_rgba=bg_rgba)
    else:
        # Flatten on a solid background
        rgb = ImageColor.getcolor(args.bg, "RGB")
        bg_rgba = (rgb[0], rgb[1], rgb[2], 255)
        base = ensure_square(img, bg_rgba=bg_rgba)

    # Export PNG favicons
    for filename, size in PNG_SIZES.items():
        out_path = os.path.join(args.out, filename)
        icon = resize_high_quality(base, size)
        icon.save(out_path, format="PNG", optimize=True)

    # Export ICO (multi-size)
    ico_path = os.path.join(args.out, "favicon.ico")
    ico_imgs = [resize_high_quality(base, s) for s in FAVICON_ICO_SIZES]
    ico_imgs[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in FAVICON_ICO_SIZES]
    )

    # Optional metadata files
    write_manifest(args.out, theme_color=args.theme, background_color=args.background)
    write_browserconfig(args.out, tile_color=args.theme)

    print(f"Done. Favicons generated in: {os.path.abspath(args.out)}")

if __name__ == "__main__":
    main()
