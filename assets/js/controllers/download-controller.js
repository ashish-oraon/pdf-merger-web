export function createDownloadController(downloadLink) {
  let currentDownloadUrl = null;

  function showDownload(blob, fileName) {
    revokeDownloadUrl();
    currentDownloadUrl = URL.createObjectURL(blob);
    downloadLink.href = currentDownloadUrl;
    downloadLink.download = fileName;
    downloadLink.classList.remove("hidden");
  }

  function revokeDownloadUrl() {
    if (currentDownloadUrl) {
      URL.revokeObjectURL(currentDownloadUrl);
      currentDownloadUrl = null;
    }

    downloadLink.removeAttribute("href");
    downloadLink.classList.add("hidden");
  }

  return {
    showDownload,
    revokeDownloadUrl,
  };
}
