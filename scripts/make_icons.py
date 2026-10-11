"""Renders the PWA icons in public/icons from the same drawing as public/favicon.svg
(a person at the top of a pull-up, chin over the bar)."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
BG, FG, BAR = (31, 111, 139), (255, 255, 255), (240, 163, 92)

BAR_LINE = [(9, 22), (55, 22)]
ARMS = [(19, 22), (22.5, 35), (32, 29.5), (41.5, 35), (45, 22)]
BODY = [(32, 28), (32, 45)]
LEGS = [[(32, 45), (27, 56)], [(32, 45), (37, 56)]]
HEAD = ((32, 15), 5.6)
STROKE = 4.6


def render(size: int, *, maskable: bool = False, rounded: bool = True) -> Image.Image:
    ss = 4  # supersample
    s = size * ss
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable or not rounded:
        d.rectangle([0, 0, s, s], fill=BG)
    else:
        d.rounded_rectangle([0, 0, s, s], radius=int(s * 15 / 64), fill=BG)
    # Maskable icons keep the drawing inside the central safe zone.
    k = 0.78 if maskable else 1.0
    def P(x: float, y: float) -> tuple[float, float]:
        return ((32 + (x - 32) * k) * s / 64, (32 + (y - 32) * k) * s / 64)
    w = STROKE * k * s / 64

    def poly(points, color):
        pts = [P(*p) for p in points]
        d.line(pts, fill=color, width=round(w), joint="curve")
        for x, y in pts:  # round caps and joins
            d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=color)

    poly(BAR_LINE, BAR)
    poly(ARMS, FG)
    poly(BODY, FG)
    for leg in LEGS:
        poly(leg, FG)
    (cx, cy), r = HEAD
    x, y = P(cx, cy)
    rr = r * k * s / 64
    d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=FG)
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(parents=True, exist_ok=True)
render(192).save(OUT / "icon-192.png")
render(512).save(OUT / "icon-512.png")
render(512, maskable=True).save(OUT / "icon-maskable-512.png")
render(180, rounded=False).convert("RGB").save(OUT / "apple-touch-icon.png")
print("icons written to", OUT)
