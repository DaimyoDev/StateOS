// District styling utilities for congressional district maps
import { calculateCongressionalDistricts, getCongressionalDistrictCount, generateDistrictColors } from "./congressionalDistricts";
import { usaCounties } from "../data/states/adminRegions2/usaCounties";

// Create a mapping from gameId to county name for all USA counties
const COUNTY_NAME_MAP = usaCounties.reduce((acc, county) => {
  acc[county.id] = county.name;
  return acc;
}, {});

/**
 * Gets the fill color for a county based on district assignment
 * @param {string} countyId - The game ID of the county
 * @param {Array} districtData - Array of district objects with county assignments
 * @param {Array} districtColors - Array of colors for each district
 * @param {string} selectedDistrictId - Currently selected district ID (null for all)
 * @param {string} defaultColor - Default color when no district assignment
 * @returns {string} The calculated fill color
 */
export const getDistrictFillColor = (countyId, districtData, districtColors, selectedDistrictId, defaultColor) => {
  if (!districtData || districtData.length === 0) {
    return defaultColor;
  }

  // Convert gameId to county name for matching with district data
  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) {
    return defaultColor;
  }

  for (let i = 0; i < districtData.length; i++) {
    const district = districtData[i];
    const foundCounty = district.counties.find(c => (c.id || c.name) === countyName);
    if (foundCounty) {
      if (selectedDistrictId !== null) {
        return district.id === selectedDistrictId ? districtColors[i] : '#f0f0f0';
      }
      return districtColors[i] || defaultColor;
    }
  }

  return defaultColor;
};

// Cache for district calculations to prevent duplicate generation
let districtCache = new Map();

/**
 * Creates district styling data for a state's counties
 * @param {Object} state - State object with population data
 * @param {Array} counties - Array of county objects
 * @param {number|null} selectedDistrictId - Currently selected district ID
 * @param {Object} countyPathData - Optional SVG path data for adjacency calculation
 * @returns {Object} Object with districtData, districtColors, and mapData
 */
export const createDistrictMapData = (state, counties, selectedDistrictId, countyPathData) => {
  if (!state || !counties || counties.length === 0) {
    return { districtData: [], districtColors: [], mapData: [] };
  }

  const numDistricts = getCongressionalDistrictCount(state.id);
  const totalPopulation = state.population || counties.reduce((sum, c) => sum + (c.population || 0), 0);
  
  // Create cache key based on state and county data
  const cacheKey = `${state.id}_${totalPopulation}_${numDistricts}_${counties.length}`;
  
  // Check if we already have calculated districts for this state
  let districtData;
  if (districtCache.has(cacheKey)) {
    districtData = districtCache.get(cacheKey);
  } else {
    districtData = calculateCongressionalDistricts(counties, totalPopulation, numDistricts, countyPathData);
    districtCache.set(cacheKey, districtData);
  }
  
  const districtColors = generateDistrictColors(numDistricts);
  
  // Create map data for each county
  const mapData = counties.map(county => {
    const color = getDistrictFillColor(county.id, districtData, districtColors, selectedDistrictId, '#cccccc');
    const label = getDistrictLabel(county.id, districtData);
    const districtId = getCountyDistrictId(county.id, districtData);
    
    
    return {
      id: county.id,
      color: color,
      value: label,
      districtId: districtId
    };
  });

  return { districtData, districtColors, mapData };
};

/**
 * Gets the district label for a county
 * @param {string} countyId - County ID
 * @param {Array} districtData - District data array
 * @returns {string} District label
 */
const getDistrictLabel = (countyId, districtData) => {
  // Convert gameId to county name for matching with district data
  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) {
    return 'No District';
  }

  for (const district of districtData) {
    const foundCounty = district.counties.find(c => (c.id || c.name) === countyName);
    if (foundCounty) {
      return `District ${district.id}`;
    }
  }
  return 'No District';
};

/**
 * Gets the primary district ID for a county
 * @param {string} countyId - County ID
 * @param {Array} districtData - District data array
 * @returns {number|null} Primary district ID
 */
const getCountyDistrictId = (countyId, districtData) => {
  // Convert gameId to county name for matching with district data
  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) {
    return null;
  }

  for (const district of districtData) {
    const foundCounty = district.counties.find(c => (c.id || c.name) === countyName);
    if (foundCounty) {
      return district.id;
    }
  }
  return null;
};

/**
 * Creates a standardized region style object for district maps
 * @param {Object} params - Parameters object
 * @param {string} params.countyId - The game ID of the county
 * @param {string} params.svgId - The SVG element ID
 * @param {Object} params.countyData - Mapping object for SVG ID to game data
 * @param {Array} params.districtData - District data array
 * @param {Array} params.districtColors - District colors array
 * @param {string} params.selectedDistrictId - Currently selected district ID
 * @param {Object} params.theme - Theme colors object
 * @param {string} params.hoveredId - Currently hovered county ID
 * @param {boolean} params.isClickable - Whether the county is clickable
 * @returns {Object} Style object for the county
 */
export const getDistrictRegionStyle = ({
  countyId,
  svgId,
  countyData,
  districtData,
  districtColors,
  selectedDistrictId,
  theme,
  hoveredId,
  isClickable = false
}) => {
  const countyInfo = countyData[svgId];
  if (!countyInfo) return {};

  const {
    borderColor = "#ffffff", 
    hoverColor = "#FFD700"
  } = theme;

  const style = {
    stroke: borderColor,
    strokeWidth: "1px",
    cursor: isClickable ? "pointer" : "default",
    transition: "fill 0.2s ease-in-out, stroke 0.2s ease-in-out",
  };

  const isHovered = hoveredId === countyInfo.gameId;

  if (isHovered) {
    style.fill = hoverColor;
    style.strokeWidth = "2px";
  } else {
    // Apply district coloring
    style.fill = getDistrictFillColor(
      countyInfo.gameId, 
      districtData, 
      districtColors, 
      selectedDistrictId, 
      '#cccccc'
    );
  }

  return style;
};
