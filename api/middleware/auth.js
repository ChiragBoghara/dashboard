const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
    req.user = decoded; // Attach user information to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = authenticate;