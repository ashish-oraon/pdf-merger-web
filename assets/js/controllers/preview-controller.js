export function createPreviewController({
  previewFrame,
  previewName,
  previewPlaceholder,
  clearPreviewButton,
}) {
  let currentPreviewUrl = null;

  function previewFile(itemData) {
    if (!itemData) {
      return;
    }

    revokePreviewUrl();
    currentPreviewUrl = URL.createObjectURL(itemData.file);
    previewFrame.src = currentPreviewUrl;
    previewFrame.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");
    clearPreviewButton.classList.remove("hidden");
    previewName.textContent = itemData.file.name;
  }

  function clearPreview() {
    revokePreviewUrl();
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

  return {
    previewFile,
    clearPreview,
    revokePreviewUrl,
  };
}
