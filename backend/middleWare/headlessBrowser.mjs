export const blockHeadlessBrowser = (req, res, next) => {
  const requiredHeaders = [
    "user-agent",
    "accept",
    "accept-language",
    "sec-fetch-site",
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !req.headers[header]
  );

  const ua = req.headers["user-agent"]?.toLowerCase() || "";
  const headlessIndicators = [
    "headless",
    "puppeteer",
    "phantomjs",
    "postman",
    "curl",
    "axios",
    "fetch",
    "node-fetch",
    "python-requests",
  ];

  const isHeadless = headlessIndicators.some((word) => ua.includes(word));
  const tooFewHeaders = missingHeaders.length >= 2;

  if (isHeadless || tooFewHeaders) {
    return res.status(403).json({
      error: "Access denied — looks like a bot 🤖",
      missingHeaders,
    });
  }

  next();
};
