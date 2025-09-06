import React, { useState } from "react";
import { convertCoalitionSoAToArray } from "../../elections/coalitionManager.js";
import "./HierarchicalCoalitionsList.css";

// Helper component to display county name
const CountyName = ({ countyId }) => {
  const [countyName, setCountyName] = useState(countyId);
  
  React.useEffect(() => {
    // Import and find county name
    import('../../data/states/adminRegions2/usaCounties.js').then(({ usaCounties }) => {
      const county = usaCounties.find(county => county.id === countyId);
      if (county) {
        setCountyName(county.name);
      }
    });
  }, [countyId]);
  
  return <span>{countyName}</span>;
};

// Helper component to display state name
const StateName = ({ stateId }) => {
  const [stateName, setStateName] = useState(stateId);
  
  React.useEffect(() => {
    // Import and find state name
    import('../../data/states/usaStates.js').then(({ usaStates }) => {
      const state = usaStates.find(state => state.id === stateId);
      if (state) {
        setStateName(state.name);
      }
    });
  }, [stateId]);
  
  return <span>{stateName}</span>;
};

// County Coalition Editor Component
const CountyCoalitionEditor = ({ countyId, coalitionSoA, parties, onUpdate }) => {
  if (!coalitionSoA || !coalitionSoA.base) {
    return <p className="help-text">No coalition data for this county.</p>;
  }

  const coalitionData = convertCoalitionSoAToArray(coalitionSoA);

  return (
    <div className="county-coalition-editor">
      {coalitionData.map(coalition => (
        <div key={coalition.id} className="county-coalition-item">
          <div className="coalition-header">
            <span className="coalition-name">{coalition.name}</span>
            <span className="coalition-size">({coalition.size}% of electorate)</span>
          </div>
          
          <div className="coalition-controls">
            <div className="mobilization-control">
              <label>📊 Mobilization:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={coalition.mobilization || 50}
                onChange={(e) => onUpdate(coalition.id, { 
                  mobilization: parseFloat(e.target.value) 
                })}
              />
              <span>{Math.round(coalition.mobilization || 50)}%</span>
            </div>
            
            <div className="support-base-control">
              <label>👥 Support Base:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={coalition.supportBase || 0}
                onChange={(e) => onUpdate(coalition.id, { 
                  supportBase: parseFloat(e.target.value) 
                })}
              />
              <span>{Math.round((coalition.supportBase || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Hierarchical Coalitions Display Component
const HierarchicalCoalitionsList = ({ 
  hierarchicalCoalitions, 
  defaultCoalitions, 
  parties, 
  electionInstances,
  selectedRegionId,
  onHierarchicalCoalitionUpdate, 
  onCoalitionUpdate,
  CoalitionsList // Pass CoalitionsList as prop to avoid circular imports
}) => {
  const [selectedLevel, setSelectedLevel] = useState('state');
  const [selectedElection, setSelectedElection] = useState(null);
  const [expandedCounties, setExpandedCounties] = useState(new Set());

  // Get all election instances for selection
  const allElectionInstances = Object.values(electionInstances).flat();
  
  // Find elections with hierarchical data (governor and president/electoral college)
  const hierarchicalElections = allElectionInstances.filter(instance => 
    (instance.electionTypeId.includes('governor') || instance.electionTypeId.includes('president')) &&
    hierarchicalCoalitions.electionSpecific.has(instance.id)
  );

  // Auto-select first hierarchical election if available
  React.useEffect(() => {
    if (!selectedElection && hierarchicalElections.length > 0) {
      setSelectedElection(hierarchicalElections[0].id);
    }
  }, [hierarchicalElections, selectedElection]);

  if (!hierarchicalCoalitions || !hierarchicalCoalitions.electionSpecific) {
    return <p className="help-text">No hierarchical coalitions available.</p>;
  }

  const selectedElectionData = selectedElection ? 
    hierarchicalCoalitions.electionSpecific.get(selectedElection) : null;

  // Determine election type for conditional rendering
  const selectedElectionInstance = hierarchicalElections.find(e => e.id === selectedElection);
  const isElectoralCollege = selectedElectionInstance?.electionTypeId.includes('president');

  const toggleCountyExpanded = (countyId) => {
    const newExpanded = new Set(expandedCounties);
    if (newExpanded.has(countyId)) {
      newExpanded.delete(countyId);
    } else {
      newExpanded.add(countyId);
    }
    setExpandedCounties(newExpanded);
  };

  const handleCountyCoalitionUpdate = (countyId, coalitionId, changes) => {
    // Import the update function dynamically
    import('../../elections/hierarchicalCoalitions.js').then(({ updateCountyCoalition }) => {
      const updatedHierarchicalCoalitions = updateCountyCoalition(
        hierarchicalCoalitions,
        selectedRegionId,
        countyId,
        coalitionId,
        changes
      );
      onHierarchicalCoalitionUpdate(updatedHierarchicalCoalitions);
    });
  };

  return (
    <div className="hierarchical-coalitions">
      <div className="election-selector">
        <label>Election:</label>
        <select 
          value={selectedElection || ''} 
          onChange={(e) => setSelectedElection(e.target.value)}
        >
          <option value="">Select an election</option>
          {hierarchicalElections.map(election => (
            <option key={election.id} value={election.id}>
              {election.displayName}
            </option>
          ))}
        </select>
      </div>

      {selectedElectionData && (
        <div className="level-tabs">
          <button 
            className={`tab-button ${selectedLevel === 'state' ? 'active' : ''}`}
            onClick={() => setSelectedLevel('state')}
          >
            {isElectoralCollege ? 'National Level' : 'State Level'}
          </button>
          <button 
            className={`tab-button ${selectedLevel === 'county' ? 'active' : ''}`}
            onClick={() => setSelectedLevel('county')}
          >
            {isElectoralCollege ? 'State Level' : 'County Level'}
          </button>
        </div>
      )}

      {selectedElectionData && selectedLevel === 'state' && (
        <div className="top-level-coalitions">
          <h5>
            {isElectoralCollege ? (
              <>🇺🇸 National-Level Coalitions</>
            ) : (
              <>🏛️ State-Level Coalitions</>
            )}
          </h5>
          <CoalitionsList 
            coalitionSoA={selectedElectionData.baseCoalitions}
            parties={parties}
            onCoalitionUpdate={onCoalitionUpdate}
          />
        </div>
      )}

      {selectedElectionData && selectedLevel === 'county' && (
        <div className="sub-level-coalitions">
          <h5>
            {isElectoralCollege ? (
              <>🏛️ State-Level Coalitions</>
            ) : (
              <>🏘️ County-Level Coalitions</>
            )}
          </h5>
          {isElectoralCollege ? (
            // Electoral College: Show state distributions
            selectedElectionData.stateDistributions && 
            Array.from(selectedElectionData.stateDistributions.entries()).map(([stateId, stateCoalitions]) => (
              <div key={stateId} className={`state-coalition-section ${expandedCounties.has(stateId) ? 'expanded' : ''}`}>
                <div 
                  className="state-header" 
                  onClick={() => toggleCountyExpanded(stateId)}
                >
                  <h6>
                    🏛️ <StateName stateId={stateId} />
                  </h6>
                </div>
                
                {expandedCounties.has(stateId) && (
                  <div className="state-coalition-content">
                    <h6>🏛️ State-Level Coalitions</h6>
                    <CoalitionsList 
                      coalitionSoA={stateCoalitions}
                      parties={parties}
                      onCoalitionUpdate={onCoalitionUpdate}
                    />
                    
                    {/* Show county-level coalitions if available */}
                    {selectedElectionData.countyDistributions?.has(stateId) && (
                      <div className="county-distributions-section">
                        <h6>🏘️ County-Level Coalitions</h6>
                        {Array.from(selectedElectionData.countyDistributions.get(stateId).entries()).map(([countyId, countyCoalitions]) => (
                          <div key={countyId} className={`county-coalition-subsection ${expandedCounties.has(countyId) ? 'expanded' : ''}`}>
                            <div 
                              className="county-subheader"
                              onClick={() => toggleCountyExpanded(countyId)}
                            >
                              <span className="county-name">
                                🏘️ <CountyName countyId={countyId} />
                              </span>
                            </div>
                            
                            {expandedCounties.has(countyId) && (
                              <div className="county-coalition-content">
                                <CountyCoalitionEditor
                                  countyId={countyId}
                                  coalitionSoA={countyCoalitions}
                                  parties={parties}
                                  onUpdate={(coalitionId, changes) => 
                                    handleCountyCoalitionUpdate(countyId, coalitionId, changes)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            // Governor: Show county distributions
            selectedElectionData.countyDistributions && 
            Array.from(selectedElectionData.countyDistributions.entries()).map(([countyId, countyCoalitions]) => (
              <div key={countyId} className={`county-coalition-section ${expandedCounties.has(countyId) ? 'expanded' : ''}`}>
                <div 
                  className="county-header" 
                  onClick={() => toggleCountyExpanded(countyId)}
                >
                  <h6>
                    🏘️ <CountyName countyId={countyId} />
                  </h6>
                </div>
                
                {expandedCounties.has(countyId) && (
                  <div className="county-coalition-content">
                    <CountyCoalitionEditor
                      countyId={countyId}
                      coalitionSoA={countyCoalitions}
                      parties={parties}
                      onUpdate={(coalitionId, changes) => 
                        handleCountyCoalitionUpdate(countyId, coalitionId, changes)
                      }
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {!selectedElectionData && (
        <p className="help-text">
          Select an election above to view hierarchical coalitions. 
          Electoral College (Presidential) and Governor elections show multiple levels.
        </p>
      )}
    </div>
  );
};

export default HierarchicalCoalitionsList;