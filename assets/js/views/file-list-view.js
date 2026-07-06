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
  meta.textContent = `${formatFileSize(itemData.file.size)} - ${itemData.pageCount} page${itemData.pageCount === 1 ? "" : "s"} - ${itemData.includedPages.size} included`;
  controls.className = "file-controls";
  pageTools.className = "page-tools";
  pageToolsHeader.className = "page-tools-header";
  pageToolsTitle.className = "page-tools-title";
  pageToolsTitle.textContent = currentMode === "merge" ? "Pages to keep in merge" : "Pages to extract";
  pageActions.className = "file-controls";
  pageChipList.className = "page-chip-list";

  controls.append(createListButton("Preview", "preview", index));

  if (currentMode === "merge") {
    controls.append(
      createListButton("Up", "move-up", index, index === 0),
      createListButton("Down", "move-down", index, index === itemCount - 1),
    );
  }

  pageActions.append(
    createListButton("Keep all", "include-all", index),
    createListButton("Remove all", "exclude-all", index),
  );

  for (let pageIndex = 0; pageIndex < itemData.pageCount; pageIndex += 1) {
    pageChipList.append(createPageButton(index, pageIndex, itemData.includedPages.has(pageIndex)));
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
