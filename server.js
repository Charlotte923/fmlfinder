const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const handler = async (req, res) => {
  if (req.method === "GET" && req.url.startsWith("/proxy")) {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
        },
      });
      const data = await response.text();
      res.send(data);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    res.status(404).json({ error: "Not found" });
  }
};

// Export the handler for Vercel
module.exports = handler;

// For local development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;

  app.get("/proxy", handler);

  app.use(express.static(__dirname));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
