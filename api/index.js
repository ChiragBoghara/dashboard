const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authenticate = require("./middleware/auth");

dotenv.config();

const { signUp, login, logout } = require("./controllers/authController");
const {
  getBarChartData,
  getLineChartData,
} = require("./controllers/chartDataController");

const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
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

app.get("/api/bar-data", authenticate, getBarChartData);
app.get("/api/line-chart-data", authenticate, getLineChartData);

app.post("/api/signup", signUp);
app.post("/api/login", login);
app.post("/api/logout", authenticate, logout);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});
