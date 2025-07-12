import React from "react";
import useGameStore from "../store";
import "./CampaignStartOptionsScreen.css";

function CampaignStartOptionsScreen() {
  const actions = useGameStore((state) => state.actions);
  const savedPoliticians = useGameStore(
    (state) => state.savedPoliticians || []
  );

  const handleCreateNew = () => {
    // Navigate to where the player creates a new politician
    // This will eventually be your PoliticianCreator scene within the CreatorHub
    actions.navigateTo("PoliticianCreator"); // Example scene name
    // Or, if CreatorHub is the entry point: actions.navigateTo('CreatorHub');
    // and then from CreatorHub, they choose to create a politician.
  };

  const handleUseExisting = () => {
    // Navigate to a screen where they can select from previously created politicians
    actions.navigateTo("ManagePoliticiansScreen"); // Example scene name
  };

  // Determine if "Use Existing Politician" button should be enabled
  // For MVP, you might always disable it if saving/loading isn't ready:
  // const canUseExisting = false;
  const canUseExisting = savedPoliticians && savedPoliticians.length > 0;

  return (
    <div className="campaign-start-options-container">
      <div className="options-panel">
        <h1 className="options-title important-heading">
          Start Your Political Journey
        </h1>
        <p className="options-subtitle">
          How would you like to begin your campaign?
        </p>

        <div className="options-buttons">
          <button
            className="action-button options-button" // Using .button-action for primary choices
            onClick={handleCreateNew}
          >
            Create New Politician
          </button>

          <button
            className="menu-button options-button" // Using .menu-button style for secondary or if it's less primary
            onClick={handleUseExisting}
            disabled={!canUseExisting} // Disable if no existing politicians
          >
            Use Existing Politician
          </button>
          {!canUseExisting && (
            <p className="disabled-option-note">(No saved politicians yet)</p>
          )}
        </div>

        <button
          className="menu-button back-button-csos" // Specific class for styling if needed
          onClick={() => actions.navigateTo("MainMenu")}
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}

export default CampaignStartOptionsScreen;
