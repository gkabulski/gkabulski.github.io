# Shared brief for all three mockups

Site owner: **Greg Kabulski** — London cycling & action photographer.
Instagram: **@temporalny** → https://www.instagram.com/temporalny/
Email: **gkabulski@gmail.com**

## Pages (each mockup lives in mockups/<x>/)
- `index.html` — home: hero + portfolio grid with category filter + lightbox modal + short contact footer
- `about.html` — about page with Greg's photo (data.about), copy below, contact block
- `style.css`, `app.js` — no frameworks, no build step, vanilla JS only

## Photo data
`<script src="../../photos/photos.js"></script>` defines `window.PORTFOLIO = {categories, about, photos}`.
Each photo: `{id, category, tags, title, w, h, color, exif, year, sm, md, lg}`.
- `sm` 480px-wide WebP, `md` 960px-wide WebP, `lg` 2400px long-edge WebP. Paths are relative to the
  site root, so prefix with a `BASE` constant (`'../../'` in the mockups; it becomes `''` at publish).
- Grid thumbs: `<img src=md srcset="sm 480w, md 960w" sizes=... width=w height=h loading="lazy" decoding="async">`,
  use `color` as placeholder background. First ~4 images `loading="eager"` + `fetchpriority="high"` for the hero.
- Lightbox loads `lg` only on open; show title, category label, exif string; prev/next arrows,
  keyboard (Esc / ← / →), swipe on touch, click backdrop to close, focus trap + restore focus,
  `aria-modal`, body scroll lock. Preload neighbour `lg` images. Navigation respects the active filter.
- Category filter: "All" + the 6 categories from data. Update URL hash (`#cycling`) so a filter is linkable.
- Render the grid from data with JS, but put a `<noscript>` note. Grid tiles are `<button>`s (accessible).

## Quality bar
- Responsive down to 360px phones (16px gutters, no horizontal scroll). Test mentally at 360 / 768 / 1440.
- Fonts: Google Fonts with preconnect + `display=swap`. Max 2 families.
- Meta: title, description, Open Graph (og:image = an `md` cycling image), favicon (inline SVG data URI ok).
- `prefers-reduced-motion` respected. Visible focus styles. Good contrast.
- No placeholder lorem. No stock imagery. Photos are the hero — chrome stays out of their way.
- Footer: © 2026 Greg Kabulski · Instagram · Email.

## About copy (adapt length/format to the design, keep the substance)
Headline idea: "I shoot from the saddle." / "Riding with the peloton, camera in hand."

I'm Greg Kabulski, a London-based photographer, and cycling is where my two passions meet. Most weekends
you'll find me somewhere between Regent's Park, Richmond and the Lee Valley — riding the chaingangs,
standing on the corners of a crit, or ankle-deep in cyclocross mud.

What sets my work apart is that I don't wait at the roadside. I ride with the group and shoot on the move,
camera in one hand and bars in the other, so I can get inside the peloton — the shoulder-to-shoulder
tension of a bunch, the grimace on a climb, the light breaking through the trees on a morning loop.
Being a rider myself means I know where the action will happen before it does.

London's cycling community is the heart of it: the clubs, the café stops, the race organisers and the
friends who turn up at 7am in the rain. I want to capture not just the speed and the drama of the sport,
but its beauty and the people who make it.

Away from the bike I photograph streets, cities, landscapes, portraits and wildlife — the same eye for
timing and light, just at a slower pace.

Available for club rides, races, events, brand and editorial commissions. Say hello on Instagram
@temporalny or at gkabulski@gmail.com.

Strength bullets (optional): Shoots while riding · Race & event coverage · Club & brand commissions ·
Fast turnaround.
