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
  ('GMR08021', 'cycling', 'London Dynamo, full gas'),
  ('GMR08428', 'cycling', 'Into the bend'),
  ('GMR03875', 'cycling', 'Crit peloton, Lee Valley'),
  ('GMR07753', 'cycling', 'Cyclocross after dark'),
  ('GMR07717', 'cycling', 'Taped course'),
  ('GMR08175', 'cycling', 'Victory salute'),
  ('GMR07248', 'cycling', 'Morning chaingang'),
  ('GMR06617', 'cycling', 'Regent’s Park laps'),
  ('GMR09318', 'cycling', 'Against the clock'),
  ('GMR08320', 'cycling', 'Wheel to wheel'),
  ('GMR03474', 'cycling', 'On the start line'),
  ('GMR06475', 'cycling', 'Golden hour group'),
  ('GMR05962', 'cycling', 'The pack'),
  ('GMR05863', 'cycling', 'Social ride, Saturday'),
  ('GMR05846', 'cycling', 'Side by side'),
  ('GMR06085', 'cycling', 'Gates of the park'),
  ('GMR05590-2', 'cycling', 'Climbing out of the saddle'),
  ('GMR08526', 'cycling', 'Teal machine'),
  ('GMR08617', 'cycling', 'City sprint'),
  ('GMR02042', 'cycling', 'Panned past'),
  ('GMR00215', 'cycling', 'Speed blur'),
  ('GMR00194', 'cycling', 'Tail light'),
  ('GMR00343', 'cycling', 'Autumn ride'),
  ('GMR00151', 'cycling', 'Night ride'),
  ('GMR00206', 'cycling', 'Bikepacker'),
  ('GMR09934', 'cycling', 'Inline skate pack', ['action']),
  ('GMR08507', 'street', 'Two riders, low sun'),
  ('GMR01483', 'street', 'Shoreline walk'),
  ('GMR03149', 'street', 'Morning class'),
  ('GMR03272', 'concerts', 'Two guitars, blue light'),
  ('GMR08673', 'concerts', 'Blue stage'),
  ('GMR00848-2', 'concerts', 'Candlelit quartet'),
  ('GMR01992', 'urban', 'City at blue hour'),
  ('GMR08840', 'urban', 'London skyline'),
  ('GMR07228-2', 'urban', 'Departures at sunset'),
  ('GMR04579', 'landscape', 'Douro evening, Porto'),
  ('GMR02684', 'landscape', 'Atlas mountain village'),
  ('GMR03692-2', 'landscape', 'Falls'),
  ('GMR01315', 'landscape', 'Snowline'),
  ('GMR04447', 'portrait', 'Portrait in black'),
  ('GMR06363', 'portrait', 'Orange dress'),
  ('GMR04942', 'portrait', 'Confetti'),
  ('GMR01341', 'portrait', 'Snow day'),
  ('GMR01768-2', 'wildlife', 'Longhorn'),
  ('GMR04705', 'wildlife', 'Peacock display'),
  ('GMR07124-2', 'wildlife', 'Swan on the green'),
  ('GMR05573', 'wildlife', 'Approach'),
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
         {'id': 'cycling', 'label': 'Cycling & Action'}, {'id': 'street', 'label': 'Street'},
         {'id': 'urban', 'label': 'Urban'}, {'id': 'landscape', 'label': 'Landscape'},
         {'id': 'portrait', 'label': 'Portrait'}, {'id': 'wildlife', 'label': 'Wildlife'},
         {'id': 'concerts', 'label': 'Concerts'}],
       'about': {'id': ABOUT, 'w': w, 'h': h, 'sm': f'photos/about-sm/{ABOUT}.webp',
                 'md': f'photos/about-md/{ABOUT}.webp', 'lg': f'photos/about-lg/{ABOUT}.webp'},
       'photos': data}
with open(os.path.join(OUT, 'photos.json'), 'w') as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
with open(os.path.join(OUT, 'photos.js'), 'w') as f:
    f.write('window.PORTFOLIO = ' + json.dumps(out, ensure_ascii=False) + ';\n')
