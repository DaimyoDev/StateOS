import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGameStore from "../store"; //
import "./ElectionSimulatorScreen.css"; //

// Data imports
import { COUNTRIES_DATA } from "../data/countriesData"; //
import {
  IDEOLOGY_DEFINITIONS,
  BASE_IDEOLOGIES,
  GENERIC_ADJECTIVES,
  GENERIC_NOUNS,
  ABSTRACT_NOUNS,
  IDEOLOGY_KEYWORDS,
} from "../data/ideologiesData"; //
import { POLICY_QUESTIONS } from "../data/policyData"; //
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData"; //

// Utility imports
import {
  generateId,
  getRandomElement,
  getRandomInt,
  generateNuancedColor,
} from "../utils/generalUtils"; //
import { calculateIdeologyFromStances } from "../stores/politicianSlice"; //
import { generateFullAIPolitician } from "../utils/electionUtils";

// Reusable UI components
import Modal from "../components/modals/Modal"; //
import { normalizePolling } from "../General Scripts/PollingFunctions";

// Helper function to generate a new party name
const generateNewPartyName = (baseIdeologyName) => {
  const noun = getRandomElement(GENERIC_NOUNS); //
  const adjective = getRandomElement(
    IDEOLOGY_KEYWORDS[baseIdeologyName] || GENERIC_ADJECTIVES
  ); //
  const abstractNoun = getRandomElement(ABSTRACT_NOUNS); //

  const templates = [
    `${adjective} ${noun}`,
    `${noun} of ${abstractNoun}`,
    `${adjective} ${abstractNoun} ${noun}`,
    `${baseIdeologyName.replace(" ", "")} ${noun}`,
  ];
  return getRandomElement(templates);
};

