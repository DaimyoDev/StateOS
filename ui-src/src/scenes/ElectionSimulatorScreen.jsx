import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGameStore from "../store";

import "./ElectionSimulatorScreen.css";

// Data imports
import { BASE_COUNTRIES_DATA } from "../data/countriesData";
import { IDEOLOGY_DEFINITIONS, BASE_IDEOLOGIES } from "../data/ideologiesData";
import { POLICY_QUESTIONS } from "../data/policyData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";

// Utility imports
import { generateNuancedColor } from "../utils/generalUtils";
import { normalizePollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";
import { getRandomElement, getRandomInt, generateId } from "../utils/core";
import {
  calculateIdeologyFromStances,
  generateFullAIPolitician,
  generateNewPartyName,
} from "../entities/personnel";

// Reusable UI components
import Modal from "../components/modals/Modal";
import { generateFullCityData } from "../entities/politicalEntities";

const getInitialSetupState = () => ({
  id: `setup-${generateId()}`,
  name: "New Election Scenario",
  selectedCountryId: "USA",
  selectedRegionId: "",
  selectedCityId: "",
  totalPopulation: 1000000,
  electionType: [],
  electionInstances: {}, // Track multiple instances of each election type
  electionYear: 2024,
  parties: [],
  candidatesByElection: {}, // New structure for candidates
  customCity: null,
  voterTurnout: 60,
  electorateIdeologyCenter: Object.fromEntries(
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map((axis) => [
      axis,
      0,
    ])
  ),
  electorateIdeologySpread: Object.fromEntries(
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map((axis) => [
      axis,
      1,
    ])
  ),
  electorateIssueStances: Object.fromEntries(
    POLICY_QUESTIONS.filter((q) => q.options?.length > 0).map((q) => [q.id, 0])
  ),
});

const ElectionSimulatorScreen = () => {
  const actions = useGameStore((state) => state.actions);
  const savedElectionSetups = useGameStore(
    (state) => state.savedElectionSetups || []
  );
  const savedPoliticians = useGameStore(
    (state) => state.savedPoliticians || []
  );

  const [currentSetup, setCurrentSetup] = useState(getInitialSetupState());
  const [activeSetupTab, setActiveSetupTab] = useState("general");
  const [activeElectionInCandidateTab, setActiveElectionInCandidateTab] =
    useState("");

  // Modals State
  const [isPartyEditorModalOpen, setIsPartyEditorModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [isDeleteSetupModalOpen, setIsDeleteSetupModalOpen] = useState(false);
  const [setupToDelete, setSetupToDelete] = useState(null);
  const [isAddPoliticianModalOpen, setIsAddPoliticianModalOpen] =
    useState(false);
  const [isCityCreatorModalOpen, setIsCityCreatorModalOpen] = useState(false);
  const [isEditCandidateModalOpen, setIsEditCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [showResultsDirectly, setShowResultsDirectly] = useState(true);
  const [isSimulationChoiceModalOpen, setIsSimulationChoiceModalOpen] = useState(false);
  const [pendingSimulationData, setPendingSimulationData] = useState(null);

  // Restore setup data when returning from Election Night
  useEffect(() => {
    const savedSetup = actions.getElectionSimulatorSetup?.();
    if (savedSetup && savedSetup.id !== currentSetup.id) {
      setCurrentSetup(savedSetup);
      // Set the active tab based on what was previously selected
      if (savedSetup.activeSetupTab) {
        setActiveSetupTab(savedSetup.activeSetupTab);
      }
      if (savedSetup.activeElectionInCandidateTab) {
        setActiveElectionInCandidateTab(savedSetup.activeElectionInCandidateTab);
      }
    }
  }, [actions, currentSetup.id]);

  // Derived state for dynamic dropdowns
  const selectedCountry = useMemo(
    () =>
      BASE_COUNTRIES_DATA.find(
        (c) => c.id === currentSetup.selectedCountryId
      ) || null,
    [currentSetup.selectedCountryId]
  );
  const availableRegions = useMemo(
    () => selectedCountry?.regions || selectedCountry?.provinces || [],
    [selectedCountry]
  );
  const availableCities = useMemo(() => {
    if (!currentSetup.selectedRegionId || !selectedCountry) return [];
    const region = availableRegions.find(
      (r) => r.id === currentSetup.selectedRegionId
    );
    return (
      region?.cities?.map((city) => ({
        id: city.id,
        name: city.name || `City ${city.id}`,
      })) || []
    );
  }, [currentSetup.selectedRegionId, selectedCountry, availableRegions]);
  const availableElectionTypes = useMemo(
    () => ELECTION_TYPES_BY_COUNTRY[currentSetup.selectedCountryId] || [],
    [currentSetup.selectedCountryId]
  );

  const selectedElectionTypesDetails = useMemo(() => {
    const allInstances = [];
    
    // Cache the region name to avoid repeated lookups
    const selectedRegion = availableRegions.find(r => r.id === currentSetup.selectedRegionId);
    const regionName = selectedRegion?.name || "Region";
    const countryName = selectedCountry?.name || "Country";
    const cityName = currentSetup.customCity?.name || "City";
    
    Object.values(currentSetup.electionInstances).forEach((instances) => {
      instances.forEach((instance) => {
        const electionType = availableElectionTypes.find(
          (t) => t.id === instance.electionTypeId
        );
        if (electionType) {
          // Create better display names based on election type and region
          let baseDisplayName = electionType.displayName || electionType.name || electionType.id;
          
          // Generate office name using template if available
          if (electionType.officeNameTemplate) {
            baseDisplayName = electionType.officeNameTemplate
              .replace(/{stateName}|{regionName}|{prefectureName}|{provinceName}/g, regionName)
              .replace(/{countryName}/g, countryName)
              .replace(/{cityName}|{cityNameOrMunicipalityName}/g, cityName)
              .replace(/{.*?}/g, "")
              .trim();
          }
          
          // Add district number for congress/state elections
          let finalDisplayName = baseDisplayName;
          if (instance.districtNumber) {
            finalDisplayName = `${baseDisplayName} - District ${instance.districtNumber}`;
          } else if (instances.length > 1) {
            finalDisplayName = `${baseDisplayName} - ${instance.instanceNumber}`;
          }
          
          allInstances.push({
            ...electionType,
            id: instance.id,
            instanceId: instance.id,
            originalId: instance.electionTypeId,
            districtNumber: instance.districtNumber,
            displayName: finalDisplayName,
          });
        }
      });
    });
    return allInstances;
  }, [
    currentSetup.electionInstances, 
    availableElectionTypes, 
    availableRegions, 
    currentSetup.selectedRegionId, 
    selectedCountry?.name, 
    currentSetup.customCity?.name
  ]);

  const updateCurrentSetup = useCallback((field, value) => {
    setCurrentSetup((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addElectionInstance = useCallback(
    (electionTypeId) => {
      const electionType = availableElectionTypes.find(
        (t) => t.id === electionTypeId
      );
      if (!electionType) return;

      const currentInstances =
        currentSetup.electionInstances[electionTypeId] || [];
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
      const selectedRegion = availableRegions.find(r => r.id === currentSetup.selectedRegionId);
      const regionName = selectedRegion?.name || "Region";
      
      let baseDisplayName = electionType.displayName || electionType.name || electionTypeId;
      
      if (electionType.officeNameTemplate) {
        baseDisplayName = electionType.officeNameTemplate
          .replace(/{stateName}|{regionName}|{prefectureName}|{provinceName}/g, regionName)
          .replace(/{countryName}/g, selectedCountry?.name || "Country")
          .replace(/{cityName}|{cityNameOrMunicipalityName}/g, currentSetup.customCity?.name || "City")
          .replace(/{.*?}/g, "")
          .trim();
      }

      const newInstance = {
        id: `${electionTypeId}_instance_${instanceNumber}`,
        electionTypeId: electionTypeId,
        instanceNumber: instanceNumber,
        districtNumber: districtNumber,
        displayName: baseDisplayName,
      };

      const newInstances = [...currentInstances, newInstance];
      const newElectionInstances = {
        ...currentSetup.electionInstances,
        [electionTypeId]: newInstances,
      };

      // Update the electionType array to include all instances
      const allInstanceIds = Object.values(newElectionInstances)
        .flat()
        .map((instance) => instance.id);

      setCurrentSetup((prev) => ({
        ...prev,
        electionInstances: newElectionInstances,
        electionType: allInstanceIds,
      }));
    },
    [availableElectionTypes, currentSetup.electionInstances, availableRegions, currentSetup.selectedRegionId, selectedCountry, currentSetup.customCity]
  );

  const removeElectionInstance = useCallback(
    (electionTypeId, instanceId) => {
      const currentInstances =
        currentSetup.electionInstances[electionTypeId] || [];
      const filteredInstances = currentInstances.filter(
        (instance) => instance.id !== instanceId
      );

      let newElectionInstances;
      if (filteredInstances.length === 0) {
        // Remove the entire election type if no instances left
        newElectionInstances = { ...currentSetup.electionInstances };
        delete newElectionInstances[electionTypeId];
      } else {
        newElectionInstances = {
          ...currentSetup.electionInstances,
          [electionTypeId]: filteredInstances,
        };
      }

      // Update the electionType array and remove candidates for this instance
      const allInstanceIds = Object.values(newElectionInstances)
        .flat()
        .map((instance) => instance.id);
      const newCandidatesByElection = { ...currentSetup.candidatesByElection };
      delete newCandidatesByElection[instanceId];

      setCurrentSetup((prev) => ({
        ...prev,
        electionInstances: newElectionInstances,
        electionType: allInstanceIds,
        candidatesByElection: newCandidatesByElection,
      }));
    },
    [currentSetup.electionInstances, currentSetup.candidatesByElection]
  );

  useEffect(() => {
    // Get all valid instance IDs
    const allValidInstanceIds = Object.values(currentSetup.electionInstances).flat().map(instance => instance.id);
    
    // Only update activeElectionInCandidateTab if it's not valid
    if (allValidInstanceIds.length > 0 && !allValidInstanceIds.includes(activeElectionInCandidateTab)) {
      setActiveElectionInCandidateTab(allValidInstanceIds[0] || "");
    } else if (allValidInstanceIds.length === 0 && activeElectionInCandidateTab) {
      setActiveElectionInCandidateTab("");
    }
  }, [
    currentSetup.electionInstances,
    activeElectionInCandidateTab,
  ]);

  const handleSetupFieldChange = (e) => {
    const { name, value, type, options } = e.target;

    if (name === "electionType" && e.target.multiple) {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      updateCurrentSetup(name, selectedValues);
      return;
    }

    if (name === "selectedCityId" && value === "_CREATE_NEW_") {
      setIsCityCreatorModalOpen(true);
      updateCurrentSetup("selectedCityId", "");
      return;
    }

    const finalValue = type === "number" ? parseInt(value, 10) || 0 : value;
    updateCurrentSetup(name, finalValue);

    if (name === "selectedCountryId") {
      updateCurrentSetup("selectedRegionId", "");
      updateCurrentSetup("selectedCityId", "");
      updateCurrentSetup("customCity", null);
      updateCurrentSetup("electionType", []);
      updateCurrentSetup("electionInstances", {});
      updateCurrentSetup("candidatesByElection", {});
    }
    if (name === "selectedRegionId") {
      updateCurrentSetup("selectedCityId", "");
      updateCurrentSetup("customCity", null);
    }
    if (name === "selectedCityId" && value !== "") {
      updateCurrentSetup("customCity", null);
    }
  };

  const handleCreateCity = (cityName) => {
    if (!cityName) {
      actions.addToast({
        id: `city-name-req-${Date.now()}`,
        message: "City name cannot be empty.",
        type: "error",
      });
      return;
    }
    const newCity = generateFullCityData({
      playerDefinedCityName: cityName,
      countryId: currentSetup.selectedCountryId,
      regionId: currentSetup.selectedRegionId,
      populationHint: currentSetup.totalPopulation,
    });
    updateCurrentSetup("customCity", newCity);
    updateCurrentSetup("selectedCityId", "");
    setIsCityCreatorModalOpen(false);
  };

  const handleNewSetup = () => {
    setCurrentSetup(getInitialSetupState());
    setActiveElectionInCandidateTab("");
  };

  const handleSaveSetup = () => {
    const existingSetup = savedElectionSetups.find(
      (s) => s.id === currentSetup.id
    );
    if (existingSetup) actions.updateElectionSetup(currentSetup);
    else actions.saveElectionSetup(currentSetup);
    actions.addToast({
      id: `save-success-${Date.now()}`,
      message: `Scenario "${currentSetup.name}" saved!`,
      type: "success",
    });
  };

  const handleLoadSetup = (setupId) => {
    const setupToLoad = savedElectionSetups.find((s) => s.id === setupId);
    if (setupToLoad) {
      setCurrentSetup({
        ...getInitialSetupState(),
        ...setupToLoad,
        electionType: Array.isArray(setupToLoad.electionType)
          ? setupToLoad.electionType
          : [],
        electionInstances: setupToLoad.electionInstances || {},
        candidatesByElection: setupToLoad.candidatesByElection || {},
      });
      setActiveElectionInCandidateTab(setupToLoad.electionType?.[0] || "");
    }
  };

  const openDeleteSetupModal = (setup) => {
    setSetupToDelete(setup);
    setIsDeleteSetupModalOpen(true);
  };

  const confirmDeleteSetup = () => {
    if (setupToDelete) {
      actions.deleteElectionSetup(setupToDelete.id);
      if (currentSetup.id === setupToDelete.id) handleNewSetup();
    }
    setIsDeleteSetupModalOpen(false);
    setSetupToDelete(null);
  };

  const handleRandomlyGenerateParties = useCallback(() => {
    const numParties = getRandomInt(3, 7);
    const generated = Array.from({ length: numParties }, () => {
      const randomBaseIdeology = getRandomElement([...BASE_IDEOLOGIES]);
      if (!randomBaseIdeology) return null;
      const fullIdeologyDefinition =
        IDEOLOGY_DEFINITIONS[randomBaseIdeology.id];
      const newPartyName = generateNewPartyName(
        randomBaseIdeology.name,
        currentSetup.selectedCountryId
      );
      const partyColor = generateNuancedColor(randomBaseIdeology.color);
      const ideologyScores = { ...(fullIdeologyDefinition?.idealPoint || {}) };
      const { ideologyName } = calculateIdeologyFromStances(
        null,
        POLICY_QUESTIONS,
        IDEOLOGY_DEFINITIONS,
        ideologyScores
      );
      return {
        id: `party-${generateId()}`,
        name: newPartyName,
        color: partyColor,
        ideology: ideologyName,
        ideologyId: randomBaseIdeology.id,
        ideologyScores,
        popularity: getRandomInt(5, 45),
      };
    }).filter(Boolean);
    updateCurrentSetup("parties", generated);
    updateCurrentSetup("candidatesByElection", {});
  }, [updateCurrentSetup]);

  const handleCreateNewParty = () => {
    setEditingParty(null);
    setIsPartyEditorModalOpen(true);
  };

  const handleEditParty = (party) => {
    setEditingParty(party);
    setIsPartyEditorModalOpen(true);
  };

  const handleDeleteParty = (partyId) => {
    updateCurrentSetup(
      "parties",
      currentSetup.parties.filter((p) => p.id !== partyId)
    );
    const newCandidatesByElection = { ...currentSetup.candidatesByElection };
    Object.keys(newCandidatesByElection).forEach((electionId) => {
      newCandidatesByElection[electionId] = newCandidatesByElection[
        electionId
      ].filter((c) => c.partyId !== partyId);
    });
    updateCurrentSetup("candidatesByElection", newCandidatesByElection);
  };

  const handleSaveParty = (partyData) => {
    const { ideologyName, scores } = calculateIdeologyFromStances(
      null,
      POLICY_QUESTIONS,
      IDEOLOGY_DEFINITIONS,
      partyData.ideologyScores
    );
    const [foundId] = Object.entries(IDEOLOGY_DEFINITIONS).find(
      ([, def]) => def.name === ideologyName
    ) || ["centrist"];
    const updatedParty = {
      ...partyData,
      ideology: ideologyName,
      ideologyId: foundId,
      ideologyScores: scores,
    };
    const newParties = partyData.id
      ? currentSetup.parties.map((p) =>
          p.id === partyData.id ? updatedParty : p
        )
      : [
          ...currentSetup.parties,
          { ...updatedParty, id: `party-${generateId()}` },
        ];
    updateCurrentSetup("parties", newParties);
    setIsPartyEditorModalOpen(false);
    setEditingParty(null);
  };

  const handleRandomizeElectorateProfile = useCallback(() => {
    const newCenter = {};
    const newSpread = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      newCenter[axis] = parseFloat((getRandomInt(-40, 40) / 10).toFixed(1));
      newSpread[axis] = parseFloat((getRandomInt(1, 40) / 10).toFixed(1));
    });
    const newIssueStances = {};
    POLICY_QUESTIONS.forEach((question) => {
      if (question.options?.length > 0) {
        newIssueStances[question.id] = getRandomInt(-100, 100);
      }
    });
    updateCurrentSetup("electorateIdeologyCenter", newCenter);
    updateCurrentSetup("electorateIdeologySpread", newSpread);
    updateCurrentSetup("electorateIssueStances", newIssueStances);
  }, [updateCurrentSetup]);

  const handleRepollCandidates = useCallback(() => {
    // Get all candidates across all elections
    const allElectionInstances = Object.values(currentSetup.electionInstances).flat();
    const updatedCandidatesByElection = { ...currentSetup.candidatesByElection };
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

    if (totalCandidatesRepolled > 0) {
      updateCurrentSetup("candidatesByElection", updatedCandidatesByElection);
      actions.addToast({
        id: `repoll-complete-${Date.now()}`,
        message: `Repolled ${totalCandidatesRepolled} candidates based on new electorate profile!`,
        type: "success",
      });
    } else {
      actions.addToast({
        id: `no-candidates-${Date.now()}`,
        message: "No candidates found to repoll. Add candidates to races first.",
        type: "warning",
      });
    }
  }, [currentSetup, updateCurrentSetup, actions]);

  const handleGenerateCandidatesForRace = useCallback(() => {
    if (!activeElectionInCandidateTab || currentSetup.parties.length === 0) {
      actions.addToast({
        id: `gen-cand-fail-${Date.now()}`,
        message: "Select a race and create parties first.",
        type: "error",
      });
      return;
    }
    const newCandidates = currentSetup.parties
      .map((party) => {
        const pol = generateFullAIPolitician(
          currentSetup.selectedCountryId,
          currentSetup.parties,
          { forcePartyId: party.id }
        );
        return pol
          ? {
              ...pol,
              name: `${pol.firstName} ${pol.lastName}`,
              baseScore: pol.polling,
            }
          : null;
      })
      .filter(Boolean);

    const normalizedCandidatesMap = normalizePollingOptimized(
      newCandidates,
      currentSetup.totalPopulation
    );
    const finalCandidates = Array.from(normalizedCandidatesMap.values());

    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: finalCandidates,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeElectionInCandidateTab,
    currentSetup.selectedCountryId,
    currentSetup.parties,
    currentSetup.totalPopulation,
    actions,
    updateCurrentSetup,
  ]);

  const handleAddPoliticiansToRace = (politiciansToAdd) => {
    if (!activeElectionInCandidateTab) {
      actions.addToast({
        id: `add-cand-fail-${Date.now()}`,
        message: "Select a race to add candidates to.",
        type: "error",
      });
      return;
    }
    const currentRaceCandidates =
      currentSetup.candidatesByElection[activeElectionInCandidateTab] || [];
    const newCandidatesForRace = [...currentRaceCandidates];
    politiciansToAdd.forEach((p) => {
      if (!newCandidatesForRace.some((c) => c.id === p.id)) {
        const party = currentSetup.parties.find(
          (party) => party.id === p.partyId
        );
        newCandidatesForRace.push({
          ...p,
          name: `${p.firstName} ${p.lastName}`,
          partyName: party?.name || "Independent",
          partyColor: party?.color || "#888888",
          baseScore: 5,
        });
      }
    });
    const normalized = normalizePollingOptimized(
      newCandidatesForRace,
      currentSetup.totalPopulation
    );
    const finalCandidates = Array.from(normalized.values());

    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: finalCandidates,
    });
    setIsAddPoliticianModalOpen(false);
  };

  const handleRemoveCandidateFromRace = (candidateId) => {
    if (!activeElectionInCandidateTab) return;
    const currentRaceCandidates =
      currentSetup.candidatesByElection[activeElectionInCandidateTab] || [];
    const updatedCandidates = currentRaceCandidates.filter(
      (c) => c.id !== candidateId
    );
    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: updatedCandidates,
    });
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setIsEditCandidateModalOpen(true);
  };

  const handleSaveEditedCandidate = (updatedCandidate) => {
    if (!activeElectionInCandidateTab) return;
    
    const currentRaceCandidates =
      currentSetup.candidatesByElection[activeElectionInCandidateTab] || [];
    const updatedCandidates = currentRaceCandidates.map((c) =>
      c.id === updatedCandidate.id ? updatedCandidate : c
    );
    
    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: updatedCandidates,
    });
    
    setIsEditCandidateModalOpen(false);
    setEditingCandidate(null);
  };

  const handleSimulateDirectly = () => {
    if (!pendingSimulationData) return;
    
    // TODO: Process the election data through automated simulation logic
    // For now, we'll use the polling data as results
    const simulatedResults = pendingSimulationData.map(election => ({
      ...election,
      outcome: { 
        status: "completed",
        results: Array.from(election.candidates.values()).map(candidate => ({
          candidateId: candidate.id,
          votes: Math.round((candidate.polling / 100) * election.totalEligibleVoters * (election.voterTurnoutPercentage / 100)),
          percentage: candidate.polling
        }))
      }
    }));

    setSimulationResults(simulatedResults);
    setIsSimulationChoiceModalOpen(false);
    setPendingSimulationData(null);
    
    actions.addToast({
      id: `simulation-complete-${Date.now()}`,
      message: `Direct simulation completed for ${simulatedResults.length} election(s)!`,
      type: "success",
    });
  };

  const handleGoToElectionNight = () => {
    if (!pendingSimulationData) return;
    
    // Store current setup with tab states for preservation
    const setupWithTabStates = {
      ...currentSetup,
      activeSetupTab,
      activeElectionInCandidateTab,
    };
    actions.setElectionSimulatorSetup(setupWithTabStates);
    
    actions.setIsSimulationMode(true);
    actions.setSimulatedElections(pendingSimulationData);
    setIsSimulationChoiceModalOpen(false);
    setPendingSimulationData(null);
    actions.navigateTo("ElectionNightScreen");
  };

  const runSimulation = useCallback(() => {
    const allElectionInstances = Object.values(
      currentSetup.electionInstances
    ).flat();
    if (
      allElectionInstances.length === 0 ||
      currentSetup.parties.length === 0
    ) {
      actions.addToast({
        id: `incomplete-setup-${Date.now()}`,
        message: "Please select election types and configure parties.",
        type: "error",
      });
      return;
    }

    let electionCity;
    if (currentSetup.customCity) {
      electionCity = currentSetup.customCity;
    } else if (currentSetup.selectedCityId) {
      const region = availableRegions.find(
        (r) => r.id === currentSetup.selectedRegionId
      );
      electionCity = region?.cities?.find(
        (c) => c.id === currentSetup.selectedCityId
      );
    }

    if (!electionCity) {
      // For now, allow simulation to run without a specific city for all election types
      // This provides more flexibility and removes the city requirement that was blocking simulations
      electionCity = {
        name: currentSetup.selectedRegionId ? 
          (availableRegions.find((r) => r.id === currentSetup.selectedRegionId)?.name || "Region") : 
          "Default Location",
        population: currentSetup.totalPopulation,
      };
    }

    const populationForSim =
      electionCity.population || currentSetup.totalPopulation;
    const allSimulations = [];
    const electionRegionName =
      availableRegions.find((r) => r.id === currentSetup.selectedRegionId)
        ?.name || "Region";
    const electionCountryName = selectedCountry?.name || "Country";

    for (const electionInstance of allElectionInstances) {
      const selectedElectionTypeDetails = availableElectionTypes.find(
        (type) => type.id === electionInstance.electionTypeId
      );
      if (!selectedElectionTypeDetails) continue;

      const raceCandidates =
        currentSetup.candidatesByElection[electionInstance.id] || [];
      if (raceCandidates.length === 0) {
        actions.addToast({
          id: `no-cands-${electionInstance.id}`,
          message: `Skipping "${electionInstance.displayName}" race: No candidates assigned.`,
          type: "warning",
        });
        continue;
      }

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

      const simulatedElection = {
        id: `sim_election_${generateId()}`,
        officeName,
        electoralSystem: selectedElectionTypeDetails.electoralSystem,
        electionDate: { year: currentSetup.electionYear, month: 11, day: 5 },
        candidates: candidatesMap,
        totalEligibleVoters: populationForSim,
        voterTurnoutPercentage: currentSetup.voterTurnout,
        numberOfSeatsToFill: selectedElectionTypeDetails.seatsToFill || 1,
        outcome: { status: "upcoming" },
      };
      allSimulations.push(simulatedElection);
    }

    if (allSimulations.length === 0) {
      actions.addToast({
        id: `no-valid-elections-${Date.now()}`,
        message:
          "No valid elections were created. Check your candidate assignments.",
        type: "error",
      });
      return;
    }

    // Store the simulation data and show choice modal
    setPendingSimulationData(allSimulations);
    setIsSimulationChoiceModalOpen(true);
  }, [
    currentSetup,
    actions,
    availableElectionTypes,
    availableRegions,
    selectedCountry,
  ]);

  return (
    <div className="election-simulator-screen-container">
      <div className="election-simulator-header">
        <div className="header-content">
          <h1>Election Simulator</h1>
          <p className="subtitle">Create, configure, and simulate democratic elections with unprecedented detail</p>
        </div>
      </div>
      
      <div className="quick-actions-bar">
        <div className="scenario-info">
          <div className="scenario-title">{currentSetup.name}</div>
          <div className="scenario-meta">
            {currentSetup.selectedCountryId} • {currentSetup.electionYear} • {currentSetup.parties.length} parties
          </div>
        </div>
        <div className="quick-buttons">
          <button 
            className="action-button" 
            onClick={() => actions.navigateTo("MainMenu")}
          >
            Main Menu
          </button>
        </div>
      </div>

      <div className="simulator-layout">
        <div className="simulation-setup-panel">
          <div className="setup-tabs-header">
            <button
              className={`tab-button ${
                activeSetupTab === "general" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("general")}
            >
              General
            </button>
            <button
              className={`tab-button ${
                activeSetupTab === "parties" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("parties")}
            >
              Parties
            </button>
            <button
              className={`tab-button ${
                activeSetupTab === "candidates" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("candidates")}
            >
              Candidates
            </button>
            <button
              className={`tab-button ${
                activeSetupTab === "electorate" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("electorate")}
            >
              Electorate
            </button>
          </div>

          <div className="setup-tabs-content">
            {activeSetupTab === "general" && (
              <div className="tab-pane general-setup-tab">
                <h3>Configuration for "{currentSetup.name}"</h3>
                <div className="config-grid">
                  <div className="config-group">
                    <label>Scenario Name:</label>
                    <input
                      name="name"
                      type="text"
                      value={currentSetup.name}
                      onChange={handleSetupFieldChange}
                    />
                  </div>

                  <div className="config-group">
                    <label>Country:</label>
                    <select
                      name="selectedCountryId"
                      value={currentSetup.selectedCountryId}
                      onChange={handleSetupFieldChange}
                    >
                      {BASE_COUNTRIES_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.flag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="config-group">
                    <label>Region/State:</label>
                    <select
                      name="selectedRegionId"
                      value={currentSetup.selectedRegionId}
                      onChange={handleSetupFieldChange}
                      disabled={!availableRegions.length}
                    >
                      <option value="">Select Region</option>
                      {availableRegions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="config-group">
                    <label>City:</label>
                    <select
                      name="selectedCityId"
                      value={currentSetup.selectedCityId}
                      onChange={handleSetupFieldChange}
                      disabled={!!currentSetup.customCity}
                    >
                      <option value="">Select City</option>
                      <option value="_CREATE_NEW_">
                        -- Create New City --
                      </option>
                      {availableCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {currentSetup.customCity && (
                      <span className="custom-city-display">
                        Using custom city:{" "}
                        <strong>{currentSetup.customCity.name}</strong>
                      </span>
                    )}
                  </div>
                  <div className="config-group">
                    <label>Population:</label>
                    <input
                      name="totalPopulation"
                      type="number"
                      value={currentSetup.totalPopulation}
                      onChange={handleSetupFieldChange}
                      min="1"
                    />
                  </div>
                  <div className="config-group">
                    <label>Election Types:</label>
                    <div className="election-types-manager">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addElectionInstance(e.target.value);
                            e.target.value = "";
                          }
                        }}
                        disabled={!availableElectionTypes.length}
                      >
                        <option value="">-- Add Election Type --</option>
                        {availableElectionTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.displayName || t.id}
                          </option>
                        ))}
                      </select>

                      {/* Display current election instances */}
                      <div className="election-instances-list">
                        {Object.entries(currentSetup.electionInstances).map(
                          ([electionTypeId, instances]) => {
                            const electionType = availableElectionTypes.find(
                              (t) => t.id === electionTypeId
                            );
                            return (
                              <div
                                key={electionTypeId}
                                className="election-type-group"
                              >
                                <h5>
                                  {electionType?.displayName || electionTypeId}
                                </h5>
                                {instances.map((instance, index) => {
                                  const electionType = availableElectionTypes.find(t => t.id === electionTypeId);
                                  const selectedRegion = availableRegions.find(r => r.id === currentSetup.selectedRegionId);
                                  const regionName = selectedRegion?.name || "Region";
                                  
                                  // Create display name using the same logic as selectedElectionTypesDetails
                                  let baseDisplayName = electionType?.displayName || electionType?.name || electionTypeId;
                                  
                                  if (electionType?.officeNameTemplate) {
                                    baseDisplayName = electionType.officeNameTemplate
                                      .replace(/{stateName}|{regionName}|{prefectureName}|{provinceName}/g, regionName)
                                      .replace(/{countryName}/g, selectedCountry?.name || "Country")
                                      .replace(/{cityName}|{cityNameOrMunicipalityName}/g, currentSetup.customCity?.name || "City")
                                      .replace(/{.*?}/g, "")
                                      .trim();
                                  }
                                  
                                  let finalDisplayName = baseDisplayName;
                                  if (instance.districtNumber) {
                                    finalDisplayName = `${baseDisplayName} - District ${instance.districtNumber}`;
                                  } else if (instances.length > 1) {
                                    finalDisplayName = `${baseDisplayName} - ${instance.instanceNumber}`;
                                  }
                                  
                                  return (
                                    <div
                                      key={instance.id}
                                      className="election-instance"
                                    >
                                      <span>{finalDisplayName}</span>
                                      <button
                                        className="button-delete small-button"
                                        onClick={() =>
                                          removeElectionInstance(
                                            electionTypeId,
                                            instance.id
                                          )
                                        }
                                      >
                                        X
                                      </button>
                                    </div>
                                  );
                                })}
                                <button
                                  className="action-button small-button"
                                  onClick={() =>
                                    addElectionInstance(electionTypeId)
                                  }
                                >
                                  Add Another
                                </button>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="config-group">
                    <label>Year:</label>
                    <input
                      name="electionYear"
                      type="number"
                      value={currentSetup.electionYear}
                      onChange={handleSetupFieldChange}
                      min="1900"
                      max="3000"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeSetupTab === "parties" && (
              <div className="tab-pane parties-tab">
                <h3>Party Configuration</h3>
                {currentSetup.parties.length > 0 ? (
                  <ul className="party-list">
                    {currentSetup.parties.map((p) => (
                      <li key={p.id} className="party-list-item">
                        <div className="party-bar-background">
                          <div
                            className="party-bar-foreground"
                            style={{
                              width: `${p.popularity || 10}%`,
                              backgroundColor: p.color,
                            }}
                          ></div>
                          <div className="party-bar-content">
                            <span className="party-bar-text">
                              {p.name} ({p.ideology})
                            </span>
                            <div className="party-actions">
                              <button
                                className="action-button small-button"
                                onClick={() => handleEditParty(p)}
                              >
                                Edit
                              </button>
                              <button
                                className="button-delete small-button"
                                onClick={() => handleDeleteParty(p.id)}
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="help-text">
                    No parties configured. Generate or create parties to begin.
                  </p>
                )}
                <div className="party-controls">
                  <button
                    className="action-button"
                    onClick={handleRandomlyGenerateParties}
                  >
                    Generate Parties
                  </button>
                  <button
                    className="action-button"
                    onClick={handleCreateNewParty}
                  >
                    Create Party
                  </button>
                </div>
              </div>
            )}
            {activeSetupTab === "candidates" && (
              <div className="tab-pane candidates-tab">
                <h3>Candidate Assignment</h3>
                <div className="candidate-race-selector">
                  <label>Manage Candidates For Race:</label>
                  <select
                    value={activeElectionInCandidateTab}
                    onChange={(e) =>
                      setActiveElectionInCandidateTab(e.target.value)
                    }
                    disabled={selectedElectionTypesDetails.length === 0}
                  >
                    <option value="" disabled>
                      -- Select a Race --
                    </option>
                    {selectedElectionTypesDetails.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.displayName || t.id}
                      </option>
                    ))}
                  </select>
                </div>

                {activeElectionInCandidateTab ? (
                  <>
                    {(
                      currentSetup.candidatesByElection[
                        activeElectionInCandidateTab
                      ] || []
                    ).length > 0 ? (
                      <ul className="candidate-list">
                        {(
                          currentSetup.candidatesByElection[
                            activeElectionInCandidateTab
                          ] || []
                        ).map((c) => (
                          <li key={c.id} className="candidate-list-item">
                            <span
                              className="candidate-party-swatch"
                              style={{
                                backgroundColor: c.partyColor || "#888",
                              }}
                            ></span>
                            <span className="candidate-name">{c.name}</span>
                            <span className="candidate-party-name">
                              {c.partyName}
                            </span>
                            <span className="candidate-poll-score">
                              Poll: {c.polling?.toFixed(1)}%
                            </span>
                            <div className="candidate-actions">
                              <button
                                className="action-button small-button"
                                onClick={() => handleEditCandidate(c)}
                              >
                                Edit
                              </button>
                              <button
                                className="button-delete small-button"
                                onClick={() =>
                                  handleRemoveCandidateFromRace(c.id)
                                }
                              >
                                X
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="help-text">
                        No candidates assigned to this race yet.
                      </p>
                    )}
                    <div className="candidate-controls">
                      <button
                        className="action-button"
                        onClick={handleGenerateCandidatesForRace}
                        disabled={currentSetup.parties.length === 0}
                      >
                        Generate AI Candidates
                      </button>
                      <button
                        className="action-button"
                        onClick={() => setIsAddPoliticianModalOpen(true)}
                        disabled={currentSetup.parties.length === 0}
                      >
                        Add Saved Politician
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="help-text">
                    Select one or more election types in the "General" tab, then
                    select a race from the dropdown above to assign candidates.
                  </p>
                )}
              </div>
            )}
            {activeSetupTab === "electorate" && (
              <div className="tab-pane electorate-tab">
                <h3>Electorate Composition</h3>
                <div className="config-group">
                  <label>Expected Voter Turnout (%):</label>
                  <input
                    type="range"
                    name="voterTurnout"
                    min="0"
                    max="100"
                    value={currentSetup.voterTurnout}
                    onChange={handleSetupFieldChange}
                  />
                  <span>{currentSetup.voterTurnout}%</span>
                </div>
                <h5>Ideological Stances:</h5>
                {Object.keys(currentSetup.electorateIdeologyCenter).map(
                  (axis) => (
                    <div
                      key={axis}
                      className="config-group ideology-slider-group"
                    >
                      <label>{axis.replace(/_/g, " ")}:</label>
                      <div className="slider-with-values">
                        <span>Center:</span>
                        <input
                          type="range"
                          min="-4"
                          max="4"
                          step="0.1"
                          value={currentSetup.electorateIdeologyCenter[axis]}
                          onChange={(e) =>
                            setCurrentSetup((p) => ({
                              ...p,
                              electorateIdeologyCenter: {
                                ...p.electorateIdeologyCenter,
                                [axis]: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                        <span>
                          {currentSetup.electorateIdeologyCenter[axis]?.toFixed(
                            1
                          )}
                        </span>
                      </div>
                      <div className="slider-with-values">
                        <span>Spread:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="4"
                          step="0.1"
                          value={currentSetup.electorateIdeologySpread[axis]}
                          onChange={(e) =>
                            setCurrentSetup((p) => ({
                              ...p,
                              electorateIdeologySpread: {
                                ...p.electorateIdeologySpread,
                                [axis]: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                        <span>
                          {currentSetup.electorateIdeologySpread[axis]?.toFixed(
                            1
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
                <div className="electorate-controls">
                  <button
                    className="action-button"
                    onClick={handleRandomizeElectorateProfile}
                  >
                    Randomize Profile
                  </button>
                  <button
                    className="action-button"
                    onClick={handleRepollCandidates}
                  >
                    Repoll Candidates
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="setup-action-buttons">
            <button
              className="action-button primary"
              onClick={runSimulation}
            >
              Run Simulation
            </button>
            <button className="action-button secondary" onClick={handleNewSetup}>
              Reset Form
            </button>
          </div>
        </div>
        
        <div className="scenario-management-buttons">
          <button 
            className="action-button" 
            onClick={() => setIsScenarioModalOpen(true)}
          >
            Load Scenario
          </button>
          <button 
            className="action-button" 
            onClick={handleSaveSetup}
            disabled={!currentSetup.name}
          >
            Save Scenario
          </button>
        </div>
      </div>

      <div className="simulation-results-panel">
        <div className="results-header">
          <h3>
            Simulation Results
            {simulationResults && (
              <span className="results-count">({simulationResults.length} election{simulationResults.length !== 1 ? 's' : ''})</span>
            )}
          </h3>
          {simulationResults && (
            <div className="results-actions">
              <button 
                className="action-button"
                onClick={() => {
                  actions.setIsSimulationMode(true);
                  actions.setSimulatedElections(simulationResults);
                  actions.navigateTo("ElectionNightScreen");
                }}
              >
                View Election Night
              </button>
              <button 
                className="action-button secondary"
                onClick={() => setSimulationResults(null)}
              >
                Clear Results
              </button>
            </div>
          )}
        </div>
        
        {simulationResults ? (
          <SimulationResultsContent results={simulationResults} />
        ) : (
          <div className="empty-results">
            <h4>No Results Yet</h4>
            <p>Configure your election scenario and click "Run Simulation" to see the results.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCityCreatorModalOpen}
        onClose={() => setIsCityCreatorModalOpen(false)}
        title="Create a New City"
      >
        <CityCreatorModalContent
          onSave={handleCreateCity}
          onCancel={() => setIsCityCreatorModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isPartyEditorModalOpen}
        onClose={() => setIsPartyEditorModalOpen(false)}
        title={editingParty ? `Edit ${editingParty.name}` : "Create New Party"}
      >
        <PartyEditorModalContent
          party={editingParty}
          onSave={handleSaveParty}
          onCancel={() => setIsPartyEditorModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isAddPoliticianModalOpen}
        onClose={() => setIsAddPoliticianModalOpen(false)}
        title="Add Saved Politician to Race"
      >
        <AddPoliticianModalContent
          savedPoliticians={savedPoliticians}
          currentCandidates={
            currentSetup.candidatesByElection[activeElectionInCandidateTab] ||
            []
          }
          parties={currentSetup.parties}
          onAdd={handleAddPoliticiansToRace}
        />
      </Modal>
      <Modal
        isOpen={isDeleteSetupModalOpen}
        onClose={() => setIsDeleteSetupModalOpen(false)}
        title="Confirm Deletion"
        primaryActionText="Delete Scenario"
        onPrimaryAction={confirmDeleteSetup}
        secondaryActionText="Cancel"
        onSecondaryAction={() => setIsDeleteSetupModalOpen(false)}
        primaryActionType="delete"
      >
        <p>
          Are you sure you want to permanently delete the scenario:{" "}
          <strong>{setupToDelete?.name}</strong>?
        </p>
      </Modal>
      <Modal
        isOpen={isEditCandidateModalOpen}
        onClose={() => {
          setIsEditCandidateModalOpen(false);
          setEditingCandidate(null);
        }}
        title="Edit Candidate"
        primaryActionText="Save Changes"
        onPrimaryAction={() => {}}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsEditCandidateModalOpen(false);
          setEditingCandidate(null);
        }}
      >
        {editingCandidate && (
          <EditCandidateModalContent
            candidate={editingCandidate}
            parties={currentSetup.parties}
            onSave={handleSaveEditedCandidate}
            onCancel={() => {
              setIsEditCandidateModalOpen(false);
              setEditingCandidate(null);
            }}
          />
        )}
      </Modal>
      <Modal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        title="Load Scenario"
      >
        <ScenarioManagementModalContent
          savedElectionSetups={savedElectionSetups}
          onLoad={(setupId) => {
            handleLoadSetup(setupId);
            setIsScenarioModalOpen(false);
          }}
          onDelete={(setup) => {
            setIsScenarioModalOpen(false);
            openDeleteSetupModal(setup);
          }}
          onCancel={() => setIsScenarioModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isSimulationChoiceModalOpen}
        onClose={() => {
          setIsSimulationChoiceModalOpen(false);
          setPendingSimulationData(null);
        }}
        title="Choose Simulation Mode"
      >
        <SimulationChoiceModalContent
          electionCount={pendingSimulationData?.length || 0}
          onSimulateDirectly={handleSimulateDirectly}
          onGoToElectionNight={handleGoToElectionNight}
          onCancel={() => {
            setIsSimulationChoiceModalOpen(false);
            setPendingSimulationData(null);
          }}
        />
      </Modal>
    </div>
  );
};

// --- MODAL COMPONENTS ---

const CityCreatorModalContent = ({ onSave, onCancel }) => {
  const [cityName, setCityName] = useState("");

  const handleSave = () => {
    onSave(cityName);
  };

  return (
    <div className="city-creator-modal-content">
      <div className="form-group">
        <label>New City Name:</label>
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="e.g., Springfield"
        />
      </div>
      <div className="modal-actions-override">
        <button className="action-button" onClick={handleSave}>
          Create and Use City
        </button>
        <button className="menu-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const PartyEditorModalContent = ({ party, onSave, onCancel }) => {
  const [name, setName] = useState(party?.name || "");
  const [color, setColor] = useState(party?.color || "#000000");
  const [popularity, setPopularity] = useState(party?.popularity || 10);
  const [ideologyScores, setIdeologyScores] = useState(
    party?.ideologyScores || {}
  );

  useEffect(() => {
    const initialIdeology = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      initialIdeology[axis] =
        party?.ideologyScores?.[axis] !== undefined
          ? party.ideologyScores[axis]
          : 0;
    });
    setIdeologyScores(initialIdeology);
  }, [party]);

  const handleSubmit = () =>
    onSave({ id: party?.id, name, color, popularity, ideologyScores });

  return (
    <div className="party-editor-modal-content">
      <div className="form-group">
        <label>Party Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Party Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Base Popularity (%):</label>
        <input
          type="number"
          min="0"
          max="100"
          value={popularity}
          onChange={(e) => setPopularity(parseInt(e.target.value) || 0)}
        />
      </div>
      <h5>Ideological Stances:</h5>
      {Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map((axis) => (
        <div key={axis} className="config-group ideology-slider-group">
          <label>{axis.replace(/_/g, " ")}:</label>
          <input
            type="range"
            min="-4"
            max="4"
            step="0.1"
            value={ideologyScores[axis] || 0}
            onChange={(e) =>
              setIdeologyScores((prev) => ({
                ...prev,
                [axis]: parseFloat(e.target.value),
              }))
            }
          />
          <span>{ideologyScores[axis]?.toFixed(1)}</span>
        </div>
      ))}
      <div className="modal-actions-override">
        <button className="action-button" onClick={handleSubmit}>
          Save Party
        </button>
        <button className="menu-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const AddPoliticianModalContent = ({
  savedPoliticians,
  currentCandidates,
  parties,
  onAdd,
}) => {
  const [selectedPoliticians, setSelectedPoliticians] = useState({});

  const availablePoliticians = useMemo(() => {
    const currentCandidateIds = new Set(
      (currentCandidates || []).map((c) => c.id)
    );
    
    // Convert SoA structure to array of politician objects
    const politiciansArray = [];
    if (savedPoliticians && savedPoliticians.base) {
      for (const [id, baseData] of savedPoliticians.base) {
        const politician = {
          ...baseData,
          attributes: savedPoliticians.attributes?.get(id) || {},
          policyStances: savedPoliticians.policyStances?.get(id) || {},
          ideologyScores: savedPoliticians.ideologyScores?.get(id) || {},
          finances: savedPoliticians.finances?.get(id) || {},
          background: savedPoliticians.background?.get(id) || {},
          state: savedPoliticians.state?.get(id) || {},
          campaign: savedPoliticians.campaign?.get(id) || {},
        };
        politiciansArray.push(politician);
      }
    }
    
    return politiciansArray.filter((p) => !currentCandidateIds.has(p.id));
  }, [savedPoliticians, currentCandidates]);

  const handleSelectionChange = (politicianId, partyId) => {
    setSelectedPoliticians((prev) => ({ ...prev, [politicianId]: partyId }));
  };

  const handleAdd = () => {
    const toAdd = availablePoliticians
      .filter((p) => selectedPoliticians[p.id])
      .map((p) => ({ ...p, partyId: selectedPoliticians[p.id] }));
    onAdd(toAdd);
  };

  return (
    <div className="add-politician-modal">
      {availablePoliticians.length > 0 ? (
        <ul className="politician-selection-list">
          {availablePoliticians.map((p) => (
            <li key={p.id} className="politician-selection-item">
              <span>
                {p.firstName} {p.lastName} ({p.calculatedIdeology})
              </span>
              <select
                onChange={(e) => handleSelectionChange(p.id, e.target.value)}
                value={selectedPoliticians[p.id] || ""}
              >
                <option value="" disabled>
                  Assign to Party
                </option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      ) : (
        <p>No more saved politicians to add.</p>
      )}
      <div className="modal-actions-override">
        <button
          className="action-button"
          onClick={handleAdd}
          disabled={Object.keys(selectedPoliticians).length === 0}
        >
          Add Selected
        </button>
      </div>
    </div>
  );
};

const SimulationChoiceModalContent = ({ electionCount, onSimulateDirectly, onGoToElectionNight, onCancel }) => {
  return (
    <div className="simulation-choice-modal">
      <div className="choice-description">
        <p>You are about to simulate <strong>{electionCount} election{electionCount !== 1 ? 's' : ''}</strong>.</p>
        <p>Choose how you want to proceed:</p>
      </div>
      
      <div className="choice-options">
        <div className="choice-option">
          <button 
            className="choice-button direct-simulation"
            onClick={onSimulateDirectly}
          >
            <div className="choice-icon"></div>
            <div className="choice-content">
              <h4>Simulate Directly</h4>
              <p>Run automated simulation and see results immediately</p>
              <ul>
                <li>Fast and efficient</li>
                <li>Automated vote calculation</li>
                <li>Instant results display</li>
              </ul>
            </div>
          </button>
        </div>
        
        <div className="choice-option">
          <button 
            className="choice-button election-night"
            onClick={onGoToElectionNight}
          >
            <div className="choice-icon"></div>
            <div className="choice-content">
              <h4>Election Night Experience</h4>
              <p>Go through the full election night simulation</p>
              <ul>
                <li>Interactive experience</li>
                <li>Real-time vote updates</li>
                <li>Detailed analytics</li>
              </ul>
            </div>
          </button>
        </div>
      </div>
      
      <div className="modal-actions-override">
        <button className="action-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const SimulationResultsContent = ({ results }) => {
  return (
    <div className="simulation-results-content">
      {results.map((election, index) => (
        <div key={election.id || index} className="election-result">
          <div className="election-info">
            <h4>{election.officeName}</h4>
            <div className="election-details">
              <span>{election.electionDate.year}</span>
              <span>{election.totalEligibleVoters?.toLocaleString()} eligible voters</span>
              <span>{election.voterTurnoutPercentage}% turnout</span>
              <span>{election.numberOfSeatsToFill} seat{election.numberOfSeatsToFill !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="candidates-results">
            <h5>Candidates</h5>
            <div className="candidate-cards">
              {Array.from(election.candidates.values()).map((candidate) => (
                <div 
                  key={candidate.id} 
                  className="candidate-result-card"
                  style={{ borderLeftColor: candidate.partyColor }}
                >
                  <div className="candidate-info">
                    <span className="candidate-name">{candidate.name}</span>
                    <span className="candidate-party">{candidate.partyName}</span>
                  </div>
                  <div className="candidate-stats">
                    {election.outcome?.results ? (
                      // Show actual results if available
                      (() => {
                        const result = election.outcome.results.find(r => r.candidateId === candidate.id);
                        return result ? (
                          <>
                            <div className="stat">
                              <span className="stat-label">Votes:</span>
                              <span className="stat-value">{result.votes?.toLocaleString() || 0}</span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">Percentage:</span>
                              <span className="stat-value">{result.percentage?.toFixed(1)}%</span>
                            </div>
                          </>
                        ) : (
                          <div className="stat">
                            <span className="stat-label">No results</span>
                            <span className="stat-value">-</span>
                          </div>
                        );
                      })()
                    ) : (
                      // Show polling data if no results yet
                      <>
                        <div className="stat">
                          <span className="stat-label">Polling:</span>
                          <span className="stat-value">{candidate.polling?.toFixed(1)}%</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Attributes:</span>
                          <span className="stat-value">
                            C:{candidate.attributes?.charisma || 50} 
                            I:{candidate.attributes?.integrity || 50}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="election-system-info">
            <span className="system-badge">{election.electoralSystem}</span>
            <span className="status-badge">{election.outcome?.status || 'Ready'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ScenarioManagementModalContent = ({ savedElectionSetups, onLoad, onDelete, onCancel }) => {
  return (
    <div className="scenario-management-modal">
      {savedElectionSetups.length > 0 ? (
        <ul className="scenario-selection-list">
          {savedElectionSetups.map((setup) => (
            <li key={setup.id} className="scenario-selection-item">
              <div className="scenario-info">
                <span className="scenario-name">{setup.name}</span>
                <span className="scenario-details">
                  {setup.selectedCountryId} • {setup.electionYear} • {setup.parties?.length || 0} parties
                </span>
              </div>
              <div className="scenario-actions">
                <button
                  className="action-button"
                  onClick={() => onLoad(setup.id)}
                >
                  Load
                </button>
                <button
                  className="button-delete"
                  onClick={() => onDelete(setup)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-scenarios">
          <p>No saved scenarios found.</p>
          <p>Create and save a scenario first to see it here.</p>
        </div>
      )}
      <div className="modal-actions-override">
        <button className="action-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const EditCandidateModalContent = ({ candidate, parties, onSave, onCancel }) => {
  const [editedCandidate, setEditedCandidate] = useState({
    ...candidate,
    attributes: candidate.attributes || {
      charisma: 50,
      integrity: 50,
      intelligence: 50,
      negotiation: 50,
      oratory: 50,
      fundraising: 50,
    },
  });

  const handleFieldChange = (field, value) => {
    setEditedCandidate((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // Update name when first or last name changes
      if (field === 'firstName' || field === 'lastName') {
        updated.name = `${updated.firstName || ''} ${updated.lastName || ''}`.trim();
      }
      
      return updated;
    });
  };

  const handleAttributeChange = (attribute, value) => {
    setEditedCandidate((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attribute]: parseInt(value) || 0,
      },
    }));
  };

  const handlePartyChange = (partyId) => {
    const selectedParty = parties.find((p) => p.id === partyId);
    setEditedCandidate((prev) => ({
      ...prev,
      partyId: partyId,
      partyName: selectedParty?.name || "Independent",
      partyColor: selectedParty?.color || "#888888",
    }));
  };

  const handleSave = () => {
    onSave(editedCandidate);
  };

  return (
    <div className="edit-candidate-modal">
      <div className="form-grid">
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={editedCandidate.firstName || ""}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={editedCandidate.lastName || ""}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            min="18"
            max="100"
            value={editedCandidate.age || 35}
            onChange={(e) => handleFieldChange("age", parseInt(e.target.value) || 35)}
          />
        </div>
        <div className="form-group">
          <label>Sex:</label>
          <select
            value={editedCandidate.sex || "male"}
            onChange={(e) => handleFieldChange("sex", e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
          </select>
        </div>
        <div className="form-group">
          <label>Party:</label>
          <select
            value={editedCandidate.partyId || ""}
            onChange={(e) => handlePartyChange(e.target.value)}
          >
            <option value="">Independent</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="attributes-section">
        <h4>Attributes</h4>
        <div className="attributes-grid">
          {Object.entries(editedCandidate.attributes || {}).map(([attribute, value]) => (
            <div key={attribute} className="attribute-group">
              <label>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}:</label>
              <div className="slider-with-value">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value || 50}
                  onChange={(e) => handleAttributeChange(attribute, e.target.value)}
                />
                <span>{value || 50}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="modal-actions-override">
        <button className="action-button" onClick={handleSave}>
          Save Changes
        </button>
        <button className="action-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ElectionSimulatorScreen;
