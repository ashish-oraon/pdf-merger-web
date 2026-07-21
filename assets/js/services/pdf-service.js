import { removePdfExtension } from "../utils/format.js";

export async function createPdfItem(file) {
  const bytes = await file.arrayBuffer();
  const document = await window.PDFLib.PDFDocument.load(bytes);
  const pageCount = document.getPageCount();

  return {
    file,
    pageCount,
    includedPages: new Set(Array.from({ length: pageCount }, (_, index) => index)),
  };
}

export async function createOutputPdfBlob(pdfItems) {
  const outputPdf = await window.PDFLib.PDFDocument.create();

  for (const itemData of pdfItems) {
    if (!itemData.includedPages.size) {
      continue;
    }

    const sourceBytes = await itemData.file.arrayBuffer();
    const sourcePdf = await window.PDFLib.PDFDocument.load(sourceBytes);
    const pageIndices = Array.from(itemData.includedPages).sort((first, second) => first - second);
    const pages = await outputPdf.copyPages(sourcePdf, pageIndices);

    pages.forEach((page) => outputPdf.addPage(page));
  }

  const outputBytes = await outputPdf.save();
  return new Blob([outputBytes], { type: "application/pdf" });
}

export function getOutputName(mode, pdfItems = []) {
  if (mode === "merge") {
    return "Merged.pdf";
  }

  const sourceName = pdfItems[0]?.file?.name;

  if (mode === "extract" && sourceName) {
    return `${removePdfExtension(sourceName)}-extracted.pdf`;
  }

  if (mode === "compress" && sourceName) {
    return `${removePdfExtension(sourceName)}-compressed.pdf`;
  }

  if (mode === "extract") {
    return "ExtractedPages.pdf";
  }

  return "Compressed.pdf";
}

export function getTotalIncludedPages(pdfItems) {
  return pdfItems.reduce((total, itemData) => total + itemData.includedPages.size, 0);
}
