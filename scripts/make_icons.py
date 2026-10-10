"""Renders the PWA icons in public/icons from the same mark as favicon.svg."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
BG, RING, ARC = (31, 111, 139), (255, 255, 255), (227, 154, 79)


def render(size: int, *, maskable: bool = False, rounded: bool = True) -> Image.Image:
    scale = 4  # supersample for smooth edges
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable or not rounded:
        d.rectangle([0, 0, s, s], fill=BG)
    else:
        d.rounded_rectangle([0, 0, s, s], radius=int(s * 0.22), fill=BG)
    r = s * (0.22 if maskable else 0.27)  # keep inside the maskable safe zone
    w = int(s * (0.09 if maskable else 0.11))
    c = s / 2
    box = [c - r, c - r, c + r, c + r]
    d.ellipse(box, outline=RING, width=w)
    d.arc(box, start=-90, end=0, fill=ARC, width=w)
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(parents=True, exist_ok=True)
render(192).save(OUT / "icon-192.png")
render(512).save(OUT / "icon-512.png")
render(512, maskable=True).save(OUT / "icon-maskable-512.png")
render(180, rounded=False).convert("RGB").save(OUT / "apple-touch-icon.png")
print("icons written to", OUT)
