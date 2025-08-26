// ui-src/src/scenes/MainMenu.jsx
import React, { useEffect, useState } from "react";
import useGameStore from "../store"; // Adjust path if needed
import "./MainMenu.css";
import Modal from "../components/modals/Modal";

function MainMenu() {
  const actions = useGameStore((state) => state.actions);
  const hasAcknowledgedDisclaimer = useGameStore(
    (state) => state.hasAcknowledgedDisclaimer
  );

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // When the component mounts, check if the disclaimer has ever been acknowledged
    if (!hasAcknowledgedDisclaimer) {
      setShowDisclaimer(true);
    }
  }, [hasAcknowledgedDisclaimer]);

  const handleAcknowledge = () => {
    actions.acknowledgeDisclaimer(); // This saves the preference permanently
    setShowDisclaimer(false); // This closes the modal for this session
  };

  return (
    <>
      {/* Disclaimer Modal */}
      <Modal isOpen={showDisclaimer} onClose={() => {}} title="Disclaimer">
        <div
          style={{
            padding: "20px",
            textAlign: "left",
            color: "var(--primary-text)",
          }}
        >
          <p>
            <strong>Welcome to StateOS!</strong>
          </p>
          <p>
            This game is currently in an alpha, work-in-progress state. Features
            may be incomplete, and you may encounter bugs.
          </p>
          <p>
            All characters, events, and political entities depicted in this game
            are entirely fictional. Any resemblance to real persons, living or
            dead, or actual events is purely coincidental.
          </p>
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button className="menu-button" onClick={handleAcknowledge}>
              I Understand and Acknowledge
            </button>
          </div>
        </div>
      </Modal>

      {/* Main Menu Content */}
      <div className="main-menu-container">
        <div className="title-container">
          <h1 className="game-title, important-heading">StateOS</h1>
        </div>
        <nav className="menu-navigation">
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("CampaignStartOptionsScreen")}
          >
            New Campaign
          </button>
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("CreatorHub")}
          >
            Create (Politicians/Parties)
          </button>
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("ElectionSimulatorScreen")}
          >
            Election Simulator
          </button>
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("LoadGameScreen")}
          >
            Load Game
          </button>
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("SettingsScreen")}
          >
            Settings
          </button>
          <button
            className="menu-button"
            onClick={() => actions.navigateTo("WikiScene")}
          >
            Wiki
          </button>
          <button
            className="action-button"
            onClick={() => {
              if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.send("quit-app");
              }
            }}
          >
            Exit Game
          </button>
        </nav>
        <footer className="menu-footer">
          <p>Version 0.0.3 Alpha</p>
        </footer>
      </div>
    </>
  );
}

export default MainMenu;
