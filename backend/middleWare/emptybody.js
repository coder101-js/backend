// middlewares/validateToken.js

const validateToken = (req, res, next) => {
  try {
    const { token } = req.body||{};
    console.log(token)
    if (!token) {
      return res.status(400).json({ error: 'Missing token in request body ' });
    }

    // If token exists, move on 🛹
    next();
  } catch (err) {
    console.error('validateToken middleware error:', err);
    res.status(500).json({ error: 'Internal server error ' });
  }
};

export default validateToken;
