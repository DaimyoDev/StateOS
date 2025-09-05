import { generateCoalitions } from "../General Scripts/CoalitionSystem.js";
import { generateDetailedCountryData } from "../data/countriesData";
import { normalizePollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";
import { generateId } from "../utils/core";
import { repollCandidatesWithCoalitions } from "./candidateManager.js";
import { generateHierarchicalCoalitions, getCoalitionsForElection } from "./hierarchicalCoalitions.js";

/**
 * Generates coalitions for election simulation based on parties and demographics
 * Now supports hierarchical coalition generation for different election levels
 */
export const generateCoalitionsForSimulation = (parties, electionSetup = null) => {
  if (parties.length === 0) {
    return { coalitionSystems: null, coalitionsGenerated: false };
  }

  // Require elections to be selected before generating coalitions
  if (!electionSetup || !electionSetup.electionInstances) {
    return { coalitionSystems: null, coalitionsGenerated: false };
  }

  const allInstances = Object.values(electionSetup.electionInstances).flat();
  if (allInstances.length === 0) {
    return { coalitionSystems: null, coalitionsGenerated: false };
  }

  // Generate hierarchical coalitions based on selected elections
  const hierarchicalCoalitions = generateHierarchicalCoalitions(electionSetup, allInstances);
    
    // Also generate default for backwards compatibility
    const defaultDemographics = {
      ageDistribution: { young: 25, adult: 50, senior: 25 },
      urbanization: 60,
      educationLevel: { highSchool: 30, college: 45, graduate: 25 },
      incomeLevel: { low: 25, middle: 50, high: 25 },
      occupation: { whiteCollar: 40, blueCollar: 35, service: 25 }
    };

    const defaultElectorateProfile = {
      economic_policy: 0,
      social_policy: 0,
      foreign_policy: 0,
      environmental_policy: 0,
      civil_liberties: 0
    };

    const defaultCoalitionSoA = generateCoalitions(
      defaultElectorateProfile,
      defaultDemographics,
      parties
    );
    
    return {
      coalitionSystems: { 
        "simulation_default": defaultCoalitionSoA,
        "hierarchical": hierarchicalCoalitions
      },
      coalitionsGenerated: true,
      isHierarchical: true
    };
};

/**
 * Creates election instances with proper naming and district handling
 */
export const createElectionInstance = (electionTypeId, availableElectionTypes, currentInstances, selectedCountry, selectedRegion, customCity) => {
  const electionType = availableElectionTypes.find(t => t.id === electionTypeId);
  if (!electionType) return null;

  const instanceNumber = currentInstances.length + 1;

  // Generate district number only for House/Senate elections (not Governor, etc.)
  let districtNumber = null;
  if (
    electionType.id.includes("house") ||
    electionType.id.includes("senate") ||
    electionType.officeName?.toLowerCase().includes("house") ||
    electionType.officeName?.toLowerCase().includes("senate")
  ) {
    districtNumber = instanceNumber;
  }

  // Create a better base display name using office name template
  const regionName = selectedRegion?.name || "Region";
  let baseDisplayName = electionType.displayName || electionType.name || electionTypeId;
  
  if (electionType.officeNameTemplate) {
    baseDisplayName = electionType.officeNameTemplate
      .replace(/{stateName}|{regionName}|{prefectureName}|{provinceName}/g, regionName)
      .replace(/{countryName}/g, selectedCountry?.name || "Country")
      .replace(/{cityName}|{cityNameOrMunicipalityName}/g, customCity?.name || "City")
      .replace(/{.*?}/g, "")
      .trim();
  }

  return {
    id: `${electionTypeId}_instance_${instanceNumber}`,
    electionTypeId: electionTypeId,
    instanceNumber: instanceNumber,
    districtNumber: districtNumber,
    displayName: baseDisplayName,
  };
};

/**
 * Repoll candidates based on coalition changes
 */
export const repollCandidatesForElections = (candidatesByElection, electionInstances, coalitionSoA, totalPopulation) => {
  const allElectionInstances = Object.values(electionInstances).flat();
  const updatedCandidatesByElection = { ...candidatesByElection };
  let totalCandidatesRepolled = 0;

  allElectionInstances.forEach(electionInstance => {
    const candidates = updatedCandidatesByElection[electionInstance.id] || [];
    if (candidates.length > 0) {
      // Use coalition-based repolling if coalitions are available
      let repolledCandidates;
      if (coalitionSoA && coalitionSoA.base && coalitionSoA.base.size > 0) {
        // Use coalition-based repolling
        repolledCandidates = repollCandidatesWithCoalitions(candidates, coalitionSoA, totalPopulation);
      } else {
        // Fallback to simple random variation + normalization
        const modifiedCandidates = candidates.map(candidate => ({
          ...candidate,
          polling: Math.max(1, Math.min(99, 
            // Base polling with some random variation
            candidate.polling + (Math.random() - 0.5) * 20
          ))
        }));

        // Normalize polling to 100%
        const totalPolling = modifiedCandidates.reduce((sum, c) => sum + c.polling, 0);
        repolledCandidates = modifiedCandidates.map(candidate => ({
          ...candidate,
          polling: (candidate.polling / totalPolling) * 100
        }));
      }

      updatedCandidatesByElection[electionInstance.id] = repolledCandidates;
      totalCandidatesRepolled += repolledCandidates.length;
    }
  });

  return { updatedCandidatesByElection, totalCandidatesRepolled };
};

/**
 * Creates simulated elections from setup configuration
 */
export const createSimulatedElections = (setupConfig) => {
  const {
    electionInstances,
    parties,
    candidatesByElection,
    customCity,
    selectedCityId,
    selectedRegionId,
    totalPopulation,
    voterTurnout,
    electionYear,
    coalitionSystems,
    availableElectionTypes,
    availableRegions,
    selectedCountry
  } = setupConfig;

  const allElectionInstances = Object.values(electionInstances).flat();
  
  let electionCity;
  if (customCity) {
    electionCity = customCity;
  } else if (selectedCityId) {
    const region = availableRegions.find(r => r.id === selectedRegionId);
    electionCity = region?.cities?.find(c => c.id === selectedCityId);
  }

  if (!electionCity) {
    electionCity = {
      name: selectedRegionId ? 
        (availableRegions.find((r) => r.id === selectedRegionId)?.name || "Region") : 
        "Default Location",
      population: totalPopulation,
    };
  }

  const populationForSim = electionCity.population || totalPopulation;
  const allSimulations = [];
  const electionRegionName = availableRegions.find((r) => r.id === selectedRegionId)?.name || "Region";
  const electionCountryName = selectedCountry?.name || "Country";

  for (const electionInstance of allElectionInstances) {
    const selectedElectionTypeDetails = availableElectionTypes.find(
      (type) => type.id === electionInstance.electionTypeId
    );
    if (!selectedElectionTypeDetails) continue;

    const raceCandidates = candidatesByElection[electionInstance.id] || [];
    if (raceCandidates.length === 0) continue;

    // Don't re-normalize if candidates already have coalition-based polling
    // Use the existing candidates directly to preserve coalition-based polling
    const candidatesMap = new Map(
      raceCandidates.map((c) => [c.id, c])
    );

    let officeName = selectedElectionTypeDetails.officeNameTemplate
      .replace(/{cityName}|{cityNameOrMunicipalityName}/g, electionCity.name)
      .replace(
        /{stateName}|{regionName}|{prefectureName}|{provinceName}/g,
        electionRegionName
      )
      .replace("{countryName}", electionCountryName)
      .replace(/{.*?}/g, "")
      .trim();

    // Add district number only for House/Senate elections
    if (electionInstance.districtNumber && selectedElectionTypeDetails && (
      selectedElectionTypeDetails.id.includes("house") ||
      selectedElectionTypeDetails.id.includes("senate") ||
      selectedElectionTypeDetails.officeName?.toLowerCase().includes("house") ||
      selectedElectionTypeDetails.officeName?.toLowerCase().includes("senate")
    )) {
      officeName += ` - District ${electionInstance.districtNumber}`;
    }

    // For Electoral College elections, generate detailed country data with counties
    let countryDataForElection = selectedCountry;
    if (selectedElectionTypeDetails.electoralSystem === "ElectoralCollege") {
      countryDataForElection = generateDetailedCountryData(selectedCountry);
    }

    const simulatedElection = {
      id: `sim_election_${generateId()}`,
      officeName,
      electoralSystem: selectedElectionTypeDetails.electoralSystem,
      electionDate: { year: electionYear, month: 11, day: 5 },
      candidates: candidatesMap,
      totalEligibleVoters: populationForSim,
      voterTurnoutPercentage: voterTurnout,
      numberOfSeatsToFill: selectedElectionTypeDetails.seatsToFill || 1,
      outcome: { status: "upcoming" },
      // Add coalition data for realistic turnout calculations
      coalitionSoA: coalitionSystems?.simulation_default,
      // Add Electoral College specific data if needed
      ...(selectedElectionTypeDetails.electoralSystem === "ElectoralCollege" && {
        isElectoralCollege: true,
        countryData: countryDataForElection,
        regionId: selectedRegionId,
      }),
    };
    allSimulations.push(simulatedElection);
  }

  return allSimulations;
};

/**
 * Validates setup configuration before simulation
 */
export const validateSimulationSetup = (setupConfig) => {
  const {
    electionInstances,
    parties,
    coalitionsGenerated
  } = setupConfig;

  const allElectionInstances = Object.values(electionInstances).flat();
  const missing = [];

  if (allElectionInstances.length === 0) missing.push("select election types");
  if (parties.length === 0) missing.push("configure parties");
  if (allElectionInstances.length > 0 && !coalitionsGenerated) missing.push("generate coalitions");

  return {
    isValid: missing.length === 0,
    missingItems: missing,
    message: missing.length > 0 ? `Please complete your setup: ${missing.join(", ")}.` : null
  };
};