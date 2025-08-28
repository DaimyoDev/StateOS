import React, { useMemo, useState } from "react";
import useGameStore from "../../store";
import "./PoliticiansTab.css";

/**
 * A specialized card for the Politicians Tab that displays relationship status
 * and provides intelligence-gathering actions.
 */
const RelationshipCard = React.memo(
  ({
    politician,
    relationship,
    intel,
    isFavorite,
    onGatherIntel,
    onPraise,
    onToggleFavorite,
  }) => {
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
            <span className="politician-age">Age: {politician.age}</span>
          </div>
          <div className="politician-actions-header">
            <button
              className={`favorite-button ${isFavorite ? "favorited" : ""}`}
              onClick={onToggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "★" : "☆"}
            </button>
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

const EMPTY_ARRAY = [];

function PoliticiansTab() {
  const campaignData = useGameStore((state) => state.activeCampaign);
  const relationships = useGameStore((state) => state.politicianRelationships);
  const politicianIntel = useGameStore((state) => state.politicianIntel);
  const favoritePoliticians = useGameStore(
    (state) => state.favoritePoliticians || EMPTY_ARRAY
  );
  const actions = useGameStore((state) => state.actions);

  const [activeTab, setActiveTab] = useState("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // CHANGED: Collect politicians from all levels using the same approach as State/National tabs
  const aiPoliticians = useMemo(() => {
    if (!campaignData?.governmentOffices) return [];
    const politicianMap = new Map();
    
    // Helper function to categorize government level based on office level
    const categorizeGovernmentLevel = (officeLevel) => {
      if (!officeLevel) return 'local_city';
      
      // Federal/National levels
      if (officeLevel.startsWith('national_')) {
        return 'federal';
      }
      
      // State levels
      if (officeLevel === 'local_state' || 
          officeLevel === 'local_state_lower_house' || 
          officeLevel === 'local_state_upper_house') {
        return 'state';
      }
      
      // County levels
      if (officeLevel.startsWith('local_county')) {
        return 'local_county';
      }
      
      // Local city levels (default)
      return 'local_city';
    };

    // Process all government offices using the same pattern as State/National tabs
    campaignData.governmentOffices.forEach((office) => {
      // Handle both single holders and multi-member offices
      const politicians = [];
      
      // Add holder if exists
      if (office.holder && !office.holder.isPlayer) {
        politicians.push(office.holder);
      }
      
      // Add members if they exist
      if (office.members && office.members.length > 0) {
        office.members.forEach(member => {
          if (member && !member.isPlayer) {
            politicians.push(member);
          }
        });
      }
      
      politicians.forEach((p) => {
        if (p && !politicianMap.has(p.id)) {
          // Categorize the government level properly
          const categorizedLevel = categorizeGovernmentLevel(office.level);
          const politician = {
            ...p,
            governmentLevel: categorizedLevel,
            currentOffice: office.officeName || office.name,
            _debugOfficeLevel: office.level, // Add for debugging
            _debugOfficeName: office.officeName || office.name // Add for debugging
          };
          politicianMap.set(p.id, politician);
        }
      });
    });

    return Array.from(politicianMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [campaignData]);

  // Filter politicians based on active tab and filters
  const filteredPoliticians = useMemo(() => {
    let politicians = aiPoliticians;

    // Filter by tab (all vs favorites)
    if (activeTab === "favorites") {
      politicians = politicians.filter((pol) =>
        favoritePoliticians.includes(pol.id)
      );
    }

    // Filter by relationship score
    if (relationshipFilter !== "all") {
      politicians = politicians.filter((pol) => {
        const relationship = relationships[pol.id]?.relationship ?? 0;
        switch (relationshipFilter) {
          case "allies":
            return relationship >= 4;
          case "neutral":
            return relationship > -4 && relationship < 4;
          case "rivals":
            return relationship <= -4;
          default:
            return true;
        }
      });
    }

    // Filter by government level
    if (levelFilter !== "all") {
      politicians = politicians.filter((pol) => {
        const matches = pol.governmentLevel === levelFilter;
        return matches;
      });
    }

    return politicians;
  }, [
    aiPoliticians,
    activeTab,
    relationshipFilter,
    levelFilter,
    favoritePoliticians,
    relationships,
  ]);

  return (
    <div className="politicians-tab-container">
      <h2 className="tab-title">Political Landscape</h2>
      <p className="tab-description">
        An overview of the key political figures in your area. Manage
        relationships and gather intelligence on your allies and rivals.
      </p>

      {/* Tab Navigation */}
      <div className="politician-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All Politicians
        </button>
        <button
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites ({favoritePoliticians.length})
        </button>
      </div>

      {/* Filters */}
      <div className="politician-filters">
        <div className="filter-group">
          <label>Relationship:</label>
          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="allies">Allies (4+)</option>
            <option value="neutral">Neutral (-3 to 3)</option>
            <option value="rivals">Rivals (-4 or less)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Government Level:</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
            <option value="local_city">City</option>
            <option value="local_county">County</option>
          </select>
        </div>
      </div>

      <div className="politician-list">
        {filteredPoliticians.length > 0 ? (
          filteredPoliticians.map((pol) => (
            <RelationshipCard
              key={pol.id}
              politician={pol}
              relationship={relationships[pol.id]?.relationship ?? 0}
              intel={politicianIntel[pol.id]}
              isFavorite={favoritePoliticians.includes(pol.id)}
              onGatherIntel={() => actions.gatherIntelOnPolitician(pol.id)}
              onPraise={() => actions.praisePolitician(pol.id)}
              onToggleFavorite={() => actions.toggleFavoritePolitician(pol.id)}
            />
          ))
        ) : (
          <p>
            {activeTab === "favorites"
              ? "No favorite politicians yet. Click the star icon on politician cards to add them to your favorites."
              : "No politicians found matching your filters."}
          </p>
        )}
      </div>
    </div>
  );
}

export default PoliticiansTab;
