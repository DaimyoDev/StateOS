export const GOVERNMENT_TYPES = {
  PRESIDENTIAL_REPUBLIC: {
    id: "PRESIDENTIAL_REPUBLIC",
    name: "Presidential Republic",
    description:
      "A system with a directly elected president serving as head of state and government, separate from the legislature.",
    executive: {
      hasPresident: true,
      hasVicePresident: true,
      electionTypeIds: ["national_president", "national_vice_president"],
    },
    legislative: {
      chambers: [
        {
          id: "lower_house",
          name: "House of Representatives",
          isDirectlyElected: true,
          districtsRequired: true,
          electoralSystem: "FPTP",
          electionTypeId: "national_lower_house_constituency",
        },
        {
          id: "upper_house",
          name: "Senate",
          isDirectlyElected: true,
          districtsRequired: true,
          electoralSystem: "FPTP",
          electionTypeId: "national_upper_house_state_rep",
        },
      ],
      nationalLegislativeElectionTypeIds: [
        "national_hr_usa",
        "national_senate_usa",
      ],
    },
    subnationalGovernment: {
      hasElectedExecutive: true,
      executiveElectionTypeIds: ["state_governor"],
      hasElectedLegislature: true,
      legislativeStructure: {
        lowerHouseDistricts: true,
        upperHouseDistricts: true,
      },
      defaultSubnationalLegislativeElectoralSystem: "FPTP",
      subnationalLegislativeElectionTypeIds: [
        "state_legislature_lower",
        "state_legislature_upper",
      ],
    },
    localGovernment: {
      hasElectedMayor: true,
      mayorElectionTypeIds: ["local_mayor"],
      hasElectedCouncil: true,
      councilElectionTypeIds: ["local_city_council"],
      defaultCouncilElectoralSystem: "PluralityMMD",
      councilDistrictStyle: "at_large_or_districted",
    },
  },
};
