export const blockHeadlessBrowser = (req, res, next) => {
  
  // 🔎 Headers that real browsers usually send
  const requiredHeaders = [
    "accept-language",
    "sec-fetch-mode",
    "sec-fetch-site",
    "sec-ch-ua",
    "sec-ch-ua-platform",
    "user-agent",
    "accept",
    "referer",
    "sec-fetch-dest",
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !req.headers[header]
  );

  // ❌ Block if more than 3 required headers are missing
  if (missingHeaders.length >= 3) {
    return res.status(403).json({
      error: "Access denied — missing required browser headers 🛑",
      missingHeaders,
    });
  }

  // 🕵️‍♂️ Known headless/browser automation tools
  const ua = req.headers["user-agent"]?.toLowerCase() || "";
  const headlessIndicators = [
    "headless",
    "puppeteer",
    "phantomjs",
    "postman",
    "insomnia",
    "httpclient",
    "axios",
    "fetch",
    "node-fetch",
    "curl",
    "python-requests",
    "go-http-client",
    "java/",
  ];

  if (headlessIndicators.some((word) => ua.includes(word))) {
    return res.status(403).json({
      error: "Access denied — headless or API tool detected 🤖",
    });
  }

  // 🧠 Optional: detect custom headers often missing from bots
  const isSuspicious =
    !req.headers["origin"] ||
    !req.headers["referer"] ||
    !req.headers["sec-ch-ua-mobile"];

  if (isSuspicious) {
    return res.status(403).json({
      error: "Access denied — suspicious request headers 🔒",
    });
  }

  // ✅ Let legit traffic through
  next();
};
