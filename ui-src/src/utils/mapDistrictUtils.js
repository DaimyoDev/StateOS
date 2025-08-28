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
 * @param {boolean} isSplit - Whether the county is split across multiple districts
 * @param {Array} splitDetails - Array of district objects this county belongs to (for split counties)
 * @returns {string} The calculated fill color
 */
// Replace the existing getDistrictFillColor function with this one
export const getDistrictFillColor = (countyId, districtData, districtColors, selectedDistrictId, defaultColor, isSplit = false, splitDetails = null) => {
  if (!districtData || districtData.length === 0) {
    return defaultColor;
  }

  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) return defaultColor;

  // Handle split counties
  if (isSplit && splitDetails) {
    if (selectedDistrictId !== null) {
      // Check if the selected district is one of the districts this split county belongs to
      const belongsToSelectedDistrict = splitDetails.some(d => d.districtId === selectedDistrictId);
      
      console.log(`🎨 Split county ${countyName}: belongs to selected district ${selectedDistrictId}?`, belongsToSelectedDistrict);
      
      if (belongsToSelectedDistrict) {
        // Find the color index for the selected district
        const selectedDistrictIndex = districtData.findIndex(d => d.id === selectedDistrictId);
        const color = selectedDistrictIndex !== -1 ? districtColors[selectedDistrictIndex] : 'var(--accent-color, #ff6b35)';
        console.log(`🎨 Using district color for split county ${countyName}:`, color);
        return color;
      } else {
        // County is split but doesn't belong to selected district - use muted accent color
        console.log(`🎨 Split county ${countyName} doesn't belong to selected district, using muted accent`);
        return 'var(--accent-color-muted, #ff6b3580)';
      }
    } else {
      // No district selected, use default accent color for split counties
      return 'var(--accent-color, #ff6b35)';
    }
  }

  // Handle non-split counties
  for (let i = 0; i < districtData.length; i++) {
    const district = districtData[i];
    if (district.counties.some(c => c.name === countyName)) {
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
 * @param {Object} countryData - Optional country data for getting district count
 * @returns {Object} Object with districtData, districtColors, and mapData
 */
export const createDistrictMapData = (state, counties, selectedDistrictId, countyPathData, countryData = null) => {
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
  
  // Identify split counties after district generation
  const splitCountyInfo = identifySplitCounties(districtData, counties);
  
  // Create map data for each county
  const mapData = counties.map(county => {
    const splitInfo = splitCountyInfo[county.name] || null;
    const isSplit = splitInfo !== null;
    const splitDetails = splitInfo ? splitInfo.districts : null;
    const color = getDistrictFillColor(county.id, districtData, districtColors, selectedDistrictId, '#cccccc', isSplit, splitDetails);
    const label = getDistrictLabel(county.id, districtData);
    const districtId = getCountyDistrictId(county.id, districtData);
    
    // Debug logging for split counties
    if (isSplit) {
      console.log(`🗺️ MapData for split county ${county.name}:`, {
        id: county.id,
        color: color,
        isSplit: isSplit,
        selectedDistrictId: selectedDistrictId,
        splitDetails: splitDetails
      });
    }
    
    return {
      id: county.id,
      color: color,
      value: label,
      districtId: districtId,
      isSplit: isSplit,
      splitDetails: splitDetails
    };
  });

  return { districtData, districtColors, mapData };
};

/**
 * Identifies counties that are split across multiple districts
 * @param {Array} districtData - Array of district objects
 * @param {Array} counties - Array of county objects
 * @returns {Object} Object mapping county names to split information
 */
function identifySplitCounties(districtData, counties) {
  console.log(`🔍 IDENTIFYING SPLIT COUNTIES`);
  const splitCounties = {};
  
  // Track which districts each county appears in
  const countyDistrictMap = {};
  
  for (const district of districtData) {
    for (const county of district.counties) {
      if (!countyDistrictMap[county.name]) {
        countyDistrictMap[county.name] = [];
      }
      
      if (county.splitInfo) {
        console.log(`🔄 Found county with splitInfo: ${county.name}`, county.splitInfo);
      }
      
      const assignedPopulation = county.splitInfo ? 
        (county.splitInfo.districtPopulations?.[district.id] || 0) : 
        county.population;
      
      countyDistrictMap[county.name].push({
        districtId: district.id,
        population: assignedPopulation,
        splitInfo: county.splitInfo
      });
    }
  }
  
  console.log(`📊 County district map:`, Object.keys(countyDistrictMap).length, 'counties tracked');
  
  // Identify counties that appear in multiple districts OR have splitInfo
  for (const [countyName, districts] of Object.entries(countyDistrictMap)) {
    const hasSplitInfo = districts.some(d => d.splitInfo && d.splitInfo.districtPopulations);
    
    if (districts.length > 1 || hasSplitInfo) {
      const originalCounty = counties.find(c => c.name === countyName);
      const totalPopulation = originalCounty?.population || 0;
      
      // If county has splitInfo, extract all district populations from it
      if (hasSplitInfo) {
        const splitInfo = districts.find(d => d.splitInfo)?.splitInfo;
        if (splitInfo && splitInfo.districtPopulations) {
          const splitDistricts = Object.entries(splitInfo.districtPopulations)
            .filter(([districtId, population]) => population > 0)
            .map(([districtId, population]) => ({
              districtId: parseInt(districtId),
              population: population
            }));
          
          if (splitDistricts.length > 1) {
            console.log(`✅ Adding split county ${countyName}:`, splitDistricts);
            splitCounties[countyName] = {
              totalPopulation: totalPopulation,
              districts: splitDistricts
            };
          } else {
            console.log(`⚠️ County ${countyName} has splitInfo but only ${splitDistricts.length} districts with population`);
          }
        }
      } else if (districts.length > 1) {
        // Fallback for counties appearing in multiple districts without splitInfo
        splitCounties[countyName] = {
          totalPopulation: totalPopulation,
          districts: districts.map(d => ({
            districtId: d.districtId,
            population: d.population
          }))
        };
      }
    }
  }
  
  console.log(`🏁 Final split counties found:`, Object.keys(splitCounties).length);
  Object.entries(splitCounties).forEach(([name, info]) => {
    console.log(`   ${name}: ${info.districts.length} districts, total pop: ${info.totalPopulation.toLocaleString()}`);
  });
  
  return splitCounties;
}

/**
 * Gets the district label for a county
 * @param {string} countyId - County ID
 * @param {Array} districtData - District data array
 * @returns {string} District label
 */
export const getDistrictLabel = (countyId, districtData) => {
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
export const getCountyDistrictId = (countyId, districtData) => {
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
 * @param {boolean} params.isSplit - Whether the county is split across districts
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
  isClickable = false,
  isSplit = false,
  splitDetails = null
}) => {
  const countyInfo = countyData[svgId];
  if (!countyInfo) return {};

  const {
    borderColor = "#ffffff", 
    hoverColor = "#FFD700",
    accentColor = theme.selectedColor || "#ff6b35"
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
    // Apply district coloring with split county handling
    style.fill = getDistrictFillColor(
      countyInfo.gameId, 
      districtData, 
      districtColors, 
      selectedDistrictId, 
      '#cccccc',
      isSplit,
      splitDetails
    );
    
    // Remove the override - let getDistrictFillColor handle split county coloring
  }

  return style;
};
