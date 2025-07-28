import React from "react";
import useGameStore from "../store";
import { generateCreatorHubParty } from "../entities/partyGeneration";
import PartyLogo from "../components/logos/PartyLogo";
import Modal from "../components/modals/Modal";
import "./CreatorHub.css";

function CreatorHub() {
  const actions = useGameStore((state) => state.actions);
  const allCustomParties = useGameStore(
    (state) => state.allCustomParties || []
  );

  const [generatedParty, setGeneratedParty] = React.useState(null);
  const [partyToDelete, setPartyToDelete] = React.useState(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    React.useState(false);

  const handleGenerateParty = React.useCallback(() => {
    const newParty = generateCreatorHubParty();
    if (newParty) {
      setGeneratedParty(newParty);
    }
  }, []);

  const handleSaveGeneratedParty = React.useCallback(() => {
    if (generatedParty) {
      // When saving a generated party, we now use the addCustomParty action directly
      actions.addCustomParty(generatedParty);
      setGeneratedParty(null); // Clear the display after saving
    }
  }, [generatedParty, actions]);

  const openDeleteConfirmModal = (party) => {
    setPartyToDelete(party);
    setIsDeleteConfirmModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setPartyToDelete(null);
    setIsDeleteConfirmModalOpen(false);
  };

  const confirmDeleteParty = () => {
    if (partyToDelete) {
      actions.deleteCustomParty(partyToDelete.id);
    }
    closeDeleteConfirmModal();
  };

  return (
    <div className="creator-hub-container">
      <div className="creator-hub-header">
        <h1 className="important-heading">Creator Hub</h1>
        <p>Create, manage, and generate political entities for your world.</p>
      </div>

      <div className="creator-hub-main-grid">
        {/* Column 1: Custom Parties */}
        <div className="hub-column">
          <h2 className="hub-column-title">Custom Parties</h2>
          <div className="hub-column-actions">
            {/* This button now calls the action to navigate to the new screen */}
            <button
              className="action-button"
              onClick={actions.startCreatingNewParty}
            >
              Create New Party
            </button>
          </div>
          <div className="custom-parties-list">
            {allCustomParties.length > 0 ? (
              allCustomParties.map((party) => (
                <div key={party.id} className="custom-party-item">
                  <div className="party-logo-preview">
                    {party.logoDataUrl ? (
                      <img src={party.logoDataUrl} alt={`${party.name} logo`} />
                    ) : (
                      <div className="logo-placeholder"></div>
                    )}
                  </div>
                  <span
                    className="party-color-swatch"
                    style={{ backgroundColor: party.color }}
                  ></span>
                  <span className="party-item-name">{party.name}</span>
                  <span className="party-item-ideology">
                    ({party.ideology})
                  </span>
                  <div className="party-item-actions">
                    {/* This button now calls the action to load the party for editing on the new screen */}
                    <button
                      className="menu-button small-button"
                      onClick={() => actions.loadPartyForEditing(party.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="button-delete small-button"
                      onClick={() => openDeleteConfirmModal(party)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No custom parties created yet.</p>
            )}
          </div>
        </div>

        {/* Column 2: Custom Politicians */}
        <div className="hub-column">
          <h2 className="hub-column-title">Custom Politicians</h2>
          <div className="hub-column-actions">
            <button
              className="action-button"
              onClick={() => {
                actions.resetCreatingPolitician();
                actions.navigateTo("PoliticianCreator");
              }}
            >
              Create New Politician
            </button>
            <button
              className="menu-button"
              onClick={() => actions.navigateTo("ManagePoliticiansScreen")}
            >
              Manage Politicians
            </button>
          </div>
          <p className="column-description">
            Create and manage your roster of politicians. You can use them in
            campaigns or as NPCs in your simulations.
          </p>
        </div>

        {/* Column 3: Random Generation */}
        <div className="hub-column">
          <h2 className="hub-column-title">Procedural Generation</h2>
          <div className="hub-column-actions">
            <button className="action-button" onClick={handleGenerateParty}>
              Generate Random Party
            </button>
          </div>
          <p className="column-description">
            Quickly generate a party with a random name, color, ideology, and
            logo for inspiration or use in your simulations.
          </p>
          {generatedParty && (
            <div className="generated-party-display">
              <h3 className="party-name-display">{generatedParty.name}</h3>
              <div className="logo-display-area">
                <PartyLogo
                  logoDataUrl={generatedParty.logoDataUrl}
                  partyName={generatedParty.name}
                  size="128px"
                />
              </div>
              <div className="party-details">
                <p>
                  <strong>Ideology:</strong> {generatedParty.ideology}
                </p>
                <p>
                  <strong>Color:</strong>
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: generatedParty.color || "#ccc" }}
                  ></span>
                  {generatedParty.color}
                </p>
              </div>
              <button
                className="action-button small-button"
                onClick={handleSaveGeneratedParty}
              >
                Save Generated Party
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          className="menu-button"
          onClick={() => actions.navigateTo("MainMenu")}
        >
          Back to Main Menu
        </button>
      </div>

      {/* Delete Confirmation Modal (remains the same) */}
      <Modal
        isOpen={isDeleteConfirmModalOpen}
        onClose={closeDeleteConfirmModal}
        title="Confirm Deletion"
        primaryActionText="Delete Party"
        onPrimaryAction={confirmDeleteParty}
        secondaryActionText="Cancel"
        onSecondaryAction={closeDeleteConfirmModal}
        primaryActionType="delete"
      >
        <p>
          Are you sure you want to permanently delete the party:{" "}
          <strong>{partyToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

export default CreatorHub;
