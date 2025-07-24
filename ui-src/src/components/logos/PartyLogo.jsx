import React from "react";
import "./PartyLogo.css";

/**
 * Displays a party's procedurally generated logo.
 * @param {object} props
 * @param {string} props.logoDataUrl - The base64 data URL of the logo image.
 * @param {string} props.partyName - The name of the party for accessibility.
 * @param {string} [props.size='32px'] - The size of the logo.
 */
function PartyLogo({ logoDataUrl, partyName, size = "32px" }) {
  if (!logoDataUrl) {
    // Fallback if no logo is available
    return (
      <div
        className="party-logo-placeholder"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={logoDataUrl}
      alt={`${partyName} Logo`}
      className="party-logo"
      style={{ width: size, height: size }}
    />
  );
}

export default PartyLogo;
