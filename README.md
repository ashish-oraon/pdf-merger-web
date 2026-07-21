# PDF Portal

A small static webapp for merging PDFs, extracting pages, compressing PDFs, and converting PDF pages to images directly in the browser. It can be published with GitHub Pages because it only uses HTML, CSS, and JavaScript.

## Use Locally

Serve this folder with a static server, then open the local URL and choose `Merge PDFs`, `Extract pages`, `Compress PDF`, or `Convert to images`.

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

In `Merge PDFs`, select one or more PDF files, arrange them with the `Up` and `Down` buttons, remove any pages you do not want, click `Merge PDFs`, and download `Merged.pdf`.

In `Extract pages`, select one PDF, keep only the pages you want, click `Extract pages`, and download the extracted PDF.

In `Compress PDF`, select one PDF, choose a compression level, click `Compress PDF`, and download the smaller PDF.

In `Convert to images`, select one PDF, choose PNG or JPEG, keep only the pages you want, click `Convert to images`, and download a ZIP with one image per page.

Use `Preview` next to any selected file to view it before creating the output.

Your PDFs stay on your computer. The app does not upload files to a server.

## Deploy to GitHub Pages

This app is static, so you can publish it with the `gh-pages` package.

### 1. Push the project to GitHub

Create a repository and push the source branch (usually `main`) first:

```powershell
git init
git add .
git commit -m "Add PDF Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Install dependencies and deploy

```powershell
npm install
npm run deploy
```

That runs `gh-pages -d . --nojekyll`, which publishes the site files to a `gh-pages` branch.

### 3. Point GitHub Pages at the `gh-pages` branch

1. Open the repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the `gh-pages` branch and `/ (root)`.
5. Click **Save**.

After the first deploy, the site URL will look like:

```text
https://<your-username>.github.io/<your-repo>/
```

To publish updates later, commit your changes on `main`, then run `npm run deploy` again.

## Notes

- Merge order follows the order shown in the file list.
- Page chips show which pages will be included. Click a page chip to remove it from or add it back to the output.
- Preview uses your browser's built-in PDF viewer.
- The app uses `pdf-lib`, `pdf.js`, and `JSZip` from CDNs.
- CSS lives in `assets/css`, and JavaScript modules live in `assets/js`.
- Very large PDFs may take longer because processing happens in the browser.

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
