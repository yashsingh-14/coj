from PIL import Image
import shutil
import os

# Paths
icon_512 = r'c:\Users\yash1\Documents\GitHub\coj\public\images\icon-512.png'
icon_app = r'c:\Users\yash1\Documents\GitHub\coj\app\icon.png'
apple_icon = r'c:\Users\yash1\Documents\GitHub\coj\app\apple-icon.png'
maskable = r'c:\Users\yash1\Documents\GitHub\coj\public\images\icon-maskable.png'

# Step 1: Fix icon-512.png - Replace transparency with solid black
print("Processing icon-512.png...")
img = Image.open(icon_512).convert("RGBA")
print(f"  Original size: {img.size}, mode: {img.mode}")

# Create solid black background
black_bg = Image.new("RGBA", img.size, (0, 0, 0, 255))

# Paste original on black background (transparency becomes black)
black_bg.paste(img, (0, 0), img)

# Save as PNG (no transparency)
final = black_bg.convert("RGB")
final.save(icon_512, "PNG")
print(f"  Saved icon-512.png with solid black background")

# Step 2: Fix app/icon.png (smaller, used by Google search)
print("\nProcessing app/icon.png...")
img2 = Image.open(icon_app).convert("RGBA")
print(f"  Original size: {img2.size}, mode: {img2.mode}")

black_bg2 = Image.new("RGBA", img2.size, (0, 0, 0, 255))
black_bg2.paste(img2, (0, 0), img2)
final2 = black_bg2.convert("RGB")
final2.save(icon_app, "PNG")
print(f"  Saved app/icon.png with solid black background")

# Step 3: Fix apple-icon.png
print("\nProcessing apple-icon.png...")
img3 = Image.open(apple_icon).convert("RGBA")
print(f"  Original size: {img3.size}, mode: {img3.mode}")

black_bg3 = Image.new("RGBA", img3.size, (0, 0, 0, 255))
black_bg3.paste(img3, (0, 0), img3)
final3 = black_bg3.convert("RGB")
final3.save(apple_icon, "PNG")
print(f"  Saved apple-icon.png with solid black background")

# Step 4: Fix maskable icon
print("\nProcessing icon-maskable.png...")
img4 = Image.open(maskable).convert("RGBA")
print(f"  Original size: {img4.size}, mode: {img4.mode}")

black_bg4 = Image.new("RGBA", img4.size, (0, 0, 0, 255))
black_bg4.paste(img4, (0, 0), img4)
final4 = black_bg4.convert("RGB")
final4.save(maskable, "PNG")
print(f"  Saved icon-maskable.png with solid black background")

# Step 5: Generate favicon.ico from the fixed icon
print("\nGenerating favicon.ico...")
favicon_path = r'c:\Users\yash1\Documents\GitHub\coj\app\favicon.ico'
# Open the fixed icon and resize for favicon sizes
icon_for_favicon = Image.open(icon_app)
icon_for_favicon.save(favicon_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print(f"  Saved favicon.ico (16x16, 32x32, 48x48)")

print("\n✅ All icons fixed! Transparent areas are now solid black.")
print("Google search will no longer show white border around your logo.")
