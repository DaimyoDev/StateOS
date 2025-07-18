// ui-src/src/scenes/LocalAreaSetupScreen.jsx
import React, { useState, useMemo } from "react"; // Added useMemo
import useGameStore from "../store";
import "./LocalAreaSetupScreen.css";
import RegionPieChart from "../components/charts/RegionPieChart"; // Assuming you might want to show it here too

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

  const [cityName, setCityName] = useState("");

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
    if (cityName.trim() && actions && actions.finalizeLocalAreaAndStart) {
      // Find the selected politician object
      const selectedPoliticianObject = savedPoliticians.find(
        (p) => p.id === currentCampaignSetup?.selectedPoliticianId
      );

      if (!selectedPoliticianObject) {
        alert(
          "Selected politician data not found. Please go back and re-select."
        );
        return;
      }
      if (
        !currentCampaignSetup?.selectedCountryId ||
        !currentCampaignSetup?.selectedRegionId
      ) {
        alert(
          "Country or Region selection is missing. Please go back and complete setup."
        );
        return;
      }
      // Call with all required arguments
      actions.finalizeLocalAreaAndStart(
        cityName.trim(),
        selectedPoliticianObject,
        allCustomParties,
        availableCountries
      );
    } else {
      console.log(cityName);
      alert("Please enter a name for your starting city or district.");
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
          <label htmlFor="cityName">
            Name your starting city, town, or district:
          </label>
          <input
            type="text"
            id="cityName"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="e.g., Springfield, District 7, Hope County"
          />
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
