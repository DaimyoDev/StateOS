import React from "react";
import useGameStore from "../../store";
import Modal from "./Modal";
import "./StaffModals.css";

const INTERVIEW_QUESTIONS = {
  biggest_success: "Ask about their biggest professional success.",
  work_style: "Inquire about their preferred work style.",
  motivation: "Ask what motivates them in a campaign role.",
};

const StaffInterviewModal = ({ staffId, onClose }) => {
  const staffMember = useGameStore((state) =>
    state.talentPool.find((s) => s.id === staffId)
  );
  const askInterviewQuestion = useGameStore(
    (state) => state.actions.askInterviewQuestion
  );
  const finishInterview = useGameStore(
    (state) => state.actions.finishInterview
  );

  const handleAskQuestion = (key) => {
    askInterviewQuestion(staffId, key);
  };

  const handleFinish = () => {
    finishInterview(staffId);
    onClose();
  };

  if (!staffMember) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Interviewing ${staffMember.name}`}
    >
      <div className="staff-modal-content interview-content">
        <div className="interview-panel">
          <h4>Question Topics</h4>
          <div className="interview-questions">
            {Object.entries(INTERVIEW_QUESTIONS).map(([key, question]) => (
              <button
                key={key}
                className="action-button small-button"
                onClick={() => handleAskQuestion(key)}
                disabled={
                  staffMember.interviewNotes && staffMember.interviewNotes[key]
                }
              >
                {question}
              </button>
            ))}
          </div>
        </div>
        <div className="interview-panel">
          <h4>Interview Notes</h4>
          <div className="interview-transcript">
            {staffMember.interviewNotes &&
            Object.keys(staffMember.interviewNotes).length > 0 ? (
              Object.values(staffMember.interviewNotes).map((note, index) => (
                <p
                  key={index}
                  dangerouslySetInnerHTML={{ __html: `&bull; ${note}` }}
                ></p>
              ))
            ) : (
              <p className="placeholder-text">
                Ask a question to gather intel...
              </p>
            )}
          </div>
        </div>
        <button className="action-button success-button" onClick={handleFinish}>
          Finish Interview
        </button>
      </div>
    </Modal>
  );
};

export default StaffInterviewModal;
