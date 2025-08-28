// County Graph System for Congressional District Generation
// Uses graph theory for better district boundary optimization

/**
 * Graph representation of counties and their relationships
 */
export class CountyGraph {
  constructor() {
    this.nodes = new Map(); // countyName -> node data
    this.edges = new Map(); // countyName -> Set of adjacent counties
    this.weights = new Map(); // "county1:county2" -> edge weight
  }

  /**
   * Add a county node to the graph
   */
  addNode(countyName, data = {}) {
    this.nodes.set(countyName, {
      name: countyName,
      population: data.population || 0,
      gdpPerCapita: data.gdpPerCapita || 0,
      politicalLeanings: data.politicalLeanings || [],
      coordinates: data.coordinates || null,
      ...data
    });
    
    if (!this.edges.has(countyName)) {
      this.edges.set(countyName, new Set());
    }
  }

  /**
   * Add an edge between two counties with optional weight
   */
  addEdge(county1, county2, weight = 1) {
    // Ensure both nodes exist
    if (!this.nodes.has(county1) || !this.nodes.has(county2)) {
      return false;
    }

    // Add bidirectional edges
    this.edges.get(county1).add(county2);
    this.edges.get(county2).add(county1);

    // Store edge weights
    const edgeKey1 = `${county1}:${county2}`;
    const edgeKey2 = `${county2}:${county1}`;
    this.weights.set(edgeKey1, weight);
    this.weights.set(edgeKey2, weight);

    return true;
  }

  /**
   * Get neighbors of a county
   */
  getNeighbors(countyName) {
    return Array.from(this.edges.get(countyName) || []);
  }

  /**
   * Get edge weight between two counties
   */
  getWeight(county1, county2) {
    const edgeKey = `${county1}:${county2}`;
    return this.weights.get(edgeKey) || 0;
  }

  /**
   * Calculate similarity-based edge weights
   */
  calculateSmartWeights() {
    for (const [county1, neighbors] of this.edges) {
      const node1 = this.nodes.get(county1);
      
      for (const county2 of neighbors) {
        const node2 = this.nodes.get(county2);
        
        // Calculate similarity score based on multiple factors
        let weight = 1.0;
        
        // Population similarity (normalize to 0-1, higher = more similar)
        const popRatio = Math.min(node1.population, node2.population) / 
                        Math.max(node1.population, node2.population);
        weight *= (0.7 + 0.3 * popRatio);

        // Economic similarity
        if (node1.gdpPerCapita && node2.gdpPerCapita) {
          const gdpRatio = Math.min(node1.gdpPerCapita, node2.gdpPerCapita) / 
                          Math.max(node1.gdpPerCapita, node2.gdpPerCapita);
          weight *= (0.7 + 0.3 * gdpRatio);
        }

        // Political similarity (if available)
        if (node1.politicalLeanings?.length && node2.politicalLeanings?.length) {
          const politicalSimilarity = this.calculatePoliticalSimilarity(
            node1.politicalLeanings, 
            node2.politicalLeanings
          );
          weight *= (0.5 + 0.5 * politicalSimilarity);
        }

        this.addEdge(county1, county2, weight);
      }
    }
  }

  /**
   * Calculate political similarity between two counties
   */
  calculatePoliticalSimilarity(leanings1, leanings2) {
    if (!leanings1.length || !leanings2.length) return 0.5;
    
    // Simple correlation based on top parties
    const party1 = leanings1[0]?.name || '';
    const party2 = leanings2[0]?.name || '';
    
    return party1 === party2 ? 1.0 : 0.3;
  }

  /**
   * Find connected components (islands detection)
   */
  findConnectedComponents() {
    const visited = new Set();
    const components = [];

    for (const countyName of this.nodes.keys()) {
      if (!visited.has(countyName)) {
        const component = this.dfsComponent(countyName, visited);
        components.push(component);
      }
    }

    return components;
  }

