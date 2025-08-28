// Modern Congressional District Generation using RL-Inspired Iterative Balancing
import { buildCountyGraph } from "./countyGraph.js";
import { buildAdjacencyMap } from "./countyAdjacency.js";

/**
 * Manages the state of congressional districts and iteratively balances them.
 */
class DistrictBalancer {
  constructor(counties, numDistricts, adjacencyMap) {
    this.numDistricts = numDistricts;
    this.adjacencyMap = adjacencyMap;

    // FIX: Create a single, authoritative map for all county data.
    // This is the source of truth for population and allocations.
    this.countyData = new Map(
      counties.map((c) => [
        c.name,
        {
          name: c.name,
          population: c.population || 0,
          allocations: {}, // Allocations will be stored here: { districtId: percentage }
        },
      ])
    );

    this.totalPopulation = counties.reduce(
      (sum, c) => sum + (c.population || 0),
      0
    );
    this.targetPopulation = this.totalPopulation / numDistricts;

    this.districts = this.initializeDistricts();
    this.recalculateAllDistrictSums();

    console.log(
      `🎯 Target population per district: ${this.targetPopulation.toLocaleString()}`
    );
  }

  /**
   * Creates an initial, random but contiguous, set of districts using a BFS growth method.
   */
  initializeDistricts() {
    // FIX: Districts now hold a Set of county names, not full county objects.
    const districts = Array.from({ length: this.numDistricts }, (_, i) => ({
      id: i + 1,
      counties: new Set(),
      population: 0,
    }));

    const graph = buildCountyGraph(
      Array.from(this.countyData.values()),
      this.adjacencyMap
    );
    const seedNames = graph.selectDistributedSeeds(this.numDistricts);

    const queues = [];
    const assignedCounties = new Set();

    seedNames.forEach((name, i) => {
      const county = this.countyData.get(name);
      county.allocations[districts[i].id] = 1.0; // Modify the central record
      districts[i].counties.add(name); // Add the name to the district's set
      assignedCounties.add(name);
      queues.push({ districtIndex: i, countyName: name });
    });

    let head = 0;
    while (head < queues.length) {
      const { districtIndex, countyName } = queues[head++];
      const neighbors = this.adjacencyMap[countyName] || [];

      for (const neighborName of neighbors) {
        if (!assignedCounties.has(neighborName)) {
          assignedCounties.add(neighborName);
          const neighborCounty = this.countyData.get(neighborName);
          neighborCounty.allocations[districts[districtIndex].id] = 1.0; // Modify central record
          districts[districtIndex].counties.add(neighborName); // Add name to set
          queues.push({ districtIndex, countyName: neighborName });
        }
      }
    }

    // Assign any stragglers (rare, but a good safeguard)
    if (assignedCounties.size < this.countyData.size) {
      const unassigned = Array.from(this.countyData.keys()).filter(
        (c) => !assignedCounties.has(c)
      );
      const smallestDistrict = districts.sort(
        (a, b) => a.counties.size - b.counties.size
      )[0];
      for (const name of unassigned) {
        const stragglerCounty = this.countyData.get(name);
        stragglerCounty.allocations[smallestDistrict.id] = 1.0;
        smallestDistrict.counties.add(name);
      }
    }

    return districts;
  }

  /**
   * Recalculates the population for every district from scratch based on allocations.
   */
  recalculateAllDistrictSums() {
    for (const district of this.districts) {
      district.population = 0;
      // FIX: Iterate over county names and look up data in the central map.
      for (const countyName of district.counties) {
        const county = this.countyData.get(countyName);
        const allocation = county.allocations[district.id] || 0;
        district.population += county.population * allocation;
      }
    }
  }

  /**
   * Main balancing loop that iteratively improves the district map.
   */
  balanceDistricts(maxIterations = 10000, tolerancePercent = 0.005) {
    console.log(
      "🚀 Starting iterative district balancing (Corrected Global Strategy v7)..."
    );
    const tolerance = this.targetPopulation * tolerancePercent;

    for (let i = 0; i < maxIterations; i++) {
      let bestMove = null;
      let maxReward = 1e-9;

      const populations = this.districts.map((d) => d.population);
      const maxPop = Math.max(...populations);
      const minPop = Math.min(...populations);
      if (maxPop - minPop < tolerance) {
        console.log(`✅ Convergence reached in ${i} iterations.`);
        break;
      }

      for (const fromDistrict of this.districts) {
        if (fromDistrict.population <= this.targetPopulation) continue;

        const neighborDistricts = this.findNeighborDistricts(fromDistrict);

        for (const toDistrict of neighborDistricts) {
          if (toDistrict.population >= this.targetPopulation) continue;

          const borderCounties = this.findSharedBorder(
            fromDistrict,
            toDistrict
          );
          for (const countyName of borderCounties) {
            // FIX: Get the single source of truth for the county.
            const county = this.countyData.get(countyName);
            if (!county) continue;

            const availablePop =
              county.population * (county.allocations[fromDistrict.id] || 0);

            const shiftAmount = Math.min(
              county.population * 0.05,
              availablePop
            );

            if (shiftAmount < 1) continue;

            const currentTotalDeviation =
              Math.abs(fromDistrict.population - this.targetPopulation) +
              Math.abs(toDistrict.population - this.targetPopulation);
            const newFromPop = fromDistrict.population - shiftAmount;
            const newToPop = toDistrict.population + shiftAmount;
            const newTotalDeviation =
              Math.abs(newFromPop - this.targetPopulation) +
              Math.abs(newToPop - this.targetPopulation);
            const reward = currentTotalDeviation - newTotalDeviation;

            if (reward > maxReward) {
              let isMoveContiguous = true;
              const fromAlloc = county.allocations[fromDistrict.id] || 0;
              const shiftPercent = shiftAmount / county.population;
              if (fromAlloc - shiftPercent <= 1e-9) {
                isMoveContiguous = this.checkContiguity(
                  fromDistrict,
                  countyName
                );
              }

              if (isMoveContiguous) {
                maxReward = reward;
                bestMove = {
                  countyName,
                  fromDistrict,
                  toDistrict,
                  amount: shiftAmount,
                };
              }
            }
          }
        }
      }

      if (bestMove) {
        this.executeMove(bestMove);
      } else {
        console.log(
          `🛑 No more beneficial moves found. Halting at iteration ${i}.`
        );
        break;
      }

      if (i > 0 && i % 500 === 0 && bestMove) {
        console.log(
          `   Iteration ${i}: Best move shifts ${bestMove.amount.toFixed(
            0
          )} pop from D${bestMove.fromDistrict.id} to D${
            bestMove.toDistrict.id
          }.`
        );
      }
    }

    // Process final districts for output
    return this.districts
      .map((d) => {
        const finalCounties = [];
        for (const countyName of d.counties) {
          const county = this.countyData.get(countyName);
          const allocation = county.allocations[d.id] || 0;
          if (allocation > 1e-9) {
            finalCounties.push({
              name: county.name,
              population: county.population * allocation,
              allocations: county.allocations,
            });
          }
        }
        return {
          ...d,
          counties: finalCounties,
        };
      })
      .sort((a, b) => a.id - b.id);
  }

  /**
   * Checks if a district remains contiguous if a specific county is fully removed from it.
   */
  checkContiguity(district, countyNameToRemove) {
    // FIX: Read from the central `countyData` map to get allocations.
    const remainingCountyNames = Array.from(district.counties).filter(
      (name) => {
        if (name === countyNameToRemove) return false;
        const county = this.countyData.get(name);
        return (county.allocations[district.id] || 0) > 1e-9;
      }
    );

    if (remainingCountyNames.length <= 1) return true;

    const remainingCountiesSet = new Set(remainingCountyNames);
    const visited = new Set();
    const queue = [remainingCountyNames[0]];
    visited.add(remainingCountyNames[0]);

    let head = 0;
    while (head < queue.length) {
      const currentCountyName = queue[head++];
      const neighbors = this.adjacencyMap[currentCountyName] || [];

      for (const neighborName of neighbors) {
        if (
          !visited.has(neighborName) &&
          remainingCountiesSet.has(neighborName)
        ) {
          visited.add(neighborName);
          queue.push(neighborName);
        }
      }
    }
    return visited.size === remainingCountyNames.length;
  }

  findNeighborDistricts(district) {
    const neighbors = new Set();
    // FIX: Iterate over the set of names
    for (const countyName of district.counties) {
      const adjacentCounties = this.adjacencyMap[countyName] || [];
      for (const adjCountyName of adjacentCounties) {
        // Find which districts this adjacent county belongs to
        const adjCounty = this.countyData.get(adjCountyName);
        if (adjCounty) {
          for (const districtIdStr in adjCounty.allocations) {
            const districtId = parseInt(districtIdStr, 10);
            if (districtId !== district.id) {
              const neighborDistrict = this.districts.find(
                (d) => d.id === districtId
              );
              if (neighborDistrict) neighbors.add(neighborDistrict);
            }
          }
        }
      }
    }
    return Array.from(neighbors);
  }

  findSharedBorder(d1, d2) {
    const border = new Set();
    for (const countyName of d1.counties) {
      const neighbors = this.adjacencyMap[countyName] || [];
      for (const neighborName of neighbors) {
        if (d2.counties.has(neighborName)) {
          border.add(countyName);
          break;
        }
      }
    }
    return Array.from(border);
  }

  // FIX: A completely refactored, safer executeMove function.
  executeMove({ countyName, fromDistrict, toDistrict, amount }) {
    // 1. Get the single, authoritative county object.
    const county = this.countyData.get(countyName);
    if (!county || county.population === 0) return;

    // 2. Calculate the percentage shift and update the central allocations object.
    const shiftPercentage = amount / county.population;
    const currentFromAlloc = county.allocations[fromDistrict.id] || 0;
    const actualShiftPercent = Math.min(shiftPercentage, currentFromAlloc);

    if (actualShiftPercent <= 0) return;

    county.allocations[fromDistrict.id] -= actualShiftPercent;
    county.allocations[toDistrict.id] =
      (county.allocations[toDistrict.id] || 0) + actualShiftPercent;

    // 3. Update the district populations incrementally.
    const actualAmount = actualShiftPercent * county.population;
    fromDistrict.population -= actualAmount;
    toDistrict.population += actualAmount;

    // 4. Update the district's set of county names.
    // Add the county to the 'to' district if it's a new allocation.
    toDistrict.counties.add(countyName);

    // If the 'from' district no longer has any allocation, remove the county name.
    if (county.allocations[fromDistrict.id] <= 1e-9) {
      delete county.allocations[fromDistrict.id];
      fromDistrict.counties.delete(countyName);
    }
  }
}

/**
 * Main function to calculate congressional districts using the iterative balancer.
 */
export function calculateCongressionalDistricts(
  counties,
  totalPopulation,
  numDistricts,
  countyPathData
) {
  if (
    !counties ||
    counties.length === 0 ||
    numDistricts <= 0 ||
    !countyPathData
  ) {
    return [];
  }

  const adjacencyMap = buildAdjacencyMap(countyPathData);

  const balancer = new DistrictBalancer(counties, numDistricts, adjacencyMap);
  const finalDistricts = balancer.balanceDistricts();

  // The logic inside this .map() was the source of the error.
  // It has now been corrected to use the proper data source.
  const processedDistricts = finalDistricts.map((district) => {
    // FIX: The 'district' object returned from balanceDistricts already contains
    // the correctly calculated county objects with their partial populations.
    // The previous code was trying to recalculate this using a non-existent
    // property. We can now simplify this section significantly.
    return {
      id: district.id,
      population: district.population,
      counties: district.counties, // This data is already in the correct final format.
    };
  });

  console.log(`\n🏁 RL-STYLE BALANCING COMPLETE`);
  processedDistricts.forEach((d) => {
    const deviation =
      ((d.population - balancer.targetPopulation) / balancer.targetPopulation) *
      100;
    const splitCounties = d.counties.filter(
      (c) => Object.keys(c.allocations).length > 1
    ).length;

    console.log(
      `   District ${d.id}: ${d.population.toLocaleString()} pop. ` +
        `(${deviation > 0 ? "+" : ""}${deviation.toFixed(2)}%), ` +
        `${d.counties.length} counties (${splitCounties} split)`
    );
  });

  return processedDistricts;
}

/**
 * Get the number of congressional districts for a US state from procedurally generated data
 * Falls back to hardcoded values if no generated data is available
 */
export function getCongressionalDistrictCount(stateId, countryData = null) {
  // First, try to get the count from procedurally generated data
  if (countryData && countryData.nationalLowerHouseDistricts) {
    const stateDistricts = countryData.nationalLowerHouseDistricts.filter(
      district => district.stateId === stateId
    );
    if (stateDistricts.length > 0) {
      return stateDistricts.length;
    }
  }

  // Fallback to hardcoded values for backwards compatibility
  const districtCounts = {
    USA_AL: 7,
    USA_AK: 1,
    USA_AZ: 9,
    USA_AR: 4,
    USA_CA: 52,
    USA_CO: 8,
    USA_CT: 5,
    USA_DE: 1,
    USA_FL: 28,
    USA_GA: 14,
    USA_HI: 2,
    USA_ID: 2,
    USA_IL: 17,
    USA_IN: 9,
    USA_IA: 4,
    USA_KS: 4,
    USA_KY: 6,
    USA_LA: 6,
    USA_ME: 2,
    USA_MD: 8,
    USA_MA: 9,
    USA_MI: 13,
    USA_MN: 8,
    USA_MS: 4,
    USA_MO: 8,
    USA_MT: 2,
    USA_NE: 3,
    USA_NV: 4,
    USA_NH: 2,
    USA_NJ: 12,
    USA_NM: 3,
    USA_NY: 26,
    USA_NC: 14,
    USA_ND: 1,
    USA_OH: 15,
    USA_OK: 5,
    USA_OR: 6,
    USA_PA: 17,
    USA_RI: 2,
    USA_SC: 7,
    USA_SD: 1,
    USA_TN: 9,
    USA_TX: 38,
    USA_UT: 4,
    USA_VT: 1,
    USA_VA: 11,
    USA_WA: 10,
    USA_WV: 2,
    USA_WI: 8,
    USA_WY: 1,
  };
  return districtCounts[stateId] || 1;
}

/**
 * Generate colors for congressional districts using the golden angle for distinct colors.
 */
export function generateDistrictColors(numDistricts) {
  const colors = [];
  const goldenAngle = 137.5;
  const slPairs = [
    [85, 55],
    [70, 65],
    [90, 45],
    [65, 75],
    [80, 50],
  ];
  for (let i = 0; i < numDistricts; i++) {
    const hue = (i * goldenAngle) % 360;
    const [saturation, lightness] = slPairs[i % slPairs.length];
    colors.push(`hsl(${hue.toFixed(0)}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}
