import { assignNestedPopulations } from "../utils/populationUtils";
import { generateFullStateData } from "../utils/stateUtils";

const japanPrefectures = [
  { id: "JPN_HOK", name: "Hokkaido" },
  { id: "JPN_AOM", name: "Aomori" },
  { id: "JPN_IWT", name: "Iwate" },
  { id: "JPN_MYG", name: "Miyagi" },
  { id: "JPN_AKI", name: "Akita" },
  { id: "JPN_YGT", name: "Yamagata" },
  { id: "JPN_FKS", name: "Fukushima" },
  { id: "JPN_IBR", name: "Ibaraki" },
  { id: "JPN_TCG", name: "Tochigi" },
  { id: "JPN_GNM", name: "Gunma" },
  { id: "JPN_SIT", name: "Saitama" },
  { id: "JPN_CHB", name: "Chiba" },
  { id: "JPN_TKY", name: "Tokyo" },
  { id: "JPN_KNG", name: "Kanagawa" },
  { id: "JPN_NGT", name: "Niigata" },
  { id: "JPN_TYM", name: "Toyama" },
  { id: "JPN_ISK", name: "Ishikawa" },
  { id: "JPN_FKI", name: "Fukui" },
  { id: "JPN_YMN", name: "Yamanashi" },
  { id: "JPN_NGN", name: "Nagano" },
  { id: "JPN_GIF", name: "Gifu" },
  { id: "JPN_SZK", name: "Shizuoka" },
  { id: "JPN_AIC", name: "Aichi" },
  { id: "JPN_MIE", name: "Mie" },
  { id: "JPN_SHG", name: "Shiga" },
  { id: "JPN_KYT", name: "Kyoto" },
  { id: "JPN_OSK", name: "Osaka" },
  { id: "JPN_HYG", name: "Hyogo" },
  { id: "JPN_NAR", name: "Nara" },
  { id: "JPN_WKY", name: "Wakayama" },
  { id: "JPN_TTT", name: "Tottori" },
  { id: "JPN_SMN", name: "Shimane" },
  { id: "JPN_OKY", name: "Okayama" },
  { id: "JPN_HRS", name: "Hiroshima" },
  { id: "JPN_YGC", name: "Yamaguchi" },
  { id: "JPN_TKS", name: "Tokushima" },
  { id: "JPN_KGW", name: "Kagawa" },
  { id: "JPN_EHM", name: "Ehime" },
  { id: "JPN_KCH", name: "Kochi" },
  { id: "JPN_FKO", name: "Fukuoka" },
  { id: "JPN_SGA", name: "Saga" },
  { id: "JPN_NGS", name: "Nagasaki" },
  { id: "JPN_KMM", name: "Kumamoto" },
  { id: "JPN_OIT", name: "Oita" },
  { id: "JPN_MYZ", name: "Miyazaki" },
  { id: "JPN_KGS", name: "Kagoshima" },
  { id: "JPN_OKN", name: "Okinawa" },
];

const usaStates = [
  {
    id: "USA_AL",
    name: "Alabama",
  },
  { id: "USA_AK", name: "Alaska" },
  { id: "USA_AZ", name: "Arizona" },
  { id: "USA_AR", name: "Arkansas" },
  { id: "USA_CA", name: "California" },
  { id: "USA_CO", name: "Colorado" },
  { id: "USA_CT", name: "Connecticut" },
  { id: "USA_DE", name: "Delaware" },
  { id: "USA_FL", name: "Florida" },
  { id: "USA_GA", name: "Georgia" },
  { id: "USA_HI", name: "Hawaii" },
  { id: "USA_ID", name: "Idaho" },
  { id: "USA_IL", name: "Illinois" },
  { id: "USA_IN", name: "Indiana" },
  { id: "USA_IA", name: "Iowa" },
  { id: "USA_KS", name: "Kansas" },
  { id: "USA_KY", name: "Kentucky" },
  { id: "USA_LA", name: "Louisiana" },
  { id: "USA_ME", name: "Maine" },
  { id: "USA_MD", name: "Maryland" },
  { id: "USA_MA", name: "Massachusetts" },
  { id: "USA_MI", name: "Michigan" },
  { id: "USA_MN", name: "Minnesota" },
  { id: "USA_MS", name: "Mississippi" },
  { id: "USA_MO", name: "Missouri" },
  { id: "USA_MT", name: "Montana" },
  { id: "USA_NE", name: "Nebraska" },
  { id: "USA_NV", name: "Nevada" },
  { id: "USA_NH", name: "New Hampshire" },
  { id: "USA_NJ", name: "New Jersey" },
  { id: "USA_NM", name: "New Mexico" },
  { id: "USA_NY", name: "New York" },
  { id: "USA_NC", name: "North Carolina" },
  { id: "USA_ND", name: "North Dakota" },
  { id: "USA_OH", name: "Ohio" },
  { id: "USA_OK", name: "Oklahoma" },
  { id: "USA_OR", name: "Oregon" },
  { id: "USA_PA", name: "Pennsylvania" },
  { id: "USA_RI", name: "Rhode Island" },
  { id: "USA_SC", name: "South Carolina" },
  { id: "USA_SD", name: "South Dakota" },
  { id: "USA_TN", name: "Tennessee" },
  { id: "USA_TX", name: "Texas" },
  { id: "USA_UT", name: "Utah" },
  { id: "USA_VT", name: "Vermont" },
  { id: "USA_VA", name: "Virginia" },
  { id: "USA_WA", name: "Washington" },
  { id: "USA_WV", name: "West Virginia" },
  { id: "USA_WI", name: "Wisconsin" },
  { id: "USA_WY", name: "Wyoming" },
];

const germanStates = [
  { id: "DEU_BW", name: "Baden-Württemberg" },
  { id: "DEU_BY", name: "Bavaria" },
  { id: "DEU_BE", name: "Berlin" },
  { id: "DEU_BB", name: "Brandenburg" },
  { id: "DEU_HB", name: "Bremen" },
  { id: "DEU_HH", name: "Hamburg" },
  { id: "DEU_HE", name: "Hesse" },
  { id: "DEU_MV", name: "Mecklenburg-Vorpommern" },
  { id: "DEU_NI", name: "Lower Saxony" },
  { id: "DEU_NW", name: "North Rhine-Westphalia" },
  { id: "DEU_RP", name: "Rhineland-Palatinate" },
  { id: "DEU_SL", name: "Saarland" },
  { id: "DEU_SN", name: "Saxony" },
  { id: "DEU_ST", name: "Saxony-Anhalt" },
  { id: "DEU_SH", name: "Schleswig-Holstein" },
  { id: "DEU_TH", name: "Thuringia" },
];

const philippinesRegions = [
  { id: "PHL_NCR", name: "National Capital Region (NCR)" },
  { id: "PHL_CAR", name: "Cordillera Administrative Region (CAR)" },
  { id: "PHL_R01", name: "Region I (Ilocos Region)" },
  { id: "PHL_R02", name: "Region II (Cagayan Valley)" },
  { id: "PHL_R03", name: "Region III (Central Luzon)" },
  { id: "PHL_R04A", name: "Region IV-A (CALABARZON)" },
  { id: "PHL_R04B", name: "Region IV-B (MIMAROPA)" }, // Officially Southwestern Tagalog Region
  { id: "PHL_R05", name: "Region V (Bicol Region)" },
  { id: "PHL_R06", name: "Region VI (Western Visayas)" },
  { id: "PHL_R07", name: "Region VII (Central Visayas)" },
  { id: "PHL_R08", name: "Region VIII (Eastern Visayas)" },
  { id: "PHL_R09", name: "Region IX (Zamboanga Peninsula)" },
  { id: "PHL_R10", name: "Region X (Northern Mindanao)" },
  { id: "PHL_R11", name: "Region XI (Davao Region)" },
  { id: "PHL_R12", name: "Region XII (SOCCSKSARGEN)" },
  { id: "PHL_R13", name: "Region XIII (Caraga)" },
  {
    id: "PHL_BARMM",
    name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
  },
];

