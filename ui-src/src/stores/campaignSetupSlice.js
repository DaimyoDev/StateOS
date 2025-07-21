import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import {
  generateRandomOfficeHolder,
  calculateNumberOfSeats,
} from "../utils/electionUtils";
import { generateFullCityData } from "../entities/politicialEntities";
import { generateId } from "../utils/core";

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

        const initialGovernmentOffices = [];
        const countryElectionTypes =
          ELECTION_TYPES_BY_COUNTRY[setupState.selectedCountryId] || [];

        countryElectionTypes.forEach((electionType) => {
          // Process only relevant offices for this setup
          if (
            !electionType.level.startsWith("local_") &&
            !electionType.level.startsWith("regional_") &&
            !electionType.level.startsWith("national_")
          ) {
            return;
          }

          let officeName = electionType.officeNameTemplate;
          if (electionType.level.startsWith("local_")) {
            officeName = officeName.replace(
              /{cityNameOrMunicipalityName}|{cityName}/g,
              cityName.trim()
            );
          } else if (electionType.level.startsWith("regional_")) {
            const regionData = currentCountryData?.regions?.find(
              (r) => r.id === setupState.selectedRegionId
            );
            officeName = officeName.replace(
              /{regionName}|{stateName}|{prefectureName}|{provinceName}/g,
              regionData?.name || "Region"
            );
          } else if (electionType.level.startsWith("national_")) {
            officeName = officeName.replace(
              "{countryName}",
              currentCountryData?.name || "Nation"
            );
          }

          const termLength = electionType.frequencyYears || 4;

          // --- REFACTORED AND CORRECTED LOGIC ---

          if (electionType.generatesOneWinner) {
            // --- PATH A: Handles all single-winner offices (Mayor, Governor, etc.) ---
            const holder = generateRandomOfficeHolder(
              setupState.generatedPartiesInCountry,
              officeName,
              setupState.selectedCountryId
            );

            initialGovernmentOffices.push({
              officeId: `initial_${electionType.id}_${generateId()}`,
              officeName: officeName,
              officeNameTemplateId: electionType.id,
              level: electionType.level,
              cityId: newCityObject.id, // Ensure cityId is attached for local offices
              holder: holder,
              members: [], // Single-winner offices have no members array
              termEnds: {
                year: 2025 + termLength - 1,
                month: electionType.electionMonth || 11,
                day: 1,
              },
              numberOfSeatsToFill: 1,
            });
          } else {
            // --- PATH B: Handles all multi-winner offices (Councils, Legislatures) as a single body ---
            const numberOfSeats = calculateNumberOfSeats(
              electionType,
              newCityObject.population
            );

            if (numberOfSeats <= 0) return; // Don't create an office with no seats

            const initialMembers = [];
            for (let i = 0; i < numberOfSeats; i++) {
              const member = generateRandomOfficeHolder(
                setupState.generatedPartiesInCountry,
                `${officeName} Member ${i + 1}`, // Provide unique context for generation
                setupState.selectedCountryId
              );
              initialMembers.push(member); // Add the clean politician object
            }

            initialGovernmentOffices.push({
              officeId: `initial_${electionType.id}_${generateId()}`,
              officeName: officeName,
              officeNameTemplateId: electionType.id,
              level: electionType.level,
              cityId: newCityObject.id, // Ensure cityId is attached for local offices
              holder: null, // Multi-winner bodies have no single holder
              members: initialMembers,
              termEnds: {
                year: 2025 + termLength - 1,
                month: electionType.electionMonth || 11,
                day: 1,
              },
              numberOfSeatsToFill: numberOfSeats,
            });
          }
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
