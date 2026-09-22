# LG After-Sales Repair Invoice — Prototype

A simple HTML/CSS/JavaScript proof of concept for generating two repair invoice PDFs:

1. Client copy
2. Repairman copy with a handwritten report area

## Run

Open `index.html` in a modern browser.

The PDF libraries are loaded from CDN, so an internet connection is required for PDF generation unless you download the libraries locally.

## Main files

- `index.html` — application UI
- `style.css` — dashboard + A4 invoice styling
- `script.js` — live preview, validation and PDF generation
- `assets/` — place the real company logo here later

## Notes

This is intentionally frontend-only. There is no database, authentication or backend.

For a production version, the same invoice design can later be moved to Laravel and a server-side PDF generator.
