import { getDocument, GlobalWorkerOptions } from "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.mjs";
import { removePdfExtension } from "../utils/format.js";

GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

const QUALITY_PRESETS = {
  low: { scale: 1, jpegQuality: 0.5 },
  medium: { scale: 1.25, jpegQuality: 0.7 },
  high: { scale: 1.5, jpegQuality: 0.85 },
};

export async function createCompressedPdfBlob(pdfItem, quality) {
  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.medium;
  const pdfBytes = await pdfItem.file.arrayBuffer();
  const sourceDocument = await getDocument({ data: new Uint8Array(pdfBytes) }).promise;
  const outputPdf = await window.PDFLib.PDFDocument.create();
  const pageIndices = Array.from(pdfItem.includedPages).sort((first, second) => first - second);

  for (const pageIndex of pageIndices) {
    const page = await sourceDocument.getPage(pageIndex + 1);
    const jpegBytes = await renderPageToJpegBytes(page, preset.scale, preset.jpegQuality);
    const embeddedImage = await outputPdf.embedJpg(jpegBytes);
    const outputPage = outputPdf.addPage([embeddedImage.width, embeddedImage.height]);
    outputPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });
  }

  sourceDocument.destroy();

  const outputBytes = await outputPdf.save({ useObjectStreams: true });
  return new Blob([outputBytes], { type: "application/pdf" });
}

export function getCompressedOutputName(pdfItem) {
  return `${removePdfExtension(pdfItem.file.name)}-compressed.pdf`;
}

async function renderPageToJpegBytes(page, scale, jpegQuality) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (imageBlob) => {
        if (imageBlob) {
          resolve(imageBlob);
          return;
        }

        reject(new Error("Could not compress PDF page."));
      },
      "image/jpeg",
      jpegQuality,
    );
  });

  return new Uint8Array(await blob.arrayBuffer());
}
