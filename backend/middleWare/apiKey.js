export const apiKey = (req, res, next) => {
  try {
    const apiKeyHeader = req.get("x-api-key");
    
    if (!apiKeyHeader) {
      return res.status(403).send({ err: "API key not found 🔒" });
    }

    const apiKey = process.env.API_KEY;

    if (apiKey === apiKeyHeader) {
      return next(); // ✅ Let the request through
    } else {
      return res.status(403).send({ err: "Invalid API key 🚫" });
    }

  } catch (err) {
    console.error("❌ Middleware Error:", err.message);
    return res.status(500).send({ err: "Internal Server Error" });
  }
};
//made but not used