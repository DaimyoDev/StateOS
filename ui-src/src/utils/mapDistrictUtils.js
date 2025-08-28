// District styling utilities for congressional district maps
import {
  calculateCongressionalDistricts,
  getCongressionalDistrictCount,
  generateDistrictColors,
} from "./congressionalDistricts.js";
import { usaCounties } from "../data/states/adminRegions2/usaCounties.js";

// Create a mapping from gameId to county name for all USA counties
const COUNTY_NAME_MAP = usaCounties.reduce((acc, county) => {
  acc[county.id] = county.name;
  return acc;
}, {});

/**
 * Creates a gradient color from multiple district colors based on allocations
 */
export const createGradientColor = (allocations, districtData, districtColors) => {
  const allocationEntries = Object.entries(allocations)
    .map(([districtId, allocation]) => {
      const districtIndex = districtData.findIndex(d => d.id === parseInt(districtId, 10));
      return {
        districtId: parseInt(districtId, 10),
        allocation: allocation,
        color: districtIndex !== -1 ? districtColors[districtIndex] : '#cccccc',
        index: districtIndex
      };
    })
    .filter(entry => entry.allocation > 0)
    .sort((a, b) => b.allocation - a.allocation);

  if (allocationEntries.length === 1) {
    return allocationEntries[0].color;
  }

  if (allocationEntries.length === 2) {
    // Create a simple two-color gradient
    const [first, second] = allocationEntries;
    const firstPercent = Math.round(first.allocation * 100);
    const secondPercent = Math.round(second.allocation * 100);
    
    return `linear-gradient(45deg, ${first.color} 0%, ${first.color} ${firstPercent}%, ${second.color} ${firstPercent}%, ${second.color} 100%)`;
  }

  // For more than 2 districts, create a multi-stop gradient
  let gradientStops = [];
  let currentPercent = 0;
  
  for (const entry of allocationEntries) {
    const percent = Math.round(entry.allocation * 100);
    gradientStops.push(`${entry.color} ${currentPercent}%`);
    currentPercent += percent;
    gradientStops.push(`${entry.color} ${currentPercent}%`);
  }
  
  return `linear-gradient(45deg, ${gradientStops.join(', ')})`;
};

/**
 * Gets the fill color for a county based on district assignment
 */
export const getDistrictFillColor = (
  countyId,
  districtData,
  districtColors,
  selectedDistrictId,
  defaultColor
) => {
  if (!districtData || districtData.length === 0) {
    return defaultColor;
  }

  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) return defaultColor;

  let allocations = null;

  // Find the county's allocation data. We need to find the full county object
  // which is now consistent across all district references to it.
  for (const district of districtData) {
    const county = district.counties.find((c) => c.name === countyName);
    if (county) {
      allocations = county.allocations;
      break;
    }
  }

  if (!allocations) {
    return defaultColor;
  }

  // If a district is selected, we color the county with the SELECTED district's color
  // if it has any allocation there. Otherwise, it's grayed out.
  if (selectedDistrictId !== null) {
    const belongsToSelected = allocations[selectedDistrictId] > 0;
    if (belongsToSelected) {
      const selectedDistrictIndex = districtData.findIndex(
        (d) => d.id === selectedDistrictId
      );
      return selectedDistrictIndex !== -1
        ? districtColors[selectedDistrictIndex]
        : defaultColor;
    }
    return "#e0e0e0"; // Gray out if not part of the selected district
  }

  // Check if county is split across multiple districts
  const allocationCount = Object.keys(allocations).length;
  
  if (allocationCount > 1) {
    // Create gradient for split counties
    return createGradientColor(allocations, districtData, districtColors);
  }

  // If no district is selected and county is not split, color by the primary district
  let primaryDistrictId = -1;
  let maxAllocation = 0;
  for (const [dId, alloc] of Object.entries(allocations)) {
    if (alloc > maxAllocation) {
      maxAllocation = alloc;
      primaryDistrictId = parseInt(dId, 10);
    }
  }

  const districtIndex = districtData.findIndex(
    (d) => d.id === primaryDistrictId
  );
  if (districtIndex === -1) return defaultColor;

  return districtColors[districtIndex] || defaultColor;
};

// Cache for district calculations to prevent duplicate generation
let districtCache = new Map();

/**
 * Creates district styling data for a state's counties
 */
