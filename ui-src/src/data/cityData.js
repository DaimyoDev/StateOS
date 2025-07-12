import {
  generateId,
  getRandomInt,
  getRandomElement,
} from "../utils/generalUtils";
import {
  MOOD_LEVELS,
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
} from "./governmentData";

export const createCityObject = (params = {}) => ({
  id: params.id || `city_${generateId()}`,
  name: params.name || "New City",
  countryId: params.countryId || null,
  regionId: params.regionId || null,

  population: params.population || getRandomInt(5000, 2000000),

  demographics: {
    ageDistribution: params.ageDistribution || {
      youth: getRandomInt(18, 25),
      youngAdult: getRandomInt(20, 30),
      adult: getRandomInt(30, 40),
      senior: getRandomInt(15, 25),
    },
    educationLevels: params.educationLevels || {
      highSchoolOrLess: getRandomInt(25, 40),
      someCollege: getRandomInt(30, 45),
      bachelorsOrHigher: getRandomInt(20, 35),
    },
    // incomeBrackets: { low: 25, middle: 50, high: 25 }, // Could be added later
    // ethnicComposition: [{ group: "A", percentage: 60 }, { group: "B", percentage: 30 }, ...], // More advanced
  },

  economicProfile: {
    dominantIndustries: params.dominantIndustries || [
      getRandomElement([
        "manufacturing",
        "services",
        "agriculture",
        "tech",
        "tourism",
      ]),
    ],
    gdpPerCapita: params.gdpPerCapita || getRandomInt(25000, 60000),
    keyLocalIssuesFromProfile: [], // e.g., ["job_scarcity_manufacturing", "need_skilled_tech_workers"] generated based on profile
    // businessClimateRating: "Average", // Could be a new stat influenced by taxes/regulations
  },

  stats: {
    type: params.stats?.type || "City",
    wealth: params.stats?.wealth || "mid",
    mainIssues: params.stats?.mainIssues || ["Employment", "Infrastructure"],

    economicOutlook:
      params.stats?.economicOutlook ||
      getRandomElement(ECONOMIC_OUTLOOK_LEVELS),
    publicSafetyRating:
      params.stats?.publicSafetyRating || getRandomElement(RATING_LEVELS),
    educationQuality:
      params.stats?.educationQuality || getRandomElement(RATING_LEVELS),
    infrastructureState:
      params.stats?.infrastructureState || getRandomElement(RATING_LEVELS),
    overallCitizenMood:
      params.stats?.overallCitizenMood || getRandomElement(MOOD_LEVELS),
    unemploymentRate:
      params.stats?.unemploymentRate ||
      parseFloat(getRandomInt(30, 100) / 10).toFixed(1),

    healthcareQuality:
      params.stats?.healthcareQuality || getRandomElement(RATING_LEVELS),
    environmentRating:
      params.stats?.environmentRating || getRandomElement(RATING_LEVELS),
    cultureArtsRating:
      params.stats?.cultureArtsRating || getRandomElement(RATING_LEVELS),

    electoratePolicyProfile: params.stats?.electoratePolicyProfile || {},

    budget: {
      totalAnnualIncome: params.stats?.budget?.totalAnnualIncome || 0,
      totalAnnualExpenses: params.stats?.budget?.totalAnnualExpenses || 0,
      balance: params.stats?.budget?.balance || 0,
      accumulatedDebt: params.stats?.budget?.accumulatedDebt || 0,
      taxRates: params.stats?.budget?.taxRates || {
        property: parseFloat((getRandomInt(80, 150) / 10000).toFixed(4)),
        sales: parseFloat((getRandomInt(300, 800) / 10000).toFixed(4)),
        business: parseFloat((getRandomInt(200, 600) / 10000).toFixed(4)),
      },
      incomeSources: {
        propertyTaxRevenue:
          params.stats?.budget?.incomeSources?.propertyTaxRevenue || 0,
        salesTaxRevenue:
          params.stats?.budget?.incomeSources?.salesTaxRevenue || 0,
        businessTaxRevenue:
          params.stats?.budget?.incomeSources?.businessTaxRevenue || 0,
        feesAndPermits:
          params.stats?.budget?.incomeSources?.feesAndPermits || 0,
        utilityRevenue:
          params.stats?.budget?.incomeSources?.utilityRevenue || 0,
        grantsAndSubsidies:
          params.stats?.budget?.incomeSources?.grantsAndSubsidies || 0,
        investmentIncome:
          params.stats?.budget?.incomeSources?.investmentIncome || 0,
        otherRevenue: params.stats?.budget?.incomeSources?.otherRevenue || 0,
      },
      expenseAllocations: {
        policeDepartment:
          params.stats?.budget?.expenseAllocations?.policeDepartment || 0,
        fireDepartment:
          params.stats?.budget?.expenseAllocations?.fireDepartment || 0,
        emergencyServices:
          params.stats?.budget?.expenseAllocations?.emergencyServices || 0,
        roadInfrastructure:
          params.stats?.budget?.expenseAllocations?.roadInfrastructure || 0,
        publicTransit:
          params.stats?.budget?.expenseAllocations?.publicTransit || 0,
        waterAndSewer:
          params.stats?.budget?.expenseAllocations?.waterAndSewer || 0,
        wasteManagement:
          params.stats?.budget?.expenseAllocations?.wasteManagement || 0,
        publicEducation:
          params.stats?.budget?.expenseAllocations?.publicEducation || 0,
        publicHealthServices:
          params.stats?.budget?.expenseAllocations?.publicHealthServices || 0,
        socialWelfarePrograms:
          params.stats?.budget?.expenseAllocations?.socialWelfarePrograms || 0,
        parksAndRecreation:
          params.stats?.budget?.expenseAllocations?.parksAndRecreation ||
          params.stats?.budget?.parksBudget ||
          0,
        librariesAndCulture:
          params.stats?.budget?.expenseAllocations?.librariesAndCulture || 0,
        cityPlanningAndDevelopment:
          params.stats?.budget?.expenseAllocations
            ?.cityPlanningAndDevelopment || 0,
        generalAdministration:
          params.stats?.budget?.expenseAllocations?.generalAdministration || 0,
        debtServicing:
          params.stats?.budget?.expenseAllocations?.debtServicing || 0,
        miscellaneousExpenses:
          params.stats?.budget?.expenseAllocations?.miscellaneousExpenses || 0,
      },
    },
  },

  cityLaws: {
    minimumWage: params.cityLaws?.minimumWage || 0.0,
    plasticBagPolicy: params.cityLaws?.plasticBagPolicy || "none",
    smokingInPublicPlaces: params.cityLaws?.smokingInPublicPlaces || "allowed",
    alcoholSalesHours: params.cityLaws?.alcoholSalesHours || {
      weekday: { start: "09:00", end: "02:00" },
      weekend: { start: "09:00", end: "02:00" },
    },
    parkingMeterHours: params.cityLaws?.parkingMeterHours || {
      weekday: { start: "08:00", end: "18:00" },
      weekend: "free",
    },
    rentControlStatus: params.cityLaws?.rentControlStatus || "none",
    noiseOrdinanceLevel: params.cityLaws?.noiseOrdinanceLevel || "moderate",
    recyclingMandate: params.cityLaws?.recyclingMandate || "voluntary",
    residentialParkingPermitSystem:
      params.cityLaws?.residentialParkingPermitSystem || "inactive",
    streetCleaningParkingRules:
      params.cityLaws?.streetCleaningParkingRules || "seasonal_enforced",
    electricVehicleChargingSpotsMandate:
      params.cityLaws?.electricVehicleChargingSpotsMandate || "none",
    businessOperatingHoursPermitted: params.cityLaws
      ?.businessOperatingHoursPermitted || {
      retail: { start: "07:00", end: "22:00" },
      entertainment: { start: "10:00", end: "02:00" },
      office: "unrestricted",
    },
    streetVendorPermits:
      params.cityLaws?.streetVendorPermits || "required_zoned",
    outdoorDiningRegulations:
      params.cityLaws?.outdoorDiningRegulations || "permit_required_seasonal",
    advertisingSignageRestrictions:
      params.cityLaws?.advertisingSignageRestrictions || "moderate",
    foodSafetyInspectionFrequency:
      params.cityLaws?.foodSafetyInspectionFrequency || "annual_risk_based",
    leashLawForPets: params.cityLaws?.leashLawForPets || "required_in_public",
    fireworksUsagePolicy:
      params.cityLaws?.fireworksUsagePolicy ||
      "banned_except_licensed_displays",
    publicSwimmingPoolSafetyStandards:
      params.cityLaws?.publicSwimmingPoolSafetyStandards ||
      "enforced_state_guidelines",
    mandatoryVaccinationsForPublicSchool:
      params.cityLaws?.mandatoryVaccinationsForPublicSchool ||
      "standard_exemptions_apply",
    shortTermRentalPolicy:
      params.cityLaws?.shortTermRentalPolicy || "permit_required_cap_on_days",
    buildingHeightRestrictions:
      params.cityLaws?.buildingHeightRestrictions || "zone_dependent",
    greenSpaceRequirementForNewDevelopments:
      params.cityLaws?.greenSpaceRequirementForNewDevelopments || 0.1,
    historicPreservationOrdinance:
      params.cityLaws?.historicPreservationOrdinance ||
      "active_with_designated_districts",
    accessoryDwellingUnitPolicy:
      params.cityLaws?.accessoryDwellingUnitPolicy ||
      "permitted_with_conditions",
    propertyMaintenanceStandard:
      params.cityLaws?.propertyMaintenanceStandard ||
      "basic_safety_cleanliness",
    bicycleLaneAvailability:
      params.cityLaws?.bicycleLaneAvailability || "moderate_network",
    publicTransitSubsidies: params.cityLaws?.publicTransitSubsidies || true,
    scooterMicromobilityRules: params.cityLaws?.scooterMicromobilityRules || {
      status: "permitted_with_operator_license",
      helmetRequirement: "under_18",
      speedLimitKph: 20,
    },
    trafficCalmingMeasures:
      params.cityLaws?.trafficCalmingMeasures || "targeted_high_incident_areas",
    rideshareRegulation:
      params.cityLaws?.rideshareRegulation || "licensed_and_regulated",
    waterUsageRestrictions:
      params.cityLaws?.waterUsageRestrictions || "none_normal_conditions",
    pesticideUseByCityProperty:
      params.cityLaws?.pesticideUseByCityProperty || "organic_preferred_ipm",
    compostingProgram:
      params.cityLaws?.compostingProgram || "voluntary_drop_off",
    treeProtectionOrdinance:
      params.cityLaws?.treeProtectionOrdinance ||
      "significant_trees_permit_required",
    singleUsePlasticReduction:
      params.cityLaws?.singleUsePlasticReduction ||
      "straws_on_request_bags_fee",
    lightPollutionControl:
      params.cityLaws?.lightPollutionControl || "minimal_shielding_required",
    publicAssemblyPermitRequirement:
      params.cityLaws?.publicAssemblyPermitRequirement ||
      "over_50_people_or_street_closure",
    graffitiRemovalPolicy:
      params.cityLaws?.graffitiRemovalPolicy || "rapid_removal_public_property",
    panhandlingRestrictions:
      params.cityLaws?.panhandlingRestrictions || "restricted_locations_times",
    campaignFinanceRulesCityElections:
      params.cityLaws?.campaignFinanceRulesCityElections ||
      "contribution_limits_and_disclosure",
    publicWifiAvailability:
      params.cityLaws?.publicWifiAvailability || "parks_and_libraries",
    dataPrivacyPolicyCityServices:
      params.cityLaws?.dataPrivacyPolicyCityServices ||
      "standard_collection_anonymized_reporting",
    surveillanceTechnologyUse:
      params.cityLaws?.surveillanceTechnologyUse ||
      "council_approval_required_public_disclosure",
  },

  politicalLandscape: params.politicalLandscape || [],
});
