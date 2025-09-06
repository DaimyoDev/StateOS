import React, { useState } from "react";
import { 
  convertCoalitionSoAToArray, 
  updateCoalitionMobilization, 
  getPartyAlignmentForCoalition 
} from "../../elections/coalitionManager.js";

const CoalitionsList = ({ coalitionSoA, parties, onCoalitionUpdate }) => {
  const [expandedProfiles, setExpandedProfiles] = useState(new Set());
  const [editingProfiles, setEditingProfiles] = useState(new Set());
  const [tempPolicyStances, setTempPolicyStances] = useState(new Map());
  const [localMobilization, setLocalMobilization] = useState(new Map());

  if (!coalitionSoA || !coalitionSoA.base) {
    return <p className="help-text">No coalitions data available.</p>;
  }

  // Convert the coalitions SoA structure to array for display using extracted function
  const coalitionData = convertCoalitionSoAToArray(coalitionSoA);

  const handleMobilizationChange = (coalitionId, newMobilization) => {
    const mobilizationValue = parseFloat(newMobilization);
    
    // Update local state immediately for UI responsiveness
    setLocalMobilization(prev => {
      const newMap = new Map(prev);
      newMap.set(coalitionId, mobilizationValue);
      return newMap;
    });
    
    // Also update the parent state
    const updatedCoalitionSoA = updateCoalitionMobilization(coalitionSoA, coalitionId, mobilizationValue);
    onCoalitionUpdate(updatedCoalitionSoA);
  };
  
  const getMobilizationValue = (coalition) => {
    return localMobilization.get(coalition.id) ?? coalition.mobilization;
  };

  const toggleElectorateProfile = (coalitionId) => {
    const newExpanded = new Set(expandedProfiles);
    if (newExpanded.has(coalitionId)) {
      newExpanded.delete(coalitionId);
    } else {
      newExpanded.add(coalitionId);
    }
    setExpandedProfiles(newExpanded);
  };

  const startEditingProfile = (coalitionId) => {
    const coalition = coalitionData.find(c => c.id === coalitionId);
    if (coalition && coalition.policyStances) {
      // Store current policy stances as temporary editable data
      setTempPolicyStances(new Map([[coalitionId, new Map(coalition.policyStances)]]));
      setEditingProfiles(new Set([coalitionId]));
    }
  };

  const cancelEditingProfile = (coalitionId) => {
    setEditingProfiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(coalitionId);
      return newSet;
    });
    setTempPolicyStances(prev => {
      const newMap = new Map(prev);
      newMap.delete(coalitionId);
      return newMap;
    });
  };

  const saveProfileChanges = (coalitionId) => {
    const tempStances = tempPolicyStances.get(coalitionId);
    if (tempStances) {
      // Update the coalition SoA structure with new policy stances
      const updatedCoalitionSoA = {
        ...coalitionSoA,
        policyStances: new Map(coalitionSoA.policyStances)
      };
      updatedCoalitionSoA.policyStances.set(coalitionId, tempStances);
      onCoalitionUpdate(updatedCoalitionSoA);
    }
    cancelEditingProfile(coalitionId);
  };

  const updateTempPolicyStance = (coalitionId, policyId, newValue) => {
    setTempPolicyStances(prev => {
      const newMap = new Map(prev);
      const coalitionStances = new Map(newMap.get(coalitionId) || new Map());
      coalitionStances.set(policyId, parseFloat(newValue));
      newMap.set(coalitionId, coalitionStances);
      return newMap;
    });
  };

  // Helper function to format demographic values nicely
  const formatDemographicValue = (key, value) => {
    const labels = {
      location: 'Location',
      age: 'Age Group',
      education: 'Education',
      occupation: 'Occupation',
      income: 'Income Level',
      ageDistribution: 'Age Distribution',
      urbanization: 'Urbanization',
      educationLevel: 'Education Level',
      incomeLevel: 'Income Level'
    };

    const label = labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    
    if (typeof value === 'object' && value !== null) {
      // For nested objects like age distribution, show the dominant category
      const entries = Object.entries(value);
      if (entries.length > 0) {
        const dominant = entries.reduce((max, [k, v]) => v > max.value ? { key: k, value: v } : max, { key: entries[0][0], value: entries[0][1] });
        return `${label}: ${dominant.key} (${dominant.value}%)`;
      }
      return `${label}: Complex`;
    }
    
    // Format simple values
    if (typeof value === 'number') {
      return `${label}: ${value}${key === 'urbanization' ? '%' : ''}`;
    }
    
    return `${label}: ${value}`;
  };

  return (
    <div className="coalitions-list">
      {coalitionData.map((coalition) => (
        <div key={coalition.id} className="coalition-item">
          <div className="coalition-header">
            <h5>{coalition.name || `Coalition ${coalition.id}`}</h5>
            <span className="support-base">
              Support Base: {(coalition.supportBase * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="coalition-details">
            <div className="demographic-profile">
              <h6>Demographics:</h6>
              <div className="demo-stats">
                {coalition.demographics && Object.entries(coalition.demographics).map(([key, value]) => (
                  <div key={key} className="demo-stat">
                    {formatDemographicValue(key, value)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="party-preferences">
              <h6>Party Preferences:</h6>
              {getPartyAlignmentForCoalition(coalition, parties).map(({ partyId, partyName, partyColor, alignment }) => (
                <div key={partyId} className="party-alignment">
                  <span className="party-name" style={{ color: partyColor }}>
                    {partyName}
                  </span>
                  <span className="alignment-score">
                    {alignment.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mobilization-control">
              <label>Mobilization Level:</label>
              <div className="slider-with-value">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(getMobilizationValue(coalition)) || 50}
                  onChange={(e) => handleMobilizationChange(coalition.id, e.target.value)}
                  onInput={(e) => handleMobilizationChange(coalition.id, e.target.value)}
                />
                <span>{Math.round(getMobilizationValue(coalition))}%</span>
              </div>
            </div>
            
            <div className="electorate-profile-section">
              <button 
                className="profile-toggle-btn"
                onClick={() => toggleElectorateProfile(coalition.id)}
              >
                {expandedProfiles.has(coalition.id) ? '▼' : '▶'} Electorate Profile
              </button>
              
              {expandedProfiles.has(coalition.id) && (
                <div className="electorate-profile-details">
                  <div className="profile-header">
                    <div className="ideology-info">
                      <h6>Primary Ideology:</h6>
                      <span className="ideology-value">{coalition.ideology || 'Moderate'}</span>
                    </div>
                    <div className="profile-actions">
                      {editingProfiles.has(coalition.id) ? (
                        <>
                          <button 
                            className="save-btn" 
                            onClick={() => saveProfileChanges(coalition.id)}
                          >
                            Save
                          </button>
                          <button 
                            className="cancel-btn" 
                            onClick={() => cancelEditingProfile(coalition.id)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          className="edit-btn" 
                          onClick={() => startEditingProfile(coalition.id)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="policy-stances">
                    <h6>Policy Stances:</h6>
                    <div className="policy-grid">
                      {coalition.policyStances && Array.from(coalition.policyStances.entries()).map(([policyId, stance]) => {
                        const policyLabel = policyId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const isEditing = editingProfiles.has(coalition.id);
                        const currentValue = isEditing ? 
                          (tempPolicyStances.get(coalition.id)?.get(policyId) ?? stance) : stance;
                        const stanceValue = typeof currentValue === 'number' ? currentValue : 0;
                        
                        if (isEditing) {
                          return (
                            <div key={policyId} className="policy-stance editing">
                              <label className="policy-name">{policyLabel}:</label>
                              <div className="stance-editor">
                                <input
                                  type="range"
                                  min="-5"
                                  max="5"
                                  step="0.5"
                                  value={stanceValue}
                                  onChange={(e) => updateTempPolicyStance(coalition.id, policyId, e.target.value)}
                                  className="stance-slider"
                                />
                                <span className={`stance-value stance-${Math.sign(stanceValue)}`}>
                                  {stanceValue > 0 ? '+' : ''}{stanceValue}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          const stanceLabel = stanceValue > 2 ? 'Strong Support' :
                                            stanceValue > 0 ? 'Support' :
                                            stanceValue === 0 ? 'Neutral' :
                                            stanceValue > -2 ? 'Oppose' : 'Strong Opposition';
                          return (
                            <div key={policyId} className="policy-stance">
                              <span className="policy-name">{policyLabel}:</span>
                              <span className={`stance-value stance-${Math.sign(stanceValue)}`}>
                                {stanceLabel} ({stanceValue > 0 ? '+' : ''}{stanceValue})
                              </span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoalitionsList;