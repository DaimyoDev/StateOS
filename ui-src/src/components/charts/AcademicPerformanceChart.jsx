// ui-src/src/components/charts/AcademicPerformanceChart.jsx
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
import "./AcademicPerformanceChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AcademicPerformanceChart({ studentCoalitions, themeColors, themeFonts }) {
  const memoizedData = useMemo(() => {
    if (!studentCoalitions || studentCoalitions.size === 0) {
      return null;
    }

    const coalitionsArray = Array.from(studentCoalitions.values());
    
    // Sort by academic score for better visualization
    coalitionsArray.sort((a, b) => (b.currentAcademicScore || 0) - (a.currentAcademicScore || 0));

    // Generate colors based on performance level
    const getPerformanceColor = (score) => {
      if (score >= 85) return themeColors?.['--success-text'] || '#28a745'; // Green for high performance
      if (score >= 70) return themeColors?.['--accent-color'] || '#17a2b8'; // Teal for good performance
      if (score >= 60) return themeColors?.['--button-bg'] || '#ffc107'; // Yellow for average performance
      if (score >= 50) return themeColors?.['--secondary-text'] || '#fd7e14'; // Orange for below average
      return themeColors?.['--error-text'] || '#dc3545'; // Red for poor performance
    };

    return {
      chartData: {
        labels: coalitionsArray.map(coalition => coalition.name),
        datasets: [
          {
            label: "Academic Score",
            data: coalitionsArray.map(coalition => coalition.currentAcademicScore || 0),
            backgroundColor: coalitionsArray.map(coalition => getPerformanceColor(coalition.currentAcademicScore || 0)),
            borderColor: coalitionsArray.map(coalition => getPerformanceColor(coalition.currentAcademicScore || 0)),
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      coalitionsArray,
    };
  }, [studentCoalitions]);

  if (!memoizedData) {
    return <p className="no-chart-data">No academic performance data available.</p>;
  }

  const { chartData, coalitionsArray } = memoizedData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    plugins: {
      title: {
        display: true,
        text: "Academic Performance by Student Demographics",
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
        display: false, // Hide legend since colors are meaningful
      },
      tooltip: {
        backgroundColor: themeColors?.['--ui-panel-bg'] || "rgba(255, 255, 255, 0.95)",
        titleColor: themeColors?.['--primary-text'] || "var(--primary-text)",
        bodyColor: themeColors?.['--primary-text'] || "var(--primary-text)",
        borderColor: themeColors?.['--border-color'] || "#dee2e6",
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            const coalition = coalitionsArray[context.dataIndex];
            return [
              `Academic Score: ${context.parsed.y}/100`,
              `Students: ${coalition.studentCount?.toLocaleString() || 'N/A'}`,
              `SES: ${coalition.ses?.replace('_', ' ') || 'N/A'}`,
              `College Aspiration: ${((coalition.collegeAspiration || 0) * 100).toFixed(0)}%`,
              `Dropout Risk: ${((coalition.dropoutRisk || 0) * 100).toFixed(1)}%`
            ];
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
          color: themeColors ? themeColors["--primary-text"] : "#333",
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
          text: "Academic Score",
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 14,
          },
          color: themeColors ? themeColors["--primary-text"] : "#333",
        },
        min: 0,
        max: 100,
        ticks: {
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 13,
          },
          color: themeColors ? themeColors["--secondary-text"] : "#666",
          callback: function(value) {
            return value + '/100';
          }
        },
        grid: {
          color: themeColors?.['--border-color'] || "var(--border-color, rgba(128, 128, 128, 0.2))",
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Calculate performance statistics
  const avgScore = Math.round(
    coalitionsArray.reduce((sum, coalition) => sum + (coalition.currentAcademicScore || 0), 0) / coalitionsArray.length
  );
  const highPerformers = coalitionsArray.filter(c => (c.currentAcademicScore || 0) >= 80).length;
  const atRiskGroups = coalitionsArray.filter(c => (c.currentAcademicScore || 0) < 60).length;

  return (
    <div className="academic-performance-chart">
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
      <div className="performance-summary">
        <div className="performance-stats">
          <div className="performance-item">
            <span className="performance-label">District Average</span>
            <span className="performance-value">{avgScore}/100</span>
          </div>
          <div className="performance-item">
            <span className="performance-label">High Performing Groups</span>
            <span className="performance-value">{highPerformers}/{coalitionsArray.length}</span>
          </div>
          <div className="performance-item">
            <span className="performance-label">At-Risk Groups</span>
            <span className="performance-value risk">{atRiskGroups}/{coalitionsArray.length}</span>
          </div>
        </div>
        <div className="performance-legend">
          <div className="legend-item">
            <span className="legend-color excellent"></span>
            <span className="legend-text">Excellent (85-100)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color good"></span>
            <span className="legend-text">Good (70-84)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color average"></span>
            <span className="legend-text">Average (60-69)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color below-average"></span>
            <span className="legend-text">Below Average (50-59)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color poor"></span>
            <span className="legend-text">Needs Improvement (&lt;50)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicPerformanceChart;