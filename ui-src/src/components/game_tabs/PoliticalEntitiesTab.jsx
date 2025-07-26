// ui-src/src/components/game_tabs/PoliticalEntitiesTab.jsx
import React from "react";
import "./PoliticalEntitiesTab.css"; // Assuming common tab styling
// You might also want to import PartyLogo if you have one, or just display party names

function PoliticalEntitiesTab({ campaignData }) {
  // Access data from campaignData prop
  const politicalParties = campaignData?.startingCity?.politicalLandscape || []; // Assuming parties are already in politicalLandscape
  const lobbyingGroups = campaignData?.lobbyingGroups || [];
  const newsOutlets = campaignData?.newsOutlets || [];

  return (
    <div className="tab-content political-entities-tab-content">
      <h2>Political Entities Overview</h2>
      <p className="tab-description">
        Understand the key players and influential organizations shaping public
        opinion and policy in your nation.
      </p>

      <section className="entity-category">
        <h3>Political Parties</h3>
        <div className="entity-list">
          {politicalParties.length > 0 ? (
            politicalParties.map((party) => (
              <div key={party.id} className="entity-card party-card">
                <h4>{party.name}</h4>
                <p>
                  <strong>Leader:</strong> {party.leaderName || "N/A"}
                </p>{" "}
                {/* Adjust based on actual party object structure */}
                <p>
                  <strong>Ideology:</strong> {party.ideology || "N/A"}
                </p>
                <p>
                  <strong>Popularity:</strong>{" "}
                  {party.popularity ? party.popularity.toFixed(1) : "0.0"}%
                </p>
                <p>{party.description || "No description available."}</p>
              </div>
            ))
          ) : (
            <p>No political parties found.</p>
          )}
        </div>
      </section>

      <section className="entity-category">
        <h3>Lobbying Groups & Influence</h3>
        <div className="entity-list">
          {lobbyingGroups.length > 0 ? (
            lobbyingGroups.map((group) => (
              <div key={group.id} className="entity-card lobbying-card">
                <h4>{group.name}</h4>
                <p>
                  <strong>Primary Focus:</strong> {group.focus}
                </p>
                <p>
                  <strong>Influence Level:</strong> {group.influence}
                </p>
                <p>{group.description}</p>
              </div>
            ))
          ) : (
            <p>No lobbying groups found.</p>
          )}
        </div>
      </section>

      <section className="entity-category">
        <h3>News & Media Outlets</h3>
        <div className="entity-list">
          {newsOutlets.length > 0 ? (
            newsOutlets.map((outlet) => (
              <div key={outlet.id} className="entity-card news-card">
                <h4>{outlet.name}</h4>
                <p>
                  <strong>Type:</strong> {outlet.type}
                </p>
                <p>
                  <strong>Bias:</strong> {outlet.bias}
                </p>
                <p>
                  <strong>Reach:</strong> {outlet.reach}
                </p>
                <p>{outlet.description}</p>
              </div>
            ))
          ) : (
            <p>No news outlets found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default PoliticalEntitiesTab;
