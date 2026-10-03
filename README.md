# gkabulski.github.io

Portfolio of **Greg Kabulski** — London cycling photographer.
Live at https://gkabulski.github.io · Instagram [@temporalny](https://www.instagram.com/temporalny/)

Plain static site (no framework, no build step) served by GitHub Pages from `main`.

```
index.html          home: hero, category filter, photo grid, lightbox
about.html          about + contact
community.html      Instagram posts by clubs/riders featuring my photos
css/style.css
js/app.js           renders the grid from photos/photos.js, filter (#hash), lightbox
photos/
  sm/ md/ lg/       480w / 960w / 2400px-long-edge WebP, metadata stripped
  about-*/          about-page portrait in the same sizes
  og.jpg            1200x630 social share image
  photos.json/.js   generated photo list: category, title, size, colour, camera settings
tools/build_photos.py
```

## Adding or changing photos

1. Put full-size JPEGs in a folder (default `~/Documents/portfolio_web`).
2. Edit the `PHOTOS` list in `tools/build_photos.py` (id = filename without `.jpg`, category, title).
   Categories are defined at the bottom of the same file.
3. Run `python3 tools/build_photos.py ~/Documents/portfolio_web` (needs Pillow + exiftool).
4. Delete outputs of removed photos from `photos/sm|md|lg`, commit and push.

## Adding a community post

In `community.html`, copy an `<article class="post">` block and change the post ID, handle, text and slide number.
Instagram's `embed.js` always opens carousels on the first slide, so the "My shot: slide N" link (which keeps `?img_index=N`) points people to the right photo.

Preview locally: `python3 -m http.server` then open http://localhost:8000.

The previous onstory.uk mirror that lived in this repo is preserved on the `archive/onstory` branch.
