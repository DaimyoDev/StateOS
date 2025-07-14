import { assignNestedPopulations } from "../utils/populationUtils";
import { generateFullStateData } from "../utils/stateUtils";
import { japanPrefectures } from "./states/japanPrefectures";
import { usaStates } from "./states/usaStates";
import { germanStates } from "./states/germanStates";
import {
  philippinesProvinces,
  philippinesRegions,
} from "./states/philippinesRegions";
import { koreaAdministrativeDivisions } from "./states/koreanDistricts";

export const DEFAULT_COUNTRY_POPULATION_RANGES = {
  JPN: { min: 100000000, max: 130000000 },
  USA: { min: 280000000, max: 380000000 },
  GER: { min: 75000000, max: 90000000 },
  PHL: { min: 90000000, max: 140000000 },
  KOR: { min: 48000000, max: 55000000 },
};

export const JPN_HOC_SEAT_ALLOCATION_TIERS = [
  { popThreshold: 10000000, seatsRange: [4, 6] },
  { popThreshold: 6000000, seatsRange: [3, 5] },
  { popThreshold: 3000000, seatsRange: [2, 4] },
  { popThreshold: 1500000, seatsRange: [1, 3] },
  { popThreshold: 0, seatsRange: [1, 2] },
];

export const JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS = [
  { popThreshold: 10000000, numDistrictsRange: [15, 25] },
  { popThreshold: 5000000, numDistrictsRange: [8, 15] },
  { popThreshold: 2000000, numDistrictsRange: [3, 7] },
  { popThreshold: 1000000, numDistrictsRange: [2, 4] },
  { popThreshold: 0, numDistrictsRange: [1, 2] },
];

export const USA_STATE_LOWER_HOUSE_DISTRICT_TIERS = [
  { popThreshold: 20000000, numDistrictsRange: [100, 150] },
  { popThreshold: 10000000, numDistrictsRange: [60, 120] },
  { popThreshold: 5000000, numDistrictsRange: [40, 80] },
  { popThreshold: 2000000, numDistrictsRange: [20, 50] },
  { popThreshold: 0, numDistrictsRange: [10, 30] },
];

export const USA_STATE_UPPER_HOUSE_DISTRICT_TIERS = [
  { popThreshold: 20000000, numDistrictsRange: [40, 60] },
  { popThreshold: 10000000, numDistrictsRange: [30, 50] },
  { popThreshold: 5000000, numDistrictsRange: [20, 40] },
  { popThreshold: 1000000, numDistrictsRange: [10, 25] },
  { popThreshold: 0, numDistrictsRange: [5, 15] },
];

export const USA_CONGRESSIONAL_DISTRICT_TIERS = [
  { popThreshold: 30000000, numDistrictsRange: [35, 53] },
  { popThreshold: 20000000, numDistrictsRange: [20, 38] },
  { popThreshold: 10000000, numDistrictsRange: [10, 20] },
  { popThreshold: 5000000, numDistrictsRange: [5, 10] },
  { popThreshold: 2000000, numDistrictsRange: [2, 5] },
  { popThreshold: 0, numDistrictsRange: [1, 2] },
];

export const PHL_PROVINCIAL_BOARD_DISTRICT_TIERS = [
  { popThreshold: 4000000, numDistrictsRange: [3, 5] },
  { popThreshold: 2000000, numDistrictsRange: [2, 4] },
  { popThreshold: 1000000, numDistrictsRange: [2, 3] },
  { popThreshold: 500000, numDistrictsRange: [1, 2] },
  { popThreshold: 0, numDistrictsRange: [1, 1] },
];

export const PHL_HR_DISTRICTS_PER_PROVINCE_TIERS = [
  { popThreshold: 4000000, numDistrictsRange: [4, 7] },
  { popThreshold: 2000000, numDistrictsRange: [2, 5] },
  { popThreshold: 1000000, numDistrictsRange: [1, 3] },
  { popThreshold: 0, numDistrictsRange: [1, 1] },
];

export const PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE = [1, 4];

