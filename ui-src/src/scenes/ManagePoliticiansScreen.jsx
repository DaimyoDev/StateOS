// ui-src/src/scenes/ManagePoliticiansScreen.jsx
import React, { useState } from "react";
import useGameStore from "../store";
import Modal from "../components/modals/Modal";
import "./ManagePoliticiansScreen.css"; // Create this CSS

function ManagePoliticiansScreen() {
  const savedPoliticians = useGameStore((state) => state.savedPoliticians);
  const actions = useGameStore((state) => state.actions);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [politicianToDelete, setPoliticianToDelete] = useState(null);

  if (!actions || !savedPoliticians) {
    return <div>Loading...</div>;
  }

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
    if (politicianToDelete && actions.deleteSavedPolitician) {
      actions.deleteSavedPolitician(politicianToDelete.id);
    }
    closeDeleteConfirmModal();
  };

  return (
    <>
      <div className="manage-politicians-container">
        <div className="manage-panel">
          <h1 className="manage-title important-heading">
            Manage Your Politicians
          </h1>

          {savedPoliticians.length === 0 ? (
            <p className="no-politicians-message">
              You haven't created any politicians yet. Go to "Create New
              Politician" to get started!
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
                    <button
                      className="action-button small-button" // Primary action style
                      onClick={() =>
                        actions.initializeNewCampaignSetup(politician.id, "JPN")
                      }
                    >
                      Use for Campaign
                    </button>
                    <button
                      className="menu-button small-button" // Secondary action style
                      onClick={() =>
                        actions.loadPoliticianForEditing(politician.id)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="button-delete small-button"
                      onClick={() => openDeleteConfirmModal(politician)} // Open modal
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="screen-actions">
            <button
              className="menu-button"
              // Navigate back to CreatorHub main menu or CampaignStartOptions based on flow
              onClick={() => actions.navigateTo("CampaignStartOptionsScreen")}
            >
              Back
            </button>
            <button
              className="action-button"
              onClick={() => {
                actions.resetCreatingPolitician(); // Ensure form is clear for new creation
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
        primaryActionType="delete" // Ensures the delete button gets .button-delete style
      >
        <p>
          Are you sure you want to permanently delete{" "}
          <strong>{politicianToDelete?.name || "this politician"}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
}

export default ManagePoliticiansScreen;
