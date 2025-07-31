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

function CountryDetailsScreen() {
  const actions = useGameStore((state) => state.actions);
  const viewingCountryId = useGameStore((state) => state.viewingCountryId);
  const country = useGameStore((state) =>
    state.availableCountries.find((c) => c.id === viewingCountryId)
  );

  const [mapView, setMapView] = useState("population"); // 'population', 'party_popularity', 'gdp'

  const mapData = useMemo(() => {
    if (!country?.regions) return [];

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
        return country.regions.map((region) => ({
          id: region.id,
          value: region.economicProfile?.gdpPerCapita || 0,
        }));

      case "population":
      default:
        return country.regions.map((region) => ({
          id: region.id,
          value: region.population || 0,
        }));
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

        <div className="data-table-container ui-panel">
          <h2>Regional Data</h2>
          <div className="table-wrapper">
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
                  .sort((a, b) => b.population - a.population)
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
                        <td>{region.population.toLocaleString()}</td>
                        <td>
                          $
                          {region.economicProfile.gdpPerCapita.toLocaleString()}
                        </td>
                        <td>{topParty.name}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryDetailsScreen;