export const KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS = [
  { popThreshold: 10000000, numDistrictsRange: [45, 60] }, // e.g., Gyeonggi, Seoul
  { popThreshold: 3000000, numDistrictsRange: [14, 20] }, // e.g., Busan, Incheon, S. Gyeongsang
  { popThreshold: 2000000, numDistrictsRange: [10, 13] }, // e.g., N. Gyeongsang, S. Chungcheong
  { popThreshold: 1000000, numDistrictsRange: [6, 9] }, // e.g., N./S. Jeolla, Gangwon, N. Chungcheong, Daejeon, Ulsan, Gwangju
  { popThreshold: 0, numDistrictsRange: [2, 5] }, // e.g., Jeju, Sejong
];

// Tiers for South Korea's Provincial/Metropolitan Assembly Electoral Districts
export const KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS = [
  { popThreshold: 10000000, numDistrictsRange: [30, 70] }, // Very large metropolitan cities/provinces (Seoul, Gyeonggi)
  { popThreshold: 3000000, numDistrictsRange: [15, 30] }, // Large metropolitan cities/provinces (Busan, Incheon)
  { popThreshold: 1000000, numDistrictsRange: [8, 15] }, // Medium provinces/metropolitan cities
  { popThreshold: 0, numDistrictsRange: [3, 7] }, // Smaller provinces/metropolitan cities
];

// Tiers for South Korea's Local Basic Council (City/County/District) Electoral Districts
export const KOR_LOCAL_BASIC_COUNCIL_TIERS = [
  { popThreshold: 500000, numDistrictsRange: [15, 30] }, // Large cities/districts
  { popThreshold: 200000, numDistrictsRange: [8, 15] }, // Medium cities/districts
  { popThreshold: 50000, numDistrictsRange: [4, 8] }, // Smaller cities/counties
  { popThreshold: 0, numDistrictsRange: [2, 4] }, // Very small counties/districts
];

const baseCountriesData = [
  {
    id: "JPN",
    name: "Japan",
    flag: "🇯🇵",
    dominantIdeologies: ["Conservative", "Social Liberal", "Nationalist"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: japanPrefectures.map((r) => ({ ...r })),
    nationalLowerHouseDistricts: [],
    nationalPrBlocs: [],
  },
  {
    id: "USA",
    name: "United States of America",
    flag: "🇺🇸",
    dominantIdeologies: [
      "Conservative",
      "Liberal",
      "Libertarian",
      "Progressive",
    ],
    politicalSystem: "Presidential Republic",
    regions: usaStates.map((r) => ({ ...r })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "GER",
    name: "Germany",
    flag: "🇩🇪",
    dominantIdeologies: ["Social Democrat", "Christian Democrat", "Green"],
    politicalSystem: "Parliamentary Republic",
    regions: germanStates.map((r) => ({ ...r })),
  },
  {
    id: "PHL",
    name: "Philippines",
    flag: "🇵🇭",
    dominantIdeologies: [
      "Nationalism",
      "Populism",
      "Liberalism",
      "Conservatism",
    ],
    politicalSystem: "Presidential Republic",
    regions: philippinesRegions.map((r) => ({ ...r })),
    provinces: philippinesProvinces.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "KOR",
    name: "South Korea",
    flag: "🇰🇷",
    dominantIdeologies: [
      "Conservative",
      "Liberal",
      "Nationalism",
      "Anti-communism",
      "Progressive",
    ],
    politicalSystem: "Presidential Republic",
    regions: koreaAdministrativeDivisions.map((r) => ({ ...r })),
    nationalLowerHouseDistricts: [],
  },
];

export const COUNTRIES_DATA = assignNestedPopulations(
  baseCountriesData,
  DEFAULT_COUNTRY_POPULATION_RANGES
);

Object.keys(COUNTRIES_DATA).forEach((countryId) => {
  const country = COUNTRIES_DATA[countryId];
  if (country.regions && Array.isArray(country.regions)) {
    country.regions = country.regions.map((staticRegion) => {
      return generateFullStateData({
        name: staticRegion.name,
        countryId: country.id,
        totalPopulation: staticRegion.population,
        id: staticRegion.id,
        legislativeDistricts: staticRegion.legislativeDistricts,
      });
    });
  }
});
