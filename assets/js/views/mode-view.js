export function updateModeContent(currentMode, elements) {
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === currentMode);
  });

  if (currentMode === "merge") {
    elements.uploadTitle.textContent = "Choose PDFs";
    elements.modeHelp.textContent = "Select one or more PDFs, arrange them, remove pages you do not want, then merge.";
    elements.dropZoneTitle.textContent = "Select PDF files";
    elements.fileSummaryTitle.textContent = "Merge order and pages";
    elements.fileSummaryHelp.textContent = "Use the controls beside each file to preview it, change merge order, or remove pages from the output.";
    elements.createButton.textContent = "Merge PDFs";
    elements.downloadLink.download = "ErsteHilfe.pdf";
    elements.downloadLink.textContent = "Download PDF";
    elements.imageOptions.classList.add("hidden");
    return;
  }

  if (currentMode === "extract") {
    elements.uploadTitle.textContent = "Choose a PDF";
    elements.modeHelp.textContent = "Select one PDF, choose the pages you want to keep, then extract them into a new file.";
    elements.dropZoneTitle.textContent = "Select one PDF file";
    elements.fileSummaryTitle.textContent = "Pages to extract";
    elements.fileSummaryHelp.textContent = "Preview the PDF, then toggle pages on or off before creating the extracted PDF.";
    elements.createButton.textContent = "Extract pages";
    elements.downloadLink.download = "ExtractedPages.pdf";
    elements.downloadLink.textContent = "Download PDF";
    elements.imageOptions.classList.add("hidden");
    return;
  }

  elements.uploadTitle.textContent = "Choose a PDF";
  elements.modeHelp.textContent = "Select one PDF, choose pages, select PNG or JPEG, then download a ZIP of images.";
  elements.dropZoneTitle.textContent = "Select one PDF file";
  elements.fileSummaryTitle.textContent = "Pages to convert";
  elements.fileSummaryHelp.textContent = "Preview the PDF, then toggle pages on or off before converting them to images.";
  elements.createButton.textContent = "Convert to images";
  elements.downloadLink.download = "PdfImages.zip";
  elements.downloadLink.textContent = "Download images ZIP";
  elements.imageOptions.classList.remove("hidden");
}
