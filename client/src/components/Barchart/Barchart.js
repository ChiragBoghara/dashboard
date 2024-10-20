import Chart from "chart.js/auto";
import { CategoryScale, LinearScale } from "chart.js";
import { Bar, getElementsAtEvent } from "react-chartjs-2";
import "./Barchart.scss";
import { useRef } from "react";

Chart.register(CategoryScale, CategoryScale, LinearScale);

export const BarChart = ({ chartData, selectedBar, onBarClick }) => {

  const formattedData = {
    labels: Object.keys(chartData),
    datasets: [
      {
        axis: "y",
        label: "Total time spent (minutes)",
        data: Object.values(chartData),
        fill: false,
        backgroundColor: [
          selectedBar === 'A' ? "rgba(192,75,75,1)" : "rgba(75,192,192,1)", 
          selectedBar === 'B' ? "rgba(192,75,75,1)" : "rgba(75,192,192,1)",
          selectedBar === 'C' ? "rgba(192,75,75,1)" : "rgba(75,192,192,1)",
          selectedBar === 'D' ? "rgba(192,75,75,1)" : "rgba(75,192,192,1)",
          selectedBar === 'E' ? "rgba(192,75,75,1)" : "rgba(75,192,192,1)",
          selectedBar === 'F' ? "rgba(192,75,75,1)" : "rgba(75,192,192,1)",
        ],
      },
    ],
  };
  const barChartRef = useRef();

  const handleBarClick = (e) => {
    if (getElementsAtEvent(barChartRef.current, e).length > 0) {
      const dataPoint = getElementsAtEvent(barChartRef.current, e)[0].index;
      onBarClick(Object.keys(chartData)[dataPoint]);
    }
  };

  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Feature wise usage</h2>
      <Bar
        ref={barChartRef}
        onClick={handleBarClick}
        data={formattedData}
        options={{
          indexAxis: "y",
          scales: {
            x: {
              title: {
                display: true,
                text: "Total time spent (minutes)",
                padding: {
                  top: 12,
                },
              },
            },
            y: {
              title: {
                display: true,
                text: "Features",
                padding: {
                  bottom: 12,
                },
              },
            },
          },
        }}
      />
    </div>
  );
};
