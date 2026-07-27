import { formatFileSize } from "../utils/format.js";

export function renderFileList(fileList, pdfItems, currentMode) {
  fileList.replaceChildren();

  if (!pdfItems.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No PDFs selected yet.";
    fileList.append(emptyItem);
    return;
  }

  pdfItems.forEach((itemData, index) => {
    fileList.append(createFileItem(itemData, index, pdfItems.length, currentMode));
  });
}

function createFileItem(itemData, index, itemCount, currentMode) {
  const item = document.createElement("li");
  const details = document.createElement("div");
  const name = document.createElement("strong");
  const meta = document.createElement("span");
  const controls = document.createElement("div");
  const pageTools = document.createElement("div");
  const pageToolsHeader = document.createElement("div");
  const pageToolsTitle = document.createElement("span");
  const pageActions = document.createElement("div");
  const pageChipList = document.createElement("div");

  item.className = "file-item";
  details.className = "file-details";
  name.className = "file-name";
  name.textContent = itemData.file.name;
  meta.className = "file-meta";
  meta.textContent = getFileMeta(itemData, currentMode);
  controls.className = "file-controls";
  pageTools.className = "page-tools";
  pageToolsHeader.className = "page-tools-header";
  pageToolsTitle.className = "page-tools-title";
  pageToolsTitle.textContent = getPageToolsTitle(currentMode);
  pageActions.className = "file-controls";
  pageChipList.className = "page-chip-list";

  controls.append(createListButton("Preview", "preview", index));

  if (currentMode === "merge") {
    controls.append(
      createListButton("Up", "move-up", index, index === 0),
      createListButton("Down", "move-down", index, index === itemCount - 1),
    );
  }

  if (currentMode === "rotate") {
    pageActions.append(
      createListButton("Rotate all 90°", "rotate-all", index),
      createListButton("Reset", "reset-rotations", index),
    );

    for (let pageIndex = 0; pageIndex < itemData.pageCount; pageIndex += 1) {
      pageChipList.append(createRotationPageButton(index, pageIndex, itemData.pageRotations[pageIndex]));
    }
  } else {
    pageActions.append(
      createListButton("Keep all", "include-all", index),
      createListButton("Remove all", "exclude-all", index),
    );

    for (let pageIndex = 0; pageIndex < itemData.pageCount; pageIndex += 1) {
      pageChipList.append(createPageButton(index, pageIndex, itemData.includedPages.has(pageIndex)));
    }
  }

  pageToolsHeader.append(pageToolsTitle, pageActions);
  pageTools.append(pageToolsHeader, pageChipList);
  details.append(name, meta);
  item.append(details, controls, pageTools);

  return item;
}

function createListButton(label, action, index, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "small-button";
  button.dataset.action = action;
  button.dataset.index = String(index);
  button.disabled = disabled;
  button.textContent = label;
  return button;
}

function createPageButton(index, pageIndex, isIncluded) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isIncluded ? "page-chip" : "page-chip excluded";
  button.dataset.action = "toggle-page";
  button.dataset.index = String(index);
  button.dataset.pageIndex = String(pageIndex);
  button.textContent = `Page ${pageIndex + 1}`;
  button.title = isIncluded ? "Click to remove this page from the output" : "Click to add this page back";
  return button;
}

function createRotationPageButton(index, pageIndex, rotation) {
  const button = document.createElement("button");
  const hasRotation = rotation !== 0;
  button.type = "button";
  button.className = hasRotation ? "page-chip rotated" : "page-chip";
  button.dataset.action = "cycle-rotation";
  button.dataset.index = String(index);
  button.dataset.pageIndex = String(pageIndex);
  button.textContent = hasRotation ? `Page ${pageIndex + 1} · ${rotation}°` : `Page ${pageIndex + 1}`;
  button.title = "Click to rotate this page by 90°";
  return button;
}

function getFileMeta(itemData, currentMode) {
  const sizeLabel = formatFileSize(itemData.file.size);
  const pageLabel = `${itemData.pageCount} page${itemData.pageCount === 1 ? "" : "s"}`;

  if (currentMode === "rotate") {
    const rotatedCount = itemData.pageRotations.filter((rotation) => rotation !== 0).length;
    return `${sizeLabel} - ${pageLabel} - ${rotatedCount} rotated`;
  }

  return `${sizeLabel} - ${pageLabel} - ${itemData.includedPages.size} included`;
}

function getPageToolsTitle(currentMode) {
  if (currentMode === "merge") {
    return "Pages to keep in merge";
  }

  if (currentMode === "extract") {
    return "Pages to extract";
  }

  if (currentMode === "compress") {
    return "Pages to compress";
  }

  if (currentMode === "rotate") {
    return "Click a page to rotate it";
  }

  return "Pages to convert";
}
