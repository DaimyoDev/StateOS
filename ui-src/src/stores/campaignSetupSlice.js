import {
  BASE_COUNTRIES_DATA,
  DEFAULT_COUNTRY_POPULATION_RANGES,
  generateDetailedCountryData,
} from "../data/countriesData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import { generateInitialGovernmentOffices } from "../entities/politicalEntities";
import { assignPopulationToCountry } from "../utils/populationUtils";
import { politicians as temporaryPoliticianStore } from "../entities/personnel";

// ADDED: Import the new generator functions and their dependencies
import {
  generateNewsOutlets,
  generateInitialLobbyingGroups,
} from "../entities/organizationEntities";
import { POLICY_QUESTIONS } from "../data/policyData";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getInitialPoliticianSoA = () => ({
  base: new Map(),
  attributes: new Map(),
  policyStances: new Map(),
  ideologyScores: new Map(),
  state: new Map(),
  finances: new Map(),
  background: new Map(),
  campaign: new Map(),
  staff: new Map(),
});

const getPoliticianFromSoA = (id, soaStore) => {
  const base = soaStore.base.get(id);
  if (!base) return null;
  return {
    ...base,
    attributes: soaStore.attributes.get(id) || {},
    policyStances: Object.fromEntries(
      soaStore.policyStances.get(id) || new Map()
    ),
    ideologyScores: soaStore.ideologyScores.get(id) || {},
    ...(soaStore.finances.get(id) || {}),
    background: soaStore.background.get(id) || {},
  };
};

export const createCampaignSetupSlice = (set, get) => {
  return {
    actions: {
      // --- REFACTORED to be an async function ---
      finalizeLocalAreaAndStart: async (
        selectedCityObject,
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
          addPoliticianToStore,
          clearTemporaryPoliticians,
        } = get().actions;

        setLoadingGame(true, "Initializing world generation...");
        await pause(50);

        const setupState = get().currentCampaignSetup;
        const savedPoliticiansSoA = get().savedPoliticians;

        const playerPoliticianData = getPoliticianFromSoA(
          setupState.selectedPoliticianId,
          savedPoliticiansSoA
        );

        if (
          !selectedCityObject ||
          !playerPoliticianData ||
          !setupState.selectedCountryId ||
          !setupState.selectedRegionId
        ) {
          alert(
            "City, politician, country, and region selection must be complete."
          );
          setLoadingGame(false);
          return;
        }

        setLoadingGame(true, "Establishing your starting city...");
        await pause(20);

        // Temporarily set a placeholder activeCampaign to allow nested state updates
        set({ activeCampaign: { politicians: getInitialPoliticianSoA() } });

        // Add the player to the campaign's SoA store
        addPoliticianToStore(
          { ...playerPoliticianData, isPlayer: true },
          "activeCampaign.politicians"
        );

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
          city: selectedCityObject,
          countryData: currentCountryData,
          regionId: setupState.selectedRegionId,
          availableParties: setupState.generatedPartiesInCountry,
          currentYear: 2025,
        });

        const allInitialPoliticianIds = new Set();
        initialGovernmentOffices.forEach((office) => {
          if (office.holderId) allInitialPoliticianIds.add(office.holderId);
          if (office.memberIds)
            office.memberIds.forEach((id) => allInitialPoliticianIds.add(id));
        });

        allInitialPoliticianIds.forEach((id) => {
          const polData = getPoliticianFromSoA(id, temporaryPoliticianStore);
          if (polData) {
            addPoliticianToStore(polData, "activeCampaign.politicians");
          }
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
          regionId: setupState.selectedRegionId,
        });
        const regionalNews = generateNewsOutlets({
          level: "regional",
          parties: setupState.regionPoliticalLandscape,
          locationName: regionalLocationName,
          countryId: setupState.selectedCountryId,
          regionId: setupState.selectedRegionId,
        });
        const allLobbyingGroups = generateInitialLobbyingGroups({
          policyQuestions: POLICY_QUESTIONS,
          countryId: setupState.selectedCountryId,
        });

        initializeRelationships(Array.from(allInitialPoliticianIds));

        setLoadingGame(true, "Finalizing...");
        await pause(20);

        set((state) => ({
          activeCampaign: {
            ...state.activeCampaign,
            playerPoliticianId: playerPoliticianData.id,
            countryId: setupState.selectedCountryId,
            regionId: setupState.selectedRegionId,
            partyInfo: setupState.playerPartyChoice,
            customPartiesSnapshot: [...allCustomPartiesData],
            generatedPartiesSnapshot: [...setupState.generatedPartiesInCountry],
            startingCity: selectedCityObject,
            currentDate: { year: 2025, month: 1, day: 1 },
            elections: [],
            lastElectionYear: {},
            governmentOffices: initialGovernmentOffices,
            newsOutlets: [...nationalNews, ...regionalNews],
            lobbyingGroups: allLobbyingGroups,
            availableCountries: availableCountriesData,
          },
        }));

        clearAllNews();

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
        clearTemporaryPoliticians();

        setLoadingGame(false);
      },
      loadCountries: () => set({ availableCountries: BASE_COUNTRIES_DATA }),
      processAndSelectCountry: async (countryId) => {
        const { setLoadingGame } = get().actions;

        // --- STEP 1: Show the initial loading screen ---
        setLoadingGame(true, "Beginning world generation...");
        await pause(50); // Give React time to render

        const currentCountries = get().availableCountries;
        const selectedCountry = currentCountries.find(
          (c) => c.id === countryId
        );
        if (!selectedCountry) return;

        // If already processed, just set the ID and hide loading screen
        if (selectedCountry.isProcessed) {
          set((state) => ({
            currentCampaignSetup: {
              ...state.currentCampaignSetup,
              selectedCountryId: countryId,
              generatedPartiesInCountry: selectedCountry.nationalParties || [],
            },
          }));
          setLoadingGame(false); // Hide loading screen
          return;
        }

        let countryToProcess = JSON.parse(JSON.stringify(selectedCountry));

        setLoadingGame(true, "Calculating population distributions...");
        await pause(20);
        let processedCountry = assignPopulationToCountry(
          countryToProcess,
          DEFAULT_COUNTRY_POPULATION_RANGES
        );

        setLoadingGame(true, "Generating detailed regional data...");
        await pause(20);
        processedCountry = generateDetailedCountryData(processedCountry);
        processedCountry.isProcessed = true;

        setLoadingGame(true, "Finalizing country setup...");
        await pause(20);
        const updatedCountries = currentCountries.map((c) =>
          c.id === countryId ? processedCountry : c
        );

        set({
          availableCountries: updatedCountries,
          currentCampaignSetup: {
            ...get().currentCampaignSetup,
            selectedCountryId: countryId,
            generatedPartiesInCountry: processedCountry.nationalParties || [],
          },
        });

        // --- STEP 2: Hide the loading screen ---
        setLoadingGame(false);
      },
    },
  };
};
