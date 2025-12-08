// 🌑 Shadow Proxy — Render Ready
import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static("public")); // serves /public/index.html at "/"

function sanitizeURL(url) {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

// Optional explicit root handler (Render health checks like this)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/proxy", async (req, res) => {
  const targetURL = sanitizeURL(req.query.url);
  if (!targetURL) return res.status(400).send("Invalid URL");

  try {
    const response = await axios({
      url: targetURL,
      method: "get",
      responseType: "stream",
      timeout: 15000,
      maxRedirects: 5,
      decompress: true,
      headers: {
        "User-Agent": "ShadowProxy/6.0",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br"
      }
    });

    // Forward only safe/useful headers
    const allowed = [
      "content-type",
      "content-language",
      "cache-control",
      "expires",
      "last-modified",
      "etag"
    ];

    for (const [key, value] of Object.entries(response.headers)) {
      if (allowed.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    res.status(response.status);
    response.data.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌑 Shadow Proxy running on port ${PORT}`);
});
