import { getDocument, GlobalWorkerOptions } from "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.mjs";
import { removePdfExtension } from "../utils/format.js";

GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

const IMAGE_SCALE = 2;

export async function createImagesZipBlob(pdfItem, imageFormat) {
  const pdfBytes = await pdfItem.file.arrayBuffer();
  const document = await getDocument({ data: new Uint8Array(pdfBytes) }).promise;
  const zip = new window.JSZip();
  const pageIndices = Array.from(pdfItem.includedPages).sort((first, second) => first - second);
  const extension = imageFormat === "jpeg" ? "jpg" : "png";
  const mimeType = imageFormat === "jpeg" ? "image/jpeg" : "image/png";
  const baseName = removePdfExtension(pdfItem.file.name);

  for (const pageIndex of pageIndices) {
    const page = await document.getPage(pageIndex + 1);
    const imageBlob = await renderPageToBlob(page, mimeType);
    zip.file(`${baseName}-page-${String(pageIndex + 1).padStart(3, "0")}.${extension}`, imageBlob);
  }

  document.destroy();

  return zip.generateAsync({ type: "blob" });
}

export function getImagesOutputName(pdfItem) {
  return `${removePdfExtension(pdfItem.file.name)}-images.zip`;
}

async function renderPageToBlob(page, mimeType) {
  const viewport = page.getViewport({ scale: IMAGE_SCALE });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Could not render PDF page to an image."));
      },
      mimeType,
      0.92,
    );
  });
}
