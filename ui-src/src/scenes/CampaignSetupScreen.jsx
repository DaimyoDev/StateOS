import React, { useState, useEffect } from "react";
import useGameStore from "../store";
import JapanMap from "../maps/JapanMap";
import PhilippinesMap from "../maps/PhilippinesMap";
import UnitedStatesMap from "../maps/UnitedStatesMap";
import AlabamaMap from "../maps/usaCounties/AlabamaMap";
import ArkansasMap from "../maps/usaCounties/ArkansasMap";
import ArizonaMap from "../maps/usaCounties/ArizonaMap";
import ConnecticutMap from "../maps/usaCounties/ConnecticutMap";
import CaliforniaMap from "../maps/usaCounties/CaliforniaMap";
import ColoradoMap from "../maps/usaCounties/ColoradoMap";
import DelawareMap from "../maps/usaCounties/DelwareMap";
import FloridaMap from "../maps/usaCounties/FloridaMap";
import GeorgiaMap from "../maps/usaCounties/GeorgiaMap";
import IdahoMap from "../maps/usaCounties/IdahoMap";
import IllinoisMap from "../maps/usaCounties/IllinoisMap";
import IndianaMap from "../maps/usaCounties/IndianaMap";
import IowaMap from "../maps/usaCounties/IowaMap";
import KansasMap from "../maps/usaCounties/KansasMap";
import KentuckyMap from "../maps/usaCounties/KentuckyMap";
import LousianaMap from "../maps/usaCounties/LousianaMap";
import MaineMap from "../maps/usaCounties/MaineMap";
import MarylandMap from "../maps/usaCounties/MarylandMap";
import MassachusettsMap from "../maps/usaCounties/MassachusettsMap";
import MichiganMap from "../maps/usaCounties/MichiganMap";
import MinnesotaMap from "../maps/usaCounties/MinnesotaMap";
import MississippiMap from "../maps/usaCounties/MississippiMap";
import MissouriMap from "../maps/usaCounties/MissouriMap";
import MontanaMap from "../maps/usaCounties/MontanaMap";
import NebraskaMap from "../maps/usaCounties/NebraskaMap";
import NevadaMap from "../maps/usaCounties/NevadaMap";
import NewHampshireMap from "../maps/usaCounties/NewHampshireMap";
import NewJerseyMap from "../maps/usaCounties/NewJerseyMap";
import NewMexicoMap from "../maps/usaCounties/NewMexicoMap";
import NewYorkMap from "../maps/usaCounties/NewYorkMap";
import NorthCarolinaMap from "../maps/usaCounties/NorthCarolinaMap";
import NorthDakotaMap from "../maps/usaCounties/NorthDakotaMap";
import OhioMap from "../maps/usaCounties/OhioMap";
import OklahomaMap from "../maps/usaCounties/OklahomaMap";
import OregonMap from "../maps/usaCounties/OregonMap";
import PennyslvaniaMap from "../maps/usaCounties/PennsylvaniaMap";
import RhodeIslandMap from "../maps/usaCounties/RhodeIslandMap";
import SouthCarolinaMap from "../maps/usaCounties/SouthCarolinaMap";
import SouthDakotaMap from "../maps/usaCounties/SouthDakotaMap";
import TennesseeMap from "../maps/usaCounties/TennesseeMap";
import TexasMap from "../maps/usaCounties/TexasMap";
import UtahMap from "../maps/usaCounties/UtahMap";
import VermontMap from "../maps/usaCounties/VermontMap";
import VirginiaMap from "../maps/usaCounties/VirginiaMap";
import WashingtonMap from "../maps/usaCounties/WashingtonMap";
import WestVirginiaMap from "../maps/usaCounties/WestVirginiaMap";
import WisconsinMap from "../maps/usaCounties/WisconsinMap";
import SouthKoreaMap from "../maps/SouthKoreaMap";
import GermanyMap from "../maps/GermanyMap";
import CanadaMap from "../maps/CanadaMap";
import { BASE_COUNTRIES_DATA } from "../data/countriesData";
import "./CampaignSetupScreen.css";
import RegionPieChart from "../components/charts/RegionPieChart";
import ArgentinianMap from "../maps/ArgentinianMap";
import AustralianMap from "../maps/AustraliaMap";
import AustrianMap from "../maps/AustrianMap";
import BelgianMap from "../maps/BelgianMap";
import FranceMap from "../maps/FranceMap";
import GreatBritainMap from "../maps/GreatBritainMap";
import ItalyMap from "../maps/ItalyMap";
import SpainMap from "../maps/SpainMap";
import PolandMap from "../maps/PolandMap";
import SwedenMap from "../maps/SwedenMap";

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

  // Destructure selectedCountryId from the store state
  const { selectedCountryId } = currentCampaignSetup || {};

  // --- CORRECTED LOGIC ---
  // Use an effect to sync the stage with the global state after the component mounts.
  useEffect(() => {
    if (selectedCountryId) {
      setSetupStage("region_selection");
    }
  }, [selectedCountryId]); // This effect runs when the component mounts and if selectedCountryId changes.
  // --- END OF FIX ---

  // New state to temporarily hold the selected country before confirmation
  const [tempSelectedCountryId, setTempSelectedCountryId] = useState(null);

  const [selectedRegionInfo, setSelectedRegionInfo] = useState({
    id: null,
    name: null,
  });

  const {
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

            {selectedRegionId === "USA_AR" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Arizona.
                </p>
                <div className="map-render-wrapper">
                  <ArkansasMap
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

            {selectedRegionId === "USA_CO" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Colorado.
                </p>
                <div className="map-render-wrapper">
                  <ColoradoMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_DE" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Delaware.
                </p>
                <div className="map-render-wrapper">
                  <DelawareMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_FL" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Florida.
                </p>
                <div className="map-render-wrapper">
                  <FloridaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_GA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Georgia.
                </p>
                <div className="map-render-wrapper">
                  <GeorgiaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_ID" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Idaho.
                </p>
                <div className="map-render-wrapper">
                  <IdahoMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_IL" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Illinois.
                </p>
                <div className="map-render-wrapper">
                  <IllinoisMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_IN" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Indiana.
                </p>
                <div className="map-render-wrapper">
                  <IndianaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_IA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Iowa.
                </p>
                <div className="map-render-wrapper">
                  <IowaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_KS" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Kansas.
                </p>
                <div className="map-render-wrapper">
                  <KansasMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_LA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in LousianaMap.
                </p>
                <div className="map-render-wrapper">
                  <LousianaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_ME" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Maine.
                </p>
                <div className="map-render-wrapper">
                  <MaineMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MD" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Maryland.
                </p>
                <div className="map-render-wrapper">
                  <MarylandMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Massachusetts.
                </p>
                <div className="map-render-wrapper">
                  <MassachusettsMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MI" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Michigan.
                </p>
                <div className="map-render-wrapper">
                  <MichiganMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MN" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Minnesota.
                </p>
                <div className="map-render-wrapper">
                  <MinnesotaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MS" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Mississippi.
                </p>
                <div className="map-render-wrapper">
                  <MississippiMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_KY" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Kentucky.
                </p>
                <div className="map-render-wrapper">
                  <KentuckyMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MO" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Missouri.
                </p>
                <div className="map-render-wrapper">
                  <MissouriMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_MT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Montana.
                </p>
                <div className="map-render-wrapper">
                  <MontanaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NE" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Nebraska.
                </p>
                <div className="map-render-wrapper">
                  <NebraskaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NV" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Nevada.
                </p>
                <div className="map-render-wrapper">
                  <NevadaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NH" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in New Hampshire.
                </p>
                <div className="map-render-wrapper">
                  <NewHampshireMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NJ" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in New Jersey.
                </p>
                <div className="map-render-wrapper">
                  <NewJerseyMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NM" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in New Mexico.
                </p>
                <div className="map-render-wrapper">
                  <NewMexicoMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NY" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in New York.
                </p>
                <div className="map-render-wrapper">
                  <NewYorkMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_NC" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in North Carolina.
                </p>
                <div className="map-render-wrapper">
                  <NorthCarolinaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_ND" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in North Dakota.
                </p>
                <div className="map-render-wrapper">
                  <NorthDakotaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_OH" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Ohio.
                </p>
                <div className="map-render-wrapper">
                  <OhioMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_OK" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Oklahoma.
                </p>
                <div className="map-render-wrapper">
                  <OklahomaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_OR" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Oregon.
                </p>
                <div className="map-render-wrapper">
                  <OregonMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_PA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Pennyslvania.
                </p>
                <div className="map-render-wrapper">
                  <PennyslvaniaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_RI" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Rhode Island.
                </p>
                <div className="map-render-wrapper">
                  <RhodeIslandMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_SC" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in South Carolina.
                </p>
                <div className="map-render-wrapper">
                  <SouthCarolinaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_SD" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in South Dakota.
                </p>
                <div className="map-render-wrapper">
                  <SouthDakotaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_TN" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Tennessee.
                </p>
                <div className="map-render-wrapper">
                  <TennesseeMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_TX" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Texas.
                </p>
                <div className="map-render-wrapper">
                  <TexasMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_UT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Utah.
                </p>
                <div className="map-render-wrapper">
                  <UtahMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_VT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Vermont.
                </p>
                <div className="map-render-wrapper">
                  <VermontMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_VA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Virginia.
                </p>
                <div className="map-render-wrapper">
                  <VirginiaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_WA" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Washington.
                </p>
                <div className="map-render-wrapper">
                  <WashingtonMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_WV" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in West Virginia.
                </p>
                <div className="map-render-wrapper">
                  <WestVirginiaMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_WI" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Wisconsin.
                </p>
                <div className="map-render-wrapper">
                  <WisconsinMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_VT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Vermont.
                </p>
                <div className="map-render-wrapper">
                  <VermontMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_VT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Vermont.
                </p>
                <div className="map-render-wrapper">
                  <VermontMap
                    onSelectCounty={(countyId) =>
                      actions.setSelectedSecondAdminRegion(countyId)
                    }
                    selectedCountyGameId={selectedSecondAdminRegionId}
                  />
                </div>
              </>
            )}

            {selectedRegionId === "USA_VT" && (
              <>
                <p className="map-instruction-cs">
                  Now, select a starting county in Vermont.
                </p>
                <div className="map-render-wrapper">
                  <VermontMap
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
        {selectedCountryId === "ARG" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <ArgentinianMap
                onSelectState={handleRegionSelectionFromMap}
                selectedStateGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "AUS" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <AustralianMap
                onSelectState={handleRegionSelectionFromMap}
                selectedStateGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "AUT" && (
          <>
            <p className="map-instruction-cs">
              Click on a state to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <AustrianMap
                onSelectState={handleRegionSelectionFromMap}
                selectedStateGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "BEL" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <BelgianMap
                onSelectRegion={handleRegionSelectionFromMap}
                selectedRegionGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "FRA" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <FranceMap
                onSelectRegion={handleRegionSelectionFromMap}
                selectedRegionGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "GBR" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <GreatBritainMap
                onSelectRegion={handleRegionSelectionFromMap}
                selectedRegionGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "ITA" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <ItalyMap
                onSelectRegion={handleRegionSelectionFromMap}
                selectedRegionGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "ESP" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <SpainMap
                onSelectProvince={handleRegionSelectionFromMap}
                selectedProvinceGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "POL" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <PolandMap
                onSelectRegion={handleRegionSelectionFromMap}
                selectedRegionGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {selectedCountryId === "SWE" && (
          <>
            <p className="map-instruction-cs">
              Click on a region to begin your political career there.
            </p>
            <div className="map-render-wrapper">
              <SwedenMap
                onSelectRegion={handleRegionSelectionFromMap}
                selectedRegionGameId={selectedRegionId}
              />
            </div>
          </>
        )}
        {currentSelectedCountryData &&
          ![
            "JPN",
            "PHL",
            "USA",
            "KOR",
            "GER",
            "CAN",
            "ARG",
            "AUS",
            "AUT",
            "BEL",
            "FRA",
            "GBR",
            "ITA",
            "ESP",
            "POL",
            "SWE",
          ].includes(selectedCountryId) && (
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
        <div className="view-details-buttons" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            className="menu-button view-details-button"
            onClick={() => actions.navigateToCountryDetails(selectedCountryId)}
          >
            View Country Details & Maps
          </button>
          {selectedRegionId && (
            <button
              className="menu-button view-details-button"
              onClick={() => actions.navigateToStateDetails(selectedRegionId)}
            >
              View State Details & Maps
            </button>
          )}
        </div>
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
