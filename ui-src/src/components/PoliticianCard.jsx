import React from "react";
import "./PoliticianCard.css"; // Create this CSS file

const PoliticianCard = React.memo(
  ({ office, politician, currentLocationName, formatOfficeTitle, onClick }) => {
    if (!politician) return null; // Don't render if no politician data

    const officeTitle = formatOfficeTitle(office, currentLocationName);

    return (
      <div className="politician-card" onClick={() => onClick(politician)}>
        <h5 className="card-title">{officeTitle}</h5>
        <div className="card-body">
          <p className="politician-name">
            <strong>{politician.name}</strong>
          </p>
          {politician.partyName && (
            <p
              className="politician-party"
              style={{ color: politician.partyColor || "#CCC" }}
            >
              {politician.partyName}
            </p>
          )}
          {/* Add more details here if desired, e.g., approval rating, tenure */}
        </div>
      </div>
    );
  }
);

export default PoliticianCard;
