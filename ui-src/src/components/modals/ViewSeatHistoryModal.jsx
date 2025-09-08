import React, { useMemo } from "react";
import Modal from "./Modal";
import "./ViewSeatHistoryModal.css";

const ViewSeatHistoryModal = ({ isOpen, onClose, office, campaignData }) => {
  const sortedHistory = useMemo(() => {
    if (!office?.seatHistory) return [];
    
    return [...office.seatHistory].sort((a, b) => {
      const dateA = new Date(a.startDate.year, a.startDate.month - 1, a.startDate.day);
      const dateB = new Date(b.startDate.year, b.startDate.month - 1, b.startDate.day);
      return dateB - dateA; // Most recent first
    });
  }, [office?.seatHistory]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "Present";
    return `${dateObj.month}/${dateObj.day}/${dateObj.year}`;
  };

  const calculateTenure = (startDate, endDate) => {
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = endDate ? new Date(endDate.year, endDate.month - 1, endDate.day) : new Date();
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return months > 0 ? `${years}y ${months}m` : `${years}y`;
    }
    return months > 0 ? `${months}m` : `${diffDays}d`;
  };

  const getReasonLabel = (reason) => {
    switch (reason) {
      case "elected": return "Elected";
      case "appointed": return "Appointed";
      case "resigned": return "Resigned";
      case "term_expired": return "Term Expired";
      case "defeated": return "Defeated";
      default: return "Unknown";
    }
  };

  const getReasonClass = (reason) => {
    switch (reason) {
      case "elected": return "reason-elected";
      case "appointed": return "reason-appointed";
      case "resigned": return "reason-resigned";
      case "term_expired": return "reason-expired";
      case "defeated": return "reason-defeated";
      default: return "reason-unknown";
    }
  };

  if (!isOpen || !office) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Seat History: ${office.officeName}`}
      className="view-seat-history-modal"
    >
      <div className="seat-history-content">
        <div className="office-info">
          <h3>{office.officeName}</h3>
          <p className="office-level">{office.level?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>

        {sortedHistory.length > 0 ? (
          <div className="history-timeline">
            <h4>Historical Holders</h4>
            <div className="timeline-container">
              {sortedHistory.map((entry, index) => {
                const isCurrentHolder = !entry.endDate;
                const tenure = calculateTenure(entry.startDate, entry.endDate);
                
                return (
                  <div key={index} className={`timeline-entry ${isCurrentHolder ? 'current-holder' : ''}`}>
                    <div className="timeline-marker">
                      <div className="timeline-dot"></div>
                      {index < sortedHistory.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    
                    <div className="timeline-content">
                      <div className="holder-card">
                        <div className="holder-info">
                          <div className="holder-header">
                            <h5 className="holder-name">{entry.holder?.name || "Unknown"}</h5>
                            {isCurrentHolder && <span className="current-badge">Current</span>}
                          </div>
                          
                          {entry.holder?.partyName && (
                            <p className="holder-party" style={{ color: entry.holder.partyColor || '#888' }}>
                              {entry.holder.partyName}
                            </p>
                          )}
                        </div>
                        
                        <div className="tenure-info">
                          <div className="date-range">
                            <span className="start-date">{formatDate(entry.startDate)}</span>
                            <span className="date-separator">—</span>
                            <span className="end-date">{formatDate(entry.endDate)}</span>
                          </div>
                          
                          <div className="tenure-details">
                            <span className="tenure-length">{tenure}</span>
                            <span className={`reason-badge ${getReasonClass(entry.reason)}`}>
                              {getReasonLabel(entry.reason)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="no-history">
            <p>No historical data available for this seat.</p>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="action-button">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSeatHistoryModal;