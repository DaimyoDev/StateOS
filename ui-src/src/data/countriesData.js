import { generateFullStateData } from "../entities/politicialEntities";
import { chamberTiers } from "./chamberTiers";
import { generateLegislativeDistrictsForCountry } from "../entities/districtGeneration";
import { generateNationalParties } from "../entities/partyGeneration";
import { japanPrefectures } from "./states/japanPrefectures";
import { usaStates } from "./states/usaStates";
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
import { spanishProvinces } from "./states/spanishProvinces";
import { swedishCounties } from "./states/swedishCounties";
import { polishVoivodeships } from "./states/polishVoivodeships";

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
    nationalHrTiers:
      chamberTiers.JPN.NATIONIAL.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS,
    nationalHrName: "House Of Representatives",
    lowerStateHrTiers:
      chamberTiers.JPN.NATIONIAL.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS,
    lowerStateHrName: "Assembly District",
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
    nationalHrTiers: chamberTiers.USA.NATIONAL.USA_CONGRESSIONAL_DISTRICT_TIERS,
    nationalHrName: "House Of Representatives",
    lowerStateHrTiers:
      chamberTiers.USA.STATE.USA_STATE_LOWER_HOUSE_DISTRICT_TIERS,
    lowerStateHrName: "State House Of Representatives District",
    upperStateHrTiers:
      chamberTiers.USA.STATE.USA_STATE_UPPER_HOUSE_DISTRICT_TIERS,
    upperStateHrName: "State Senate District",
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
    nationalHrTiers:
      chamberTiers.PHL.NATIONAL.PHL_HR_DISTRICTS_PER_PROVINCE_TIERS,
    nationalHrName: "House Of Representatives",
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
    nationalHrTiers:
      chamberTiers.KOR.NATIONAL.KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS,
    nationalHrName: "National Assembly",
    lowerStateHrTiers:
      chamberTiers.KOR.STATE.KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS,
    lowerStateHrName: "Assembly District",
  },
  {
    id: "CAN",
    name: "Canada",
    flag: "🇨🇦",
    politicalSystem: "Parliamentary Monarchy (Federal)",
    dominantIdeologies: ["Liberal", "Conservative", "Social Democrat"],
    regions: canadaProvinces.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
    nationalHrTiers: chamberTiers.CAN.NATIONAL.CAN_FEDERAL_HR_DISTRICT_TIERS,
    nationalHrName: "Parliament District",
    lowerStateHrTiers: chamberTiers.CAN.STATE.CAN_PROVINCIAL_ASSEMBLY_TIERS,
    lowerStateHrName: "Assembly District",
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
  },
  {
    id: "FRA",
    name: "France",
    flag: "🇫🇷",
    dominantIdeologies: ["Socialist", "Liberal", "Conservative", "Nationalist"],
    politicalSystem: "Semi-Presidential Republic",
    regions: frenchRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "GBR",
    name: "United Kingdom",
    flag: "🇬🇧",
    dominantIdeologies: ["Conservative", "Labour", "Liberal Democrat"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: greatBritainAdminRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "ITA",
    name: "Italy",
    flag: "🇮🇹",
    dominantIdeologies: ["Social Democrat", "Conservative", "Populist"],
    politicalSystem: "Parliamentary Republic",
    regions: italianRegions.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    dominantIdeologies: ["Socialist", "Conservative", "Regionalist"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: spanishProvinces.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "POL",
    name: "Poland",
    flag: "🇵🇱",
    dominantIdeologies: ["Conservative", "Liberal", "Nationalist"],
    politicalSystem: "Parliamentary Republic",
    regions: polishVoivodeships.map((p) => ({ ...p })),
    nationalLowerHouseDistricts: [],
  },
  {
    id: "SWE",
    name: "Sweden",
    flag: "🇸🇪",
    dominantIdeologies: ["Social Democrat", "Moderate", "Green"],
    politicalSystem: "Parliamentary Monarchy (Constitutional)",
    regions: swedishCounties.map((p) => ({ ...p })),
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

export const BASE_COUNTRIES_DATA = baseCountriesData;

export const generateDetailedCountryData = (countryToProcess) => {
  if (!countryToProcess) return null;

  // 1. Generate legislative districts by calling our new, focused function
  let processedCountry =
    generateLegislativeDistrictsForCountry(countryToProcess);

  const nationalParties = generateNationalParties({
    countryId: processedCountry.id,
    dominantIdeologies: processedCountry.dominantIdeologies,
  });

  // 2. Attach this consistent list to the main country object.
  processedCountry.nationalParties = nationalParties;
  // --- END OF FIX ---

  // 2. Generate full state data for each region
  if (processedCountry.regions && Array.isArray(processedCountry.regions)) {
    processedCountry.regions = processedCountry.regions.map((staticRegion) => {
      return generateFullStateData({
        name: staticRegion.name,
        countryId: processedCountry.id,
        totalPopulation: staticRegion.population,
        id: staticRegion.id,
        legislativeDistricts: staticRegion.legislativeDistricts,
        nationalParties: processedCountry.nationalParties,
      });
    });
  }

  console.log(processedCountry.regions);

  return processedCountry; // Return the fully processed country
};
