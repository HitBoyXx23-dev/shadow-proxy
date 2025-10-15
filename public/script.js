// 🌑 Shadow Proxy Frontend Script
const form = document.getElementById("proxyForm");
const input = document.getElementById("urlInput");
const frame = document.getElementById("proxyFrame");

form.addEventListener("submit", e => {
  e.preventDefault();
  let url = input.value.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  frame.src = `/proxy?url=${encodeURIComponent(url)}`;
});
