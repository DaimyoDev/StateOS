// ui-src/src/components/charts/CareerPathwaysChart.jsx
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./CareerPathwaysChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CareerPathwaysChart({ studentCoalitions, themeColors, themeFonts }) {
  const memoizedData = useMemo(() => {
    if (!studentCoalitions || studentCoalitions.size === 0) {
      return null;
    }

    const coalitionsArray = Array.from(studentCoalitions.values());

    // Calculate career pathway percentages for each coalition
    const chartData = {
      labels: coalitionsArray.map(coalition => coalition.name),
      datasets: [
        {
          label: "College Bound",
          data: coalitionsArray.map(coalition => 
            Math.round((coalition.collegeAspiration || 0) * 100)
          ),
          backgroundColor: themeColors?.['--success-text'] || '#28a745',
          borderColor: themeColors?.['--success-text'] || '#1e7e34',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: "Trade School",
          data: coalitionsArray.map(coalition => 
            Math.round((coalition.tradeInterest || 0) * 100)
          ),
          backgroundColor: themeColors?.['--accent-color'] || '#17a2b8',
          borderColor: themeColors?.['--accent-border-color'] || '#117a8b',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: "Direct Employment",
          data: coalitionsArray.map(coalition => {
            const college = coalition.collegeAspiration || 0;
            const trade = coalition.tradeInterest || 0;
            const employment = Math.max(0, 1 - college - trade - (coalition.dropoutRisk || 0));
            return Math.round(employment * 100);
          }),
          backgroundColor: themeColors?.['--button-bg'] || '#ffc107',
          borderColor: themeColors?.['--border-color'] || '#d39e00',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: "At Risk of Dropout",
          data: coalitionsArray.map(coalition => 
            Math.round((coalition.dropoutRisk || 0) * 100)
          ),
          backgroundColor: themeColors?.['--error-text'] || '#dc3545',
          borderColor: themeColors?.['--error-text'] || '#c82333',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    // Calculate district-wide totals
    const totalStudents = coalitionsArray.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const districtTotals = {
      college: Math.round(coalitionsArray.reduce((sum, c) => 
        sum + ((c.collegeAspiration || 0) * (c.studentCount || 0)), 0) / totalStudents * 100),
      trade: Math.round(coalitionsArray.reduce((sum, c) => 
        sum + ((c.tradeInterest || 0) * (c.studentCount || 0)), 0) / totalStudents * 100),
      employment: 0, // Will be calculated below
      dropout: Math.round(coalitionsArray.reduce((sum, c) => 
        sum + ((c.dropoutRisk || 0) * (c.studentCount || 0)), 0) / totalStudents * 100),
    };
    districtTotals.employment = Math.max(0, 100 - districtTotals.college - districtTotals.trade - districtTotals.dropout);

    return { chartData, districtTotals, totalStudents };
  }, [studentCoalitions]);

  if (!memoizedData) {
    return <p className="no-chart-data">No career pathway data available.</p>;
  }

  const { chartData, districtTotals, totalStudents } = memoizedData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    plugins: {
      title: {
        display: true,
        text: "Career Pathways by Student Demographics",
        font: {
          family: themeFonts ? themeFonts["--font-heading"] : "sans-serif",
          size: 20,
          weight: 'bold',
        },
        color: themeColors ? themeColors["--primary-text"] : "#333",
        padding: {
          top: 15,
          bottom: 25,
        },
      },
      legend: {
        position: "top",
        labels: {
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 14,
          },
          color: themeColors?.["--primary-text"] || "var(--primary-text)",
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      tooltip: {
        backgroundColor: themeColors?.['--ui-panel-bg'] || "rgba(255, 255, 255, 0.95)",
        titleColor: themeColors ? themeColors["--primary-text"] : "#333",
        bodyColor: themeColors ? themeColors["--primary-text"] : "#333",
        borderColor: themeColors?.['--border-color'] || "#dee2e6",
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
          afterLabel: function(context) {
            const coalitionIndex = context.dataIndex;
            const coalition = Array.from(studentCoalitions.values())[coalitionIndex];
            const pathwayStudents = Math.round(
              (context.parsed.y / 100) * (coalition.studentCount || 0)
            );
            return `≈ ${pathwayStudents.toLocaleString()} students`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Student Demographics",
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 14,
          },
          color: themeColors?.["--primary-text"] || "var(--primary-text)",
        },
        ticks: {
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 12,
          },
          color: themeColors ? themeColors["--secondary-text"] : "#666",
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: themeColors?.['--border-color'] || "var(--border-color, rgba(128, 128, 128, 0.2))",
        },
      },
      y: {
        title: {
          display: true,
          text: "Percentage of Students",
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 14,
          },
          color: themeColors?.["--primary-text"] || "var(--primary-text)",
        },
        min: 0,
        max: 100,
        stacked: false, // Set to true if you want stacked bars
        ticks: {
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 13,
          },
          color: themeColors ? themeColors["--secondary-text"] : "#666",
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: themeColors?.['--border-color'] || "var(--border-color, rgba(128, 128, 128, 0.2))",
        },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="career-pathways-chart">
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
      <div className="pathways-summary">
        <div className="district-overview">
          <h6>District-Wide Career Outlook</h6>
          <div className="district-pathways">
            <div className="pathway-stat college">
              <span className="pathway-percentage">{districtTotals.college}%</span>
              <span className="pathway-label">College Bound</span>
              <span className="pathway-count">≈ {Math.round(totalStudents * districtTotals.college / 100).toLocaleString()} students</span>
            </div>
            <div className="pathway-stat trade">
              <span className="pathway-percentage">{districtTotals.trade}%</span>
              <span className="pathway-label">Trade School</span>
              <span className="pathway-count">≈ {Math.round(totalStudents * districtTotals.trade / 100).toLocaleString()} students</span>
            </div>
            <div className="pathway-stat employment">
              <span className="pathway-percentage">{districtTotals.employment}%</span>
              <span className="pathway-label">Direct Employment</span>
              <span className="pathway-count">≈ {Math.round(totalStudents * districtTotals.employment / 100).toLocaleString()} students</span>
            </div>
            <div className="pathway-stat dropout">
              <span className="pathway-percentage">{districtTotals.dropout}%</span>
              <span className="pathway-label">At Risk</span>
              <span className="pathway-count">≈ {Math.round(totalStudents * districtTotals.dropout / 100).toLocaleString()} students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerPathwaysChart;