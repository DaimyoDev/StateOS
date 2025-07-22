import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import {
  generateFullCityData,
  generateInitialGovernmentOffices,
} from "../entities/politicialEntities";

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
        };

        get().actions.clearAllNews();
        set({ activeCampaign: newActiveCampaign });
        get().actions.navigateTo("CampaignGameScreen");
        get().actions.setActiveMainGameTab("Dashboard");
        get().actions.resetCampaignSetup?.(); // Action from campaignSetupSlice (future)
        get().actions.generateScheduledElections(); // from electionSlice
        get().actions.resetLegislationState();
      },
    },
  };
};
