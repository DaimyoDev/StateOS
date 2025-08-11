import React, { useState } from "react";
import useGameStore from "../../store";
import Modal from "./Modal";
import "./StaffModals.css";

const STRATEGIC_FOCUS_OPTIONS = [
  "aggressive",
  "grassroots",
  "data_driven",
  "positive_messaging",
];
const ATTRIBUTE_OPTIONS = [
  "strategy",
  "communication",
  "fundraising",
  "loyalty",
];

const StaffQuizModal = ({ staffId, onClose }) => {
  const staffMember = useGameStore((state) =>
    state.talentPool.find((s) => s.id === staffId)
  );
  const completeStaffQuiz = useGameStore(
    (state) => state.actions.completeStaffQuiz
  );

  const [answers, setAnswers] = useState({});

  const handleSelect = (questionKey, answer) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: answer }));
  };

  const handleSubmit = () => {
    completeStaffQuiz(staffId, answers);
    onClose();
  };

  if (!staffMember) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Final Assessment`}>
      <div className="staff-modal-content quiz-content">
        <div className="quiz-question">
          <p>
            1. Based on their resume, what is this candidate's core strength?
          </p>
          <div className="quiz-answers">
            {ATTRIBUTE_OPTIONS.map((attr) => (
              <button
                key={attr}
                className={`quiz-answer-btn ${
                  answers["resume_clue"] === attr ? "selected" : ""
                }`}
                onClick={() => handleSelect("resume_clue", attr)}
              >
                {attr.charAt(0).toUpperCase() + attr.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-question">
          <p>
            2. From your interview, what did you discern as their primary work
            style?
          </p>
          <div className="quiz-answers">
            {STRATEGIC_FOCUS_OPTIONS.map((focus) => (
              <button
                key={focus}
                className={`quiz-answer-btn ${
                  answers["strategic_focus"] === focus ? "selected" : ""
                }`}
                onClick={() => handleSelect("strategic_focus", focus)}
              >
                {focus.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <button
          className="action-button"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < 2}
        >
          Submit Assessment
        </button>
      </div>
    </Modal>
  );
};

export default StaffQuizModal;
