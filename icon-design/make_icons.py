"""
אייקוני האפליקציה: מולקולת מים (חמצן אדום + שני מימנים לבנים) ככדורי ערכת מודלים
מבריקים, על רקע דיו כחול־כהה עם משבצות עדינות – אותה שפה כמו הלוח באפליקציה.

הרצה (מהשורש):  pip install pillow && python3 icon-design/make_icons.py
מצייר ב־4096px ומקטין (LANCZOS) כדי לקבל קצוות חלקים.
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

S = 4096
OUT = Path(__file__).resolve().parent.parent / "icons"

INK = (23, 38, 58)
GRID = (44, 62, 86)
O_COL = (224, 57, 62)
H_COL = (247, 247, 244)
STICK = (215, 224, 233)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def glossy_ball(size, color, dark_amount=0.42):
    """כדור עם הצללה: אור מלמעלה־שמאל, צל בתחתית־ימין, והבזק אור קטן."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    r = size / 2
    lx, ly = -0.45, -0.55  # כיוון האור
    dark = lerp(color, (0, 0, 0), dark_amount)
    for y in range(size):
        for x in range(size):
            dx, dy = (x + 0.5 - r) / r, (y + 0.5 - r) / r
            d2 = dx * dx + dy * dy
            if d2 > 1:
                continue
            dz = math.sqrt(1 - d2)
            light = max(0.0, (dx * lx + dy * ly + dz * 0.7) / 1.02)
            col = lerp(dark, color, min(1.0, 0.25 + light))
            # הבזק
            hx, hy = dx + 0.36, dy + 0.42
            spec = max(0.0, 1 - math.sqrt(hx * hx + hy * hy) / 0.34)
            col = lerp(col, (255, 255, 255), spec * 0.85)
            edge = min(1.0, (1 - math.sqrt(d2)) * r / 2.0)  # קצה רך
            px[x, y] = (*col, int(255 * edge))
    return img


def draw_stick(draw, a, b, width):
    draw.line([a, b], fill=STICK, width=width)
    for p in (a, b):
        draw.ellipse([p[0] - width / 2, p[1] - width / 2, p[0] + width / 2, p[1] + width / 2], fill=STICK)


def molecule_layer(scale):
    """מולקולת המים, ממורכזת בקנבס S×S. scale=1 ממלא בערך 80% מהרוחב."""
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    cx, cy = S / 2, S / 2 + 90 * scale
    o_r = 760 * scale
    h_r = 520 * scale
    bond = 1260 * scale
    half = math.radians(104.5 / 2)
    o = (cx, cy - 330 * scale)
    h1 = (o[0] - bond * math.sin(half), o[1] + bond * math.cos(half))
    h2 = (o[0] + bond * math.sin(half), o[1] + bond * math.cos(half))

    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    for (p, rr) in ((o, o_r), (h1, h_r), (h2, h_r)):
        sd.ellipse([p[0] - rr + 60 * scale, p[1] - rr + 120 * scale, p[0] + rr + 60 * scale, p[1] + rr + 120 * scale], fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(90 * scale))
    layer.alpha_composite(shadow)

    d = ImageDraw.Draw(layer)
    draw_stick(d, o, h1, int(250 * scale))
    draw_stick(d, o, h2, int(250 * scale))

    small = 512  # הכדורים מחושבים בקטן ומוגדלים – מהיר, והצללה חלקה ממילא
    for p, rr, col, dark in ((h1, h_r, H_COL, 0.30), (h2, h_r, H_COL, 0.30), (o, o_r, O_COL, 0.45)):
        ball = glossy_ball(small, col, dark).resize((int(rr * 2), int(rr * 2)), Image.LANCZOS)
        layer.alpha_composite(ball, (int(p[0] - rr), int(p[1] - rr)))
    return layer


def background(rounded):
    bg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    base = Image.new("RGBA", (S, S), (*INK, 255))
    g = ImageDraw.Draw(base)
    step = S // 8
    for k in range(1, 8):
        g.line([(k * step, 0), (k * step, S)], fill=GRID, width=14)
        g.line([(0, k * step), (S, k * step)], fill=GRID, width=14)
    if rounded:
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=255)
        bg.paste(base, (0, 0), mask)
        return bg
    return base


def compose(rounded, scale):
    img = background(rounded)
    img.alpha_composite(molecule_layer(scale))
    return img


def main():
    OUT.mkdir(exist_ok=True)
    regular = compose(rounded=True, scale=1.0)
    full_bleed = compose(rounded=False, scale=1.0)   # iOS מעגל פינות בעצמו
    maskable = compose(rounded=False, scale=0.74)    # התוכן בתוך אזור הבטיחות

    regular.resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png")
    regular.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png")
    regular.resize((32, 32), Image.LANCZOS).save(OUT / "favicon-32.png")
    full_bleed.convert("RGB").resize((180, 180), Image.LANCZOS).save(OUT / "apple-touch-icon.png")
    maskable.convert("RGB").resize((512, 512), Image.LANCZOS).save(OUT / "icon-512-maskable.png")
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
