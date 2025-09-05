// ui-src/src/components/modals/CommitteeMeetingModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import "./CommitteeMeetingModal.css";

function CommitteeMeetingModal({ isOpen, meeting }) {
  const [meetingContent, setMeetingContent] = useState(null);
  const [currentAgendaItem, setCurrentAgendaItem] = useState(0);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [attendanceNotes, setAttendanceNotes] = useState("");
  
  const actions = useGameStore((state) => state.actions);
  const playerPolitician = useGameStore((state) => state.activeCampaign?.politician);

  useEffect(() => {
    if (isOpen && meeting) {
      // Generate meeting content when modal opens
      const content = actions.generateCommitteeMeetingContent(
        meeting.partyId,
        meeting.committeeId
      );
      setMeetingContent(content);
      setCurrentAgendaItem(0);
      setShowDiscussion(false);
      setAttendanceNotes("");
    }
  }, [isOpen, meeting, actions]);

  const handleNextAgendaItem = () => {
    if (currentAgendaItem < meetingContent.agenda.length - 1) {
      setCurrentAgendaItem(currentAgendaItem + 1);
      setShowDiscussion(false);
    } else {
      setShowDiscussion(true);
    }
  };

  const handleCloseMeeting = () => {
    // Mark meeting as completed
    if (meeting?.id) {
      actions.completeScheduledMeeting(meeting.id);
    }
    
    // Add experience or relationship bonuses
    if (meetingContent?.atmosphere === 'productive' || meetingContent?.atmosphere === 'collaborative') {
      actions.addToast({
        message: "You gained valuable insights from the committee meeting.",
        type: "success"
      });
    }
    
    actions.closeCommitteeMeetingModal();
  };

  const handleTakeNotes = (text) => {
    setAttendanceNotes(text);
  };

  const handleNetworkWithMembers = () => {
    const cost = 50;
    if (playerPolitician.treasury >= cost) {
      actions.updatePlayerPolitician({
        treasury: playerPolitician.treasury - cost,
      });
      
      // Small chance to improve relationships with committee members
      if (Math.random() < 0.3) {
        actions.addToast({
          message: "You made a good impression on several committee members.",
          type: "success"
        });
      } else {
        actions.addToast({
          message: "You networked with committee members during the break.",
          type: "info"
        });
      }
    } else {
      actions.addToast({
        message: "Not enough funds for networking activities.",
        type: "error"
      });
    }
  };

  if (!isOpen || !meeting || !meetingContent) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={`${meetingContent.committee.name} Meeting`}
      onClose={handleCloseMeeting}
      className="committee-meeting-modal"
    >
      <div className="modal-body">
        <div className="meeting-header">
        <div className="meeting-info">
          <h3>{meetingContent.party.name}</h3>
          <p className="meeting-date">
            {meeting.meetingDate.month}/{meeting.meetingDate.day}/{meeting.meetingDate.year}
          </p>
          <p className="meeting-atmosphere">
            Atmosphere: <span className={`atmosphere-${meetingContent.atmosphere}`}>
              {meetingContent.atmosphere}
            </span>
          </p>
        </div>
        <div className="meeting-stats">
          <div className="stat-item">
            <strong>Attendees:</strong> {meetingContent.attendees}
          </div>
          <div className="stat-item">
            <strong>Chair:</strong> {meetingContent.committee.chair?.name || "Vacant"}
          </div>
        </div>
      </div>

      <div className="meeting-content">
        {!showDiscussion ? (
          <div className="agenda-section">
            <h4>Agenda Item {currentAgendaItem + 1} of {meetingContent.agenda.length}</h4>
            <div className="agenda-item">
              <p className="agenda-topic">{meetingContent.agenda[currentAgendaItem]}</p>
              
              {/* Show relevant discussions for this agenda item */}
              <div className="agenda-discussions">
                {meetingContent.discussions
                  .filter((_, index) => index % meetingContent.agenda.length === currentAgendaItem)
                  .map((discussion, index) => (
                    <div key={index} className="discussion-item">
                      <div className="speaker-info">
                        <strong>{discussion.speaker}</strong>
                        <span className="speaker-role">({discussion.role})</span>
                      </div>
                      <p className="statement">{discussion.statement}</p>
                    </div>
                  ))}
              </div>
            </div>
            
            <button 
              className="action-button"
              onClick={handleNextAgendaItem}
            >
              {currentAgendaItem < meetingContent.agenda.length - 1 
                ? "Next Agenda Item" 
                : "Proceed to General Discussion"}
            </button>
          </div>
        ) : (
          <div className="discussion-section">
            <h4>General Discussion & Motions</h4>
            
            {/* Show remaining discussions */}
            <div className="general-discussions">
              {meetingContent.discussions
                .slice(Math.floor(meetingContent.discussions.length / 2))
                .map((discussion, index) => (
                  <div key={index} className="discussion-item">
                    <div className="speaker-info">
                      <strong>{discussion.speaker}</strong>
                      <span className="speaker-expertise">{discussion.expertise}</span>
                    </div>
                    <p className="statement">{discussion.statement}</p>
                  </div>
                ))}
            </div>
            
            {meetingContent.motion && (
              <div className="motion-section">
                <h5>Motion on the Floor</h5>
                <div className="motion-card">
                  <p className="motion-text">{meetingContent.motion}</p>
                  <p className={`motion-result ${meetingContent.motionPassed ? 'passed' : 'failed'}`}>
                    {meetingContent.motionPassed ? "✓ Motion Passed" : "✗ Motion Failed"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="meeting-actions">
        <div className="notes-section">
          <label>Your Notes:</label>
          <textarea
            value={attendanceNotes}
            onChange={(e) => handleTakeNotes(e.target.value)}
            placeholder="Take notes on important points..."
            rows={3}
          />
        </div>
        
        <div className="action-buttons">
          <button 
            className="action-button secondary"
            onClick={handleNetworkWithMembers}
            disabled={showDiscussion}
          >
            Network with Members ($50)
          </button>
          
          {showDiscussion && (
            <button 
              className="action-button primary"
              onClick={handleCloseMeeting}
            >
              Leave Meeting
            </button>
          )}
        </div>
      </div> 
      </div> {/* Close modal-body */}
    </Modal>
  );
}

export default CommitteeMeetingModal;