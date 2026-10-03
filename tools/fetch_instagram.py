#!/usr/bin/env python3
"""Download one carousel slide of a public Instagram post as square WebP tiles.

    python3 tools/fetch_instagram.py https://www.instagram.com/p/Dazl7YNjozD/?img_index=9

Writes photos/community/<shortcode>-600.webp and -1200.webp (centre crop,
nudged up a little to keep heads in frame). Slide defaults to img_index in
the URL, or 1. Needs Pillow. Relies on the public embed page, so it may
break if Instagram changes that page.
"""
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

OUT = Path(__file__).resolve().parent.parent / 'photos' / 'community'
UA = {'User-Agent': 'Mozilla/5.0'}
SIZES = (600, 1200)


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()


def unescape(s):
    # display_url is JSON nested inside a JS string, so it is escaped twice
    for _ in range(2):
        s = json.loads('"' + s + '"')
    return s


def slide_url(code, n):
    page = get(f'https://www.instagram.com/p/{code}/embed/captioned/').decode()
    i = page.find('edge_sidecar_to_children')
    urls = re.findall(r'display_url\\+":\\+"(.*?)\\+"', page[i:] if i >= 0 else page)
    if not urls:
        sys.exit(f'{code}: no image found in embed page')
    if n > len(urls):
        sys.exit(f'{code}: post has {len(urls)} slides, asked for {n}')
    return unescape(urls[n - 1])


def main(url):
    u = urllib.parse.urlparse(url)
    code = re.search(r'/(?:p|reel)/([\w-]+)', u.path).group(1)
    n = int(urllib.parse.parse_qs(u.query).get('img_index', ['1'])[0])
    img = Image.open(io.BytesIO(get(slide_url(code, n)))).convert('RGB')
    OUT.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        sq = ImageOps.fit(img, (size, size), Image.LANCZOS, centering=(0.5, 0.4))
        sq.save(OUT / f'{code}-{size}.webp', 'WEBP', quality=82, method=6)
    print(f'{code} slide {n}: {img.width}x{img.height} -> {OUT.relative_to(Path.cwd()) if OUT.is_relative_to(Path.cwd()) else OUT}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for a in sys.argv[1:]:
        main(a)
