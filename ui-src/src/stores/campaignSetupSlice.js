import {
  BASE_COUNTRIES_DATA,
  DEFAULT_COUNTRY_POPULATION_RANGES,
  generateDetailedCountryData,
} from "../data/countriesData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import { LOBBYING_GROUPS } from "../data/lobbyingData";
import { NEWS_OUTLETS } from "../data/newsData";
import {
  generateFullCityData,
  generateInitialGovernmentOffices,
} from "../entities/politicialEntities";
import { assignPopulationToCountry } from "../utils/populationUtils";

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
          ); // Get player data

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

        const initialGovernmentOffices = generateInitialGovernmentOffices({
          countryElectionTypes:
            ELECTION_TYPES_BY_COUNTRY[setupState.selectedCountryId] || [],
          city: newCityObject,
          countryData: currentCountryData,
          regionId: setupState.selectedRegionId,
          availableParties: setupState.generatedPartiesInCountry,
          currentYear: 2025, // or get from a central source
        });

        playerPoliticianData.campaignFunds = 10000;

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
          newsOutlets: NEWS_OUTLETS,
          lobbyingGroups: LOBBYING_GROUPS,
        };

        get().actions.clearAllNews();
        set({ activeCampaign: newActiveCampaign });
        get().actions.navigateTo("CampaignGameScreen");
        get().actions.setActiveMainGameTab("Dashboard");
        get().actions.resetCampaignSetup?.(); // Action from campaignSetupSlice (future)
        get().actions.generateScheduledElections(); // from electionSlice
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

          // --- THE UNIFIED PIPELINE ---
          // 1. Assign Population: Create a fresh copy and assign populations.
          let processedCountry = assignPopulationToCountry(
            { ...countryToProcess }, // Use a copy to avoid state mutation issues
            DEFAULT_COUNTRY_POPULATION_RANGES
          );

          // 2. Generate Districts, State Stats, and Political Landscapes
          processedCountry = generateDetailedCountryData(processedCountry);

          // 3. Mark as processed to prevent re-doing the work
          processedCountry.isProcessed = true;

          // 4. Update the state with the fully processed country object
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
