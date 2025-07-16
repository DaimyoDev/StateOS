export const chamberTiers = {
  JPN: {
    NATIONIAL: {
      JPN_HOC_SEAT_ALLOCATION_TIERS: [
        { popThreshold: 10000000, seatsRange: [4, 6] },
        { popThreshold: 6000000, seatsRange: [3, 5] },
        { popThreshold: 3000000, seatsRange: [2, 4] },
        { popThreshold: 1500000, seatsRange: [1, 3] },
        { popThreshold: 0, seatsRange: [1, 2] },
      ],
      JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS: [
        { popThreshold: 10000000, numDistrictsRange: [15, 25] },
        { popThreshold: 5000000, numDistrictsRange: [8, 15] },
        { popThreshold: 2000000, numDistrictsRange: [3, 7] },
        { popThreshold: 1000000, numDistrictsRange: [2, 4] },
        { popThreshold: 0, numDistrictsRange: [1, 2] },
      ],
    },
    STATE: {},
    LOCAL: {},
  },
  USA: {
    NATIONAL: {
      USA_CONGRESSIONAL_DISTRICT_TIERS: [
        { popThreshold: 30000000, numDistrictsRange: [35, 53] },
        { popThreshold: 20000000, numDistrictsRange: [20, 38] },
        { popThreshold: 10000000, numDistrictsRange: [10, 20] },
        { popThreshold: 5000000, numDistrictsRange: [5, 10] },
        { popThreshold: 2000000, numDistrictsRange: [2, 5] },
        { popThreshold: 0, numDistrictsRange: [1, 2] },
      ],
    },
    STATE: {
      USA_STATE_LOWER_HOUSE_DISTRICT_TIERS: [
        { popThreshold: 20000000, numDistrictsRange: [100, 150] },
        { popThreshold: 10000000, numDistrictsRange: [60, 120] },
        { popThreshold: 5000000, numDistrictsRange: [40, 80] },
        { popThreshold: 2000000, numDistrictsRange: [20, 50] },
        { popThreshold: 0, numDistrictsRange: [10, 30] },
      ],
      USA_STATE_UPPER_HOUSE_DISTRICT_TIERS: [
        { popThreshold: 20000000, numDistrictsRange: [40, 60] },
        { popThreshold: 10000000, numDistrictsRange: [30, 50] },
        { popThreshold: 5000000, numDistrictsRange: [20, 40] },
        { popThreshold: 1000000, numDistrictsRange: [10, 25] },
        { popThreshold: 0, numDistrictsRange: [5, 15] },
      ],
    },
    LOCAL: {},
  },
  PHL: {
    NATIONAL: {
      PHL_HR_DISTRICTS_PER_PROVINCE_TIERS: [
        { popThreshold: 4000000, numDistrictsRange: [4, 7] },
        { popThreshold: 2000000, numDistrictsRange: [2, 5] },
        { popThreshold: 1000000, numDistrictsRange: [1, 3] },
        { popThreshold: 0, numDistrictsRange: [1, 1] },
      ],
    },
    STATE: {
      PHL_PROVINCIAL_BOARD_DISTRICT_TIERS: [
        { popThreshold: 4000000, numDistrictsRange: [3, 5] },
        { popThreshold: 2000000, numDistrictsRange: [2, 4] },
        { popThreshold: 1000000, numDistrictsRange: [2, 3] },
        { popThreshold: 500000, numDistrictsRange: [1, 2] },
        { popThreshold: 0, numDistrictsRange: [1, 1] },
      ],
      PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE: [1, 4],
    },
  },
  KOR: {
    NATIONAL: {
      KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS: [
        { popThreshold: 10000000, numDistrictsRange: [45, 60] },
        { popThreshold: 3000000, numDistrictsRange: [14, 20] },
        { popThreshold: 2000000, numDistrictsRange: [10, 13] },
        { popThreshold: 1000000, numDistrictsRange: [6, 9] },
        { popThreshold: 0, numDistrictsRange: [2, 5] },
      ],
    },
    STATE: {
      KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS: [
        { popThreshold: 10000000, numDistrictsRange: [30, 70] },
        { popThreshold: 3000000, numDistrictsRange: [15, 30] },
        { popThreshold: 1000000, numDistrictsRange: [8, 15] },
        { popThreshold: 0, numDistrictsRange: [3, 7] },
      ],
    },
    LOCAL: {
      KOR_LOCAL_BASIC_COUNCIL_TIERS: [
        { popThreshold: 500000, numDistrictsRange: [15, 30] },
        { popThreshold: 200000, numDistrictsRange: [8, 15] },
        { popThreshold: 50000, numDistrictsRange: [4, 8] },
        { popThreshold: 0, numDistrictsRange: [2, 4] },
      ],
    },
  },
  CAN: {
    NATIONAL: {
      CAN_FEDERAL_HR_DISTRICT_TIERS: [
        { popThreshold: 5000000, numDistrictsRange: [50, 80] },
        { popThreshold: 1000000, numDistrictsRange: [10, 25] },
        { popThreshold: 0, numDistrictsRange: [1, 5] },
      ],
    },
    STATE: {
      CAN_PROVINCIAL_ASSEMBLY_TIERS: [
        { popThreshold: 10000000, numDistrictsRange: [100, 120] },
        { popThreshold: 5000000, numDistrictsRange: [60, 90] },
        { popThreshold: 1000000, numDistrictsRange: [20, 50] },
        { popThreshold: 0, numDistrictsRange: [10, 20] },
      ],
    },
  },
};
