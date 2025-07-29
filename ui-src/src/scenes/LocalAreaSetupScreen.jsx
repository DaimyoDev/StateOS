// ui-src/src/scenes/LocalAreaSetupScreen.jsx
import React, { useState, useMemo, useEffect } from "react";
import useGameStore from "../store";
import "./LocalAreaSetupScreen.css";
import RegionPieChart from "../components/charts/RegionPieChart";

function LocalAreaSetupScreen() {
  // Select all necessary data slices from the store
  const currentCampaignSetup = useGameStore(
    (state) => state.currentCampaignSetup
  );
  const actions = useGameStore((state) => state.actions);
  const savedPoliticians = useGameStore(
    (state) => state.savedPoliticians || []
  );
  const availableCountries = useGameStore(
    (state) => state.availableCountries || []
  );
  const allCustomParties = useGameStore(
    (state) => state.allCustomParties || []
  );
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );

  const [selectedCityId, setSelectedCityId] = useState("");

  const citiesInRegion = useMemo(() => {
    if (
      !currentCampaignSetup?.selectedCountryId ||
      !currentCampaignSetup?.selectedRegionId
    )
      return [];
    const country = availableCountries.find(
      (c) => c.id === currentCampaignSetup.selectedCountryId
    );
    const region = country?.regions?.find(
      (r) => r.id === currentCampaignSetup.selectedRegionId
    );
    return region?.cities || [];
  }, [availableCountries, currentCampaignSetup]);

  useEffect(() => {
    if (citiesInRegion.length > 0) {
      setSelectedCityId(citiesInRegion[0].id);
    }
  }, [citiesInRegion]);

  // Use useMemo to derive complex data. This will only re-calculate if dependencies change.
  const displayData = useMemo(() => {
    if (!currentCampaignSetup) return null;

    const {
      selectedPoliticianId,
      selectedCountryId,
      selectedRegionId,
      playerPartyChoice,
      generatedPartiesInCountry,
      regionPoliticalLandscape, // Ensure this is part of currentCampaignSetup from store
    } = currentCampaignSetup;

    const politician = savedPoliticians.find(
      (p) => p.id === selectedPoliticianId
    );
    const country = availableCountries.find((c) => c.id === selectedCountryId);
    const region = country?.regions?.find((r) => r.id === selectedRegionId);

    let partyName = "Independent";
    let partyIdeology = "N/A";
    let partyColor = currentTheme?.colors["--secondary-text"] || "#718096"; // Default color

    if (
      playerPartyChoice?.type === "join_generated" &&
      generatedPartiesInCountry
    ) {
      const foundParty = generatedPartiesInCountry.find(
        (p) => p.id === playerPartyChoice.id
      );
      if (foundParty) {
        partyName = foundParty.name;
        partyIdeology = foundParty.ideology;
        partyColor = foundParty.color || partyColor;
      } else {
        partyName = "Selected Party (Error)";
      }
    } else if (playerPartyChoice?.type === "use_custom" && allCustomParties) {
      const foundParty = allCustomParties.find(
        (p) => p.id === playerPartyChoice.id
      );
      if (foundParty) {
        partyName = foundParty.name;
        partyIdeology = foundParty.ideology;
        // Assuming custom parties might have a color defined, or use a default
        partyColor =
          foundParty.color ||
          currentTheme?.colors["--accent-color"] ||
          "#4299E1";
      } else {
        partyName = "Your Custom Party (Error)";
      }
    }

    return {
      politicianName: politician
        ? `${politician.firstName} ${politician.lastName}`
        : "Your Politician",
      politicianIdeology: politician?.calculatedIdeology || "N/A",
      countryName: country?.name || "Selected Country",
      regionName: region?.name || "Selected Region",
      partyDisplayName: partyName,
      partyIdeologyDisplay: partyIdeology,
      partyColorDisplay: partyColor,
      regionPoliticalLandscape: regionPoliticalLandscape || [], // Ensure it's an array
    };
  }, [
    currentCampaignSetup,
    savedPoliticians,
    availableCountries,
    allCustomParties,
    currentTheme,
  ]);

  const handleSubmitCity = () => {
    if (selectedCityId && actions && actions.finalizeLocalAreaAndStart) {
      const selectedPoliticianObject = savedPoliticians.find(
        (p) => p.id === currentCampaignSetup?.selectedPoliticianId
      );
      const selectedCityObject = citiesInRegion.find(
        (c) => c.id === selectedCityId
      );

      if (!selectedPoliticianObject || !selectedCityObject) {
        alert("Error: Missing politician or city data. Please go back.");
        return;
      }

      // --- MODIFIED: Pass the selected city object directly ---
      actions.finalizeLocalAreaAndStart(
        selectedCityObject, // Pass the whole object
        selectedPoliticianObject,
        allCustomParties,
        availableCountries
      );
    } else {
      alert("Please select a starting city.");
    }
  };

  // Initial loading/error checks
  if (!actions || !currentCampaignSetup || !displayData) {
    return <div>Loading setup details...</div>;
  }

  // Check if essential IDs are present before rendering main content
  if (
    !currentCampaignSetup.selectedPoliticianId ||
    !currentCampaignSetup.selectedCountryId ||
    !currentCampaignSetup.selectedRegionId
  ) {
    console.error(
      "LocalAreaSetupScreen: Crucial campaign setup IDs are missing!",
      currentCampaignSetup
    );
    // Optionally navigate back or show a more specific error message
    // actions.navigateTo('CampaignSetupScreen'); // Example: send back to previous screen
    return (
      <div>
        Error: Campaign setup is incomplete. Please go back and make selections.
      </div>
    );
  }

  return (
    <div className="local-area-setup-container">
      <div className="setup-panel-las">
        <h1 className="setup-title-las">Establish Your Political Base</h1>

        <div className="summary-grid-las">
          {" "}
          {/* Using a grid for better layout */}
          <div className="summary-item-las">
            <span className="summary-label">Politician: </span>
            <strong className="summary-value">
              {displayData.politicianName}
            </strong>
          </div>
          <div className="summary-item-las">
            <span className="summary-label">Starting In: </span>
            <strong className="summary-value">
              {displayData.regionName}, {displayData.countryName}
            </strong>
          </div>
          <div className="summary-item-las">
            <span className="summary-label">Affiliation: </span>
            <strong
              className="summary-value"
              style={{ color: displayData.partyColorDisplay }}
            >
              {displayData.partyDisplayName}
            </strong>
          </div>
        </div>

        {/* Displaying Regional Party Popularity Pie Chart */}
        {displayData.regionPoliticalLandscape &&
          displayData.regionPoliticalLandscape.length > 0 && (
            <section className="setup-section political-landscape-summary">
              <h3 className="summary-section-title">
                Regional Political Climate in {displayData.regionName}
              </h3>
              <div className="pie-chart-wrapper-small">
                {" "}
                {/* Smaller wrapper for this context */}
                <RegionPieChart
                  politicalLandscape={displayData.regionPoliticalLandscape}
                  themeColors={currentTheme?.colors}
                />
              </div>
            </section>
          )}

        <div className="form-group city-name-group">
          <label htmlFor="citySelect">
            Select your starting city, town, or district:
          </label>
          <select
            id="citySelect"
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="region-selector-dropdown" // Re-using style from setup screen
          >
            <option value="" disabled>
              -- Choose a City --
            </option>
            {citiesInRegion
              .sort((a, b) => b.population - a.population)
              .map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} (Pop. {city.population.toLocaleString()})
                </option>
              ))}
          </select>
        </div>

        <div className="form-actions-las">
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("CampaignSetupScreen")}
          >
            Back
          </button>
          <button className="action-button" onClick={handleSubmitCity}>
            Begin Career Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocalAreaSetupScreen;
