import React from "react";
import "./Modal.css"; // We'll create this CSS file

function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
  primaryActionType = "action",
  contentClassName = "",
  // NEW: Prop to indicate if title should be inside the children or handled by base modal
  // This helps if children wants to fully control its background including title area
  // hideBaseTitle = false,
}) {
  if (!isOpen) {
    return null;
  }

  // Prevent clicks inside the modal from closing it, but allow clicks on the overlay to close
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {" "}
      {/* Click overlay to close */}
      <div
        className={`modal-content ${contentClassName}`} // Use the new prop here
        onClick={handleModalContentClick}
      >
        {title && <h2 className="modal-title">{title}</h2>}

        <div className="modal-body">
          {children} {/* Content of the modal will go here */}
        </div>

        {(onPrimaryAction || onSecondaryAction) && (
          <div className="modal-actions">
            {onSecondaryAction && secondaryActionText && (
              <button
                className="menu-button modal-button" // Or a more specific .button-secondary
                onClick={onSecondaryAction}
              >
                {secondaryActionText}
              </button>
            )}
            {onPrimaryAction && primaryActionText && (
              <button
                // Use button-action for standard primary, button-delete for destructive primary
                className={`${
                  primaryActionType === "delete"
                    ? "button-delete"
                    : "action-button"
                } modal-button`}
                onClick={onPrimaryAction}
              >
                {primaryActionText}
              </button>
            )}
          </div>
        )}
        {/* Optional: Close button 'X' in the corner */}
        {/* <button className="modal-close-button" onClick={onClose}>&times;</button> */}
      </div>
    </div>
  );
}

export default Modal;
