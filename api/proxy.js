const fetch = require("node-fetch");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
};
