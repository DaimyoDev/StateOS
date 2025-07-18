// ui-src/src/scenes/ThemeCreatorEditor.jsx
import React, { useState, useEffect } from "react";
import useGameStore from "../store";
import "./ThemeCreatorEditor.css";
import Modal from "../components/modals/Modal";

// Define available font options for dropdowns
const FONT_OPTIONS = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Merriweather", value: "Merriweather, sans-serif" },
  { name: "Roboto Mono", value: "'Roboto Mono', monospace" },
];

function ThemeCreatorEditor() {
  const actions = useGameStore((state) => state.actions);
  const themeToEdit = useGameStore((state) => state.themeToEdit);
  const availableThemes = useGameStore((state) => state.availableThemes);

  const [currentTheme, setCurrentTheme] = useState(null);
  const [isNewTheme, setIsNewTheme] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [themeKeyInput, setThemeKeyInput] = useState("");

  useEffect(() => {
    if (themeToEdit) {
      setCurrentTheme(JSON.parse(JSON.stringify(themeToEdit))); // Deep copy
      setIsNewTheme(false);
      const key = Object.keys(availableThemes).find(
        (k) => availableThemes[k] === themeToEdit
      );
      setThemeKeyInput(key || "");
    } else {
      // Creating a new theme with default values
      setCurrentTheme({
        name: "New Custom Theme",
        colors: {
          "--primary-bg": "#F0F0F0",
          "--secondary-bg": "#E0E0E0",
          "--ui-panel-bg": "#FFFFFF",
          "--button-bg": "#007BFF",
          "--button-hover-bg": "#0056B3",
          "--button-active-bg": "#004080",
          "--button-text": "#FFFFFF",
          "--primary-text": "#333333",
          "--secondary-text": "#666666",
          "--accent-color": "#FFC107",
          "--accent-text": "#FFFFFF",
          "--rgb-accent-color": "255, 193, 7",
          "--highlight-bg": "rgba(255, 193, 7, 0.15)",
          "--border-color": "#CCCCCC",
          "--accent-border-color": "#FFC107",
          "--error-text": "#DC3545",
          "--success-text": "#28A745",
          "--disabled-bg": "#E9ECEF",
          "--disabled-text": "#6C757D",
          "--button-action-bg": "#28A745",
          "--button-action-hover-bg": "#218838",
          "--button-action-text": "#FFFFFF",
          "--button-delete-bg": "#DC3545",
          "--button-delete-hover-bg": "#C82333",
          "--button-delete-text": "#FFFFFF",
          "--input-bg": "#FFFFFF",
          "--input-text": "#333333",
          "--input-placeholder-text": "#A0A0A0",
          "--progress-track-bg": "#E9ECEF",
          "--map-background-color": "#F8F8F8",
          "--map-region-default-fill": "#B0C4DE",
          "--map-region-border": "#FFFFFF",
          "--map-region-hover-fill": "rgba(255, 193, 7, 0.4)",
        },
        fonts: {
          "--font-main": FONT_OPTIONS[0].value,
          "--font-heading": FONT_OPTIONS[1].value,
        },
        styles: {
          "--panel-shadow": "0 2px 8px rgba(0,0,0,0.1)",
          "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
          "--element-radius": "5px",
          "--border-width": "1px",
          "--focus-ring-color": "#007BFF",
          "--progress-value-color": "#007BFF",
          "--checkbox-accent-color": "#007BFF",
          "--input-focus-shadow-color": "rgba(0, 123, 255, 0.25)",
          "--transition-speed": "0.15s ease-in-out",
        },
      });
      setIsNewTheme(true);
      setThemeKeyInput("");
    }
  }, [themeToEdit, availableThemes]);

  useEffect(() => {
    if (currentTheme) {
      for (const scope of ["colors", "fonts", "styles"]) {
        for (const [key, value] of Object.entries(currentTheme[scope])) {
          document.documentElement.style.setProperty(key, value);
        }
      }
    }
    return () => {
      actions.setActiveTheme(useGameStore.getState().activeThemeName);
    };
  }, [currentTheme, actions]);

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
    const newName = e.target.value;
    setCurrentTheme((prev) => ({
      ...prev,
      name: newName,
    }));
    if (isNewTheme) {
      setThemeKeyInput(newName.toLowerCase().replace(/\s/g, "_"));
    }
  };

  const handleSaveTheme = () => {
    if (!currentTheme || !currentTheme.name) {
      actions.addToast({
        message: "Theme name cannot be empty!",
        type: "error",
      });
      return;
    }

    let finalThemeKey = themeKeyInput;
    if (isNewTheme) {
      if (!finalThemeKey) {
        finalThemeKey = currentTheme.name.toLowerCase().replace(/\s/g, "_");
      }
      if (availableThemes[finalThemeKey]) {
        actions.addToast({
          message: `Theme key "${finalThemeKey}" already exists. Please choose a different name.`,
          type: "error",
        });
        return;
      }
    } else {
      finalThemeKey = Object.keys(availableThemes).find(
        (k) => availableThemes[k] === themeToEdit
      );
    }

    actions.addOrUpdateTheme(finalThemeKey, currentTheme);
    actions.clearThemeToEdit();
    setShowSaveModal(false); // Close the modal
    actions.addToast({
      message: `${currentTheme.name} saved!`,
      type: "success",
    });
    actions.navigateTo("SettingsScreen");
  };

  if (!currentTheme) {
    return <div>Loading theme editor...</div>;
  }

  const renderPropertyInputs = (category, handler) => {
    return Object.entries(currentTheme[category]).map(([cssVar, value]) => {
      const isFontInput =
        cssVar === "--font-main" || cssVar === "--font-heading";
      const inputElement = isFontInput ? (
        <select
          value={value}
          onChange={(e) => handler(cssVar, e.target.value)}
          className="select-input"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      ) : category === "colors" ? (
        <>
          <input
            type="color"
            value={value.length === 7 ? value : "#000000"}
            onChange={(e) => handler(cssVar, e.target.value)}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handler(cssVar, e.target.value)}
            placeholder="#RRGGBB"
            className="text-input"
          />
        </>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handler(cssVar, e.target.value)}
          className="text-input"
        />
      );

      return (
        <div key={cssVar} className="input-group">
          <label>{cssVar.replace(/--/g, "").replace(/-/g, " ")}:</label>
          {inputElement}
        </div>
      );
    });
  };

  return (
    <div className="theme-editor-container">
      <h1 className="important-heading">Theme Editor</h1>

      <div className="editor-and-preview-wrapper">
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
          {isNewTheme && (
            <label>
              Theme Key (auto-generated, can be overridden):
              <input
                type="text"
                value={themeKeyInput}
                onChange={(e) => setThemeKeyInput(e.target.value)}
                placeholder="unique_theme_key"
                className="text-input"
              />
            </label>
          )}

          <h2>Colors</h2>
          <div className="property-inputs color-inputs">
            {renderPropertyInputs("colors", handleColorChange)}
          </div>

          <h2>Fonts</h2>
          <div className="property-inputs font-inputs">
            {renderPropertyInputs("fonts", handleFontChange)}
          </div>

          <h2>Styles</h2>
          <div className="property-inputs style-inputs">
            {renderPropertyInputs("styles", handleStyleChange)}
          </div>
        </div>

        {/* Theme Preview Pane */}
        <div className="theme-preview-pane">
          <h3>Theme Preview</h3>
          <div className="preview-panel">
            <p className="preview-primary-text">Primary Text Example</p>
            <p className="preview-secondary-text">
              Secondary text for descriptions.
            </p>
            <p style={{ color: "var(--accent-color)" }}>Accent Color Example</p>

            <div className="preview-button-group">
              <button className="preview-button">Default Button</button>
              <button className="preview-button preview-action-button">
                Action Button
              </button>
              <button className="preview-button preview-delete-button">
                Delete Button
              </button>
            </div>

            <div className="preview-input-group">
              <input
                type="text"
                placeholder="Input Field Example"
                className="preview-input"
              />
              <input
                type="text"
                placeholder="Focus State"
                className="preview-input preview-input-focused"
              />
            </div>

            <div className="preview-border-example">Border Example</div>
            <div className="preview-highlight-example">
              Highlight Background Example
            </div>
          </div>
          <p className="preview-small-text">
            Font Main:{" "}
            <span style={{ fontFamily: "var(--font-main)" }}>AaBbCc</span>
          </p>
          <h4 className="preview-heading">
            Font Heading:{" "}
            <span style={{ fontFamily: "var(--font-heading)" }}>AaBbCc</span>
          </h4>
        </div>
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
          onClick={() => {
            actions.clearThemeToEdit();
            actions.navigateTo("SettingsScreen");
          }}
        >
          Back to Settings
        </button>
      </div>

      {showSaveModal && (
        <Modal
          isOpen={showSaveModal}
          title="Save Theme"
          onPrimaryAction={handleSaveTheme} // Renamed from onConfirm
          primaryActionText="Save" // Renamed from confirmText
          onSecondaryAction={() => setShowSaveModal(false)} // Added secondary action
          secondaryActionText="Cancel" // Added secondary action text
        >
          <p>Are you sure you want to save this theme?</p>
          {isNewTheme && (
            <p>
              It will be added as a new theme with key:{" "}
              <strong>{themeKeyInput || "auto-generated"}</strong>.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

export default ThemeCreatorEditor;
