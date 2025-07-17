// ui-src/src/data/elections/frenchElections.js

import {
  nationalElectionIds,
  stateElectionIds, // Used for Regional/Departmental in France's context
  localElectionIds, // Used for Municipal
} from "./electionData"; // Universal IDs

export const frenchElections = [
  // --- National Level ---
  {
    id: nationalElectionIds.president, // Assuming 'president' ID exists or is implied
    officeNameTemplate: "President of France",
    level: "national_head_of_state",
    frequencyYears: 5, // President serves a 5-year term
    electionMonth: 4, // First round typically in April, second in May
    generatesOneWinner: true,
    electoralSystem: "Two Round System", // Elected by direct popular vote using a two-round system
    voteTarget: "candidate",
  },
  {
    id: nationalElectionIds.national_hr, // National Assembly (Assemblée Nationale)
    officeNameTemplate: "Member of the National Assembly - ({districtName})",
    level: "national_lower_house_constituency",
    frequencyYears: 5, // Members (députés) serve 5-year terms
    electionMonth: 6, // Elections typically held in June
    generatesOneWinner: true,
    minCouncilSeats: 1, // Elected in single-member constituencies
    electoralSystem: "Two Round System", // Uses a two-round majority system
    voteTarget: "candidate",
  },

  // --- Regional Level (Conseils régionaux) ---
  {
    id: stateElectionIds.state_senate, // Custom ID for Regional Council
    officeNameTemplate: "Regional Councillor - ({stateName})",
    level: "local_state_council", // Using 'local_state' as a proxy for region
    frequencyYears: 6, // Regional councillors serve 6-year terms
    electionMonth: 6, // Elections typically held in June
    generatesOneWinner: false, // Multiple members per region
    minCouncilSeats: 20, // Placeholder, as the number of seats varies significantly by region and population
    electoralSystem: "MMP", // Uses a two-round mixed system with proportional representation
    voteTarget: "party_or_candidate", // List-based system
  },

  // --- Departmental Level (Conseils départementaux) ---
  {
    id: stateElectionIds.state_hr, // Custom ID for Departmental Council
    officeNameTemplate: "Departmental Councillor - ({stateName})", // District is the Canton
    level: "local_state_council", // Using 'local_county' for department
    frequencyYears: 6, // Departmental councillors serve 6-year terms
    electionMonth: 6, // Elections typically held in June
    generatesOneWinner: false, // Two winners per canton
    minCouncilSeats: 2, // Always two winners per canton
    electoralSystem: "MMP", // Uses a two-round majority system for pairs of candidates
    voteTarget: "candidate", // Pairs of candidates
  },

  // --- Municipal Level (Conseils municipaux, for municipalities > 1,000 inhabitants) ---
  {
    id: localElectionIds.city_council,
    officeNameTemplate:
      "Municipal Councillor - {cityName} ({districtNameOrAtLarge})",
    level: "local_city_council",
    frequencyYears: 6, // Municipal councillors serve 6-year terms
    electionMonth: 3, // Elections typically held in March
    generatesOneWinner: false, // Multiple councillors
    minCouncilSeats: 5, // Placeholder, as the number of seats varies by municipality population
    electoralSystem: "SNTV_MMD", // Uses a two-round proportional system with a majority bonus for larger municipalities
    voteTarget: "party_or_candidate", // List-based system
  },
];
