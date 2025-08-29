// Create a new file at: src/screens/CountryDetailsScreen.jsx

import React, { useState, useMemo } from "react";
import useGameStore from "../store";
import JapanMap from "../maps/JapanMap";
import PhilippinesMap from "../maps/PhilippinesMap";
import UnitedStatesMap from "../maps/UnitedStatesMap";
import SouthKoreaMap from "../maps/SouthKoreaMap";
import GermanyMap from "../maps/GermanyMap";
import CanadaMap from "../maps/CanadaMap";
import "./CountryDetailsScreen.css"; // We will create this file next
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

function CountryDetailsScreen() {
  const actions = useGameStore((state) => state.actions);
  const viewingCountryId = useGameStore((state) => state.viewingCountryId);
  const country = useGameStore((state) =>
    state.availableCountries.find((c) => c.id === viewingCountryId)
  );

  const [mapView, setMapView] = useState("population");
  const [activeDataTab, setActiveDataTab] = useState("regional");

  const mapData = useMemo(() => {
    if (!country?.regions) return [];

    const populations = country.regions.map((r) => r.population || 0);
    const maxPop = Math.max(...populations);
    const minPop = Math.min(...populations);
    const popRange = maxPop - minPop;

    const gdps = country.regions.map(
      (r) => r.economicProfile?.gdpPerCapita || 0
    );
    const maxGdp = Math.max(...gdps);
    const minGdp = Math.min(...gdps);
    const gdpRange = maxGdp - minGdp;

    switch (mapView) {
      case "party_popularity":
        return country.regions.map((region) => {
          const landscape = region.politicalLandscape || [];
          if (landscape.length === 0) {
            return { id: region.id, color: "#cccccc", value: "No Data" };
          }
          const topParty = landscape.reduce((max, party) =>
            party.popularity > max.popularity ? party : max
          );
          return {
            id: region.id,
            color: topParty.color,
            value: `${topParty.name} (${topParty.popularity.toFixed(1)}%)`,
          };
        });

      case "gdp":
        return country.regions.map((region) => {
          const gdp = region.economicProfile?.gdpPerCapita || 0;
          const normalizedValue = gdpRange > 0 ? (gdp - minGdp) / gdpRange : 0;
          return {
            id: region.id,
            value: normalizedValue,
          };
        });

      case "population":
      default:
        return country.regions.map((region) => {
          const population = region.population || 0;
          const normalizedValue =
            popRange > 0 ? (population - minPop) / popRange : 0;
          return {
            id: region.id,
            value: normalizedValue,
          };
        });
    }
  }, [country, mapView]);

  const renderMap = () => {
    const props = {
      heatmapData: mapData,
      viewType: mapView,
    };

    switch (country.id) {
      case "USA":
        return <UnitedStatesMap {...props} />;
      case "JPN":
        return <JapanMap {...props} />;
      case "PHL":
        return <PhilippinesMap {...props} />;
      case "KOR":
        return <SouthKoreaMap {...props} />;
      case "GER":
        return <GermanyMap {...props} />;
      case "CAN":
        return <CanadaMap {...props} />;
      case "ARG":
        return <ArgentinianMap {...props} />;
      case "AUS":
        return <AustralianMap {...props} />;
      case "AUT":
        return <AustrianMap {...props} />;
      case "BEL":
        return <BelgianMap {...props} />;
      case "FRA":
        return <FranceMap {...props} />;
      case "GBR":
        return <GreatBritainMap {...props} />;
      case "ITA":
        return <ItalyMap {...props} />;
      case "ESP":
        return <SpainMap {...props} />;
      case "POL":
        return <PolandMap {...props} />;
      case "SWE":
        return <SwedenMap {...props} />;
      default:
        return (
          <div className="map-placeholder">
            <p>Detailed map for {country.name} is not available.</p>
          </div>
        );
    }
  };

  if (!country) {
    return (
      <div className="fullscreen-container">
        <h2 className="important-heading">Loading country data...</h2>
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
          {country.flag} {country.name}
        </h1>
        <button className="menu-button" onClick={actions.navigateBack}>
          Back to Campaign Setup
        </button>
      </div>

      <div className="country-details-content-area">
        <div className="country-details-main-panels">
          {/* Map is now conditionally rendered */}
          {activeDataTab === "regional" && (
            <div className="map-view-container ui-panel">
              <div className="map-controls">
                <h3>Map Views</h3>
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
              </div>
              <div className="map-render-wrapper-details">{renderMap()}</div>
            </div>
          )}

          {/* Data container now has tabs */}
          <div
            className={`data-table-container ui-panel ${
              activeDataTab === "national" ? "full-width" : ""
            }`}
          >
            <div className="data-tab-navigation">
              <button
                onClick={() => setActiveDataTab("regional")}
                className={activeDataTab === "regional" ? "active" : ""}
              >
                Regional Data
              </button>
              <button
                onClick={() => setActiveDataTab("national")}
                className={activeDataTab === "national" ? "active" : ""}
              >
                National Data
              </button>
            </div>

          {activeDataTab === "national" && (
            <div className="data-tab-content">
              <h2>{country.name} at a Glance</h2>
              <div className="national-stats-summary">
                {/* National data JSX moved here */}
                <p>
                  <strong>Total Population:</strong>{" "}
                  {country.population?.toLocaleString()}
                </p>
                <p>
                  <strong>GDP per Capita:</strong> $
                  {country.gdpPerCapita?.toLocaleString()}
                </p>
                <p>
                  <strong>Key Issues:</strong>{" "}
                  {country.stats?.mainIssues?.join(", ")}
                </p>
                <div>
                  <strong>Ethnicities:</strong>
                  <ul>
                    {Object.entries(
                      country.demographics?.ethnicities || {}
                    ).map(([key, val]) => (
                      <li key={key}>
                        {key}: {val.toFixed(1)}%
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeDataTab === "regional" && (
            <div className="data-tab-content">
              <h2>Regional Data</h2>
              <div className="table-wrapper">
                {/* Regional data table JSX moved here */}
                <table>
                  <thead>
                    <tr>
                      <th>Region Name</th>
                      <th>Population</th>
                      <th>GDP per Capita</th>
                      <th>Top Party</th>
                    </tr>
                  </thead>
                  <tbody>
                    {country.regions
                      .sort((a, b) => (b.population || 0) - (a.population || 0))
                      .map((region) => {
                        const landscape = region.politicalLandscape || [];
                        const topParty =
                          landscape.length > 0
                            ? landscape.reduce((max, p) =>
                                p.popularity > max.popularity ? p : max
                              )
                            : { name: "N/A" };

                        return (
                          <tr key={region.id}>
                            <td>{region.name}</td>
                            <td>{region.population?.toLocaleString() || "N/A"}</td>
                            <td>
                              $
                              {region.economicProfile?.gdpPerCapita?.toLocaleString() || "N/A"}
                            </td>
                            <td>{topParty.name}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryDetailsScreen;
