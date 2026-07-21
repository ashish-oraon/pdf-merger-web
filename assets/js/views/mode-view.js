const MODE_COPY = {
  merge: {
    uploadTitle: "Choose PDFs",
    modeHelp: "Select one or more PDFs, arrange them, remove pages you do not want, then merge.",
    dropZoneTitle: "Select PDF files",
    fileSummaryTitle: "Merge order and pages",
    fileSummaryHelp: "Use the controls beside each file to preview it, change merge order, or remove pages from the output.",
    createButton: "Merge PDFs",
    downloadLabel: "Download merged PDF",
    showImageOptions: false,
    showCompressOptions: false,
  },
  extract: {
    uploadTitle: "Choose a PDF",
    modeHelp: "Select one PDF, choose the pages you want to keep, then extract them into a new file.",
    dropZoneTitle: "Select one PDF file",
    fileSummaryTitle: "Pages to extract",
    fileSummaryHelp: "Preview the PDF, then toggle pages on or off before creating the extracted PDF.",
    createButton: "Extract pages",
    downloadLabel: "Download extracted PDF",
    showImageOptions: false,
    showCompressOptions: false,
  },
  image: {
    uploadTitle: "Choose a PDF",
    modeHelp: "Select one PDF, choose pages, select PNG or JPEG, then download a ZIP of images.",
    dropZoneTitle: "Select one PDF file",
    fileSummaryTitle: "Pages to convert",
    fileSummaryHelp: "Preview the PDF, then toggle pages on or off before converting them to images.",
    createButton: "Convert to images",
    downloadLabel: "Download images ZIP",
    showImageOptions: true,
    showCompressOptions: false,
  },
  compress: {
    uploadTitle: "Choose a PDF",
    modeHelp: "Select one PDF, choose pages and a compression level, then download a smaller PDF.",
    dropZoneTitle: "Select one PDF file",
    fileSummaryTitle: "Pages to compress",
    fileSummaryHelp: "Preview the PDF, then toggle pages on or off before compressing.",
    createButton: "Compress PDF",
    downloadLabel: "Download compressed PDF",
    showImageOptions: false,
    showCompressOptions: true,
  },
};

export function updateModeContent(currentMode, elements) {
  const copy = MODE_COPY[currentMode] || MODE_COPY.merge;

  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === currentMode);
  });

  elements.uploadTitle.textContent = copy.uploadTitle;
  elements.modeHelp.textContent = copy.modeHelp;
  elements.dropZoneTitle.textContent = copy.dropZoneTitle;
  elements.fileSummaryTitle.textContent = copy.fileSummaryTitle;
  elements.fileSummaryHelp.textContent = copy.fileSummaryHelp;
  elements.createButton.textContent = copy.createButton;
  elements.downloadLink.textContent = copy.downloadLabel;
  elements.downloadLink.removeAttribute("download");
  elements.imageOptions.classList.toggle("hidden", !copy.showImageOptions);
  elements.compressOptions.classList.toggle("hidden", !copy.showCompressOptions);
}
