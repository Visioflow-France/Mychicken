# Icônes PWA distinctes pour les dashboards par restaurant :
# logo officiel sur fond brun + bandeau crème avec le nom de la ville.
from PIL import Image, ImageDraw, ImageFont

BG = (61, 38, 23, 255)        # brun #3d2617 (theme_color du dashboard)
CREAM = (245, 234, 214, 255)  # crème (texte du site)
DARK = (36, 18, 9, 255)       # brun très foncé (texte du bandeau)

logo = Image.open('public/logo.png').convert('RGBA')

def make(label: str, out: str):
    S = 512
    img = Image.new('RGBA', (S, S), BG)
    # logo dans la zone sûre maskable (~72% max, centré haut pour laisser
    # la place au bandeau ville)
    logo_size = 300
    l = logo.resize((logo_size, logo_size), Image.LANCZOS)
    img.alpha_composite(l, ((S - logo_size) // 2, 58))
    # bandeau ville en bas
    band_h = 96
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, S - band_h, S, S], fill=CREAM)
    font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 54)
    bbox = draw.textbbox((0, 0), label, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text(((S - w) / 2 - bbox[0], S - band_h + (band_h - h) / 2 - bbox[1]), label, font=font, fill=DARK)
    img.convert('RGB').save(f'public/{out}-512.png', 'PNG', optimize=True)
    img.convert('RGB').resize((192, 192), Image.LANCZOS).save(f'public/{out}-192.png', 'PNG', optimize=True)
    print(f'OK {label} -> public/{out}-192.png / -512.png')

make('PERSAN', 'admin-icon-ps')
make('SAINT-MARD', 'admin-icon-sm')
