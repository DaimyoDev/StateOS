// ui-src/src/components/game_tabs/DashboardTab.jsx
import React from "react";
import useGameStore from "../../store";
import { getTimeUntil } from "../../utils/generalUtils.js"; // Assuming moved here
import "./TabStyles.css";
import "./DashboardTab.css"; // Create this new CSS file

function DashboardTab({ campaignData }) {
  const {
    politician: playerPolitician,
    currentDate,
    startingCity,
    playerApproval,
    currentOffice,
    elections = [],
  } = campaignData || {};

  const actions = useGameStore((state) => state.actions); // For navigation

  if (!playerPolitician || !currentDate || !startingCity) {
    return (
      <div className="tab-content-container ui-panel dashboard-tab">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const currentDateObj = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day
  );

  // Find player's next upcoming election they are a candidate in
  const playerUpcomingElection = elections
    .filter((e) => e.playerIsCandidate && e.outcome?.status === "upcoming")
    .sort((a, b) => {
      // Sort by date to find the soonest
      const dateA = new Date(
        a.electionDate.year,
        a.electionDate.month - 1,
        a.electionDate.day
      );
      const dateB = new Date(
        b.electionDate.year,
        b.electionDate.month - 1,
        b.electionDate.day
      );
      return dateA - dateB;
    })
    .find(
      (e) =>
        new Date(
          e.electionDate.year,
          e.electionDate.month - 1,
          e.electionDate.day
        ) >= currentDateObj
    );

  // Find next general upcoming election in the starting city (mayor or council)
  const nextGeneralLocalElection = elections
    .filter(
      (e) =>
        (e.officeNameTemplateId === "mayor" ||
          e.officeNameTemplateId === "city_council") &&
        e.officeName?.includes(startingCity.name) && // Ensure it's for the current city
        e.outcome?.status === "upcoming"
    )
    .sort((a, b) => {
      /* as above */
      const dateA = new Date(
        a.electionDate.year,
        a.electionDate.month - 1,
        a.electionDate.day
      );
      const dateB = new Date(
        b.electionDate.year,
        b.electionDate.month - 1,
        b.electionDate.day
      );
      return dateA - dateB;
    })
    .find(
      (e) =>
        new Date(
          e.electionDate.year,
          e.electionDate.month - 1,
          e.electionDate.day
        ) >= currentDateObj
    );

  return (
    <div className="tab-content-container ui-panel dashboard-tab">
      <h2 className="tab-title">Dashboard</h2>
      <p className="welcome-message">
        Welcome back,{" "}
        {currentOffice ? currentOffice : playerPolitician.firstName}!{" "}
        {/* Show office or name */}
      </p>
      <p className="current-date-dashboard">
        Current Date: {currentDate.month}/{currentDate.day}/{currentDate.year}
      </p>

      <div className="dashboard-grid">
        {/* Player Status Card */}
        <div className="info-card player-status-card">
          <h3>Your Status</h3>
          <p>
            <strong>Current Role:</strong>{" "}
            {currentOffice || "Aspiring Politician"}
          </p>
          <p>
            <strong>Overall Approval:</strong>{" "}
            {playerApproval != null ? `${playerApproval}%` : "N/A"}
          </p>
          <p>
            <strong>Campaign Funds:</strong> $
            {playerPolitician.campaignFunds?.toLocaleString() || 0}
          </p>
          <p>
            <strong>Personal Treasury:</strong> $
            {playerPolitician.treasury?.toLocaleString() || 0}
          </p>
          {/* Could add ideology or a key attribute here */}
          <p>
            <strong>Ideology:</strong>{" "}
            {playerPolitician.calculatedIdeology || "N/A"}
          </p>
        </div>

        {/* City Snapshot Card */}
        <div className="info-card city-snapshot-card">
          <h3>{startingCity.name} Snapshot</h3>
          <p>
            <strong>Population:</strong>{" "}
            {startingCity.population?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Type:</strong> {startingCity.stats?.type || "N/A"}
          </p>
          <p>
            <strong>Wealth:</strong> {startingCity.stats?.wealth || "N/A"}
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
            <strong>Key Issues:</strong>{" "}
            {(startingCity.stats?.mainIssues || []).slice(0, 2).join(", ") ||
              "N/A"}
          </p>
        </div>

        {/* Upcoming Elections / Events Card */}
        <div className="info-card upcoming-events-card">
          <h3>Upcoming Elections & Events</h3>
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
                    new Date(
                      playerUpcomingElection.electionDate.year,
                      playerUpcomingElection.electionDate.month - 1,
                      playerUpcomingElection.electionDate.day
                    ),
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
          {nextGeneralLocalElection &&
            (!playerUpcomingElection ||
              playerUpcomingElection.id !== nextGeneralLocalElection.id) && (
              <div className="event-item">
                <p>
                  <strong>Next Local Election:</strong>{" "}
                  {nextGeneralLocalElection.officeName}
                </p>
                <p>
                  Date: {nextGeneralLocalElection.electionDate.month}/
                  {nextGeneralLocalElection.electionDate.day}/
                  {nextGeneralLocalElection.electionDate.year}
                  <span className="countdown">
                    (
                    {getTimeUntil(
                      currentDateObj,
                      new Date(
                        nextGeneralLocalElection.electionDate.year,
                        nextGeneralLocalElection.electionDate.month - 1,
                        nextGeneralLocalElection.electionDate.day
                      ),
                      nextGeneralLocalElection.outcome?.status
                    )}
                    )
                  </span>
                </p>
                <button
                  className="action-button"
                  onClick={() => actions.setActiveMainGameTab("Elections")}
                >
                  View Elections
                </button>
              </div>
            )}
          {!playerUpcomingElection && !nextGeneralLocalElection && (
            <p>No major upcoming local elections found.</p>
          )}
          {/* TODO: Placeholder for other general events */}
          {/* <p style={{marginTop: '15px', fontStyle: 'italic'}}>No other significant events scheduled.</p> */}
        </div>

        {/* Quick Actions Card (Optional) */}
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
              onClick={() => actions.setActiveMainGameTab("Elections")}
            >
              Browse All Elections
            </button>
            {playerUpcomingElection && (
              <button
                className="action-button"
                onClick={() => actions.setActiveMainGameTab("Campaign")}
              >
                Manage My Campaign
              </button>
            )}
          </div>
        </div>

        {/* Placeholder for Alerts/Notifications */}
        {/* <div className="info-card alerts-card">
          <h3>Alerts</h3>
          <p>No new alerts.</p>
        </div> */}
      </div>
    </div>
  );
}

export default DashboardTab;
