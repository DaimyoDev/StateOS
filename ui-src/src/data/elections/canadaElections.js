// ui-src/src/data/canadaElections.js

import {
  nationalElectionIds,
  stateElectionIds,
  localElectionIds,
} from "./electionData"; // Universal IDs

export const canadaElections = [
  // --- National Level (Federal) ---
  {
    id: nationalElectionIds.national_hr, // House of Commons
    officeNameTemplate: "Member of Parliament - ({districtName})", // MPs are elected from constituencies
    level: "national_lower_house_constituency",
    frequencyYears: 4, // Up to 5, but typically 4
    electionMonth: 10, // October
    generatesOneWinner: true,
    minCouncilSeats: 1,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    // ... other nulls
  },
  // Note: Canada has an appointed Senate, so no 'national_senate' election.
  // There is also no directly elected President or Prime Minister.
  // The Prime Minister is the leader of the party that wins the most seats in the House of Commons.

  // --- Provincial Level ---
  {
    id: stateElectionIds.governor, // Provincial Premier (equivalent to governor for simulation)
    officeNameTemplate: "Premier of {stateName}",
    level: "local_state", // Or local_province
    frequencyYears: 4, // Varies, but common
    electionMonth: null, // Varies
    generatesOneWinner: true,
    electoralSystem: "FPTP", // Premier is leader of winning party in provincial legislature
    voteTarget: "candidate",
    // ... other nulls
  },
  {
    id: stateElectionIds.state_hr, // Provincial Legislative Assembly (or House of Assembly)
    officeNameTemplate: "Member of Provincial Parliament - ({districtName})", // Ontario example
    level: "local_state_lower_house", // Or local_province_legislature
    frequencyYears: 4,
    electionMonth: null, // Varies
    generatesOneWinner: true,
    minCouncilSeats: 1,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    // ... other nulls
  },

  // --- Local Level (Municipal) ---
  {
    id: localElectionIds.mayor,
    officeNameTemplate: "Mayor of {cityName}",
    level: "local_city",
    frequencyYears: 4, // Common
    electionMonth: 10, // Often October
    generatesOneWinner: true,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    // ... other nulls
  },
  {
    id: localElectionIds.city_council,
    officeNameTemplate:
      "City Councillor - {cityName} ({districtNameOrAtLarge})", // Many are districted
    level: "local_city_council",
    frequencyYears: 4,
    electionMonth: 10,
    generatesOneWinner: false,
    minCouncilSeats: 5,
    electoralSystem: "FPTP", // Many are FPTP for individual districts
    voteTarget: "candidate",
    councilSeatPopulationTiers: [
      { popThreshold: 50000, extraSeatsRange: [0, 2] },
      { popThreshold: 250000, extraSeatsRange: [2, 6] },
    ],
  },
];
