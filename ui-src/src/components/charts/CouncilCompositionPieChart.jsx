// ui-src/src/components/charts/CouncilCompositionPieChart.jsx (new file)
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title); // Register datalabels plugin

function CouncilCompositionPieChart({
  councilCompositionData,
  themeColors,
  themeFonts,
}) {
  if (!councilCompositionData || councilCompositionData.length === 0) {
    return <p>No council composition data available.</p>;
  }

  // The 'councilCompositionData' prop is expected to be an array of objects like:
  // { id: "party_id", name: "Party Name", popularity: seatCount, color: "#RRGGBB" }
  // where 'popularity' will represent the number of seats for this chart.

  const totalSeats = councilCompositionData.reduce(
    (sum, party) => sum + party.popularity,
    0
  );

  const data = {
    labels: councilCompositionData.map((party) => party.name),
    datasets: [
      {
        label: "Seats", // Changed label
        data: councilCompositionData.map((party) => party.popularity), // This is the seatCount
        backgroundColor: councilCompositionData.map(
          (party) => party.color || "#CCCCCC"
        ),
        borderColor: themeColors ? themeColors["--ui-panel-bg"] : "#FFFFFF",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right", // Changed position for potentially more labels
        labels: {
          color: themeColors ? themeColors["--primary-text"] : "#333333",
          font: {
            family: themeFonts
              ? themeFonts["--font-main"]
              : "Arial, sans-serif",
            size: 12, // Slightly smaller for potentially more parties
          },
          boxWidth: 20,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: `Council Composition (${totalSeats} Total Seats)`, // Updated title
        color: themeColors ? themeColors["--accent-color"] : "#000000",
        font: {
          family: themeFonts
            ? themeFonts["--font-heading"]
            : "Arial, sans-serif",
          size: 16, // Adjusted title size
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || ""; // Party name
            if (label) {
              label += ": ";
            }
            const value = context.parsed;
            if (value !== null) {
              const percentage =
                totalSeats > 0 ? ((value / totalSeats) * 100).toFixed(1) : 0;
              label += `${value} seat${
                value !== 1 ? "s" : ""
              } (${percentage}%)`;
            }
            return label;
          },
        },
      },
      datalabels: {
        // Optional: Display data directly on chart segments
        display: (context) => {
          // Display only if segment is large enough
          const value = context.dataset.data[context.dataIndex];
          return totalSeats > 0 && (value / totalSeats) * 100 > 5; // e.g., only for segments > 5%
        },
        formatter: (value) => {
          const percentage =
            totalSeats > 0 ? ((value / totalSeats) * 100).toFixed(0) : 0;
          return `${percentage}%`;
        },
        color: (context) => {
          // Choose a contrasting color for the label based on segment color
          const bgColor = context.dataset.backgroundColor[context.dataIndex];
          // Simple check for light/dark, can be more sophisticated
          const r = parseInt(bgColor.slice(1, 3), 16);
          const g = parseInt(bgColor.slice(3, 5), 16);
          const b = parseInt(bgColor.slice(5, 7), 16);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance > 0.5 ? "#333" : "#fff";
        },
        font: {
          weight: "bold",
          size: 10,
        },
        anchor: "end",
        align: "start",
        offset: -10, // Adjust offset to position inside/outside
        borderRadius: 4,
        backgroundColor: (context) => {
          // Slight background for readability
          const bgColor = context.dataset.backgroundColor[context.dataIndex];
          return bgColor ? `${bgColor}AA` : null; // Add some transparency
        },
        padding: 2,
      },
    },
  };

  return (
    <div
      className="pie-chart-container council-composition-pie-chart" // Added specific class
      style={{
        position: "relative",
        minHeight: "300px",
        width: "100%",
        maxHeight: "400px",
      }} // Adjusted height
    >
      <Pie data={data} options={options} />
    </div>
  );
}

export default CouncilCompositionPieChart;
