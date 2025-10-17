#!/usr/bin/env python3
"""
Icon Generator für PWA/TWA
Generiert Icons in allen notwendigen Größen aus einem 512x512px Source-Icon
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow ist nicht installiert. Installieren mit:")
    print("   pip install Pillow")
    print("\nDanach wieder ausführen.")
    exit(1)

# Zielverzeichnis
PUBLIC_DIR = Path(__file__).parent.parent / "public"
ASSETS_DIR = Path(__file__).parent.parent / "assets"

# Source Icon
SOURCE_ICON = ASSETS_DIR / "icon.png"

# Icon Größen für PWA/TWA
ICON_SIZES = {
    96: "icon-96.png",
    128: "icon-128.png",
    144: "icon-144.png",
    152: "icon-152.png",
    180: "icon-180.png",
    192: "icon-192.png",
    256: "icon-256.png",
    384: "icon-384.png",
    512: "icon-512.png",
}

def generate_icons():
    """Generiert Icons in allen notwendigen Größen"""
    
    if not SOURCE_ICON.exists():
        print(f"❌ Source-Icon nicht gefunden: {SOURCE_ICON}")
        exit(1)
    
    try:
        # Öffne Source Icon
        print(f"📂 Lade Source-Icon: {SOURCE_ICON}")
        source = Image.open(SOURCE_ICON)
        source = source.convert("RGBA")
        
        print(f"✅ Source-Icon: {source.size[0]}x{source.size[1]}px")
        print(f"\n🎨 Generiere Icons in verschiedenen Größen:")
        print("─" * 50)
        
        # Generiere Icons
        for size, filename in ICON_SIZES.items():
            output_path = PUBLIC_DIR / filename
            
            # Resize (hochwertige Interpolation)
            resized = source.resize((size, size), Image.Resampling.LANCZOS)
            
            # Speichern
            resized.save(output_path, "PNG", quality=95)
            
            # Dateigröße
            file_size = os.path.getsize(output_path)
            size_kb = file_size / 1024
            
            print(f"✅ {size:3d}px → {filename:15s} ({size_kb:6.1f} KB)")
        
        print("─" * 50)
        print(f"✅ Alle Icons generiert in: {PUBLIC_DIR}")
        print(f"\n📋 Verwende diese in manifest.json:")
        print("""
{
  "icons": [
    {"src": "/icon-96.png", "sizes": "96x96", "type": "image/png"},
    {"src": "/icon-128.png", "sizes": "128x128", "type": "image/png"},
    {"src": "/icon-144.png", "sizes": "144x144", "type": "image/png"},
    {"src": "/icon-152.png", "sizes": "152x152", "type": "image/png"},
    {"src": "/icon-180.png", "sizes": "180x180", "type": "image/png"},
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/icon-256.png", "sizes": "256x256", "type": "image/png"},
    {"src": "/icon-384.png", "sizes": "384x384", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"}
  ]
}
        """)
        
    except Exception as e:
        print(f"❌ Fehler beim Generieren der Icons: {e}")
        exit(1)

if __name__ == "__main__":
    generate_icons()
