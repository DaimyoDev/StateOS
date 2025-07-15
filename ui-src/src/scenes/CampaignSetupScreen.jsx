// ui-src/src/scenes/CampaignSetupScreen.jsx
import React, { useState, useEffect } from "react";
import useGameStore from "../store";
import JapanMap from "../maps/JapanMap";
import PhilippinesMap from "../maps/PhilippinesMap";
import UnitedStatesMap from "../maps/UnitedStatesMap";
import SouthKoreaMap from "../maps/SouthKoreaMap";
import GermanyMap from "../maps/GermanyMap";
import CanadaMap from "../maps/CanadaMap";
import { COUNTRIES_DATA } from "../data/countriesData";
import "./CampaignSetupScreen.css";
import RegionPieChart from "../components/charts/RegionPieChart";

function CampaignSetupScreen() {
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );
  const currentCampaignSetup = useGameStore(
    (state) => state.currentCampaignSetup
  );
  const allCustomParties = useGameStore(
    (state) => state.allCustomParties || []
  );
  const actions = useGameStore((state) => state.actions);
  const availableCountries = useGameStore((state) => state.availableCountries);

  const [selectedRegionInfo, setSelectedRegionInfo] = useState({
    id: null,
    name: null,
  });

  // Destructure with null/undefined check for currentCampaignSetup first
  const {
    selectedCountryId,
    selectedRegionId,
    playerPartyChoice,
    generatedPartiesInCountry,
    regionPoliticalLandscape,
  } = currentCampaignSetup || {};

  // Find the full data for the currently selected country
  const currentSelectedCountryData = availableCountries.find(
    (c) => c.id === selectedCountryId
  );

  useEffect(() => {
    if (actions && actions.loadCountries && availableCountries.length === 0) {
      actions.loadCountries(COUNTRIES_DATA);
      console.log(COUNTRIES_DATA);
    }
  }, [actions, availableCountries.length]);

  // Effect to reset region info when country changes
  useEffect(() => {
    // Only reset if selectedCountryId is actually part of currentCampaignSetup
    // to avoid premature resets during initial load.
    if (
      currentCampaignSetup &&
      Object.prototype.hasOwnProperty.call("selectedCountryId")
    ) {
      setSelectedRegionInfo({ id: null, name: null });
      // The setSelectedRegion action should ideally handle clearing related data
      // like regionPoliticalLandscape in the store.
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(null);
      }
      // It might also be good to reset playerPartyChoice here,
      // or ensure it's re-evaluated based on the new country context.
      // actions.choosePlayerParty(null); // Consider implications
    }
  }, [selectedCountryId, actions, currentCampaignSetup]);

  const handleCountryChange = (event) => {
    const newCountryId = event.target.value;
    if (actions && actions.selectCountryForCampaign) {
      actions.selectCountryForCampaign(newCountryId);
      // Region info and selection are reset by the useEffect watching selectedCountryId
    }
  };

  const handleRegionSelectionFromMap = (regionGameId, regionName) => {
    // This handler is specific to map interaction (currently only Japan)
    if (selectedCountryId === "JPN") {
      setSelectedRegionInfo({ id: regionGameId, name: regionName });
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(regionGameId);
      }
    }
    if (selectedCountryId === "PHL") {
      setSelectedRegionInfo({ id: regionGameId, name: regionName });
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(regionGameId);
      }
    }
    if (selectedCountryId === "USA") {
      setSelectedRegionInfo({ id: regionGameId, name: regionName });
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(regionGameId);
      }
    }
    if (selectedCountryId === "KOR") {
      setSelectedRegionInfo({ id: regionGameId, name: regionName });
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(regionGameId);
      }
    }
    if (selectedCountryId === "GER") {
      setSelectedRegionInfo({ id: regionGameId, name: regionName });
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(regionGameId);
      }
    }
    if (selectedCountryId === "CAN") {
      setSelectedRegionInfo({ id: regionGameId, name: regionName });
      if (actions && actions.setSelectedRegion) {
        actions.setSelectedRegion(regionGameId);
      }
    }
  };

  // Placeholder for selecting region if not using a map
  const handleRegionSelectionFromList = (regionGameId, regionName) => {
    // This would be used if you have a dropdown for regions for non-map countries
    setSelectedRegionInfo({ id: regionGameId, name: regionName });
    if (actions && actions.setSelectedRegion) {
      actions.setSelectedRegion(regionGameId);
    }
    // If country is not selected yet, but a region for a country is chosen, select the country.
    // This might be needed if the UI flow allows selecting region before country explicitly.
    // For now, we assume country is selected first.
  };

  const canProceedToPartySelection = selectedCountryId && selectedRegionId; // Or adapt if region is not always needed
  const canStartCampaign =
    canProceedToPartySelection &&
    playerPartyChoice &&
    (playerPartyChoice.type || playerPartyChoice.id);

  if (!actions || !currentCampaignSetup || availableCountries.length === 0) {
    return <div>Loading campaign setup...</div>;
  }

  return (
    <div className="campaign-setup-container-twocol">
      {/* Left Column: Map Area / Country Specific Area */}
      <div className="map-area-column">
        <h2 className="column-title important-heading">
          {currentSelectedCountryData
            ? `Select Starting Region in ${currentSelectedCountryData.name}`
            : "Select Country and Region"}
        </h2>

        {/* Country Selector always visible at the top of this column */}
        <section className="setup-section country-selection-section">
          <h3>Select Country:</h3>
          <select
            value={selectedCountryId || ""}
            onChange={handleCountryChange}
            className="country-selector-dropdown" // Add styling for this
          >
            <option value="" disabled>
              -- Choose a Country --
            </option>
            {availableCountries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </section>

        {selectedCountryId === "JPN" && (
          <>
            <p className="map-instruction-cs">
              Click on a prefecture to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <JapanMap
                onSelectPrefecture={handleRegionSelectionFromMap}
                selectedPrefectureGameId={selectedRegionId}
              />
            </div>
          </>
        )}

        {selectedCountryId === "PHL" && (
          <>
            <p className="map-instruction-cs">
              Click on a province to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <PhilippinesMap
                onSelectProvince={handleRegionSelectionFromMap}
                selectedProvinceGameId={selectedRegionId}
              />
            </div>
          </>
        )}

        {selectedCountryId === "USA" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <UnitedStatesMap
                onSelectState={handleRegionSelectionFromMap}
                selectedStateGameId={selectedRegionId}
              />
            </div>
          </>
        )}

        {selectedCountryId === "KOR" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <SouthKoreaMap
                onSelectState={handleRegionSelectionFromMap}
                selectedStateGameId={selectedRegionId}
              />
            </div>
          </>
        )}

        {selectedCountryId === "GER" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <GermanyMap
                onSelectState={handleRegionSelectionFromMap}
                selectedStateGameId={selectedRegionId}
              />
            </div>
          </>
        )}

        {selectedCountryId === "CAN" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <CanadaMap
                onSelectProvince={handleRegionSelectionFromMap}
                selectedProvinceGameId={selectedRegionId}
              />
            </div>
          </>
        )}

        {selectedCountryId !== "JPN" &&
          selectedCountryId !== "PHL" &&
          selectedCountryId !== "USA" &&
          selectedCountryId != "KOR" &&
          selectedCountryId != "GER" &&
          selectedCountryId != "CAN" && (
            <div className="map-placeholder">
              <p>
                Map for{" "}
                <strong>
                  {currentSelectedCountryData?.name || "selected country"}
                </strong>{" "}
                is not yet available.
              </p>
              <p>
                Region selection for this country will be available through a
                list once regions are defined.
              </p>
              {/* Placeholder for future region dropdown for non-map countries */}
              {currentSelectedCountryData &&
              currentSelectedCountryData.regions &&
              currentSelectedCountryData.regions.length > 0 ? (
                <section className="setup-section region-selection-list-section">
                  <h4>Select Region:</h4>
                  <select
                    value={selectedRegionId || ""}
                    onChange={(e) => {
                      const region = currentSelectedCountryData.regions.find(
                        (r) => r.id === e.target.value
                      );
                      if (region) {
                        handleRegionSelectionFromList(region.id, region.name);
                      }
                    }}
                    className="region-selector-dropdown" // Add styling
                  >
                    <option value="" disabled>
                      {" "}
                      -- Select a Region --{" "}
                    </option>
                    {currentSelectedCountryData.regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </section>
              ) : (
                selectedCountryId && (
                  <p>
                    No regions currently defined for{" "}
                    {currentSelectedCountryData?.name}.
                  </p>
                )
              )}
            </div>
          )}
        {!selectedCountryId && (
          <p className="map-instruction-cs">
            Please select a country to begin.
          </p>
        )}
      </div>
      {/* Right Column: Information & Actions */}
      <div className="info-actions-column">
        <div className="info-actions-content">
          <h1 className="main-screen-title">Campaign Setup</h1>

          {selectedCountryId &&
            (selectedRegionInfo.name || selectedRegionId) && ( // Show if a region is selected (via map or list)
              <section className="setup-section selected-region-info-cs">
                <h2>Selected Start:</h2>
                {selectedRegionInfo.name && ( // Display region name if available from local state (map click) or resolved from selectedRegionId
                  <h3>
                    Region:{" "}
                    <strong>
                      {selectedRegionInfo.name ||
                        currentSelectedCountryData?.regions?.find(
                          (r) => r.id === selectedRegionId
                        )?.name ||
                        "N/A"}
                    </strong>
                  </h3>
                )}
                <h3>
                  Country:{" "}
                  <strong>{currentSelectedCountryData?.name || "N/A"}</strong>
                </h3>
              </section>
            )}

          {selectedCountryId &&
            !selectedRegionId && ( // If country is selected but no region yet
              <section className="setup-section placeholder-info-cs">
                <p>
                  Please select a starting region for{" "}
                  {currentSelectedCountryData?.name || "the selected country"}.
                </p>
              </section>
            )}

          {/* Display Pie Chart if data is available */}
          {selectedRegionId &&
            regionPoliticalLandscape &&
            regionPoliticalLandscape.length > 0 && (
              <section className="setup-section political-landscape-section">
                <div className="pie-chart-wrapper">
                  <RegionPieChart
                    politicalLandscape={regionPoliticalLandscape}
                    themeColors={currentTheme?.colors}
                    themeFonts={currentTheme?.fonts}
                  />
                </div>
              </section>
            )}

          {/* Party Affiliation Section - only if country and region are selected */}
          {canProceedToPartySelection && (
            <section className="setup-section party-affiliation-section">
              <h2>
                Choose Political Affiliation in{" "}
                {selectedRegionInfo.name ||
                  currentSelectedCountryData?.regions?.find(
                    (r) => r.id === selectedRegionId
                  )?.name ||
                  "Selected Region"}
              </h2>
              <div className="party-selection-scroll-area">
                <h3>Join an Existing National Party:</h3>
                <div className="party-list-cs">
                  {generatedPartiesInCountry &&
                  generatedPartiesInCountry.length > 0 ? (
                    generatedPartiesInCountry.map((party) => (
                      <button
                        key={party.id}
                        className={`menu-button party-choice-button ${
                          playerPartyChoice?.id === party.id &&
                          playerPartyChoice?.type === "join_generated"
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          actions.choosePlayerParty({
                            type: "join_generated",
                            id: party.id,
                            name: party.name, // Store name for easier display
                          })
                        }
                      >
                        Join {party.name} ({party.ideology})
                      </button>
                    ))
                  ) : (
                    <p>No national parties generated for this country yet.</p>
                  )}
                </div>

                {allCustomParties.length > 0 && (
                  <>
                    <h3>Use Your Custom Party:</h3>
                    <div className="party-list-cs">
                      {allCustomParties.map((customParty) => (
                        <button
                          key={customParty.id}
                          className={`menu-button party-choice-button ${
                            playerPartyChoice?.id === customParty.id &&
                            playerPartyChoice?.type === "use_custom"
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            actions.choosePlayerParty({
                              type: "use_custom",
                              id: customParty.id,
                              name: customParty.name, // Store name
                            })
                          }
                        >
                          Use {customParty.name} ({customParty.ideology})
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <h3>Or, Go It Alone:</h3>
                <button
                  className={`menu-button party-choice-button ${
                    playerPartyChoice?.type === "independent" ? "active" : ""
                  }`}
                  onClick={() =>
                    actions.choosePlayerParty({ type: "independent" })
                  }
                >
                  Run as an Independent
                </button>
                {/* Feedback on selection */}
                {playerPartyChoice?.type && (
                  <p className="selection-feedback">
                    Selected:
                    {playerPartyChoice.type === "independent" && " Independent"}
                    {playerPartyChoice.type !== "independent" &&
                      playerPartyChoice.name &&
                      ` ${playerPartyChoice.name}`}
                    {playerPartyChoice.type === "join_generated" &&
                      !playerPartyChoice.name &&
                      generatedPartiesInCountry &&
                      ` Joining ${
                        generatedPartiesInCountry.find(
                          (p) => p.id === playerPartyChoice.id
                        )?.name
                      }`}
                    {playerPartyChoice.type === "use_custom" &&
                      !playerPartyChoice.name &&
                      allCustomParties.length > 0 &&
                      ` Using your party: ${
                        allCustomParties.find(
                          (p) => p.id === playerPartyChoice.id
                        )?.name
                      }`}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>{" "}
        {/* End of .info-actions-content (scrollable part) */}
        <div className="form-actions setup-actions-cs sidebar-footer-actions">
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("CampaignStartOptionsScreen")}
          >
            Back
          </button>
          <button
            className="action-button"
            onClick={() => {
              if (canStartCampaign) actions.startCampaign();
            }}
            disabled={!canStartCampaign}
          >
            Start Campaign!
          </button>
        </div>
      </div>{" "}
      {/* End of .info-actions-column */}
    </div>
  );
}

export default CampaignSetupScreen;
