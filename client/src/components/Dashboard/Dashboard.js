import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setCookie, getCookie, deleteCookie } from "../utils/cookieHelpers";
import "./Dashboard.scss";
import { AuthContext } from "../../context/AuthContext";
import { DatePicker, Space, Select } from "antd";
import dayjs from "dayjs";
import { genderItems, rangePresets, ageItems } from "../utils/options";
import axios from "axios";
import { BarChart } from "../Barchart/Barchart";
import LineChart from "../Linechart/Linechart";

const { RangePicker } = DatePicker;
const BASE_URL = "http://localhost:3001";

const Dashboard = () => {
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [age, setAge] = useState(undefined);
  const [gender, setGender] = useState(undefined);
  const [dateRange, setDateRange] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [selectedBar, setSelectedBar] = useState(undefined);

  const onRangeChange = (dates) => {
    if (dates) {
      const formattedStart = dayjs(dates[0]).format("YYYY-MM-DD");
      const formattedEnd = dayjs(dates[1]).format("YYYY-MM-DD");
      setDateRange({ start: formattedStart, end: formattedEnd });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlAge = params.get("age");
    const urlGender = params.get("gender");
    const urlStartDate = params.get("startDate");
    const urlEndDate = params.get("endDate");

    if (urlAge || urlGender || urlStartDate || urlEndDate) {
      setAge(urlAge || undefined);
      setGender(urlGender || undefined);
      setDateRange(
        urlStartDate && urlEndDate
          ? { start: urlStartDate, end: urlEndDate }
          : null
      );
    } else {
      const cookieAge = getCookie("age");
      const cookieGender = getCookie("gender");
      const cookieStartDate = getCookie("startDate");
      const cookieEndDate = getCookie("endDate");

      setAge(cookieAge || undefined);
      setGender(cookieGender || undefined);

      setDateRange(
        cookieStartDate && cookieEndDate
          ? { start: cookieStartDate, end: cookieEndDate }
          : null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (age) params.set("age", age);
    if (gender) params.set("gender", gender);
    if (dateRange) {
      if (dateRange.start) params.set("startDate", dateRange.start);
      if (dateRange.end) params.set("endDate", dateRange.end);
    }

    navigate({ search: params.toString() }, { replace: true });

    if (age) setCookie("age", age, 7);
    if (gender) setCookie("gender", gender, 7);
    if (dateRange) {
      if (dateRange.start) setCookie("startDate", dateRange.start, 7);
      if (dateRange.end) setCookie("endDate", dateRange.end, 7);
    }

    const fetchBarData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/bar-data`, {
          params: {
            age,
            gender,
            startDate: dateRange && dateRange.start,
            endDate: dateRange && dateRange.end,
          },
          withCredentials: true,
        });
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBarData();
  }, [age, gender, dateRange, navigate]);

  const resetPreferences = () => {
    setAge(undefined);
    setGender(undefined);
    setDateRange(null);

    deleteCookie("age");
    deleteCookie("gender");
    deleteCookie("startDate");
    deleteCookie("endDate");
    navigate({ search: "" }, { replace: true });
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/logout",
        {},
        {
          withCredentials: true,
        }
      );
      updateUser(null);
    } catch (error) {
      console.error("Error Logging out :", error);
    }
  };

  const handleBarClick = (clickedBar) => {
    setSelectedBar(clickedBar);
  };

  useEffect(() => {
    const fetchLineChartData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/line-chart-data`, {
          params: {
            feature: selectedBar.toLowerCase(),
            age,
            gender,
            startDate: dateRange && dateRange.start,
            endDate: dateRange && dateRange.end,
          },
          withCredentials: true,
        });
        setLineChartData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (selectedBar) {
      fetchLineChartData();
    }
  }, [selectedBar, age, gender, dateRange]);

  return (
    <main>
      <header>
        <h2>Interactive Data Visualization Dashboard</h2>
      </header>
      <section className="filters">
        <Select
          value={age}
          allowClear
          options={ageItems}
          placeholder="Select Age Range"
          onChange={(value) => setAge(value)}
          size="large"
        />
        <Select
          value={gender}
          allowClear
          options={genderItems}
          placeholder="Select Gender"
          onChange={(value) => setGender(value)}
          size="large"
        />
        <Space direction="vertical" size={12}>
          <RangePicker
            presets={rangePresets}
            onChange={onRangeChange}
            size="large"
            value={
              dateRange
                ? [
                    dayjs(dateRange.start, "YYYY-MM-DD"),
                    dayjs(dateRange.end, "YYYY-MM-DD"),
                  ]
                : null
            }
          />
        </Space>
      </section>
      <section className="data-visualization">
        <button className="reset-filter-button" onClick={resetPreferences}>
          Reset Preferences
        </button>
        <button className="reset-filter-button" onClick={logout}>
          Log out
        </button>
        {!chartData && <p>Fetching data for selected filters...</p>}
        {chartData && (
          <BarChart
            chartData={chartData}
            selectedBar={selectedBar}
            onBarClick={handleBarClick}
          />
        )}
        {lineChartData && <LineChart chartData={lineChartData} />}
      </section>
    </main>
  );
};

export default Dashboard;
