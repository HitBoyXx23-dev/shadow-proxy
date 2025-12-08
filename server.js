import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

function sanitizeURL(url) {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

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
      decompress: true
    });

    res.status(response.status);
    response.data.pipe(res);

  } catch (err) {
    res.status(500).send("Proxy Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🌑 Shadow Proxy running on port ${PORT}`)
);
