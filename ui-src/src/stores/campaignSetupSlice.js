import {
  BASE_COUNTRIES_DATA,
  DEFAULT_COUNTRY_POPULATION_RANGES,
  generateDetailedCountryData,
} from "../data/countriesData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import {
  generateInitialGovernmentOffices,
  flattenGovernmentOffices,
} from "../entities/politicalEntities";
import { assignPopulationToCountry } from "../utils/populationUtils";

// ADDED: Import the new generator functions and their dependencies
import {
  generateNewsOutlets,
  generateInitialLobbyingGroups,
  generatePollingFirms,
} from "../entities/organizationEntities";
import { POLICY_QUESTIONS } from "../data/policyData";
import { generateAllGovernmentDepartments } from "../entities/departmentEntities";

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
    ...(soaStore.campaign.get(id) || {}),
    ...(soaStore.state.get(id) || {}),
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
          addMultiplePoliticiansToStore,
        } = get().actions;

        setLoadingGame(true, "Initializing world generation...");
        await pause(50);

        const setupState = get().currentCampaignSetup;
        const savedPoliticiansSoA = get().savedPoliticians;

        const playerPoliticianData = getPoliticianFromSoA(
          setupState.selectedPoliticianId,
          savedPoliticiansSoA
        );

        const finalPlayerPoliticianData = {
          ...playerPoliticianData,
          // Set partyId from the choice, or null if independent
          partyId:
            setupState.playerPartyChoice?.type !== "independent"
              ? setupState.playerPartyChoice?.id
              : null,
        };

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
          { ...finalPlayerPoliticianData, isPlayer: true },
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

        // Extract politicians from the hierarchical structure
        const initialPoliticians = [];
        const flatOffices = flattenGovernmentOffices(initialGovernmentOffices);
        flatOffices.forEach((office) => {
          if (office.holder) {
            initialPoliticians.push(office.holder);
          }
          if (office.members) {
            initialPoliticians.push(...office.members);
          }
        });

        // 2. Add them all to the central activeCampaign.politicians store in one batch.
        if (initialPoliticians.length > 0) {
          addMultiplePoliticiansToStore(
            initialPoliticians,
            "activeCampaign.politicians"
          );
        }

        // 3. Gather their IDs to initialize relationships.
        const allInitialPoliticianIds = initialPoliticians.map((p) => p.id);
        initializeRelationships(allInitialPoliticianIds);

        setLoadingGame(true, "Setting up government departments...");
        await pause(20);
        const governmentDepartments = generateAllGovernmentDepartments({
          countryId: setupState.selectedCountryId,
          countryData: currentCountryData,
          availableParties: setupState.generatedPartiesInCountry,
          selectedRegionId: setupState.selectedRegionId,
          selectedCityId: selectedCityObject.id,
          cityBudget: selectedCityObject.stats?.budget,
        });

        // Add department heads to the politician store
        const departmentPoliticians = [];
        Object.values(governmentDepartments).forEach(departmentArray => {
          departmentArray.forEach(department => {
            if (department.head) {
              departmentPoliticians.push(department.head);
            }
          });
        });

        if (departmentPoliticians.length > 0) {
          addMultiplePoliticiansToStore(
            departmentPoliticians,
            "activeCampaign.politicians"
          );
          // Add department head IDs to relationship initialization
          const departmentHeadIds = departmentPoliticians.map(p => p.id);
          initializeRelationships([...allInitialPoliticianIds, ...departmentHeadIds]);
        }

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
        setLoadingGame(true, "Establishing polling and survey groups...");
        await pause(20);
        const nationalPollingFirms = generatePollingFirms({
          level: "national",
          locationName: currentCountryData.name,
        });
        const regionalPollingFirms = generatePollingFirms({
          level: "regional",
          locationName: regionalLocationName,
        });

        initializeRelationships(Array.from(allInitialPoliticianIds));

        setLoadingGame(true, "Finalizing...");
        await pause(20);

        // Find the parent state data
        const parentStateData = currentCountryData.regions.find(
          (region) => region.id === setupState.selectedRegionId
        );

        set((state) => ({
          activeCampaign: {
            ...state.activeCampaign,
            playerPoliticianId: playerPoliticianData.id,
            politician: {
              ...playerPoliticianData,
              regionId: setupState.selectedRegionId,
              startingCity: selectedCityObject,
            },
            countryId: setupState.selectedCountryId,
            regionId: setupState.selectedRegionId,
            partyInfo: setupState.playerPartyChoice,
            customPartiesSnapshot: [...allCustomPartiesData],
            generatedPartiesSnapshot: [...setupState.generatedPartiesInCountry],
            startingCity: selectedCityObject,
            parentState: parentStateData, // Add parent state data
            currentDate: { year: 2025, month: 1, day: 1 },
            elections: [],
            lastElectionYear: {},
            governmentOffices: initialGovernmentOffices,
            governmentDepartments: governmentDepartments,
            newsOutlets: [...nationalNews, ...regionalNews],
            lobbyingGroups: allLobbyingGroups,
            pollingFirms: [...nationalPollingFirms, ...regionalPollingFirms],
            availableCountries: availableCountriesData,
            politicianIdsWithSpentHours: new Set(),
            country: currentCountryData,
            regions: currentCountryData.regions,
          },
        }));

        clearAllNews();

        setLoadingGame(true, "Assembling staff talent pool...");
        await pause(20);
        if (generateTalentPool) {
          generateTalentPool(setupState.selectedCountryId);
        }

        setLoadingGame(true, "Creating elections and candidates...");
        await pause(30);

        setLoadingGame(true, "Generating coalition systems...");
        await pause(20);

        // Generate coalitions during campaign setup to avoid runtime regeneration
        const coalitionSystems = {};
        const { generateCoalitions } = await import(
          "../General Scripts/CoalitionSystem.js"
        );
        const availableParties = [
          ...setupState.generatedPartiesInCountry,
          ...allCustomPartiesData,
        ];

        // Helper function to generate coalitions for any entity with demographics and policy profile
        const generateCoalitionsForEntity = (entityId, entity, entityType) => {
          const electorateProfile =
            entity?.stats?.electoratePolicyProfile ||
            entity?.electoratePolicyProfile;
          const demographics = entity?.demographics;

          if (demographics) {
            // Generate coalitions using demographics and default electorate profile
            const defaultElectorateProfile =
              currentCountryData.stats?.electoratePolicyProfile || {};
            coalitionSystems[`${entityType}_${entityId}`] = generateCoalitions(
              defaultElectorateProfile,
              demographics,
              availableParties
            );
          } else {
            // Create basic coalitions using country-level defaults if no demographics
            const defaultElectorateProfile =
              currentCountryData.stats?.electoratePolicyProfile || {};
            const defaultDemographics = currentCountryData.demographics || {
              ageDistribution: { young: 25, adult: 50, senior: 25 },
              urbanization: 50,
            };
            coalitionSystems[`${entityType}_${entityId}`] = generateCoalitions(
              defaultElectorateProfile,
              defaultDemographics,
              availableParties
            );
            console.log(
              `Generated default coalitions for ${entityType}: ${
                entity?.name || entityId
              }`
            );
          }
        };

        // 1. Generate coalitions for all cities in the selected state/region
        const allCitiesInRegion = currentRegionData?.cities || [];
        allCitiesInRegion.forEach((city) => {
          generateCoalitionsForEntity(city.id, city, "city");
        });

        // 2. Generate coalitions for all states/regions in the country
        currentCountryData.regions?.forEach((region) => {
          generateCoalitionsForEntity(region.id, region, "state");
        });

        // 3. Generate coalitions for congressional districts (only if they have proper demographic data)
        const congressionalDistricts =
          currentCountryData.congressionalDistricts ||
          currentCountryData.nationalLowerHouseDistricts ||
          [];
        congressionalDistricts.forEach((district) => {
          // Only generate coalitions for districts that have actual demographic data
          if (district.demographics || district.stats?.electoratePolicyProfile) {
            generateCoalitionsForEntity(
              district.id,
              district,
              "congressional_district"
            );
            console.log(`Generated coalitions for congressional district: ${district.name || district.id}`);
          } else {
            console.log(`Skipped coalition generation for congressional district ${district.name || district.id} - insufficient demographic data`);
          }
        });

        // 4. Generate coalitions for state legislative districts (only if they have proper demographic data)
        currentCountryData.regions?.forEach((region) => {
          // State house districts
          if (region.legislativeDistricts?.house) {
            region.legislativeDistricts.house.forEach((district) => {
              if (district.demographics || district.stats?.electoratePolicyProfile) {
                generateCoalitionsForEntity(
                  district.id,
                  district,
                  "state_house_district"
                );
                console.log(`Generated coalitions for state house district: ${district.name || district.id}`);
              } else {
                console.log(`Skipped coalition generation for state house district ${district.name || district.id} - insufficient demographic data`);
              }
            });
          }

          // State senate districts
          if (region.legislativeDistricts?.senate) {
            region.legislativeDistricts.senate.forEach((district) => {
              if (district.demographics || district.stats?.electoratePolicyProfile) {
                generateCoalitionsForEntity(
                  district.id,
                  district,
                  "state_senate_district"
                );
                console.log(`Generated coalitions for state senate district: ${district.name || district.id}`);
              } else {
                console.log(`Skipped coalition generation for state senate district ${district.name || district.id} - insufficient demographic data`);
              }
            });
          }
        });

        // 5. Generate coalitions for secondary regions (counties, provinces, etc.)
        // Counties are stored in currentCountryData.secondAdminRegions, not in region.counties
        const counties = currentCountryData.secondAdminRegions || [];
        counties.forEach((county) => {
          generateCoalitionsForEntity(county.id, county, "county");
        });

        // Also check for any subregions at the region level
        currentCountryData.regions?.forEach((region) => {
          if (region.subregions) {
            region.subregions.forEach((subregion) => {
              generateCoalitionsForEntity(subregion.id, subregion, "subregion");
            });
          }
        });

        // 6. Generate national-level coalitions
        generateCoalitionsForEntity(
          currentCountryData.id,
          currentCountryData,
          "national"
        );

        navigateTo("CampaignGameScreen");
        setActiveMainGameTab("Dashboard");
        resetCampaignSetup?.();
        generateScheduledElections();
        resetLegislationState();

        // Store pre-generated coalitions in activeCampaign
        console.log(`[COALITION SETUP] Generated coalition systems:`, Object.keys(coalitionSystems));
        set((state) => ({
          activeCampaign: {
            ...state.activeCampaign,
            coalitionSystems,
          },
        }));

        // Don't clear temporary politicians - they're referenced by government offices
        // clearTemporaryPoliticians();

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

        // Work directly with the original object since there are no race conditions
        // This eliminates unnecessary memory usage from copying large country objects
        let countryToProcess = selectedCountry;

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
