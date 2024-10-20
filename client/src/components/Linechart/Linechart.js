import { Line } from "react-chartjs-2";

const LineChart = ({ chartData }) => {
  const formattedData = {
    labels: chartData.data.map((d) =>
      new Date(d.date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    ),
    datasets: [
      {
        label: `Time Spent on Feature ${chartData.feature}`,
        data: chartData.data.map((d) => d.timeSpent),
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };
  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Line Chart</h2>
      <Line data={formattedData} />
    </div>
  );
};

export default LineChart;
