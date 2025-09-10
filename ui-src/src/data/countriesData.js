import {
  generateFullStateData,
  generateFullSecondAdminRegionData,
  generateInitialNationalStats,
} from "../entities/politicalEntities";
import { generateNationalDemographics } from "../entities/economics/economicProfiles";
import { chamberTiers } from "./chamberTiers";
import { getRandomInt, distributeValueProportionally } from "../utils/core";
import { generateLegislativeDistrictsForCountry } from "../entities/districtGeneration";
import { generateNationalParties } from "../entities/personnel";
import {
  DEPARTMENT_LEVELS,
  REGIONAL_DEPARTMENT_VARIATIONS,
} from "./governmentDepartments";
import { japanPrefectures } from "./states/japanPrefectures";
import { usaStates } from "./states/usaStates";
import { usaCounties } from "./states/adminRegions2/usaCounties";
import { germanStates } from "./states/germanStates";
import { australianStates } from "./states/australianStates";
import {
  philippinesProvinces,
  philippinesRegions,
} from "./states/philippinesRegions";
import { koreaAdministrativeDivisions } from "./states/koreanDistricts";
import { canadaProvinces } from "./states/canadaProvinces";
import { frenchRegions } from "./states/frenchRegions";
import { greatBritainAdminRegions } from "./states/greatBritianAdminRegions";
import { italianRegions } from "./states/italianRegions";
import { spanishRegions } from "./states/spanishRegions";
import { swedishCounties } from "./states/swedishCounties";
import { polishVoivodeships } from "./states/polishVoivodeships";
import { brazilianStates } from "./states/brazilianStates";
import { argentinianStates } from "./states/argentinianStates";
import { austrianStates } from "./states/austrianStates";
import { belgianRegions } from "./states/belgianStates";
import { chileanRegions } from "./states/chileStates";
import { colombianDepartments } from "./states/colombianStates";
import { czechRegions } from "./states/czechStates";
import { danishRegions } from "./states/danishStates";

export const DEFAULT_COUNTRY_POPULATION_RANGES = {
  JPN: { min: 100000000, max: 130000000 },
  USA: { min: 280000000, max: 380000000 },
  GER: { min: 75000000, max: 90000000 },
  PHL: { min: 90000000, max: 140000000 },
  KOR: { min: 48000000, max: 55000000 },
  CAN: { min: 30000000, max: 50000000 },
  AUS: { min: 20000000, max: 30000000 },
  FRA: { min: 60000000, max: 70000000 },
  GBR: { min: 60000000, max: 70000000 },
  ITA: { min: 55000000, max: 65000000 },
  ESP: { min: 45000000, max: 50000000 },
  POL: { min: 35000000, max: 40000000 },
  SWE: { min: 9000000, max: 11000000 },
  BRA: { min: 200000000, max: 220000000 },
  ARG: { min: 40000000, max: 50000000 },
  IND: { min: 1300000000, max: 1500000000 },
  MEX: { min: 120000000, max: 140000000 },
  IDN: { min: 270000000, max: 290000000 },
  NLD: { min: 17000000, max: 19000000 },
  CHE: { min: 8000000, max: 9500000 },
  AUT: { min: 8500000, max: 9500000 },
  BEL: { min: 11000000, max: 12000000 },
  DNK: { min: 5500000, max: 6500000 },
  FIN: { min: 5000000, max: 6000000 },
  NOR: { min: 5000000, max: 6000000 },
  IRL: { min: 4500000, max: 5500000 },
  PRT: { min: 9500000, max: 10500000 },
  GRC: { min: 10000000, max: 11000000 },
  NZL: { min: 4800000, max: 5500000 },
  CHL: { min: 18000000, max: 20000000 },
  COL: { min: 50000000, max: 55000000 },
  PER: { min: 32000000, max: 35000000 },
  VNM: { min: 95000000, max: 105000000 },
  MYS: { min: 31000000, max: 35000000 },
  SGP: { min: 5500000, max: 6000000 },
  THA: { min: 68000000, max: 72000000 },
  CZE: { min: 10000000, max: 11000000 },
  ROU: { min: 18000000, max: 20000000 },
  BGR: { min: 6000000, max: 7000000 },
  HRV: { min: 3800000, max: 4200000 },
  SVK: { min: 5000000, max: 5800000 },
  LTU: { min: 2500000, max: 3000000 },
  LVA: { min: 1700000, max: 2000000 },
  EST: { min: 1200000, max: 1400000 },
  SVN: { min: 2000000, max: 2200000 },
  LUX: { min: 600000, max: 700000 },
  ISL: { min: 350000, max: 450000 },
  CRI: { min: 5000000, max: 6000000 },
  URY: { min: 3300000, max: 3800000 },
  MLT: { min: 500000, max: 600000 },
};

