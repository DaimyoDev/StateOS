// ui-src/src/scenes/CampaignGameScreen.jsx
import React from "react";
import useGameStore from "../store";
import "./CampaignGameScreen.css";
import Modal from "../components/modals/Modal";
import ViewPoliticianModal from "../components/modals/ViewPoliticianModal";
import PolicyVoteDetailsModal from "../components/modals/PolicyVoteDetailsModal";
import { isDateBefore } from "../utils/core";
// Import your tab content components
import DashboardTab from "../components/game_tabs/DashboardTab";
import LocalAreaTab from "../components/game_tabs/LocalAreaTab";
import ElectionsTab from "../components/game_tabs/ElectionsTab";
import CareerActionsTab from "../components/game_tabs/CareerActionsTab";
import GovernmentTab from "../components/game_tabs/GovernmentTab";
import CampaignTab from "../components/game_tabs/CampaignTab";
import NewsEventsTab from "../components/game_tabs/NewsEventsTab";
import PoliticalEntitiesTab from "../components/game_tabs/PoliticalEntitiesTab";

const TABS = [
  { id: "Dashboard", label: "Dashboard" },
  { id: "LocalArea", label: "Local Area" },
  { id: "Elections", label: "Elections" },
  { id: "Career", label: "Career & Actions" },
  { id: "Government", label: "Government" },
  { id: "Campaign", label: "Campaign" },
  { id: "NewsEvents", label: "News & Events" },
  { id: "PoliticalEntities", label: "Political Entities" },
];

