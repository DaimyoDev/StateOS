// ui-src/src/scenes/SettingsScreen.jsx
import React, { useState } from "react";
import useGameStore from "../store";
import "./SettingsScreen.css";

function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("Themes"); // 'Themes' or 'General'

  // Select individual pieces of state or stable objects
  const availableThemes = useGameStore((state) => state.availableThemes);
  const activeThemeName = useGameStore((state) => state.activeThemeName);
  const actions = useGameStore((state) => state.actions); // Assuming 'actions' object is stable

  return (
    <div className="settings-screen-container">
      <h1 className="important-heading">Settings</h1>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === "General" ? "active" : ""}`}
          onClick={() => setActiveTab("General")}
        >
          General
        </button>
        <button
          className={`tab-button ${activeTab === "Themes" ? "active" : ""}`}
          onClick={() => setActiveTab("Themes")}
        >
          Themes
        </button>
      </div>

      {/* Tab Content */}
      <div className="settings-tab-content">
        {activeTab === "General" && (
          <section className="general-settings">
            <h2>General Settings</h2>
            <p>More settings will be available here soon!</p>
          </section>
        )}

        {activeTab === "Themes" && (
          <section className="theme-selection">
            <h2>Select Theme:</h2>
            <div className="theme-buttons">
              {availableThemes &&
                Object.keys(availableThemes).map((themeKey) => (
                  <button
                    key={themeKey}
                    className={`menu-button ${
                      themeKey === activeThemeName ? "active" : ""
                    }`}
                    onClick={() => actions.setActiveTheme(themeKey)}
                  >
                    {availableThemes[themeKey].name}
                  </button>
                ))}
            </div>
          </section>
        )}
      </div>

      <button
        className="action-button"
        onClick={() => actions.navigateTo("MainMenu")}
      >
        Back to Main Menu
      </button>
    </div>
  );
}

export default SettingsScreen;
