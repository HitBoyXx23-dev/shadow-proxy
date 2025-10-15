// 🌑 Shadow Proxy — Public Browser Edition (no key)
import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static("public"));

function sanitizeURL(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

app.get("/proxy", async (req, res) => {
  const { url } = req.query;
  const targetURL = sanitizeURL(url);
  if (!targetURL) return res.status(400).send("⚠️ Invalid URL.");

  try {
    const response = await axios.get(targetURL, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "ShadowProxy/4.1" },
      timeout: 15000,
    });

    Object.entries(response.headers).forEach(([k, v]) => {
      if (!["transfer-encoding", "content-encoding", "content-length"].includes(k))
        res.setHeader(k, v);
    });
    res.send(response.data);
  } catch (err) {
    res.status(500).send(`🌑 Proxy Error: ${err.message}`);
  }
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌑 Shadow Proxy running on port ${PORT}`));
