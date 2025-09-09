import React, { useMemo, useState, useCallback } from "react";
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
    hasEndorsed,
    canRequestEndorsement,
    playerPartyId,
    onGatherIntel,
    onPraise,
    onToggleFavorite,
    onRequestEndorsement,
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

    // Check endorsement eligibility
    const sameParty = politician.partyId === playerPartyId;
    const highRelationship = relationship >= 4;
    const eligibleForEndorsement = sameParty && highRelationship && canRequestEndorsement && !hasEndorsed;

    return (
      <div className="politician-card">
        <div className="politician-card-header">
          <div className="politician-info">
            <span className="politician-name">
              {politician.name}
              {hasEndorsed && (
                <span className="endorsement-badge" title="Has endorsed you">
                  ✓ Endorsed
                </span>
              )}
            </span>
            <span
              className="politician-party"
              style={{ color: politician.partyColor }}
            >
              {politician.partyName}
              {sameParty && <span className="same-party-indicator"> (Your Party)</span>}
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
            {politician.regionName && (
              <span className="politician-region"> ({politician.regionName})</span>
            )}
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
          {eligibleForEndorsement && (
            <button
              className="action-button"
              onClick={onRequestEndorsement}
              title={`Request endorsement from ${politician.name} (same party, high relationship)`}
            >
              Request Endorsement
            </button>
          )}
          {!sameParty && highRelationship && (
            <span className="endorsement-unavailable">
              Cannot endorse (different party)
            </span>
          )}
          {sameParty && !highRelationship && (
            <span className="endorsement-unavailable">
              Need Ally status for endorsement
            </span>
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

// Pagination constants
const POLITICIANS_PER_PAGE = 20;
const INITIAL_LOAD_COUNT = 10;

function PoliticiansTab() {
  const relationships = useGameStore((state) => state.politicianRelationships);
  const politicianIntel = useGameStore((state) => state.politicianIntel);
  const favoritePoliticians = useGameStore(
    (state) => state.favoritePoliticians || EMPTY_ARRAY
  );
  const endorsements = useGameStore((state) => state.endorsements);
  const playerInfo = useGameStore((state) => state.playerInfo);
  const activeElection = useGameStore((state) => state.activeElection);
  const actions = useGameStore((state) => state.actions);
  const { getAllGovernmentOffices } = actions;
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const availableRegions = activeCampaign?.availableCountries?.find(c => c.id === activeCampaign?.countryId)?.regions || [];

  const [activeTab, setActiveTab] = useState("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // CHANGED: Collect politicians from all levels using the hierarchical structure
  const aiPoliticians = useMemo(() => {
    const allOffices = getAllGovernmentOffices();
    if (!allOffices || allOffices.length === 0) return [];
    const politicianMap = new Map();

    // Helper function to categorize government level based on office level
    const categorizeGovernmentLevel = (officeLevel) => {
      if (!officeLevel) return "local_city";

      // Federal/National levels
      if (officeLevel.startsWith("national_")) {
        return "federal";
      }

      // State levels
      if (
        officeLevel === "local_state" ||
        officeLevel === "local_state_lower_house" ||
        officeLevel === "local_state_upper_house"
      ) {
        return "state";
      }

      // County levels
      if (officeLevel.startsWith("local_county")) {
        return "local_county";
      }

      // Local city levels (default)
      return "local_city";
    };

    // Process all government offices using the hierarchical structure
    allOffices.forEach((office) => {
      // Handle both single holders and multi-member offices
      const politicians = [];

      // Add holder if exists
      if (office.holder && !office.holder.isPlayer) {
        politicians.push(office.holder);
      }

      // Add members if they exist
      if (office.members && office.members.length > 0) {
        office.members.forEach((member) => {
          if (member && !member.isPlayer) {
            politicians.push(member);
          }
        });
      }

      politicians.forEach((p) => {
        if (p && !politicianMap.has(p.id)) {
          // Categorize the government level properly
          const categorizedLevel = categorizeGovernmentLevel(office.level);
          
          // Find the region/state for this politician
          let regionInfo = null;
          if (office.regionId && availableRegions.length > 0) {
            regionInfo = availableRegions.find(r => r.id === office.regionId);
          }
          
          const politician = {
            ...p,
            governmentLevel: categorizedLevel,
            currentOffice: office.officeName || office.name,
            regionId: office.regionId || null,
            regionName: regionInfo?.name || (office.regionId ? "Unknown Region" : null),
            _debugOfficeLevel: office.level, // Add for debugging
            _debugOfficeName: office.officeName || office.name, // Add for debugging
          };
          politicianMap.set(p.id, politician);
        }
      });
    });

    return Array.from(politicianMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [getAllGovernmentOffices, availableRegions]);

  // Filter politicians based on active tab and filters
  const filteredPoliticians = useMemo(() => {
    let politicians = aiPoliticians;

    // Filter by search term first (most restrictive)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      politicians = politicians.filter((pol) =>
        pol.name.toLowerCase().includes(searchLower) ||
        pol.currentOffice?.toLowerCase().includes(searchLower) ||
        pol.partyName?.toLowerCase().includes(searchLower) ||
        pol.regionName?.toLowerCase().includes(searchLower)
      );
    }

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

    // Filter by state/region
    if (stateFilter !== "all") {
      politicians = politicians.filter((pol) => {
        // Handle national politicians (no regionId)
        if (stateFilter === "national") {
          return !pol.regionId;
        }
        // Handle regional politicians
        return pol.regionId === stateFilter;
      });
    }

    return politicians;
  }, [
    aiPoliticians,
    searchTerm,
    activeTab,
    relationshipFilter,
    levelFilter,
    stateFilter,
    favoritePoliticians,
    relationships,
  ]);

  // Paginated politicians for display
  const paginatedPoliticians = useMemo(() => {
    const startIndex = (currentPage - 1) * POLITICIANS_PER_PAGE;
    const endIndex = startIndex + POLITICIANS_PER_PAGE;
    return filteredPoliticians.slice(startIndex, endIndex);
  }, [filteredPoliticians, currentPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredPoliticians.length / POLITICIANS_PER_PAGE);
  const totalCount = filteredPoliticians.length;

  // Reset to page 1 when filters change
  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'tab':
        setActiveTab(value);
        break;
      case 'relationship':
        setRelationshipFilter(value);
        break;
      case 'level':
        setLevelFilter(value);
        break;
      case 'state':
        setStateFilter(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
    }
  }, []);

  // Load more politicians (for infinite scroll alternative)
  const loadMorePoliticians = useCallback(() => {
    if (currentPage < totalPages && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 100); // Small delay to show loading state
    }
  }, [currentPage, totalPages, isLoading]);

  return (
    <div className="politicians-tab-container">
      <h2 className="tab-title">Political Landscape</h2>
      <p className="tab-description">
        An overview of the key political figures in your area. Manage
        relationships and gather intelligence on your allies and rivals.
      </p>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search politicians by name, office, party, or region..."
          value={searchTerm}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="politician-search"
        />
        <div className="search-results-info">
          {totalCount > 0 && (
            <span className="results-count">
              Showing {paginatedPoliticians.length} of {totalCount} politicians
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="politician-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => handleFilterChange('tab', "all")}
        >
          All Politicians
        </button>
        <button
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => handleFilterChange('tab', "favorites")}
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
            onChange={(e) => handleFilterChange('relationship', e.target.value)}
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
            onChange={(e) => handleFilterChange('level', e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
            <option value="local_city">City</option>
            <option value="local_county">County</option>
          </select>
        </div>

        <div className="filter-group">
          <label>State/Region:</label>
          <select
            value={stateFilter}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          >
            <option value="all">All States</option>
            <option value="national">National (No State)</option>
            {availableRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="politician-list">
        {paginatedPoliticians.length > 0 ? (
          paginatedPoliticians.map((pol) => {
            const hasEndorsed = activeElection && endorsements?.[activeElection.id]?.[pol.id]?.candidateId === playerInfo?.id;
            const canRequestEndorsement = activeElection && !endorsements?.[activeElection.id]?.[pol.id];
            
            return (
              <RelationshipCard
                key={pol.id}
                politician={pol}
                relationship={relationships[pol.id]?.relationship ?? 0}
                intel={politicianIntel[pol.id]}
                isFavorite={favoritePoliticians.includes(pol.id)}
                hasEndorsed={hasEndorsed}
                canRequestEndorsement={canRequestEndorsement}
                playerPartyId={playerInfo?.partyId}
                onGatherIntel={() => actions.gatherIntelOnPolitician(pol.id)}
                onPraise={() => actions.praisePolitician(pol.id)}
                onToggleFavorite={() => actions.toggleFavoritePolitician(pol.id)}
                onRequestEndorsement={() => actions.requestEndorsement(pol.id, activeElection?.id)}
              />
            );
          })
        ) : (
          <div className="no-results">
            <p>
              {searchTerm.trim() ? 
                `No politicians found matching "${searchTerm}"` :
                activeTab === "favorites"
                  ? "No favorite politicians yet. Click the star icon on politician cards to add them to your favorites."
                  : "No politicians found matching your filters."}
            </p>
            {searchTerm.trim() && (
              <button 
                className="menu-button"
                onClick={() => handleFilterChange('search', '')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="menu-button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            className="menu-button"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-info">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          
          <button
            className="menu-button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button
            className="menu-button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      )}

      {/* Load More Button (Alternative to pagination) */}
      {currentPage < totalPages && (
        <div className="load-more-section">
          <button
            className="action-button"
            onClick={loadMorePoliticians}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : `Load More Politicians (${totalCount - paginatedPoliticians.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}

export default PoliticiansTab;
