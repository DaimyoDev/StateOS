import {
  BASE_COUNTRIES_DATA,
  DEFAULT_COUNTRY_POPULATION_RANGES,
  generateDetailedCountryData,
} from "../data/countriesData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
// REMOVED: Old static data imports
// import { LOBBYING_GROUPS } from "../data/lobbyingData";
// import { NEWS_OUTLETS } from "../data/newsData";
import {
  generateFullCityData,
  generateInitialGovernmentOffices,
} from "../entities/politicialEntities";
import { assignPopulationToCountry } from "../utils/populationUtils";

// ADDED: Import the new generator functions and their dependencies
import {
  generateNewsOutlets,
  generateInitialLobbyingGroups,
} from "../entities/organizationEntities";
import { POLICY_QUESTIONS } from "../data/policyData";

export const createCampaignSetupSlice = (set, get) => {
  return {
    actions: {
      finalizeLocalAreaAndStart: (
        cityName,
        playerPoliticianData,
        allCustomPartiesData,
        availableCountriesData
      ) => {
        const setupState = get().currentCampaignSetup;
        const playerPolitician =
          get().actions.getCurrentlyCreatingPolitician?.() ||
          get().savedPoliticians?.find(
            (p) => p.id === setupState.selectedPoliticianId
          );

        if (
          !cityName?.trim() ||
          !playerPolitician ||
          !setupState.selectedCountryId ||
          !setupState.selectedRegionId
        ) {
          alert(
            "City name, politician, country, and region selection must be complete."
          );
          return;
        }

        const cityGenerationParams = {
          playerDefinedCityName: cityName.trim(),
          countryId: setupState.selectedCountryId,
          regionId: setupState.selectedRegionId,
          basePoliticalLandscape: setupState.regionPoliticalLandscape,
        };
        const newCityObject = generateFullCityData(cityGenerationParams);

        if (!newCityObject) {
          alert("Critical error: Could not generate city data.");
          return;
        }

        const currentCountryData = availableCountriesData.find(
          (c) => c.id === setupState.selectedCountryId
        );

        const currentRegionData = currentCountryData.regions.find(
          (region) => region.id === setupState.selectedRegionId
        );
        const regionalLocationName = currentRegionData
          ? currentRegionData.name
          : "the Region";

        const initialGovernmentOffices = generateInitialGovernmentOffices({
          countryElectionTypes:
            ELECTION_TYPES_BY_COUNTRY[setupState.selectedCountryId] || [],
          city: newCityObject,
          countryData: currentCountryData,
          regionId: setupState.selectedRegionId,
          availableParties: setupState.generatedPartiesInCountry,
          currentYear: 2025,
        });

        playerPoliticianData.campaignFunds = 10000;

        // --- NEW: Dynamically generate news and lobbying ---
        const nationalNews = generateNewsOutlets({
          level: "national",
          parties: setupState.generatedPartiesInCountry,
          locationName: currentCountryData.name,
          countryId: setupState.selectedCountryId,
        });
        const regionalNews = generateNewsOutlets({
          level: "regional",
          parties: setupState.regionPoliticalLandscape,
          locationName: regionalLocationName,
          countryId: setupState.selectedCountryId,
        });

        const allNewsOutlets = [...nationalNews, ...regionalNews];
        const allLobbyingGroups = generateInitialLobbyingGroups(
          POLICY_QUESTIONS,
          setupState.selectedCountryId
        );
        // --- END NEW ---

        const newActiveCampaign = {
          politician: { ...playerPoliticianData },
          countryId: setupState.selectedCountryId,
          regionId: setupState.selectedRegionId,
          partyInfo: setupState.playerPartyChoice,
          customPartiesSnapshot: [...allCustomPartiesData],
          generatedPartiesSnapshot: [...setupState.generatedPartiesInCountry],
          startingCity: newCityObject,
          currentDate: { year: 2025, month: 1, day: 1 },
          elections: [],
          lastElectionYear: {},
          governmentOffices: initialGovernmentOffices,
          viewingElectionNightForDate: null,
          newsAndEvents: [],
          availableCountries: availableCountriesData,
          newsOutlets: allNewsOutlets,
          lobbyingGroups: allLobbyingGroups,
        };

        get().actions.clearAllNews();
        set({ activeCampaign: newActiveCampaign });
        get().actions.navigateTo("CampaignGameScreen");
        get().actions.setActiveMainGameTab("Dashboard");
        get().actions.resetCampaignSetup?.();
        get().actions.generateScheduledElections();
        get().actions.resetLegislationState();
      },
      loadCountries: () => set({ availableCountries: BASE_COUNTRIES_DATA }),
      processAndSelectCountry: (countryId) => {
        set((state) => {
          const selectedCountry = state.availableCountries.find(
            (c) => c.id === countryId
          );
          if (!selectedCountry) return state;

          if (selectedCountry.isProcessed) {
            return {
              currentCampaignSetup: {
                ...state.currentCampaignSetup,
                selectedCountryId: countryId,
                selectedRegionId: null,
                generatedPartiesInCountry:
                  selectedCountry.nationalParties || [],
              },
            };
          }

          let countryToProcess = JSON.parse(JSON.stringify(selectedCountry));

          let processedCountry = assignPopulationToCountry(
            { ...countryToProcess },
            DEFAULT_COUNTRY_POPULATION_RANGES
          );

          processedCountry = generateDetailedCountryData(processedCountry);
          processedCountry.isProcessed = true;

          const updatedCountries = state.availableCountries.map((c) =>
            c.id === countryId ? processedCountry : c
          );

          return {
            availableCountries: updatedCountries,
            currentCampaignSetup: {
              ...state.currentCampaignSetup,
              selectedCountryId: countryId,
              generatedPartiesInCountry: processedCountry.nationalParties || [],
            },
          };
        });
      },
    },
  };
};
