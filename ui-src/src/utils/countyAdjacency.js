// County adjacency detection utility using Turf.js for proper geographic analysis
import * as turf from "@turf/turf";

/**
 * Parse SVG path data to extract coordinates and create a Turf polygon
 * @param {string} pathData - SVG path data string
 * @returns {Object|null} Turf polygon or null if invalid
 */
function parsePathDataToPolygon(pathData) {
  if (!pathData) {
    console.warn("Empty path data provided");
    return null;
  }

  const coords = [];
  const commands = pathData.match(
    /[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g
  );

  if (!commands) {
    console.warn(
      "No valid SVG commands found in path data:",
      pathData.substring(0, 100)
    );
    return null;
  }

  let currentX = 0;
  let currentY = 0;

  commands.forEach((command) => {
    const type = command[0];
    const args = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

    switch (type.toLowerCase()) {
      case "m": // Move to
        if (args.length >= 2) {
          if (type === "M") {
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
              if (type === "M") {
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
      case "l": // Line to
        for (let i = 0; i < args.length; i += 2) {
          if (i + 1 < args.length) {
            if (type === "L") {
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
      case "h": // Horizontal line
        args.forEach((x) => {
          if (type === "H") {
            currentX = x;
          } else {
            currentX += x;
          }
          coords.push([currentX, currentY]);
        });
        break;
      case "v": // Vertical line
        args.forEach((y) => {
          if (type === "V") {
            currentY = y;
          } else {
            currentY += y;
          }
          coords.push([currentX, currentY]);
        });
        break;
      case "z": // Close path
      case "Z": // Close path
        if (
          coords.length > 0 &&
          (coords[0][0] !== currentX || coords[0][1] !== currentY)
        ) {
          coords.push([...coords[0]]);
        }
        break;
    }
  });

  if (coords.length < 4) {
    return null;
  }

  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
    coords.push([...coords[0]]);
  }

  try {
    return turf.polygon([coords]);
  } catch (error) {
    return null;
  }
}

/**
 * Build adjacency map using Turf.js for accurate geographic analysis
 * @param {Object} countyPathData - Object mapping county IDs to SVG path data
 * @returns {Object} Adjacency map where keys are county IDs and values are arrays of adjacent county IDs
 */
export function buildAdjacencyMap(countyPathData) {
  console.log(
    "Building adjacency map with Turf.js for",
    Object.keys(countyPathData).length,
    "counties"
  );

  const adjacencyMap = {};
  const countyPolygons = {};

  for (const [countyId, pathData] of Object.entries(countyPathData)) {
    const polygon = parsePathDataToPolygon(pathData);
    if (polygon) {
      countyPolygons[countyId] = polygon;
      adjacencyMap[countyId] = [];
    }
  }

  console.log(
    "Successfully created polygons for",
    Object.keys(countyPolygons).length,
    "counties"
  );

  const countyIds = Object.keys(countyPolygons);
  for (let i = 0; i < countyIds.length; i++) {
    for (let j = i + 1; j < countyIds.length; j++) {
      const county1 = countyIds[i];
      const county2 = countyIds[j];

      try {
        const polygon1 = countyPolygons[county1];
        const polygon2 = countyPolygons[county2];

        // ** THE FIX IS HERE **
        // The original `turf.booleanTouches` was too strict for imperfect SVG data.
        // This new logic is more robust: it buffers one polygon by a slightly larger amount
        // to reliably bridge invisible gaps in the map data, preventing islands.
        let areAdjacent = turf.booleanTouches(polygon1, polygon2);

        if (!areAdjacent) {
          const bufferedPolygon = turf.buffer(polygon1, 0.01, {
            units: "degrees",
          });
          if (turf.booleanIntersects(bufferedPolygon, polygon2)) {
            // To avoid false positives from overlaps, ensure they don't overlap significantly
            if (!turf.booleanOverlap(polygon1, polygon2)) {
              areAdjacent = true;
            }
          }
        }

        if (areAdjacent) {
          adjacencyMap[county1].push(county2);
          adjacencyMap[county2].push(county1);
        }
      } catch (error) {
        console.warn(
          `Error checking adjacency between ${county1} and ${county2}:`,
          error
        );
      }
    }
  }

  const adjacencyCounts = Object.values(adjacencyMap).map((adj) => adj.length);
  const avgAdjacency =
    adjacencyCounts.reduce((sum, count) => sum + count, 0) /
    adjacencyCounts.length;
  console.log(
    `Adjacency map complete. Average adjacencies per county: ${avgAdjacency.toFixed(
      1
    )}`
  );

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
 * Check if adding a county to a district maintains geographic contiguity
 * @param {Object} district - District object with counties array
 * @param {string} newCountyName - Name of county to add
 * @param {Object} adjacencyMap - County adjacency map
 * @returns {boolean} True if adding the county maintains contiguity
 */
export function maintainsContiguity(district, newCountyName, adjacencyMap) {
  if (district.counties.length === 0) return true; // First county always maintains contiguity

  const districtCountyNames = district.counties.map((c) => c.name);
  const newCountyAdjacent = adjacencyMap[newCountyName] || [];

  // Check if the new county is adjacent to any county already in the district
  return newCountyAdjacent.some((adjacentCounty) =>
    districtCountyNames.includes(adjacentCounty)
  );
}
