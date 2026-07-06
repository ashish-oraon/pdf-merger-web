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
import { createPreviewController } from "./controllers/preview-controller.js";

let currentMode = "merge";
let pdfItems = [];

const downloadController = createDownloadController(elements.downloadLink);
const previewController = createPreviewController(elements);

elements.fileInput.addEventListener("change", async () => {
  downloadController.revokeDownloadUrl();
  previewController.clearPreview();

  const files = Array.from(elements.fileInput.files);
  const usableFiles = currentMode === "extract" ? files.slice(0, 1) : files;

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
    setStatus(
      currentMode === "merge"
        ? `${pdfItems.length} PDF file${pdfItems.length === 1 ? "" : "s"} selected.`
        : `${pdfItems[0].file.name} loaded with ${pdfItems[0].pageCount} page${pdfItems[0].pageCount === 1 ? "" : "s"}.`,
    );
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
  }
});

elements.clearPreviewButton.addEventListener("click", previewController.clearPreview);

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

elements.createButton.addEventListener("click", createOutputPdf);

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

function previewFile(index) {
  const itemData = pdfItems[index];

  if (!itemData) {
    return;
  }

  previewController.previewFile(itemData);
  setStatus(`Previewing ${itemData.file.name}.`);
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

async function createOutputPdf() {
  if (!pdfItems.length) {
    setStatus(currentMode === "merge" ? "Choose at least one PDF first." : "Choose a PDF first.", "error");
    return;
  }

  const totalIncludedPages = getTotalIncludedPages(pdfItems);

  if (!totalIncludedPages) {
    setStatus("Select at least one page for the output PDF.", "error");
    return;
  }

  elements.createButton.disabled = true;
  elements.downloadLink.classList.add("hidden");
  setStatus(currentMode === "merge" ? "Merging selected pages..." : "Extracting selected pages...");

  try {
    const blob = await createOutputPdfBlob(pdfItems);
    downloadController.showDownload(blob, getOutputName(currentMode));
    setStatus(
      currentMode === "merge"
        ? "Merged PDF is ready to download."
        : "Extracted PDF is ready to download.",
      "success",
    );
  } catch (error) {
    console.error(error);
    setStatus("Could not create the PDF. Make sure every selected file is valid.", "error");
  } finally {
    updateCreateButton();
  }
}

function updateCreateButton() {
  elements.createButton.disabled = !pdfItems.length;
}

updateModeContent(currentMode, elements);
