// County adjacency detection utility using Turf.js for proper geographic analysis
import * as turf from '@turf/turf';

/**
 * Parse SVG path data to extract coordinates and create a Turf polygon
 * @param {string} pathData - SVG path data string
 * @returns {Object|null} Turf polygon or null if invalid
 */
function parsePathDataToPolygon(pathData) {
  if (!pathData) {
    console.warn('Empty path data provided');
    return null;
  }
  
  const coords = [];
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
  
  if (!commands) {
    console.warn('No valid SVG commands found in path data:', pathData.substring(0, 100));
    return null;
  }
  
  let currentX = 0;
  let currentY = 0;
  
  commands.forEach(command => {
    const type = command[0];
    const args = command.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    
    switch (type.toLowerCase()) {
      case 'm': // Move to
        if (args.length >= 2) {
          if (type === 'M') {
            currentX = args[0];
            currentY = args[1];
          } else {
            currentX += args[0];
            currentY += args[1];
          }
          coords.push([currentX, currentY]);
          
          // Handle implicit line commands after move
          for (let i = 2; i < args.length; i += 2) {
            if (i + 1 < args.length) {
              if (type === 'M') {
                currentX = args[i];
                currentY = args[i + 1];
              } else {
                currentX += args[i];
                currentY += args[i + 1];
              }
              coords.push([currentX, currentY]);
            }
          }
        }
        break;
      case 'l': // Line to
        for (let i = 0; i < args.length; i += 2) {
          if (i + 1 < args.length) {
            if (type === 'L') {
              currentX = args[i];
              currentY = args[i + 1];
            } else {
              currentX += args[i];
              currentY += args[i + 1];
            }
            coords.push([currentX, currentY]);
          }
        }
        break;
      case 'h': // Horizontal line
        args.forEach(x => {
          if (type === 'H') {
            currentX = x;
          } else {
            currentX += x;
          }
          coords.push([currentX, currentY]);
        });
        break;
      case 'v': // Vertical line
        args.forEach(y => {
          if (type === 'V') {
            currentY = y;
          } else {
            currentY += y;
          }
          coords.push([currentX, currentY]);
        });
        break;
      case 'z': // Close path
      case 'Z': // Close path
        if (coords.length > 0 && (coords[0][0] !== currentX || coords[0][1] !== currentY)) {
          coords.push([...coords[0]]);
        }
        break;
    }
  });
  
  // Need at least 4 points to form a polygon (including closing point)
  if (coords.length < 4) {
    console.warn(`Insufficient coordinates for polygon: ${coords.length} points`);
    return null;
  }
  
  // Ensure the polygon is closed
  if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push([...coords[0]]);
  }
  
  try {
    // Create Turf polygon - note: Turf expects [longitude, latitude] format
    // For SVG coordinates, we'll treat x as longitude and y as latitude
    return turf.polygon([coords]);
  } catch (error) {
    console.warn('Failed to create polygon from coordinates:', error, 'Coords sample:', coords.slice(0, 5));
    return null;
  }
}

/**
 * Build adjacency map using Turf.js for accurate geographic analysis
 * @param {Object} countyPathData - Object mapping county IDs to SVG path data
 * @returns {Object} Adjacency map where keys are county IDs and values are arrays of adjacent county IDs
 */
export function buildAdjacencyMap(countyPathData) {
  console.log('Building adjacency map with Turf.js for', Object.keys(countyPathData).length, 'counties');
  
  const adjacencyMap = {};
  const countyPolygons = {};
  
  // First, convert all counties to Turf polygons
  for (const [countyId, pathData] of Object.entries(countyPathData)) {
    const polygon = parsePathDataToPolygon(pathData);
    if (polygon) {
      countyPolygons[countyId] = polygon;
      adjacencyMap[countyId] = [];
    }
  }
  
  console.log('Successfully created polygons for', Object.keys(countyPolygons).length, 'counties');
  
  // Check adjacency between all pairs of counties
  const countyIds = Object.keys(countyPolygons);
  for (let i = 0; i < countyIds.length; i++) {
    for (let j = i + 1; j < countyIds.length; j++) {
      const county1 = countyIds[i];
      const county2 = countyIds[j];
      
      try {
        // Use Turf.js to check if polygons share a border
        const polygon1 = countyPolygons[county1];
        const polygon2 = countyPolygons[county2];
        
        // Use booleanTouches to detect when polygons share a boundary without overlapping
        const touches = turf.booleanTouches(polygon1, polygon2);
        
        if (touches) {
          adjacencyMap[county1].push(county2);
          adjacencyMap[county2].push(county1);
        }
      } catch (error) {
        console.warn(`Error checking adjacency between ${county1} and ${county2}:`, error);
      }
    }
  }
  
  // Log adjacency statistics
  const adjacencyCounts = Object.values(adjacencyMap).map(adj => adj.length);
  const avgAdjacency = adjacencyCounts.reduce((sum, count) => sum + count, 0) / adjacencyCounts.length;
  console.log(`Adjacency map complete. Average adjacencies per county: ${avgAdjacency.toFixed(1)}`);
  
  return adjacencyMap;
}

/**
 * Check if two counties are geographically contiguous
 * @param {string} county1 - First county ID
 * @param {string} county2 - Second county ID
 * @param {Object} adjacencyMap - Pre-built adjacency map
 * @returns {boolean} True if counties are adjacent
 */
export function areCountiesAdjacent(county1, county2, adjacencyMap) {
  return adjacencyMap[county1]?.includes(county2) || false;
}

// Export the main function for building adjacency maps
export default buildAdjacencyMap;

/**
 * Calculate geographic distance between two counties based on their centroids
 * @param {Object} countyPathData - Object mapping county names to SVG path strings
 * @param {string} county1 - First county name
 * @param {string} county2 - Second county name
 * @returns {number} Distance between county centroids
 */
export function getCountyDistance(countyPathData, county1, county2) {
  const path1 = parsePathCoordinates(countyPathData[county1] || '');
  const path2 = parsePathCoordinates(countyPathData[county2] || '');
  
  const centroid1 = getCountyCentroid(path1);
  const centroid2 = getCountyCentroid(path2);
  
  return distance(centroid1, centroid2);
}

/**
 * Check if adding a county to a district maintains geographic contiguity
 * @param {Object} district - District object with counties array
 * @param {string} newCountyName - Name of county to add
 * @param {Object} adjacencyMap - County adjacency map
 * @returns {boolean} True if adding the county maintains contiguity
 */
export function maintainsContiguity(district, newCountyName, adjacencyMap) {
  if (district.counties.length === 0) return true; // First county always maintains contiguity
  
  const districtCountyNames = district.counties.map(c => c.name);
  const newCountyAdjacent = adjacencyMap[newCountyName] || [];
  
  // Check if the new county is adjacent to any county already in the district
  return newCountyAdjacent.some(adjacentCounty => 
    districtCountyNames.includes(adjacentCounty)
  );
}
