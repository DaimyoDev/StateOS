// ui-src/src/scenes/CareerActionsTab.jsx
import React, { useMemo, useState, useEffect } from "react";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./CareerActionsTab.css";
import { getTimeUntil, createDateObj } from "../../utils/generalUtils";
import ProposePolicyModal from "../modals/ProposePolicyModal";

// Updated helper function
const formatTimeUntil = (currentDateObj, futureDateObj, outcomeStatus) => {
  if (
    ["passed", "failed", "enacted", "concluded"].includes(
      outcomeStatus?.toLowerCase()
    )
  ) {
    return outcomeStatus.charAt(0).toUpperCase() + outcomeStatus.slice(1);
  }
  if (
    !currentDateObj ||
    !futureDateObj ||
    isNaN(currentDateObj.getTime()) ||
    isNaN(futureDateObj.getTime())
  ) {
    return "Date N/A";
  }
  return getTimeUntil(currentDateObj, futureDateObj, outcomeStatus);
};

// --- Sub-Tab Components ---

const ElectionsSubTab = ({
  availableElectionsToRunIn,
  handleDeclareCandidacy,
  currentDate,
  playerIsCurrentlyCandidate,
}) => {
  return (
    <div className="sub-tab-content">
      <section className="info-card available-offices-card">
        <h3>Run for Office</h3>
        {availableElectionsToRunIn.length > 0 ? (
          <ul className="office-list">
            {availableElectionsToRunIn.map((election) => {
              const currentDateObj = createDateObj(currentDate);
              const electionDateObj = createDateObj(election.electionDate);
              return (
                <li key={election.id} className="office-list-item">
                  <div className="office-info">
                    <span className="office-name1">{election.officeName}</span>
                    <span className="office-details">
                      Level: {election.level?.replace(/_/g, " ") || "N/A"} |
                      Election: {election.electionDate?.month}/
                      {election.electionDate?.day}/{election.electionDate?.year}{" "}
                      (
                      {currentDateObj && electionDateObj
                        ? formatTimeUntil(
                            currentDateObj,
                            electionDateObj,
                            election.outcome?.status
                          )
                        : "Date N/A"}
                      )
                    </span>
                  </div>
                  <button
                    className="action-button small-button"
                    onClick={() => handleDeclareCandidacy(election.id)}
                    disabled={playerIsCurrentlyCandidate}
                    title={
                      playerIsCurrentlyCandidate
                        ? "You are already running in an election."
                        : `Declare candidacy for ${election.officeName}`
                    }
                  >
                    Declare
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>
            No immediate suitable offices available to run for (check filing
            deadlines and if you are already a candidate in an upcoming
            election).
          </p>
        )}
      </section>
      {playerIsCurrentlyCandidate && (
        <section className="info-card current-campaign-info">
          <h4>Your Current Campaign</h4>
          {(() => {
            const activePlayerElection = useGameStore
              .getState()
              .activeCampaign.elections.find(
                (e) => e.playerIsCandidate && e.outcome?.status === "upcoming"
              );
            return activePlayerElection ? (
              <p>You are running for: {activePlayerElection.officeName}</p>
            ) : (
              // This state should ideally not be reached if playerIsCurrentlyCandidate is true and derived correctly
              <p>You are not currently registered in an upcoming election.</p>
            );
          })()}
        </section>
      )}
    </div>
  );
};

const JobsSubTab = () => {
  return (
    <div className="sub-tab-content">
      <section className="info-card jobs-info-card">
        <h3>Career Paths & Job Market</h3>
        <p>
          Explore alternative career paths, appointed positions, or private
          sector jobs to build your experience and network.
        </p>
        <p>
          <em>(Job opportunities feature coming soon!)</em>
        </p>
      </section>
    </div>
  );
};

const OfficeSubTab = ({
  campaignData,
  actions,
  canPerformMajorAction,
  selectedIssueToAddress,
  setSelectedIssueToAddress,
  setIsProposePolicyModalOpen,
  addressIssueCost,
}) => {
  const playerPolitician = campaignData?.politician;
  const playerCurrentOfficeName = playerPolitician?.currentOffice;
  const treasury = playerPolitician?.treasury;
  const startingCity = campaignData?.startingCity;
  const { addressKeyCityIssue } = actions;

  if (!playerCurrentOfficeName) {
    return (
      <div className="sub-tab-content">
        <section className="info-card">
          <h3>My Office</h3>
          <p>
            You do not currently hold a public office. Consider running in an
            election!
          </p>
        </section>
      </div>
    );
  }

  const officeDetailsInCampaign = campaignData.governmentOffices?.find(
    (off) =>
      off.officeName === playerCurrentOfficeName &&
      off.holder?.id === playerPolitician?.id
  );

  return (
    <div className="sub-tab-content">
      <section className="info-card current-office-details">
        <h3>Details: {playerCurrentOfficeName}</h3>
        {officeDetailsInCampaign?.termEnds && (
          <p>
            <strong>Term Ends:</strong>{" "}
            {`${officeDetailsInCampaign.termEnds.month}/${officeDetailsInCampaign.termEnds.day}/${officeDetailsInCampaign.termEnds.year}`}
          </p>
        )}
        <p>
          <strong>Responsibilities:</strong> (Placeholder)
        </p>
        <p>
          <strong>Powers:</strong> (Placeholder)
        </p>
      </section>

      <section className="info-card current-role-actions">
        <h3>Actions as {playerCurrentOfficeName}</h3>
        <div className="action-group">
          <label htmlFor="issueSelect">Address Key City Issue:</label>
          <select
            id="issueSelect"
            value={selectedIssueToAddress}
            onChange={(e) => setSelectedIssueToAddress(e.target.value)}
            disabled={
              !canPerformMajorAction ||
              (treasury || 0) < addressIssueCost ||
              !startingCity?.stats?.mainIssues ||
              startingCity.stats.mainIssues.length === 0
            }
          >
            {startingCity?.stats?.mainIssues &&
            startingCity.stats.mainIssues.length > 0 ? (
              startingCity.stats.mainIssues.map((issue) => (
                <option key={issue} value={issue}>
                  {issue}
                </option>
              ))
            ) : (
              <option value="">No key issues identified</option>
            )}
          </select>
          <button
            className="action-button"
            onClick={() => {
              if (
                selectedIssueToAddress &&
                startingCity?.stats?.mainIssues?.includes(
                  selectedIssueToAddress
                )
              ) {
                addressKeyCityIssue(selectedIssueToAddress);
              } else if (actions.addToast) {
                actions.addToast({
                  message: "Please select a valid issue to address.",
                  type: "info",
                });
              }
            }}
            disabled={
              !canPerformMajorAction ||
              !selectedIssueToAddress ||
              (treasury || 0) < addressIssueCost ||
              !(
                startingCity?.stats?.mainIssues &&
                startingCity.stats.mainIssues.length > 0
              )
            }
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major action already taken today"
                : (treasury || 0) < addressIssueCost
                ? `Need $${addressIssueCost} (Personal Treasury)`
                : !selectedIssueToAddress ||
                  !(
                    startingCity?.stats?.mainIssues &&
                    startingCity.stats.mainIssues.length > 0
                  )
                ? "No issue selected or available"
                : `Address "${selectedIssueToAddress}" (Cost: $${addressIssueCost})`
            }
          >
            Address Issue (${addressIssueCost})
          </button>
        </div>
        <div className="action-sub-group">
          <button
            className="action-button"
            onClick={() => setIsProposePolicyModalOpen(true)}
            disabled={!canPerformMajorAction}
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major action already taken today"
                : "Propose a new city policy or ordinance"
            }
          >
            Propose Policy / Ordinance
          </button>
        </div>
        <div className="action-button-group">
          <button className="action-button" disabled title="Coming Soon!">
            Attend Key Meeting
          </button>
          <button className="action-button" disabled title="Coming Soon!">
            Address Constituents
          </button>
        </div>
      </section>
    </div>
  );
};

const ActionsSubTab = ({
  campaignData,
  actions,
  canPerformMajorAction,
  oratorySkillCost,
  publicAppearanceCost,
}) => {
  const {
    fundraise,
    improveSkillOratory,
    networkWithParty,
    makePublicAppearance,
  } = actions;
  const playerPolitician = campaignData?.politician;
  const partyInfo = campaignData?.partyInfo;
  const treasury = playerPolitician?.treasury;
  const campaignFunds = playerPolitician?.campaignFunds;

  return (
    <div className="sub-tab-content">
      <section className="info-card personal-actions">
        <h3>Personal & Political Development</h3>
        <p>
          <strong>Personal Treasury:</strong> $
          {treasury != null ? treasury.toLocaleString() : "N/A"}
        </p>
        <p>
          <strong>Campaign Funds:</strong> $
          {campaignFunds != null ? campaignFunds.toLocaleString() : "N/A"}
        </p>
        <div className="action-button-group">
          <button
            className="action-button"
            onClick={fundraise}
            disabled={!canPerformMajorAction}
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major campaign action already taken today."
                : "Raise funds for your campaign efforts."
            }
          >
            Campaign Fundraising
          </button>
          <button
            className="action-button"
            onClick={improveSkillOratory}
            disabled={(treasury || 0) < oratorySkillCost}
            title={
              // REINTRODUCED TITLE
              (treasury || 0) < oratorySkillCost
                ? `Need $${oratorySkillCost} (Personal Treasury)`
                : `Cost: $${oratorySkillCost} (Personal Treasury)`
            }
          >
            Improve Skill: Oratory
          </button>
          <button
            className="action-button"
            onClick={networkWithParty}
            disabled={!partyInfo || partyInfo.type === "independent"}
            title={
              // REINTRODUCED TITLE
              !partyInfo || partyInfo.type === "independent"
                ? "Join a party to network"
                : "Strengthen party ties"
            }
          >
            Network with Party Officials
          </button>
          <button
            className="action-button"
            onClick={makePublicAppearance}
            disabled={
              !canPerformMajorAction || (treasury || 0) < publicAppearanceCost
            }
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major action already taken today"
                : (treasury || 0) < publicAppearanceCost
                ? `Need $${publicAppearanceCost} (Personal Treasury)`
                : `Cost: $${publicAppearanceCost} (Personal Treasury), Boosts Approval`
            }
          >
            Make Public Appearance
          </button>
        </div>
      </section>
    </div>
  );
};

const EMPTY_ARRAY = [];

const StaffSubTab = () => {
  const talentPool = useGameStore((state) => state.talentPool || EMPTY_ARRAY);
  const hiredStaff = useGameStore((state) => state.hiredStaff || EMPTY_ARRAY);
  const { scoutStaffCandidate, hireStaff, fireStaff } = useGameStore(
    (state) => state.actions
  );

  return (
    <div className="sub-tab-content">
      <section className="info-card hired-staff-card">
        <h3>My Staff</h3>
        {hiredStaff.length > 0 ? (
          <ul className="staff-list">
            {hiredStaff.map((staff) => (
              <li key={staff.id} className="staff-list-item">
                <div className="staff-info">
                  <span className="staff-name">
                    {staff.name}{" "}
                    <span className="staff-role">({staff.role})</span>
                  </span>
                  <span className="staff-details">
                    STR: {staff.attributes.strategy} | COM:{" "}
                    {staff.attributes.communication} | FUN:{" "}
                    {staff.attributes.fundraising} | LOY:{" "}
                    {staff.attributes.loyalty}
                  </span>
                  <span className="staff-salary">
                    Salary: ${staff.salary.toLocaleString()}/month
                  </span>
                </div>
                <button
                  className="button-delete small-button"
                  onClick={() => fireStaff(staff.id)}
                >
                  Fire
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not hired any staff.</p>
        )}
      </section>

      <section className="info-card scouting-pool-card">
        <h3>Scouting Pool</h3>
        {talentPool.length > 0 ? (
          <ul className="staff-list">
            {talentPool.map((staff) => (
              <li key={staff.id} className="staff-list-item">
                <div className="staff-info">
                  <span className="staff-name">
                    {staff.name}{" "}
                    <span className="staff-role">({staff.role})</span>
                  </span>
                  {staff.isScouted ? (
                    <>
                      <span className="staff-details">
                        STR: {staff.attributes.strategy} | COM:{" "}
                        {staff.attributes.communication} | FUN:{" "}
                        {staff.attributes.fundraising} | LOY:{" "}
                        {staff.attributes.loyalty}
                      </span>
                      <span className="staff-salary">
                        Salary: ${staff.salary.toLocaleString()}/month
                      </span>
                    </>
                  ) : (
                    <span className="staff-details-hidden">
                      Stats and salary are unknown. Scout to reveal.
                    </span>
                  )}
                </div>
                {staff.isScouted ? (
                  <button
                    className="action-button small-button"
                    onClick={() => hireStaff(staff.id)}
                  >
                    Hire
                  </button>
                ) : (
                  <button
                    className="menu-button small-button"
                    onClick={() => scoutStaffCandidate(staff.id)}
                  >
                    Scout ($250)
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No candidates currently available for scouting.</p>
        )}
      </section>
    </div>
  );
};

function CareerActionsTab({ campaignData }) {
  const [activeSubTab, setActiveSubTab] = useState("Elections");
  const [isProposePolicyModalOpen, setIsProposePolicyModalOpen] =
    useState(false);
  const [selectedIssueToAddress, setSelectedIssueToAddress] = useState("");

  const store = useGameStore();
  const storeActions = store.actions;
  const allElectionsFromStore = store.activeCampaign.elections;

  const {
    politician: playerPolitician,
    currentDate,
    startingCity,
    regionId: playerRegionId,
    countryId: playerCountryId,
    partyInfo,
    generatedPartiesSnapshot = [],
    customPartiesSnapshot = [],
    governmentOffices,
  } = campaignData || {};

  const politicalCapital = playerPolitician?.politicalCapital;

  useEffect(() => {
    if (
      startingCity?.stats?.mainIssues &&
      startingCity.stats.mainIssues.length > 0
    ) {
      if (
        !selectedIssueToAddress ||
        !startingCity.stats.mainIssues.includes(selectedIssueToAddress)
      ) {
        setSelectedIssueToAddress(startingCity.stats.mainIssues[0]);
      }
    } else {
      setSelectedIssueToAddress("");
    }
  }, [startingCity?.stats?.mainIssues, selectedIssueToAddress]);

  const partyDisplayName = useMemo(() => {
    if (!partyInfo || !partyInfo.type) return "N/A (No Affiliation)";
    if (partyInfo.type === "independent") return "Independent";
    if (partyInfo.type === "join_generated") {
      const party = generatedPartiesSnapshot.find((p) => p.id === partyInfo.id);
      return party ? party.name : "Affiliated (Generated Party Error)";
    }
    if (partyInfo.type === "use_custom") {
      const party = customPartiesSnapshot.find((p) => p.id === partyInfo.id);
      return party ? party.name : "Affiliated (Custom Party Error)";
    }
    return "N/A";
  }, [partyInfo, generatedPartiesSnapshot, customPartiesSnapshot]);

  const availableElectionsToRunIn = useMemo(() => {
    if (
      !allElectionsFromStore ||
      !currentDate ||
      !playerCountryId ||
      !playerPolitician
    )
      return [];

    const todayObj = createDateObj(currentDate);
    if (!todayObj) return [];

    return allElectionsFromStore
      .filter((election) => {
        if (
          election.playerIsCandidate &&
          election.outcome?.status === "upcoming"
        )
          return false;
        if (election.outcome?.status === "concluded") return false;

        if (!election.filingDeadline?.year || !election.electionDate?.year)
          return false;

        const deadlineObj = createDateObj(election.filingDeadline);
        const electionDateObj = createDateObj(election.electionDate);

        if (!deadlineObj || !electionDateObj) return false;
        if (todayObj.getTime() > deadlineObj.getTime()) return false;
        if (todayObj.getTime() >= electionDateObj.getTime()) return false;

        const yearsUntilElection =
          election.electionDate.year - currentDate.year;
        const maxYearsView = election.maxYearsOutForCandidacyView || 3;
        if (yearsUntilElection > maxYearsView || yearsUntilElection < 0) {
          return false;
        }

        const electionCountry =
          election.countryId ||
          election.entityDataSnapshot?.countryId ||
          campaignData?.countryId;
        if (electionCountry !== playerCountryId) {
          return false;
        }

        switch (election.level) {
          case "local_city":
          case "local_city_or_municipality":
          case "local_city_council":
          case "local_city_or_municipality_council":
            return election.entityDataSnapshot?.id.includes(startingCity.id);

          case "local_state":
          case "local_prefecture":
          case "local_province":
          case "local_state_parliament":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "local_state_lower_house":
          case "local_state_upper_house":
          case "local_province_board":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "national_head_of_state_and_government":
          case "national_vice_head_of_state_and_government":
          case "national_upper_house":
          case "national_lower_house_partylist":
          case "national_upper_house_pr_national":
          case "national_lower_house":
            return true;

          case "national_upper_house_state_rep":
          case "national_upper_house_prefectural_district":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "national_lower_house_constituency":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "national_lower_house_pr_bloc":
            // TODO: Refine eligibility for PR Blocs based on player's specific region within the bloc if possible
            return true;

          default:
            return false;
        }
      })
      .sort(
        (a, b) =>
          createDateObj(a.electionDate).getTime() -
          createDateObj(b.electionDate).getTime()
      );
  }, [
    allElectionsFromStore,
    currentDate,
    startingCity?.id,
    playerRegionId,
    playerCountryId,
    campaignData?.countryId,
    playerPolitician,
  ]);

  const playerIsCurrentlyCandidate = useMemo(() => {
    return allElectionsFromStore.some(
      (e) => e.playerIsCandidate && e.outcome?.status === "upcoming"
    );
  }, [allElectionsFromStore]);

  const handleDeclareCandidacy = (electionId) => {
    if (
      storeActions.declareCandidacy &&
      playerPolitician &&
      !playerIsCurrentlyCandidate
    ) {
      storeActions.declareCandidacy(electionId);
    } else if (playerIsCurrentlyCandidate && storeActions.addToast) {
      storeActions.addToast({
        message: "You are already running in an upcoming election.",
        type: "info",
      });
    } else if (!playerPolitician && storeActions.addToast) {
      storeActions.addToast({
        message: "Player politician data not found.",
        type: "error",
      });
    }
  };

  if (!campaignData || !playerPolitician) {
    return (
      <div className="tab-content-container ui-panel">
        <h2 className="tab-title">Career & Actions</h2>
        <p>No campaign data or politician data available.</p>
      </div>
    );
  }

  const oratorySkillCost = 500;
  const publicAppearanceCost = 100;
  const addressIssueCost = 250;

  const canPerformMajorAction = !playerPolitician?.campaignActionToday;

  const handleProposePolicy = (selectedPolicyId, chosenParameters = null) => {
    if (!selectedPolicyId) {
      if (storeActions.addToast)
        storeActions.addToast({
          message: "No policy selected.",
          type: "error",
        });
      return;
    }
    if (storeActions.proposePolicy && playerPolitician?.id) {
      storeActions.proposePolicy(
        selectedPolicyId,
        playerPolitician.id,
        chosenParameters
      );
    }
    setIsProposePolicyModalOpen(false);
  };

  const renderSubTabContent = () => {
    const subTabProps = {
      campaignData,
      actions: storeActions,
      canPerformMajorAction,
    };

    switch (activeSubTab) {
      case "Elections":
        return (
          <ElectionsSubTab
            availableElectionsToRunIn={availableElectionsToRunIn}
            handleDeclareCandidacy={handleDeclareCandidacy}
            currentDate={currentDate}
            playerIsCurrentlyCandidate={playerIsCurrentlyCandidate}
          />
        );
      case "Jobs":
        return <JobsSubTab />;
      case "Office":
        return (
          <OfficeSubTab
            {...subTabProps}
            selectedIssueToAddress={selectedIssueToAddress}
            setSelectedIssueToAddress={setSelectedIssueToAddress}
            setIsProposePolicyModalOpen={setIsProposePolicyModalOpen}
            addressIssueCost={addressIssueCost}
          />
        );
      case "Staff":
        return <StaffSubTab />;
      case "Actions":
        return (
          <ActionsSubTab
            {...subTabProps}
            oratorySkillCost={oratorySkillCost}
            publicAppearanceCost={publicAppearanceCost}
          />
        );
      default:
        return <p>Select a section.</p>;
    }
  };

  return (
    <>
      <div className="tab-content-container career-actions-tab ui-panel">
        <h2 className="tab-title">Career & Political Actions</h2>
        <section className="info-card current-status-card">
          <h3>Current Status Overview</h3>
          {playerPolitician && (
            <>
              <p>
                <strong>Politician:</strong> {playerPolitician.firstName}{" "}
                {playerPolitician.lastName}
              </p>
              <p>
                <strong>Current Role:</strong>{" "}
                {playerPolitician.currentOffice || "Aspiring Politician"}
              </p>
              <p>
                <strong>Ideology:</strong> {playerPolitician.calculatedIdeology}
              </p>
              <p>
                <strong>Party Affiliation:</strong> {partyDisplayName}
              </p>
              <p>
                <strong>Overall Approval:</strong>{" "}
                {playerPolitician.approvalRating != null
                  ? `${playerPolitician.approvalRating}%`
                  : "N/A"}
              </p>
              <p>
                <strong>Personal Treasury:</strong> $
                {playerPolitician.treasury != null
                  ? playerPolitician.treasury.toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Campaign Funds:</strong> $
                {playerPolitician.campaignFunds != null
                  ? playerPolitician.campaignFunds.toLocaleString()
                  : "N/A"}
              </p>
              {playerPolitician.currentOffice &&
                governmentOffices?.find(
                  (off) =>
                    off.officeName === playerPolitician.currentOffice &&
                    off.holder?.id === playerPolitician.id
                )?.termEnds && (
                  <p>
                    <strong>Term Ends:</strong>{" "}
                    {(() => {
                      const office = governmentOffices.find(
                        (off) =>
                          off.officeName === playerPolitician.currentOffice &&
                          off.holder?.id === playerPolitician.id
                      );
                      return office
                        ? `${office.termEnds.month}/${office.termEnds.day}/${office.termEnds.year}`
                        : "N/A";
                    })()}
                  </p>
                )}
              <p
                style={{
                  color: canPerformMajorAction
                    ? "var(--success-text, green)"
                    : "var(--warning-text, orange)",
                }}
              >
                Major Action Available Today:{" "}
                {canPerformMajorAction ? "Yes" : "No"}
              </p>
            </>
          )}
        </section>

        <div className="sub-tab-navigation ca-sub-nav">
          <button
            onClick={() => setActiveSubTab("Elections")}
            className={activeSubTab === "Elections" ? "active" : ""}
          >
            Elections
          </button>
          <button
            onClick={() => setActiveSubTab("Jobs")}
            className={activeSubTab === "Jobs" ? "active" : ""}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveSubTab("Office")}
            className={activeSubTab === "Office" ? "active" : ""}
          >
            My Office
          </button>
          <button
            onClick={() => setActiveSubTab("Staff")}
            className={activeSubTab === "Staff" ? "active" : ""}
          >
            Staff & Scouting
          </button>
          <button
            onClick={() => setActiveSubTab("Actions")}
            className={activeSubTab === "Actions" ? "active" : ""}
          >
            Actions
          </button>
        </div>
        <div className="sub-tab-content-area">{renderSubTabContent()}</div>
      </div>

      <ProposePolicyModal
        isOpen={isProposePolicyModalOpen}
        onClose={() => setIsProposePolicyModalOpen(false)}
        onPropose={handleProposePolicy}
        cityStats={startingCity?.stats}
        playerPoliticalCapital={politicalCapital}
      />
    </>
  );
}

export default CareerActionsTab;
