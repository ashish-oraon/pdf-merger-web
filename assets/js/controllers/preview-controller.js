export function createPreviewController({
  previewFrame,
  previewName,
  previewPlaceholder,
  clearPreviewButton,
}) {
  let currentPreviewUrl = null;
  let previewedIndex = null;

  function showPreview(blobOrFile, fileName, index = null) {
    revokePreviewUrl();
    currentPreviewUrl = URL.createObjectURL(blobOrFile);
    previewedIndex = index;
    previewFrame.src = currentPreviewUrl;
    previewFrame.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");
    clearPreviewButton.classList.remove("hidden");
    previewName.textContent = fileName;
  }

  function previewFile(itemData, index = null) {
    if (!itemData) {
      return;
    }

    showPreview(itemData.file, itemData.file.name, index);
  }

  function previewBlob(blob, fileName, index = null) {
    if (!blob) {
      return;
    }

    showPreview(blob, fileName, index);
  }

  function clearPreview() {
    revokePreviewUrl();
    previewedIndex = null;
    previewFrame.removeAttribute("src");
    previewFrame.classList.add("hidden");
    previewPlaceholder.classList.remove("hidden");
    clearPreviewButton.classList.add("hidden");
    previewName.textContent = "Select a PDF to preview it here.";
  }

  function revokePreviewUrl() {
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      currentPreviewUrl = null;
    }
  }

  function getPreviewedIndex() {
    return previewedIndex;
  }

  return {
    previewFile,
    previewBlob,
    clearPreview,
    revokePreviewUrl,
    getPreviewedIndex,
  };
}
