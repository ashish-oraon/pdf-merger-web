import { removePdfExtension } from "../utils/format.js";

export async function createRotatedPdfBlob(pdfItem) {
  const sourceBytes = await pdfItem.file.arrayBuffer();
  const pdfDocument = await window.PDFLib.PDFDocument.load(sourceBytes);
  const pages = pdfDocument.getPages();

  pages.forEach((page, pageIndex) => {
    const extraRotation = pdfItem.pageRotations[pageIndex] || 0;

    if (!extraRotation) {
      return;
    }

    const currentAngle = page.getRotation().angle;
    page.setRotation(window.PDFLib.degrees((currentAngle + extraRotation) % 360));
  });

  const outputBytes = await pdfDocument.save();
  return new Blob([outputBytes], { type: "application/pdf" });
}

export function getRotatedOutputName(pdfItem) {
  return `${removePdfExtension(pdfItem.file.name)}-rotated.pdf`;
}

export function getRotatedPageCount(pdfItem) {
  return pdfItem.pageRotations.filter((rotation) => rotation !== 0).length;
}
