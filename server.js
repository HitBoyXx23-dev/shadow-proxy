// 🌑 Shadow Proxy v2 — Backend
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

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing ?url parameter.");
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "ShadowProxy/2.0" },
    });
    res.set(response.headers);
    res.send(response.data);
  } catch (err) {
    res.status(500).send(`🌑 Proxy Error: ${err.message}`);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌑 Shadow Proxy running on port ${PORT}`));
