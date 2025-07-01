const allowedMethod = (req, res, next) => {
  try {
    // const { token } = req.body||{};
    const method = req.method;
    if (method !== "POST") {
      return res.status(403).send({ error: "Method not allowed!" });
    }
    next();
  } catch (err) {
    cons
  }
};

export default allowedMethod;
