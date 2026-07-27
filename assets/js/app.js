import { createDownloadController } from "./controllers/download-controller.js";
import { elements } from "./dom.js";
import { renderFileList as renderFileListView } from "./views/file-list-view.js";
import { updateModeContent } from "./views/mode-view.js";
import {
  createOutputPdfBlob,
  createPdfItem,
  getOutputName,
  getTotalIncludedPages,
} from "./services/pdf-service.js";
import { createImagesZipBlob, getImagesOutputName } from "./services/image-service.js";
import { createCompressedPdfBlob, getCompressedOutputName } from "./services/compress-service.js";
import {
  createRotatedPdfBlob,
  getRotatedOutputName,
  getRotatedPageCount,
} from "./services/rotate-service.js";
import { createPreviewController } from "./controllers/preview-controller.js";
import { formatFileSize } from "./utils/format.js";

let currentMode = "merge";
let pdfItems = [];

const downloadController = createDownloadController(elements.downloadLink);
const previewController = createPreviewController(elements);

elements.fileInput.addEventListener("change", async () => {
  downloadController.revokeDownloadUrl();
  previewController.clearPreview();

  const files = Array.from(elements.fileInput.files);
  const usableFiles = currentMode === "merge" ? files : files.slice(0, 1);

  if (!usableFiles.length) {
    pdfItems = [];
    renderFileList();
    setStatus("");
    return;
  }

  setStatus("Reading PDF pages...");
  elements.createButton.disabled = true;

  try {
    pdfItems = await Promise.all(usableFiles.map(createPdfItem));
    renderFileList();
    setStatus(getSelectionStatus());
  } catch (error) {
    console.error(error);
    pdfItems = [];
    renderFileList();
    setStatus("Could not read one of these PDFs. Make sure every selected file is a valid PDF.", "error");
  }
});

elements.fileList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "preview") {
    previewFile(index);
    return;
  }

  if (action === "move-up") {
    moveFile(index, -1);
    return;
  }

  if (action === "move-down") {
    moveFile(index, 1);
    return;
  }

  if (action === "include-all") {
    setAllPages(index, true);
    return;
  }

  if (action === "exclude-all") {
    setAllPages(index, false);
    return;
  }

  if (action === "toggle-page") {
    togglePage(index, Number(button.dataset.pageIndex));
    return;
  }

  if (action === "cycle-rotation") {
    cyclePageRotation(index, Number(button.dataset.pageIndex));
    return;
  }

  if (action === "rotate-all") {
    rotateAllPages(index);
    return;
  }

  if (action === "reset-rotations") {
    resetRotations(index);
  }
});

elements.clearPreviewButton.addEventListener("click", previewController.clearPreview);
elements.imageFormat.addEventListener("change", () => {
  downloadController.revokeDownloadUrl();
});
elements.compressQuality.addEventListener("change", () => {
  downloadController.revokeDownloadUrl();
});

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

elements.createButton.addEventListener("click", createOutput);

window.addEventListener("beforeunload", () => {
  downloadController.revokeDownloadUrl();
  previewController.revokePreviewUrl();
});

function renderFileList() {
  renderFileListView(elements.fileList, pdfItems, currentMode);
  updateCreateButton();
}

function moveFile(index, direction) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= pdfItems.length) {
    return;
  }

  [pdfItems[index], pdfItems[targetIndex]] = [pdfItems[targetIndex], pdfItems[index]];
  downloadController.revokeDownloadUrl();
  renderFileList();
  setStatus("Merge order updated.");
}

async function previewFile(index) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  if (currentMode === "rotate") {
    setStatus(`Building rotated preview for ${itemData.file.name}...`);
    try {
      const blob = await createRotatedPdfBlob(itemData);
      previewController.previewBlob(blob, `${itemData.file.name} (rotated preview)`, index);
      setStatus(`Previewing rotated ${itemData.file.name}.`);
    } catch (error) {
      console.error(error);
      setStatus("Could not build a rotated preview for this PDF.", "error");
    }
    return;
  }

  previewController.previewFile(itemData, index);
  setStatus(`Previewing ${itemData.file.name}.`);
}

async function refreshRotatePreviewIfNeeded(index) {
  if (currentMode !== "rotate" || previewController.getPreviewedIndex() !== index) {
    return;
  }

  await previewFile(index);
}

function setStatus(message, type = "") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = type ? `status ${type}` : "status";
}

function setMode(mode) {
  if (mode === currentMode) {
    return;
  }

  currentMode = mode;
  pdfItems = [];
  elements.fileInput.value = "";
  elements.fileInput.multiple = currentMode === "merge";
  downloadController.revokeDownloadUrl();
  previewController.clearPreview();
  updateModeContent(currentMode, elements);
  renderFileList();
  setStatus("");
}