const baseCountriesData = [
  {
    id: "JPN",
    name: "Japan",
    flag: "🇯🇵",
    dominantIdeologies: ["Conservative", "Social Liberal", "Nationalist"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: japanPrefectures.map((r) => ({ ...r })),
    regionTerm: "Prefecture",
    nationalLowerHouseDistricts: [],
    nationalPrBlocs: [],
    nationalHrTiers:
      chamberTiers.JPN.NATIONIAL.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS,
    nationalHrName: "House Of Representatives",
    lowerStateHrTiers:
      chamberTiers.JPN.NATIONIAL.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS,
    lowerStateHrName: "Assembly District",
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
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
    regionTerm: "State",
    secondAdminRegions: usaCounties.map((c) => ({ ...c })),
    nationalLowerHouseDistricts: [],
    nationalHrTiers: chamberTiers.USA.NATIONAL.USA_CONGRESSIONAL_DISTRICT_TIERS,
    nationalHrName: "House Of Representatives",
    lowerStateHrTiers:
      chamberTiers.USA.STATE.USA_STATE_LOWER_HOUSE_DISTRICT_TIERS,
    lowerStateHrName: "State House Of Representatives District",
    upperStateHrTiers:
      chamberTiers.USA.STATE.USA_STATE_UPPER_HOUSE_DISTRICT_TIERS,
    upperStateHrName: "State Senate District",
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "CORPORATE_FRIENDLY",
  },
  {
    id: "GER",
    name: "Germany",
    flag: "🇩🇪",
    dominantIdeologies: ["Social Democrat", "Christian Democrat", "Green"],
    politicalSystem: "Parliamentary Republic",
    regions: germanStates.map((r) => ({ ...r })),
    regionTerm: "State",
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "STRICT_LIMITS",
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
    regionTerm: "Region",
    provinces: philippinesProvinces.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    nationalHrTiers:
      chamberTiers.PHL.NATIONAL.PHL_HR_DISTRICTS_PER_PROVINCE_TIERS,
    nationalHrName: "House Of Representatives",
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
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
    regionTerm: "Province",
    nationalLowerHouseDistricts: [],
    nationalHrTiers:
      chamberTiers.KOR.NATIONAL.KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS,
    nationalHrName: "National Assembly",
    lowerStateHrTiers:
      chamberTiers.KOR.STATE.KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS,
    lowerStateHrName: "Assembly District",
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "CAN",
    name: "Canada",
    flag: "🇨🇦",
    politicalSystem: "Parliamentary Monarchy (Federal)",
    dominantIdeologies: ["Liberal", "Conservative", "Social Democrat"],
    regions: canadaProvinces.map((p) => ({ ...p })),
    regionTerm: "Province",
    nationalLowerHouseDistricts: [],
    nationalHrTiers: chamberTiers.CAN.NATIONAL.CAN_FEDERAL_HR_DISTRICT_TIERS,
    nationalHrName: "Parliament District",
    lowerStateHrTiers: chamberTiers.CAN.STATE.CAN_PROVINCIAL_ASSEMBLY_TIERS,
    lowerStateHrName: "Assembly District",
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "STRICT_LIMITS",
  },
  {
    id: "AUS",
    name: "Australia",
    flag: "🇦🇺",
    dominantIdeologies: ["Liberal", "Labor", "Green"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: australianStates.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    nationalHrTiers: chamberTiers.AUS.NATIONAL.AUS_FEDERAL_HR_DISTRICT_TIERS,
    nationalHrName: "Parliament District",
    lowerStateHrTiers: chamberTiers.AUS.STATE.AUS_PROVINCIAL_ASSEMBLY_TIERS,
    lowerStateHrName: "Assembly District",
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "STRICT_LIMITS",
  },
  {
    id: "FRA",
    name: "France",
    flag: "🇫🇷",
    dominantIdeologies: ["Socialist", "Liberal", "Conservative", "Nationalist"],
    politicalSystem: "Semi-Presidential Republic",
    regions: frenchRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "SMALL_DONOR_FOCUS",
  },
  {
    id: "GBR",
    name: "United Kingdom",
    flag: "🇬🇧",
    dominantIdeologies: ["Conservative", "Labour", "Liberal Democrat"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: greatBritainAdminRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "ITA",
    name: "Italy",
    flag: "🇮🇹",
    dominantIdeologies: ["Social Democrat", "Conservative", "Populist"],
    politicalSystem: "Parliamentary Republic",
    regions: italianRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    dominantIdeologies: ["Socialist", "Conservative", "Regionalist"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: spanishRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "SMALL_DONOR_FOCUS",
  },
  {
    id: "POL",
    name: "Poland",
    flag: "🇵🇱",
    dominantIdeologies: ["Conservative", "Liberal", "Nationalist"],
    politicalSystem: "Parliamentary Republic",
    regions: polishVoivodeships.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "SWE",
    name: "Sweden",
    flag: "🇸🇪",
    dominantIdeologies: ["Social Democrat", "Moderate", "Green"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: swedishCounties.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "VERY_STRICT",
  },
  {
    id: "BRA",
    name: "Brazil",
    flag: "🇧🇷",
    dominantIdeologies: ["Conservative", "Liberal", "Socialist", "Populist"],
    politicalSystem: "Presidential Republic",
    regions: brazilianStates.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "ARG",
    name: "Argentina",
    flag: "🇦🇷",
    dominantIdeologies: ["Peronist", "Radical", "Liberal", "Conservative"],
    politicalSystem: "Presidential Republic",
    regions: argentinianStates.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "IND",
    name: "India",
    flag: "🇮🇳",
    dominantIdeologies: ["Nationalist", "Secular", "Socialist", "Liberal"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "MEX",
    name: "Mexico",
    flag: "🇲🇽",
    dominantIdeologies: ["Social Democrat", "Conservative", "Liberal"],
    politicalSystem: "Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "IDN",
    name: "Indonesia",
    flag: "🇮🇩",
    dominantIdeologies: ["Nationalist", "Religious Conservative", "Populist"],
    politicalSystem: "Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "MODERATE_LIMITS",
  },
  {
    id: "NLD",
    name: "Netherlands",
    flag: "🇳🇱",
    dominantIdeologies: [
      "Liberal",
      "Conservative",
      "Social Democrat",
      "Populist",
    ],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "STRICT_LIMITS",
  },
  {
    id: "CHE",
    name: "Switzerland",
    flag: "🇨🇭",
    dominantIdeologies: ["Conservative", "Liberal", "Social Democrat", "Green"],
    politicalSystem: "Directorial Federal Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "VERY_STRICT",
  },
  {
    id: "AUT",
    name: "Austria",
    flag: "🇦🇹",
    dominantIdeologies: ["Conservative", "Social Democrat", "Nationalist"],
    politicalSystem: "Parliamentary Republic",
    regions: austrianStates.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "STRICT_LIMITS",
  },
  {
    id: "BEL",
    name: "Belgium",
    flag: "🇧🇪",
    dominantIdeologies: [
      "Liberal",
      "Christian Democrat",
      "Social Democrat",
      "Regionalist",
    ],
    politicalSystem: "Parliamentary Monarchy (Federal)",
    regions: belgianRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "STRICT_LIMITS",
  },
  {
    id: "DNK",
    name: "Denmark",
    flag: "🇩🇰",
    dominantIdeologies: ["Social Democrat", "Liberal", "Conservative"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: danishRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "FIN",
    name: "Finland",
    flag: "🇫🇮",
    dominantIdeologies: ["Social Democrat", "Conservative", "Centrist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "VERY_STRICT",
  },
  {
    id: "NOR",
    name: "Norway",
    flag: "🇳🇴",
    dominantIdeologies: ["Social Democrat", "Conservative", "Progressive"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "VERY_STRICT",
  },
  {
    id: "IRL",
    name: "Ireland",
    flag: "🇮🇪",
    dominantIdeologies: ["Centrist", "Conservative", "Nationalist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "PRT",
    name: "Portugal",
    flag: "🇵🇹",
    dominantIdeologies: ["Socialist", "Social Democrat", "Conservative"],
    politicalSystem: "Semi-Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "GRC",
    name: "Greece",
    flag: "🇬🇷",
    dominantIdeologies: ["Conservative", "Socialist", "Social Democrat"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "NZL",
    name: "New Zealand",
    flag: "🇳🇿",
    dominantIdeologies: [
      "Social Democrat",
      "Conservative",
      "Green",
      "Libertarian",
    ],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "CHL",
    name: "Chile",
    flag: "🇨🇱",
    dominantIdeologies: [
      "Conservative",
      "Socialist",
      "Liberal",
      "Christian Democrat",
    ],
    politicalSystem: "Presidential Republic",
    regions: chileanRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "COL",
    name: "Colombia",
    flag: "🇨🇴",
    dominantIdeologies: ["Conservative", "Liberal", "Progressive", "Populist"],
    politicalSystem: "Presidential Republic",
    regions: colombianDepartments.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "PER",
    name: "Peru",
    flag: "🇵🇪",
    dominantIdeologies: ["Conservative", "Populist", "Liberal"],
    politicalSystem: "Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "MYS",
    name: "Malaysia",
    flag: "🇲🇾",
    dominantIdeologies: [
      "Conservative",
      "Nationalist",
      "Religious Conservative",
    ],
    politicalSystem: "Parliamentary Monarchy (Federal)",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "SGP",
    name: "Singapore",
    flag: "🇸🇬",
    dominantIdeologies: ["Conservative", "Social Democrat", "Technocratic"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "THA",
    name: "Thailand",
    flag: "🇹🇭",
    dominantIdeologies: ["Monarchist", "Populist", "Conservative"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "CZE",
    name: "Czech Republic",
    flag: "🇨🇿",
    dominantIdeologies: ["Populist", "Conservative", "Liberal"],
    politicalSystem: "Parliamentary Republic",
    regions: czechRegions.map((p) => ({ ...p })),
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "ROU",
    name: "Romania",
    flag: "🇷🇴",
    dominantIdeologies: ["Social Democrat", "Liberal", "Conservative"],
    politicalSystem: "Semi-Presidential Republic",
    regions: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "BGR",
    name: "Bulgaria",
    flag: "🇧🇬",
    dominantIdeologies: ["Populist", "Conservative", "Socialist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "HRV",
    name: "Croatia",
    flag: "🇭🇷",
    dominantIdeologies: ["Conservative", "Social Democrat", "Nationalist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "SVK",
    name: "Slovakia",
    flag: "🇸🇰",
    dominantIdeologies: ["Populist", "Social Democrat", "Progressive"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "LTU",
    name: "Lithuania",
    flag: "🇱🇹",
    dominantIdeologies: ["Conservative", "Christian Democrat", "Liberal"],
    politicalSystem: "Semi-Presidential Republic",
    regions: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "LVA",
    name: "Latvia",
    flag: "🇱🇻",
    dominantIdeologies: ["Centrist", "Conservative", "Social Democrat"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "EST",
    name: "Estonia",
    flag: "🇪🇪",
    dominantIdeologies: ["Liberal", "Centrist", "Populist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "SVN",
    name: "Slovenia",
    flag: "🇸🇮",
    dominantIdeologies: ["Liberal", "Social Democrat", "Conservative"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "LUX",
    name: "Luxembourg",
    flag: "🇱🇺",
    dominantIdeologies: ["Christian Democrat", "Liberal", "Socialist"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "ISL",
    name: "Iceland",
    flag: "🇮🇸",
    dominantIdeologies: ["Progressive", "Conservative", "Green"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "CRI",
    name: "Costa Rica",
    flag: "🇨🇷",
    dominantIdeologies: ["Social Democrat", "Christian Democrat", "Green"],
    politicalSystem: "Presidential Republic",
    regions: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "URY",
    name: "Uruguay",
    flag: "🇺🇾",
    dominantIdeologies: ["Liberal", "Conservative", "Social Democrat"],
    politicalSystem: "Presidential Republic",
    regions: [],
    departments: {
      national: DEPARTMENT_LEVELS.NATIONAL,
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
  },
  {
    id: "MLT",
    name: "Malta",
    flag: "🇲🇹",
    dominantIdeologies: [
      "Social Democrat",
      "Christian Democrat",
      "Conservative",
    ],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    departments: {
      national: [
        ...DEPARTMENT_LEVELS.NATIONAL,
        ...REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL,
      ],
      state: DEPARTMENT_LEVELS.STATE,
      county: DEPARTMENT_LEVELS.COUNTY,
      city: DEPARTMENT_LEVELS.CITY,
    },
    donationLawId: "VERY_STRICT",
  },
];

export const BASE_COUNTRIES_DATA = baseCountriesData;

export const generateDetailedCountryData = (countryToProcess) => {
  if (!countryToProcess) return null;

  console.log(
    `[DEBUG-GENERATE] Starting generateDetailedCountryData for ${countryToProcess.name}`
  );
  console.log(
    `[DEBUG-GENERATE] Input secondAdminRegions length:`,
    countryToProcess.secondAdminRegions?.length || 0
  );

  // Create a deep copy to avoid modifying the original country data
  const countryForProcessing = {
    ...countryToProcess,
    regions: countryToProcess.regions?.map((r) => ({ ...r })) || [],
    secondAdminRegions:
      countryToProcess.secondAdminRegions?.map((c) => ({ ...c })) || [],
  };

  console.log(
    `[DEBUG-GENERATE] After deep copy, secondAdminRegions length:`,
    countryForProcessing.secondAdminRegions?.length || 0
  );

  // 1. Generate legislative districts by calling our new, focused function
  let processedCountry =
    generateLegislativeDistrictsForCountry(countryForProcessing);

  const nationalParties = generateNationalParties({
    countryId: processedCountry.id,
    dominantIdeologies: processedCountry.dominantIdeologies,
    countryName: processedCountry.name,
    countryData: processedCountry,
  });

  // 2. Attach this consistent list to the main country object.
  processedCountry.nationalParties = nationalParties;
  // --- END OF FIX ---

  // 2. Generate full state data for each region
  if (processedCountry.regions && Array.isArray(processedCountry.regions)) {
    processedCountry.regions = processedCountry.regions.map((staticRegion) => {
      // --- MODIFIED ---
      // Pass the generated national parties down to the state generator.
      return generateFullStateData({
        name: staticRegion.name,
        countryId: processedCountry.id,
        totalPopulation: staticRegion.population,
        id: staticRegion.id,
        legislativeDistricts: staticRegion.legislativeDistricts,
        nationalParties: processedCountry.nationalParties,
        type: null,
      });
    });
  }

  console.log(
    `[DEBUG-GENERATE] After regions processing, secondAdminRegions length:`,
    processedCountry.secondAdminRegions?.length || 0
  );

  if (
    processedCountry.secondAdminRegions &&
    Array.isArray(processedCountry.secondAdminRegions)
  ) {
    console.log(
      `[DEBUG-GENERATE] Processing ${processedCountry.secondAdminRegions.length} counties`
    );
    processedCountry.secondAdminRegions =
      processedCountry.secondAdminRegions.map((staticSecondAdmin) => {
        // Find the parent state/region to provide context
        const parentState = processedCountry.regions.find(
          (r) => r.id === staticSecondAdmin.stateId
        );
        return generateFullSecondAdminRegionData({
          baseRegionData: staticSecondAdmin,
          parentStateData: parentState,
          countryId: processedCountry.id,
        });
      });

    // Properly distribute population among counties using distributeValueProportionally
    processedCountry.regions.forEach((state) => {
      const stateCounties = processedCountry.secondAdminRegions.filter(
        (county) => county.stateId === state.id
      );
      if (stateCounties.length > 0) {
        // Pass the county objects with populationWeight property, not just the weights
        const distributedPopulations = distributeValueProportionally(
          state.population,
          stateCounties
        );
        stateCounties.forEach((county, index) => {
          county.population = distributedPopulations[index] || 5000;
          // Update the county in the main array
          const countyIndex = processedCountry.secondAdminRegions.findIndex(
            (c) => c.id === county.id
          );
          if (countyIndex !== -1) {
            processedCountry.secondAdminRegions[countyIndex].population =
              county.population;
          }
        });
      }
    });
  }

  // Aggregate population and GDP from regions. This part is crucial.
  if (processedCountry.regions.length > 0) {
    const totalCountryPopulation = processedCountry.regions.reduce(
      (sum, region) => sum + region.population,
      0
    );
    const totalCountryGDP = processedCountry.regions.reduce(
      (sum, region) =>
        sum + region.population * region.economicProfile.gdpPerCapita,
      0
    );

    processedCountry.population = totalCountryPopulation;
    processedCountry.gdpPerCapita = Math.round(
      totalCountryGDP / totalCountryPopulation
    );
  } else {
    // Fallback for countries without regions
    processedCountry.gdpPerCapita =
      processedCountry.gdpPerCapita || getRandomInt(15000, 60000);
  }

  processedCountry.demographics = generateNationalDemographics(
    processedCountry.id,
    processedCountry.population
  );
  processedCountry.economicProfile = {
    gdpPerCapita: processedCountry.gdpPerCapita,
    dominantIndustries: processedCountry.dominantIdeologies,
    keyLocalIssuesFromProfile: [],
  };

  processedCountry.stats = generateInitialNationalStats(processedCountry);

  // Calculate national party popularity by aggregating from all states
  if (
    processedCountry.regions &&
    processedCountry.regions.length > 0 &&
    processedCountry.nationalParties
  ) {
    const partyPopularityTotals = new Map();
    let totalRegionPopulation = 0;

    // Aggregate popularity weighted by region population
    processedCountry.regions.forEach((region) => {
      if (region.politicalLandscape && region.population) {
        const regionPop = region.population;
        totalRegionPopulation += regionPop;

        region.politicalLandscape.forEach((party) => {
          const currentTotal = partyPopularityTotals.get(party.id) || 0;
          partyPopularityTotals.set(
            party.id,
            currentTotal + party.popularity * regionPop
          );
        });
      }
    });

    // Calculate weighted average popularity and update parties
    if (totalRegionPopulation > 0) {
      processedCountry.nationalParties = processedCountry.nationalParties.map(
        (party) => {
          const weightedTotal = partyPopularityTotals.get(party.id) || 0;
          const nationalPopularity = Math.round(
            weightedTotal / totalRegionPopulation
          );

          // Update party finances based on actual national popularity
          const updatedFinances = { ...party.finances };

          // Recalculate income based on actual popularity
          const baseMonthlyIncome = Math.round(
            nationalPopularity * 500 + getRandomInt(10000, 30000)
          );
          updatedFinances.monthlyIncome = baseMonthlyIncome;

          // Update income sources that scale with popularity
          if (updatedFinances.incomeSources) {
            updatedFinances.incomeSources.membershipDues = Math.round(
              nationalPopularity * 100 + getRandomInt(2000, 8000)
            );
            updatedFinances.incomeSources.publicFunding =
              nationalPopularity > 60 ? getRandomInt(5000, 15000) : 0;

            // Recalculate total monthly income
            const totalIncome = Object.values(
              updatedFinances.incomeSources
            ).reduce((sum, val) => sum + val, 0);
            updatedFinances.monthlyIncome = totalIncome;
          }

          return {
            ...party,
            popularity: nationalPopularity,
            finances: updatedFinances,
          };
        }
      );
    }

    // Create national political landscape
    processedCountry.politicalLandscape = processedCountry.nationalParties.map(
      (party) => ({
        id: party.id,
        name: party.name,
        popularity: party.popularity,
        color: party.color,
        ideology: party.ideology,
      })
    );
  }

  return processedCountry; // Return the fully processed country
};
