const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

exports.signUp = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    // Check if user already exists
    const userExists = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the new user in the database
    await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);

    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    // Find user by username
    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set token in cookie (HttpOnly cookie for security)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      path: "/",
    });

    return res.status(200).json({ message: "Login successful." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    path: "/",
  });
  return res.status(200).json({ message: "Logged out successfully." });
};