function togglePage(index, pageIndex) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  if (itemData.includedPages.has(pageIndex)) {
    itemData.includedPages.delete(pageIndex);
  } else {
    itemData.includedPages.add(pageIndex);
  }

  downloadController.revokeDownloadUrl();
  renderFileList();
  setStatus("Page selection updated.");
}

function setAllPages(index, shouldInclude) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  itemData.includedPages = shouldInclude
    ? new Set(Array.from({ length: itemData.pageCount }, (_, pageIndex) => pageIndex))
    : new Set();

  downloadController.revokeDownloadUrl();
  renderFileList();
  setStatus(shouldInclude ? "All pages included." : "All pages removed from this output.");
}

function cyclePageRotation(index, pageIndex) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  itemData.pageRotations[pageIndex] = (itemData.pageRotations[pageIndex] + 90) % 360;
  downloadController.revokeDownloadUrl();
  renderFileList();
  setStatus(`Page ${pageIndex + 1} set to ${itemData.pageRotations[pageIndex]}°.`);
  refreshRotatePreviewIfNeeded(index);
}

function rotateAllPages(index) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  itemData.pageRotations = itemData.pageRotations.map((rotation) => (rotation + 90) % 360);
  downloadController.revokeDownloadUrl();
  renderFileList();
  setStatus("All pages rotated by 90°.");
  refreshRotatePreviewIfNeeded(index);
}

function resetRotations(index) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  itemData.pageRotations = Array.from({ length: itemData.pageCount }, () => 0);
  downloadController.revokeDownloadUrl();
  renderFileList();
  setStatus("Page rotations reset.");
  refreshRotatePreviewIfNeeded(index);
}

async function createOutput() {
  if (!pdfItems.length) {
    setStatus(currentMode === "merge" ? "Choose at least one PDF first." : "Choose a PDF first.", "error");
    return;
  }

  if (currentMode === "rotate") {
    if (!getRotatedPageCount(pdfItems[0])) {
      setStatus("Rotate at least one page before creating the PDF.", "error");
      return;
    }
  } else if (!getTotalIncludedPages(pdfItems)) {
    setStatus("Select at least one page for the output.", "error");
    return;
  }

  elements.createButton.disabled = true;
  elements.downloadLink.classList.add("hidden");
  setStatus(getWorkingStatus());

  try {
    if (currentMode === "image") {
      const blob = await createImagesZipBlob(pdfItems[0], elements.imageFormat.value);
      downloadController.showDownload(blob, getImagesOutputName(pdfItems[0]), "Download images ZIP");
      setStatus("Image ZIP is ready to download.", "success");
      return;
    }

    if (currentMode === "compress") {
      const sourceSize = pdfItems[0].file.size;
      const blob = await createCompressedPdfBlob(pdfItems[0], elements.compressQuality.value);
      downloadController.showDownload(blob, getCompressedOutputName(pdfItems[0]), "Download compressed PDF");
      setStatus(
        `Compressed PDF is ready to download (${formatFileSize(sourceSize)} → ${formatFileSize(blob.size)}).`,
        "success",
      );
      return;
    }

    if (currentMode === "rotate") {
      const blob = await createRotatedPdfBlob(pdfItems[0]);
      downloadController.showDownload(blob, getRotatedOutputName(pdfItems[0]), "Download rotated PDF");
      setStatus("Rotated PDF is ready to download.", "success");
      return;
    }

    const blob = await createOutputPdfBlob(pdfItems);
    const fileName = getOutputName(currentMode, pdfItems);
    const downloadLabel = currentMode === "merge" ? "Download merged PDF" : "Download extracted PDF";
    downloadController.showDownload(blob, fileName, downloadLabel);
    setStatus(getSuccessStatus(), "success");
  } catch (error) {
    console.error(error);
    setStatus("Could not create the output. Make sure every selected file is valid.", "error");
  } finally {
    updateCreateButton();
  }
}

function updateCreateButton() {
  elements.createButton.disabled = !pdfItems.length;
}

updateModeContent(currentMode, elements);

function getSelectionStatus() {
  if (currentMode === "merge") {
    return `${pdfItems.length} PDF file${pdfItems.length === 1 ? "" : "s"} selected.`;
  }

  return `${pdfItems[0].file.name} loaded with ${pdfItems[0].pageCount} page${pdfItems[0].pageCount === 1 ? "" : "s"}.`;
}

function getWorkingStatus() {
  if (currentMode === "merge") {
    return "Merging selected pages...";
  }

  if (currentMode === "extract") {
    return "Extracting selected pages...";
  }

  if (currentMode === "compress") {
    return "Compressing selected pages...";
  }

  if (currentMode === "rotate") {
    return "Rotating selected pages...";
  }

  return "Converting selected pages to images...";
}

function getSuccessStatus() {
  if (currentMode === "merge") {
    return "Merged PDF is ready to download.";
  }

  return "Extracted PDF is ready to download.";
}
