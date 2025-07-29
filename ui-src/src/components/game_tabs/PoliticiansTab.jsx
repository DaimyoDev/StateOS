import React, { useMemo } from "react";
import useGameStore from "../../store";
import "./PoliticiansTab.css";

/**
 * A specialized card for the Politicians Tab that displays relationship status
 * and provides intelligence-gathering actions.
 */
const RelationshipCard = React.memo(
  ({ politician, relationship, onGatherIntel }) => {
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
          {/* Placeholder for Fog of War stats */}
          <div className="fog-of-war-stats">
            <span>Charisma: ???</span>
            <span>Integrity: ???</span>
            <span>Key Stance: ???</span>
          </div>
        </div>
        <div className="politician-card-actions">
          <button className="menu-button" onClick={onGatherIntel}>
            Gather Intel (500 Treasury)
          </button>
          {/* Add more interaction buttons here later */}
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
  const actions = useGameStore((state) => state.actions);

  // useMemo will prevent re-calculating this list on every render
  const aiPoliticians = useMemo(() => {
    if (!governmentOffices) return [];
    const allPoliticians = governmentOffices.flatMap(
      (office) => office.members || (office.holder ? [office.holder] : [])
    );
    // Filter out player and any null/undefined entries, then sort by name
    return allPoliticians
      .filter((p) => p && !p.isPlayer)
      .sort((a, b) => a.name.localeCompare(b.name));
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
              onGatherIntel={() => actions.gatherIntelOnPolitician(pol.id)}
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
