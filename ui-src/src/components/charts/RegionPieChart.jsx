import React from "react"; // Removed useMemo as we are not creating wrapperStyle here
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "./RegionPieChart.css"; // Import the CSS file

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function RegionPieChart({ politicalLandscape, themeColors, themeFonts }) {
  if (!politicalLandscape || politicalLandscape.length === 0) {
    // Try to use theme color for the message if available
    const messageStyle = {
      color: themeColors ? themeColors["--primary-text"] : "#333",
      fontFamily: themeFonts ? themeFonts["--font-main"] : "sans-serif",
      textAlign: "center",
      padding: "20px",
    };
    return (
      <p style={messageStyle}>No political data available for this region.</p>
    );
  }

  // Data preparation logic (chartLabels, chartDataPoints, chartBackgroundColors, normalization)
  const chartLabels = politicalLandscape.map((party) => party.name);
  let chartDataPoints = politicalLandscape.map((party) => party.popularity);
  const chartBackgroundColors = politicalLandscape.map(
    (party) => party.color || "#CCCCCC"
  );

  // Normalize sum (as in your last provided code)
  if (chartDataPoints.length > 0) {
    let currentSum = chartDataPoints.reduce((acc, val) => acc + val, 0);
    currentSum = parseFloat(currentSum.toFixed(1));
    if (Math.abs(100 - currentSum) > 0.01) {
      let diff = parseFloat((100 - currentSum).toFixed(1));
      let adjustIndex = 0;
      for (let i = 1; i < chartDataPoints.length; i++) {
        if (chartDataPoints[i] > chartDataPoints[adjustIndex]) adjustIndex = i;
      }
      let adjustedVal = parseFloat(
        (chartDataPoints[adjustIndex] + diff).toFixed(1)
      );
      if (adjustedVal >= 0) chartDataPoints[adjustIndex] = adjustedVal;
      else {
        chartDataPoints[adjustIndex] = 0;
        console.warn(
          "RegionPieChart: Normalization issue, largest slice capped at 0."
        );
        currentSum = chartDataPoints.reduce((acc, val) => acc + val, 0);
        diff = parseFloat((100 - currentSum).toFixed(1));
        if (Math.abs(diff) > 0.01 && chartDataPoints[0] !== undefined) {
          chartDataPoints[0] = parseFloat(
            (chartDataPoints[0] + diff).toFixed(1)
          );
          if (chartDataPoints[0] < 0) chartDataPoints[0] = 0;
        }
      }
    }
    chartDataPoints = chartDataPoints.map((p) =>
      Math.max(0, parseFloat(p.toFixed(1)))
    );
    currentSum = chartDataPoints.reduce((acc, val) => acc + val, 0);
    if (Math.abs(100 - currentSum) > 0.01 && chartDataPoints.length > 0) {
      let finalDiff = 100 - currentSum;
      let largestIdx = 0;
      for (let i = 1; i < chartDataPoints.length; i++) {
        if (chartDataPoints[i] > chartDataPoints[largestIdx]) largestIdx = i;
      }
      chartDataPoints[largestIdx] = parseFloat(
        (chartDataPoints[largestIdx] + finalDiff).toFixed(1)
      );
      if (chartDataPoints[largestIdx] < 0) chartDataPoints[largestIdx] = 0;
    }
  }

  const chartRenderData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Party Popularity %",
        data: chartDataPoints,
        backgroundColor: chartBackgroundColors,
        borderColor: themeColors ? themeColors["--primary-bg"] : "#FFFFFF", // Use a contrasting background from theme
        borderWidth: 1.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Default Chart.js legend is disabled
      },
      tooltip: {
        // Tooltip theming can also use direct props if needed
        bodyFont: {
          family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
        },
        titleFont: {
          family: themeFonts ? themeFonts["--font-heading"] : "sans-serif",
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed.toFixed(1) + "%";
            }
            return label;
          },
        },
      },
    },
  };

  // No wrapperStyle object needed if CSS variables are set globally by your theme system

  return (
    // The class 'chart-and-legend-wrapper' will be styled by RegionPieChart.css,
    // which will attempt to use CSS variables (--primary-bg, --border-color, etc.)
    // that your theme system is assumed to be setting on a higher level (e.g., :root or body).
    <div className="chart-and-legend-wrapper">
      <div className="pie-chart-render-area">
        {chartDataPoints.length > 0 && chartDataPoints.some((p) => p > 0) ? (
          <Pie data={chartRenderData} options={chartOptions} />
        ) : (
          // If CSS var --primary-text is globally available:
          <p className="chart-no-data-message">
            No party data with significant popularity to display.
          </p>
        )}
      </div>

      {politicalLandscape.length > 0 && (
        <div className="custom-legend-container">
          {politicalLandscape
            .sort((a, b) => b.popularity - a.popularity)
            .map((party, index) => (
              <div
                key={party.id || `legend-${index}`}
                className="legend-item"
                title={`${party.name}: ${party.popularity.toFixed(1)}%`}
              >
                <span
                  className="legend-color-box"
                  style={{ backgroundColor: party.color || "#CCCCCC" }} // Party color is dynamic, so inline style here is fine
                ></span>
                <span className="legend-text">
                  {party.name} ({party.popularity.toFixed(1)}%)
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default RegionPieChart;
