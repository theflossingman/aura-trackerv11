from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_trophy_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dashboard gradient background
    for y in range(size):
        for x in range(size):
            # Calculate gradient position
            ratio = (x + y) / (size * 2)
            
            if ratio < 0.25:
                color = (135, 206, 235)  # Sky blue #87CEEB
            elif ratio < 0.5:
                color = (155, 89, 182)  # Purple #9B59B6
            elif ratio < 0.75:
                color = (74, 144, 226)  # Blue #4A90E2
            else:
                color = (135, 206, 235)  # Sky blue #87CEEB
                
            img.putpixel((x, y), color)
    
    # Draw trophy
    center_x = size // 2
    center_y = size // 2
    trophy_size = int(size * 0.4)
    
    # Trophy cup (gold)
    gold_color = (255, 215, 0)  # Gold
    
    # Cup shape
    cup_points = [
        (center_x - trophy_size//2, center_y - trophy_size//3),
        (center_x - trophy_size//3, center_y + trophy_size//4),
        (center_x + trophy_size//3, center_y + trophy_size//4),
        (center_x + trophy_size//2, center_y - trophy_size//3)
    ]
    draw.polygon(cup_points, fill=gold_color, outline=(184, 134, 11))  # Dark gold outline
    
    # Trophy handles (for larger icons)
    if size >= 72:
        handle_radius = trophy_size // 8
        # Left handle
        draw.arc([
            center_x - trophy_size//2.2 - handle_radius, 
            center_y - trophy_size//6 - handle_radius,
            center_x - trophy_size//2.2 + handle_radius, 
            center_y - trophy_size//6 + handle_radius
        ], 20, 160, fill=(184, 134, 11), width=2)
        
        # Right handle  
        draw.arc([
            center_x + trophy_size//2.2 - handle_radius, 
            center_y - trophy_size//6 - handle_radius,
            center_x + trophy_size//2.2 + handle_radius, 
            center_y - trophy_size//6 + handle_radius
        ], 200, 340, fill=(184, 134, 11), width=2)
    
    # Trophy base
    base_color = (205, 133, 63)  # Peru/golden brown
    draw.rectangle([
        center_x - trophy_size//6, center_y + trophy_size//4,
        center_x + trophy_size//6, center_y + trophy_size//3
    ], fill=base_color)
    
    # Bottom base
    draw.rectangle([
        center_x - trophy_size//4, center_y + trophy_size//3,
        center_x + trophy_size//4, center_y + trophy_size//3 + trophy_size//12
    ], fill=base_color)
    
    # Add "A" for Aura (for larger icons)
    if size >= 72:
        try:
            font_size = int(size * 0.15)
            font = ImageFont.truetype('arial.ttf', font_size)
        except:
            font = ImageFont.load_default()
        
        text = 'A'
        text_width = font.getlength(text)
        text_height = font_size
        
        text_x = center_x - text_width // 2
        text_y = center_y - trophy_size // 12 - text_height // 2
        
        draw.text((text_x, text_y), text, fill='white', font=font)
    
    return img

# Create all required icon sizes
sizes = [
    (72, 'icon-72x72.png'),
    (96, 'icon-96x96.png'), 
    (128, 'icon-128x128.png'),
    (144, 'icon-144x144.png'),
    (152, 'icon-152x152.png'),
    (192, 'icon-192x192.png'),
    (384, 'icon-384x384.png'),
    (512, 'icon-512x512.png'),
    (180, 'apple-touch-icon.png'),
    (57, 'icon-57x57.png'),
    (60, 'icon-60x60.png'),
    (76, 'icon-76x76.png'),
    (114, 'icon-114x114.png'),
    (120, 'icon-120x120.png'),
    (16, 'favicon-16x16.png'),
    (32, 'favicon-32x32.png')
]

for size, filename in sizes:
    icon = create_trophy_icon(size)
    icon.save(filename)
    print(f'Created {filename}')

# Create main favicon
favicon = create_trophy_icon(32)
favicon.save('favicon.png')
print('Created favicon.png')

print('\n✅ All PWA icons created successfully!')
print('📱 Restart server and test PWA on mobile!')
