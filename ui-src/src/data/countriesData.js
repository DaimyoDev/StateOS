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
import { canadaProvinces } from "./states/canadaProvinces";

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
};

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
  {
    id: "CAN",
    name: "Canada",
    flag: "🇨🇦",
    politicalSystem: "Parliamentary Monarchy (Federal)",
    dominantIdeologies: ["Liberal", "Conservative", "Social Democrat"],
    regions: canadaProvinces.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "AUS",
    name: "Australia",
    flag: "🇦🇺",
    dominantIdeologies: ["Liberal", "Labor", "Green"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "FRA",
    name: "France",
    flag: "🇫🇷",
    dominantIdeologies: ["Socialist", "Liberal", "Conservative", "Nationalist"],
    politicalSystem: "Semi-Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "GBR",
    name: "United Kingdom",
    flag: "🇬🇧",
    dominantIdeologies: ["Conservative", "Labour", "Liberal Democrat"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "ITA",
    name: "Italy",
    flag: "🇮🇹",
    dominantIdeologies: ["Social Democrat", "Conservative", "Populist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    dominantIdeologies: ["Socialist", "Conservative", "Regionalist"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "POL",
    name: "Poland",
    flag: "🇵🇱",
    dominantIdeologies: ["Conservative", "Liberal", "Nationalist"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "SWE",
    name: "Sweden",
    flag: "🇸🇪",
    dominantIdeologies: ["Social Democrat", "Moderate", "Green"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "BRA",
    name: "Brazil",
    flag: "🇧🇷",
    dominantIdeologies: ["Conservative", "Liberal", "Socialist", "Populist"],
    politicalSystem: "Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "ARG",
    name: "Argentina",
    flag: "🇦🇷",
    dominantIdeologies: ["Peronist", "Radical", "Liberal", "Conservative"],
    politicalSystem: "Presidential Republic",
    regions: [],
    nationalLowerHouseDistricts: [],
  },
  {
    id: "IND",
    name: "India",
    flag: "🇮🇳",
    dominantIdeologies: ["Nationalist", "Secular", "Socialist", "Liberal"],
    politicalSystem: "Parliamentary Republic",
    regions: [],
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
  console.log(country);
});
