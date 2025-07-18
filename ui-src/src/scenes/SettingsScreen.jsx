// ui-src/src/scenes/SettingsScreen.jsx
import React, { useState } from "react";
import useGameStore from "../store"; //
import "./SettingsScreen.css"; //

function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("Themes"); // 'Themes' or 'General'

  // Select individual pieces of state or stable objects
  const availableThemes = useGameStore((state) => state.availableThemes); //
  const activeThemeName = useGameStore((state) => state.activeThemeName); //
  const actions = useGameStore((state) => state.actions); // Assuming 'actions' object is stable

  const handleEditTheme = (themeKey) => {
    actions.editTheme(themeKey); // Use the new editTheme action
  };

  const handleCreateNewTheme = () => {
    actions.editTheme(null); // Pass null to indicate creating a new theme
  };

  const handleDeleteTheme = (themeKey) => {
    if (
      window.confirm(
        `Are you sure you want to delete the theme "${availableThemes[themeKey].name}"?`
      )
    ) {
      actions.deleteTheme(themeKey);
    }
  };

  return (
    <div className="settings-screen-container">
      <h1 className="important-heading">Settings</h1>
      {/* Back to Main Menu button - MOVED TO TOP */}
      <button
        className="back-to-main-menu-button action-button"
        onClick={() => actions.navigateTo("MainMenu")}
      >
        Back to Main Menu
      </button>

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
            <button
              className="action-button create-new-theme-button"
              onClick={handleCreateNewTheme}
            >
              Create New Theme
            </button>
            <h2>Select Theme:</h2>
            <div className="theme-buttons">
              {availableThemes &&
                Object.keys(availableThemes).map((themeKey) => (
                  <div key={themeKey} className="theme-button-group">
                    <button
                      className={`menu-button ${
                        themeKey === activeThemeName ? "active" : ""
                      }`}
                      onClick={() => actions.setActiveTheme(themeKey)}
                    >
                      {availableThemes[themeKey].name}
                    </button>
                    <button
                      className="edit-theme-button"
                      onClick={() => handleEditTheme(themeKey)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-theme-button"
                      onClick={() => handleDeleteTheme(themeKey)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SettingsScreen;
