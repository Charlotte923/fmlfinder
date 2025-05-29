const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    console.log("Fetching URL:", url); // Debug log

    // Different headers for Funda and S3
    const headers = url.includes("funda.nl")
      ? {
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "DNT": "1",
          "Pragma": "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
        }
      : {
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Origin": "https://www.funda.nl",
          "Referer": "https://www.funda.nl/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        };

    // First request to get cookies if it's a Funda URL
    let response;
    if (url.includes("funda.nl")) {
      const initialResponse = await fetch(url, { headers });
      const cookies = initialResponse.headers.raw()["set-cookie"];

      if (cookies) {
        headers["Cookie"] = cookies.join("; ");
      }

      response = await fetch(url, {
        headers,
        redirect: "follow",
      });
    } else {
      response = await fetch(url, { headers });
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.text();

    // Check if we got the CAPTCHA page
    if (
      data.includes("Je bent bijna op de pagina die je zoekt") ||
      data.includes("fundaCaptchaForm")
    ) {
      return res.status(403).json({
        error:
          "Funda is blocking our request. Try using a direct Funda URL that doesn't require authentication.",
        suggestion:
          "Try using a URL from the plattegrond page directly, or try again in a few minutes.",
      });
    }

    console.log("Response received, length:", data.length); // Debug log

    // Set the same content type as the original response
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.send(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
