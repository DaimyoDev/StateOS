// ui-src/src/scenes/SettingsScreen.jsx
import React from "react";
import useGameStore from "../store";
import "./SettingsScreen.css"; // Create this CSS file

function SettingsScreen() {
  // Select individual pieces of state or stable objects
  const availableThemes = useGameStore((state) => state.availableThemes);
  const activeThemeName = useGameStore((state) => state.activeThemeName);
  const actions = useGameStore((state) => state.actions); // Assuming 'actions' object itself is stable in the store

  return (
    <div className="settings-screen-container">
      <h1 className="important-heading">Settings</h1>

      <section className="theme-selection">
        <h2>Select Theme:</h2>
        <div className="theme-buttons">
          {/* Make sure availableThemes is not undefined before mapping */}
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
