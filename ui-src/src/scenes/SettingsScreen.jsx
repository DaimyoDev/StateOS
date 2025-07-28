// ui-src/src/scenes/SettingsScreen.jsx
import React, { useState, useMemo } from "react";
import useGameStore from "../store";
import { DEFAULT_THEME_KEYS } from "../utils/themeDefaults";
import "./SettingsScreen.css";

function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("Themes");
  const [themeFilter, setThemeFilter] = useState("All"); // 'All', 'Default', 'Custom'
  const [searchQuery, setSearchQuery] = useState(""); // State for the search input

  const availableThemes = useGameStore((state) => state.availableThemes);
  const activeThemeName = useGameStore((state) => state.activeThemeName);
  const actions = useGameStore((state) => state.actions);

  const filteredThemeKeys = useMemo(() => {
    // 1. Apply the category filter ('All', 'Default', 'Custom')
    let filteredKeys = Object.keys(availableThemes);
    if (themeFilter === "Default") {
      filteredKeys = filteredKeys.filter((key) => DEFAULT_THEME_KEYS.has(key));
    } else if (themeFilter === "Custom") {
      filteredKeys = filteredKeys.filter((key) => !DEFAULT_THEME_KEYS.has(key));
    }

    // 2. Apply the search query filter
    if (searchQuery.trim() !== "") {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredKeys = filteredKeys.filter((key) =>
        availableThemes[key].name.toLowerCase().includes(lowercasedQuery)
      );
    }

    // 3. Sort the final results alphabetically by theme name
    return filteredKeys.sort((a, b) =>
      availableThemes[a].name.localeCompare(availableThemes[b].name)
    );
  }, [themeFilter, searchQuery, availableThemes]);

  const handleEditTheme = (themeKey) => {
    actions.editTheme(themeKey);
  };

  const handleCreateNewTheme = () => {
    actions.editTheme(null);
  };

  const handleDeleteTheme = (themeKey) => {
    if (
      window.confirm(
        `Are you sure you want to delete the theme "${availableThemes[themeKey].name}"? This action cannot be undone.`
      )
    ) {
      actions.deleteTheme(themeKey);
    }
  };

  return (
    <div className="settings-screen-container">
      <h1 className="important-heading">Settings</h1>
      <button
        className="back-to-main-menu-button action-button"
        onClick={() => actions.navigateTo("MainMenu")}
      >
        Back to Main Menu
      </button>

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

      <div className="settings-tab-content">
        {activeTab === "General" && (
          <section className="general-settings">
            <h2>General Settings</h2>
            <p>More settings will be available here soon!</p>
          </section>
        )}

        {activeTab === "Themes" && (
          <section className="theme-selection">
            <div className="theme-actions-header">
              <h2>Select Theme:</h2>
              <button
                className="action-button create-new-theme-button"
                onClick={handleCreateNewTheme}
              >
                Create New Theme
              </button>
            </div>

            <div className="theme-filters-container">
              {/* THEME FILTER BUTTONS */}
              <div className="theme-filter-buttons">
                <button
                  className={`filter-button ${
                    themeFilter === "All" ? "active" : ""
                  }`}
                  onClick={() => setThemeFilter("All")}
                >
                  All
                </button>
                <button
                  className={`filter-button ${
                    themeFilter === "Default" ? "active" : ""
                  }`}
                  onClick={() => setThemeFilter("Default")}
                >
                  Default
                </button>
                <button
                  className={`filter-button ${
                    themeFilter === "Custom" ? "active" : ""
                  }`}
                  onClick={() => setThemeFilter("Custom")}
                >
                  Custom
                </button>
              </div>
              {/* THEME SEARCH INPUT */}
              <div className="theme-search-container">
                <input
                  type="text"
                  placeholder="Search themes..."
                  className="theme-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="theme-buttons">
              {filteredThemeKeys.length > 0 ? (
                filteredThemeKeys.map((themeKey) => (
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
                    {/* Prevent deleting default themes */}
                    {!DEFAULT_THEME_KEYS.has(themeKey) && (
                      <button
                        className="delete-theme-button"
                        onClick={() => handleDeleteTheme(themeKey)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No themes found matching your criteria.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SettingsScreen;
