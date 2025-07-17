// ui-src/src/data/elections/greatBritainElections.js
import { nationalElectionIds, localElectionIds } from "./electionData";

export const greatBritainElections = [
  {
    id: nationalElectionIds.national_hr,
    officeNameTemplate: "U.K. Representative - {districtName}",
    level: "national_lower_house_constituency",
    frequencyYears: 5,
    electionMonth: 5,
    generatesOneWinner: true,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    minCouncilSeats: 1,
    councilSeatPopulationTiers: null,
  },
  // --- Local Level (England, Scotland, Wales) ---
  // English & Welsh Local Councillors (most common system)
  {
    id: localElectionIds.city_council,
    officeNameTemplate: "Local Councillor - {cityName} ({districtName})", // Can be city/district/county council
    level: "local_city", // Generic local level
    frequencyYears: 4, // Varies: all out every 4 years, or by halves/thirds
    electionMonth: 5, // Usually first Thursday in May
    generatesOneWinner: true, // Often one councillor per ward in FPTP
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    minCouncilSeats: 1,
    councilSeatPopulationTiers: null,
  },
  // English Local Mayors (Directly elected mayors)
  {
    id: localElectionIds.mayor,
    officeNameTemplate: "Mayor of {cityName}",
    level: "local_city",
    frequencyYears: 4,
    electionMonth: 5, // Usually first Thursday in May
    generatesOneWinner: true,
    electoralSystem: "FPTP", // Changed from SV to FPTP by Elections Act 2022
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    minCouncilSeats: null,
    councilSeatPopulationTiers: null,
  },
];
