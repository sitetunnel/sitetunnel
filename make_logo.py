from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, "icons")
os.makedirs(OUT, exist_ok=True)

def render_sitetunnel_icon(size):
    # Render at 4x scale for super-sampled anti-aliasing
    scale = 4
    S = size * scale
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 1. Continuous squircle background
    radius = int(S * 0.2237)
    base_mask = Image.new("L", (S, S), 0)
    base_draw = ImageDraw.Draw(base_mask)
    base_draw.rounded_rectangle([0, 0, S - 1, S - 1], radius=radius, fill=255)

    # Deep Space Obsidian Gradient
    bg = Image.new("RGBA", (S, S), (9, 12, 18, 255))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(S):
        factor = y / float(S)
        r = int(22 * (1 - factor) + 9 * factor)
        g = int(26 * (1 - factor) + 11 * factor)
        b = int(36 * (1 - factor) + 16 * factor)
        bg_draw.line([(0, y), (S, y)], fill=(r, g, b, 255))

    # Specular frosted backlight
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([-int(S * 0.1), -int(S * 0.35), int(S * 1.1), int(S * 0.45)], fill=(48, 209, 88, 38))
    glow = glow.filter(ImageFilter.GaussianBlur(int(S * 0.08)))
    bg.paste(glow, (0, 0), glow)

    # Apply squircle mask
    img.paste(bg, (0, 0), base_mask)

    # 2. Precision Metallic Rim
    rim_w = max(1 * scale, int(S * 0.016))
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=radius, outline=(255, 255, 255, 28), width=rim_w)

    # 3. Tunnel / Portal Aperture Rings
    cx, cy = S * 0.5, S * 0.5

    # Outer Tunnel Ring (Cyan to Emerald)
    r_outer = S * 0.34
    d.ellipse(
        [cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer],
        outline=(48, 209, 88, 240),
        width=max(2 * scale, int(S * 0.045))
    )

    # Middle Tunnel Ring
    r_mid = S * 0.23
    d.ellipse(
        [cx - r_mid, cy - r_mid, cx + r_mid, cy + r_mid],
        outline=(0, 200, 255, 190),
        width=max(1 * scale, int(S * 0.035))
    )

    # Inner Core Portal Fill
    core_mask = Image.new("L", (S, S), 0)
    c_draw = ImageDraw.Draw(core_mask)
    r_inner = S * 0.13
    c_draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], fill=255)
    core_fill = Image.new("RGBA", (S, S), (48, 209, 88, 50))
    img.paste(core_fill, (0, 0), core_mask)

    # Inner Core Ring
    d.ellipse(
        [cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
        outline=(255, 255, 255, 230),
        width=max(1 * scale, int(S * 0.028))
    )

    # Center Glowing Node
    r_node = S * 0.06
    d.ellipse(
        [cx - r_node, cy - r_node, cx + r_node, cy + r_node],
        fill=(255, 255, 255, 255)
    )

    # Accent Active Pulse Orb (bottom right)
    dot_r = S * 0.08
    dot_x = S * 0.77
    dot_y = S * 0.77
    d.ellipse(
        [dot_x - dot_r * 1.5, dot_y - dot_r * 1.5, dot_x + dot_r * 1.5, dot_y + dot_r * 1.5],
        fill=(48, 209, 88, 70)
    )
    d.ellipse(
        [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
        fill=(48, 209, 88, 255),
        outline=(14, 18, 26, 255),
        width=max(1, int(S * 0.022))
    )

    # Downsample with supreme quality Lanczos filter
    return img.resize((size, size), Image.Resampling.LANCZOS)

def main():
    for s in [16, 32, 48, 128]:
        icon = render_sitetunnel_icon(s)
        path = os.path.join(OUT, f"icon{s}.png")
        icon.save(path)
        print(f"Generated {path}")

if __name__ == "__main__":
    main()
