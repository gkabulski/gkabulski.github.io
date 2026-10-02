"""Build optimised web images + photos.json from the full-size originals.

Usage: python3 tools/build_photos.py ~/Documents/portfolio_web
Outputs photos/{sm,md,lg}/<id>.webp, photos/about/*, photos/photos.json and photos/photos.js.
Metadata (incl. any GPS) is stripped from outputs; camera settings are kept in the JSON.
"""
import json, os, subprocess, sys
from PIL import Image, ImageOps

SRC = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else '~/Documents/portfolio_web')
OUT = os.path.join(os.path.dirname(__file__), '..', 'photos')
SIZES = {'sm': 480, 'md': 960, 'lg': 2400}   # long-edge for lg, width for thumbs
QUALITY = {'sm': 72, 'md': 76, 'lg': 82}

# id, category, title (single primary category; extra tags optional)
PHOTOS = [
  ('GMR08021', 'racing', 'London Dynamo, full gas'),
  ('GMR08428', 'racing', 'Into the bend'),
  ('GMR03875', 'racing', 'Crit peloton, Lee Valley'),
  ('GMR07753', 'racing', 'Cyclocross after dark'),
  ('GMR07717', 'racing', 'Taped course'),
  ('GMR08175', 'racing', 'Victory salute'),
  ('GMR09318', 'racing', 'Against the clock'),
  ('GMR03474', 'racing', 'On the start line'),
  ('GMR05590-2', 'racing', 'Climbing out of the saddle'),
  ('GMR08617', 'racing', 'City sprint'),
  ('GMR07248', 'rides', 'Morning chaingang'),
  ('GMR06475', 'rides', 'Golden hour group'),
  ('GMR08507', 'rides', 'Two riders, low sun'),
  ('GMR08526', 'rides', 'Teal machine'),
  ('GMR00215', 'shoots', 'Speed blur'),
  ('GMR00151', 'shoots', 'Night ride'),
  ('GMR02042', 'shoots', 'Panned past'),
  ('GMR00206', 'shoots', 'Bikepacker'),
]
ABOUT = 'GMR08078-2'

def exif(path):
    r = subprocess.run(['exiftool', '-j', '-n', '-FocalLength', '-FNumber', '-ExposureTime', '-ISO',
                        '-DateTimeOriginal', path], capture_output=True, text=True)
    d = json.loads(r.stdout)[0]
    def shutter(t):
        return f'1/{round(1/t)}s' if t and t < 1 else (f'{t:g}s' if t else None)
    parts = [f"{d['FocalLength']:g}mm" if d.get('FocalLength') else None,
             f"f/{d['FNumber']:g}" if d.get('FNumber') else None,
             shutter(d.get('ExposureTime')),
             f"ISO {d['ISO']}" if d.get('ISO') else None]
    return ' · '.join(p for p in parts if p), (d.get('DateTimeOriginal') or '')[:4]

def save(im, path, q):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=q, method=6)   # no exif= -> metadata stripped

def render(src_id, out_dir_prefix=''):
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, src_id + '.jpg'))).convert('RGB')
    w, h = im.size
    for key, size in SIZES.items():
        if key == 'lg':
            scale = min(1, size / max(w, h))
        else:
            scale = min(1, size / w)
        r = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        save(r, os.path.join(OUT, out_dir_prefix + key, src_id + '.webp'), QUALITY[key])
    c = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    return w, h, '#%02x%02x%02x' % c

data = []
# remove outputs of photos no longer in the list
keep = {p[0] for p in PHOTOS}
for key in SIZES:
    d = os.path.join(OUT, key)
    for f in os.listdir(d) if os.path.isdir(d) else []:
        if f[:-5] not in keep:
            os.remove(os.path.join(d, f))
for p in PHOTOS:
    pid, cat, title = p[:3]
    w, h, color = render(pid)
    settings, year = exif(os.path.join(SRC, pid + '.jpg'))
    data.append({'id': pid, 'category': cat, 'tags': list(p[3]) if len(p) > 3 else [],
                 'title': title, 'w': w, 'h': h, 'color': color, 'exif': settings, 'year': year,
                 'sm': f'photos/sm/{pid}.webp', 'md': f'photos/md/{pid}.webp', 'lg': f'photos/lg/{pid}.webp'})
    print(pid, cat, w, h)
w, h, _ = render(ABOUT, 'about-')
out = {'categories': [
         {'id': 'racing', 'label': 'Racing'}, {'id': 'rides', 'label': 'Club rides'},
         {'id': 'shoots', 'label': 'Rider shoots'}],
       'about': {'id': ABOUT, 'w': w, 'h': h, 'sm': f'photos/about-sm/{ABOUT}.webp',
                 'md': f'photos/about-md/{ABOUT}.webp', 'lg': f'photos/about-lg/{ABOUT}.webp'},
       'photos': data}
with open(os.path.join(OUT, 'photos.json'), 'w') as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
with open(os.path.join(OUT, 'photos.js'), 'w') as f:
    f.write('window.PORTFOLIO = ' + json.dumps(out, ensure_ascii=False) + ';\n')
