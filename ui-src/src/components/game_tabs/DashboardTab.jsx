// ui-src/src/components/game_tabs/DashboardTab.jsx
import React, { useMemo } from "react";
import useGameStore from "../../store";
import { getTimeUntil, createDateObj } from "../../utils/generalUtils.js";
import CitySelector from "../CitySelector.jsx";
import "./TabStyles.css";
import "./DashboardTab.css";

function DashboardTab({ campaignData }) {
  const {
    playerPoliticianId,
    politicians: politiciansSoA,
    currentDate,
    startingCity,
    elections = [],
  } = campaignData || {};

  const actions = useGameStore((state) => state.actions);
  const { openViewPoliticianModal } = actions;

  const playerPolitician = useMemo(() => {
    if (!playerPoliticianId || !politiciansSoA) return null;

    const base = politiciansSoA.base.get(playerPoliticianId);
    const state = politiciansSoA.state.get(playerPoliticianId);
    const finances = politiciansSoA.finances.get(playerPoliticianId);

    if (!base || !state || !finances) return null;

    return {
      ...base,
      ...state,
      ...finances,
    };
  }, [playerPoliticianId, politiciansSoA]);

  if (!playerPolitician || !currentDate || !startingCity) {
    return (
      <div className="tab-content-container ui-panel dashboard-tab">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const currentDateObj = createDateObj(currentDate);

  const playerUpcomingElection = elections
    .filter((e) => e.playerIsCandidate && e.outcome?.status === "upcoming")
    .sort((a, b) => {
      const dateA = createDateObj(a.electionDate);
      const dateB = createDateObj(b.electionDate);
      return dateA - dateB;
    })
    .find((e) => createDateObj(e.electionDate) >= currentDateObj);

  return (
    <div className="tab-content-container ui-panel dashboard-tab">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2 className="tab-title">Dashboard</h2>
          <p className="welcome-message">
            Welcome back,{" "}
            {playerPolitician.currentOffice || playerPolitician.firstName}!
          </p>
          <p className="current-date-dashboard">
            Current Date: {currentDate.month}/{currentDate.day}/{currentDate.year}
          </p>
        </div>
        <div className="dashboard-controls">
          <CitySelector />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Player Status Card - UPDATED */}
        <div className="info-card player-status-card">
          <div className="card-header">
            <h3>Your Status</h3>
            <button
              className="view-profile-btn"
              onClick={() => openViewPoliticianModal(playerPolitician)}
              title="View your complete politician profile"
            >
              View Profile
            </button>
          </div>
          <p>
            <strong>Name:</strong>{" "}
            {playerPolitician.firstName} {playerPolitician.lastName}
          </p>
          <p>
            <strong>Age:</strong>{" "}
            {playerPolitician.age != null ? `${playerPolitician.age} years old` : "N/A"}
          </p>
          <p>
            <strong>Current Role:</strong>{" "}
            {playerPolitician.currentOffice || "Aspiring Politician"}
          </p>
          <p>
            <strong>Approval:</strong>{" "}
            {playerPolitician.approvalRating != null
              ? `${playerPolitician.approvalRating}%`
              : "N/A"}
          </p>
          <p>
            <strong>Political Capital:</strong>{" "}
            {playerPolitician.politicalCapital?.toLocaleString() || 0}
          </p>
          <p>
            <strong>Name Recognition:</strong>{" "}
            {playerPolitician.nameRecognition?.toLocaleString() || 0}
          </p>
          <p>
            <strong>Campaign Funds:</strong> $
            {playerPolitician.campaignFunds?.toLocaleString() || 0}
          </p>
          <p>
            <strong>Personal Treasury:</strong> $
            {playerPolitician.treasury?.toLocaleString() || 0}
          </p>
        </div>

        {/* City Snapshot Card - UPDATED */}
        <div className="info-card city-snapshot-card">
          <h3>{startingCity.name} Snapshot</h3>
          <p>
            <strong>Population:</strong>{" "}
            {startingCity.population?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Citizen Mood:</strong>{" "}
            {startingCity.stats?.overallCitizenMood || "N/A"}
          </p>
          <p>
            <strong>Economic Outlook:</strong>{" "}
            {startingCity.stats?.economicOutlook || "N/A"}
          </p>
          <p>
            <strong>Crime Rate:</strong>{" "}
            {startingCity.stats?.crimeRatePer1000
              ? `${startingCity.stats.crimeRatePer1000}/1k`
              : "N/A"}
          </p>
          <p>
            <strong>Poverty Rate:</strong>{" "}
            {startingCity.stats?.povertyRate
              ? `${startingCity.stats.povertyRate}%`
              : "N/A"}
          </p>
          <p>
            <strong>Key Issues:</strong>{" "}
            {(startingCity.stats?.mainIssues || []).slice(0, 2).join(", ") ||
              "N/A"}
          </p>
        </div>

        {/* Upcoming Elections / Events Card */}
        <div className="info-card upcoming-events-card">
          <h3>Upcoming Elections</h3>
          {playerUpcomingElection ? (
            <div className="event-item player-election-event">
              <p>
                <strong>Your Next Election:</strong>{" "}
                {playerUpcomingElection.officeName}
              </p>
              <p>
                Date: {playerUpcomingElection.electionDate.month}/
                {playerUpcomingElection.electionDate.day}/
                {playerUpcomingElection.electionDate.year}
                <span className="countdown">
                  (
                  {getTimeUntil(
                    currentDateObj,
                    createDateObj(playerUpcomingElection.electionDate),
                    playerUpcomingElection.outcome?.status,
                    true
                  )}
                  )
                </span>
              </p>
              <button
                className="action-button"
                onClick={() => actions.setActiveMainGameTab("Campaign")}
              >
                Go to Campaign Tab
              </button>
            </div>
          ) : (
            <p>You are not currently running in an upcoming election.</p>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="info-card quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="action-button-group">
            <button
              className="action-button"
              onClick={() => actions.setActiveMainGameTab("LocalArea")}
            >
              View Local Area Details
            </button>
            <button
              className="action-button"
              onClick={() => actions.setActiveMainGameTab("Politicians")}
            >
              View Political Landscape
            </button>
            <button
              className="action-button"
              onClick={() => actions.setActiveMainGameTab("Career")}
            >
              Manage Career & Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
