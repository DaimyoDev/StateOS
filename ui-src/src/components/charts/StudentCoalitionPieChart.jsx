// ui-src/src/components/charts/StudentCoalitionPieChart.jsx
import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "./StudentCoalitionPieChart.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function StudentCoalitionPieChart({ studentCoalitions, themeColors, themeFonts }) {
  const memoizedData = useMemo(() => {
    if (!studentCoalitions || studentCoalitions.size === 0) {
      return null;
    }

    // Convert Map to array and calculate total students
    const coalitionsArray = Array.from(studentCoalitions.values());
    const totalStudents = coalitionsArray.reduce((sum, coalition) => sum + (coalition.studentCount || 0), 0);

    // Generate colors for different coalition types
    const getCoalitionColor = (coalition) => {
      const colorMap = {
        'affluent_academic': themeColors?.['--success-text'] || '#28a745',        // Green for high SES
        'middle_class_strivers': themeColors?.['--accent-color'] || '#17a2b8',    // Teal for middle SES  
        'working_class_practical': themeColors?.['--button-bg'] || '#ffc107',   // Yellow for working class
        'immigrant_aspirational': themeColors?.['--button-action-bg'] || '#6f42c1',    // Purple for immigrants
        'at_risk_disengaged': themeColors?.['--error-text'] || '#dc3545',       // Red for at-risk
        'rural_traditional': themeColors?.['--secondary-text'] || '#fd7e14'         // Orange for rural
      };
      return colorMap[coalition.templateId] || themeColors?.['--border-color'] || '#6c757d'; // Default gray
    };

    return {
      totalStudents,
      chartData: {
        labels: coalitionsArray.map(coalition => coalition.name),
        datasets: [
          {
            label: "Students",
            data: coalitionsArray.map(coalition => coalition.studentCount || 0),
            backgroundColor: coalitionsArray.map(coalition => getCoalitionColor(coalition)),
            borderColor: themeColors?.['--ui-panel-bg'] || "#ffffff",
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverBorderColor: themeColors?.['--accent-color'] || "#007bff",
          },
        ],
      },
    };
  }, [studentCoalitions, themeColors]);

  if (!memoizedData) {
    return <p className="no-chart-data">No student coalition data available.</p>;
  }

  const { totalStudents, chartData } = memoizedData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    plugins: {
      title: {
        display: true,
        text: `Student Demographics (${totalStudents.toLocaleString()} total students)`,
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
        position: "bottom",
        labels: {
          font: {
            family: themeFonts ? themeFonts["--font-main"] : "sans-serif",
            size: 14,
          },
          color: themeColors ? themeColors["--primary-text"] : "#333",
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: themeColors?.['--ui-panel-bg'] || "rgba(255, 255, 255, 0.95)",
        titleColor: themeColors?.['--primary-text'] || "var(--primary-text)",
        bodyColor: themeColors?.['--primary-text'] || "var(--primary-text)",
        borderColor: themeColors?.['--border-color'] || "#dee2e6",
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const coalition = Array.from(studentCoalitions.values())[context.dataIndex];
            const percentage = ((context.parsed / totalStudents) * 100).toFixed(1);
            const studentCount = context.parsed.toLocaleString();
            return [
              `${context.label}: ${studentCount} students (${percentage}%)`,
              `SES: ${coalition.ses?.replace('_', ' ') || 'N/A'}`,
              `Academic Score: ${coalition.currentAcademicScore || 'N/A'}/100`,
              `College Aspiration: ${((coalition.collegeAspiration || 0) * 100).toFixed(0)}%`
            ];
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 1000,
    },
    elements: {
      arc: {
        borderWidth: 2,
      }
    }
  };

  return (
    <div className="student-coalition-pie-chart">
      <div className="chart-container">
        <Pie data={chartData} options={options} />
      </div>
      <div className="chart-summary">
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Total Students</span>
            <span className="summary-value">{totalStudents.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Coalition Groups</span>
            <span className="summary-value">{chartData.labels.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg Academic Score</span>
            <span className="summary-value">
              {Math.round(
                Array.from(studentCoalitions.values()).reduce(
                  (sum, coalition) => sum + (coalition.currentAcademicScore || 0), 
                  0
                ) / studentCoalitions.size
              )}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCoalitionPieChart;