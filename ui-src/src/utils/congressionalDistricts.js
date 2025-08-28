// Congressional Districts calculation utility
// Distributes counties into congressional districts based on population and geographic contiguity

import { buildAdjacencyMap, areCountiesAdjacent } from "./countyAdjacency";

/**
 * Find adjacent counties using breadth-first search
 * @param {string} startCounty - Starting county name
 * @param {Object} adjacencyMap - County adjacency map
 * @param {Set} availableCounties - Set of unassigned county names
 * @param {number} targetPopulation - Target population for the district
 * @param {Object} countyPopMap - Map of county names to population
 * @returns {Array} Array of county names forming a contiguous district
 */
function findContiguousCounties(
  startCounty,
  adjacencyMap,
  availableCounties,
  targetPopulation,
  countyPopMap
) {
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
    if (
      currentPopulation > targetPopulation * 0.9 &&
      currentPopulation + countyPop > targetPopulation * 1.2
    ) {
      continue;
    }

    // Add county to district
    visited.add(county);
    district.push({
      name: county,
      population: countyPop,
      splitInfo: null,
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
    population: currentPopulation,
  };
}

/**
 * Calculate congressional districts using the Urban Carve-Out algorithm
 * Four-phase approach: Urban Identification → Urban District Creation → Seed & Grow → Final Refinement
 * @param {Array} counties - Array of county objects with population data
 * @param {number} totalPopulation - Total state population
 * @param {number} numDistricts - Number of congressional districts for the state
 * @param {Object} countyPathData - Optional SVG path data for adjacency calculation
 * @returns {Array} Array of district objects with assigned counties
 */
export function calculateCongressionalDistricts(
  counties,
  totalPopulation,
  numDistricts,
  countyPathData = null
) {
  if (!counties || counties.length === 0 || numDistricts <= 0) {
    return [];
  }

  const targetPopulation = totalPopulation / numDistricts;
  console.log(
    `🎯 Target population per district: ${targetPopulation.toLocaleString()}`
  );

  const adjacencyMap = countyPathData
    ? buildAdjacencyMap(countyPathData)
    : null;
  console.log(
    `🗺️ Adjacency map:`,
    adjacencyMap
      ? `Available (${Object.keys(adjacencyMap).length} counties)`
      : "Not available"
  );

  const countyPopMap = counties.reduce((map, county) => {
    map[county.name] = county.population || 0;
    return map;
  }, {});

  console.log(`\n🏙️ PHASE 1: Urban Identification & Pre-processing`);
  // PHASE 1: Identify mega-counties and separate standard counties
  const { megaCounties, standardCounties } = identifyMegaCounties(
    counties,
    targetPopulation
  );
  console.log(
    `✅ Found ${megaCounties.length} mega-counties and ${standardCounties.length} standard counties`
  );

  console.log(`\n🏗️ PHASE 2: Urban District Carve-Out`);
  // PHASE 2: Create perfect urban districts from mega-counties
  const { urbanDistricts, remnants } = createUrbanDistricts(
    megaCounties,
    targetPopulation
  );
  console.log(
    `✅ Created ${urbanDistricts.length} perfect urban districts with ${remnants.length} remnants`
  );

  console.log(`\n🌱 PHASE 3: Seed & Grow with Remnants + Standard Counties`);
  // PHASE 3: Create remaining districts from remnants and standard counties
  const remainingPool = [...remnants, ...standardCounties];
  const remainingDistrictsNeeded = numDistricts - urbanDistricts.length;

  let remainingDistricts = [];
  if (remainingDistrictsNeeded > 0 && remainingPool.length > 0) {
    remainingDistricts = seedDistricts(
      remainingPool,
      remainingDistrictsNeeded,
      adjacencyMap,
      countyPopMap,
      targetPopulation
    );
    // Adjust district IDs to continue from urban districts
    remainingDistricts.forEach(
      (d, i) => (d.id = urbanDistricts.length + i + 1)
    );

    growDistricts(
      remainingDistricts,
      remainingPool,
      adjacencyMap,
      countyPopMap,
      targetPopulation
    );
  }

  // Combine all districts
  const allDistricts = [...urbanDistricts, ...remainingDistricts];
  console.log(`✅ Phase 3 complete: ${allDistricts.length} total districts`);

  let finalBalancedDistricts = null;

  console.log(`\n🔧 PHASE 4: Final Refinement`);
  // PHASE 4: Final refinement with existing refineAndSplitDistricts
  if (adjacencyMap && allDistricts.length > 0) {
    console.log(`✅ Starting final refinement...`);
    finalBalancedDistricts = refineAndSplitDistricts(
      allDistricts,
      counties,
      adjacencyMap,
      targetPopulation
    );
  } else {
    console.log(
      `❌ Phase 4 SKIPPED - No adjacency map available or no districts created`
    );
  }

  console.log(`\n🏁 URBAN CARVE-OUT ALGORITHM COMPLETE`);
  allDistricts.forEach((d) => {
    const deviation = (
      ((d.population - targetPopulation) / targetPopulation) *
      100
    ).toFixed(1);
    const splitCounties = d.counties.filter((c) => c.splitInfo).length;
    console.log(
      `   District ${d.id}: ${
        d.counties.length
      } counties (${splitCounties} split), ${d.population.toLocaleString()} population (${
        deviation > 0 ? "+" : ""
      }${deviation}%)`
    );
  });

  return finalBalancedDistricts;
}

/**
 * PHASE 1 HELPER: Identify mega-counties and separate standard counties
 */
function identifyMegaCounties(counties, targetPopulation) {
  const megaCounties = [];
  const standardCounties = [];

  for (const county of counties) {
    if ((county.population || 0) > targetPopulation) {
      megaCounties.push(county);
    } else {
      standardCounties.push(county);
    }
  }

  megaCounties.sort((a, b) => (b.population || 0) - (a.population || 0));

  return { megaCounties, standardCounties };
}

/**
 * PHASE 2 HELPER: Create perfect urban districts from mega-counties
 */
function createUrbanDistricts(megaCounties, targetPopulation) {
  const urbanDistricts = [];
  const remnants = [];
  let districtId = 1;

  for (const megaCounty of megaCounties) {
    const countyPopulation = megaCounty.population || 0;
    const fullDistricts = Math.floor(countyPopulation / targetPopulation);

    if (fullDistricts > 0) {
      const districtPopulations = {};
      for (let i = 0; i < fullDistricts; i++) {
        districtPopulations[districtId + i] = targetPopulation;
      }

      const sharedSplitInfo = {
        totalPopulation: countyPopulation,
        districtPopulations: districtPopulations,
      };

      for (let i = 0; i < fullDistricts; i++) {
        urbanDistricts.push({
          id: districtId,
          counties: [
            {
              name: megaCounty.name,
              population: targetPopulation,
              splitInfo: sharedSplitInfo,
            },
          ],
          population: targetPopulation,
        });
        districtId++;
      }
    }

    const remainingPopulation = countyPopulation % targetPopulation;
    if (remainingPopulation > 0) {
      remnants.push({
        name: megaCounty.name,
        population: remainingPopulation,
        originalPopulation: countyPopulation,
        isRemnant: true,
      });
    }
  }

  return { urbanDistricts, remnants };
}

/**
 * PHASE 3A: Create N districts with geographically separate seed counties
 */
function seedDistricts(counties, numDistricts, adjacencyMap) {
  const districts = [];
  const usedCounties = new Set();
  const sortedCounties = [...counties].sort(
    (a, b) => (b.population || 0) - (a.population || 0)
  );

  for (let i = 0; i < numDistricts; i++) {
    let seedCounty = null;
    for (const county of sortedCounties) {
      if (
        !usedCounties.has(county.name) &&
        isSufficientlySeparated(county, districts, adjacencyMap)
      ) {
        seedCounty = county;
        break;
      }
    }

    if (!seedCounty) {
      seedCounty = sortedCounties.find((c) => !usedCounties.has(c.name));
    }

    if (seedCounty) {
      districts.push({
        id: i + 1,
        counties: [
          {
            name: seedCounty.name,
            population: seedCounty.population || 0,
            splitInfo: null,
          },
        ],
        population: seedCounty.population || 0,
      });
      usedCounties.add(seedCounty.name);
    }
  }

  return districts;
}

/**
 * Helper to check if a county is sufficiently separated from existing seeds
 */
function isSufficientlySeparated(county, existingDistricts, adjacencyMap) {
  if (!adjacencyMap || existingDistricts.length === 0) return true;
  const adjacentCounties = adjacencyMap[county.name] || [];
  for (const district of existingDistricts) {
    if (district.counties.some((dc) => adjacentCounties.includes(dc.name))) {
      return false;
    }
  }
  return true;
}

/**
 * Helper to find a contiguous island of unassigned counties.
 */
function findContiguousIsland(startCounty, available, adjacencyMap) {
  const island = new Set();
  const queue = [startCounty];
  const visited = new Set([startCounty]);

  while (queue.length > 0) {
    const current = queue.shift();
    island.add(current);

    (adjacencyMap[current] || []).forEach((neighbor) => {
      if (available.has(neighbor) && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  return Array.from(island);
}

/**
 * Get counties adjacent to a district that are still available
 */
function getAdjacentAvailableCounties(
  district,
  allCounties,
  assignedCounties,
  adjacencyMap
) {
  if (!adjacencyMap) return [];
  const adjacentCountyNames = new Set();
  district.counties.forEach((districtCounty) => {
    (adjacencyMap[districtCounty.name] || []).forEach((name) =>
      adjacentCountyNames.add(name)
    );
  });
  return allCounties.filter(
    (county) =>
      adjacentCountyNames.has(county.name) && !assignedCounties.has(county.name)
  );
}

/**
 * Multi-hop flow: Get counties within N hops of a district that are still available
 * @param {Object} district - District to expand from
 * @param {Array} allCounties - All counties in the state
 * @param {Set} assignedCounties - Set of already assigned county names
 * @param {Object} adjacencyMap - County adjacency mapping
 * @param {number} maxHops - Maximum number of hops to search (default 2)
 * @returns {Array} Available counties within N hops, with their hop distance and path
 */
function getMultiHopAvailableCounties(
  district,
  allCounties,
  assignedCounties,
  adjacencyMap,
  maxHops = 2
) {
  if (!adjacencyMap) return [];
  
  const availableCounties = [];
  const visited = new Set();
  const queue = [];
  
  // Initialize queue with district counties at hop 0
  district.counties.forEach((districtCounty) => {
    queue.push({
      name: districtCounty.name,
      hops: 0,
      path: [districtCounty.name]
    });
    visited.add(districtCounty.name);
  });
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.hops >= maxHops) continue;
    
    const neighbors = adjacencyMap[current.name] || [];
    for (const neighborName of neighbors) {
      if (visited.has(neighborName)) continue;
      
      visited.add(neighborName);
      const newPath = [...current.path, neighborName];
      const nextHop = current.hops + 1;
      
      // If this county is unassigned and not at hop 0, it's a candidate
      if (!assignedCounties.has(neighborName) && nextHop > 0) {
        const county = allCounties.find(c => c.name === neighborName);
        if (county) {
          availableCounties.push({
            ...county,
            hops: nextHop,
            path: newPath,
            bridgeCounties: newPath.slice(1, -1) // Counties that would need to be "bridged" through
          });
        }
      }
      
      // Continue expanding if within hop limit
      if (nextHop < maxHops) {
        queue.push({
          name: neighborName,
          hops: nextHop,
          path: newPath
        });
      }
    }
  }
  
  return availableCounties;
}

/**
 * PHASE 3B: MULTI-HOP UNIFIED GROWTH ALGORITHM (VERSION 3.0)
 * Enhanced with multi-hop flow for better district connectivity and optimization.
 */
function growDistricts(
  districts,
  allCounties,
  adjacencyMap,
  countyPopMap,
  targetPopulation
) {
  console.log(`🌱 Starting MULTI-HOP UNIFIED growth phase...`);
  const assignedCounties = new Set();
  districts.forEach((d) =>
    d.counties.forEach((c) => assignedCounties.add(c.name))
  );

  const unassignedCountyNames = new Set(allCounties.map((c) => c.name));
  assignedCounties.forEach((name) => unassignedCountyNames.delete(name));

  const maxIterations = allCounties.length * 2;
  let iterations = 0;
  let useMultiHop = false; // Start with single-hop, escalate to multi-hop

  while (unassignedCountyNames.size > 0 && iterations < maxIterations) {
    iterations++;
    let bestMove = null;
    let bestScore = -Infinity;

    // Alternate between single-hop and multi-hop strategies
    if (iterations % 10 === 0) {
      useMultiHop = !useMultiHop;
      console.log(`🔄 Switching to ${useMultiHop ? 'multi-hop' : 'single-hop'} mode at iteration ${iterations}`);
    }

    // "Best Fit" Mode with multi-hop capability
    for (const district of districts) {
      if (district.population > targetPopulation * 1.15) continue;
      
      let availableCounties;
      if (useMultiHop) {
        // Use multi-hop flow to find counties within 2-3 hops
        const multiHopCounties = getMultiHopAvailableCounties(
          district,
          allCounties,
          assignedCounties,
          adjacencyMap,
          3 // Allow up to 3 hops
        );
        availableCounties = multiHopCounties;
      } else {
        // Use traditional adjacent counties
        availableCounties = getAdjacentAvailableCounties(
          district,
          allCounties,
          assignedCounties,
          adjacencyMap
        );
      }

      for (const county of availableCounties) {
        // Enhanced scoring: consider population fit, hop distance, and bridge complexity
        let score = targetPopulation - district.population;
        
        if (useMultiHop && county.hops) {
          // Penalize longer hops but allow them when necessary
          score = score * (1 / (county.hops * 0.5 + 1));
          
          // Bonus for counties that don't require bridging through assigned counties
          const bridgeCounties = county.bridgeCounties || [];
          const validBridge = bridgeCounties.every(bridgeName => 
            !assignedCounties.has(bridgeName) || 
            districts.some(d => d.counties.some(c => c.name === bridgeName))
          );
          
          if (!validBridge) {
            score *= 0.1; // Heavy penalty for invalid bridges
          }
          
          console.log(`   🎯 Multi-hop candidate: ${county.name} (${county.hops} hops, score: ${score.toFixed(2)})`);
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = { district, county, isMultiHop: useMultiHop };
        }
      }
    }

    if (bestMove) {
      // Execute the best move (with multi-hop support)
      const { district, county, isMultiHop } = bestMove;
      
      if (isMultiHop && county.hops > 1) {
        console.log(`🌉 Executing multi-hop move: adding ${county.name} to District ${district.id} via ${county.hops} hops`);
        
        // Add all bridge counties in the path (except the first which is already in district)
        const pathCounties = county.path.slice(1); // Skip first county (already in district)
        
        for (const countyName of pathCounties) {
          const pathCounty = allCounties.find(c => c.name === countyName);
          if (pathCounty && !assignedCounties.has(countyName)) {
            district.counties.push({
              name: pathCounty.name,
              population: pathCounty.population || 0,
              splitInfo: null,
            });
            district.population += pathCounty.population || 0;
            assignedCounties.add(pathCounty.name);
            unassignedCountyNames.delete(pathCounty.name);
            
            console.log(`   🌁 Added bridge county: ${pathCounty.name} (${(pathCounty.population || 0).toLocaleString()} pop)`);
          }
        }
      } else {
        // Standard single-hop move
        district.counties.push({
          name: county.name,
          population: county.population || 0,
          splitInfo: null,
        });
        district.population += county.population || 0;
        assignedCounties.add(county.name);
        unassignedCountyNames.delete(county.name);
        
        console.log(`   ➕ Added adjacent county: ${county.name} to District ${district.id}`);
      }
    } else {
      // "Contiguous Cleanup" Mode: No best move found, so clean up all remaining islands.
      console.log(
        `⚠️ No ideal moves left. Switching to contiguous island cleanup for ${unassignedCountyNames.size} counties.`
      );

      while (unassignedCountyNames.size > 0) {
        const startCounty = unassignedCountyNames.values().next().value;
        const island = findContiguousIsland(
          startCounty,
          unassignedCountyNames,
          adjacencyMap
        );

        let bestDistrict = null;
        let minPopulation = Infinity;

        // Find the best adjacent district for the entire island
        for (const district of districts) {
          const isAdjacent = island.some((islandCounty) =>
            (adjacencyMap[islandCounty] || []).some((adjCounty) =>
              district.counties.some((dc) => dc.name === adjCounty)
            )
          );
          if (isAdjacent && district.population < minPopulation) {
            minPopulation = district.population;
            bestDistrict = district;
          }
        }

        if (!bestDistrict) {
          districts.sort((a, b) => a.population - b.population);
          bestDistrict = districts[0];
        }

        console.log(
          `   - Merging island of ${island.length} counties into District ${bestDistrict.id}`
        );
        const allCountiesMap = new Map(allCounties.map((c) => [c.name, c]));
        for (const countyName of island) {
          const countyData = allCountiesMap.get(countyName);
          bestDistrict.counties.push({
            name: countyName,
            population: countyData.population,
            splitInfo: null,
          });
          bestDistrict.population += countyData.population;
          unassignedCountyNames.delete(countyName);
        }
      }
    }
  }
  console.log(`✅ FINAL UNIFIED growth phase complete.`);
}

/**
 * PHASE 4: AGGRESSIVE REFINEMENT & SPLITTING (FINAL VERSION)
 * Includes a "Good Samaritan" clause to handle geographically trapped districts.
 */
function refineAndSplitDistricts(
  allDistricts,
  allCounties,
  adjacencyMap,
  targetPopulation
) {
  console.log(`🔧 STARTING FINAL REFINEMENT PHASE`);
  const urbanDistricts = [];
  const remainingDistricts = [];
  for (const district of allDistricts) {
    const hasUrbanSplit = district.counties.some(
      (county) =>
        county.splitInfo &&
        county.splitInfo.districtPopulations &&
        Object.keys(county.splitInfo.districtPopulations).length > 1 &&
        Math.abs(county.population - targetPopulation) < 1000
    );
    if (hasUrbanSplit) urbanDistricts.push(district);
    else remainingDistricts.push(district);
  }
  console.log(`🏙️ Urban districts (untouchable): ${urbanDistricts.length}`);
  console.log(
    `🌾 Remaining districts (refinement targets): ${remainingDistricts.length}`
  );

  let iteration = 0;
  const maxIterations = 100;
  let transfersMadeInCycle = true;
  const tolerance = targetPopulation * 0.01;

  while (transfersMadeInCycle && iteration < maxIterations) {
    iteration++;
    transfersMadeInCycle = false;
    console.log(`\n🔄 REFINEMENT ITERATION ${iteration}`);

    remainingDistricts.sort((a, b) => b.population - a.population);

    for (const overDistrict of remainingDistricts) {
      if (overDistrict.population <= targetPopulation + tolerance) continue;

      let adjacentNeighbors = remainingDistricts
        .filter(
          (d) =>
            d.id !== overDistrict.id &&
            areDistrictsAdjacent(overDistrict, d, adjacencyMap)
        )
        .sort((a, b) => a.population - b.population);

      let underDistrict = adjacentNeighbors.find(
        (d) => d.population < targetPopulation - tolerance
      );

      if (!underDistrict) {
        const balancedNeighbor = adjacentNeighbors.find(
          (d) => Math.abs(d.population - targetPopulation) < tolerance
        );
        if (balancedNeighbor) {
          console.log(
            `❗️ District ${overDistrict.id} is trapped. Using Good Samaritan: District ${balancedNeighbor.id}`
          );
          underDistrict = balancedNeighbor;
        }
      }

      if (!underDistrict) {
        console.log(
          `❌ District ${overDistrict.id} has no viable neighbors to transfer to.`
        );
        continue;
      }

      console.log(
        `🎯 Target pair: Over ${
          overDistrict.id
        } (${overDistrict.population.toLocaleString()}) → Under ${
          underDistrict.id
        } (${underDistrict.population.toLocaleString()})`
      );

      const idealShift =
        (overDistrict.population - underDistrict.population) / 2;
      let totalPopulationToShift = Math.min(
        overDistrict.population - targetPopulation,
        idealShift
      );

      if (totalPopulationToShift <= 0) continue;

      const borderCounties = findSharedBorderCounties(
        overDistrict,
        underDistrict,
        adjacencyMap
      ).sort((a, b) => b.population - a.population);

      let amountTransferredSoFar = 0;
      for (const borderCounty of borderCounties) {
        if (amountTransferredSoFar >= totalPopulationToShift) break;

        const remainingToShift =
          totalPopulationToShift - amountTransferredSoFar;
        const countyInOverDistrict = overDistrict.counties.find(
          (c) => c.name === borderCounty.name
        );
        if (!countyInOverDistrict) continue;

        let availableToTransfer = countyInOverDistrict.splitInfo
          ? countyInOverDistrict.splitInfo.districtPopulations[
              overDistrict.id
            ] || 0
          : countyInOverDistrict.population;

        const amountToTransferThisTime = Math.min(
          remainingToShift,
          availableToTransfer
        );

        if (amountToTransferThisTime > 1) {
          transferCountyPopulation(
            borderCounty.name,
            overDistrict,
            underDistrict,
            amountToTransferThisTime,
            allCounties
          );
          amountTransferredSoFar += amountToTransferThisTime;
          transfersMadeInCycle = true;
        }
      }
    }
  }

  const finalDistricts = [...urbanDistricts, ...remainingDistricts];
  finalDistricts.sort((a, b) => a.id - b.id);
  console.log(`\n🏁 FINAL REFINEMENT COMPLETE`);
  console.log(`📊 Final district populations:`);
  finalDistricts.forEach((d) => {
    const deviation = (
      ((d.population - targetPopulation) / targetPopulation) *
      100
    ).toFixed(1);
    console.log(
      `   District ${d.id}: ${d.population.toLocaleString()} (${
        deviation > 0 ? "+" : ""
      }${deviation}%)`
    );
  });
  allDistricts.length = 0;
  allDistricts.push(...finalDistricts);
  return finalDistricts;
}

/**
 * Check if two districts are adjacent
 */
function areDistrictsAdjacent(district1, district2, adjacencyMap) {
  if (!adjacencyMap) return false;
  for (const county1 of district1.counties) {
    const adjacent = adjacencyMap[county1.name] || [];
    for (const county2 of district2.counties) {
      if (adjacent.includes(county2.name)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Find counties on the shared border between two districts
 */
function findSharedBorderCounties(district1, district2, adjacencyMap) {
  const borderCounties = [];
  if (!adjacencyMap) return borderCounties;

  for (const county1 of district1.counties) {
    const adjacentCounties = adjacencyMap[county1.name] || [];
    for (const county2 of district2.counties) {
      if (adjacentCounties.includes(county2.name)) {
        const originalCounty = {
          name: county1.name,
          population: county1.population,
        };
        if (!borderCounties.find((c) => c.name === county1.name)) {
          borderCounties.push(originalCounty);
        }
      }
    }
  }
  return borderCounties.filter((county) => county.population > 0);
}

/**
 * Transfer population from one district to another by splitting a county
 */
function transferCountyPopulation(
  countyName,
  fromDistrict,
  toDistrict,
  amount,
  allCounties
) {
  const totalCountyPopulation =
    allCounties.find((c) => c.name === countyName)?.population || 0;
  if (totalCountyPopulation === 0 || amount <= 0) return;

  fromDistrict.population -= amount;
  toDistrict.population += amount;

  let fromCounty = fromDistrict.counties.find((c) => c.name === countyName);
  if (!fromCounty) return;

  if (!fromCounty.splitInfo) {
    fromCounty.splitInfo = {
      totalPopulation: totalCountyPopulation,
      districtPopulations: { [fromDistrict.id]: totalCountyPopulation },
    };
  }
  fromCounty.splitInfo.districtPopulations[fromDistrict.id] =
    (fromCounty.splitInfo.districtPopulations[fromDistrict.id] || 0) - amount;

  let toCounty = toDistrict.counties.find((c) => c.name === countyName);
  if (!toCounty) {
    toCounty = {
      name: countyName,
      population: totalCountyPopulation,
      splitInfo: {
        totalPopulation: totalCountyPopulation,
        districtPopulations: {},
      },
    };
    toDistrict.counties.push(toCounty);
  } else if (!toCounty.splitInfo) {
    toCounty.splitInfo = {
      totalPopulation: totalCountyPopulation,
      districtPopulations: {},
    };
  }

  toCounty.splitInfo.districtPopulations[toDistrict.id] =
    (toCounty.splitInfo.districtPopulations[toDistrict.id] || 0) + amount;

  const mergedSplitInfo = {
    totalPopulation: totalCountyPopulation,
    districtPopulations: {
      ...fromCounty.splitInfo.districtPopulations,
      ...toCounty.splitInfo.districtPopulations,
    },
  };
  fromCounty.splitInfo = mergedSplitInfo;
  toCounty.splitInfo = mergedSplitInfo;
}

/**
 * Get the number of congressional districts for a US state
 */
export function getCongressionalDistrictCount(stateId) {
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
