const db = require("../db");

exports.getBarChartData = async (req, res) => {
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
};

exports.getLineChartData = async (req, res) => {
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
};
