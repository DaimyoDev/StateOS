// ui-src/src/components/game_tabs/EntityDetailViews.jsx
import React, { useMemo } from "react";
import "../components/game_tabs/PoliticalEntitiesTab.css"; // We can reuse the same styles
import useGameStore from "../store";

// A helper function to format policy IDs into readable text.
const formatPolicyId = (id) => {
  if (!id) return "";
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// --- Party Detail View ---
const PartyDetail = ({ party }) => (
  <div className="entity-detail-view">
    <div
      className="detail-header party-header"
      style={{ borderLeftColor: party.color }}
    >
      {party.logoDataUrl && (
        <img
          src={party.logoDataUrl}
          alt={`${party.name} logo`}
          className="party-logo-large"
        />
      )}
      <div className="detail-info">
        <h1>{party.name}</h1>
        <p>
          <strong>Ideology:</strong> {party.ideology}
        </p>
        <p>
          <strong>National Popularity:</strong>{" "}
          {party.popularity?.toFixed(1) || "0.0"}%
        </p>
      </div>
    </div>

    <div className="detail-section">
      <h2>Factions</h2>
      <div className="entity-list">
        {party.factions?.map((faction) => (
          <div key={faction.id} className="faction-detail-card">
            <h4>{faction.name}</h4>
            <p>
              <strong>Sub-Ideology:</strong> {faction.ideology}
            </p>
            <p>
              <strong>Influence:</strong> {faction.influence?.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>

    <div className="detail-section">
      <h2>Key Members</h2>
      {/* This section will be populated later when party members are fully tracked */}
      <p>Detailed member information will be available soon.</p>
    </div>
  </div>
);

// --- Lobbying Group Detail View ---
const LobbyingGroupDetail = ({ group }) => (
  <div className="entity-detail-view">
    <div className="detail-header">
      <div className="detail-info">
        <h1>{group.name}</h1>
        <p>
          <strong>Primary Focus:</strong> {group.focus}
        </p>
        <p>
          <strong>Financial Power:</strong> {group.financialPower}
        </p>
      </div>
    </div>

    <div className="detail-section">
      <h2>Policy Stances</h2>
      <strong>Supports:</strong>
      <ul>
        {group.biases?.alignedPolicies?.map((policyId, index) => (
          <li key={`${policyId}-${index}`}>{formatPolicyId(policyId)}</li>
        ))}
      </ul>
      <strong>Opposes:</strong>
      <ul>
        {group.biases?.opposedPolicies?.map((policyId, index) => (
          <li key={`${policyId}-${index}`}>{formatPolicyId(policyId)}</li>
        ))}
      </ul>
    </div>

    <div className="detail-section">
      <h2>Key Contacts</h2>
      <div className="entity-list">
        {group.staff?.map((lobbyist) => (
          <div key={lobbyist.id} className="staff-detail-card">
            <h4>{lobbyist.name}</h4>
            <p>Negotiation Skill: {lobbyist.attributes.negotiation}</p>
            <p>Connections: {lobbyist.attributes.connections}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="detail-section">
      <h2>Actions</h2>
      <div className="action-buttons">
        <button className="action-button" disabled>
          Donate to Group (Future)
        </button>
        <button className="action-button" disabled>
          Request Meeting (Future)
        </button>
        <button className="action-button" disabled>
          Investigate Group (Future)
        </button>
      </div>
    </div>
  </div>
);

// --- News Outlet Detail View ---
const NewsOutletDetail = ({ outlet }) => {
  const allNewsItems = useGameStore((state) => state.newsItems);

  const outletArticles = useMemo(() => {
    return allNewsItems.filter((item) => item.outletId === outlet.id);
  }, [allNewsItems, outlet.id]);

  return (
    <div className="entity-detail-view">
      <div className="detail-header">
        <div className="detail-info">
          <h1>{outlet.name}</h1>
          <p>
            <strong>Type:</strong> {outlet.type}
          </p>
          <p>
            <strong>Audience Reach:</strong> {outlet.reach}
          </p>
          <p>
            <strong>Public Credibility:</strong> {outlet.credibility}
          </p>
        </div>
      </div>

      <div className="detail-section">
        <h2>Recent Articles</h2>
        <div className="news-feed-detail">
          {outletArticles.length > 0 ? (
            outletArticles.map((article) => (
              <div key={article.id} className="news-article-card">
                <h4>{article.headline}</h4>
                <p className="article-summary">{article.summary}</p>
                <div className="article-meta">
                  <span>By: {article.authorId || "Staff"}</span>
                  <span>{`${article.date.month}/${article.date.day}/${article.date.year}`}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No recent articles from this outlet.</p>
          )}
        </div>
      </div>

      <div className="detail-section">
        <h2>Key Journalists</h2>
        <div className="entity-list">
          {outlet.staff?.map((journalist) => (
            <div key={journalist.id} className="staff-detail-card">
              <h4>{journalist.name}</h4>
              <p>Integrity: {journalist.attributes.integrity}</p>
              <p>Writing Skill: {journalist.attributes.writingSkill}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h2>Actions</h2>
        <div className="action-buttons">
          <button className="action-button" disabled>
            Grant Interview (Future)
          </button>
          <button className="action-button" disabled>
            Submit Press Release (Future)
          </button>
          <button className="action-button" disabled>
            Buy Advertising (Future)
          </button>
        </div>
      </div>
    </div>
  );
};

export { PartyDetail, LobbyingGroupDetail, NewsOutletDetail };
