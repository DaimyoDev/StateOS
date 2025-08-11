// ui-src/src/components/game_tabs/EntityDetailViews.jsx
import React, { useMemo, useState } from "react";
import "../components/game_tabs/PoliticalEntitiesTab.css"; // We can reuse the same styles
import useGameStore from "../store";
import PoliticianCard from "../components/PoliticianCard";
import { formatOfficeTitleForDisplay } from "../utils/governmentUtils";

// A helper function to format policy IDs into readable text.
// A helper function to format policy IDs into readable text.
const formatPolicyId = (id) => {
  if (!id) return "";
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// --- Party Detail View ---
const PartyDetail = ({ party }) => {
  const [viewingStancesOf, setViewingStancesOf] = useState(null); // Can be party ID or faction ID
  const actions = useGameStore((state) => state.actions);
  const governmentOffices = useGameStore(
    (state) => state.activeCampaign?.governmentOffices || []
  );
  const cityName = useGameStore(
    (state) => state.activeCampaign?.startingCity?.name
  );

  // Memoized calculation to find all elected members of the current party
  const partyMembers = useMemo(() => {
    if (!party || !governmentOffices) return [];
    const members = [];
    governmentOffices.forEach((office) => {
      const addOfficial = (official) => {
        if (
          official &&
          (official.partyId === party.id || official.partyName === party.name)
        ) {
          if (!members.some((m) => m.politician.id === official.id)) {
            members.push({ politician: official, office });
          }
        }
      };
      if (office.holder) addOfficial(office.holder);
      if (office.members && office.members.length > 0)
        office.members.forEach(addOfficial);
    });
    return members;
  }, [party, governmentOffices]);

  if (!party) return <div>No party data available.</div>;

  const handlePoliticianClick = (politician) => {
    if (politician && actions.openViewPoliticianModal) {
      actions.openViewPoliticianModal(politician);
    }
  };

  const stancesToShow =
    viewingStancesOf === party.id
      ? party.policyStances
      : party.factions.find((f) => f.id === viewingStancesOf)?.policyStances;

  return (
    <div className="entity-detail-view">
      <header
        className="detail-header"
        style={{ borderLeftColor: party.color }}
      >
        {party.logoDataUrl && (
          <img
            src={party.logoDataUrl}
            alt={`${party.name} logo`}
            className="party-logo-large"
          />
        )}
        <div>
          <h1 style={{ color: party.color }}>{party.name}</h1>
          <p>
            <strong>Ideology:</strong> {party.ideology}
          </p>
        </div>
      </header>

      {/* --- Stances Modal --- */}
      {stancesToShow && (
        <div
          className="stances-modal-backdrop"
          onClick={() => setViewingStancesOf(null)}
        >
          <div
            className="stances-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {viewingStancesOf === party.id
                ? `${party.name} Platform`
                : `${
                    party.factions.find((f) => f.id === viewingStancesOf)?.name
                  } Stances`}
            </h3>
            <ul className="stances-list">
              {Object.entries(stancesToShow).map(([policyId, stance]) => (
                <li key={policyId}>
                  <strong>{formatPolicyId(policyId)}:</strong>{" "}
                  {formatPolicyId(stance)}
                </li>
              ))}
            </ul>
            <button
              className="menu-button"
              onClick={() => setViewingStancesOf(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* -- Leadership Section -- */}
      {party.leadership && (
        <section className="detail-section">
          <h2>Party Leadership</h2>
          <div className="officials-cards-grid">
            {party.leadership.chairperson && (
              <div className="staff-detail-card">
                <h4>{party.leadership.chairperson.name}</h4>
                <p>
                  <strong>Role:</strong> Party Chairperson
                </p>
                <p>
                  <strong>Stance:</strong>{" "}
                  {party.leadership.chairperson.calculatedIdeology}
                </p>
              </div>
            )}
            {party.leadership.commsDirector && (
              <div className="staff-detail-card">
                <h4>{party.leadership.commsDirector.name}</h4>
                <p>
                  <strong>Role:</strong> Communications Director
                </p>
                <p>
                  <strong>Skills:</strong> Comms:{" "}
                  {party.leadership.commsDirector.attributes.communication}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- Factions Section --- */}
      {party.factions && party.factions.length > 0 && (
        <section className="detail-section">
          <h2>Internal Factions (Wings)</h2>
          <div className="faction-list">
            {party.factions.map((faction) => {
              const factionMembers = partyMembers.filter(
                (m) => m.politician.factionId === faction.id
              );
              return (
                <div key={faction.id} className="faction-detail-card">
                  <h4>{faction.name}</h4>
                  <p>
                    <strong>Influence:</strong> {faction.influence}%
                  </p>
                  {faction.leader && (
                    <p>
                      <strong>Leader:</strong> {faction.leader.name}
                    </p>
                  )}
                  <button
                    className="action-button small"
                    onClick={() => setViewingStancesOf(faction.id)}
                  >
                    View Stances
                  </button>
                  <h5>Elected Members ({factionMembers.length})</h5>
                  <div className="faction-members-list">
                    {factionMembers.length > 0 ? (
                      factionMembers.map(({ politician, office }) => (
                        <div
                          key={politician.id}
                          className="faction-member-item"
                          onClick={() => handlePoliticianClick(politician)}
                        >
                          {politician.name} (
                          {formatOfficeTitleForDisplay(office, cityName)})
                        </div>
                      ))
                    ) : (
                      <p className="no-members-text">
                        No elected officials in this wing.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --- Elected Officials Section --- */}
      <section className="detail-section">
        <h2>All Elected Officials ({partyMembers.length})</h2>
        <div className="officials-cards-grid">
          {partyMembers.length > 0 ? (
            partyMembers.map(({ politician, office }) => (
              <PoliticianCard
                key={`${politician.id}-${office.officeId}`}
                politician={politician}
                office={office}
                onClick={handlePoliticianClick}
                formatOfficeTitle={formatOfficeTitleForDisplay}
                currentLocationName={cityName}
              />
            ))
          ) : (
            <p className="no-officials-message">
              This party currently holds no elected offices.
            </p>
          )}
        </div>
      </section>

      {/* --- Actions Section --- */}
      <section className="detail-section">
        <h2>Actions</h2>
        <div className="action-buttons">
          <button
            className="action-button"
            onClick={() => setViewingStancesOf(party.id)}
          >
            View Party Platform
          </button>
          <button
            className="action-button"
            onClick={() => actions.requestPartyEndorsement(party.id)}
          >
            Request Endorsement
          </button>
          <button
            className="action-button"
            onClick={() => actions.attendPartyFundraiser(party.id)}
          >
            Attend Fundraiser
          </button>
          <button
            className="action-button"
            onClick={() => actions.challengePartyLeadership(party.id)}
          >
            Challenge Leadership
          </button>
        </div>
      </section>
    </div>
  );
};

// --- Lobbying Group Detail View ---
const LobbyingGroupDetail = ({ group }) => {
  const actions = useGameStore((state) => state.actions);
  return (
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
          <button
            className="action-button"
            onClick={() => actions.meetWithLobbyist(group.id)}
          >
            Request Meeting
          </button>
          <button
            className="action-button"
            onClick={() => actions.donateToLobbyGroup(group.id)}
          >
            Donate to Group
          </button>
          <button
            className="action-button"
            onClick={() => actions.investigateLobbyGroup(group.id)}
          >
            Investigate Group
          </button>
        </div>
      </div>
    </div>
  );
};

// --- News Outlet Detail View ---
const NewsOutletDetail = ({ outlet }) => {
  const allNewsItems = useGameStore((state) => state.newsItems);
  const actions = useGameStore((state) => state.actions); // Actions are already here
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
              // MODIFIED: Added onClick, a 'clickable' class, and a title attribute
              <div
                key={article.id}
                className="news-article-card clickable"
                onClick={() => actions.viewArticle(article.id)}
                title="Click to read full article"
              >
                <h4>{article.headline}</h4>
                <p className="article-summary">{article.summary}</p>
                <div className="article-meta">
                  <span>By: {article.author?.name || "Staff"}</span>
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
          <button
            className="action-button"
            onClick={() => actions.grantInterview(outlet.id)}
          >
            Grant Interview
          </button>
          <button
            className="action-button"
            onClick={() => actions.submitPressRelease(outlet.id)}
          >
            Submit Press Release
          </button>
          <button
            className="action-button"
            onClick={() => actions.buyAdvertising(outlet.id)}
          >
            Buy Advertising
          </button>
        </div>
      </div>
    </div>
  );
};

export { PartyDetail, LobbyingGroupDetail, NewsOutletDetail };
