// ui-src/src/scenes/CampaignGameScreen.jsx
import React, { useMemo } from "react";
import useGameStore from "../store";
import "./CampaignGameScreen.css";
import Modal from "../components/modals/Modal";
import ViewPoliticianModal from "../components/modals/ViewPoliticianModal";
import ViewSeatHistoryModal from "../components/modals/ViewSeatHistoryModal";
import PolicyVoteDetailsModal from "../components/modals/PolicyVoteDetailsModal";
import VoteAlert from "../components/ui/VoteAlert";
import LiveVoteSession from "./LiveVoteSession";
import { isDateBefore } from "../utils/core";
import BillDetailsModal from "../components/modals/BillDetailsModal";
import DashboardTab from "../components/game_tabs/DashboardTab";
import LocalAreaTab from "../components/game_tabs/LocalAreaTab";
import ElectionsTab from "../components/game_tabs/ElectionsTab";
import CareerActionsTab from "../components/game_tabs/CareerActionsTab";
import GovernmentTab from "../components/game_tabs/GovernmentTab";
import CampaignTab from "../components/game_tabs/CampaignTab";
import PoliticalEntitiesTab from "../components/game_tabs/PoliticalEntitiesTab";
import PoliticiansTab from "../components/game_tabs/PoliticiansTab";
import ArticleViewerModal from "../components/modals/ArticleViewerModal";
import DonationModal from "../components/modals/DonationModal";
import CommitteeMeetingModal from "../components/modals/CommitteeMeetingModal";
import PollingTab from "../components/game_tabs/PollingTab";
import NotificationIcon from "../components/notifications/NotificationIcon";
import NotificationPanel from "../components/notifications/NotificationPanel";
import { useState, useEffect } from "react";

const TABS = [
  { id: "Dashboard", label: "Dashboard" },
  { id: "LocalArea", label: "Local Area" },
  { id: "Elections", label: "Elections" },
  { id: "Career", label: "Career & Actions" },
  { id: "Government", label: "Government" },
  { id: "Campaign", label: "Campaign" },
  { id: "PoliticalEntities", label: "Political Entities" },
  { id: "Politicians", label: "Politicians" },
  { id: "Polling", label: "Polling" },
];

