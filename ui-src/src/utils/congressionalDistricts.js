// Congressional Districts calculation utility
// Distributes counties into congressional districts based on population and geographic contiguity

import { buildAdjacencyMap, areCountiesAdjacent } from './countyAdjacency';


/**
 * Find adjacent counties using breadth-first search
 * @param {string} startCounty - Starting county name
 * @param {Object} adjacencyMap - County adjacency map
 * @param {Set} availableCounties - Set of unassigned county names
 * @param {number} targetPopulation - Target population for the district
 * @param {Object} countyPopMap - Map of county names to population
 * @returns {Array} Array of county names forming a contiguous district
 */
function findContiguousCounties(startCounty, adjacencyMap, availableCounties, targetPopulation, countyPopMap) {
  const district = [];
  const queue = [startCounty];
  const visited = new Set();
  let currentPopulation = 0;
  
  while (queue.length > 0 && currentPopulation < targetPopulation) {
    const county = queue.shift();
    
    if (visited.has(county) || !availableCounties.has(county)) {
      continue;
    }
    
    const countyPop = countyPopMap[county] || 0;
    
    // Check if adding this county would exceed target by too much. Allow some flexibility.
    if (currentPopulation > targetPopulation * 0.9 && currentPopulation + countyPop > targetPopulation * 1.2) {
      continue;
    }
    
    // Add county to district
    visited.add(county);
    district.push({
      name: county,
      population: countyPop,
      splitInfo: null
    });
    availableCounties.delete(county);
    currentPopulation += countyPop;
    
    // Add adjacent counties to queue for consideration
    const adjacentCounties = adjacencyMap[county] || [];
    for (const adjacent of adjacentCounties) {
      if (!visited.has(adjacent) && availableCounties.has(adjacent)) {
        queue.push(adjacent);
      }
    }
  }
  
  return {
    counties: district,
    population: currentPopulation
  };
}

/**
 * Calculate congressional districts for a US state with geographic contiguity
 * Generate complete districts one at a time for better adjacency
 * @param {Array} counties - Array of county objects with population data
 * @param {number} totalPopulation - Total state population
 * @param {number} numDistricts - Number of congressional districts for the state
 * @param {Object} countyPathData - Optional SVG path data for adjacency calculation
 * @returns {Array} Array of district objects with assigned counties
 */
export function calculateCongressionalDistricts(counties, totalPopulation, numDistricts, countyPathData = null) {
  if (!counties || counties.length === 0 || numDistricts <= 0) {
    return [];
  }

  const targetPopulationPerDistrict = totalPopulation / numDistricts;
  

  // Build adjacency map if path data is available
  let adjacencyMap = null;
  if (countyPathData) {
    try {
      adjacencyMap = buildAdjacencyMap(countyPathData);
    } catch (error) {
      // console.warn('Failed to build adjacency map, falling back to population-only distribution:', error);
    }
  }

  // Create county name to population map
  const countyPopMap = {};
  const availableCounties = new Set();
  counties.forEach(county => {
    countyPopMap[county.name] = county.population || 0;
    availableCounties.add(county.name);
  });

  
  // Create districts using breadth-first search for contiguity
  const districts = [];
  
  for (let districtNum = 1; districtNum <= numDistricts; districtNum++) {
    let districtResult = null;
    
    if (availableCounties.size > 0) {
      // Start with the most populous remaining county for better distribution
      let startCounty = null;
      let maxPop = 0;
      
      for (const county of availableCounties) {
        const pop = countyPopMap[county] || 0;
        if (pop > maxPop) {
          maxPop = pop;
          startCounty = county;
        }
      }
      
      if (!startCounty) break;
      
      // Find contiguous counties for this district
      districtResult = adjacencyMap 
        ? findContiguousCounties(startCounty, adjacencyMap, availableCounties, targetPopulationPerDistrict, countyPopMap)
        : { 
            counties: [{
              name: startCounty,
              population: countyPopMap[startCounty] || 0,
              splitInfo: null
            }], 
            population: countyPopMap[startCounty] || 0 
          };
      
      // Remove assigned counties from available set
      if (!adjacencyMap) {
        availableCounties.delete(startCounty);
      }
    } else {
      break; // No more counties or splits to assign
    }
    
    if (districtResult) {
      districts.push({
        id: districtNum,
        counties: districtResult.counties,
        population: districtResult.population
      });
    }
  }

  // Handle any remaining unassigned counties by assigning them to the best adjacent district
  if (availableCounties.size > 0 && adjacencyMap) {
    const remainingCounties = Array.from(availableCounties);

    for (const countyName of remainingCounties) {
      const adjacentDistricts = [];
      const adjacentCountyNames = adjacencyMap[countyName] || [];

      for (const district of districts) {
        for (const districtCounty of district.counties) {
          if (adjacentCountyNames.includes(districtCounty.name)) {
            adjacentDistricts.push(district);
            break; // Found an adjacent district, no need to check other counties in it
          }
        }
      }

      // Find the adjacent district that has the lowest population
      let bestDistrict = null;
      let minPopulation = Infinity;

      if (adjacentDistricts.length > 0) {
        for (const district of adjacentDistricts) {
          if (district.population < minPopulation) {
            minPopulation = district.population;
            bestDistrict = district;
          }
        }
      }

      // If no adjacent district is found, do not assign it to prevent non-contiguous districts.
      if (!bestDistrict) {
        // console.warn(`Could not find adjacent district for remaining county: ${countyName}`);
        continue; // Skip to the next remaining county
      }

      // Assign the county to the best-fit district
      const countyData = counties.find(c => c.name === countyName);
      if (countyData && bestDistrict) {
        bestDistrict.counties.push({
          name: countyData.name,
          population: countyData.population,
          splitInfo: null
        });
        bestDistrict.population += countyData.population || 0;
        availableCounties.delete(countyName);
      }
    }
  }
  

  return districts;
}

