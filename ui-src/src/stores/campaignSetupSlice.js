import { generateId, getRandomInt } from "../utils/generalUtils";
import {
  calculateNumberOfSeats,
  generateRandomOfficeHolder,
  getElectionInstances,
} from "../utils/electionUtils"; // Import buildInstanceIdBase
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";
import {
  isMayorLikeElection,
  isCityCouncilElectionType,
} from "../utils/electionGenUtils";
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

      countryElectionTypes.forEach((electionType) => {
        // Determine if this electionType should generate an initial office holder for the starting city/region/country
        // We are focusing on local (city) offices for initial setup, but can extend to state/national if desired.
        // IMPORTANT: Re-use getElectionInstances and its helpers for consistent office name/instance ID generation
        // This avoids duplicating complex logic here and ensures consistency with electionSlice.js.

        const electionInstances = getElectionInstances(
          // Use get().actions to call it from electionSlice
          electionType,
          {
            // Pass minimal activeCampaign-like context
            countryId: setupState.selectedCountryId,
            regionId: setupState.selectedRegionId,
            startingCity: newCityObject,
            availableCountries: availableCountriesData,
          }
        );

        electionInstances.forEach((instanceContext) => {
          const {
            resolvedOfficeName,
            instanceIdBase,
            entityData,
            _isSingleSeatContest,
            _effectiveElectoralSystem,
            _effectiveGeneratesOneWinner,
          } = instanceContext;

          // Only create initial holders for offices that should have one at start (e.g., mayor, simple legislative seats)
          // Skip large multi-member bodies that are only populated by elections (like full PR parliaments)
          // For city councils, we want individual seats to be initialized.
          // Check if it's a type that *should* have an initial holder
          const shouldInitializeHolder =
            isMayorLikeElection(electionType, setupState.selectedCountryId) ||
            (isCityCouncilElectionType(
              electionType,
              setupState.selectedCountryId
            ) &&
              _isSingleSeatContest) || // If it's a single conceptual seat
            (!electionType.generatesOneWinner &&
              electionType.electoralSystem === "PartyListPR") || // Or if it's an at-large PR, then initialize the body
            (electionType.generatesOneWinner &&
              (electionType.level.includes("state") ||
                electionType.level.includes("national")) &&
              !electionType.id.includes("constituency") &&
              !electionType.id.includes("district"));

          if (shouldInitializeHolder) {
            // Generate a random holder for this specific instance
            const holder = generateRandomOfficeHolder(
              setupState.generatedPartiesInCountry,
              resolvedOfficeName, // Use the already resolved name
              setupState.selectedCountryId
            );

            // Correctly set termEnds based on initial year (e.g., 2025) and term length
            const initialYear = 2025; // Assuming campaign always starts in 2025
            const termLength = electionType.frequencyYears || 4; // Use electionType's frequency
            const termEndDate = {
              year: initialYear + termLength - 1, // Term ends in the year before new term starts
              month: electionType.electionMonth || getRandomInt(1, 12), // Use election's month or random
              day: getRandomInt(1, 28), // Random day
            };

            const officeEntry = {
              officeId: `initial_${instanceIdBase}_${generateId()}`, // Use resolved instanceIdBase
              cityName: entityData.name, // Use the entity's name (city or district)
              cityId: entityData.id, // Use the entity's ID (city or district)
              officeNameTemplateId: electionType.id,
              officeName: resolvedOfficeName, // Use the fully resolved office name
              level: electionType.level,
              holder,
              termEnds: termEndDate,
              instanceIdBase: instanceIdBase, // Fix: Add instanceIdBase
            };

            // For multi-member legislative bodies (like PR councils that aren't exploded into seats)
            if (
              !electionType.generatesOneWinner &&
              (electionType.electoralSystem === "PartyListPR" ||
                electionType.electoralSystem === "MMP")
            ) {
              // This branch handles the creation of the *body itself* with its members if it's a legislative body.
              // This setup assumes such bodies initially have a full set of members.
              const numSeats = calculateNumberOfSeats(
                electionType,
                entityData.population
              );
              const initialMembers = [];
              const initialCompositionByParty = {};
              for (let i = 0; i < numSeats; i++) {
                const memberHolder = generateRandomOfficeHolder(
                  setupState.generatedPartiesInCountry,
                  resolvedOfficeName,
                  setupState.selectedCountryId
                );
                initialMembers.push({
                  id: memberHolder.id,
                  name: memberHolder.name,
                  partyId: memberHolder.partyId,
                  partyName: memberHolder.partyName,
                  partyColor: memberHolder.partyColor,
                  role:
                    electionType.memberRoleName ||
                    `Member, ${resolvedOfficeName}`,
                  termEnds: termEndDate,
                });
                initialCompositionByParty[memberHolder.partyId] =
                  (initialCompositionByParty[memberHolder.partyId] || 0) + 1;
              }
              initialGovernmentOffices.push({
                officeId: `initial_body_${instanceIdBase}_${generateId()}`,
                cityName: entityData.name,
                cityId: entityData.id,
                officeNameTemplateId: electionType.id,
                officeName: resolvedOfficeName,
                level: electionType.level,
                holder: null, // No single holder for the body itself
                members: initialMembers,
                termEnds: termEndDate,
                currentCompositionByParty: initialCompositionByParty,
                instanceIdBase: instanceIdBase, // Fix: Add instanceIdBase
              });
            } else if (
              electionType.generatesOneWinner ||
              (isCityCouncilElectionType(
                electionType,
                setupState.selectedCountryId
              ) &&
                _isSingleSeatContest)
            ) {
              // This branch handles all single-winner offices (Mayor, District-based legislators, conceptual city council seats)
              initialGovernmentOffices.push(officeEntry);
            }
          }
        }); // End forEach instanceContext
      }); // End forEach electionType

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