function CampaignGameScreen() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.tab-dropdown-container')) {
        setIsTabDropdownOpen(false);
      }
    };

    if (isTabDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isTabDropdownOpen]);
  // --- Individual Selections from Zustand Store ---
  const activeMainGameTab = useGameStore((state) => state.activeMainGameTab);
  const activeCampaign = useGameStore((state) => state.activeCampaign);

  const playerPoliticianId = useGameStore(
    (state) => state.activeCampaign?.playerPoliticianId
  );
  const politiciansSoA = useGameStore(
    (state) => state.activeCampaign?.politicians
  );

  const playerData = useMemo(() => {
    if (!playerPoliticianId || !politiciansSoA) return null;
    return {
      base: politiciansSoA.base.get(playerPoliticianId),
      campaign: politiciansSoA.campaign.get(playerPoliticianId),
    };
  }, [playerPoliticianId, politiciansSoA]);

  const isBillDetailsModalOpen = useGameStore(
    (state) => state.isBillDetailsModalOpen
  );
  const viewingBillDetails = useGameStore((state) => state.viewingBillDetails);
  const closeBillDetailsModal = useGameStore(
    (state) => state.actions.closeBillDetailsModal
  );

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

  const isSeatHistoryModalOpen = useGameStore(
    (state) => state.isSeatHistoryModalOpen
  );
  const viewingSeatHistory = useGameStore(
    (state) => state.viewingSeatHistory
  );
  const closeSeatHistoryModal = useGameStore(
    (state) => state.actions.closeSeatHistoryModal
  );

  const isVotingSessionActive = useGameStore(
    (state) => state.isVotingSessionActive
  );

  const isPolicyVoteDetailsModalOpen = useGameStore(
    (state) => state.isPolicyVoteDetailsModalOpen
  );
  const viewingVoteDetailsForBill = useGameStore(
    (state) => state.viewingVoteDetailsForBill
  );
  const closePolicyVoteDetailsModal = useGameStore(
    (state) => state.actions.closePolicyVoteDetailsModal
  );
  const isArticleModalOpen = useGameStore((state) => state.isArticleModalOpen);
  
  const isCommitteeMeetingModalOpen = useGameStore((state) => state.isCommitteeMeetingModalOpen);
  const currentCommitteeMeeting = useGameStore((state) => state.currentCommitteeMeeting);
  const checkScheduledMeetings = useGameStore((state) => state.actions.checkScheduledMeetings);

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
  
  // Check for scheduled meetings when date changes
  useEffect(() => {
    if (activeCampaign?.currentDate && checkScheduledMeetings) {
      checkScheduledMeetings();
    }
  }, [activeCampaign?.currentDate, checkScheduledMeetings]);

  if (!activeCampaign) {
    return <div>Loading campaign data or redirecting...</div>;
  }

  const { currentDate } = activeCampaign;

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
      case "Politicians":
        return <PoliticiansTab />;
      case "Campaign":
        return <CampaignTab campaignData={activeCampaign} />;
      case "PoliticalEntities":
        return <PoliticalEntitiesTab campaignData={activeCampaign} />;
      case "Polling":
        return <PollingTab campaignData={activeCampaign} />;
      default:
        return <DashboardTab campaignData={activeCampaign} />;
    }
  };

  const playerFirstName = playerData?.base?.firstName || "Player";

  return (
    <>
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      <div className="campaign-game-screen">
        {/* Top bar with tab dropdown and player info */}
        <div className="game-top-bar">
          <div className="top-bar-left">
            {/* Tab dropdown */}
            <div className="tab-dropdown-container">
              <button 
                className="tab-dropdown-button"
                onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
              >
                {TABS.find(tab => tab.id === activeMainGameTab)?.label || "Dashboard"}
                <span className="dropdown-arrow">▼</span>
              </button>
              {isTabDropdownOpen && (
                <div className="tab-dropdown-menu">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-dropdown-item ${
                        activeMainGameTab === tab.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveMainGameTab(tab.id);
                        setIsTabDropdownOpen(false);
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="top-bar-center">
            <div className="player-info-horizontal">
              <span className="info-item">
                <strong>{activeCampaign.startingCity?.name || "Your City"}</strong>
              </span>
              <span className="info-separator">|</span>
              <span className="info-item">{playerFirstName}</span>
              <span className="info-separator">|</span>
              <span className="info-item">
                {currentDate?.month}/{currentDate?.day}/{currentDate?.year}
              </span>
              <span className="info-separator">|</span>
              <span className="info-item">
                Hours: {playerData?.campaign?.workingHours ?? "..."}/{playerData?.campaign?.maxWorkingHours ?? "..."}
              </span>
            </div>
          </div>
          
          <div className="top-bar-right">
            <NotificationIcon onClick={() => setIsNotificationPanelOpen(true)} />
          </div>
        </div>

        {/* Main content area - now full screen */}
        <main className="game-content-area">{renderActiveTabContent()}</main>
        
        {/* Bottom bar with advance time buttons and main menu */}
        <div className="game-bottom-bar">
          <div className="bottom-bar-left">
            <button
              className="menu-button"
              onClick={() => navigateTo("MainMenu")}
            >
              Main Menu
            </button>
          </div>
          
          <div className="bottom-bar-right">
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
        </div>

        {/* Modals and Alerts */}
        <Modal
          isOpen={showElectionDayModal}
          onClose={closeElectionDayModal}
          title={`Election Day!`}
        >
          <div className="election-day-modal-content">
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
            </div>
            <div className="modal-actions">
              <button
                onClick={viewElectionResultsAndNavigate}
                className="menu-button"
              >
                View Election Results
              </button>
              <button
                onClick={closeElectionDayModal}
                className="action-button secondary"
              >
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
        
        <ViewSeatHistoryModal
          isOpen={isSeatHistoryModalOpen}
          onClose={closeSeatHistoryModal}
          office={viewingSeatHistory}
          campaignData={activeCampaign}
        />
        <VoteAlert />
        {isVotingSessionActive && <LiveVoteSession />}
        <BillDetailsModal
          isOpen={isBillDetailsModalOpen}
          onClose={closeBillDetailsModal}
          bill={viewingBillDetails}
        />
        <PolicyVoteDetailsModal
          isOpen={isPolicyVoteDetailsModalOpen}
          onClose={closePolicyVoteDetailsModal}
          proposalData={viewingVoteDetailsForBill}
        />
        {isArticleModalOpen && <ArticleViewerModal />}
        <DonationModal />
        <CommitteeMeetingModal 
          isOpen={isCommitteeMeetingModalOpen}
          meeting={currentCommitteeMeeting}
        />
      </div>
    </>
  );
}

export default CampaignGameScreen;