export const createDistrictMapData = (
  state,
  counties,
  selectedDistrictId,
  countyPathData,
  countryData = null
) => {
  if (!state || !counties || counties.length === 0) {
    return { districtData: [], districtColors: [], mapData: [] };
  }

  const numDistricts = getCongressionalDistrictCount(state.id);
  const totalPopulation =
    state.population ||
    counties.reduce((sum, c) => sum + (c.population || 0), 0);

  const cacheKey = `${state.id}_${totalPopulation}_${numDistricts}_${counties.length}_${countryData ? 'generated' : 'rl'}`;

  let districtData;
  if (districtCache.has(cacheKey)) {
    districtData = districtCache.get(cacheKey);
  } else {
    districtData = calculateCongressionalDistricts(
      counties,
      totalPopulation,
      numDistricts,
      countyPathData,
      state.id,
      countryData
    );
    districtCache.set(cacheKey, districtData);
  }

  const districtColors = generateDistrictColors(numDistricts);

  const splitCountyInfo = identifySplitCounties(districtData, counties);

  const mapData = counties.map((county) => {
    const isSplit = !!splitCountyInfo[county.name];
    const splitDetails = splitCountyInfo[county.name]
      ? splitCountyInfo[county.name].districts
      : null;
    const color = getDistrictFillColor(
      county.id,
      districtData,
      districtColors,
      selectedDistrictId,
      "#cccccc"
    );
    const label = getDistrictLabel(county.id, districtData);
    const districtId = getCountyDistrictId(county.id, districtData);

    return {
      id: county.id,
      color: color,
      value: label,
      districtId: districtId,
      isSplit: isSplit,
      splitDetails: splitDetails,
      // Add gradient information for CSS-based rendering
      isGradient: color && color.startsWith('linear-gradient'),
      backgroundImage: color && color.startsWith('linear-gradient') ? color : null,
    };
  });

  return { districtData, districtColors, mapData };
};

/**
 * Identifies counties that are split across multiple districts.
 */
function identifySplitCounties(districtData, allCounties) {
  const countyAllocations = {};

  for (const district of districtData) {
    for (const county of district.counties) {
      if (!countyAllocations[county.name]) {
        countyAllocations[county.name] = {
          allocations: county.allocations,
        };
      }
    }
  }

  const splitCounties = {};
  for (const [countyName, data] of Object.entries(countyAllocations)) {
    const allocationKeys = Object.keys(data.allocations);
    if (allocationKeys.length > 1) {
      const originalCounty = allCounties.find((c) => c.name === countyName);
      if (!originalCounty) continue;

      const totalPopulation = originalCounty.population;

      splitCounties[countyName] = {
        totalPopulation: totalPopulation,
        districts: allocationKeys.map((districtId) => ({
          districtId: parseInt(districtId, 10),
          population: totalPopulation * data.allocations[districtId],
        })),
      };
    }
  }

  return splitCounties;
}

/**
 * Gets the district label for a county
 */
export const getDistrictLabel = (countyId, districtData) => {
  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) return "No District";

  for (const district of districtData) {
    if (district.counties.some((c) => c.name === countyName)) {
      return `District ${district.id}`;
    }
  }
  return "No District";
};

/**
 * Gets the primary district ID for a county
 */
export const getCountyDistrictId = (countyId, districtData) => {
  const countyName = COUNTY_NAME_MAP[countyId];
  if (!countyName) return null;

  for (const district of districtData) {
    if (district.counties.some((c) => c.name === countyName)) {
      return district.id;
    }
  }
  return null;
};

/**
 * Creates a standardized region style object for district maps
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
}) => {
  const countyInfo = countyData[svgId];
  if (!countyInfo) return {};

  const { borderColor = "#ffffff", hoverColor = "#FFD700" } = theme;

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
    const fillColor = getDistrictFillColor(
      countyInfo.gameId,
      districtData,
      districtColors,
      selectedDistrictId,
      "#cccccc"
    );
    
    // Check if it's a gradient color (for split counties)
    if (fillColor.startsWith('linear-gradient')) {
      // For SVG, we need to create a pattern or use a different approach
      // For now, fall back to the primary district color for SVG compatibility
      const countyName = COUNTY_NAME_MAP[countyInfo.gameId];
      if (countyName) {
        let allocations = null;
        for (const district of districtData) {
          const county = district.counties.find((c) => c.name === countyName);
          if (county) {
            allocations = county.allocations;
            break;
          }
        }
        
        if (allocations && Object.keys(allocations).length > 1) {
          // For split counties in SVG, use a striped pattern effect
          // This is a fallback - in a real implementation you'd create SVG patterns
          const allocationEntries = Object.entries(allocations)
            .map(([districtId, allocation]) => ({
              districtId: parseInt(districtId, 10),
              allocation: allocation
            }))
            .sort((a, b) => b.allocation - a.allocation);
          
          const primaryDistrictIndex = districtData.findIndex(d => d.id === allocationEntries[0].districtId);
          style.fill = primaryDistrictIndex !== -1 ? districtColors[primaryDistrictIndex] : "#cccccc";
          
          // Add a visual indicator for split counties
          style.strokeWidth = "2px";
          style.strokeDasharray = "3,2";
        } else {
          style.fill = fillColor;
        }
      } else {
        style.fill = fillColor;
      }
    } else {
      style.fill = fillColor;
    }
  }

  return style;
};
