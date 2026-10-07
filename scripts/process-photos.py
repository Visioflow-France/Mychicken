# Traite les photos téléchargées : recadrage centre 4:3, 1000x750, JPEG q82.
# Les noms de destination = product-id.jpg (public/photos/<id>.jpg).
from PIL import Image
import os

# source tmp-img -> destination public/photos
FINAL = {
    'tasty-m.jpg': 'tasty-m.jpg',
    'tasty-l.jpg': 'tasty-l.jpg',
    'tasty-xl.jpg': 'tasty-xl.jpg',
    'menu-cuisse.jpg': 'menu-cuisse.jpg',
    'menu-demi.jpg': 'menu-demi.jpg',
    'menu-hotdog.jpeg': 'menu-hotdog.jpg',
    'menu-pilons.jpg': 'menu-pilons.jpg',
    'menu-wings.jpg': 'menu-wings.jpg',
    'menu-ailes.webp': 'menu-ailes.jpg',
    'menu-tenders.jpg': 'menu-tenders.jpg',
    'menu-donuts.jpg': 'menu-donuts.jpg',
    'menu-familial.jpg': 'menu-familial.jpg',
    'cand-brick-6ba8530b5160.jpg': 'menu-brick.jpg',
    'cand-brick-0a116611d383.jpg': 'p-1-brick.jpg',
    'menu-saucisses.jpeg': 'menu-saucisses.jpg',
    'sandwich-baguette.jpg': 'sandwich-baguette.jpg',
    'p-3-pilons.jpg': 'p-3-pilons.jpg',
    'p-4-ailes.jpg': 'p-4-ailes.jpg',
    'p-4-nems.jpg': 'p-4-nems.jpg',
    'p-1-cuisse.jpg': 'p-1-cuisse.jpg',
    'p-1-pilon.jpg': 'p-1-pilon.jpg',
    'p-3-tenders.jpg': 'p-3-tenders.jpg',
    'p-6-wings.jpg': 'p-6-wings.jpg',
    'p-1-saucisse.jpg': 'p-1-saucisse.jpg',
    'p-demi-poulet.jpg': 'p-demi-poulet.jpg',
    'p-poulet-entier.jpg': 'p-poulet-entier.jpg',
    'p-hotdog.jpg': 'p-hotdog.jpg',
    'cand-donut3.jpeg': 'p-donut-poulet.jpg',
    'a-frites.jpg': 'a-frites.jpg',
    'a-potatoes.jpg': 'a-potatoes.jpg',
    'a-plantain.jpg': 'a-plantain.jpg',
    'a-riz-thai.jpeg': 'a-riz-thai.jpg',
    'a-pommes-de-terre.jpg': 'a-pommes-de-terre.jpg',
    'cand-pates2.jpg': 'a-pates.jpg',
    's-oignons.jpg': 's-oignons.jpg',
    'd-tiramisu.jpg': 'd-tiramisu.jpg',
    'd-tarte-daim.jpg': 'd-tarte-daim.jpg',
    'b-canette.jpg': 'b-canette.jpg',
    'b-jus-bissap.jpg': 'b-jus-bissap.jpg',
    'b-jus-gingembre.jpg': 'b-jus-gingembre.jpg',
    'b-coca-1l5.jpg': 'b-coca-1l5.jpg',
}
# conservées telles quelles (déjà bonnes, vérifiées) : s-verte.jpg, b-redbull.jpg
# + b-jus-bissap.png existant -> remplacé par .jpg

W, H = 1000, 750
for src, dst in FINAL.items():
    im = Image.open(f'tmp-img/{src}').convert('RGB')
    w, h = im.size
    # recadrage central 4:3
    target = W / H
    if w / h > target:  # trop large
        nw = int(h * target)
        x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:  # trop haut
        nh = int(w / target)
        y = (h - nh) // 2
        im = im.crop((0, y, w, y + nh))
    im = im.resize((W, H), Image.LANCZOS)
    out = f'public/photos/{dst}'
    im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    kb = os.path.getsize(out) // 1024
    print(f'{dst:26} {kb:4} Ko')
print('--- total produits traités :', len(FINAL))