function CampaignGameScreen() {
  // --- Individual Selections from Zustand Store ---
  const activeMainGameTab = useGameStore((state) => state.activeMainGameTab);
  const activeCampaign = useGameStore((state) => state.activeCampaign);

  const showElectionDayModal = useGameStore(
    (state) => state.showElectionDayModal
  );
  const electionsForModal = useGameStore((state) => state.electionsForModal); // Subscribes to changes in electionsForModal array reference
  const isAdvancingToNextElection = useGameStore(
    (state) => state.isAdvancingToNextElection
  );
  const viewingPolitician = useGameStore((state) => state.viewingPolitician); // Subscribes to changes in viewingPolitician object reference
  const isViewPoliticianModalOpen = useGameStore(
    (state) => state.isViewPoliticianModalOpen
  );

  const navigateTo = useGameStore((state) => state.actions.navigateTo);
  const advanceDay = useGameStore((state) => state.actions.advanceDay);
  const setActiveMainGameTab = useGameStore(
    (state) => state.actions.setActiveMainGameTab
  );
  const closeElectionDayModal = useGameStore(
    (state) => state.actions.closeElectionDayModal
  );
  const viewElectionResultsAndNavigate = useGameStore(
    (state) => state.actions.viewElectionResultsAndNavigate
  );
  const advanceToNextElection = useGameStore(
    (state) => state.actions.advanceToNextElection
  );
  const closeViewPoliticianModal = useGameStore(
    (state) => state.actions.closeViewPoliticianModal
  );
  const advanceToNextYear = useGameStore(
    (state) => state.actions.advanceToNextYear
  );

  const isPolicyVoteDetailsModalOpen = useGameStore(
    (state) => state.isPolicyVoteDetailsModalOpen
  );
  const policyVoteDetailsData = useGameStore(
    (state) => state.policyVoteDetailsData
  );
  const closePolicyVoteDetailsModal = useGameStore(
    (state) => state.actions.closePolicyVoteDetailsModal
  );

  const hasUpcomingElections = React.useMemo(() => {
    if (
      !activeCampaign ||
      !activeCampaign.elections ||
      !activeCampaign.currentDate
    ) {
      return false;
    }
    return activeCampaign.elections.some(
      (election) =>
        election.outcome?.status === "upcoming" &&
        isDateBefore(activeCampaign.currentDate, election.electionDate)
    );
  }, [activeCampaign]);

  // Handle early return if no activeCampaign
  React.useEffect(() => {
    if (!activeCampaign && navigateTo) {
      // Check if navigateTo is loaded
      navigateTo("MainMenu");
    }
  }, [activeCampaign, navigateTo]);

  if (!activeCampaign) {
    return <div>Loading campaign data or redirecting...</div>;
  }

  const { currentDate } = activeCampaign; // Safe to destructure now

  const handleNextDay = () => {
    if (advanceDay && !showElectionDayModal && !isAdvancingToNextElection) {
      advanceDay();
    }
  };

  const handleNextElection = () => {
    if (
      advanceToNextElection &&
      !showElectionDayModal &&
      !isAdvancingToNextElection
    ) {
      advanceToNextElection();
    }
  };

  const handleNextYear = () => {
    // <<<< NEW HANDLER
    if (
      advanceToNextYear &&
      !showElectionDayModal &&
      !isAdvancingToNextElection
    ) {
      advanceToNextYear();
    }
  };

  const renderActiveTabContent = () => {
    switch (activeMainGameTab) {
      case "Dashboard":
        return <DashboardTab campaignData={activeCampaign} />;
      case "LocalArea":
        return <LocalAreaTab campaignData={activeCampaign} />;
      case "Elections":
        return <ElectionsTab campaignData={activeCampaign} />;
      case "Career":
        return <CareerActionsTab campaignData={activeCampaign} />;
      case "Government":
        return <GovernmentTab campaignData={activeCampaign} />;
      case "Campaign":
        return <CampaignTab campaignData={activeCampaign} />;
      case "NewsEvents":
        return <NewsEventsTab campaignData={activeCampaign} />;
      case "PoliticalEntities":
        return <PoliticalEntitiesTab campaignData={activeCampaign} />;
      default:
        return <DashboardTab campaignData={activeCampaign} />;
    }
  };

  const playerFirstName = activeCampaign.politician?.firstName || "Player";

  return (
    <>
      <div className="campaign-game-screen">
        <aside className="game-sidebar">
          <div className="player-info-summary">
            <h3>{activeCampaign.startingCity?.name || "Your City"}</h3>
            <p>{playerFirstName}</p>
            <p>
              Date: {currentDate?.month}/{currentDate?.day}/{currentDate?.year}
            </p>
          </div>
          <nav className="tab-navigation">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${
                  activeMainGameTab === tab.id ? "active" : ""
                }`}
                onClick={() => setActiveMainGameTab(tab.id)} // Use the selected action
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div style={{ flexGrow: 1 }}></div>
          <div className="next-day-action">
            <button
              className="action-button next-day-button"
              onClick={handleNextDay}
              disabled={showElectionDayModal || isAdvancingToNextElection}
            >
              Next Day (Turn: {currentDate?.day || 1})
            </button>
            <button
              className="action-button next-election-button"
              onClick={handleNextElection}
              disabled={
                showElectionDayModal ||
                isAdvancingToNextElection ||
                !hasUpcomingElections
              }
              title={
                !hasUpcomingElections
                  ? "No upcoming elections found"
                  : "Advance to next scheduled election"
              }
            >
              Next Election
            </button>
            <button
              className="action-button next-year-button"
              onClick={handleNextYear}
              disabled={showElectionDayModal || isAdvancingToNextElection}
              title={`Advance to January 1, ${
                currentDate ? currentDate.year + 1 : "Next Year"
              }`}
            >
              Next Year
            </button>
          </div>
          <div className="sidebar-footer-actions">
            <button
              className="menu-button"
              onClick={() => navigateTo("MainMenu")}
            >
              {" "}
              {/* Use the selected action */}
              Main Menu
            </button>
          </div>
        </aside>

        <main className="game-content-area">{renderActiveTabContent()}</main>

        <Modal
          isOpen={showElectionDayModal}
          onClose={closeElectionDayModal}
          title={`Election Day!`}
        >
          <div className="election-day-modal-content">
            {" "}
            {/* Added a class for overall content styling */}
            <p className="modal-subtitle">
              The following elections are taking place:
            </p>
            <div className="modal-election-list-scroll-container">
              {electionsForModal && electionsForModal.length > 0 ? (
                <ul className="modal-election-list">
                  {electionsForModal.map((election) => (
                    <li key={election.id} className="modal-election-item">
                      {election.officeName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="modal-empty-list-message">
                  Processing election day events...
                </p>
              )}
            </div>{" "}
            {/* End of scrollable container */}
            <div className="modal-actions">
              <button
                onClick={viewElectionResultsAndNavigate}
                className="menu-button" // Or "action-button" based on your desired styling for primary action
              >
                View Election Results
              </button>
              <button
                onClick={closeElectionDayModal}
                className="action-button secondary"
              >
                {" "}
                {/* Added 'secondary' for styling */}
                Dismiss & Process
              </button>
            </div>
          </div>
        </Modal>

        <ViewPoliticianModal
          isOpen={isViewPoliticianModalOpen}
          onClose={closeViewPoliticianModal}
          politician={viewingPolitician}
        />
        <PolicyVoteDetailsModal
          isOpen={isPolicyVoteDetailsModalOpen}
          onClose={closePolicyVoteDetailsModal}
          proposalData={policyVoteDetailsData}
        />
      </div>
    </>
  );
}

export default CampaignGameScreen;
