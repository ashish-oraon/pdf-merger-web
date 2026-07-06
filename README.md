# PDF Portal

A small static webapp for merging PDFs, extracting pages, and converting PDF pages to images directly in the browser. It can be published with GitHub Pages because it only uses HTML, CSS, and JavaScript.

## Use Locally

Serve this folder with a static server, then open the local URL and choose `Merge PDFs`, `Extract pages`, or `Convert to images`.

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

In `Merge PDFs`, select one or more PDF files, arrange them with the `Up` and `Down` buttons, remove any pages you do not want, click `Merge PDFs`, and download the generated `ErsteHilfe.pdf`.

In `Extract pages`, select one PDF, keep only the pages you want, click `Extract pages`, and download the generated `ExtractedPages.pdf`.

In `Convert to images`, select one PDF, choose PNG or JPEG, keep only the pages you want, click `Convert to images`, and download a ZIP with one image per page.

Use `Preview` next to any selected file to view it before creating the output.

Your PDFs stay on your computer. The app does not upload files to a server.

## Publish On GitHub Pages

1. Create a GitHub repository for this folder.
2. Push `index.html`, the `assets` folder, and this `README.md`.
3. In GitHub, open the repository settings.
4. Go to `Pages`.
5. Under `Build and deployment`, choose `Deploy from a branch`.
6. Select the branch that contains these files, usually `main`.
7. Select `/root` if these files are at the repository root, or `/docs` if you move them into a `docs` folder.
8. Save and wait for GitHub to publish the site URL.

## Notes

- Merge order follows the order shown in the file list.
- Page chips show which pages will be included. Click a page chip to remove it from or add it back to the output.
- Preview uses your browser's built-in PDF viewer.
- The app uses `pdf-lib`, `pdf.js`, and `JSZip` from CDNs.
- CSS lives in `assets/css`, and JavaScript modules live in `assets/js`.
- Very large PDFs may take longer because all merging happens in the browser.

## Project Structure

```text
pdf-merger-web/
  index.html
  README.md
  assets/
    css/
      styles.css
    js/
      app.js
      dom.js
      controllers/
      services/
      utils/
      views/
```
