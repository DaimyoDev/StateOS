import { generateId } from "../utils/generalUtils";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import {
  generateRandomOfficeHolder,
  calculateNumberOfSeats,
} from "../utils/electionUtils";
import { generateFullCityData } from "../utils/governmentUtils";

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

            // Determine if this multi-winner election type should be treated as a single body
            // (like U.S. City Council MMD) or generate individual conceptual seats (e.g., Japan BlockVote/SNTV MMD).
            const isMultiWinnerSingleBodyOffice =
              (!electionType.generatesOneWinner && // It's a multi-winner election
                electionType.electoralSystem === "PluralityMMD" &&
                !electionType.id === "city_council_usa") ||
              electionType.electoralSystem === "PartyListPR";

            if (
              electionType.generatesOneWinner ||
              isMultiWinnerSingleBodyOffice
            ) {
              // This path handles:
              // 1. True single-winner offices (e.g., Mayor).
              // 2. Multi-winner offices that should be represented as a single body (e.g., U.S. City Council MMD).

              const numberOfSeatsForOffice = electionType.generatesOneWinner
                ? 1
                : calculateNumberOfSeats(
                    electionType,
                    newCityObject.population
                  );

              let holderForOffice = null;
              let initialMembersArray = undefined; // Will be an array if multi-winner single body

              if (electionType.generatesOneWinner) {
                // For single-winner offices, generate one holder
                holderForOffice = generateRandomOfficeHolder(
                  setupState.generatedPartiesInCountry,
                  officeName, // Use base office name for holder generation context
                  setupState.selectedCountryId
                );
              } else if (isMultiWinnerSingleBodyOffice) {
                // For multi-winner offices treated as a single body, generate multiple members
                initialMembersArray = [];
                const memberRole =
                  electionType.memberRoleName || `Member, ${officeName}`;
                // Loop to generate initial members for the multi-seat body
                for (let i = 0; i < numberOfSeatsForOffice; i++) {
                  const member = generateRandomOfficeHolder(
                    setupState.generatedPartiesInCountry,
                    `${officeName} Member ${i + 1}`, // Provide unique context for each member
                    setupState.selectedCountryId
                  );
                  initialMembersArray.push({
                    id: member.id,
                    name: member.name,
                    holder: member,
                    partyId: member.partyId,
                    partyName: member.partyName,
                    partyColor: member.partyColor,
                    role: memberRole, // Assign the role defined by electionType or default
                    termEnds: {
                      // Inherit termEnds from the body, as they serve the same term
                      year: 2025 + termLength - 1,
                      month: electionType.electionMonth,
                      day: 1,
                    },
                  });
                }
              }

              initialGovernmentOffices.push({
                officeId: `initial_${electionType.id}_${generateId()}`,
                cityName: newCityObject.name,
                cityId: newCityObject.id,
                officeNameTemplateId: electionType.id,
                officeName: officeName,
                level: electionType.level,
                holder: holderForOffice,
                members: initialMembersArray,
                termEnds: {
                  year: 2025 + termLength - 1,
                  month: electionType.electionMonth,
                  day: 1,
                },
                numberOfSeatsToFill: numberOfSeatsForOffice, // ADDED: number of seats for this office entry
              });
            } else {
              // This path handles multi-winner election types that *should* generate individual conceptual seats
              // (e.g., BlockVote or SNTV_MMD where you want individual seat entries).
              const numSeatsInBody = calculateNumberOfSeats(
                electionType,
                newCityObject.population
              );
              for (let s_idx = 0; s_idx < numSeatsInBody; s_idx++) {
                const seatSpecificName = `${officeName} (Seat ${s_idx + 1})`;
                const holderForSeat = generateRandomOfficeHolder(
                  setupState.generatedPartiesInCountry,
                  seatSpecificName, // Use seat-specific name for holder generation context
                  setupState.selectedCountryId
                );

                const parentElectionInstanceIdBase = `${electionType.id}_${newCityObject.id}`;
                const conceptualSeatInstanceIdBase = `${parentElectionInstanceIdBase}_seat${
                  s_idx + 1
                }`;

                initialGovernmentOffices.push({
                  officeId: `initial_${electionType.id}_seat_${
                    s_idx + 1
                  }_${generateId()}`,
                  cityName: newCityObject.name,
                  cityId: newCityObject.id,
                  officeNameTemplateId: electionType.id,
                  officeName: seatSpecificName,
                  level: electionType.level,
                  holder: holderForSeat,
                  termEnds: {
                    year: 2025 + termLength - 1,
                    month: electionType.electionMonth,
                    day: 1,
                  },
                  numberOfSeatsToFill: 1,
                  instanceIdBase: conceptualSeatInstanceIdBase,
                });
              }
            }
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
