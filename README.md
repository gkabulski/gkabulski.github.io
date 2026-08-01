# onstory.uk — static mirror

Self-contained static mirror of https://onstory.uk/ (Squarespace), captured 2026-07-31.
Ready to host on GitHub Pages.

- 54 pages (`<page>/index.html`), 189 localized assets in `assets/`
- YouTube embeds converted to plain iframes (no Squarespace JS needed)
- All internal links are relative — works at any base path (project pages or custom domain)

## Deploy on GitHub Pages
1. Push this repo to GitHub
2. Settings → Pages → Deploy from branch → `main` / root
3. Optional custom domain: add a `CNAME` file containing `onstory.uk` and point DNS at GitHub Pages

## Known limitations
- Fonts load from Adobe Typekit (`use.typekit.net`) via Squarespace's license — if the
  Squarespace subscription ends, fonts fall back to system defaults
- Google Analytics tag (UA, long dead) still present in pages
- One external booking link points to app.squarespacescheduling.com
