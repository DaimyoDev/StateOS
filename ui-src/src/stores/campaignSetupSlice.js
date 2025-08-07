import {
  BASE_COUNTRIES_DATA,
  DEFAULT_COUNTRY_POPULATION_RANGES,
  generateDetailedCountryData,
} from "../data/countriesData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import { generateInitialGovernmentOffices } from "../entities/politicalEntities";
import { assignPopulationToCountry } from "../utils/populationUtils";

// ADDED: Import the new generator functions and their dependencies
import {
  generateNewsOutlets,
  generateInitialLobbyingGroups,
} from "../entities/organizationEntities";
import { POLICY_QUESTIONS } from "../data/policyData";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createCampaignSetupSlice = (set, get) => {
  return {
    actions: {
      // --- REFACTORED to be an async function ---
      finalizeLocalAreaAndStart: async (
        selectedCityObject,
        playerPoliticianData,
        allCustomPartiesData,
        availableCountriesData
      ) => {
        const {
          setLoadingGame,
          navigateTo,
          setActiveMainGameTab,
          resetCampaignSetup,
          generateScheduledElections,
          resetLegislationState,
          clearAllNews,
          initializeRelationships,
          generateTalentPool,
        } = get().actions;

        // --- STEP 1: Show the initial loading screen ---
        setLoadingGame(true, "Initializing world generation...");
        await pause(50); // Give React time to render the loading screen

        const setupState = get().currentCampaignSetup;
        const playerPolitician = get().savedPoliticians?.find(
          (p) => p.id === setupState.selectedPoliticianId
        );

        if (
          !selectedCityObject ||
          !playerPolitician ||
          !setupState.selectedCountryId ||
          !setupState.selectedRegionId
        ) {
          alert(
            "City, politician, country, and region selection must be complete."
          );
          setLoadingGame(false);
          return;
        }

        // --- STEP 2: Perform generation logic in sequential, awaited steps ---

        setLoadingGame(true, "Establishing your starting city...");
        await pause(20);
        const newCityObject = selectedCityObject;
        if (!newCityObject) {
          alert("Critical error: Could not generate city data.");
          setLoadingGame(false);
          return;
        }

        setLoadingGame(true, "Forming the government...");
        await pause(20);
        const currentCountryData = availableCountriesData.find(
          (c) => c.id === setupState.selectedCountryId
        );
        const currentRegionData = currentCountryData.regions.find(
          (region) => region.id === setupState.selectedRegionId
        );
        const initialGovernmentOffices = generateInitialGovernmentOffices({
          countryElectionTypes:
            ELECTION_TYPES_BY_COUNTRY[setupState.selectedCountryId] || [],
          city: newCityObject,
          countryData: currentCountryData,
          regionId: setupState.selectedRegionId,
          availableParties: setupState.generatedPartiesInCountry,
          currentYear: 2025,
        });

        setLoadingGame(true, "Setting up media and special interests...");
        await pause(20);
        const regionalLocationName = currentRegionData
          ? currentRegionData.name
          : "the Region";
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
        const allLobbyingGroups = generateInitialLobbyingGroups({
          policyQuestions: POLICY_QUESTIONS,
          countryId: setupState.selectedCountryId,
        });

        const allInitialPoliticians = initialGovernmentOffices
          .flatMap(
            (office) => office.members || (office.holder ? [office.holder] : [])
          )
          .filter(Boolean);
        initializeRelationships(allInitialPoliticians);

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

        // --- STEP 3: Finalize state and navigate ---
        setLoadingGame(true, "Finalizing...");
        await pause(20);

        clearAllNews();
        set({ activeCampaign: newActiveCampaign });

        setLoadingGame(true, "Assembling staff talent pool...");
        await pause(20);
        if (generateTalentPool) {
          generateTalentPool(setupState.selectedCountryId);
        }

        navigateTo("CampaignGameScreen");
        setActiveMainGameTab("Dashboard");
        resetCampaignSetup?.();
        generateScheduledElections();
        resetLegislationState();

        // Hide the loading screen after everything is done
        setLoadingGame(false);
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
