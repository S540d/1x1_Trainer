#!/usr/bin/env python3
"""
Screenshot Generator für PWA Install Dialog
Erstellt Screenshot-Mockups für die PWA Installation
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ Pillow ist nicht installiert.")
    exit(1)

PUBLIC_DIR = Path(__file__).parent.parent / "public"
ASSETS_DIR = Path(__file__).parent.parent / "assets"

# Screenshot Größen
SCREENSHOTS = {
    "portrait": (540, 720, "screenshot-540x720.png"),
    "landscape": (1280, 720, "screenshot-1280x720.png"),
}

def create_screenshot_portrait():
    """Erstellt ein Portrait-Screenshot (540x720)"""
    
    # Erstelle neues Bild mit App-Theme-Farbe
    img = Image.new("RGB", (540, 720), color="#6200EE")
    draw = ImageDraw.Draw(img)
    
    # Top Bereich - Status Bar
    draw.rectangle([0, 0, 540, 30], fill="#5000DD")
    
    # Header
    draw.rectangle([0, 30, 540, 120], fill="#6200EE")
    
    # Großer Text in der Mitte
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        title_font = subtitle_font = small_font = ImageFont.load_default()
    
    # Icon
    try:
        icon = Image.open(ASSETS_DIR / "icon.png").convert("RGBA")
        icon = icon.resize((120, 120), Image.Resampling.LANCZOS)
        img.paste(icon, (210, 240), icon)
    except:
        pass
    
    # Text
    draw.text((270, 380), "1x1 Trainer", font=title_font, fill="white", anchor="mm")
    draw.text((270, 430), "Lerne das Einmaleins", font=subtitle_font, fill="white", anchor="mm")
    
    # Beschreibung
    description = "Übe mit verschiedenen\nSpielmodi"
    draw.text((270, 500), description, font=small_font, fill="white", anchor="mm")
    
    # Bottom - Action Button
    draw.rectangle([40, 620, 500, 680], fill="white", outline="white")
    draw.text((270, 650), "Installieren", font=subtitle_font, fill="#6200EE", anchor="mm")
    
    # Speichern
    output_path = PUBLIC_DIR / "screenshot-540x720.png"
    img.save(output_path, "PNG")
    print(f"✅ Portrait Screenshot erstellt: {output_path}")

def create_screenshot_landscape():
    """Erstellt ein Landscape-Screenshot (1280x720)"""
    
    # Erstelle neues Bild
    img = Image.new("RGB", (1280, 720), color="#6200EE")
    draw = ImageDraw.Draw(img)
    
    # Linke Seite - Content
    draw.rectangle([0, 0, 640, 720], fill="#6200EE")
    
    # Rechte Seite - Features
    draw.rectangle([640, 0, 1280, 720], fill="#f5f5f5")
    
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
    except:
        title_font = subtitle_font = ImageFont.load_default()
    
    # Linke Seite - Text
    draw.text((320, 200), "1x1 Trainer", font=title_font, fill="white", anchor="mm")
    draw.text((320, 300), "Lerne das Einmaleins", font=subtitle_font, fill="white", anchor="mm")
    
    # Rechte Seite - Features
    features = [
        "✓ 4 Spielmodi",
        "✓ Offline verfügbar",
        "✓ Installierbar",
        "✓ Responsive Design",
    ]
    
    try:
        feature_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    except:
        feature_font = ImageFont.load_default()
    
    y_pos = 150
    for feature in features:
        draw.text((680, y_pos), feature, font=feature_font, fill="#333333")
        y_pos += 80
    
    # Speichern
    output_path = PUBLIC_DIR / "screenshot-1280x720.png"
    img.save(output_path, "PNG")
    print(f"✅ Landscape Screenshot erstellt: {output_path}")

if __name__ == "__main__":
    print("🎨 Generiere PWA Screenshots...")
    print("─" * 50)
    create_screenshot_portrait()
    create_screenshot_landscape()
    print("─" * 50)
    print("✅ Screenshots erfolgreich erstellt!")