/**
 * Get the number of congressional districts for a US state
 * Based on 2020 census data and current House apportionment
 */
export function getCongressionalDistrictCount(stateId) {
  const districtCounts = {
    'USA_AL': 7,   // Alabama
    'USA_AK': 1,   // Alaska
    'USA_AZ': 9,   // Arizona
    'USA_AR': 4,   // Arkansas
    'USA_CA': 52,  // California
    'USA_CO': 8,   // Colorado
    'USA_CT': 5,   // Connecticut
    'USA_DE': 1,   // Delaware
    'USA_FL': 28,  // Florida
    'USA_GA': 14,  // Georgia
    'USA_HI': 2,   // Hawaii
    'USA_ID': 2,   // Idaho
    'USA_IL': 17,  // Illinois
    'USA_IN': 9,   // Indiana
    'USA_IA': 4,   // Iowa
    'USA_KS': 4,   // Kansas
    'USA_KY': 6,   // Kentucky
    'USA_LA': 6,   // Louisiana
    'USA_ME': 2,   // Maine
    'USA_MD': 8,   // Maryland
    'USA_MA': 9,   // Massachusetts
    'USA_MI': 13,  // Michigan
    'USA_MN': 8,   // Minnesota
    'USA_MS': 4,   // Mississippi
    'USA_MO': 8,   // Missouri
    'USA_MT': 2,   // Montana
    'USA_NE': 3,   // Nebraska
    'USA_NV': 4,   // Nevada
    'USA_NH': 2,   // New Hampshire
    'USA_NJ': 12,  // New Jersey
    'USA_NM': 3,   // New Mexico
    'USA_NY': 26,  // New York
    'USA_NC': 14,  // North Carolina
    'USA_ND': 1,   // North Dakota
    'USA_OH': 15,  // Ohio
    'USA_OK': 5,   // Oklahoma
    'USA_OR': 6,   // Oregon
    'USA_PA': 17,  // Pennsylvania
    'USA_RI': 2,   // Rhode Island
    'USA_SC': 7,   // South Carolina
    'USA_SD': 1,   // South Dakota
    'USA_TN': 9,   // Tennessee
    'USA_TX': 38,  // Texas
    'USA_UT': 4,   // Utah
    'USA_VT': 1,   // Vermont
    'USA_VA': 11,  // Virginia
    'USA_WA': 10,  // Washington
    'USA_WV': 2,   // West Virginia
    'USA_WI': 8,   // Wisconsin
    'USA_WY': 1,   // Wyoming
  };
  
  return districtCounts[stateId] || 1;
}

/**
 * Generate colors for congressional districts using the golden angle for distinct colors.
 * @param {number} numDistricts - Number of districts
 * @returns {Array} Array of color strings
 */
export function generateDistrictColors(numDistricts) {
  const colors = [];
  const goldenAngle = 137.5; // degrees

  // Helper to convert HSL to Hex
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  for (let i = 0; i < numDistricts; i++) {
    const hue = Math.random() * 360;
    const saturation = 60 + Math.random() * 30; // 60-90%
    const lightness = 60 + Math.random() * 20;  // 60-80%
    colors.push(hslToHex(hue, saturation, lightness));
  }
  
  return colors;
}
