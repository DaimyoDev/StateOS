import React, { useState, useEffect } from "react";
import useGameStore from "../store";
import "./ThemeCreatorEditor.css"; // We'll create this CSS file next
import Modal from "../components/modals/Modal"; // Assuming you have a Modal component

function ThemeCreatorEditor() {
  const actions = useGameStore((state) => state.actions);

  // State to hold the currently edited theme's data
  const [currentTheme, setCurrentTheme] = useState(null);
  const [isNewTheme, setIsNewTheme] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  useEffect(() => {
    // Initialize with a default theme or a new empty theme when the component mounts
    if (!currentTheme) {
      // You could load a specific theme to edit by default, or start fresh
      // For now, let's start with a fresh, empty theme for creation
      setCurrentTheme({
        name: "New Custom Theme",
        colors: {
          "--primary-bg": "#FFFFFF",
          "--secondary-bg": "#F0F0F0",
          "--accent-color": "#007BFF",
          // ... add all other default colors from themes.js
        },
        fonts: {
          "--font-main": "'Inter', sans-serif",
          "--font-heading": "'Montserrat', sans-serif",
          // ... add other default fonts
        },
        styles: {
          "--panel-shadow": "0 2px 8px rgba(0,0,0,0.1)",
          "--element-radius": "5px",
          // ... add all other default styles
        },
      });
      setIsNewTheme(true);
    }
  }, [currentTheme]);

  const handleColorChange = (cssVar, value) => {
    setCurrentTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [cssVar]: value,
      },
    }));
  };

  const handleFontChange = (cssVar, value) => {
    setCurrentTheme((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [cssVar]: value,
      },
    }));
  };

  const handleStyleChange = (cssVar, value) => {
    setCurrentTheme((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [cssVar]: value,
      },
    }));
  };

  const handleThemeNameChange = (e) => {
    setCurrentTheme((prev) => ({
      ...prev,
      name: e.target.value,
    }));
    setNewThemeName(e.target.value);
  };

  const handleSaveTheme = () => {
    if (!currentTheme || !currentTheme.name) {
      alert("Theme name cannot be empty!");
      return;
    }
    // In a real application, you'd send this to a backend or save to local storage
    // For now, we'll simulate saving by adding it to the available themes (temporarily)
    // and setting it as the active theme.
    actions.addOrUpdateTheme(currentTheme.name, currentTheme); // This action needs to be defined in your store
    actions.setActiveTheme(currentTheme.name);
    setShowSaveModal(false);
    actions.showToast({
      message: `${currentTheme.name} saved!`,
      type: "success",
    });
  };

  if (!currentTheme) {
    return <div>Loading theme editor...</div>;
  }

  return (
    <div className="theme-editor-container">
      <h1 className="important-heading">Theme Editor</h1>

      <div className="editor-controls">
        <label>
          Theme Name:
          <input
            type="text"
            value={currentTheme.name}
            onChange={handleThemeNameChange}
            placeholder="Enter theme name"
          />
        </label>

        <h2>Colors</h2>
        <div className="color-inputs">
          {Object.entries(currentTheme.colors).map(([cssVar, value]) => (
            <div key={cssVar} className="color-input-group">
              <label>{cssVar}:</label>
              <input
                type="color"
                value={value.length === 7 ? value : "#000000"} // Ensure valid hex for color input
                onChange={(e) => handleColorChange(cssVar, e.target.value)}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleColorChange(cssVar, e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          ))}
        </div>

        {/* You'll need to expand this for fonts and styles */}
        <h2>Fonts</h2>
        <div className="font-inputs">
          <label>
            Main Font:
            <input
              type="text"
              value={currentTheme.fonts["--font-main"]}
              onChange={(e) => handleFontChange("--font-main", e.target.value)}
              placeholder="'Inter', sans-serif"
            />
          </label>
          {/* Add more font inputs */}
        </div>

        <h2>Styles</h2>
        <div className="style-inputs">
          <label>
            Panel Shadow:
            <input
              type="text"
              value={currentTheme.styles["--panel-shadow"]}
              onChange={(e) =>
                handleStyleChange("--panel-shadow", e.target.value)
              }
              placeholder="0 2px 8px rgba(0,0,0,0.1)"
            />
          </label>
          {/* Add more style inputs */}
        </div>

        <div className="editor-actions">
          <button
            className="action-button"
            onClick={() => setShowSaveModal(true)}
          >
            Save Theme
          </button>
          <button
            className="action-button"
            onClick={() => actions.navigateTo("SettingsScreen")}
          >
            Back to Settings
          </button>
        </div>
      </div>

      {showSaveModal && (
        <Modal
          title="Save Theme"
          onClose={() => setShowSaveModal(false)}
          onConfirm={handleSaveTheme}
          confirmText="Save"
          cancelText="Cancel"
        >
          <p>Are you sure you want to save this theme?</p>
          {isNewTheme && (
            <p>
              It will be added as a new theme:{" "}
              <strong>{newThemeName || "Unnamed Theme"}</strong>.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

export default ThemeCreatorEditor;
