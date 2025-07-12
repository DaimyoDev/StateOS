// ui-src/src/components/modals/ViewPoliticianModal.jsx
import React from "react";
import Modal from "./Modal"; // Your existing base Modal component
import "./ViewPoliticianModal.css"; // We'll create this CSS file
import { POLICY_QUESTIONS } from "../../data/policyData.js"; // Adjust path as needed

const ViewPoliticianModal = ({ isOpen, onClose, politician }) => {
  // --- Call React.useMemo at the top level, before any conditional returns ---
  const stancesByCategory = React.useMemo(() => {
    // Handle the case where politician or policyStances might be null/undefined here
    if (!politician || !politician.policyStances) {
      return {}; // Return an empty object or suitable default
    }

    const grouped = {};
    POLICY_QUESTIONS.forEach((question) => {
      if (!grouped[question.category]) {
        grouped[question.category] = [];
      }
      const stanceValue = politician.policyStances[question.id];
      // Ensure question.options exists before calling find
      const stanceOption = question.options?.find(
        (opt) => opt.value === stanceValue
      );

      let displayQuestionText = question.questionText || "Unnamed Question"; // Fallback for questionText
      if (typeof question.questionText === "string") {
        // Only try to replace if it's a string
        try {
          displayQuestionText = question.questionText
            .replace("What is your stance on ", "")
            .replace("How should ", "")
            .replace("What is your approach to ", "")
            .replace("Do you support or oppose ", "")
            .replace(" be taxed", " Tax")
            .replace(/\?$/, "") // Regex to remove only trailing question mark
            .trim();
          if (displayQuestionText.length > 0) {
            displayQuestionText =
              displayQuestionText.charAt(0).toUpperCase() +
              displayQuestionText.slice(1);
          }
        } catch (e) {
          console.error(
            "Error processing question text:",
            question.questionText,
            e
          );
          // displayQuestionText remains original question.questionText or the fallback
        }
      }

      grouped[question.category].push({
        id: question.id,
        questionText: displayQuestionText,
        stanceText: stanceOption ? stanceOption.text : "Not Stated",
      });
    });
    return grouped;
  }, [politician]); // Dependency array - re-calculate if politician object changes

  // --- Now, the early return condition ---
  if (!isOpen || !politician) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Politician Profile: ${
        politician.name || `${politician.firstName} ${politician.lastName}`
      }`}
    >
      <div className="view-politician-content">
        <div className="politician-header">
          <h3>
            {politician.name ||
              `${politician.firstName} ${politician.lastName}`}
          </h3>
          <p>Age: {politician.age || "N/A"}</p>
          <p>
            Party:{" "}
            <span style={{ color: politician.partyColor || "inherit" }}>
              {politician.partyName || "N/A"}
            </span>
          </p>
          <p>Ideology: {politician.calculatedIdeology || "N/A"}</p>
        </div>

        <div className="politician-section attributes-section">
          {" "}
          {/* Added specific class */}
          <h4>Attributes:</h4>
          <ul className="attributes-list">
            {politician.attributes ? (
              Object.entries(politician.attributes).map(([key, value]) => (
                <li key={key}>
                  <span className="attribute-name">
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </span>
                  <span className="attribute-value">{value}</span>
                  <div className="attribute-bar-container">
                    <div
                      className="attribute-bar"
                      style={{ width: `${value * 10}%` }} // Assuming attributes are 0-10
                    ></div>
                  </div>
                </li>
              ))
            ) : (
              <li>No attribute data.</li>
            )}
          </ul>
        </div>

        <div className="politician-section policy-stances-section">
          {" "}
          {/* Added specific class */}
          <h4>Policy Stances:</h4>
          {politician.policyStances &&
          Object.keys(politician.policyStances).length > 0 ? (
            Object.entries(stancesByCategory).map(([category, stances]) => (
              <div key={category} className="stance-category">
                <h5>{category}</h5>
                <ul className="stances-list">
                  {stances.map((stance) => (
                    <li key={stance.id} className="stance-item">
                      <span className="stance-question">
                        {stance.questionText}:
                      </span>
                      <span className="stance-answer">{stance.stanceText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No specific policy stances available.</p>
          )}
        </div>

        {politician.background && (
          <div className="politician-section background-section">
            {" "}
            {/* Added specific class */}
            <h4>Background:</h4>
            <p>
              <strong>Education:</strong>{" "}
              {politician.background.education || "N/A"}
            </p>
            <p>
              <strong>Career:</strong> {politician.background.career || "N/A"}
            </p>
            <p className="narrative">
              {" "}
              {/* Class for narrative */}
              <em>{politician.background.narrative || ""}</em>
            </p>
          </div>
        )}
        <div className="modal-button-container">
          <button
            onClick={onClose}
            className="action-button close-politician-modal-button"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPoliticianModal;
