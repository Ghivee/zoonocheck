# ZoonoCheck

An encyclopedia of zoonoses for households with pets: diseases that pass between cats, dogs, people and the home environment. It is a static site with no backend and it works offline as a progressive web app.

[Bahasa Indonesia](README.id.md)

The content is an educational draft. It has not been reviewed by a veterinarian or a medical professional.

## What it has

- **Encyclopedia** pages for dermatophytosis, toxocariasis and toxoplasmosis (`ensiklopedi/`).
- **Risk screening** (`skrining/`) and **hygiene reminders** (`pengingat/`).
- An about page, a service worker (`sw.js`), a web manifest, a sitemap and a 404 page.
- The requirements document is in `docs/SRS.pdf`, and `docs/HANDOFF.md` records the state of the site.

## Running it

URLs use real paths without `#`, so the site has to be served over HTTP:

```bash
python3 tools/serve.py 8123      # dev server that falls back to index.html
```

Pages are generated from `tools/template.html`. Set `BASE` in `tools/build.py` to your production domain first (it is a placeholder now):

```bash
python3 tools/build.py
```

Deployed on Vercel (`vercel.json`). Photos are CC0.
