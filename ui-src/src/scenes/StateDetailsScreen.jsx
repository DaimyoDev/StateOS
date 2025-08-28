// StateDetailsScreen.jsx - State/region details with county-level heatmaps

import React, { useState, useMemo } from "react";
import useGameStore from "../store";
import { createDistrictMapData, getDistrictFillColor, getDistrictLabel, getCountyDistrictId } from "../utils/mapDistrictUtils";
import { countyPathData as texasCountyPathData } from "../maps/usaCounties/TexasMap";

// Import county maps for US states
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

import "./CountryDetailsScreen.css"; // Reuse country details styles

function StateDetailsScreen() {
  console.log("StateDetailsScreen is rendering!");
  const actions = useGameStore((state) => state.actions);
  const viewingStateId = useGameStore((state) => state.viewingStateId);
  const availableCountries = useGameStore((state) => state.availableCountries);
  
  const [mapView, setMapView] = useState("population");
  const [activeDataTab, setActiveDataTab] = useState("county");
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);

  // Find the country and state/region
  const { country, region: state } = useMemo(() => {
    if (!viewingStateId) return { country: null, region: null };
    
    for (const country of availableCountries) {
      const region = country.regions?.find((r) => r.id === viewingStateId);
      if (region) {
        return { country, region };
      }
    }
    return { country: null, region: null };
  }, [viewingStateId, availableCountries]);

  // Get secondary admin regions (counties) for this state
  const counties = useMemo(() => {
    if (!country || !state) return [];
    return (country.secondAdminRegions || [])
      .filter((county) => county.stateId === state.id)
      .sort((a, b) => (b.population || 0) - (a.population || 0));
  }, [country, state]);

  // Memoize district data and colors to prevent re-calculation on selection
  const { districtData, districtColors } = useMemo(() => {
    if (!state || !counties || counties.length === 0) {
      return { districtData: [], districtColors: [] };
    }
    let countyPathData = null;
    if (state.id === "USA_TX") {
      countyPathData = texasCountyPathData;
    }
    // We call createDistrictMapData without a selected district to get the base data.
    const { districtData, districtColors } = createDistrictMapData(state, counties, null, countyPathData, country);
    return { districtData, districtColors };
  }, [state, counties, country]);

  // Create the final map data, which DOES depend on the selected district
  const districtMapData = useMemo(() => {
    if (!districtData || districtData.length === 0) {
      return { districtData: [], districtColors: [], mapData: [], selectedDistrictId: null };
    }
    
    // Use createDistrictMapData to get the proper mapData with split county information
    let countyPathData = null;
    if (state.id === "USA_TX") {
      countyPathData = texasCountyPathData;
    }
    const { mapData } = createDistrictMapData(state, counties, selectedDistrictId, countyPathData, country);
    
    return { districtData, districtColors, mapData, selectedDistrictId };
  }, [districtData, districtColors, counties, selectedDistrictId, state, country]);

  const mapData = useMemo(() => {
    if (mapView === "congressional_districts") {
      // Pass the full district object. TexasMap guards range calc for this view.
      return districtMapData;
    }

    if (!counties || counties.length === 0) return [];

    const populations = counties.map((c) => c.population || 0);
    const maxPop = Math.max(...populations);
    const minPop = Math.min(...populations);
    const popRange = maxPop - minPop;

    const gdps = counties.map((c) => c.economicProfile?.gdpPerCapita || 0);
    const maxGdp = Math.max(...gdps);
    const minGdp = Math.min(...gdps);
    const gdpRange = maxGdp - minGdp;

    switch (mapView) {
      case "party_popularity":
        return counties.map((county) => {
          const landscape = county.politicalLandscape || [];
          if (landscape.length === 0) {
            return { id: county.id, color: "#cccccc", value: "No Data" };
          }
          const topParty = landscape.reduce((max, party) =>
            party.popularity > max.popularity ? party : max
          );
          return {
            id: county.id,
            color: topParty.color,
            value: `${topParty.name} (${topParty.popularity.toFixed(1)}%)`,
          };
        });

      case "gdp":
        return counties.map((county) => {
          const gdp = county.economicProfile?.gdpPerCapita || 0;
          const normalizedValue = gdpRange > 0 ? (gdp - minGdp) / gdpRange : 0;
          return {
            id: county.id,
            value: normalizedValue,
          };
        });

      case "population":
      default:
        return counties.map((county) => {
          const population = county.population || 0;
          const normalizedValue = popRange > 0 ? (population - minPop) / popRange : 0;
          return {
            id: county.id,
            value: normalizedValue,
          };
        });
    }
  }, [counties, mapView, districtMapData]);

  const renderMap = () => {
    if (!state || !country) {
      return (
        <div className="map-placeholder">
          <p>No state data available.</p>
        </div>
      );
    }

    // Only US states have county maps for now
    if (country.id !== "USA" || !state.id.startsWith("USA_")) {
      return (
        <div className="map-placeholder">
          <p>County map for {state.name} is not yet available.</p>
        </div>
      );
    }

    const props = {
      heatmapData: mapData,
      viewType: mapView,
    };

    // Map state IDs to their corresponding county map components
    switch (state.id) {
      case "USA_AL":
        return <AlabamaMap {...props} />;
      case "USA_AR":
        return <ArkansasMap {...props} />;
      case "USA_AZ":
        return <ArizonaMap {...props} />;
      case "USA_CA":
        return <CaliforniaMap {...props} />;
      case "USA_CO":
        return <ColoradoMap {...props} />;
      case "USA_CT":
        return <ConnecticutMap {...props} />;
      case "USA_DE":
        return <DelawareMap {...props} />;
      case "USA_FL":
        return <FloridaMap {...props} />;
      case "USA_GA":
        return <GeorgiaMap {...props} />;
      case "USA_ID":
        return <IdahoMap {...props} />;
      case "USA_IL":
        return <IllinoisMap {...props} />;
      case "USA_IN":
        return <IndianaMap {...props} />;
      case "USA_IA":
        return <IowaMap {...props} />;
      case "USA_KS":
        return <KansasMap {...props} />;
      case "USA_KY":
        return <KentuckyMap {...props} />;
      case "USA_LA":
        return <LousianaMap {...props} />;
      case "USA_ME":
        return <MaineMap {...props} />;
      case "USA_MD":
        return <MarylandMap {...props} />;
      case "USA_MA":
        return <MassachusettsMap {...props} />;
      case "USA_MI":
        return <MichiganMap {...props} />;
      case "USA_MN":
        return <MinnesotaMap {...props} />;
      case "USA_MS":
        return <MississippiMap {...props} />;
      case "USA_MO":
        return <MissouriMap {...props} />;
      case "USA_MT":
        return <MontanaMap {...props} />;
      case "USA_NE":
        return <NebraskaMap {...props} />;
      case "USA_NV":
        return <NevadaMap {...props} />;
      case "USA_NH":
        return <NewHampshireMap {...props} />;
      case "USA_NJ":
        return <NewJerseyMap {...props} />;
      case "USA_NM":
        return <NewMexicoMap {...props} />;
      case "USA_NY":
        return <NewYorkMap {...props} />;
      case "USA_NC":
        return <NorthCarolinaMap {...props} />;
      case "USA_ND":
        return <NorthDakotaMap {...props} />;
      case "USA_OH":
        return <OhioMap {...props} />;
      case "USA_OK":
        return <OklahomaMap {...props} />;
      case "USA_OR":
        return <OregonMap {...props} />;
      case "USA_PA":
        return <PennyslvaniaMap {...props} />;
      case "USA_RI":
        return <RhodeIslandMap {...props} />;
      case "USA_SC":
        return <SouthCarolinaMap {...props} />;
      case "USA_SD":
        return <SouthDakotaMap {...props} />;
      case "USA_TN":
        return <TennesseeMap {...props} />;
      case "USA_TX":
        return <TexasMap {...props} />;
      case "USA_UT":
        return <UtahMap {...props} />;
      case "USA_VT":
        return <VermontMap {...props} />;
      case "USA_VA":
        return <VirginiaMap {...props} />;
      case "USA_WA":
        return <WashingtonMap {...props} />;
      case "USA_WV":
        return <WestVirginiaMap {...props} />;
      case "USA_WI":
        return <WisconsinMap {...props} />;
      default:
        return (
          <div className="map-placeholder">
            <p>County map for {state.name} is not yet available.</p>
          </div>
        );
    }
  };

  if (!state || !country) {
    return (
      <div className="fullscreen-container">
        <h2 className="important-heading">Loading state data...</h2>
        <button className="menu-button" onClick={actions.navigateBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="fullscreen-container">
      <div className="fullscreen-header">
        <h1 className="important-heading">
          {state.name}, {country.name}
        </h1>
        <div className="header-buttons">
          <button className="menu-button" onClick={actions.navigateBack}>
            Back to Campaign Setup
          </button>
        </div>
      </div>

      <div className="country-details-content-area">
        <div className="country-details-main-panels">
          {/* Map view for counties */}
          {activeDataTab === "county" && (
            <div className="map-view-container ui-panel">
              <div className="map-controls">
                <h3>County Map Views</h3>
                {console.log("Rendering map controls, country:", country?.id, "state:", state?.id)}
                <button
                  onClick={() => setMapView("population")}
                  className={`menu-button ${
                    mapView === "population" ? "active" : ""
                  }`}
                >
                  Population
                </button>
                <button
                  onClick={() => setMapView("party_popularity")}
                  className={`menu-button ${
                    mapView === "party_popularity" ? "active" : ""
                  }`}
                >
                  Political Leanings
                </button>
                <button
                  onClick={() => setMapView("gdp")}
                  className={`menu-button ${mapView === "gdp" ? "active" : ""}`}
                >
                  GDP per Capita
                </button>
                <button
                  onClick={() => setMapView("congressional_districts")}
                  className={`menu-button ${
                    mapView === "congressional_districts" ? "active" : ""
                  }`}
                >
                  Congressional Districts
                </button>
              </div>
              <div className="map-render-wrapper-details">{renderMap()}</div>
            </div>
          )}

          {/* Data container with tabs - replaced by district selection in congressional view */}
          {mapView === "congressional_districts" && activeDataTab === "county" ? (
            <div className="districts-selection-panel-right ui-panel">
              <h3>Congressional Districts</h3>
              <div className="districts-buttons">
                <button
                  onClick={() => setSelectedDistrictId(null)}
                  className={`district-button ${selectedDistrictId === null ? "active" : ""}`}
                >
                  All Districts
                </button>
                {districtMapData.districtData.map((district, index) => (
                  <button
                    key={district.id}
                    onClick={() => setSelectedDistrictId(district.id)}
                    className={`district-button ${selectedDistrictId === district.id ? "active" : ""}`}
                    style={{
                      borderLeft: `4px solid ${districtMapData.districtColors[index]}`,
                    }}
                  >
                    District {district.id}
                    <span className="district-population">
                      {district.population.toLocaleString()}
                    </span>
                    <div className="district-counties">
                      {district.counties.length} counties
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Split County Details Section */}
              {(() => {
                const splitCounties = districtMapData.mapData?.filter(county => county.isSplit) || [];
                if (splitCounties.length === 0) return null;
                
                return (
                  <div className="split-counties-section">
                    <h4>Split County Details</h4>
                    <div className="split-counties-list">
                      {splitCounties.map((county) => {
                        const countyName = counties.find(c => c.id === county.id)?.name || 'Unknown County';
                        const totalPopulation = counties.find(c => c.id === county.id)?.population || 0;
                        
                        return (
                          <div key={county.id} className="split-county-item">
                            <div className="split-county-header">
                              <strong>{countyName}</strong>
                              <span className="split-county-total">
                                Total: {totalPopulation.toLocaleString()}
                              </span>
                            </div>
                            <div className="split-county-breakdown">
                              {county.splitDetails?.map((detail, index) => {
                                const districtColor = districtMapData.districtColors[
                                  districtMapData.districtData.findIndex(d => d.id === detail.districtId)
                                ] || '#cccccc';
                                
                                return (
                                  <div key={index} className="split-detail-item">
                                    <div 
                                      className="district-color-indicator"
                                      style={{ backgroundColor: districtColor }}
                                    ></div>
                                    <span className="district-label">District {detail.districtId}:</span>
                                    <span className="district-population">
                                      {detail.population.toLocaleString()} people
                                    </span>
                                    <span className="district-percentage">
                                      ({((detail.population / totalPopulation) * 100).toFixed(1)}%)
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div
              className={`data-table-container ui-panel ${
                activeDataTab === "state" ? "full-width" : ""
              }`}
            >
              <div className="data-tab-navigation">
                <button
                  onClick={() => setActiveDataTab("county")}
                  className={activeDataTab === "county" ? "active" : ""}
                >
                  County Data
                </button>
                <button
                  onClick={() => setActiveDataTab("state")}
                  className={activeDataTab === "state" ? "active" : ""}
                >
                  State Overview
                </button>
              </div>

          {activeDataTab === "state" && (
            <div className="data-tab-content">
              <h2>{state.name} at a Glance</h2>
              <div className="national-stats-summary">
                <p>
                  <strong>Population:</strong>{" "}
                  {state.population?.toLocaleString()}
                </p>
                <p>
                  <strong>GDP per Capita:</strong> $
                  {state.economicProfile?.gdpPerCapita?.toLocaleString()}
                </p>
                <p>
                  <strong>Key Issues:</strong>{" "}
                  {state.stats?.mainIssues?.join(", ")}
                </p>
                {state.capital && (
                  <p>
                    <strong>Capital:</strong> {state.capital}
                  </p>
                )}
                <div>
                  <strong>Top Political Parties:</strong>
                  <ul>
                    {(state.politicalLandscape || [])
                      .slice(0, 5)
                      .map((party) => (
                        <li key={party.id}>
                          {party.name}: {party.popularity.toFixed(1)}%
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeDataTab === "county" && (
            <div className="data-tab-content">
              <h2>County Data</h2>
              <div className="table-wrapper">
                {counties.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>County Name</th>
                        <th>Population</th>
                        <th>GDP per Capita</th>
                        <th>Top Party</th>
                      </tr>
                    </thead>
                    <tbody>
                      {counties.map((county) => {
                        const landscape = county.politicalLandscape || [];
                        const topParty =
                          landscape.length > 0
                            ? landscape.reduce((max, p) =>
                                p.popularity > max.popularity ? p : max
                              )
                            : { name: "N/A" };

                        return (
                          <tr key={county.id}>
                            <td>{county.name}</td>
                            <td>{county.population?.toLocaleString() || "N/A"}</td>
                            <td>
                              ${county.economicProfile?.gdpPerCapita?.toLocaleString() || "N/A"}
                            </td>
                            <td>{topParty.name}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>No county data available for this state.</p>
                )}
              </div>
            </div>
          )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StateDetailsScreen;