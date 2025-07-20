// ui-src/src/scenes/MainMenu.jsx
import React from "react";
import useGameStore from "../store"; // Adjust path if needed
import "./MainMenu.css";

function MainMenu() {
  const actions = useGameStore((state) => state.actions);

  return (
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
        {/* Corrected call to navigateTo via the actions object */}
        <button
          className="menu-button"
          onClick={() => actions.navigateTo("SettingsScreen")}
        >
          Settings
        </button>
        <button
          className="action-button"
          onClick={() => {
            console.log("Attempting to Exit (IPC needed for actual exit)");
            if (window.electron && window.electron.ipcRenderer) {
              // Check if preload exposed it
              window.electron.ipcRenderer.send("quit-app");
            }
          }}
        >
          Exit Game
        </button>
      </nav>
      <footer className="menu-footer">
        <p>Version 0.0.2 Alpha</p>
      </footer>
    </div>
  );
}

export default MainMenu;
