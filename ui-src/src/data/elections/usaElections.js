export const usaElections = [
  {
    id: "mayor_usa",
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
    id: "city_council_usa",
    officeNameTemplate: "City Council Member - {cityName} (At-Large)", // District or At-Large
    level: "local_city",
    frequencyYears: 4, // Common, can be 2
    electionMonth: 11, // Or other months
    generatesOneWinner: false, // Usually multiple seats, could be per district
    // Electoral system varies: FPTP by district, BlockVote At-Large, etc.
    // Using "PluralityMMD" as a general term for districted/at-large multi-seat systems without PR
    electoralSystem: "PluralityMMD", // Or "BlockVote" for at-large, or FPTP if defining per-district type
    voteTarget: "candidate",
    minCouncilSeats: 5, // Example
    councilSeatPopulationTiers: [
      // Highly illustrative, city charters rule
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
    id: "state_governor_usa",
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
    id: "state_lower_house_member_usa", // e.g., State House of Representatives, Assembly
    officeNameTemplate: "State Representative - {stateName} ({districtName})",
    level: "local_state_lower_house",
    frequencyYears: 2, // Most common
    electionMonth: 11,
    generatesOneWinner: true, // This defines election for ONE seat/district
    minCouncilSeats: 1, // Fixed number of districts per state by law
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
    id: "state_upper_house_member_usa", // e.g., State Senate
    officeNameTemplate: "State Senator - {stateName} ({districtName})",
    level: "local_state_upper_house",
    frequencyYears: 4, // Most common (often staggered terms)
    electionMonth: 11,
    generatesOneWinner: true, // This defines election for ONE seat/district
    minCouncilSeats: 1, // Fixed number of districts per state by law
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
    id: "national_president_usa",
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
    id: "national_hr_usa", // House of Representatives
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
    id: "national_senate_usa",
    officeNameTemplate: "U.S. Senator - {stateName}",
    level: "national_upper_house_state_rep",
    frequencyYears: 6, // Staggered terms, so 1/3 elected every 2 years. This 'frequency' is for the term.
    electionMonth: 11, // Elections every 2 years for available seats
    generatesOneWinner: true, // Defines election for ONE of the two state seats up in a cycle
    minCouncilSeats: 1, // Each state has 2 senators; usually 1 up for election at a time per state (or 0 or 2 in special cases)
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
