import React, { useState, useEffect } from "react";
import useGameStore from "../store";
import JapanMap from "../maps/JapanMap";
import PhilippinesMap from "../maps/PhilippinesMap";
import UnitedStatesMap from "../maps/UnitedStatesMap";
import AlabamaMap from "../maps/usaCounties/AlabamaMap";
import ArizonaMap from "../maps/usaCounties/ArizonaMap";
import ConnecticutMap from "../maps/usaCounties/ConnecticutMap";
import CaliforniaMap from "../maps/usaCounties/CaliforniaMap";
import SouthKoreaMap from "../maps/SouthKoreaMap";
import GermanyMap from "../maps/GermanyMap";
import CanadaMap from "../maps/CanadaMap";
import { BASE_COUNTRIES_DATA } from "../data/countriesData";
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

  // New state to manage the two stages: 'country_selection' and 'region_selection'
  const [setupStage, setSetupStage] = useState("country_selection");
  // New state to temporarily hold the selected country before confirmation
  const [tempSelectedCountryId, setTempSelectedCountryId] = useState(null);

  const [selectedRegionInfo, setSelectedRegionInfo] = useState({
    id: null,
    name: null,
  });

  const {
    selectedCountryId,
    selectedRegionId,
    selectedSecondAdminRegionId,
    playerPartyChoice,
    generatedPartiesInCountry,
    regionPoliticalLandscape,
  } = currentCampaignSetup || {};

  // Find full data for the *temporarily* selected country for the details panel
  const tempSelectedCountryData = availableCountries.find(
    (c) => c.id === tempSelectedCountryId
  );

  // Find the full data for the *confirmed* country for the region selection stage
  const currentSelectedCountryData = availableCountries.find(
    (c) => c.id === selectedCountryId
  );
  const selectedRegionData = currentSelectedCountryData?.regions?.find(
    (r) => r.id === selectedRegionId
  );

  useEffect(() => {
    if (actions && actions.loadCountries && availableCountries.length === 0) {
      actions.loadCountries(BASE_COUNTRIES_DATA);
    }
  }, [actions, availableCountries.length]);

  // Effect to reset region info when country changes
  useEffect(() => {
    setSelectedRegionInfo({ id: null, name: null });
    if (actions) {
      if (actions.setSelectedRegion) {
        actions.setSelectedRegion(null);
      }
      // Also reset party choice, since parties are country-specific.
      if (actions.choosePlayerParty) {
        actions.choosePlayerParty(null);
      }
    }
  }, [selectedCountryId, actions]);

  const availableSecondAdminRegions = React.useMemo(() => {
    if (!currentSelectedCountryData || !selectedRegionData) {
      return [];
    }
    // Filter counties/regions based on the selected state's ID
    return (currentSelectedCountryData.secondAdminRegions || [])
      .filter((region) => region.stateId === selectedRegionData.id)
      .sort((a, b) => a.name.localeCompare(b.name)); // Sorts them alphabetically
  }, [currentSelectedCountryData, selectedRegionData]);

  const handleCountryCardClick = (countryId) => {
    setTempSelectedCountryId(countryId);
  };

  const handleConfirmCountry = () => {
    if (tempSelectedCountryId) {
      actions.processAndSelectCountry(tempSelectedCountryId);
      setSetupStage("region_selection");
    }
  };

  const handleBackToCountrySelect = () => {
    actions.selectCountryForCampaign(null);
    setTempSelectedCountryId(null);
    actions.setSelectedRegion(null);
    setSetupStage("country_selection");
  };

  const handleBackToStateSelect = () => {
    // This action will reset both the selected region (state) and the second admin region (county)
    actions.setSelectedRegion(null);
  };

  const handleRegionSelectionFromMap = (regionGameId, regionName) => {
    setSelectedRegionInfo({ id: regionGameId, name: regionName });
    if (actions && actions.setSelectedRegion) {
      actions.setSelectedRegion(regionGameId);
    }
  };

  const handleRegionSelectionFromList = (regionGameId, regionName) => {
    setSelectedRegionInfo({ id: regionGameId, name: regionName });
    if (actions && actions.setSelectedRegion) {
      actions.setSelectedRegion(regionGameId);
    }
  };

  const canProceedToPartySelection = React.useMemo(() => {
    if (!selectedCountryId || !selectedRegionId) return false;
    const hasSecondLevel = availableSecondAdminRegions.length > 0;
    // You can proceed if there are NO counties, OR if there ARE counties and you've selected one.
    return !hasSecondLevel || (hasSecondLevel && !!selectedSecondAdminRegionId);
  }, [
    selectedCountryId,
    selectedRegionId,
    availableSecondAdminRegions,
    selectedSecondAdminRegionId,
  ]);

  const canStartCampaign =
    canProceedToPartySelection &&
    playerPartyChoice &&
    (playerPartyChoice.type || playerPartyChoice.id);

  if (!actions || !currentCampaignSetup || availableCountries.length === 0) {
    return <div>Loading campaign setup...</div>;
  }

  // RENDER FOR COUNTRY SELECTION STAGE
  if (setupStage === "country_selection") {
    return (
      <div className="campaign-setup-container-twocol">
        <div className="map-area-column">
          <h2 className="column-title important-heading">Choose a Nation</h2>
          <p className="map-instruction-cs">
            Select a country to begin your political journey.
          </p>
          <div className="country-selection-grid">
            {availableCountries.map((country) => (
              <div
                key={country.id}
                className={`country-card ${
                  tempSelectedCountryId === country.id ? "selected" : ""
                }`}
                onClick={() => handleCountryCardClick(country.id)}
              >
                <div className="country-card-flag">{country.flag}</div>
                <div className="country-card-name">{country.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="info-actions-column">
          <div className="info-actions-content">
            <h1 className="main-screen-title">Campaign Setup</h1>
            {tempSelectedCountryData ? (
              <div className="country-details-panel">
                <h2 className="country-details-title">
                  {tempSelectedCountryData.name}
                </h2>
                <p>
                  <strong>Political System:</strong>{" "}
                  {tempSelectedCountryData.politicalSystem}
                </p>
                <p>
                  <strong>Dominant Ideologies:</strong>{" "}
                  {tempSelectedCountryData.dominantIdeologies.join(", ")}
                </p>
                {/* Add more country details here as needed */}
              </div>
            ) : (
              <section className="setup-section placeholder-info-cs">
                <p>Select a country from the list to see its details.</p>
              </section>
            )}
          </div>
          <div className="form-actions setup-actions-cs sidebar-footer-actions">
            <button
              className="menu-button"
              onClick={() => actions.navigateTo("CampaignStartOptionsScreen")}
            >
              Back
            </button>
            <button
              className="action-button confirm-country"
              onClick={handleConfirmCountry}
              disabled={!tempSelectedCountryId}
            >
              Confirm Country
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER FOR REGION SELECTION STAGE
  return (
    <div className="campaign-setup-container-twocol">
      {/* Left Column: Map Area */}
      <div className="map-area-column">
        <h2 className="column-title important-heading">
          {currentSelectedCountryData
            ? `Select Starting Region in ${currentSelectedCountryData.name}`
            : "Select Country and Region"}
        </h2>

        {/* MAPS AND REGION LISTS */}
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
            {/* --- If NO state is selected, show the USA Map --- */}
            {!selectedRegionId && (
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

            {selectedRegionId === "USA_AL" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Alabama.
                </p>
                <div className="map-render-wrapper">
                  <AlabamaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_AZ" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Arizona.
                </p>
                <div className="map-render-wrapper">
                  <ArizonaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_CA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in California.
                </p>
                <div className="map-render-wrapper">
                  <CaliforniaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_CT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Connecticut.
                </p>
                <div className="map-render-wrapper">
                  <ConnecticutMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}
          </>
        )}
        {selectedCountryId === "KOR" && (
          <>
            <p className="map-instruction-cs">
              Click on a province to begin your political career there.
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
              Click on a province to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <CanadaMap
                onSelectProvince={handleRegionSelectionFromMap}
                selectedProvinceGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {/* Fallback for countries without maps */}
        {currentSelectedCountryData &&
          !["JPN", "PHL", "USA", "KOR", "GER", "CAN"].includes(
            selectedCountryId
          ) && (
            <div className="map-placeholder">
              <p>
                Map for{" "}
                <strong>
                  {currentSelectedCountryData?.name || "selected country"}
                </strong>{" "}
                is not yet available.
              </p>
              {currentSelectedCountryData.regions &&
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
                    className="region-selector-dropdown"
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
                <p>
                  No regions currently defined for{" "}
                  {currentSelectedCountryData?.name}.
                </p>
              )}
            </div>
          )}
      </div>

      {/* Right Column: Information & Actions */}
      <div className="info-actions-column">
        <div className="info-actions-content">
          <h1 className="main-screen-title">Campaign Setup</h1>

          {selectedCountryId &&
            (selectedRegionInfo.name || selectedRegionId) && (
              <section className="setup-section selected-region-info-cs">
                <h2>Selected Start:</h2>
                {selectedRegionInfo.name && (
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
                {selectedRegionData?.stats &&
                  selectedRegionData?.economicProfile && (
                    <>
                      <p>
                        <strong>Population:</strong>{" "}
                        {selectedRegionData.population.toLocaleString()}
                      </p>
                      <p>
                        <strong>GDP per Capita:</strong> $
                        {selectedRegionData.economicProfile.gdpPerCapita.toLocaleString()}
                      </p>
                      <p>
                        <strong>Key Issues:</strong>{" "}
                        {selectedRegionData.stats.mainIssues.join(", ")}
                      </p>
                    </>
                  )}
              </section>
            )}

          {selectedRegionId && availableSecondAdminRegions.length > 0 && (
            <section className="setup-section">
              <h4>Select a County / Borough:</h4>
              <select
                id="county-select"
                value={selectedSecondAdminRegionId || ""}
                onChange={(e) =>
                  actions.setSelectedSecondAdminRegion(e.target.value)
                }
                className="region-selector-dropdown"
              >
                <option value="" disabled>
                  -- Choose a starting county --
                </option>
                {availableSecondAdminRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </section>
          )}

          {selectedCountryId && !selectedRegionId && (
            <section className="setup-section placeholder-info-cs">
              <p>
                Please select a starting region for{" "}
                {currentSelectedCountryData?.name || "the selected country"}.
              </p>
            </section>
          )}

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
                            name: party.name,
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
                              name: customParty.name,
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
              </div>
            </section>
          )}
        </div>
        <div className="form-actions setup-actions-cs sidebar-footer-actions">
          {selectedRegionId ? (
            // If a state IS selected, show "Back to States"
            <button className="menu-button" onClick={handleBackToStateSelect}>
              Back to States
            </button>
          ) : (
            // If NO state is selected, show "Back to Countries"
            <button className="menu-button" onClick={handleBackToCountrySelect}>
              Back to Countries
            </button>
          )}

          <button
            className="action-button start-campaign"
            onClick={() => {
              if (canStartCampaign) actions.startCampaign();
            }}
            disabled={!canStartCampaign}
          >
            Start Campaign!
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignSetupScreen;
