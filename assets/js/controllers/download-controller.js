export function createDownloadController(downloadLink) {
  let currentDownloadUrl = null;

  function showDownload(blob, fileName, label = "Download PDF") {
    revokeDownloadUrl();
    currentDownloadUrl = URL.createObjectURL(blob);
    downloadLink.setAttribute("download", fileName);
    downloadLink.download = fileName;
    downloadLink.href = currentDownloadUrl;
    downloadLink.textContent = label;
    downloadLink.classList.remove("hidden");
  }

  function revokeDownloadUrl() {
    if (currentDownloadUrl) {
      URL.revokeObjectURL(currentDownloadUrl);
      currentDownloadUrl = null;
    }

    downloadLink.removeAttribute("href");
    downloadLink.removeAttribute("download");
    downloadLink.classList.add("hidden");
  }

  return {
    showDownload,
    revokeDownloadUrl,
  };
}
