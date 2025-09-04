import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import { ELECTORAL_VOTES_BY_STATE } from "../../General Scripts/ElectoralCollegeSystem";
import "./StateElectionDetailModal.css";

// Import state county maps
import AlabamaMap from "../../maps/usaCounties/AlabamaMap";
import ArkansasMap from "../../maps/usaCounties/ArkansasMap";
import ArizonaMap from "../../maps/usaCounties/ArizonaMap";
import ConnecticutMap from "../../maps/usaCounties/ConnecticutMap";
import CaliforniaMap from "../../maps/usaCounties/CaliforniaMap";
import ColoradoMap from "../../maps/usaCounties/ColoradoMap";
import DelawareMap from "../../maps/usaCounties/DelwareMap";
import FloridaMap from "../../maps/usaCounties/FloridaMap";
import GeorgiaMap from "../../maps/usaCounties/GeorgiaMap";
import IdahoMap from "../../maps/usaCounties/IdahoMap";
import IllinoisMap from "../../maps/usaCounties/IllinoisMap";
import IndianaMap from "../../maps/usaCounties/IndianaMap";
import IowaMap from "../../maps/usaCounties/IowaMap";
import KansasMap from "../../maps/usaCounties/KansasMap";
import KentuckyMap from "../../maps/usaCounties/KentuckyMap";
import LousianaMap from "../../maps/usaCounties/LousianaMap";
import MaineMap from "../../maps/usaCounties/MaineMap";
import MarylandMap from "../../maps/usaCounties/MarylandMap";
import MassachusettsMap from "../../maps/usaCounties/MassachusettsMap";
import MichiganMap from "../../maps/usaCounties/MichiganMap";
import MinnesotaMap from "../../maps/usaCounties/MinnesotaMap";
import MississippiMap from "../../maps/usaCounties/MississippiMap";
import MissouriMap from "../../maps/usaCounties/MissouriMap";
import MontanaMap from "../../maps/usaCounties/MontanaMap";
import NebraskaMap from "../../maps/usaCounties/NebraskaMap";
import NevadaMap from "../../maps/usaCounties/NevadaMap";
import NewHampshireMap from "../../maps/usaCounties/NewHampshireMap";
import NewJerseyMap from "../../maps/usaCounties/NewJerseyMap";
import NewMexicoMap from "../../maps/usaCounties/NewMexicoMap";
import NewYorkMap from "../../maps/usaCounties/NewYorkMap";
import NorthCarolinaMap from "../../maps/usaCounties/NorthCarolinaMap";
import NorthDakotaMap from "../../maps/usaCounties/NorthDakotaMap";
import OhioMap from "../../maps/usaCounties/OhioMap";
import OklahomaMap from "../../maps/usaCounties/OklahomaMap";
import OregonMap from "../../maps/usaCounties/OregonMap";
import PennyslvaniaMap from "../../maps/usaCounties/PennsylvaniaMap";
import RhodeIslandMap from "../../maps/usaCounties/RhodeIslandMap";
import SouthCarolinaMap from "../../maps/usaCounties/SouthCarolinaMap";
import SouthDakotaMap from "../../maps/usaCounties/SouthDakotaMap";
import TennesseeMap from "../../maps/usaCounties/TennesseeMap";
import TexasMap from "../../maps/usaCounties/TexasMap";
import UtahMap from "../../maps/usaCounties/UtahMap";
import VermontMap from "../../maps/usaCounties/VermontMap";
import VirginiaMap from "../../maps/usaCounties/VirginiaMap";
import WashingtonMap from "../../maps/usaCounties/WashingtonMap";
import WestVirginiaMap from "../../maps/usaCounties/WestVirginiaMap";
import WisconsinMap from "../../maps/usaCounties/WisconsinMap";

