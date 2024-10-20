const formatDataForBarChart = (chartData) => {
  return {
    labels: Object.keys(chartData),
    datasets: [
      {
        axis: "y",
        label: "Total time spent (minutes)",
        data: Object.values(chartData),
        fill: false,
        backgroundColor: [
          "rgba(75,192,192,1)",
          "#50AF95",
          "#f3ba2f",
          "#2a71d0"
        ],
      },
    ],
  };
};

export default formatDataForBarChart;
