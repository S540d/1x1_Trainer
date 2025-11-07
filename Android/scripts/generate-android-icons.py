#!/usr/bin/env python3
"""
Generate Android launcher icons from PWA icon.

This script creates all required Android mipmap densities and adaptive icon resources.
"""

from PIL import Image, ImageDraw
import os
import sys

# Icon sizes for each density
MIPMAP_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

def ensure_dir(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def create_round_icon(square_icon, output_path):
    """Create a round icon from a square icon."""
    # Create a circular mask
    size = square_icon.size[0]
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)

    # Apply mask
    result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    result.paste(square_icon, (0, 0))
    result.putalpha(mask)

    return result

def generate_mipmap_icons(source_icon_path, res_dir):
    """Generate all mipmap density icons."""
    print(f"Loading source icon: {source_icon_path}")
    source = Image.open(source_icon_path)

    # Ensure source is RGBA
    if source.mode != 'RGBA':
        source = source.convert('RGBA')

    for density, size in MIPMAP_SIZES.items():
        mipmap_dir = os.path.join(res_dir, f'mipmap-{density}')
        ensure_dir(mipmap_dir)

        # Generate square icon
        square = source.resize((size, size), Image.Resampling.LANCZOS)
        square_path = os.path.join(mipmap_dir, 'ic_launcher.png')
        square.save(square_path, 'PNG')
        print(f"✓ Created {square_path}")

        # Generate round icon
        round_icon = create_round_icon(square, square_path)
        round_path = os.path.join(mipmap_dir, 'ic_launcher_round.png')
        round_icon.save(round_path, 'PNG')
        print(f"✓ Created {round_path}")

def create_adaptive_icon_background(res_dir):
    """Create adaptive icon background drawable."""
    drawable_dir = os.path.join(res_dir, 'drawable')
    ensure_dir(drawable_dir)

    # Use the app's light background color
    background_xml = '''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Light gray background matching PWA icon -->
    <path
        android:fillColor="#F5F5F5"
        android:pathData="M0,0h108v108h-108z" />
</vector>
'''

    bg_path = os.path.join(drawable_dir, 'ic_launcher_background.xml')
    with open(bg_path, 'w') as f:
        f.write(background_xml)
    print(f"✓ Created {bg_path}")

def create_adaptive_icon_foreground(source_icon_path, res_dir):
    """Create adaptive icon foreground from source icon."""
    drawable_dir = os.path.join(res_dir, 'drawable-v24')
    ensure_dir(drawable_dir)

    # For adaptive icons, we need to save the foreground as a PNG
    # The safe zone for adaptive icons is the center 66dp (out of 108dp)
    source = Image.open(source_icon_path)
    if source.mode != 'RGBA':
        source = source.convert('RGBA')

    # Create a 108dp canvas (at 512px that's ~4.74px per dp)
    # We'll use 1024px for better quality (9.48px per dp)
    canvas_size = 1024
    icon_size = int(canvas_size * 0.55)  # Icon takes ~60% of canvas for good visibility

    # Create transparent canvas
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))

    # Resize and center the icon
    icon = source.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    offset = (canvas_size - icon_size) // 2
    canvas.paste(icon, (offset, offset), icon)

    # Save as PNG
    fg_path = os.path.join(drawable_dir, 'ic_launcher_foreground.png')
    canvas.save(fg_path, 'PNG')
    print(f"✓ Created {fg_path}")

def create_adaptive_icon_xml(res_dir):
    """Create adaptive icon XML configurations."""
    anydpi_dir = os.path.join(res_dir, 'mipmap-anydpi-v26')
    ensure_dir(anydpi_dir)

    # For ic_launcher.xml
    launcher_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
'''

    launcher_path = os.path.join(anydpi_dir, 'ic_launcher.xml')
    with open(launcher_path, 'w') as f:
        f.write(launcher_xml)
    print(f"✓ Created {launcher_path}")

    # For ic_launcher_round.xml (same content)
    round_path = os.path.join(anydpi_dir, 'ic_launcher_round.xml')
    with open(round_path, 'w') as f:
        f.write(launcher_xml)
    print(f"✓ Created {round_path}")

def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    android_dir = os.path.dirname(script_dir)
    project_root = os.path.dirname(android_dir)

    # Source icon from PWA
    source_icon = os.path.join(project_root, 'public', 'icon-1024x1024.png')

    # Fallback to icon-512.png if 1024 doesn't exist
    if not os.path.exists(source_icon):
        source_icon = os.path.join(project_root, 'public', 'icon-512.png')

    if not os.path.exists(source_icon):
        print(f"Error: Source icon not found at {source_icon}")
        sys.exit(1)

    # Target res directory
    res_dir = os.path.join(android_dir, 'app', 'src', 'main', 'res')

    print("=" * 60)
    print("Android Icon Generator - 1x1 Trainer")
    print("=" * 60)
    print()

    # Generate all icon resources
    generate_mipmap_icons(source_icon, res_dir)
    create_adaptive_icon_background(res_dir)
    create_adaptive_icon_foreground(source_icon, res_dir)
    create_adaptive_icon_xml(res_dir)

    print()
    print("=" * 60)
    print("✓ All Android launcher icons generated successfully!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Clean old WebP icons (optional)")
    print("2. Build new AAB: ./gradlew clean bundleRelease")
    print("3. Upload to Play Store")

if __name__ == '__main__':
    main()
