const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authenticate = require("./middleware/auth");

dotenv.config();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Allow requests from http://localhost:3000
const corsOptions = {
  origin: "http://localhost:3000", // You can also use '*' for any origin, but it's more secure to specify allowed origins.
  methods: ["GET", "POST"], // Allow specific methods
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.get("/api/bar-data", authenticate, async (req, res) => {
  try {
    const { age, gender, startDate, endDate } = req.query;

    let query = `
      SELECT
        SUM("a") AS feature_A,
        SUM("b") AS feature_B,
        SUM("c") AS feature_C,
        SUM("d") AS feature_D,
        SUM("e") AS feature_E,
        SUM("f") AS feature_F
      FROM "analytics"
      WHERE 1=1
    `;
    const queryParams = [];
    if (age) {
      query += ` AND "age" = $${queryParams.length + 1}`;
      queryParams.push(age);
    }
    if (gender) {
      query += ` AND "gender" = $${queryParams.length + 1}`;
      const formattedGender = gender[0].toUpperCase() + gender.slice(1);
      queryParams.push(formattedGender);
    }
    if (startDate && endDate) {
      query += ` AND "day" BETWEEN $${queryParams.length + 1} AND $${
        queryParams.length + 2
      }`;
      queryParams.push(startDate, endDate);
    }

    const { rows } = await db.query(query, queryParams);
    const barData = {
      A: rows[0].feature_a ?? 0,
      B: rows[0].feature_b ?? 0,
      C: rows[0].feature_c ?? 0,
      D: rows[0].feature_d ?? 0,
      E: rows[0].feature_e ?? 0,
      F: rows[0].feature_f ?? 0,
    };

    return res.json(barData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// API to fetch line chart data based on feature with optional filters
app.get("/api/line-chart-data", authenticate, async (req, res) => {
  try {
    const { feature, age, gender, startDate, endDate } = req.query;

    if (!feature) {
      return res
        .status(400)
        .json({ error: "Missing required 'feature' query parameter" });
    }

    // Build the base SQL query
    let query = `
      SELECT day AS date, SUM("${feature.toLowerCase()}") AS timeSpent
      FROM analytics
      WHERE 1=1
    `;

    // Append age filter if provided
    if (age) {
      query += ` AND "age" = '${age}' `;
    }

    // Append gender filter if provided
    if (gender) {
      const formattedGender = gender[0].toUpperCase() + gender.slice(1);
      query += ` AND "gender" = '${formattedGender}' `;
    }

    // Append date range filter if provided
    if (startDate && endDate) {
      query += ` AND "day" BETWEEN '${startDate}' AND '${endDate}' `;
    } else if (startDate) {
      query += ` AND "day" >= '${startDate}' `;
    } else if (endDate) {
      query += ` AND "day" <= '${endDate}' `;
    }

    query += `GROUP BY "day" ORDER BY "day" ASC;`;

    // Execute the query
    const { rows } = await db.query(query);

    // Check if data is found
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the given parameters" });
    }

    // Send the result back as a structured response
    res.json({
      feature,
      data: rows.map((row) => ({
        date: row.date,
        timeSpent: parseInt(row.timespent, 10),
      })),
    });
  } catch (err) {
    console.error("Error fetching line chart data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/signup", async (req, res) => {
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
});

app.post("/api/login", async (req, res) => {
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
      path: '/',
    });

    return res.status(200).json({ message: "Login successful." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token",{
    httpOnly: true,
    secure: false,
    path: '/'
  });
  return res.status(200).json({ message: "Logged out successfully." });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});
