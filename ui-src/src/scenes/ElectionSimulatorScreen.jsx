import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./ElectionSimulatorScreen.css"; // We'll create this CSS file next

// Data imports
import { COUNTRIES_DATA } from "../data/countriesData"; //
import { IDEOLOGY_DEFINITIONS, BASE_IDEOLOGIES } from "../data/ideologiesData"; //

// Reusable UI components (if they exist or will be created)
import Modal from "../components/modals/Modal"; //
// import Slider from '../components/Slider'; // Placeholder if we need a custom slider component
// import ColorPicker from '../components/ColorPicker'; // Placeholder if we need a custom color picker

const ElectionSimulatorScreen = () => {
  // State for Core Configuration
  const [selectedCountryId, setSelectedCountryId] = useState("USA"); // Default to USA
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [totalPopulation, setTotalPopulation] = useState(1000000); // Default population
  const [electionType, setElectionType] = useState("Presidential");
  const [electionYear, setElectionYear] = useState(2024);

  // State for Party & Electorate Configuration
  const [parties, setParties] = useState([]); // List of parties in the simulation
  const [isPartyEditorModalOpen, setIsPartyEditorModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null); // Null for new, object for edit

  // State for Electorate Composition
  const [voterTurnout, setVoterTurnout] = useState(60); // Default 60%
  // Ideological distribution center/spread (example initial values)
  const [electorateIdeologyCenter, setElectorateIdeologyCenter] = useState({});
  const [electorateIdeologySpread, setElectorateIdeologySpread] = useState({});
  // Main issues stances (example initial values)
  const [electorateIssueStances, setElectorateIssueStances] = useState({});

  // Derived state for dynamic dropdowns
  const selectedCountry = useMemo(() => {
    return COUNTRIES_DATA[selectedCountryId] || null; //
  }, [selectedCountryId]);

  const availableRegions = useMemo(() => {
    return selectedCountry ? selectedCountry.regions : []; //
  }, [selectedCountry]);

  const availableCities = useMemo(() => {
    // This would require a more complex lookup from state/region data if cities are nested within them.
    // For simplicity, for now, we'll assume a direct lookup or generate some placeholder cities for a selected region.
    // In a real implementation, you'd load cities based on selectedRegionId.
    // Example: return citiesData.filter(city => city.regionId === selectedRegionId);
    // For now, let's just return some dummy data or keep it empty.
    if (selectedRegionId) {
      // Placeholder: In real app, load cities based on selectedRegionId
      // For now, we don't have detailed city data by region in the provided files
      // So, for demonstration, let's assume `createCityObject` generates cities.
      // A more robust solution would be to have a `citiesByRegionData.js`
      return [
        { id: "city1", name: "Capital City" },
        { id: "city2", name: "Coastal Town" },
      ]; // Example cities
    }
    return [];
  }, [selectedRegionId]);

  // Initialize electorate ideology controls with default 'centrist' or 0 for each axis
  useEffect(() => {
    const initialCenter = {};
    const initialSpread = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      //
      initialCenter[axis] = 0; // Centrist default
      initialSpread[axis] = 1; // Default spread
    });
    setElectorateIdeologyCenter(initialCenter);
    setElectorateIdeologySpread(initialSpread);

    // Initialize electorate issue stances based on known policy categories
    // This would require importing policy categories (e.g., from policyData.js or policyQuestions/)
    // For now, let's just have placeholders.
    setElectorateIssueStances({
      economy: 0, // e.g., -100 (left) to 100 (right)
      healthcare: 0, // e.g., -100 (public) to 100 (private)
      environment: 0, // e.g., -100 (pro-growth) to 100 (pro-conservation)
      // ... more issues
    });
  }, []);

  const handleRandomlyGenerateParties = useCallback(() => {
    const numParties = 3; // Example: prompt for this
    const generated = [];
    for (let i = 0; i < numParties; i++) {
      // Logic to randomly generate party name, color, and ideology
      const randomIdeology =
        BASE_IDEOLOGIES[Math.floor(Math.random() * BASE_IDEOLOGIES.length)]; //
      generated.push({
        id: `party-${Date.now()}-${i}`,
        name: `${randomIdeology.name} Party ${i + 1}`,
        color: randomIdeology.color,
        ideology: {
          /* random points based on randomIdeology.idealPoint */
        },
        popularity: Math.floor(Math.random() * 20) + 5, // 5-25% initial popularity
      });
    }
    setParties(generated);
  }, []);

  const handleCreateNewParty = useCallback(() => {
    setEditingParty(null); // Indicate new party creation
    setIsPartyEditorModalOpen(true);
  }, []);

  const handleEditParty = useCallback((party) => {
    setEditingParty(party);
    setIsPartyEditorModalOpen(true);
  }, []);

  const handleDeleteParty = useCallback((partyId) => {
    setParties((prev) => prev.filter((p) => p.id !== partyId));
  }, []);

  const handleSaveParty = useCallback(
    (partyData) => {
      if (editingParty) {
        // Update existing party
        setParties((prev) =>
          prev.map((p) => (p.id === partyData.id ? partyData : p))
        );
      } else {
        // Add new party
        setParties((prev) => [
          ...prev,
          { ...partyData, id: `party-${Date.now()}` },
        ]);
      }
      setIsPartyEditorModalOpen(false);
      setEditingParty(null);
    },
    [editingParty]
  );

  return (
    <div className="election-simulator-screen-container ui-panel">
      <h1 className="tab-title">Election Simulator</h1>

      <div className="simulator-layout">
        {/* Simulation Setup Panel */}
        <div className="simulation-setup-panel">
          <h3>Core Configuration</h3>
          <div className="config-group">
            <label htmlFor="country-select">Country:</label>
            <select
              id="country-select"
              value={selectedCountryId}
              onChange={(e) => {
                setSelectedCountryId(e.target.value);
                setSelectedRegionId(""); // Reset region on country change
                setSelectedCityId(""); // Reset city on country change
              }}
            >
              {Object.values(COUNTRIES_DATA).map(
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
                setSelectedCityId(""); // Reset city on region change
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
            <label htmlFor="city-select">City (Optional):</label>
            <select
              id="city-select"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              disabled={availableCities.length === 0}
            >
              <option value="">Select a City</option>
              {availableCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="config-group">
            <label htmlFor="population-input">Total Population:</label>
            <input
              id="population-input"
              type="number"
              value={totalPopulation}
              onChange={(e) =>
                setTotalPopulation(Math.max(1, parseInt(e.target.value) || 0))
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
            >
              <option value="Presidential">Presidential</option>
              <option value="Parliamentary">Parliamentary</option>
              <option value="Senate">Senate</option>
              <option value="House">House of Representatives</option>
              <option value="Local">Local (Mayor/Council)</option>
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

          <h3>Party & Electorate Configuration</h3>
          <div className="party-management">
            <h4>Current Parties:</h4>
            {parties.length === 0 ? (
              <p>No parties defined. Use buttons below to add or generate.</p>
            ) : (
              <ul className="party-list">
                {parties.map((party) => (
                  <li key={party.id} className="party-list-item">
                    <span
                      className="party-color-swatch"
                      style={{ backgroundColor: party.color }}
                    ></span>
                    {party.name} ({party.popularity}%)
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
              <button className="action-button" onClick={handleCreateNewParty}>
                Create New Party
              </button>
            </div>
          </div>

          <div className="electorate-composition">
            <h4>Electorate Composition:</h4>
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
                onChange={(e) => setVoterTurnout(parseInt(e.target.value) || 0)}
              />
              <span>{voterTurnout}%</span>
            </div>

            {/* Ideological Distribution Sliders (dynamic based on IDEOLOGY_DEFINITIONS) */}
            <h5>Electorate Ideological Stances:</h5>
            {Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map(
              (
                axis //
              ) => (
                <div key={axis} className="config-group ideology-slider-group">
                  <label>
                    {axis
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    :
                  </label>
                  <div className="slider-with-values">
                    {/* Center */}
                    <input
                      type="range"
                      min="-4" // Corresponds to min/max idealPoint values in ideologiesData.js
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
                      Center: {electorateIdeologyCenter[axis]?.toFixed(1)}
                    </span>
                    {/* Spread */}
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
                      Spread: {electorateIdeologySpread[axis]?.toFixed(1)}
                    </span>
                  </div>
                </div>
              )
            )}

            {/* Main Issues/Policy Stances Sliders */}
            <h5>Electorate Main Issues:</h5>
            {Object.keys(electorateIssueStances).map((issue) => (
              <div key={issue} className="config-group">
                <label>{issue.replace(/\b\w/g, (c) => c.toUpperCase())}:</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={electorateIssueStances[issue]}
                  onChange={(e) =>
                    setElectorateIssueStances((prev) => ({
                      ...prev,
                      [issue]: parseInt(e.target.value),
                    }))
                  }
                />
                <span>{electorateIssueStances[issue]}</span>
              </div>
            ))}
          </div>

          {/* Election System Selection will go here later */}
          {/* Run Simulation Button will go here later */}
        </div>

        {/* Simulation Results Panel (initially empty or showing placeholder) */}
        <div className="simulation-results-panel">
          <h3>Simulation Results</h3>
          <p>Run a simulation to see results here.</p>
          {/* This panel will display charts, tables, and text outputs */}
        </div>
      </div>

      {/* Party Editor Modal */}
      <Modal
        isOpen={isPartyEditorModalOpen}
        onClose={() => setIsPartyEditorModalOpen(false)}
        title={editingParty ? `Edit ${editingParty.name}` : "Create New Party"}
        primaryActionText="Save Party"
        onPrimaryAction={() => {
          // This will be handled by a dedicated form inside the modal
          // For now, a placeholder function
          console.log("Saving party...", editingParty);
          handleSaveParty({
            /* collected data from modal form */
          });
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => setIsPartyEditorModalOpen(false)}
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

// --- PartyEditorModalContent Component (within the same file for now, or separate later) ---
// This component will be passed as children to the generic Modal component.
const PartyEditorModalContent = ({ party, onSave, onCancel }) => {
  const [name, setName] = useState(party?.name || "");
  const [color, setColor] = useState(party?.color || "#000000");
  const [popularity, setPopularity] = useState(party?.popularity || 10); // Default popularity
  const [ideology, setIdeology] = useState(party?.ideology || {});

  // Initialize ideology sliders based on IDEOLOGY_DEFINITIONS for new parties or existing party data
  useEffect(() => {
    const initialIdeology = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      //
      initialIdeology[axis] =
        party?.ideology?.[axis] !== undefined ? party.ideology[axis] : 0; // Default to 0 if not set
    });
    setIdeology(initialIdeology);
  }, [party]);

  const handleSubmit = () => {
    onSave({
      id: party?.id, // Keep existing ID if editing
      name,
      color,
      popularity,
      ideology,
    });
  };

  return (
    <div className="party-editor-modal-content">
      <div className="config-group">
        <label htmlFor="party-name">Party Name:</label>
        <input
          id="party-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="config-group">
        <label htmlFor="party-color">Party Color:</label>
        <input
          id="party-color"
          type="color" // HTML5 color picker
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div className="config-group">
        <label htmlFor="party-popularity">Base Popularity (%):</label>
        <input
          id="party-popularity"
          type="number"
          min="0"
          max="100"
          value={popularity}
          onChange={(e) => setPopularity(parseInt(e.target.value) || 0)}
        />
      </div>
      <h5>Party Ideological Stances:</h5>
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
              min="-4" // Corresponds to min/max idealPoint values
              max="4"
              step="0.1"
              value={ideology[axis] || 0}
              onChange={(e) =>
                setIdeology((prev) => ({
                  ...prev,
                  [axis]: parseFloat(e.target.value),
                }))
              }
            />
            <span>{ideology[axis]?.toFixed(1)}</span>
          </div>
        )
      )}
      <div className="modal-actions-override">
        {" "}
        {/* Custom buttons for this content */}
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
