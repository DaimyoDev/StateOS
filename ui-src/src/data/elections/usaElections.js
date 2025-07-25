import {
  nationalElectionIds,
  stateElectionIds,
  localElectionIds,
} from "./electionData";

export const usaElections = [
  {
    id: localElectionIds.mayor,
    officeNameTemplate: "Mayor of {cityName}",
    level: "local_city",
    frequencyYears: 4, // Common, but can be 2
    electionMonth: 11, // Often November, can vary (e.g., March, April)
    generatesOneWinner: true,
    electoralSystem: "FPTP", // Or TwoRoundSystem in some cities
    voteTarget: "candidate",
    // Fill in other nulls for consistency
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    minCouncilSeats: null,
    councilSeatPopulationTiers: null,
  },
  {
    id: localElectionIds.city_council,
    officeNameTemplate: "City Council Member - {cityName} (At-Large)", // District or At-Large
    level: "local_city",
    frequencyYears: 4,
    electionMonth: 11,
    generatesOneWinner: false,
    electoralSystem: "SNTV_MMD",
    voteTarget: "candidate",
    minCouncilSeats: 5,
    councilSeatPopulationTiers: [
      { popThreshold: 50000, extraSeatsRange: [0, 2] },
      { popThreshold: 250000, extraSeatsRange: [2, 6] },
      { popThreshold: 1000000, extraSeatsRange: [5, 10] },
      { popThreshold: Infinity, extraSeatsRange: [8, 12] },
    ],
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  // --- State Level ---
  {
    id: stateElectionIds.governor,
    officeNameTemplate: "Governor of {stateName}",
    level: "local_state",
    frequencyYears: 4, // Most common
    electionMonth: 11,
    generatesOneWinner: true,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    minCouncilSeats: null,
    councilSeatPopulationTiers: null,
  },
  {
    id: stateElectionIds.state_hr,
    officeNameTemplate: "State Representative - {stateName} ({districtName})",
    level: "local_state_lower_house",
    frequencyYears: 2,
    electionMonth: 11,
    generatesOneWinner: true,
    minCouncilSeats: 1,
    councilSeatPopulationTiers: null,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  {
    id: stateElectionIds.state_senate,
    officeNameTemplate: "State Senator - {stateName} ({districtName})",
    level: "local_state_upper_house",
    frequencyYears: 4,
    electionMonth: 11,
    generatesOneWinner: true,
    minCouncilSeats: 1,
    councilSeatPopulationTiers: null,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  // --- National Level ---
  {
    id: nationalElectionIds.president,
    officeNameTemplate: "President of the United States",
    level: "national_head_of_state_and_government",
    frequencyYears: 4,
    electionMonth: 11,
    generatesOneWinner: true,
    electoralSystem: "ElectoralCollege", // Game logic would need to simulate this
    voteTarget: "candidate_via_electors", // Or simply "candidate" if abstracting elector selection
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    minCouncilSeats: null,
    councilSeatPopulationTiers: null,
  },
  {
    id: nationalElectionIds.national_hr, // House of Representatives
    officeNameTemplate: "U.S. Representative - {stateName} ({districtName})",
    level: "national_lower_house_constituency",
    frequencyYears: 2,
    electionMonth: 11,
    generatesOneWinner: true, // This defines election for ONE seat/district (435 total)
    minCouncilSeats: 1,
    councilSeatPopulationTiers: null,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  {
    id: nationalElectionIds.national_senate,
    officeNameTemplate: "U.S. Senator - {stateName}",
    level: "national_upper_house_state_rep",
    frequencyYears: 6,
    electionMonth: 11,
    generatesOneWinner: true,
    minCouncilSeats: 1,
    councilSeatPopulationTiers: null,
    electoralSystem: "FPTP",
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
];
