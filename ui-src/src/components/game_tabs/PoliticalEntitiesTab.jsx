// ui-src/src/components/game_tabs/PoliticalEntitiesTab.jsx
import React from "react";
import "./PoliticalEntitiesTab.css"; // Assuming common tab styling
import useStore from "../../store"; // CORRECTED: Changed to a default import
import {
  PartyDetail,
  LobbyingGroupDetail,
  NewsOutletDetail,
} from "../entityDetailViews";

// Helper functions (can be kept here or moved to a utils file)
const getPrimaryIdeologicalLean = (ideologyBiases) => {
  if (!ideologyBiases || Object.keys(ideologyBiases).length === 0)
    return "Centrist";
  let primaryLean = "Centrist";
  let maxBias = 0;
  for (const [ideology, bias] of Object.entries(ideologyBiases)) {
    if (Math.abs(bias) > Math.abs(maxBias)) {
      maxBias = bias;
      primaryLean = bias > 0 ? ideology : `Anti-${ideology}`;
    }
  }
  return primaryLean.charAt(0).toUpperCase() + primaryLean.slice(1);
};

// Main Component
function PoliticalEntitiesTab({ campaignData }) {
  // FIX: Select state and actions separately to prevent performance issues and crashes.
  const viewedEntity = useStore((state) => state.viewedEntity);
  const setViewedEntity = useStore((state) => state.actions.setViewedEntity);
  const clearViewedEntity = useStore(
    (state) => state.actions.clearViewedEntity
  );

  const politicalParties = campaignData?.startingCity?.politicalLandscape || [];
  const lobbyingGroups = campaignData?.lobbyingGroups || [];
  const newsOutlets = campaignData?.newsOutlets || [];

  // --- RENDER DETAIL VIEW ---
  // FIX: Check if viewedEntity itself exists before trying to access its properties.
  if (viewedEntity && viewedEntity.id) {
    let entityData;
    let DetailComponent;

    switch (viewedEntity.type) {
      case "party":
        entityData = politicalParties.find((p) => p.id === viewedEntity.id);
        DetailComponent = PartyDetail;
        break;
      case "lobbying":
        entityData = lobbyingGroups.find((g) => g.id === viewedEntity.id);
        DetailComponent = LobbyingGroupDetail;
        break;
      case "news":
        entityData = newsOutlets.find((o) => o.id === viewedEntity.id);
        DetailComponent = NewsOutletDetail;
        break;
      default:
        return <div>Error: Unknown entity type.</div>;
    }

    return (
      <div className="tab-content">
        <button onClick={clearViewedEntity} className="back-button menu-button">
          ← Back to Overview
        </button>
        {entityData ? (
          <DetailComponent
            party={entityData}
            group={entityData}
            outlet={entityData}
          />
        ) : (
          <div>Entity not found.</div>
        )}
      </div>
    );
  }

  // --- RENDER OVERVIEW LIST ---
  return (
    <div className="tab-content political-entities-tab-content">
      <h2>Political Entities Overview</h2>
      <p className="tab-description">
        Understand the key players and influential organizations shaping public
        opinion and policy in your nation.
      </p>

      {/* Political Parties Section */}
      <section className="entity-category">
        <h3>Political Parties</h3>
        <div className="entity-list">
          {politicalParties.map((party) => (
            <div
              key={party.id}
              className="entity-card party-card clickable"
              onClick={() => setViewedEntity(party.id, "party")}
            >
              <div className="party-header">
                {party.logoDataUrl && (
                  <img
                    src={party.logoDataUrl}
                    alt={`${party.name} logo`}
                    className="party-logo"
                  />
                )}
                <div className="party-info">
                  <h4 style={{ color: party.color || "#000" }}>{party.name}</h4>
                  <p>
                    <strong>Ideology:</strong> {party.ideology || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lobbying Groups Section */}
      <section className="entity-category">
        <h3>Lobbying Groups & Influence</h3>
        <div className="entity-list">
          {lobbyingGroups.map((group) => (
            <div
              key={group.id}
              className="entity-card lobbying-card clickable"
              onClick={() => setViewedEntity(group.id, "lobbying")}
            >
              <h4>{group.name}</h4>
              <p>
                <strong>Focus:</strong> {group.focus}
              </p>
              <p>
                <strong>Financial Power:</strong> {group.financialPower}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* News & Media Outlets Section */}
      <section className="entity-category">
        <h3>News & Media Outlets</h3>
        <div className="entity-list">
          {newsOutlets.map((outlet) => (
            <div
              key={outlet.id}
              className="entity-card news-card clickable"
              onClick={() => setViewedEntity(outlet.id, "news")}
            >
              <h4>{outlet.name}</h4>
              <p>
                <strong>Type:</strong> {outlet.type}
              </p>
              <p>
                <strong>Primary Lean:</strong>{" "}
                {getPrimaryIdeologicalLean(outlet.biases?.ideologyBiases)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PoliticalEntitiesTab;
