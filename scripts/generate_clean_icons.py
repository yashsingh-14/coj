from PIL import Image
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PUBLIC_IMAGES = os.path.join(PROJECT_ROOT, "public", "images")
APP_DIR = os.path.join(PROJECT_ROOT, "app")
MASKABLE_ICON = os.path.join(PUBLIC_IMAGES, "icon-maskable.png")

def make_solid_black_bg(img_path):
    img = Image.open(img_path).convert("RGBA")
    # Create solid black image of same size
    bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
    # Paste original image using alpha channel as mask
    bg.paste(img, (0, 0), img)
    return bg.convert("RGB")

def main():
    if not os.path.exists(MASKABLE_ICON):
        print("Maskable icon missing!")
        return

    solid_icon = make_solid_black_bg(MASKABLE_ICON)
    
    # Save to all target locations
    targets = [
        os.path.join(APP_DIR, "icon.png"),
        os.path.join(APP_DIR, "apple-icon.png"),
        os.path.join(PUBLIC_IMAGES, "icon-512.png"),
        os.path.join(PUBLIC_IMAGES, "logo-footer-final.png"),
    ]

    for t in targets:
        # Resize as appropriate
        if "apple-icon" in t:
            resized = solid_icon.resize((180, 180), Image.LANCZOS)
        elif "icon.png" in t and "512" not in t:
            resized = solid_icon.resize((192, 192), Image.LANCZOS)
        else:
            resized = solid_icon.resize((512, 512), Image.LANCZOS)
        resized.save(t, "PNG", optimize=True)
        print(f"Saved {t}")

    # Favicon.ico
    fav_path = os.path.join(APP_DIR, "favicon.ico")
    fav_img = solid_icon.resize((256, 256), Image.LANCZOS)
    fav_img.save(fav_path, format="ICO", sizes=[(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)])
    print(f"Saved {fav_path}")

if __name__ == "__main__":
    main()
