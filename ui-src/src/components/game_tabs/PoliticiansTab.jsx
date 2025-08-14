import React, { useMemo } from "react";
import useGameStore from "../../store";
import "./PoliticiansTab.css";

/**
 * A specialized card for the Politicians Tab that displays relationship status
 * and provides intelligence-gathering actions.
 */
const RelationshipCard = React.memo(
  ({ politician, relationship, intel, onGatherIntel, onPraise }) => {
    const getRelationshipText = (score) => {
      if (score <= -8) return "Arch Rival";
      if (score <= -4) return "Rival";
      if (score < 4) return "Neutral";
      if (score < 8) return "Ally";
      return "Staunch Ally";
    };

    const relationshipText = getRelationshipText(relationship);
    const relationshipColor =
      relationship <= -4
        ? "var(--error-text)"
        : relationship >= 4
        ? "var(--success-text)"
        : "var(--secondary-text)";

    // Check if attributes have been revealed
    const attributesRevealed = !!intel?.attributes;

    return (
      <div className="politician-card">
        <div className="politician-card-header">
          <div className="politician-info">
            <span className="politician-name">{politician.name}</span>
            <span
              className="politician-party"
              style={{ color: politician.partyColor }}
            >
              {politician.partyName}
            </span>
          </div>
          <div className="politician-relationship">
            <span className="relationship-label">Relationship</span>
            <span
              className="relationship-value"
              style={{ color: relationshipColor }}
            >
              {relationshipText} ({relationship})
            </span>
          </div>
        </div>
        <div className="politician-card-body">
          <p className="politician-office">
            {politician.currentOffice || "No current office"}
          </p>
          <div className="fog-of-war-stats">
            <span className={attributesRevealed ? "revealed-stat" : ""}>
              Charisma: {intel?.attributes?.charisma ?? "???"}
            </span>
            <span className={attributesRevealed ? "revealed-stat" : ""}>
              Integrity: {intel?.attributes?.integrity ?? "???"}
            </span>
            <span className={attributesRevealed ? "revealed-stat" : ""}>
              Oratory: {intel?.attributes?.oratory ?? "???"}
            </span>
            {/* Stances would be revealed here in a future step */}
          </div>
        </div>
        <div className="politician-card-actions">
          <button
            className="menu-button"
            onClick={onPraise}
            title="Spend $100 to issue a public statement praising this politician, improving your relationship."
          >
            Praise Politician
          </button>
          {!attributesRevealed && (
            <button
              className="menu-button"
              onClick={onGatherIntel}
              title="Spend $500 from your personal treasury to hire an investigator to uncover this politician's core attributes."
            >
              Gather Intel
            </button>
          )}
        </div>
      </div>
    );
  }
);

/**
 * The main tab component that displays a list of all AI politicians.
 */
function PoliticiansTab() {
  const governmentOffices = useGameStore(
    (state) => state.activeCampaign.governmentOffices
  );
  const relationships = useGameStore((state) => state.politicianRelationships);
  // ADDED: Subscribing to the politicianIntel state
  const politicianIntel = useGameStore((state) => state.politicianIntel);
  const actions = useGameStore((state) => state.actions);

  // CHANGED: This logic is now more robust and prevents duplicate politicians
  const aiPoliticians = useMemo(() => {
    if (!governmentOffices) return [];
    const politicianMap = new Map();
    // Use a Map to ensure each politician appears only once, even if they hold multiple offices
    governmentOffices.forEach((office) => {
      const members = office.members || (office.holder ? [office.holder] : []);
      members.forEach((p) => {
        if (p && !p.isPlayer && !politicianMap.has(p.id)) {
          politicianMap.set(p.id, p);
        }
      });
    });
    return Array.from(politicianMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [governmentOffices]);

  return (
    <div className="politicians-tab-container">
      <h2 className="tab-title">Political Landscape</h2>
      <p className="tab-description">
        An overview of the key political figures in your area. Manage
        relationships and gather intelligence on your allies and rivals.
      </p>
      <div className="politician-list">
        {aiPoliticians.length > 0 ? (
          aiPoliticians.map((pol) => (
            <RelationshipCard
              key={pol.id}
              politician={pol}
              relationship={relationships[pol.id]?.relationship ?? 0}
              intel={politicianIntel[pol.id]}
              onGatherIntel={() => actions.gatherIntelOnPolitician(pol.id)}
              onPraise={() => actions.praisePolitician(pol.id)}
            />
          ))
        ) : (
          <p>No other politicians found in the current area.</p>
        )}
      </div>
    </div>
  );
}

export default PoliticiansTab;