const ElectionSimulatorScreen = () => {
  // State for Core Configuration
  const [selectedCountryId, setSelectedCountryId] = useState("USA");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [totalPopulation, setTotalPopulation] = useState(1000000);
  const [electionType, setElectionType] = useState("");
  const [electionYear, setElectionYear] = useState(2024);

  // State for Party & Electorate Configuration
  const [parties, setParties] = useState([]);
  const [isPartyEditorModalOpen, setIsPartyEditorModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);

  // NEW STATE: To store generated candidates
  const [generatedSimCandidates, setGeneratedSimCandidates] = useState([]);

  // State for Electorate Composition
  const [voterTurnout, setVoterTurnout] = useState(60);
  const [electorateIdeologyCenter, setElectorateIdeologyCenter] = useState({});
  const [electorateIdeologySpread, setElectorateIdeologySpread] = useState({});
  const [electorateIssueStances, setElectorateIssueStances] = useState({});

  // New state for active tab
  const [activeSetupTab, setActiveSetupTab] = useState("general");

  // Access actions from the game store
  const { navigateTo, setSimulatedElections, setIsSimulationMode } =
    useGameStore((state) => state.actions); //

  // Derived state for dynamic dropdowns
  const selectedCountry = useMemo(() => {
    const country = COUNTRIES_DATA.find((c) => c.id === selectedCountryId); //
    return country || null;
  }, [selectedCountryId]);

  const availableRegions = useMemo(() => {
    if (!selectedCountry) return [];
    if (selectedCountry.regions && selectedCountry.regions.length > 0) {
      return selectedCountry.regions;
    }
    if (selectedCountry.provinces && selectedCountry.provinces.length > 0) {
      return selectedCountry.provinces;
    }
    return [];
  }, [selectedCountry]);

  const availableElectionTypes = useMemo(() => {
    return ELECTION_TYPES_BY_COUNTRY[selectedCountryId] || []; //
  }, [selectedCountryId]);

  useEffect(() => {
    if (availableElectionTypes.length > 0 && !electionType) {
      setElectionType(availableElectionTypes[0].id);
    } else if (availableElectionTypes.length === 0 && electionType) {
      setElectionType("");
    } else if (
      electionType &&
      !availableElectionTypes.some((type) => type.id === electionType)
    ) {
      setElectionType(
        availableElectionTypes.length > 0 ? availableElectionTypes[0].id : ""
      );
    }
  }, [availableElectionTypes, electionType]);

  useEffect(() => {
    const initialCenter = {};
    const initialSpread = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      //
      initialCenter[axis] = 0;
      initialSpread[axis] = 1;
    });
    setElectorateIdeologyCenter(initialCenter);
    setElectorateIdeologySpread(initialSpread);

    const initialIssueStances = {};
    POLICY_QUESTIONS.forEach((question) => {
      //
      if (question.options && question.options.length > 0) {
        initialIssueStances[question.id] = 0;
      }
    });
    setElectorateIssueStances(initialIssueStances);
  }, []);

  const handleRandomlyGenerateParties = useCallback(() => {
    const numParties = getRandomInt(3, 7); //
    const generated = [];
    const availableBaseIdeologies = [...BASE_IDEOLOGIES]; //

    for (let i = 0; i < numParties; i++) {
      const randomBaseIdeology = getRandomElement(availableBaseIdeologies); //
      if (!randomBaseIdeology) continue;

      const fullIdeologyDefinition =
        IDEOLOGY_DEFINITIONS[randomBaseIdeology.id]; //

      const newPartyName = generateNewPartyName(randomBaseIdeology.name);
      const partyColor = generateNuancedColor(
        randomBaseIdeology.color,
        getRandomInt(0, 100),
        getRandomInt(0, 100),
        getRandomInt(0, 100)
      );

      const initialPartyIdeologyScores = {
        ...(fullIdeologyDefinition?.idealPoint ||
          IDEOLOGY_DEFINITIONS.centrist.idealPoint), //
      };

      const calculatedIdeology = calculateIdeologyFromStances(
        null,
        POLICY_QUESTIONS, //
        IDEOLOGY_DEFINITIONS, //
        initialPartyIdeologyScores
      );

      generated.push({
        id: `party-${generateId()}`, //
        name: newPartyName,
        color: partyColor,
        ideology: calculatedIdeology.ideologyName,
        ideologyScores: initialPartyIdeologyScores,
        popularity: Math.floor(Math.random() * 20) + 5,
      });

      const index = availableBaseIdeologies.indexOf(randomBaseIdeology);
      if (index > -1) {
        availableBaseIdeologies.splice(index, 1);
      }
      if (availableBaseIdeologies.length === 0) {
        availableBaseIdeologies.push(...BASE_IDEOLOGIES); //
      }
    }
    setParties(generated);
    setGeneratedSimCandidates([]); // Clear candidates if parties are re-generated
  }, []);

  const handleCreateNewParty = useCallback(() => {
    setEditingParty(null);
    setIsPartyEditorModalOpen(true);
  }, []);

  const handleEditParty = useCallback((party) => {
    setEditingParty(party);
    setIsPartyEditorModalOpen(true);
  }, []);

  const handleDeleteParty = useCallback((partyId) => {
    setParties((prev) => prev.filter((p) => p.id !== partyId));
    setGeneratedSimCandidates([]); // Clear candidates if a party is deleted
  }, []);

  const handleSaveParty = useCallback((partyData) => {
    const calculatedIdeology = calculateIdeologyFromStances(
      null,
      POLICY_QUESTIONS, //
      IDEOLOGY_DEFINITIONS, //
      partyData.ideologyScores
    );

    const updatedParty = {
      ...partyData,
      ideology: calculatedIdeology.ideologyName,
    };

    if (partyData.id) {
      setParties((prev) =>
        prev.map((p) => (p.id === partyData.id ? updatedParty : p))
      );
    } else {
      setParties((prev) => [
        ...prev,
        { ...updatedParty, id: `party-${generateId()}` }, //
      ]);
    }
    setIsPartyEditorModalOpen(false);
    setEditingParty(null);
    setGeneratedSimCandidates([]); // Clear candidates if parties are modified/added
  }, []);

  // NEW: Function to generate candidates for display
  const handleGenerateCandidates = useCallback(() => {
    if (parties.length === 0) {
      alert(
        "Please generate or create parties first before generating candidates."
      );
      return;
    }

    const newCandidates = parties.map((party) => {
      const candidatePolitician = generateFullAIPolitician(
        selectedCountryId,
        parties,
        POLICY_QUESTIONS,
        IDEOLOGY_DEFINITIONS,
        party.id,
        null,
        null,
        false,
        electorateIdeologyCenter,
        electorateIdeologySpread,
        electorateIssueStances
      );

      return {
        id: candidatePolitician.id,
        name: `${candidatePolitician.firstName} ${candidatePolitician.lastName}`,
        partyId: candidatePolitician.partyId,
        partyName: candidatePolitician.partyName,
        partyColor: candidatePolitician.partyColor,
        polling: candidatePolitician.polling,
        baseScore: candidatePolitician.polling,
        attributes: candidatePolitician.attributes,
        calculatedIdeology: candidatePolitician.calculatedIdeology,
      };
    });

    const normalizedCandidates = normalizePolling(
      newCandidates,
      totalPopulation,
      true
    );
    setGeneratedSimCandidates(normalizedCandidates);
  }, [
    parties,
    selectedCountryId,
    electorateIdeologyCenter,
    electorateIdeologySpread,
    electorateIssueStances,
    totalPopulation,
  ]);

  const runSimulation = useCallback(() => {
    if (!selectedCountryId || !electionType || parties.length === 0) {
      alert(
        "Please select a Country, Election Type, and generate/create at least one Party before running the simulation."
      );
      return;
    }
    if (generatedSimCandidates.length === 0) {
      alert(
        "Please generate candidates using the 'Generate Candidates' button before running the simulation."
      );
      return;
    }

    const selectedElectionTypeDetails = availableElectionTypes.find(
      (type) => type.id === electionType
    );
    if (!selectedElectionTypeDetails) {
      alert("Selected Election Type details not found. Please re-select.");
      return;
    }

    let resolvedOfficeName = selectedElectionTypeDetails.officeNameTemplate;
    const selectedRegionName = availableRegions.find(
      (r) => r.id === selectedRegionId
    )?.name;
    const selectedCountryName = selectedCountry?.name;

    if (resolvedOfficeName.includes("{cityName}")) {
      resolvedOfficeName = resolvedOfficeName.replace(
        "{cityName}",
        selectedCityId || "the City"
      );
    }
    if (resolvedOfficeName.includes("{regionName}")) {
      resolvedOfficeName = resolvedOfficeName.replace(
        "{regionName}",
        selectedRegionName || "the Region"
      );
    }
    if (resolvedOfficeName.includes("{countryName}")) {
      resolvedOfficeName = resolvedOfficeName.replace(
        "{countryName}",
        selectedCountryName || "the Country"
      );
    }
    resolvedOfficeName = resolvedOfficeName.replace(/\{.*?\}/g, "").trim();
    if (!resolvedOfficeName) resolvedOfficeName = "Simulated Election";

    // **MODIFIED:** Use the already generated candidates from state
    const simulatedCandidates = generatedSimCandidates.map((c) => ({
      ...c,
      currentVotes: 0, // Reset votes for a new simulation run
    }));

    const totalExpectedVotes = Math.max(
      0,
      Math.round(totalPopulation * (voterTurnout / 100))
    );

    // Create a dummy election object compatible with ElectionNightScreen structure
    const simulatedElection = {
      id: `sim_election_${generateId()}`, //
      officeName: resolvedOfficeName,
      officeNameTemplateId: selectedElectionTypeDetails.id,
      electoralSystem: selectedElectionTypeDetails.electoralSystem,
      electionDate: { year: electionYear, month: 11, day: 5 }, // Fixed date for simulator
      filingDeadline: { year: electionYear, month: 9, day: 1 }, // Fixed deadline
      candidates: simulatedCandidates, // Use the pre-generated detailed candidates
      totalEligibleVoters: totalPopulation,
      voterTurnoutPercentage: voterTurnout,
      totalExpectedVotes: totalExpectedVotes,
      numberOfSeatsToFill: selectedElectionTypeDetails.seatsToFill || 1,
      outcome: { status: "upcoming" },
      percentReported: 0,
      isComplete: false,
      winnerAnnounced: false,
      entityDataSnapshot: {
        // Provide basic entity data snapshot
        population: totalPopulation,
        id: selectedRegionId || selectedCountryId,
        name: selectedRegionName || selectedCountryName || "Simulated Area",
        demographics: {}, // Placeholder
        politicalLandscape: parties.map((p) => ({
          // Snapshot of parties for context
          id: p.id,
          name: p.name,
          popularity: p.popularity,
          ideology: p.ideology,
          ideologyScores: p.ideologyScores,
          color: p.color,
        })),
        issues: Object.entries(electorateIssueStances).map(([id, stance]) => ({
          id,
          stance,
        })), // Pass electorate issues
        politicalLeaning: "Moderate", // Simplified for now
      },
    };

    // Store the simulated election data in the global state
    setIsSimulationMode(true);
    setSimulatedElections([simulatedElection]);

    // Navigate to the Election Night screen
    navigateTo("ElectionNightScreen");
  }, [
    selectedCountryId,
    selectedRegionId,
    selectedCityId,
    totalPopulation,
    electionType,
    electionYear,
    parties,
    voterTurnout,
    electorateIssueStances,
    availableElectionTypes,
    availableRegions,
    selectedCountry,
    navigateTo,
    setSimulatedElections,
    setIsSimulationMode, // Store actions as dependencies
    generatedSimCandidates, // NEW dependency
  ]);

  return (
    <div className="election-simulator-screen-container ui-panel">
      <h1 className="tab-title">Election Simulator</h1>

      <div className="simulator-layout">
        {/* Simulation Setup Panel now with Tabs */}
        <div className="simulation-setup-panel">
          {/* Tab Navigation */}
          <div className="setup-tabs-header">
            <button
              className={`tab-button ${
                activeSetupTab === "general" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("general")}
            >
              General Setup
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
                activeSetupTab === "electorate" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("electorate")}
            >
              Electorate
            </button>
          </div>
          {/* Tab Content */}
          <div className="setup-tabs-content">
            {activeSetupTab === "general" && (
              <div className="tab-pane general-setup-tab">
                <h3>Core Configuration</h3>
                <div className="config-group">
                  <label htmlFor="country-select">Country:</label>
                  <select
                    id="country-select"
                    value={selectedCountryId}
                    onChange={(e) => {
                      setSelectedCountryId(e.target.value);
                      setSelectedRegionId("");
                      setSelectedCityId("");
                      setElectionType("");
                    }}
                  >
                    {COUNTRIES_DATA.map(
                      (
                        country //
                      ) => (
                        <option key={country.id} value={country.id}>
                          {country.name} {country.flag}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor="region-select">Region/State:</label>
                  <select
                    id="region-select"
                    value={selectedRegionId}
                    onChange={(e) => {
                      setSelectedRegionId(e.target.value);
                      setSelectedCityId("");
                    }}
                    disabled={availableRegions.length === 0}
                  >
                    <option value="">Select a Region</option>
                    {availableRegions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor="city-select">
                    City (Optional - For local elections):
                  </label>
                  <select
                    id="city-select"
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                  >
                    <option value="">Select a City (if available)</option>
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor="population-input">Total Population:</label>
                  <input
                    id="population-input"
                    type="number"
                    value={totalPopulation}
                    onChange={(e) =>
                      setTotalPopulation(
                        Math.max(1, parseInt(e.target.value) || 0)
                      )
                    }
                    min="1"
                  />
                </div>

                <div className="config-group">
                  <label htmlFor="election-type-select">Election Type:</label>
                  <select
                    id="election-type-select"
                    value={electionType}
                    onChange={(e) => setElectionType(e.target.value)}
                    disabled={availableElectionTypes.length === 0}
                  >
                    <option value="">Select Election Type</option>
                    {availableElectionTypes.map(
                      (
                        type //
                      ) => (
                        <option key={type.id} value={type.id}>
                          {type.displayName ||
                            type.officeNameTemplate
                              .replace(/\{.*\}/, "")
                              .trim() ||
                            type.id}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor="election-year-input">Election Year:</label>
                  <input
                    id="election-year-input"
                    type="number"
                    value={electionYear}
                    onChange={(e) =>
                      setElectionYear(parseInt(e.target.value) || 2024)
                    }
                    min="1900"
                    max="3000"
                  />
                </div>
              </div>
            )}

            {activeSetupTab === "parties" && (
              <div className="tab-pane parties-tab">
                <h3>Party Management</h3>
                <div className="party-management">
                  <h4>Current Parties:</h4>
                  {parties.length === 0 ? (
                    <p>
                      No parties defined. Use buttons below to add or generate.
                    </p>
                  ) : (
                    <ul className="party-list">
                      {parties.map((party) => (
                        <li key={party.id} className="party-list-item">
                          <span
                            className="party-color-swatch"
                            style={{ backgroundColor: party.color }}
                          ></span>
                          {party.name} ({party.popularity}%) -{" "}
                          <span className="party-ideology">
                            {party.ideology}
                          </span>
                          <div className="party-actions">
                            <button
                              className="action-button small-button"
                              onClick={() => handleEditParty(party)}
                            >
                              Edit
                            </button>
                            <button
                              className="button-delete small-button"
                              onClick={() => handleDeleteParty(party.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="party-controls">
                    <button
                      className="action-button"
                      onClick={handleRandomlyGenerateParties}
                    >
                      Randomly Generate Parties
                    </button>
                    <button
                      className="action-button"
                      onClick={handleCreateNewParty}
                    >
                      Create New Party
                    </button>
                  </div>
                </div>
                {/* NEW: Candidate Generation and Display Section */}
                <div className="candidate-management">
                  <h4>Simulated Candidates:</h4>
                  {generatedSimCandidates.length === 0 ? (
                    <p>No candidates generated yet. Click the button below.</p>
                  ) : (
                    <ul className="candidate-list">
                      {generatedSimCandidates.map((candidate) => (
                        <li key={candidate.id} className="candidate-list-item">
                          <span className="candidate-name">
                            {candidate.name}
                          </span>
                          <span className="candidate-party-info">
                            ({candidate.partyName || "Independent"})
                          </span>
                          <span className="candidate-polling">
                            Polling: {candidate.polling?.toFixed(1) || 0}%
                          </span>
                          <span className="candidate-ideology-info">
                            {candidate.calculatedIdeology}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="candidate-controls">
                    <button
                      className="action-button"
                      onClick={handleGenerateCandidates}
                      disabled={parties.length === 0}
                    >
                      Generate Candidates for Parties
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSetupTab === "electorate" && (
              <div className="tab-pane electorate-tab">
                <h3>Electorate Composition</h3>
                <div className="config-group">
                  <label htmlFor="voter-turnout-slider">
                    Expected Voter Turnout (%):
                  </label>
                  <input
                    id="voter-turnout-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={voterTurnout}
                    onChange={(e) =>
                      setVoterTurnout(parseInt(e.target.value) || 0)
                    }
                  />
                  <span>{voterTurnout}%</span>
                </div>

                <h5>Electorate Ideological Stances (Center & Spread):</h5>
                {Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map(
                  (
                    axis //
                  ) => (
                    <div
                      key={axis}
                      className="config-group ideology-slider-group"
                    >
                      <label>
                        {axis
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                        :
                      </label>
                      <div className="slider-with-values">
                        <span>Center:</span>
                        <input
                          type="range"
                          min="-4"
                          max="4"
                          step="0.1"
                          value={electorateIdeologyCenter[axis] || 0}
                          onChange={(e) =>
                            setElectorateIdeologyCenter((prev) => ({
                              ...prev,
                              [axis]: parseFloat(e.target.value),
                            }))
                          }
                        />
                        <span>
                          {electorateIdeologyCenter[axis]?.toFixed(1)}
                        </span>
                      </div>
                      <div className="slider-with-values">
                        <span>Spread:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="4"
                          step="0.1"
                          value={electorateIdeologySpread[axis] || 1}
                          onChange={(e) =>
                            setElectorateIdeologySpread((prev) => ({
                              ...prev,
                              [axis]: parseFloat(e.target.value),
                            }))
                          }
                        />
                        <span>
                          {electorateIdeologySpread[axis]?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )
                )}

                <h5>Electorate Main Issues:</h5>
                {POLICY_QUESTIONS.map(
                  (
                    question //
                  ) =>
                    question.options &&
                    question.options.length > 0 && (
                      <div key={question.id} className="config-group">
                        <label title={question.questionText}>
                          {question.questionText
                            .replace(
                              /What is your stance on |How should |What is your approach to |Do you support or oppose | be taxed|\?$/g,
                              ""
                            )
                            .trim()}
                          :
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={electorateIssueStances[question.id] || 0}
                          onChange={(e) =>
                            setElectorateIssueStances((prev) => ({
                              ...prev,
                              [question.id]: parseInt(e.target.value),
                            }))
                          }
                        />
                        <span>{electorateIssueStances[question.id]}</span>
                      </div>
                    )
                )}
              </div>
            )}
          </div>{" "}
          {/* End setup-tabs-content */}
          {/* Run/Reset Buttons */}
          <div className="setup-action-buttons">
            <button
              className="action-button primary-action-button"
              onClick={runSimulation}
            >
              Run Simulation
            </button>
            <button
              className="menu-button"
              onClick={() => {
                setParties([]);
                setGeneratedSimCandidates([]); // Reset candidates on full reset
                setSelectedCountryId("USA");
                setSelectedRegionId("");
                setSelectedCityId("");
                setTotalPopulation(1000000);
                setElectionType("Presidential");
                setElectionYear(2024);
                const initialCenter = {};
                const initialSpread = {};
                Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach(
                  (axis) => {
                    //
                    initialCenter[axis] = 0;
                    initialSpread[axis] = 1;
                  }
                );
                setElectorateIdeologyCenter(initialCenter);
                setElectorateIdeologySpread(initialSpread);
                const initialIssueStances = {};
                POLICY_QUESTIONS.forEach((question) => {
                  //
                  if (question.options && question.options.length > 0) {
                    initialIssueStances[question.id] = 0;
                  }
                });
                setElectorateIssueStances(initialIssueStances);
              }}
            >
              Reset All
            </button>
          </div>
        </div>{" "}
        {/* End simulation-setup-panel */}
        {/* Simulation Results Panel */}
        <div className="simulation-results-panel">
          <h3>Simulation Results</h3>
          <p>Results will appear here after running a simulation.</p>
        </div>
      </div>

      <Modal
        isOpen={isPartyEditorModalOpen}
        onClose={() => setIsPartyEditorModalOpen(false)}
        title={editingParty ? `Edit ${editingParty.name}` : "Create New Party"}
        contentClassName="party-editor-modal-custom"
      >
        <PartyEditorModalContent
          party={editingParty}
          onSave={handleSaveParty}
          onCancel={() => setIsPartyEditorModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ElectionSimulatorScreen;

// PartyEditorModalContent Component (remains the same)
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
      //
      initialIdeology[axis] =
        party?.ideologyScores?.[axis] !== undefined
          ? party.ideologyScores[axis]
          : 0;
    });
    setIdeologyScores(initialIdeology);
  }, [party]);

  const handleSubmit = () => {
    const calculatedIdeology = calculateIdeologyFromStances(
      null,
      POLICY_QUESTIONS, //
      IDEOLOGY_DEFINITIONS, //
      ideologyScores
    );

    onSave({
      id: party?.id,
      name,
      color,
      popularity,
      ideology: calculatedIdeology.ideologyName,
      ideologyScores: ideologyScores,
    });
  };

  return (
    <div className="party-editor-modal-content">
      <div className="form-group">
        <label htmlFor="party-name">Party Name:</label>
        <input
          type="text"
          id="party-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="party-color">Party Color:</label>
        <input
          type="color"
          id="party-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="party-popularity">Base Popularity (%):</label>
        <input
          type="number"
          id="party-popularity"
          min="0"
          max="100"
          value={popularity}
          onChange={(e) => setPopularity(parseInt(e.target.value) || 0)}
        />
      </div>
      <h5>Party Ideological Stances (Adjust Scores):</h5>
      {Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map(
        (
          axis //
        ) => (
          <div key={axis} className="config-group ideology-slider-group">
            <label>
              {axis.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              :
            </label>
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
        )
      )}
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
