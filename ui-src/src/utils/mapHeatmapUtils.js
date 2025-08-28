import { parseColor } from "./core.js";

/**
 * Calculates heatmap min/max values from heatmap data
 * @param {Array|Object} heatmapData - Array of objects with numeric `value` properties, or
 *   an object for special views (e.g., congressional districts) where range is not needed.
 * @param {string} viewType - The view type (e.g., "party_popularity", "congressional_districts")
 * @returns {Object} Object with min and max values
 */
export const calculateHeatmapRange = (heatmapData, viewType) => {
  // For categorical or district views, or when data is missing/non-array, use a safe default
  if (
    !heatmapData ||
    viewType === "party_popularity" ||
    viewType === "congressional_districts" ||
    !Array.isArray(heatmapData)
  ) {
    return { min: 0, max: 1 };
  }

  const values = heatmapData
    .map((d) => d.value)
    .filter((v) => typeof v === "number");

  if (values.length === 0) return { min: 0, max: 1 };

  return { min: Math.min(...values), max: Math.max(...values) };
};

/**
 * Gets the fill color for a region based on heatmap data and theme
 * @param {string} regionId - The game ID of the region
 * @param {Array} heatmapData - Array of heatmap data objects
 * @param {string} viewType - The view type
 * @param {Object} colorRange - Object with min, max, startColor, endColor
 * @param {string} defaultColor - Default color when no data
 * @returns {string} The calculated fill color
 */
export const getHeatmapFillColor = (regionId, heatmapData, viewType, colorRange, defaultColor) => {
  const data = heatmapData?.find((d) => d.id === regionId);
  
  if (!data) return defaultColor;
  
  if (viewType === "party_popularity") {
    return data.color || defaultColor;
  }
  
  if (typeof data.value === "number") {
    const { min, max, startColor, endColor } = colorRange;
    const ratio = max > min ? (data.value - min) / (max - min) : 0;
    
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  return defaultColor;
};

/**
 * Creates a standardized region style object for maps
 * @param {Object} params - Parameters object
 * @param {string} params.regionId - The game ID of the region
 * @param {string} params.svgId - The SVG element ID
 * @param {Object} params.regionData - Mapping object for SVG ID to game data
 * @param {Array} params.heatmapData - Heatmap data array
 * @param {string} params.viewType - View type string
 * @param {Object} params.theme - Theme colors object
 * @param {string} params.hoveredId - Currently hovered region ID
 * @param {string} params.selectedId - Currently selected region ID
 * @param {boolean} params.isClickable - Whether the region is clickable
 * @returns {Object} Style object for the region
 */
export const getRegionStyle = ({
  regionId,
  svgId,
  regionData,
  heatmapData,
  viewType,
  theme,
  hoveredId,
  selectedId,
  isClickable = false
}) => {
  const regionInfo = regionData[svgId];
  if (!regionInfo) return {};

  const {
    landColor = "#cccccc",
    borderColor = "#ffffff", 
    hoverColor = "#FFD700",
    selectedColor = "yellow",
    actionColor = "#e74c3c"
  } = theme;

  const style = {
    stroke: borderColor,
    strokeWidth: "1px",
    fill: landColor,
    cursor: isClickable ? "pointer" : "default",
    transition: "fill 0.2s ease-in-out, stroke 0.2s ease-in-out",
  };

  const isSelected = selectedId === regionInfo.gameId;
  const isHovered = hoveredId === regionInfo.gameId;

  if (isHovered) {
    style.fill = hoverColor;
  } else if (isSelected) {
    style.fill = selectedColor;
    style.stroke = selectedColor;
    style.strokeWidth = "3px";
  } else {
    // Apply heatmap coloring
    const startColor = parseColor(landColor);
    const endColor = parseColor(actionColor);
    const { min, max } = calculateHeatmapRange(heatmapData, viewType);
    
    const colorRange = { min, max, startColor, endColor };
    style.fill = getHeatmapFillColor(
      regionInfo.gameId, 
      heatmapData, 
      viewType, 
      colorRange, 
      landColor
    );
  }

  return style;
};

/**
 * Creates theme colors object from game store theme
 * @param {Object} currentTheme - Theme object from game store
 * @returns {Object} Standardized theme colors for maps
 */
export const getMapThemeColors = (currentTheme) => {
  const mapTheme = currentTheme?.colors || {};
  
  return {
    landColor: mapTheme["--map-region-default-fill"] || "#cccccc",
    borderColor: mapTheme["--map-region-border"] || "#ffffff",
    hoverColor: mapTheme["--map-region-hover-fill"] || "#FFD700",
    selectedColor: mapTheme["--accent-color"] || "yellow",
    actionColor: mapTheme["--button-action-bg"] || "#e74c3c"
  };
};
