// 🌑 Shadow Proxy v3 — Stable, friend-safe proxy
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

const ACCESS_KEY = "shadowfriends"; // Only friends with this key can access

// Helper — ensure valid URL
function sanitizeURL(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  try {
    new URL(url); // check valid URL
    return url;
  } catch {
    return null;
  }
}

app.get("/proxy", async (req, res) => {
  const { url, key } = req.query;

  if (key !== ACCESS_KEY) {
    return res.status(403).send("❌ Invalid access key.");
  }

  const targetURL = sanitizeURL(url);
  if (!targetURL) {
    return res.status(400).send("⚠️ Invalid URL.");
  }

  try {
    const response = await axios.get(targetURL, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "ShadowProxy/3.0",
        "Accept": "*/*",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    // Mirror headers safely
    Object.entries(response.headers).forEach(([k, v]) => {
      if (!["transfer-encoding", "content-encoding", "content-length"].includes(k))
        res.setHeader(k, v);
    });

    res.send(response.data);
  } catch (err) {
    res
      .status(500)
      .send(`🌑 Proxy Error: ${err.message}\n(while trying to reach ${targetURL})`);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌑 Shadow Proxy v3 running on port ${PORT}`));
