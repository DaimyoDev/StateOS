// ui-src/src/data/australianElections.js

import {
  nationalElectionIds,
  stateElectionIds,
  localElectionIds,
} from "./electionData"; // Universal IDs

export const australianElections = [
  // --- National Level (Federal) ---
  {
    id: nationalElectionIds.national_hr, // House of Representatives
    officeNameTemplate: "Member of Parliament - ({districtName})",
    level: "national_lower_house_constituency",
    frequencyYears: 3, // Maximum 3 years, but can be dissolved earlier
    electionMonth: null, // Not fixed, usually held on a Saturday
    generatesOneWinner: true,
    minCouncilSeats: 1, // Single-member electorates
    electoralSystem: "SNTV_MMD", // Also known as Instant Runoff Voting (IRV) or Alternative Vote (AV)
    voteTarget: "candidate",
  },
  {
    id: nationalElectionIds.national_senate, // Senate
    officeNameTemplate: "Senator - ({stateName})", // State/Territory is the constituency
    level: "national_upper_house_constituency", // Represents the multi-member state/territory area
    frequencyYears: 3, // Half-Senate elections every 3 years; Territory senators align with House of Representatives elections (up to 3 years)
    electionMonth: null, // Not fixed, usually held on a Saturday
    generatesOneWinner: false, // Multi-member elections
    minCouncilSeats: 2, // Minimum 2 for territories, 6 for half-state elections
    electoralSystem: "MMP", // Single Transferable Vote
    voteTarget: "party_or_candidate", // Voters can vote 'above the line' for parties or 'below the line' for individual candidates
  },

  // --- State/Territory Level ---
  {
    id: stateElectionIds.governor, // Used for Premier/Chief Minister
    officeNameTemplate: "Premier/Chief Minister of {stateName}",
    level: "local_state", // Represents the state/territory level head of government
    frequencyYears: 4, // Generally fixed 4-year terms in most states/territories
    electionMonth: null, // Varies by state/territory
    generatesOneWinner: true,
    electoralSystem: "FPTP", // Leader of the party that wins majority in lower house
    voteTarget: "candidate",
  },
  {
    id: stateElectionIds.state_hr, // Used for State/Territory Lower House (e.g., Legislative Assembly, House of Assembly)
    officeNameTemplate: "Member of {chamberName} - ({districtName})",
    level: "local_state_lower_house",
    frequencyYears: 4, // Generally fixed 4-year terms
    electionMonth: null, // Varies by state/territory
    generatesOneWinner: true,
    minCouncilSeats: 1, // Single-member districts
    electoralSystem: "SNTV_MMD",
    voteTarget: "candidate",
  },
  {
    id: stateElectionIds.state_senate, // Used for State Upper House (Legislative Council) where applicable
    officeNameTemplate: "Member of Legislative Council - ({stateName})",
    level: "local_state_upper_house",
    frequencyYears: 4, // Elections usually concurrent with lower house, or half elected every 4 years
    electionMonth: null, // Varies by state/territory
    generatesOneWinner: false, // Multi-member regions, proportional representation
    minCouncilSeats: 5, // Varies (e.g., Victoria has 5 members per region), but typically multiple members per region/state
    electoralSystem: "SNTV_MMD",
    voteTarget: "party_or_candidate",
  },

  // --- Local Level (Municipal) ---
  {
    id: localElectionIds.mayor,
    officeNameTemplate: "Mayor of {cityName}",
    level: "local_city",
    frequencyYears: 4, // Common frequency for local government elections
    electionMonth: null, // Varies by state and council (e.g., September in NSW, October in WA/Victoria)
    generatesOneWinner: true, // For popularly elected mayors
    electoralSystem: "FPTP", // Often preferential, but can be FPTP
    voteTarget: "candidate",
  },
  {
    id: localElectionIds.city_council,
    officeNameTemplate: "Councillor - {cityName} ({districtNameOrAtLarge})",
    level: "local_city_council",
    frequencyYears: 4, // Common frequency for local government elections
    electionMonth: null, // Varies by state and council
    generatesOneWinner: false, // Multiple councillors per area/ward
    minCouncilSeats: 5, // Common minimum number of councillors
    electoralSystem: "SNTV_MMD", // Can vary (e.g., Proportional Representation in SA, FPTP for individual wards/districts), using a common one
    voteTarget: "candidate",
  },
];
