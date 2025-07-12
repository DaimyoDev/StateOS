export const formatBudgetKey = (key) => {
  if (typeof key !== "string") return "Invalid Key";
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

export const formatPercentage = (value, precision = 1) => {
  if (value == null || isNaN(value)) return "N/A";
  // Ensure value is treated as a number before toFixed
  const numValue = Number(value);
  if (isNaN(numValue)) return "N/A";
  return `${numValue.toFixed(precision)}%`;
};
