const form = document.getElementById("proxyForm");
const input = document.getElementById("urlInput");
const iframe = document.getElementById("proxyFrame");
const overlay = document.getElementById("loadingOverlay");

form.addEventListener("submit", e => {
  e.preventDefault();
  let url = input.value.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  overlay.style.display = "flex";
  iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
});

iframe.addEventListener("load", () => {
  overlay.style.display = "none";
});
