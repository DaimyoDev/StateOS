export const koreanElections = [
  {
    id: "president",
    officeNameTemplate: "President of South Korea",
    level: "national_head_of_state",
    frequencyYears: 5,
    electionMonth: null, // Often March, but null for general flexibility
    generatesOneWinner: true,
    minCouncilSeats: null,
    councilSeatPopulationTiers: null,
    electoralSystem: "FPTP", // Simple plurality
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  {
    id: "national_assembly_constituency",
    officeNameTemplate:
      "Member of National Assembly (Constituency - {districtName})",
    level: "national_lower_house_constituency",
    frequencyYears: 4,
    electionMonth: null, // Often April, but null for general flexibility
    generatesOneWinner: true,
    minCouncilSeats: 1, // Each constituency elects one member
    councilSeatPopulationTiers: null,
    electoralSystem: "FPTP", // First-past-the-post for constituencies
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  {
    id: "national_assembly_pr",
    officeNameTemplate:
      "Member of National Assembly (Proportional Representation)",
    level: "national_lower_house_pr_national",
    frequencyYears: 4,
    electionMonth: null, // Same as constituency elections
    generatesOneWinner: false,
    minCouncilSeats: 47, // Number of PR seats
    councilSeatPopulationTiers: null,
    electoralSystem: "PartyListPR",
    voteTarget: "party",
    partyListType: "closed",
    prThresholdPercent: 3, // 3% of total valid votes or 5 constituency seats
    prAllocationMethod: "LargestRemainder", // A common PR allocation method
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
  },
  {
    id: "governor_mayor_province",
    officeNameTemplate: "Governor/Mayor of {provinceCityName}",
    level: "local_province_metropolitan_city",
    frequencyYears: 4,
    electionMonth: null, // Often June, but null for general flexibility
    generatesOneWinner: true,
    minCouncilSeats: null,
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
    id: "provincial_metropolitan_assembly",
    officeNameTemplate: "Member of {provinceCityName} Assembly",
    level: "local_province_metropolitan_city",
    frequencyYears: 4,
    electionMonth: null, // Same as governor elections
    generatesOneWinner: false,
    minCouncilSeats: 10, // Base minimum seats
    electoralSystem: "SNTV_MMD", // Single Non-Transferable Vote in Multi-Member Districts (common for local assemblies)
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    councilSeatPopulationTiers: [
      { popThreshold: 500000, extraSeatsRange: [0, 15] },
      { popThreshold: 1000000, extraSeatsRange: [16, 30] },
      { popThreshold: 3000000, extraSeatsRange: [31, 50] },
      { popThreshold: 5000000, extraSeatsRange: [51, 80] },
      { popThreshold: Infinity, extraSeatsRange: [81, 100] },
    ],
  },
  {
    id: "mayor_chief_local",
    officeNameTemplate: "Mayor/Chief of {cityName}",
    level: "local_city_county_district",
    frequencyYears: 4,
    electionMonth: null, // Often June, but null for general flexibility
    generatesOneWinner: true,
    minCouncilSeats: null,
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
    id: "local_basic_council",
    officeNameTemplate: "Member of {cityName} Council",
    level: "local_city_county_district",
    frequencyYears: 4,
    electionMonth: null, // Same as local mayor elections
    generatesOneWinner: false,
    minCouncilSeats: 5, // Base minimum seats
    electoralSystem: "SNTV_MMD", // Single Non-Transferable Vote in Multi-Member Districts (common for local assemblies)
    voteTarget: "candidate",
    partyListType: null,
    prThresholdPercent: null,
    prAllocationMethod: null,
    mmpConstituencySeatsRatio: null,
    mmpListSeatsRatio: null,
    councilSeatPopulationTiers: [
      { popThreshold: 50000, extraSeatsRange: [0, 10] },
      { popThreshold: 100000, extraSeatsRange: [11, 20] },
      { popThreshold: 250000, extraSeatsRange: [21, 35] },
      { popThreshold: 500000, extraSeatsRange: [36, 50] },
      { popThreshold: Infinity, extraSeatsRange: [51, 70] },
    ],
  },
];