const philippinesProvinces = [
  { id: "PHL_PROV_ABR", name: "Abra", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_APA", name: "Apayao", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_BEN", name: "Benguet", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_IFU", name: "Ifugao", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_KAL", name: "Kalinga", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_MOU", name: "Mountain Province", adminRegionId: "PHL_CAR" },

  // Region I (Ilocos Region)
  { id: "PHL_PROV_ILN", name: "Ilocos Norte", adminRegionId: "PHL_R01" },
  { id: "PHL_PROV_ILS", name: "Ilocos Sur", adminRegionId: "PHL_R01" },
  { id: "PHL_PROV_LUN", name: "La Union", adminRegionId: "PHL_R01" },
  { id: "PHL_PROV_PAN", name: "Pangasinan", adminRegionId: "PHL_R01" },

  // Region II (Cagayan Valley)
  { id: "PHL_PROV_BTN", name: "Batanes", adminRegionId: "PHL_R02" }, // Note: Batanes, not Bataan for Region II
  { id: "PHL_PROV_CAG", name: "Cagayan", adminRegionId: "PHL_R02" },
  { id: "PHL_PROV_ISA", name: "Isabela", adminRegionId: "PHL_R02" },
  { id: "PHL_PROV_NUV", name: "Nueva Vizcaya", adminRegionId: "PHL_R02" },
  { id: "PHL_PROV_QUI", name: "Quirino", adminRegionId: "PHL_R02" },

  // Region III (Central Luzon)
  { id: "PHL_PROV_AUR", name: "Aurora", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_BAN", name: "Bataan", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_BUL", name: "Bulacan", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_NUE", name: "Nueva Ecija", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_PAM", name: "Pampanga", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_TAR", name: "Tarlac", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_ZMB", name: "Zambales", adminRegionId: "PHL_R03" },

  // Region IV-A (CALABARZON)
  { id: "PHL_PROV_BTG", name: "Batangas", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_CAV", name: "Cavite", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_LAG", name: "Laguna", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_QUE", name: "Quezon", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_RIZ", name: "Rizal", adminRegionId: "PHL_R04A" },

  // Region IV-B (MIMAROPA / Southwestern Tagalog Region)
  { id: "PHL_PROV_MAD", name: "Marinduque", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_MDC", name: "Occidental Mindoro", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_MDR", name: "Oriental Mindoro", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_PLW", name: "Palawan", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_ROM", name: "Romblon", adminRegionId: "PHL_R04B" },

  // Region V (Bicol Region)
  { id: "PHL_PROV_ALB", name: "Albay", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_CAN", name: "Camarines Norte", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_CAS", name: "Camarines Sur", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_CAT", name: "Catanduanes", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_MAS", name: "Masbate", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_SOR", name: "Sorsogon", adminRegionId: "PHL_R05" },

  // Visayas
  // Region VI (Western Visayas)
  { id: "PHL_PROV_AKL", name: "Aklan", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_ANT", name: "Antique", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_CAP", name: "Capiz", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_GUI", name: "Guimaras", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_ILO", name: "Iloilo", adminRegionId: "PHL_R06" }, // Province of Iloilo
  { id: "PHL_PROV_NEC", name: "Negros Occidental", adminRegionId: "PHL_R06" },

  // Region VII (Central Visayas)
  { id: "PHL_PROV_BOH", name: "Bohol", adminRegionId: "PHL_R07" },
  { id: "PHL_PROV_CEB", name: "Cebu", adminRegionId: "PHL_R07" }, // Province of Cebu
  { id: "PHL_PROV_NER", name: "Negros Oriental", adminRegionId: "PHL_R07" },
  { id: "PHL_PROV_SIQ", name: "Siquijor", adminRegionId: "PHL_R07" },

  // Region VIII (Eastern Visayas)
  { id: "PHL_PROV_BIL", name: "Biliran", adminRegionId: "PHL_R08" },
  { id: "PHL_PROV_EAS", name: "Eastern Samar", adminRegionId: "PHL_R08" },
  { id: "PHL_PROV_LEY", name: "Leyte", adminRegionId: "PHL_R08" }, // Province of Leyte
  { id: "PHL_PROV_NSA", name: "Northern Samar", adminRegionId: "PHL_R08" },
  {
    id: "PHL_PROV_SAM",
    name: "Samar (Western Samar)",
    adminRegionId: "PHL_R08",
  },
  { id: "PHL_PROV_SLE", name: "Southern Leyte", adminRegionId: "PHL_R08" },

  // Mindanao
  // Region IX (Zamboanga Peninsula)
  { id: "PHL_PROV_ZAN", name: "Zamboanga del Norte", adminRegionId: "PHL_R09" },
  { id: "PHL_PROV_ZAS", name: "Zamboanga del Sur", adminRegionId: "PHL_R09" },
  { id: "PHL_PROV_ZSI", name: "Zamboanga Sibugay", adminRegionId: "PHL_R09" },

  // Region X (Northern Mindanao)
  { id: "PHL_PROV_BUK", name: "Bukidnon", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_CAM", name: "Camiguin", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_LDN", name: "Lanao del Norte", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_MSC", name: "Misamis Occidental", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_MSR", name: "Misamis Oriental", adminRegionId: "PHL_R10" },

  // Region XI (Davao Region)
  { id: "PHL_PROV_DVO", name: "Davao de Oro", adminRegionId: "PHL_R11" }, // Formerly Compostela Valley
  { id: "PHL_PROV_DVN", name: "Davao del Norte", adminRegionId: "PHL_R11" },
  { id: "PHL_PROV_DVS", name: "Davao del Sur", adminRegionId: "PHL_R11" },
  { id: "PHL_PROV_DVO", name: "Davao Occidental", adminRegionId: "PHL_R11" }, // Corrected Davao Occidental (new province) ID PHL_PROV_DVO -> PHL_PROV_DVC
  { id: "PHL_PROV_DVC", name: "Davao Occidental", adminRegionId: "PHL_R11" }, // Using DVC for Davao Occidental
  { id: "PHL_PROV_DVR", name: "Davao Oriental", adminRegionId: "PHL_R11" },

  // Region XII (SOCCSKSARGEN)
  {
    id: "PHL_PROV_COT",
    name: "Cotabato (North Cotabato)",
    adminRegionId: "PHL_R12",
  },
  { id: "PHL_PROV_SAR", name: "Sarangani", adminRegionId: "PHL_R12" },
  { id: "PHL_PROV_SCO", name: "South Cotabato", adminRegionId: "PHL_R12" },
  { id: "PHL_PROV_SKU", name: "Sultan Kudarat", adminRegionId: "PHL_R12" },

  // Region XIII (Caraga)
  { id: "PHL_PROV_AGN", name: "Agusan del Norte", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_AGS", name: "Agusan del Sur", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_DIN", name: "Dinagat Islands", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_SUN", name: "Surigao del Norte", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_SUS", name: "Surigao del Sur", adminRegionId: "PHL_R13" },

  // BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)
  { id: "PHL_PROV_BAS", name: "Basilan", adminRegionId: "PHL_BARMM" }, // Excluding Isabela City
  { id: "PHL_PROV_LDS", name: "Lanao del Sur", adminRegionId: "PHL_BARMM" },
  {
    id: "PHL_PROV_MAGN",
    name: "Maguindanao del Norte",
    adminRegionId: "PHL_BARMM",
  }, // Maguindanao was split
  {
    id: "PHL_PROV_MAGS",
    name: "Maguindanao del Sur",
    adminRegionId: "PHL_BARMM",
  },
  { id: "PHL_PROV_SLU", name: "Sulu", adminRegionId: "PHL_BARMM" },
  { id: "PHL_PROV_TAW", name: "Tawi-Tawi", adminRegionId: "PHL_BARMM" },
];

export const DEFAULT_COUNTRY_POPULATION_RANGES = {
  JPN: { min: 100000000, max: 130000000 },
  USA: { min: 280000000, max: 380000000 },
  GER: { min: 75000000, max: 90000000 }, // Corrected ID from GER to DEU if that's what you use, or add GER
  DEU: { min: 75000000, max: 90000000 },
  PHL: { min: 90000000, max: 140000000 },
};

export const JPN_HOC_SEAT_ALLOCATION_TIERS = [
  { popThreshold: 10000000, seatsRange: [4, 6] },
  { popThreshold: 6000000, seatsRange: [3, 5] },
  { popThreshold: 3000000, seatsRange: [2, 4] },
  { popThreshold: 1500000, seatsRange: [1, 3] },
  { popThreshold: 0, seatsRange: [1, 2] },
];

export const JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS = [
  { popThreshold: 10000000, numDistrictsRange: [15, 25] }, // Very large (Tokyo, Kanagawa, Osaka)
  { popThreshold: 5000000, numDistrictsRange: [8, 15] }, // Large (Aichi, Saitama, Chiba, Hyogo, Fukuoka, Hokkaido)
  { popThreshold: 2000000, numDistrictsRange: [3, 7] }, // Medium
  { popThreshold: 1000000, numDistrictsRange: [2, 4] }, // Small-Medium
  { popThreshold: 0, numDistrictsRange: [1, 2] }, // Smallest (ensure at least 1-2)
];

export const USA_STATE_LOWER_HOUSE_DISTRICT_TIERS = [
  { popThreshold: 20000000, numDistrictsRange: [100, 150] }, // e.g., CA, TX
  { popThreshold: 10000000, numDistrictsRange: [60, 120] }, // e.g., FL, NY, PA, IL
  { popThreshold: 5000000, numDistrictsRange: [40, 80] }, // Medium-large states
  { popThreshold: 2000000, numDistrictsRange: [20, 50] }, // Medium states
  { popThreshold: 0, numDistrictsRange: [10, 30] }, // Smaller states (min 10 for gameplay)
]; // Sorted by popThreshold DESC

// Tiers for State Upper House (State Senate) districts per state
export const USA_STATE_UPPER_HOUSE_DISTRICT_TIERS = [
  { popThreshold: 20000000, numDistrictsRange: [40, 60] }, // e.g., CA, TX
  { popThreshold: 10000000, numDistrictsRange: [30, 50] }, // e.g., FL, NY, PA, IL
  { popThreshold: 5000000, numDistrictsRange: [20, 40] }, // Medium-large states
  { popThreshold: 1000000, numDistrictsRange: [10, 25] }, // Medium/Small states
  { popThreshold: 0, numDistrictsRange: [5, 15] }, // Smallest states (min 5 for gameplay)
]; // Sorted by popThreshold DESC

// Tiers for U.S. House of Representatives (Congressional) districts per state
// Note: Real allocation is complex and aims for 435 total. This is a simplified random approach.
// Every state gets at least 1.
export const USA_CONGRESSIONAL_DISTRICT_TIERS = [
  { popThreshold: 30000000, numDistrictsRange: [35, 53] }, // e.g., California
  { popThreshold: 20000000, numDistrictsRange: [20, 38] }, // e.g., Texas, Florida, New York
  { popThreshold: 10000000, numDistrictsRange: [10, 20] },
  { popThreshold: 5000000, numDistrictsRange: [5, 10] },
  { popThreshold: 2000000, numDistrictsRange: [2, 5] },
  { popThreshold: 0, numDistrictsRange: [1, 2] }, // Min 1, small states might get 2
]; // Sorted by popThreshold DESC

export const PHL_PROVINCIAL_BOARD_DISTRICT_TIERS = [
  // Tiers to decide how many board districts a province has
  { popThreshold: 4000000, numDistrictsRange: [3, 5] }, // Highly populous provinces
  { popThreshold: 2000000, numDistrictsRange: [2, 4] },
  { popThreshold: 1000000, numDistrictsRange: [2, 3] },
  { popThreshold: 500000, numDistrictsRange: [1, 2] },
  { popThreshold: 0, numDistrictsRange: [1, 1] }, // Smaller provinces might have one or two districts (often "Lone District")
]; // Sorted by popThreshold DESC

export const PHL_HR_DISTRICTS_PER_PROVINCE_TIERS = [
  // Tiers to decide how many HR districts a province gets
  { popThreshold: 4000000, numDistrictsRange: [4, 7] }, // e.g., Cebu, Laguna, Cavite might have many
  { popThreshold: 2000000, numDistrictsRange: [2, 5] },
  { popThreshold: 1000000, numDistrictsRange: [1, 3] },
  { popThreshold: 0, numDistrictsRange: [1, 1] }, // All provinces get at least one representative
]; // Sorted by popThreshold DESC

// Range for how many Sangguniang Panlalawigan (Provincial Board) members are elected PER DISTRICT
export const PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE = [1, 4]; // e.g., 2-4 members per board district typically

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
