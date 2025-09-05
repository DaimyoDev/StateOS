// ui-src/src/components/game_tabs/EntityDetailViews.jsx
import React, { useMemo, useState } from "react";
import "../components/game_tabs/PoliticalEntitiesTab.css"; // We can reuse the same styles
import useGameStore from "../store";
import PoliticianCard from "../components/PoliticianCard";
import { formatOfficeTitleForDisplay } from "../utils/governmentUtils";
import { flattenGovernmentOffices } from "../entities/politicalEntities";

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
  const [activeTab, setActiveTab] = useState("overview"); // Tab state management
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
    
    // Flatten the hierarchical government offices structure
    const flatOffices = flattenGovernmentOffices(governmentOffices);
    
    const members = [];
    flatOffices.forEach((office) => {
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

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", count: null },
    { id: "officials", label: "Elected Officials", count: partyMembers.length },
    { id: "factions", label: "Internal Factions", count: party.factions?.length || 0 },
    { id: "committees", label: "Committees", count: party.committees?.length || 0 },
    { id: "finances", label: "Finances", count: null },
    { id: "actions", label: "Actions", count: null }
  ];

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
          <h1>{party.name}</h1>
          <p>
            <strong>Ideology:</strong> {party.ideology}
          </p>
        </div>
      </header>

      {/* --- Tab Navigation --- */}
      <div className="sub-tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sub-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && <span className="tab-count">({tab.count})</span>}
          </button>
        ))}
      </div>

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
            <div className="stances-grid">
              {Object.entries(stancesToShow).map(([policyId, stance]) => (
                <div key={policyId} className="stance-card">
                  <div className="stance-policy">
                    {formatPolicyId(policyId)}
                  </div>
                  <div className="stance-position">
                    {formatPolicyId(stance)}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="menu-button"
              onClick={() => setViewingStancesOf(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Tab Content --- */}
      <div className="sub-tab-content-area tab-content-container">
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Party Summary Stats */}
            <section className="detail-section">
              <h2>Party Overview</h2>
              <div className="city-stats-grid three-col">
                <div className="stat-item">
                  <strong>Elected Officials:</strong>
                  <span>{partyMembers.length}</span>
                </div>
                <div className="stat-item">
                  <strong>Internal Factions:</strong>
                  <span>{party.factions?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <strong>Committees:</strong>
                  <span>{party.committees?.length || 0}</span>
                </div>
                {party.finances && (
                  <>
                    <div className="stat-item">
                      <strong>Current Treasury:</strong>
                      <span>${party.finances.treasury?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <strong>Monthly Income:</strong>
                      <span className="positive">${party.finances.monthlyIncome?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <strong>Monthly Expenses:</strong>
                      <span className="negative">${party.finances.monthlyExpenses?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </section>

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

            {/* Party Platform Button */}
            <section className="detail-section">
              <h2>Party Platform</h2>
              <p>View the official policy positions and stances of {party.name}.</p>
              <button
                className="action-button"
                onClick={() => setViewingStancesOf(party.id)}
              >
                View Party Platform
              </button>
            </section>
          </>
        )}

        {/* Factions Tab */}
        {activeTab === "factions" && party.factions && party.factions.length > 0 && (
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

        {/* Elected Officials Tab */}
        {activeTab === "officials" && (
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
        )}

        {/* Committees Tab */}
        {activeTab === "committees" && party.committees && party.committees.length > 0 && (
          <section className="detail-section">
            <h2>Party Committees ({party.committees.length})</h2>
            <div className="committees-grid">
              {party.committees.map((committee) => (
                <div key={committee.id} className="committee-detail-card">
                  <div className="committee-header">
                    <h4>{committee.name}</h4>
                    <div className="committee-meta">
                      <span className="committee-focus">{committee.focus}</span>
                      <span className={`committee-importance importance-${committee.importance}`}>
                        Priority: {committee.importance}/5
                      </span>
                    </div>
                  </div>
                  
                  <p className="committee-description">{committee.description}</p>
                  
                  <div className="committee-details">
                    <div className="committee-info">
                      <span><strong>Meetings:</strong> {committee.meetingFrequency}</span>
                      <span><strong>Budget:</strong> ${committee.budget?.toLocaleString()}</span>
                    </div>
                    
                    {committee.chair && (
                      <div className="committee-chair">
                        <h5>Committee Chair</h5>
                        <div className="chair-card">
                          <div className="chair-info">
                            <strong>{committee.chair.name}</strong>
                            <span className="chair-background">{committee.chair.background}</span>
                          </div>
                          <div className="chair-details">
                            <span className="chair-expertise">{committee.chair.expertise}</span>
                            <span className="chair-tenure">{committee.chair.tenure} years</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="committee-members">
                      <h5>Members ({committee.members?.length || 0})</h5>
                      <div className="members-grid">
                        {committee.members?.length > 0 ? (
                          committee.members.map((member) => (
                            <div key={member.id} className="committee-member-card">
                              <div className="member-header">
                                <strong>{member.name}</strong>
                                <span className="member-tenure">{member.tenure}y</span>
                              </div>
                              <div className="member-info">
                                <span className="member-background">{member.background}</span>
                                <span className="member-expertise">{member.expertise}</span>
                              </div>
                              <div className="member-attributes">
                                <span className="member-attribute">
                                  Influence: {member.attributes?.influence || 'N/A'}
                                </span>
                                <span className="member-attribute">
                                  Expertise: {member.attributes?.expertise_level || 'N/A'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-members-text">No members assigned.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="committee-actions">
                      <button
                        className="action-button small"
                        onClick={() => actions.scheduleCommitteeAttendance(party.id, committee.id)}
                        title={`Attend next ${committee.meetingFrequency} meeting as a guest`}
                      >
                        Attend Meeting ($100)
                      </button>
                      <button
                        className="action-button small"
                        onClick={() => actions.requestCommitteeMeeting(party.id, committee.id, committee.chair?.id)}
                      >
                        Meet with Chair
                      </button>
                      <button
                        className="action-button small"
                        onClick={() => actions.joinPartyCommittee(party.id, committee.id, "member")}
                      >
                        Join Committee
                      </button>
                      <button
                        className="action-button small warning"
                        onClick={() => actions.challengeCommitteeChair(party.id, committee.id, committee.chair?.id)}
                      >
                        Challenge Chair
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Finances Tab */}
        {activeTab === "finances" && party.finances && (
          <section className="detail-section">
            <h2>Party Finances</h2>
            
            {/* Financial Overview */}
            <div className="finance-overview">
              <div className="finance-summary-grid">
                <div className="finance-card treasury">
                  <h4>Treasury</h4>
                  <span className="amount">${party.finances.treasury?.toLocaleString()}</span>
                </div>
                <div className="finance-card income">
                  <h4>Monthly Income</h4>
                  <span className="amount positive">${party.finances.monthlyIncome?.toLocaleString()}</span>
                </div>
                <div className="finance-card expenses">
                  <h4>Monthly Expenses</h4>
                  <span className="amount negative">${party.finances.monthlyExpenses?.toLocaleString()}</span>
                </div>
                <div className={`finance-card balance ${party.finances.lastMonthBalance >= 0 ? 'positive' : 'negative'}`}>
                  <h4>Net Balance</h4>
                  <span className="amount">${party.finances.lastMonthBalance?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Income Sources */}
            <div className="finance-section">
              <h3>Income Sources</h3>
              <div className="income-sources-grid">
                {Object.entries(party.finances.incomeSources || {}).map(([source, amount]) => (
                  amount > 0 && (
                    <div key={source} className="income-item">
                      <span className="income-label">{source.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <span className="income-amount">${amount.toLocaleString()}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Major Donors */}
            {party.finances.majorDonors?.length > 0 && (
              <div className="finance-section">
                <h3>Major Donors ({party.finances.majorDonors.length})</h3>
                <div className="donors-grid">
                  {party.finances.majorDonors.slice(0, 6).map((donor) => (
                    <div key={donor.id} className="donor-card">
                      <div className="donor-info">
                        <strong>{donor.name}</strong>
                        <span className="donor-type">{donor.type}</span>
                      </div>
                      <div className="donor-details">
                        <span className="donor-amount">${donor.totalDonated?.toLocaleString()}</span>
                        {donor.industry && <span className="donor-industry">{donor.industry}</span>}
                        {donor.occupation && <span className="donor-occupation">{donor.occupation}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merchandise */}
            {party.finances.merchandiseInventory?.length > 0 && (
              <div className="finance-section">
                <h3>Merchandise Store</h3>
                <div className="merchandise-grid">
                  {party.finances.merchandiseInventory.map((item) => (
                    <div key={item.id} className="merch-item">
                      <div className="merch-info">
                        <strong>{item.name}</strong>
                        <span className="merch-price">${item.price}</span>
                      </div>
                      <div className="merch-stats">
                        <span>Sold: {item.sold}</span>
                        <span>Stock: {item.inventory}</span>
                        <span>Profit: ${((item.price - item.cost) * item.sold).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Expenses */}
            {party.finances.upcomingExpenses?.length > 0 && (
              <div className="finance-section">
                <h3>Upcoming Expenses</h3>
                <div className="upcoming-expenses">
                  {party.finances.upcomingExpenses.map((expense, index) => (
                    <div key={index} className="expense-item">
                      <div className="expense-info">
                        <strong>{expense.name}</strong>
                        <span className="expense-date">
                          Due: {expense.dueDate.month}/{expense.dueDate.day}/{expense.dueDate.year}
                        </span>
                      </div>
                      <span className="expense-amount">${expense.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Actions Tab */}
        {activeTab === "actions" && (
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
              <button
                className="action-button"
                onClick={() => actions.donateToParty?.(party.id)}
              >
                Make Donation
              </button>
              <button
                className="action-button"
                onClick={() => actions.requestFinancialRecords?.(party.id)}
              >
                Request Financial Records
              </button>
            </div>
          </section>
        )}

      </div>
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
  const actions = useGameStore((state) => state.actions);
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  
  const outletArticles = useMemo(() => {
    return allNewsItems.filter((item) => item.outletId === outlet.id);
  }, [allNewsItems, outlet.id]);

  // Calculate contextual credibility for the player
  const playerCredibility = useMemo(() => {
    if (outlet.getContextualCredibility && activeCampaign?.politician) {
      const viewerContext = {
        ideology: activeCampaign.politician.calculatedIdeology,
        partyAffiliation: activeCampaign.partyInfo?.id,
        coalitionMemberships: activeCampaign.coalitionMemberships || [],
      };
      return outlet.getContextualCredibility(viewerContext);
    }
    // Fallback for old outlet format
    return typeof outlet.credibility === 'object' ? outlet.credibility.base : outlet.credibility;
  }, [outlet, activeCampaign]);

  // Get reach information based on new format
  const getReachDisplay = () => {
    if (typeof outlet.reach === 'object') {
      const level = outlet.level || 'local';
      const levelReach = outlet.reach[level] || 0;
      const otherReach = [];
      
      Object.entries(outlet.reach).forEach(([lvl, reach]) => {
        if (lvl !== level && reach > 0) {
          otherReach.push(`${lvl}: ${reach}%`);
        }
      });
      
      return {
        primary: `${levelReach}% (${level})`,
        secondary: otherReach.length > 0 ? otherReach.join(', ') : null,
      };
    }
    // Fallback for old format
    return { primary: outlet.reach || 'N/A', secondary: null };
  };

  const reachInfo = getReachDisplay();
  const credibilityBase = typeof outlet.credibility === 'object' ? outlet.credibility.base : outlet.credibility;
  const ideologyInfo = typeof outlet.credibility === 'object' ? outlet.credibility : null;

  return (
    <div className="entity-detail-view">
      <div className="detail-header">
        <div className="detail-info">
          <h1>{outlet.name}</h1>
          <p>
            <strong>Type:</strong> {outlet.type}
          </p>
          <p>
            <strong>Level:</strong> {(outlet.level || 'local').charAt(0).toUpperCase() + (outlet.level || 'local').slice(1)}
          </p>
        </div>
      </div>

      {/* Enhanced Credibility & Reach Section */}
      <div className="detail-section">
        <h2>Audience & Credibility</h2>
        <div className="city-stats-grid three-col">
          <div className="stat-item">
            <strong>Primary Reach:</strong>
            <span>{reachInfo.primary}</span>
          </div>
          {reachInfo.secondary && (
            <div className="stat-item">
              <strong>Secondary Reach:</strong>
              <span>{reachInfo.secondary}</span>
            </div>
          )}
          <div className="stat-item">
            <strong>Base Credibility:</strong>
            <span>{credibilityBase || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <strong>Your Perceived Credibility:</strong>
            <span className={playerCredibility >= 70 ? 'positive' : playerCredibility <= 40 ? 'negative' : ''}>
              {Math.round(playerCredibility)}
            </span>
          </div>
          {ideologyInfo && (
            <>
              <div className="stat-item">
                <strong>Primary Ideology:</strong>
                <span>{ideologyInfo.primaryIdeology?.charAt(0).toUpperCase() + ideologyInfo.primaryIdeology?.slice(1) || 'Centrist'}</span>
              </div>
              <div className="stat-item">
                <strong>Bias Intensity:</strong>
                <span>{ideologyInfo.ideologicalIntensity || 0}/10</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Coalition Affiliations */}
      {outlet.coalitionAffiliations && outlet.coalitionAffiliations.length > 0 && (
        <div className="detail-section">
          <h2>Coalition Affiliations</h2>
          <div className="coalition-affiliations">
            {outlet.coalitionAffiliations.map((coalitionId) => (
              <span key={coalitionId} className="coalition-badge">
                {coalitionId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Geographic Reach Strongholds */}
      {outlet.strongholdAreas && outlet.strongholdAreas.length > 0 && (
        <div className="detail-section">
          <h2>Geographic Strongholds</h2>
          <p className="section-description">
            Areas where this outlet has particularly strong influence and readership based on ideological alignment.
          </p>
          <div className="stronghold-areas">
            {outlet.strongholdAreas.map((area, index) => (
              <span key={index} className="stronghold-badge">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
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
