import { generateCoalitions } from "../General Scripts/CoalitionSystem.js";
import { generateDetailedCountryData } from "../data/countriesData";
import { normalizePollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";
import { generateId } from "../utils/core";

/**
 * Generates coalitions for election simulation based on parties and demographics
 */
export const generateCoalitionsForSimulation = (parties) => {
  if (parties.length === 0) {
    return { coalitionSystems: null, coalitionsGenerated: false };
  }

  // Generate default demographics and electorate profile for simulation
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

  // Generate coalitions using the coalition system
  const coalitionSoA = generateCoalitions(
    defaultElectorateProfile,
    defaultDemographics,
    parties
  );

  return { 
    coalitionSystems: { "simulation_default": coalitionSoA }, 
    coalitionsGenerated: true 
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
 * Repoll candidates based on electorate changes
 */
export const repollCandidatesForElections = (candidatesByElection, electionInstances) => {
  const allElectionInstances = Object.values(electionInstances).flat();
  const updatedCandidatesByElection = { ...candidatesByElection };
  let totalCandidatesRepolled = 0;

  allElectionInstances.forEach(electionInstance => {
    const candidates = updatedCandidatesByElection[electionInstance.id] || [];
    if (candidates.length > 0) {
      // Repoll each candidate based on new electorate profile
      const repolledCandidates = candidates.map(candidate => ({
        ...candidate,
        polling: Math.max(1, Math.min(99, 
          // Base polling with some random variation
          candidate.polling + (Math.random() - 0.5) * 20
        ))
      }));

      // Normalize polling to 100%
      const totalPolling = repolledCandidates.reduce((sum, c) => sum + c.polling, 0);
      const normalizedCandidates = repolledCandidates.map(candidate => ({
        ...candidate,
        polling: (candidate.polling / totalPolling) * 100
      }));

      updatedCandidatesByElection[electionInstance.id] = normalizedCandidates;
      totalCandidatesRepolled += normalizedCandidates.length;
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

    const normalizedRaceCandidates = normalizePollingOptimized(
      raceCandidates,
      populationForSim
    );
    const candidatesMap = new Map(
      Array.from(normalizedRaceCandidates.values()).map((c) => [c.id, c])
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
  if (!coalitionsGenerated) missing.push("generate coalitions");

  return {
    isValid: missing.length === 0,
    missingItems: missing,
    message: missing.length > 0 ? `Please complete your setup: ${missing.join(", ")}.` : null
  };
};