const StateElectionDetailModal = ({ isOpen, onClose, stateId, stateName, stateResult, candidates }) => {
  const { availableCountries } = useGameStore();
  const [activeTab, setActiveTab] = useState("overview");

  // Find the state and its counties
  const { state, counties } = useMemo(() => {
    if (!stateId || !availableCountries) return { state: null, counties: [] };
    
    for (const country of availableCountries) {
      const foundState = country.regions?.find((r) => r.id === stateId);
      if (foundState) {
        const stateCounties = (country.secondAdminRegions || [])
          .filter((county) => county.stateId === stateId)
          .sort((a, b) => (b.population || 0) - (a.population || 0));
        return { state: foundState, counties: stateCounties };
      }
    }
    return { state: null, counties: [] };
  }, [stateId, availableCountries]);

  // Simulate county-level results for Electoral College
  const countyResults = useMemo(() => {
    if (!counties.length || !candidates.length || !stateResult?.candidatePolling) return [];

    return counties.map(county => {
      const countyPolling = new Map();
      
      // Simulate county variations from state polling
      stateResult.candidatePolling.forEach((statePercent, candidateId) => {
        // Add random variation (-10% to +10%) for each county
        const variation = (Math.random() - 0.5) * 20;
        const countyPercent = Math.max(0, Math.min(100, statePercent + variation));
        countyPolling.set(candidateId, countyPercent);
      });

      // Normalize to 100%
      const total = Array.from(countyPolling.values()).reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        countyPolling.forEach((val, candidateId) => {
          countyPolling.set(candidateId, Math.round((val / total) * 100));
        });
      }

      // Find winner
      let winner = null;
      let maxPercent = 0;
      countyPolling.forEach((percent, candidateId) => {
        if (percent > maxPercent) {
          maxPercent = percent;
          winner = candidates.find(c => c.id === candidateId);
        }
      });

      // Calculate margin (difference between 1st and 2nd place)
      const sortedResults = Array.from(countyPolling.entries())
        .sort(([,a], [,b]) => b - a);
      const margin = sortedResults.length >= 2 ? 
        sortedResults[0][1] - sortedResults[1][1] : sortedResults[0]?.[1] || 0;

      return {
        county,
        polling: countyPolling,
        winner,
        margin,
        totalVotes: Math.floor((county.population || 0) * (0.5 + Math.random() * 0.3)) // 50-80% turnout
      };
    });
  }, [counties, candidates, stateResult]);

  // Create heatmap data for county map
  const countyHeatmapData = useMemo(() => {
    if (!countyResults.length) return [];

    return countyResults.map(result => ({
      id: result.county.id,
      color: result.winner?.partyColor || "#cccccc",
      opacity: Math.max(0.4, Math.min(1.0, result.margin / 30)), // Opacity based on margin
      value: result.winner?.name || "No winner"
    }));
  }, [countyResults]);

  // Render appropriate state map
  const renderStateMap = () => {
    if (!state) return <div>Map not available</div>;

    const mapProps = {
      heatmapData: countyHeatmapData,
      viewType: "party_popularity"
    };

    // Map state IDs to their corresponding county map components
    switch (stateId) {
      case "USA_AL": return <AlabamaMap {...mapProps} />;
      case "USA_AR": return <ArkansasMap {...mapProps} />;
      case "USA_AZ": return <ArizonaMap {...mapProps} />;
      case "USA_CA": return <CaliforniaMap {...mapProps} />;
      case "USA_CO": return <ColoradoMap {...mapProps} />;
      case "USA_CT": return <ConnecticutMap {...mapProps} />;
      case "USA_DE": return <DelawareMap {...mapProps} />;
      case "USA_FL": return <FloridaMap {...mapProps} />;
      case "USA_GA": return <GeorgiaMap {...mapProps} />;
      case "USA_ID": return <IdahoMap {...mapProps} />;
      case "USA_IL": return <IllinoisMap {...mapProps} />;
      case "USA_IN": return <IndianaMap {...mapProps} />;
      case "USA_IA": return <IowaMap {...mapProps} />;
      case "USA_KS": return <KansasMap {...mapProps} />;
      case "USA_KY": return <KentuckyMap {...mapProps} />;
      case "USA_LA": return <LousianaMap {...mapProps} />;
      case "USA_ME": return <MaineMap {...mapProps} />;
      case "USA_MD": return <MarylandMap {...mapProps} />;
      case "USA_MA": return <MassachusettsMap {...mapProps} />;
      case "USA_MI": return <MichiganMap {...mapProps} />;
      case "USA_MN": return <MinnesotaMap {...mapProps} />;
      case "USA_MS": return <MississippiMap {...mapProps} />;
      case "USA_MO": return <MissouriMap {...mapProps} />;
      case "USA_MT": return <MontanaMap {...mapProps} />;
      case "USA_NE": return <NebraskaMap {...mapProps} />;
      case "USA_NV": return <NevadaMap {...mapProps} />;
      case "USA_NH": return <NewHampshireMap {...mapProps} />;
      case "USA_NJ": return <NewJerseyMap {...mapProps} />;
      case "USA_NM": return <NewMexicoMap {...mapProps} />;
      case "USA_NY": return <NewYorkMap {...mapProps} />;
      case "USA_NC": return <NorthCarolinaMap {...mapProps} />;
      case "USA_ND": return <NorthDakotaMap {...mapProps} />;
      case "USA_OH": return <OhioMap {...mapProps} />;
      case "USA_OK": return <OklahomaMap {...mapProps} />;
      case "USA_OR": return <OregonMap {...mapProps} />;
      case "USA_PA": return <PennyslvaniaMap {...mapProps} />;
      case "USA_RI": return <RhodeIslandMap {...mapProps} />;
      case "USA_SC": return <SouthCarolinaMap {...mapProps} />;
      case "USA_SD": return <SouthDakotaMap {...mapProps} />;
      case "USA_TN": return <TennesseeMap {...mapProps} />;
      case "USA_TX": return <TexasMap {...mapProps} />;
      case "USA_UT": return <UtahMap {...mapProps} />;
      case "USA_VT": return <VermontMap {...mapProps} />;
      case "USA_VA": return <VirginiaMap {...mapProps} />;
      case "USA_WA": return <WashingtonMap {...mapProps} />;
      case "USA_WV": return <WestVirginiaMap {...mapProps} />;
      case "USA_WI": return <WisconsinMap {...mapProps} />;
      default:
        return <div className="map-placeholder">County map not available for {stateName}</div>;
    }
  };

  if (!isOpen || !stateResult) return null;

  const electoralVotes = ELECTORAL_VOTES_BY_STATE[stateId] || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${stateName} - Presidential Election Results`}
      isLarge={true}
    >
      <div className="state-election-detail">
        {/* State Overview */}
        <div className="state-overview">
          <div className="state-header">
            <h3>{stateName}</h3>
            <div className="state-meta">
              <span className="electoral-votes">{electoralVotes} Electoral Votes</span>
              <span className="reporting">Reporting: {stateResult.reportingPercent || 0}%</span>
            </div>
          </div>

          {/* State Results */}
          {stateResult.hasStartedReporting && stateResult.candidatePolling && (
            <div className="state-results">
              <h4>Statewide Results</h4>
              <div className="candidate-results">
                {Array.from(stateResult.candidatePolling.entries())
                  .sort(([,a], [,b]) => b - a)
                  .map(([candidateId, percentage]) => {
                    const candidate = candidates.find(c => c.id === candidateId);
                    if (!candidate) return null;

                    return (
                      <div key={candidateId} className="candidate-result">
                        <div 
                          className="candidate-indicator"
                          style={{ backgroundColor: candidate.partyColor }}
                        />
                        <span className="candidate-name">{candidate.name}</span>
                        <span className="candidate-party">({candidate.partyName || "Independent"})</span>
                        <span className="candidate-percentage">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
              </div>
              {stateResult.winner && (
                <div className="state-winner">
                  <strong>Winner: {stateResult.winner.name}</strong>
                  <span className="winner-margin"> (Margin: {stateResult.margin?.toFixed(1)}%)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs for different views */}
        <div className="detail-tabs">
          <button 
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            County Map
          </button>
          <button 
            className={activeTab === "counties" ? "active" : ""}
            onClick={() => setActiveTab("counties")}
          >
            County Results
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="county-map-section">
              <h4>County-Level Results</h4>
              <div className="county-map-container">
                {renderStateMap()}
              </div>
              <div className="map-legend">
                <p>Colors represent winning candidate, opacity shows margin of victory</p>
              </div>
            </div>
          )}

          {activeTab === "counties" && (
            <div className="county-results-section">
              <h4>County Breakdown</h4>
              <div className="county-results-table">
                {countyResults.slice(0, 10).map(result => (
                  <div key={result.county.id} className="county-result-row">
                    <div className="county-name">{result.county.name}</div>
                    <div className="county-winner">
                      {result.winner ? (
                        <>
                          <span style={{ color: result.winner.partyColor }}>
                            {result.winner.name}
                          </span>
                          <span className="county-margin"> ({result.margin.toFixed(1)}%)</span>
                        </>
                      ) : (
                        "No results"
                      )}
                    </div>
                    <div className="county-votes">{result.totalVotes.toLocaleString()} votes</div>
                  </div>
                ))}
                {countyResults.length > 10 && (
                  <div className="county-more">
                    ...and {countyResults.length - 10} more counties
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StateElectionDetailModal;