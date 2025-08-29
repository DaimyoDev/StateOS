# Electoral College System Documentation

## Overview

The Electoral College System provides a realistic implementation of presidential elections using the existing coalition infrastructure. It calculates state-by-state polling and determines winners based on electoral votes rather than popular vote.

## Key Features

- **State-Level Coalition Integration**: Uses pre-generated coalition systems for accurate state polling
- **Real Electoral Vote Mapping**: Based on 2020 census data (538 total electoral votes)
- **Split State Support**: Handles Maine and Nebraska's district-based allocation
- **Caching System**: Optimized performance with state result caching
- **Fallback Support**: Works even without coalition systems

## Usage

### Basic Implementation

The electoral college system automatically activates when an election has `electoralSystem: "ElectoralCollege"`:

```javascript
// In election data (e.g., usaElections.js)
{
  id: nationalElectionIds.president,
  officeNameTemplate: "President of the United States",
  level: "national_head_of_state_and_government",
  electoralSystem: "ElectoralCollege", // This triggers electoral college mode
  // ... other properties
}
```

### How It Works

1. **Election Detection**: The polling system detects electoral college elections automatically
2. **State-by-State Calculation**: Each state's winner is determined using coalition systems
3. **Electoral Vote Allocation**: Winner-take-all for most states (except ME and NE)
4. **Overall Winner**: Candidate with 270+ electoral votes wins

### Coalition System Integration

The electoral college leverages your existing coalition systems:

```javascript
// Coalition systems are automatically used if available
const coalitionKey = `state_${stateId}`;
const coalitionSoA = coalitionSystems[coalitionKey];

// For each candidate, calculate coalition-based polling
const coalitionResults = calculateCoalitionPolling(candidate.id, candidateData, coalitionSoA);
```

### Key Functions

#### `calculateElectoralCollegeResults(candidates, activeCampaign, countryData)`
Main function that calculates the entire electoral college outcome.

#### `getElectoralVotes(stateId)`
Returns the number of electoral votes for a specific state.

#### `canSplitElectoralVotes(stateId)`  
Checks if a state can split electoral votes (currently Maine and Nebraska).

### Electoral Vote Distribution

Total: **538 electoral votes**
- Needed to win: **270 electoral votes**
- Based on 2020 census data
- Includes Washington D.C. (3 votes)

#### Largest States by Electoral Votes:
- California: 54 votes
- Texas: 40 votes  
- Florida: 30 votes
- New York: 28 votes
- Pennsylvania: 19 votes
- Illinois: 19 votes

#### Smallest States:
- Wyoming, Vermont, North Dakota, South Dakota, Delaware, Alaska: 3 votes each
- Several states with 4 votes (Montana, Hawaii, etc.)

### Data Structure

#### Electoral Results Object:
```javascript
{
  candidateElectoralVotes: Map(), // candidateId -> electoral vote count
  stateResults: Map(),           // stateId -> state result object
  totalElectoralVotes: 538,      // Should always be 538 for USA
  winner: { id, electoralVotes}, // Winner object or null
  isTie: false,                  // true if tied/no majority
  summary: {
    totalStates: 50,             // Number of states processed
    statesWon: Map()             // candidateId -> array of states won
  }
}
```

#### State Result Object:
```javascript
{
  stateId: "USA_CA",
  stateName: "California", 
  electoralVotes: 54,
  winner: candidateObject,
  candidatePolling: Map(),      // candidateId -> polling percentage
  margin: 15.2,                 // Victory margin percentage
  isSplitState: false          // true for Maine/Nebraska
}
```

## Integration Points

### Polling System Integration

The electoral college integrates seamlessly with the existing polling system in `pollingSlice.js`:

```javascript
// Automatic detection in polling calculations
const isElectoralCollegeElection = election.electionType?.electoralSystem === "ElectoralCollege";

if (isElectoralCollegeElection) {
  groundTruthPollingMap = calculateElectoralCollegePolling(election, campaignData, politicians);
}
```

### Election Generation Integration

Electoral college candidate generation in `OptimizedElectionGeneration.js`:

```javascript
case "ElectoralCollege":
  return handleOptimizedElectoralCollegeParticipants({
    // Generates presidential candidates with appropriate metadata
  });
```

## Player vs AI Handling

### Player Candidates
- Simplified state polling calculation
- Based on party popularity, attributes, and name recognition
- More predictable for player strategy

### AI Candidates  
- Full coalition-based calculation
- Uses ideology matching and policy stances
- More sophisticated demographic modeling

## Performance Optimizations

### Caching
- State results cached for 10 seconds
- Avoids recalculation during rapid polling updates
- Cache keys include candidate IDs for accuracy

### Coalition Reuse
- Leverages pre-generated coalition systems from campaign setup
- Avoids runtime coalition generation
- Falls back gracefully if coalitions unavailable

## Testing

Use the test functions to verify electoral college functionality:

```javascript
// In browser console
testElectoralCollegeSystem();      // Basic functionality test
testElectoralCollegeScenarios();   // Multiple scenario testing
```

## UI Integration Notes

### Polling Display
- Electoral votes shown alongside traditional polling percentages
- State-by-state breakdown available in results
- Battleground state identification (margin < 10%)

### Election Night
- Real-time state calls as results come in
- Electoral vote running totals
- Path to victory visualization

## Extending the System

### Adding Other Countries
To add electoral college support for other countries:

1. Add electoral vote mapping in `ELECTORAL_VOTES_BY_STATE`
2. Update state ID patterns in calculations
3. Add country-specific logic if needed

### Enhanced Split States
Currently Maine and Nebraska use simplified split logic. To enhance:

1. Add district-level coalition systems
2. Implement district-by-district calculations
3. Update UI to show district-level results

### Congressional District Integration
The system is designed to work with congressional district data when available:

```javascript
// Could be enhanced to use district-level coalitions
coalitionSystems[`congressional_district_${districtId}`]
```

## Common Issues

### Missing Coalition Systems
- System falls back to party popularity calculations
- Warning logged to console
- Still produces reasonable results

### Performance with Many Candidates
- System optimized for 2-5 presidential candidates
- Polling normalization handles any number
- Consider candidate filtering for performance

### State Data Consistency
- Ensure all states have `politicalLandscape` data
- Electoral vote totals should sum to expected amount
- Regional coalition systems should match state IDs

## Future Enhancements

1. **Enhanced Split State Logic**: Full district-level calculation for ME/NE
2. **Swing State Prediction**: Machine learning for battleground identification  
3. **Electoral Vote Animation**: Smooth UI transitions for election night
4. **Historical Simulation**: Replay past elections with current system
5. **Coalition Refinement**: More sophisticated demographic modeling per state