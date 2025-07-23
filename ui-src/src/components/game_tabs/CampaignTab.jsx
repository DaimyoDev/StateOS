import React, { useState, useMemo, useEffect, useCallback } from "react";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./CampaignTab.css";
import {
  getDisplayedPolling,
  calculateAdultPopulation,
} from "../../utils/generalUtils";
import { STAFF_ROLES_INFO } from "../../data/campaignStaffData";

// --- SUB-TAB COMPONENTS ---

const CampaignOverviewSubTab = ({ campaignData, openViewPoliticianModal }) => {
  const politician = campaignData.politician || {};
  const startingCity = campaignData.startingCity || {};
  const playerActiveElection = campaignData.elections?.find(
    (election) =>
      election.playerIsCandidate && election.outcome?.status === "upcoming"
  );

  const adultPopulation = useMemo(() => {
    if (
      !startingCity.population ||
      !startingCity.demographics?.ageDistribution
    ) {
      return 0;
    }
    return calculateAdultPopulation(
      startingCity.population,
      startingCity.demographics.ageDistribution
    );
  }, [startingCity.population, startingCity.demographics?.ageDistribution]);

  return (
    <div className="sub-tab-content">
      <section className="info-card campaign-overview-main active-campaign-details">
        {" "}
        {/* Added active-campaign-details for h3 style */}
        <h3>Current Campaign Status</h3>{" "}
        {/* This will pick up .active-campaign-details h3 style */}
        {playerActiveElection ? (
          <>
            <p>
              <strong>Running for:</strong> {playerActiveElection.officeName}
            </p>
            <p>
              <strong>Election Date:</strong>{" "}
              {playerActiveElection.electionDate.month}/
              {playerActiveElection.electionDate.day}/
              {playerActiveElection.electionDate.year}
            </p>
            <div className="campaign-finances">
              {" "}
              {/* Your existing class */}
              <h4>Campaign Vitals:</h4> {/* Your existing class for h4 */}
              <p>
                Current Funds: $
                {politician.campaignFunds?.toLocaleString() || 0}
              </p>
              <p>Media Buzz: {politician.mediaBuzz || 0}/100</p>
              <p>
                Name Recognition:{" "}
                {politician.nameRecognition?.toLocaleString() || "0"} people
                {adultPopulation > 0 &&
                  ` (~${(
                    ((politician.nameRecognition || 0) / adultPopulation) *
                    100
                  ).toFixed(1)}% of adults)`}
              </p>
              <p>Volunteer Base: {politician.volunteerCount || 0} active</p>
              <p>
                Monthly Ad Budget: $
                {politician.advertisingBudgetMonthly?.toLocaleString() || 0}
              </p>
            </div>
          </>
        ) : (
          <p>
            You are not currently running in an active election. Declare
            candidacy in the "Elections" tab of "Career & Actions".
          </p>
        )}
      </section>

      {playerActiveElection && (
        <section className="info-card current-standing">
          {" "}
          {/* Your existing class */}
          <h4>Current Polling</h4> {/* Your existing class for h4 */}
          <ul>
            {Array.from(playerActiveElection.candidates.values())
              .sort((a, b) => (b.polling || 0) - (a.polling || 0))
              .map((candidate) => (
                <li
                  key={candidate.id}
                  onClick={() =>
                    !candidate.isPlayer && openViewPoliticianModal(candidate)
                  }
                  style={{ cursor: candidate.isPlayer ? "default" : "pointer" }}
                >
                  <span className="candidate-info">
                    <span
                      style={{
                        color: candidate.isPlayer
                          ? "var(--accent-color)"
                          : "inherit",
                      }}
                      className={
                        candidate.isPlayer ? "player-candidate-name" : ""
                      }
                    >
                      {candidate.name}
                    </span>
                    <span className="party-name-display">
                      {" "}
                      ({candidate.partyName || "Independent"})
                    </span>
                    {candidate.isIncumbent && (
                      <span className="incumbent-marker">(Incumbent)</span>
                    )}
                  </span>
                  <span className="candidate-polling">
                    Polling: ~{getDisplayedPolling(candidate.polling)}%
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const StaffSubTab = ({ campaignData, actions }) => {
  const politician = campaignData.politician || {};
  const hiredStaff = politician.hiredStaff || [];
  const campaignFunds = politician.campaignFunds || 0;

  const availableRolesToHire = Object.values(STAFF_ROLES_INFO).filter(
    (roleInfo) => !hiredStaff.some((staff) => staff.roleId === roleInfo.id)
  );

  return (
    <div className="sub-tab-content">
      <section className="info-card">
        <h3>Campaign Staff</h3>
        {hiredStaff.length > 0 ? (
          <ul className="staff-list">
            {hiredStaff.map((staff) => (
              <li key={staff.id} className="staff-list-item">
                <span>
                  <strong>
                    {staff.roleName || STAFF_ROLES_INFO[staff.roleId]?.name}
                  </strong>
                  (Cost: $
                  {(
                    staff.costPerWeek ||
                    STAFF_ROLES_INFO[staff.roleId]?.costPerWeek
                  )?.toLocaleString()}
                  /week)
                </span>
                <button
                  className="action-button critical small-button"
                  onClick={() => actions.fireStaff?.(staff.id)}
                >
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not hired any campaign staff yet.</p>
        )}
      </section>
      <section className="info-card">
        <h3>Hire Staff</h3>
        {availableRolesToHire.length > 0 ? (
          <ul className="staff-list hire-list">
            {" "}
            {/* Added hire-list for potential distinct styling */}
            {availableRolesToHire.map((roleInfo) => (
              <li key={roleInfo.id} className="staff-list-item">
                <div className="staff-hire-info">
                  <strong>{roleInfo.name}</strong>
                  <p className="staff-description">{roleInfo.description}</p>
                  <p className="staff-cost">
                    Cost: ${roleInfo.costPerWeek?.toLocaleString()}/week
                  </p>
                </div>
                <button
                  className="action-button positive small-button"
                  onClick={() => actions.hireStaff?.(roleInfo.id)}
                  disabled={
                    campaignFunds < roleInfo.costPerWeek ||
                    !politician.isInCampaign
                  }
                  title={
                    campaignFunds < roleInfo.costPerWeek
                      ? "Not enough funds for first week's salary"
                      : `Hire ${roleInfo.name}`
                  }
                >
                  {" "}
                  Hire
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            All key staff roles are currently filled or no candidates available.
          </p>
        )}
      </section>
    </div>
  );
};

const FieldOpsSubTab = ({ campaignData, actions }) => {
  const politician = campaignData.politician || {};
  const startingCity = campaignData.startingCity || {};
  const campaignHoursRemainingToday =
    politician.campaignHoursRemainingToday || 0;

  const [rallyHours, setRallyHours] = useState(4);
  const [doorKnockingHours, setDoorKnockingHours] = useState(2);
  const [recruitVolunteersHours, setRecruitVolunteersHours] = useState(2);

  const calculateRallyCost = useCallback((hours) => 500 + hours * 150, []);
  const currentRallyCost = calculateRallyCost(rallyHours);

  const adultPopulation = useMemo(() => {
    if (!startingCity.population || !startingCity.demographics?.ageDistribution)
      return 0;
    return calculateAdultPopulation(
      startingCity.population,
      startingCity.demographics.ageDistribution
    );
  }, [startingCity.population, startingCity.demographics?.ageDistribution]);

  return (
    <div className="sub-tab-content">
      <section className="info-card">
        {" "}
        {/* Re-using info-card for consistency */}
        <h3>Grassroots & Rallies</h3>
        <p>
          <strong>Volunteer Base:</strong>{" "}
          {politician.volunteerCount?.toLocaleString() || 0} active
        </p>
        <p>
          <strong>Name Recognition:</strong>{" "}
          {politician.nameRecognition?.toLocaleString() || "0"} people
          {adultPopulation > 0 &&
            ` (~${(
              ((politician.nameRecognition || 0) / adultPopulation) *
              100
            ).toFixed(1)}% of adults)`}
        </p>
        <div className="action-item-block">
          {" "}
          {/* Use this for individual action groups */}
          <h4>Go Door Knocking</h4>
          <div className="action-controls">
            <label htmlFor="doorKnockHours">
              Hours (1-{campaignHoursRemainingToday}):
            </label>
            <input
              type="number"
              id="doorKnockHours"
              value={doorKnockingHours}
              onChange={(e) =>
                setDoorKnockingHours(
                  Math.max(
                    1,
                    Math.min(
                      campaignHoursRemainingToday,
                      parseInt(e.target.value, 10) || 1
                    )
                  )
                )
              }
              min="1"
              max={campaignHoursRemainingToday}
            />
            <button
              className="action-button"
              onClick={() => actions.goDoorKnocking?.(doorKnockingHours)}
              disabled={
                campaignHoursRemainingToday < doorKnockingHours ||
                !politician.isInCampaign
              }
              title={
                campaignHoursRemainingToday < doorKnockingHours
                  ? `Need ${doorKnockingHours} hrs`
                  : `Spend ${doorKnockingHours} hours on door knocking`
              }
            >
              Knock Doors ({doorKnockingHours}hr)
            </button>
          </div>
        </div>
        <div className="action-item-block">
          <h4>Hold Rally</h4>
          <div className="action-controls">
            <label htmlFor="rallyHours">
              Event Duration (2-{campaignHoursRemainingToday}hrs):
            </label>
            <input
              type="number"
              id="rallyHours"
              value={rallyHours}
              onChange={(e) =>
                setRallyHours(
                  Math.max(
                    2,
                    Math.min(
                      campaignHoursRemainingToday,
                      parseInt(e.target.value, 10) || 2
                    )
                  )
                )
              }
              min="2"
              max={campaignHoursRemainingToday}
            />
            <button
              className="action-button"
              onClick={() => actions.holdRallyActivity?.(rallyHours)}
              disabled={
                campaignHoursRemainingToday < rallyHours ||
                (politician.campaignFunds || 0) < currentRallyCost ||
                !politician.isInCampaign
              }
              title={
                campaignHoursRemainingToday < rallyHours
                  ? `Need ${rallyHours} hrs`
                  : (politician.campaignFunds || 0) < currentRallyCost
                  ? `Need $${currentRallyCost.toLocaleString()}`
                  : (politician.volunteerCount || 0) < 5 * rallyHours
                  ? `Need ${5 * rallyHours} volunteers`
                  : `Spend ${rallyHours}hrs. Cost: $${currentRallyCost.toLocaleString()}`
              }
            >
              Hold Rally ({rallyHours}hr - ${currentRallyCost.toLocaleString()})
            </button>
          </div>
        </div>
        <div className="action-item-block">
          <h4>Recruit Volunteers</h4>
          <div className="action-controls">
            <label htmlFor="recruitHours">
              Effort (1-{campaignHoursRemainingToday}hrs):
            </label>
            <input
              type="number"
              id="recruitHours"
              value={recruitVolunteersHours}
              onChange={(e) =>
                setRecruitVolunteersHours(
                  Math.max(
                    1,
                    Math.min(
                      campaignHoursRemainingToday,
                      parseInt(e.target.value, 10) || 1
                    )
                  )
                )
              }
              min="1"
              max={campaignHoursRemainingToday}
            />
            <button
              className="action-button"
              onClick={() =>
                actions.recruitVolunteers?.(recruitVolunteersHours)
              }
              disabled={
                campaignHoursRemainingToday < recruitVolunteersHours ||
                !politician.isInCampaign
              }
              title={
                campaignHoursRemainingToday < recruitVolunteersHours
                  ? `Need ${recruitVolunteersHours} hrs`
                  : `Spend ${recruitVolunteersHours} hours recruiting`
              }
            >
              Recruit Drive ({recruitVolunteersHours}hr)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const CommsAdsSubTab = ({ campaignData, actions, cityKeyIssues }) => {
  const politician = campaignData.politician || {};
  const campaignHoursRemainingToday =
    politician.campaignHoursRemainingToday || 0;
  const playerActiveElection = campaignData.elections?.find(
    (e) => e.playerIsCandidate && e.outcome?.status === "upcoming"
  );

  // State for Monthly Ad Strategy
  const [monthlyAdFocus, setMonthlyAdFocus] = useState(
    politician.currentAdStrategy?.focus || "none"
  );
  const [monthlyAdTargetId, setMonthlyAdTargetId] = useState(
    politician.currentAdStrategy?.targetId || ""
  );
  const [monthlyAdIntensity, setMonthlyAdIntensity] = useState(
    politician.currentAdStrategy?.intensity || 50
  );
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(
    politician.advertisingBudgetMonthly || 0
  );

  // State for Manual Ad Blitz
  const [manualAdType, setManualAdType] = useState("");
  const [manualTargetOpponentId, setManualTargetOpponentId] = useState("");
  const [manualTargetIssue, setManualTargetIssue] = useState("");
  const [manualSpendAmount, setManualSpendAmount] = useState(1000);
  const [manualAdHours, setManualAdHours] = useState(3);

  const opponents = useMemo(() => {
    if (!playerActiveElection) return [];
    // Corrected: Convert the Map's values to an array before filtering
    return Array.from(playerActiveElection.candidates.values()).filter(
      (c) => !c.isPlayer
    );
  }, [playerActiveElection]);

  useEffect(() => {
    setManualTargetOpponentId("");
    setManualTargetIssue("");
  }, [manualAdType]);
  useEffect(() => {
    setMonthlyAdTargetId("");
  }, [monthlyAdFocus]);
  useEffect(() => {
    setMonthlyBudgetInput(politician.advertisingBudgetMonthly || 0);
  }, [politician.advertisingBudgetMonthly]);
  useEffect(() => {
    setMonthlyAdFocus(politician.currentAdStrategy?.focus || "none");
    setMonthlyAdTargetId(politician.currentAdStrategy?.targetId || "");
    setMonthlyAdIntensity(politician.currentAdStrategy?.intensity || 50);
  }, [politician.currentAdStrategy]);

  const handleSetMonthlyBudget = () => {
    const amount = parseInt(monthlyBudgetInput, 10);
    if (isNaN(amount) || amount < 0) {
      actions.addToast?.({
        message: "Please enter a valid monthly budget amount.",
        type: "error",
      });
      return;
    }
    actions.setMonthlyAdvertisingBudget?.(amount);
    actions.addToast?.({
      message: `Monthly ad budget set to $${amount.toLocaleString()}`,
      type: "success",
    });
  };

  const handleSetAdStrategy = () => {
    if (monthlyAdFocus === "attack_opponent" && !monthlyAdTargetId) {
      actions.addToast?.({
        message: "Please select an opponent for attack strategy.",
        type: "error",
      });
      return;
    }
    if (monthlyAdFocus === "advocacy_issue" && !monthlyAdTargetId) {
      actions.addToast?.({
        message: "Please select an issue for issue advocacy strategy.",
        type: "error",
      });
      return;
    }
    actions.setAdvertisingStrategy?.({
      focus: monthlyAdFocus,
      targetId: monthlyAdTargetId,
      intensity: monthlyAdIntensity,
    });
    actions.addToast?.({
      message: "Ongoing advertising strategy updated!",
      type: "info",
    });
  };

  const handleLaunchManualBlitz = () => {
    if (campaignHoursRemainingToday < manualAdHours) {
      actions.addToast?.({
        message: `Not enough campaign hours. Need ${manualAdHours} hrs.`,
        type: "warning",
      });
      return;
    }
    if (!manualAdType) {
      actions.addToast?.({
        message: "Please select an ad type for the blitz.",
        type: "error",
      });
      return;
    }

    let targetIdForAction = null;
    if (manualAdType === "attack") {
      if (!manualTargetOpponentId) {
        actions.addToast?.({
          message: `Please select a target opponent for the attack ad blitz.`,
          type: "error",
        });
        return;
      }
      targetIdForAction = manualTargetOpponentId;
    } else if (manualAdType === "issue") {
      if (!manualTargetIssue) {
        actions.addToast?.({
          message: `Please select a target issue for the issue ad blitz.`,
          type: "error",
        });
        return;
      }
      targetIdForAction = manualTargetIssue;
    }

    const spend = parseInt(manualSpendAmount, 10);
    if (isNaN(spend) || spend <= 0) {
      actions.addToast?.({
        message: "Please enter a valid spend amount.",
        type: "error",
      });
      return;
    }
    if ((politician.campaignFunds || 0) < spend) {
      actions.addToast?.({
        message: "Not enough campaign funds for this ad blitz.",
        type: "error",
      });
      return;
    }

    actions.launchManualAdBlitz?.({
      adType: manualAdType,
      targetId: targetIdForAction,
      spendAmount: spend,
      hoursSpent: manualAdHours,
    });
  };

  const mediaAppearanceCost = 200;
  const mediaAppearanceHours = 3; // Default hours for a media appearance

  // --- Detailed title logic for Launch Ad Blitz button ---
  const launchAdBlitzTitle = () => {
    if (campaignHoursRemainingToday < manualAdHours)
      return `Not enough campaign hours (Need ${manualAdHours}hrs).`;
    if (!manualAdType) return "Select an ad type first.";
    if ((politician.campaignFunds || 0) < manualSpendAmount)
      return `Need $${parseInt(
        manualSpendAmount,
        10
      ).toLocaleString()} campaign funds.`;
    if (manualAdType === "attack" && !manualTargetOpponentId)
      return "Select an opponent to target.";
    if (manualAdType === "issue" && !manualTargetIssue)
      return "Select an issue to focus on.";
    return `Launch ${manualAdType} Ad Blitz (${manualAdHours}hr - Spend $${parseInt(
      manualSpendAmount,
      10
    ).toLocaleString()})`;
  };

  // --- Detailed title logic for Media Appearance button ---
  const mediaAppearanceTitle = () => {
    if (campaignHoursRemainingToday < mediaAppearanceHours)
      return `Not enough campaign hours (Need ${mediaAppearanceHours}hrs).`;
    if ((politician.treasury || 0) < mediaAppearanceCost)
      return `Need $${mediaAppearanceCost} from personal treasury.`;
    return `Request Local News Interview (${mediaAppearanceHours}hr - Treasury Cost: $${mediaAppearanceCost})`;
  };

  return (
    <div className="sub-tab-content comms-ads-tab">
      <section className="info-card">
        <h3>Ongoing Advertising Strategy & Budget</h3>
        <p>
          Set a monthly budget and an ongoing strategy for your campaign team to
          execute automatically. Effects are gradual over time.
        </p>
        <div className="action-item-block">
          <h4>Monthly Budget</h4>
          <div className="action-controls">
            <label htmlFor="monthlyBudget">Set Amount ($):</label>
            <input
              type="number"
              id="monthlyBudget"
              value={monthlyBudgetInput}
              onChange={(e) =>
                setMonthlyBudgetInput(parseInt(e.target.value, 10) || 0)
              }
              min="0"
              step="100"
              disabled={!politician.isInCampaign}
            />
            <button
              className="action-button small-button"
              onClick={handleSetMonthlyBudget}
              disabled={!politician.isInCampaign}
            >
              Set Budget
            </button>
          </div>
          <p>
            <strong>Current Monthly Budget:</strong> $
            {politician.advertisingBudgetMonthly?.toLocaleString() || 0}
          </p>
        </div>
        <div className="action-item-block">
          <h4>Ongoing Strategy</h4>
          <div className="action-controls">
            <label htmlFor="adFocusSelect">Focus:</label>
            <select
              id="adFocusSelect"
              value={monthlyAdFocus}
              onChange={(e) => {
                setMonthlyAdFocus(e.target.value);
                setMonthlyAdTargetId("");
              }}
              disabled={!politician.isInCampaign}
            >
              <option value="none">-- None (Conserve Budget) --</option>
              <option value="positive_self">Positive (Highlight Self)</option>
              <option value="attack_opponent">Attack Opponent (General)</option>
              <option value="advocacy_issue">
                Issue Advocacy (Promote Stance)
              </option>
            </select>
          </div>
          {monthlyAdFocus === "attack_opponent" && opponents.length > 0 && (
            <div className="action-controls" style={{ marginTop: "10px" }}>
              <label htmlFor="monthlyTargetOpponent">Target Opponent:</label>
              <select
                id="monthlyTargetOpponent"
                value={monthlyAdTargetId}
                onChange={(e) => setMonthlyAdTargetId(e.target.value)}
                disabled={opponents.length === 0 || !politician.isInCampaign}
              >
                <option value="">-- Select Opponent --</option>
                {opponents.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {monthlyAdFocus === "advocacy_issue" && cityKeyIssues.length > 0 && (
            <div className="action-controls" style={{ marginTop: "10px" }}>
              <label htmlFor="monthlyTargetIssue">Focus Issue:</label>
              <select
                id="monthlyTargetIssue"
                value={monthlyAdTargetId}
                onChange={(e) => setMonthlyAdTargetId(e.target.value)}
                disabled={
                  cityKeyIssues.length === 0 || !politician.isInCampaign
                }
              >
                <option value="">-- Select Key Issue --</option>
                {cityKeyIssues.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="action-controls" style={{ marginTop: "10px" }}>
            <label htmlFor="monthlyAdIntensity">Intensity:</label>
            <input
              type="range"
              id="monthlyAdIntensity"
              min="0"
              max="100"
              step="10"
              value={monthlyAdIntensity}
              onChange={(e) =>
                setMonthlyAdIntensity(parseInt(e.target.value, 10))
              }
              disabled={!politician.isInCampaign}
            />
            <span>{monthlyAdIntensity}%</span>
          </div>
          <button
            className="action-button"
            onClick={handleSetAdStrategy}
            style={{ marginTop: "15px" }}
            disabled={!politician.isInCampaign}
          >
            Update Ad Strategy
          </button>
          <p
            style={{
              fontSize: "0.9em",
              color: "var(--secondary-text)",
              marginTop: "10px",
            }}
          >
            Current:{" "}
            <strong>{politician.currentAdStrategy?.focus || "none"}</strong>
            {politician.currentAdStrategy?.targetId &&
              ` on/targeting "${politician.currentAdStrategy.targetId}"`}
            , at{" "}
            <strong>{politician.currentAdStrategy?.intensity || 0}%</strong>{" "}
            intensity.
          </p>
        </div>
      </section>

      <section className="info-card">
        <h3>Manual Ad Campaign Blitz</h3>
        <p>
          Launch a targeted, short-term advertising blitz. Consumes campaign
          hours and funds immediately.
        </p>
        <div className="action-item-block">
          <h4>Setup Blitz</h4>
          <div className="action-controls">
            <label htmlFor="manualAdHours">
              Hours (2-{campaignHoursRemainingToday}):
            </label>
            <input
              type="number"
              id="manualAdHours"
              value={manualAdHours}
              onChange={(e) =>
                setManualAdHours(
                  Math.max(
                    2,
                    Math.min(
                      campaignHoursRemainingToday,
                      parseInt(e.target.value, 10) || 2
                    )
                  )
                )
              }
              disabled={!politician.isInCampaign}
              min="2"
              max={campaignHoursRemainingToday}
            />
          </div>
          <div className="action-controls" style={{ marginTop: "10px" }}>
            <label htmlFor="manualAdTypeSelect">Ad Type:</label>
            <select
              id="manualAdTypeSelect"
              value={manualAdType}
              onChange={(e) => setManualAdType(e.target.value)}
              disabled={!politician.isInCampaign}
            >
              <option value="">-- Select --</option>
              <option value="positive">Positive Ad</option>
              <option value="attack">Attack Ad</option>
              <option value="issue">Issue Ad</option>
            </select>
          </div>

          {manualAdType === "attack" && (
            <div className="action-controls" style={{ marginTop: "10px" }}>
              <label htmlFor="manualTargetOpponent">Target Opponent:</label>
              <select
                id="manualTargetOpponent"
                value={manualTargetOpponentId}
                onChange={(e) => setManualTargetOpponentId(e.target.value)}
                disabled={opponents.length === 0 || !politician.isInCampaign}
              >
                <option value="">-- Select Opponent --</option>
                {opponents.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {manualAdType === "issue" && (
            <div className="action-controls" style={{ marginTop: "10px" }}>
              <label htmlFor="manualTargetIssue">Focus Issue:</label>
              <select
                id="manualTargetIssue"
                value={manualTargetIssue}
                onChange={(e) => setManualTargetIssue(e.target.value)}
                disabled={
                  cityKeyIssues.length === 0 || !politician.isInCampaign
                }
              >
                <option value="">-- Select Key Issue --</option>
                {cityKeyIssues.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="action-controls" style={{ marginTop: "10px" }}>
            <label htmlFor="manualSpendAmount">Spend Amount ($):</label>
            <input
              type="number"
              id="manualSpendAmount"
              value={manualSpendAmount}
              onChange={(e) =>
                setManualSpendAmount(parseInt(e.target.value, 10) || 500)
              }
              min="500"
              step="100"
              disabled={!politician.isInCampaign}
            />
          </div>
          <button
            className="action-button"
            onClick={handleLaunchManualBlitz}
            style={{ marginTop: "15px" }}
            disabled={
              campaignHoursRemainingToday < manualAdHours ||
              !manualAdType ||
              (politician.campaignFunds || 0) < manualSpendAmount ||
              (manualAdType === "attack" && !manualTargetOpponentId) ||
              (manualAdType === "issue" && !manualTargetIssue) ||
              !politician.isInCampaign
            }
            title={launchAdBlitzTitle()}
          >
            Launch Ad Blitz ({manualAdHours}hr - $
            {parseInt(manualSpendAmount, 10).toLocaleString() || 0})
          </button>
        </div>
      </section>

      <section className="info-card">
        <h3>Media Relations</h3>
        <div className="action-item-block">
          <h4>Appearances</h4>
          <div className="action-controls">
            {/* You can add an input for mediaAppearanceHours if you want it to be variable */}
            <button
              className="action-button"
              onClick={() =>
                actions.makePublicAppearanceActivity?.(mediaAppearanceHours)
              }
              disabled={
                campaignHoursRemainingToday < mediaAppearanceHours ||
                (politician.campaignFunds || 0) < mediaAppearanceCost || // Corrected from politician.treasury to campaignFunds based on campaignActionsSlice.js
                !politician.isInCampaign
              }
              title={mediaAppearanceTitle()}
            >
              Request Local News Interview ({mediaAppearanceHours}hr - Campaign
              Funds: ${mediaAppearanceCost})
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FundraisingSubTab = ({ campaignData, actions }) => {
  const politician = campaignData.politician || {};
  const campaignHoursRemainingToday =
    politician.campaignHoursRemainingToday || 0;
  const [fundraisingHours, setFundraisingHours] = useState(2);

  return (
    <div className="sub-tab-content">
      <section className="info-card">
        <h3>Fundraising Operations</h3>
        <p>
          <strong>Current Campaign Funds:</strong> $
          {politician.campaignFunds?.toLocaleString() || 0}
        </p>
        <div className="action-item-block">
          <h4>Personal Fundraising Drive</h4>
          <div className="action-controls">
            <label htmlFor="fundraisingHours">
              Hours to Dedicate (1-{campaignHoursRemainingToday}):
            </label>
            <input
              type="number"
              id="fundraisingHours"
              value={fundraisingHours}
              onChange={(e) =>
                setFundraisingHours(
                  Math.max(
                    1,
                    Math.min(
                      campaignHoursRemainingToday,
                      parseInt(e.target.value) || 1
                    )
                  )
                )
              }
              min="1"
              max={campaignHoursRemainingToday}
            />
            <button
              className="action-button"
              onClick={() =>
                actions.personalFundraisingActivity?.(fundraisingHours)
              }
              disabled={
                campaignHoursRemainingToday < fundraisingHours ||
                !politician.isInCampaign
              }
              title={
                campaignHoursRemainingToday < fundraisingHours
                  ? `Need ${fundraisingHours} hrs`
                  : `Spend ${fundraisingHours} hours actively fundraising`
              }
            >
              Fundraise ({fundraisingHours}hr)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- MAIN CAMPAIGN TAB COMPONENT ---
function CampaignTab({ campaignData }) {
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  const storeActions = useGameStore((state) => state.actions);
  const { openViewPoliticianModal } = storeActions; // Destructure only once

  const cityKeyIssues = useMemo(
    () => campaignData?.startingCity?.stats?.mainIssues || [],
    [campaignData?.startingCity?.stats?.mainIssues]
  );

  const politician = campaignData?.politician || {};
  const previousDayRef = React.useRef(campaignData?.currentDate?.day);

  // Effect to reset daily campaign hours when the game day changes
  useEffect(() => {
    if (campaignData?.currentDate?.day !== previousDayRef.current) {
      if (previousDayRef.current !== undefined) {
        storeActions.resetDailyCampaignHours?.();
      }
      previousDayRef.current = campaignData?.currentDate?.day;
    }
  }, [campaignData?.currentDate?.day, storeActions]);

  if (!campaignData || !politician.id) {
    return (
      <div className="campaign-tab-content ui-panel">
        {" "}
        {/* Ensure consistent root class */}
        <h2 className="tab-title">My Campaign</h2>
        <p className="chart-no-data-message">
          Loading campaign information or no active campaign...
        </p>
      </div>
    );
  }

  const renderSubTabContent = () => {
    // Consolidate props passed to sub-tabs
    const subTabProps = {
      campaignData, // This contains politician, startingCity, elections etc.
      actions: storeActions,
      cityKeyIssues, // Already memoized
    };

    switch (activeSubTab) {
      case "Overview":
        return (
          <CampaignOverviewSubTab
            {...subTabProps}
            openViewPoliticianModal={openViewPoliticianModal}
          />
        );
      case "Staff":
        return <StaffSubTab {...subTabProps} />;
      case "Field Ops":
        return <FieldOpsSubTab {...subTabProps} />;
      case "Comms & Ads":
        return <CommsAdsSubTab {...subTabProps} />;
      case "Fundraising":
        return <FundraisingSubTab {...subTabProps} />;
      default:
        return (
          <CampaignOverviewSubTab
            {...subTabProps}
            openViewPoliticianModal={openViewPoliticianModal}
          />
        );
    }
  };

  return (
    <div className="campaign-tab-content ui-panel">
      <h2 className="tab-title">Campaign Management</h2>

      {/* This card might always be visible to show general daily effort capacity */}
      <div className="campaign-hours-tracker info-card">
        <h3>Daily Effort</h3>{" "}
        {/* Renamed from Campaign Effort for broader applicability */}
        <p>
          Hours Remaining Today:
          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.1em",
              color:
                (politician.campaignHoursRemainingToday || 0) <=
                Math.floor((politician.campaignHoursPerDay || 8) * 0.25)
                  ? "var(--error-text, red)"
                  : (politician.campaignHoursRemainingToday || 0) <=
                    Math.floor((politician.campaignHoursPerDay || 8) * 0.5)
                  ? "var(--warning-text, orange)"
                  : "var(--success-text, green)",
            }}
          >
            {" "}
            {politician.campaignHoursRemainingToday || 0}
          </span>{" "}
          / {politician.campaignHoursPerDay || 8}
        </p>
      </div>

      {/* Conditional rendering for the main campaign interface (sub-tabs and content) */}
      {politician.isInCampaign ? (
        <>
          <div className="sub-tab-navigation campaign-sub-nav">
            <button
              onClick={() => setActiveSubTab("Overview")}
              className={activeSubTab === "Overview" ? "active" : ""}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab("Staff")}
              className={activeSubTab === "Staff" ? "active" : ""}
            >
              Staff
            </button>
            <button
              onClick={() => setActiveSubTab("Field Ops")}
              className={activeSubTab === "Field Ops" ? "active" : ""}
            >
              Field Ops
            </button>
            <button
              onClick={() => setActiveSubTab("Comms & Ads")}
              className={activeSubTab === "Comms & Ads" ? "active" : ""}
            >
              Comms & Ads
            </button>
            <button
              onClick={() => setActiveSubTab("Fundraising")}
              className={activeSubTab === "Fundraising" ? "active" : ""}
            >
              Fundraising
            </button>
          </div>

          <div className="sub-tab-content-area">{renderSubTabContent()}</div>
        </>
      ) : (
        <div className="info-card no-active-campaign-message">
          {" "}
          {/* Use .info-card for consistent styling */}
          <h3>Not Actively Campaigning</h3>
          <p>
            You are not currently engaged in an active election campaign. Many
            campaign-specific actions and details will become available once you
            declare your candidacy for an office.
          </p>
          <p>
            You can explore available offices and declare your candidacy in the
            "Elections" sub-tab of the "Career & Actions" screen. You can still
            use your daily hours for personal development actions.
          </p>
        </div>
      )}
    </div>
  );
}

export default CampaignTab;
