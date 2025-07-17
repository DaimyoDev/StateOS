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
  },
  {
    id: stateElectionIds.governor,
    officeNameTemplate: "Premier of {stateName}",
    level: "local_state",
    frequencyYears: 4,
    electionMonth: null,
    generatesOneWinner: true,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
  },
  {
    id: stateElectionIds.state_hr,
    officeNameTemplate: "Member of Provincial Parliament - ({districtName})",
    level: "local_state_lower_house",
    frequencyYears: 4,
    electionMonth: null,
    generatesOneWinner: true,
    minCouncilSeats: 1,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
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
