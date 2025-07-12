import { generateId } from "../utils/generalUtils";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import {
  generateRandomOfficeHolder,
  calculateNumberOfSeats,
} from "../utils/electionUtils";
import { generateFullCityData } from "../utils/governmentUtils";

export const createCampaignSetupSlice = (set, get) => {
  return {
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
        // Pass the regional political landscape as a base for the city's landscape
        basePoliticalLandscape: setupState.regionPoliticalLandscape,
        // populationHint: someValueIfPlayerSelectedIt, // Optional
        // archetypeHint: someValueIfPlayerSelectedIt, // Optional
      };
      const newCityObject = generateFullCityData(cityGenerationParams);

      if (!newCityObject) {
        alert("Critical error: Could not generate city data.");
        return;
      }
      const initialGovernmentOffices = [];
      const countryElectionTypes =
        ELECTION_TYPES_BY_COUNTRY[setupState.selectedCountryId] || [];
      const currentCountryData = availableCountriesData.find(
        (c) => c.id === setupState.selectedCountryId
      );
      console.log(countryElectionTypes);
      countryElectionTypes.forEach((electionType) => {
        if (
          electionType.level.startsWith("local_") ||
          electionType.level.startsWith("regional_") ||
          electionType.level === "national"
        ) {
          let officeName = electionType.officeNameTemplate;
          if (electionType.level.startsWith("local_"))
            officeName = officeName.replace("{cityName}", cityName.trim());
          else if (electionType.level.startsWith("regional_")) {
            const regionData = currentCountryData?.regions?.find(
              (r) => r.id === setupState.selectedRegionId
            );
            officeName = officeName.replace(
              "{regionName}",
              regionData?.name || "Region"
            );
          }
          const termLength = electionType.frequencyYears || 4;
          const createOfficeEntry = (specificOfficeName, isSeatArg) => {
            const holder = generateRandomOfficeHolder(
              setupState.generatedPartiesInCountry,
              specificOfficeName,
              setupState.selectedCountryId
            );
            let seatNumberSuffix = "";
            if (isSeatArg) {
              // Regex to find "Seat " followed by one or more digits in parentheses,
              // and capture the digits.
              const seatMatch = specificOfficeName.match(/Seat\s+(\d+)\)/);
              const seatNumber = seatMatch && seatMatch[1] ? seatMatch[1] : "X"; // Use captured number or fallback to "X"
              seatNumberSuffix = `_seat_${seatNumber}`;
            }
            initialGovernmentOffices.push({
              officeId: `initial_${
                electionType.id
              }${seatNumberSuffix}_${generateId()}`,
              cityName: newCityObject.name,
              cityId: newCityObject.id,
              officeNameTemplateId: electionType.id,
              officeName: specificOfficeName,
              level: electionType.level,
              holder,
              termEnds: {
                year: 2025 + termLength - 1,
                month: electionType.electionMonth,
                day: 1,
              },
            });
          };

          if (electionType.generatesOneWinner)
            createOfficeEntry(officeName, false);
          else {
            const numSeats = calculateNumberOfSeats(
              electionType,
              newCityObject.population
            );
            for (let s_idx = 0; s_idx < numSeats; s_idx++) {
              // Use s_idx to avoid conflicts
              const seatSpecificName = `${officeName} (Seat ${s_idx + 1})`;
              createOfficeEntry(seatSpecificName, true);
            }
          }
        }
      });

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
  };
};