  /**
   * DFS helper for connected components
   */
  dfsComponent(startCounty, visited) {
    const component = [];
    const stack = [startCounty];

    while (stack.length > 0) {
      const county = stack.pop();
      if (visited.has(county)) continue;

      visited.add(county);
      component.push(county);

      const neighbors = this.getNeighbors(county);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    return component;
  }

  /**
   * Spectral clustering for natural district creation
   */
  spectralClustering(numClusters) {
    // This is a simplified version - in production you'd use a proper linear algebra library
    console.log(`🧮 Starting spectral clustering for ${numClusters} districts...`);
    
    // For now, use a graph-aware partitioning approach
    return this.balancedGraphPartition(numClusters);
  }

  /**
   * Balanced graph partitioning using modified Kernighan-Lin algorithm
   */
  balancedGraphPartition(numDistricts) {
    const totalPopulation = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.population, 0);
    const targetPopPerDistrict = totalPopulation / numDistricts;
    
    console.log(`🎯 Target population per district: ${targetPopPerDistrict.toLocaleString()}`);

    // Start with seed counties that are well-distributed
    const seeds = this.selectDistributedSeeds(numDistricts);
    const districts = seeds.map((seed, index) => ({
      id: index + 1,
      counties: [seed],
      population: this.nodes.get(seed).population,
      centroid: seed
    }));

    // Assign remaining counties to nearest district
    const assigned = new Set(seeds);
    const unassigned = Array.from(this.nodes.keys()).filter(c => !assigned.has(c));

    // Grow districts in balanced fashion
    while (unassigned.length > 0) {
      let bestMove = null;
      let bestScore = -Infinity;

      for (const district of districts) {
        if (district.population > targetPopPerDistrict * 1.2) continue;

        // Find unassigned counties adjacent to this district
        const adjacentCounties = this.getDistrictBoundaryCounties(district, assigned);
        
        for (const county of adjacentCounties) {
          if (!unassigned.includes(county)) continue;

          const countyPop = this.nodes.get(county).population;
          const newPopulation = district.population + countyPop;
          
          // Score based on population balance and graph connectivity
          let score = targetPopPerDistrict - Math.abs(newPopulation - targetPopPerDistrict);
          
          // Bonus for high connectivity (fewer cut edges)
          const connectivity = this.calculateConnectivity(county, district.counties);
          score += connectivity * 10000; // Weight connectivity highly

          if (score > bestScore) {
            bestScore = score;
            bestMove = { district, county, population: countyPop };
          }
        }
      }

      if (bestMove) {
        bestMove.district.counties.push(bestMove.county);
        bestMove.district.population += bestMove.population;
        assigned.add(bestMove.county);
        unassigned.splice(unassigned.indexOf(bestMove.county), 1);
      } else {
        // Fallback: assign to smallest district
        const smallestDistrict = districts.reduce((min, d) => 
          d.population < min.population ? d : min
        );
        const randomCounty = unassigned[0];
        smallestDistrict.counties.push(randomCounty);
        smallestDistrict.population += this.nodes.get(randomCounty).population;
        assigned.add(randomCounty);
        unassigned.splice(0, 1);
      }
    }

    console.log(`✅ Graph partitioning complete: ${districts.length} districts created`);
    return districts;
  }

  /**
   * Select well-distributed seed counties for initial district centers
   */
  selectDistributedSeeds(numSeeds) {
    const counties = Array.from(this.nodes.keys());
    if (numSeeds >= counties.length) return counties;

    // Start with highest population county
    const seeds = [];
    const sortedByPop = counties.sort((a, b) => 
      this.nodes.get(b).population - this.nodes.get(a).population
    );
    
    seeds.push(sortedByPop[0]);

    // Add remaining seeds that are maximally distant from existing seeds
    while (seeds.length < numSeeds) {
      let bestCounty = null;
      let maxMinDistance = -1;

      for (const candidate of counties) {
        if (seeds.includes(candidate)) continue;

        // Find minimum distance to existing seeds
        const minDistance = Math.min(...seeds.map(seed => 
          this.shortestPath(candidate, seed)?.length || Infinity
        ));

        if (minDistance > maxMinDistance) {
          maxMinDistance = minDistance;
          bestCounty = candidate;
        }
      }

      if (bestCounty) {
        seeds.push(bestCounty);
      } else {
        // Fallback: add random remaining county
        const remaining = counties.filter(c => !seeds.includes(c));
        if (remaining.length > 0) {
          seeds.push(remaining[0]);
        }
      }
    }

    return seeds;
  }

  /**
   * Get counties on the boundary of a district
   */
  getDistrictBoundaryCounties(district, assignedCounties) {
    const boundaryCounties = new Set();
    
    for (const districtCounty of district.counties) {
      const neighbors = this.getNeighbors(districtCounty);
      for (const neighbor of neighbors) {
        if (!assignedCounties.has(neighbor)) {
          boundaryCounties.add(neighbor);
        }
      }
    }
    
    return Array.from(boundaryCounties);
  }

  /**
   * Calculate connectivity score between a county and a district
   */
  calculateConnectivity(county, districtCounties) {
    const neighbors = this.getNeighbors(county);
    let connectionCount = 0;
    
    for (const neighbor of neighbors) {
      if (districtCounties.includes(neighbor)) {
        connectionCount++;
      }
    }
    
    return connectionCount;
  }

  /**
   * Find shortest path between two counties (BFS)
   */
  shortestPath(start, end) {
    if (start === end) return [start];
    
    const queue = [[start]];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (neighbor === end) {
          return [...path, neighbor];
        }
        
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    
    return null; // No path found
  }
}

/**
 * Build county graph from adjacency data and county information
 */
export function buildCountyGraph(counties, adjacencyMap) {
  const graph = new CountyGraph();
  
  // Add all counties as nodes
  for (const county of counties) {
    graph.addNode(county.name, {
      population: county.population || 0,
      gdpPerCapita: county.economicProfile?.gdpPerCapita || 0,
      politicalLeanings: county.politicalLandscape || [],
      gameId: county.id
    });
  }
  
  // Add edges based on adjacency map
  if (adjacencyMap) {
    for (const [countyName, neighbors] of Object.entries(adjacencyMap)) {
      if (graph.nodes.has(countyName)) {
        for (const neighbor of neighbors) {
          if (graph.nodes.has(neighbor)) {
            graph.addEdge(countyName, neighbor);
          }
        }
      }
    }
  }
  
  // Calculate intelligent edge weights
  graph.calculateSmartWeights();
  
  return graph;
}