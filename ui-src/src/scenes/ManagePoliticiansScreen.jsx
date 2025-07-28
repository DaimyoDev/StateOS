import React, { useState } from "react";
import useGameStore from "../store";
import Modal from "../components/modals/Modal";
import "./ManagePoliticiansScreen.css";

function ManagePoliticiansScreen() {
  const savedPoliticians = useGameStore((state) => state.savedPoliticians);
  const actions = useGameStore((state) => state.actions);
  // NEW: Get the previous scene to determine the context
  const previousScene = useGameStore((state) => state.previousScene);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [politicianToDelete, setPoliticianToDelete] = useState(null);

  // Determine if the screen was opened from the campaign start flow.
  const isCampaignSetup = previousScene === "CampaignStartOptionsScreen";

  const openDeleteConfirmModal = (politician) => {
    setPoliticianToDelete({
      id: politician.id,
      name: `${politician.firstName} ${politician.lastName}`,
    });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setIsDeleteModalOpen(false);
    setPoliticianToDelete(null);
  };

  const confirmDeletePolitician = () => {
    if (politicianToDelete) {
      actions.deleteSavedPolitician(politicianToDelete.id);
    }
    closeDeleteConfirmModal();
  };

  // NEW: Action for the "Use" button
  const handleSelectPoliticianForCampaign = (politicianId) => {
    // This action will set up the politician and navigate to the campaign setup screen
    actions.initializeNewCampaignSetup(politicianId);
  };

  return (
    <>
      <div className="manage-politicians-container">
        <div className="manage-panel">
          <h1 className="manage-title important-heading">
            {/* Change title based on context */}
            {isCampaignSetup
              ? "Select a Politician"
              : "Manage Your Politicians"}
          </h1>

          {savedPoliticians.length === 0 ? (
            <p className="no-politicians-message">
              You haven't created any politicians yet.
            </p>
          ) : (
            <ul className="politician-list">
              {savedPoliticians.map((politician) => (
                <li key={politician.id} className="politician-list-item">
                  <div className="politician-info">
                    <span className="politician-name">
                      {politician.firstName} {politician.lastName}
                    </span>
                    <span className="politician-details">
                      Age: {politician.age}, Ideology:{" "}
                      {politician.calculatedIdeology}
                    </span>
                  </div>
                  <div className="politician-actions">
                    {/* UPDATED: Conditionally render the "Use" button */}
                    {isCampaignSetup && (
                      <button
                        className="action-button small-button"
                        onClick={() =>
                          handleSelectPoliticianForCampaign(politician.id)
                        }
                      >
                        Use
                      </button>
                    )}
                    <button
                      className="menu-button small-button"
                      onClick={() =>
                        actions.loadPoliticianForEditing(politician.id)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="button-delete small-button"
                      onClick={() => openDeleteConfirmModal(politician)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="screen-actions">
            <button className="menu-button" onClick={actions.navigateBack}>
              Back
            </button>
            <button
              className="action-button"
              onClick={() => {
                actions.resetCreatingPolitician();
                actions.navigateTo("PoliticianCreator");
              }}
            >
              Create New Politician
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteConfirmModal}
        title="Confirm Deletion"
        primaryActionText="Delete Politician"
        onPrimaryAction={confirmDeletePolitician}
        secondaryActionText="Cancel"
        onSecondaryAction={closeDeleteConfirmModal}
        primaryActionType="delete"
      >
        <p>
          Are you sure you want to permanently delete{" "}
          <strong>{politicianToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
}

export default ManagePoliticiansScreen;
