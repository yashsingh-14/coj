"""
Generate circular favicon - properly centered and filled.
"""

from PIL import Image, ImageDraw
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PUBLIC_IMAGES = os.path.join(PROJECT_ROOT, "public", "images")
APP_DIR = os.path.join(PROJECT_ROOT, "app")
MASKABLE_ICON = os.path.join(PUBLIC_IMAGES, "icon-maskable.png")


def find_flame_bounds(image):
    """
    Find the bounding box of just the flame+cross in the maskable icon.
    Only scans the safe zone (inner 60% of the image) to avoid circle edges.
    Only scans top half to avoid text.
    """
    pixels = image.load()
    w, h = image.size
    
    # Safe zone: inner area avoiding circle edges  
    margin = int(w * 0.15)  # 15% margin from each edge
    scan_bottom = int(h * 0.52)  # Only top 52% (skip text)
    
    min_x, min_y, max_x, max_y = w, h, 0, 0
    
    for y in range(margin, scan_bottom):
        for x in range(margin, w - margin):
            r, g, b, a = pixels[x, y]
            # Flame colors: yellow, orange, red - brightness > 40
            if a > 100 and (r > 40 or g > 40 or b > 40):
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    
    # Add small padding (2% of image size)
    pad = int(w * 0.02)
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(w, max_x + pad)
    max_y = min(h, max_y + pad)
    
    return (min_x, min_y, max_x, max_y)


def create_circular_from_maskable(source_path, output_path, size):
    """Full circular logo with text for PWA."""
    source = Image.open(source_path).convert("RGBA")
    resized = source.resize((size, size), Image.LANCZOS)
    circle_mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(circle_mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    final = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    final.paste(resized, (0, 0), circle_mask)
    final.save(output_path, format='PNG', optimize=True)
    print(f"  Created: {output_path} ({size}x{size})")


def create_clean_favicon(source_path, output_path, size):
    """
    Flame+cross CENTERED and BIG in black circle. Nothing cut off.
    """
    source = Image.open(source_path).convert("RGBA")
    
    # Auto-detect flame boundaries (skipping circle edges and text)
    bounds = find_flame_bounds(source)
    fx1, fy1, fx2, fy2 = bounds
    print(f"    Flame bounds: ({fx1},{fy1}) to ({fx2},{fy2})")
    
    # Crop the flame
    flame = source.crop(bounds)
    fw, fh = flame.size
    print(f"    Flame crop: {fw}x{fh}")
    
    # Make it a perfect square canvas (for perfect centering)
    max_dim = max(fw, fh)
    square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    square.paste(flame, ((max_dim - fw) // 2, (max_dim - fh) // 2), flame)
    
    # Create black circle
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(output).ellipse([0, 0, size - 1, size - 1], fill=(0, 0, 0, 255))
    
    # Scale flame to fill 82% of circle - big but safe from clipping
    logo_size = int(size * 0.82)
    flame_resized = square.resize((logo_size, logo_size), Image.LANCZOS)
    
    # PERFECT center
    offset = (size - logo_size) // 2
    output.paste(flame_resized, (offset, offset), flame_resized)
    
    # Circular clip
    circle_mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(circle_mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    final = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    final.paste(output, (0, 0), circle_mask)
    
    if output_path.endswith('.ico'):
        ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        ico_images = [final.resize(s, Image.LANCZOS) for s in ico_sizes]
        ico_images[0].save(output_path, format='ICO', sizes=ico_sizes)
    else:
        final.save(output_path, format='PNG', optimize=True)
    
    print(f"  Created: {output_path} ({size}x{size})")


def main():
    print("Generating circular favicons...")
    
    if not os.path.exists(MASKABLE_ICON):
        print(f"Source not found: {MASKABLE_ICON}")
        return
    
    print("[1/5] favicon.ico...")
    create_clean_favicon(MASKABLE_ICON, os.path.join(APP_DIR, "favicon.ico"), 512)
    
    print("[2/5] icon.png...")
    create_clean_favicon(MASKABLE_ICON, os.path.join(APP_DIR, "icon.png"), 192)
    
    print("[3/5] apple-icon.png...")
    create_clean_favicon(MASKABLE_ICON, os.path.join(APP_DIR, "apple-icon.png"), 180)
    
    print("[4/5] icon-512.png (PWA)...")
    create_circular_from_maskable(MASKABLE_ICON, os.path.join(PUBLIC_IMAGES, "icon-512.png"), 512)
    
    print("[5/5] logo-footer-final.png...")
    create_clean_favicon(MASKABLE_ICON, os.path.join(PUBLIC_IMAGES, "logo-footer-final.png"), 512)
    
    print("\nDone!")

if __name__ == "__main__":
    main()
