import React, { useState, useCallback } from "react";
import useGameStore from "../store";
import { generateCreatorHubParty } from "../entities/partyGeneration";
import PartyLogo from "../components/logos/PartyLogo";
import "./CreatorHub.css";

function CreatorHub() {
  const actions = useGameStore((state) => state.actions);
  const [generatedParty, setGeneratedParty] = useState(null);

  const handleGenerateParty = useCallback(() => {
    // --- FIX START ---
    // The generator returns a single party OBJECT, not an array.
    const newParty = generateCreatorHubParty();

    // We just need to check if the object exists before setting it.
    if (newParty) {
      setGeneratedParty(newParty);
    }
    // --- FIX END ---
  }, []);

  return (
    <div className="creator-hub-container">
      <div className="creator-hub-header">
        <h1 className="important-heading">Creator Hub</h1>
        <p>Test procedural generation for parties and logos.</p>
      </div>

      <div className="generation-controls">
        <button className="action-button" onClick={handleGenerateParty}>
          Generate Random Party
        </button>
      </div>

      {generatedParty && (
        <div className="generated-party-display">
          <h2 className="party-name-display">{generatedParty.name}</h2>
          <div className="logo-display-area">
            <PartyLogo
              logoDataUrl={generatedParty.logoDataUrl}
              partyName={generatedParty.name}
              size="512px"
            />
          </div>
          <div className="party-details">
            <p>
              <strong>Ideology:</strong> {generatedParty.ideology}
            </p>
            <p>
              <strong>Primary Color:</strong>
              <span
                className="color-swatch"
                style={{ backgroundColor: generatedParty.color || "#ccc" }}
              ></span>
              {generatedParty.color}
            </p>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          className="menu-button"
          onClick={() => actions.navigateTo("MainMenu")}
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}

export default CreatorHub;
