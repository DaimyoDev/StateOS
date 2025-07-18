// ui-src/src/stores/electionSlice.js
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData.js"; // Ensure path is correct
import {
  generateId,
  getRandomInt,
  calculateAdultPopulation,
  createDateObj,
} from "../utils/generalUtils.js";
import { defaultTheme, themes } from "../themes.js";
import {
  calculateRandomVoterTurnout,
  calculateBaseCandidateScore,
  getElectionInstances,
  getIncumbentsForOfficeInstance,
  calculateSeatDetailsForInstance,
  generateElectionParticipants,
  initializeElectionObject,
  distributePopulationToSeats,
  normalizePolling,
} from "../utils/electionUtils.js";
import { calculateElectionOutcome } from "../utils/electionResultsUtils.js";

const getFullPoliticianById = (
  politicianId,
  campaignData,
  electionPoliticians = []
) => {
  if (!campaignData) return null;

  // 1. Check current campaign's player politician
  if (campaignData.politician && campaignData.politician.id === politicianId) {
    return campaignData.politician;
  }

  // 2. Search through all existing government office holders and members
  for (const office of campaignData.governmentOffices || []) {
    if (office.holder && office.holder.id === politicianId) {
      return office.holder;
    }
    if (office.members) {
      const member = office.members.find((m) => m.id === politicianId);
      if (member) return member;
    }
  }

  // 3. NEW: Check the pool of politicians generated for THIS specific election
  // This pool is expected to contain the full politician objects for all candidates (newly generated and incumbents)
  const electionSpecificPolitician = electionPoliticians.find(
    (p) => p.id === politicianId
  );
  if (electionSpecificPolitician) {
    return electionSpecificPolitician;
  }

  return null; // Politician not found with full details
};

const INCUMBENT_RUNS_CHANCE = 0.8;
const POSSIBLE_POLICY_FOCUSES_FOR_ELECTION_SLICE = [
  "Economic Growth",
  "Public Safety",
  "Education Quality",
  "Infrastructure Development",
  "Healthcare Access",
  "Social Welfare",
];

export const createElectionSlice = (set) => ({
  generateScheduledElections: () => {
    set((state) => {
      if (
        !state.activeCampaign ||
        !state.activeCampaign.countryId ||
        !state.activeCampaign.currentDate ||
        !state.activeCampaign.availableCountries ||
        !state.activeCampaign.politician // For player context if needed by utils
      ) {
        console.warn("generateScheduledElections: Core campaign data missing.");
        return {};
      }

      const {
        currentDate,
        countryId,
        elections: existingElections = [],
        lastElectionYear: lastElectionYearsByInstanceIdBase = {},
        governmentOffices = [],
      } = state.activeCampaign;

      const countryElectionTypes = ELECTION_TYPES_BY_COUNTRY[countryId];
      if (!countryElectionTypes || countryElectionTypes.length === 0) {
        console.warn(
          `generateScheduledElections: No election types for country: ${countryId}`
        );
        return {};
      }

      let newElectionsToAdd = [];
      let updatedLastElectionYears = { ...lastElectionYearsByInstanceIdBase };

      countryElectionTypes.forEach((originalElectionType) => {
        const electionInstances = getElectionInstances(
          originalElectionType,
          state.activeCampaign
        );

        electionInstances.forEach((instanceContext) => {
          const {
            instanceIdBase,
            entityData,
            resolvedOfficeName,
            _isSingleSeatContest,
            _effectiveElectoralSystem,
            _effectiveGeneratesOneWinner,
          } = instanceContext;
          const electionYear = currentDate.year;

          const effectiveElectionType = {
            ...originalElectionType,
            generatesOneWinner: _effectiveGeneratesOneWinner,
            electoralSystem: _effectiveElectoralSystem,
            minCouncilSeats: _isSingleSeatContest
              ? 1
              : originalElectionType.minCouncilSeats,
            councilSeatPopulationTiers: _isSingleSeatContest
              ? null
              : originalElectionType.councilSeatPopulationTiers,
          };

          // ... (existing checks for isElectionDue and alreadyScheduled) ...

          // Define electionPropertiesForScoring for this instance context
          const electionPropertiesForScoring = {
            ...effectiveElectionType, // Use the effective type for scoring context
            officeName: resolvedOfficeName, // Specific office name
            electorateIssues: entityData.issues || [
              "Economy",
              "Healthcare",
              "Local Development",
            ],
            electorateLeaning: entityData.politicalLeaning || "Moderate",
          };

          const incumbentInfo = getIncumbentsForOfficeInstance(
            resolvedOfficeName,
            effectiveElectionType,
            governmentOffices
          );

          const seatDetailsForThisContest = calculateSeatDetailsForInstance(
            effectiveElectionType,
            entityData.population
          );

          // ... (existing checks for numberOfSeats <= 0) ...

          const shouldCreateConceptualSeatItems =
            (!_isSingleSeatContest &&
              !effectiveElectionType.generatesOneWinner &&
              seatDetailsForThisContest.numberOfSeats > 1 &&
              !(effectiveElectionType._modelAsSingleContest === true) &&
              (effectiveElectionType.electoralSystem === "BlockVote" ||
                effectiveElectionType.electoralSystem === "SNTV_MMD")) ||
            (originalElectionType.id === "city_council_usa" &&
              effectiveElectionType.electoralSystem === "PluralityMMD" &&
              !entityData.councilDistricts);

          if (shouldCreateConceptualSeatItems) {
            const totalSeatsInCouncil = seatDetailsForThisContest.numberOfSeats;
            const seatPopulations = distributePopulationToSeats(
              entityData.population,
              totalSeatsInCouncil
            );

            for (let i = 0; i < totalSeatsInCouncil; i++) {
              const seatNumber = i + 1;
              const conceptualSeatOfficeName = `${resolvedOfficeName} (Seat ${seatNumber})`;
              const conceptualSeatInstanceIdBase = `${instanceIdBase}_seat${seatNumber}`;

              const alreadyScheduledConceptualSeat = existingElections.find(
                (e) =>
                  e.instanceIdBase === conceptualSeatInstanceIdBase &&
                  e.electionDate.year === electionYear
              );
              if (alreadyScheduledConceptualSeat) continue;

              const conceptualSeatIncumbent = getIncumbentsForOfficeInstance(
                conceptualSeatOfficeName,
                { ...effectiveElectionType, generatesOneWinner: true },
                governmentOffices
              );
              const conceptualSeatDetails = {
                numberOfSeats: 1,
                seatDistributionMethod: "single_winner",
              };

              const conceptualInstanceContext = {
                ...instanceContext,
                instanceIdBase: conceptualSeatInstanceIdBase,
                resolvedOfficeName: conceptualSeatOfficeName,
                entityData: {
                  ...entityData,
                  id: `${entityData.id}_seat${seatNumber}`,
                  name: `Seat ${seatNumber} of ${entityData.name}`,
                  population:
                    seatPopulations[i] || // Use actual distributed population
                    Math.floor(entityData.population / totalSeatsInCouncil), // Fallback
                  stats: entityData.stats,
                  politicalLandscape: entityData.politicalLandscape,
                },
              };
              const partiesInScope =
                state.activeCampaign.generatedPartiesSnapshot.filter((p) => p); // Filter out any null/undefined parties

              // 1. MODIFICATION FOR CONCEPTUAL SEAT CALL
              const participantsForConceptualSeat =
                generateElectionParticipants({
                  electionType: {
                    // Specific electionType for conceptual seat
                    ...effectiveElectionType,
                    generatesOneWinner: true,
                    electoralSystem: "FPTP",
                  },
                  partiesInScope,
                  incumbentInfo: conceptualSeatIncumbent,
                  numberOfSeatsToFill: 1,
                  countryId,
                  activeCampaign: state.activeCampaign, // <--- Add this
                  // Define electionPropertiesForScoring specific to this conceptual seat
                  electionPropertiesForScoring: {
                    // <--- Add this
                    ...electionPropertiesForScoring, // Base from the overall election
                    officeName: conceptualSeatOfficeName, // Override for conceptual seat
                    electorateIssues: conceptualInstanceContext.entityData
                      .issues || ["Economy", "Healthcare", "Local Development"],
                    electorateLeaning:
                      conceptualInstanceContext.entityData.politicalLeaning ||
                      "Moderate",
                  },
                  entityPopulation:
                    conceptualInstanceContext.entityData.population, // <--- Add this
                });
              const newConceptualSeatElection = initializeElectionObject({
                electionType: {
                  ...effectiveElectionType,
                  generatesOneWinner: true,
                  electoralSystem: "FPTP",
                },
                instanceContext: conceptualInstanceContext,
                currentDate,
                activeCampaign: state.activeCampaign,
                incumbentInfoForDisplay: conceptualSeatIncumbent,
                participantsData: participantsForConceptualSeat,
                seatDetails: conceptualSeatDetails,
                entityPopulation:
                  conceptualInstanceContext.entityData.population,
              });
              newElectionsToAdd.push(newConceptualSeatElection);
            }
          } else {
            const partiesInScope =
              state.activeCampaign.generatedPartiesSnapshot.filter((p) => p); // Filter out any null/undefined parties

            // 2. MODIFICATION FOR REGULAR ELECTION CALL
            const participantsData = generateElectionParticipants({
              electionType: effectiveElectionType,
              partiesInScope,
              incumbentInfo,
              numberOfSeatsToFill: seatDetailsForThisContest.numberOfSeats,
              countryId,
              activeCampaign: state.activeCampaign, // <--- Add this
              electionPropertiesForScoring: electionPropertiesForScoring, // <--- Add this (reusing the one defined above)
              entityPopulation: entityData.population, // <--- Add this
            });
            const newElection = initializeElectionObject({
              electionType: effectiveElectionType,
              instanceContext,
              currentDate,
              activeCampaign: state.activeCampaign,
              incumbentInfoForDisplay: incumbentInfo,
              participantsData,
              seatDetails: seatDetailsForThisContest,
              entityPopulation: entityData.population,
            });
            newElectionsToAdd.push(newElection);
          }
        });
      });

      // --- 7. Update State ---
      if (newElectionsToAdd.length > 0) {
        const sortedElections = [
          ...existingElections,
          ...newElectionsToAdd,
        ].sort(
          (a, b) =>
            a.electionDate.year - b.electionDate.year ||
            a.electionDate.month - b.electionDate.month ||
            a.electionDate.day - b.electionDate.day
        );
        return {
          activeCampaign: {
            ...state.activeCampaign,
            elections: sortedElections,
            lastElectionYear: updatedLastElectionYears,
          },
        };
      }
      return {};
    });
  },

  declareCandidacy: (electionId) => {
    set((state) => {
      if (!state.activeCampaign || !state.activeCampaign.politician) {
        console.warn("declareCandidacy: No active campaign or politician.");
        return state;
      }

      const {
        politician: playerPoliticianObject,
        partyInfo,
        elections: currentElections,
        customPartiesSnapshot = [],
        generatedPartiesSnapshot = [],
      } = state.activeCampaign;
      const allThemes = state.availableThemes || {};
      const activeThemeName = state.activeThemeName || defaultTheme;
      const activeThemeObject =
        allThemes[activeThemeName] || themes[defaultTheme];

      let successfullyDeclaredForUpcoming = false;

      const updatedElections = currentElections.map((election) => {
        if (election.id === electionId) {
          if (
            !election.playerIsCandidate &&
            election.outcome?.status === "upcoming"
          ) {
            const today = createDateObj(state.currentDate);
            const deadline = createDateObj(election.filingDeadline);
            if (today && deadline && today.getTime() > deadline.getTime()) {
              console.warn(
                `Attempted to declare for ${election.officeName} after filing deadline.`
              );
              if (state.actions.addToast)
                state.actions.addToast({
                  message: "Filing deadline has passed for this election.",
                  type: "error",
                });
              return election;
            }

            let determinedPartyId = "player_independent";
            let determinedPartyName = "Independent";
            let determinedPartyIdeology =
              playerPoliticianObject.calculatedIdeology;
            let determinedPartyColor =
              activeThemeObject?.colors?.["--secondary-text"] || "#888888";

            if (partyInfo && partyInfo.type) {
              if (partyInfo.type === "join_generated") {
                const foundParty = generatedPartiesSnapshot.find(
                  (p) => p.id === partyInfo.id
                );
                if (foundParty) {
                  determinedPartyId = foundParty.id;
                  determinedPartyName = foundParty.name;
                  determinedPartyIdeology = foundParty.ideology;
                  determinedPartyColor =
                    foundParty.color || determinedPartyColor;
                } else {
                  determinedPartyName = "Affiliated (Generated - Error)";
                }
              } else if (partyInfo.type === "use_custom") {
                const foundParty = customPartiesSnapshot.find(
                  (p) => p.id === partyInfo.id
                );
                if (foundParty) {
                  determinedPartyId = foundParty.id;
                  determinedPartyName = foundParty.name;
                  determinedPartyIdeology = foundParty.ideology;
                  determinedPartyColor =
                    foundParty.color ||
                    activeThemeObject?.colors?.["--accent-color"] ||
                    "#4299E1";
                } else {
                  determinedPartyName = "Affiliated (Custom - Error)";
                }
              }
            }

            const playerAsCandidate = {
              id: playerPoliticianObject.id,
              name: `${playerPoliticianObject.firstName} ${playerPoliticianObject.lastName}`,
              partyId: determinedPartyId,
              partyName: determinedPartyName,
              partyIdeology: determinedPartyIdeology,
              partyColor: determinedPartyColor,
              polling: 0,
              funds: "Player Controlled",
              isPlayer: true,
              isIncumbent:
                election.incumbentInfo?.id === playerPoliticianObject.id,
            };

            let newCandidateList = (election.candidates || []).filter(
              (c) => c.id !== playerPoliticianObject.id
            );
            newCandidateList.push(playerAsCandidate);

            // Calculate base scores and then normalize polling for the updated list
            const candidatesWithBaseScores = newCandidateList.map((cand) => ({
              ...cand,
              // Ensure calculateBaseCandidateScore can handle the player object & AI objects
              baseScore:
                cand.baseScore ||
                calculateBaseCandidateScore(
                  cand.isPlayer ? playerPoliticianObject : cand,
                  election,
                  state.activeCampaign
                ),
            }));

            // To normalize polling, you need the election's entity population
            const electionEntityPop =
              election.entityDataSnapshot?.population || 0;
            // And demographics if your calculateAdultPopulation uses it for accuracy
            // const electionEntityDemographics = election.entityDataSnapshot?.demographics;
            // const adultPopForNorm = calculateAdultPopulation(electionEntityPop, electionEntityDemographics);
            const adultPopForNorm = calculateAdultPopulation(electionEntityPop); // Assuming simpler version for now

            const finalCandidateListWithPolling = normalizePolling(
              candidatesWithBaseScores,
              adultPopForNorm
            );

            successfullyDeclaredForUpcoming = true;
            return {
              ...election,
              candidates: finalCandidateListWithPolling,
              playerIsCandidate: true,
              // outcome.status remains "upcoming"
            };
          } else if (election.playerIsCandidate) {
            if (state.actions.addToast)
              state.actions.addToast({
                message: "You are already a candidate in this election.",
                type: "info",
              });
          } else if (election.outcome?.status === "concluded") {
            if (state.actions.addToast)
              state.actions.addToast({
                message: "This election has already concluded.",
                type: "error",
              });
          } else if (election.outcome?.status !== "upcoming") {
            if (state.actions.addToast)
              state.actions.addToast({
                message: `Cannot declare for this election (status: ${election.outcome?.status}).`,
                type: "warning",
              });
          }
        }
        return election;
      });

      // Update politician's isInCampaign status ONLY if successfully declared for an upcoming election.
      // If already in a campaign, and this declaration failed, it remains true.
      // If not in a campaign, and this declaration succeeded, it becomes true.
      const newPlayerIsInCampaign = successfullyDeclaredForUpcoming
        ? true
        : playerPoliticianObject.isInCampaign;

      if (successfullyDeclaredForUpcoming && state.actions.addToast) {
        const declaredElection = updatedElections.find(
          (e) => e.id === electionId
        );
        state.actions.addToast({
          message: `Successfully declared candidacy for ${
            declaredElection?.officeName || "the election"
          }!`,
          type: "success",
        });
      }

      return {
        ...state, // Return the whole state
        activeCampaign: {
          ...state.activeCampaign,
          politician: {
            ...playerPoliticianObject,
            isInCampaign: newPlayerIsInCampaign, // Update the politician object
          },
          elections: updatedElections,
        },
      };
    });
  },
  processElectionResults: (electionId, simulatedElectionData = null) => {
    set((state) => {
      if (!state.activeCampaign || !state.activeCampaign.elections) {
        console.warn("[ProcessResults] No active campaign or elections array.");
        return state;
      }

      const combinedAllParties = [
        ...(state.activeCampaign.generatedPartiesSnapshot || []),
        ...(state.activeCampaign.customPartiesSnapshot || []),
      ];
      const allPartiesInGame = Array.from(
        new Map(combinedAllParties.map((p) => [p.id, p])).values()
      );

      const {
        elections,
        countryId,
        governmentOffices = [],
        politician: playerPoliticianData,
      } = state.activeCampaign;

      const electionIndex = elections.findIndex((e) => e.id === electionId);
      if (electionIndex === -1) {
        console.warn(`[ProcessResults] Election ID ${electionId} not found.`);
        return state;
      }

      const electionToEnd = JSON.parse(
        JSON.stringify(elections[electionIndex])
      );

      if (
        electionToEnd.outcome?.status === "concluded" &&
        !simulatedElectionData
      ) {
        return state;
      }
      if (!electionToEnd.outcome) electionToEnd.outcome = {};

      // Call the new utility function to calculate election outcome
      const {
        determinedWinnersArray,
        partyVoteSummary,
        partySeatSummary,
        totalVotesActuallyCast,
        voterTurnoutPercentageActual,
        allRelevantIndividuals,
        seatsToFill,
      } = calculateElectionOutcome(
        electionToEnd,
        allPartiesInGame,
        simulatedElectionData
      );

      // --- Step 3: Finalize Outcome Object ---
      electionToEnd.outcome.status = "concluded";
      electionToEnd.outcome.turnoutActual = totalVotesActuallyCast;
      electionToEnd.outcome.voterTurnoutPercentageActual =
        voterTurnoutPercentageActual;

      electionToEnd.outcome.winners = determinedWinnersArray.map((winner) => ({
        id: winner.id,
        name: winner.name,
        partyId: winner.partyId,
        partyName: winner.partyName,
        partyColor: winner.partyColor,
      }));

      electionToEnd.outcome.resultsByCandidate = allRelevantIndividuals
        .map((c) => ({
          candidateId: c.id,
          candidateName: c.name,
          partyId: c.partyId,
          partyName:
            c.partyName ||
            allPartiesInGame.find((p) => p.id === c.partyId)?.name,
          partyColor:
            c.partyColor ||
            allPartiesInGame.find((p) => p.id === c.partyId)?.color,
          votes: c.votes != null ? c.votes : null,
          isWinner: determinedWinnersArray.some((w) => w.id === c.id),
        }))
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));

      electionToEnd.outcome.resultsByParty = {
        votes: partyVoteSummary.map((p) => ({
          ...p,
          percentage: parseFloat(p.percentage.toFixed(1)),
        })),
        seats: partySeatSummary,
      };

      // Recalculate turnout percentage if there were issues
      if (
        isNaN(electionToEnd.outcome.voterTurnoutPercentageActual) ||
        !isFinite(electionToEnd.outcome.voterTurnoutPercentageActual) ||
        electionToEnd.outcome.voterTurnoutPercentageActual < 0
      ) {
        electionToEnd.outcome.voterTurnoutPercentageActual =
          electionToEnd.totalEligibleVoters > 0 && totalVotesActuallyCast > 0
            ? (totalVotesActuallyCast / electionToEnd.totalEligibleVoters) * 100
            : 0;
      }
      if (isNaN(electionToEnd.outcome.voterTurnoutPercentageActual))
        electionToEnd.outcome.voterTurnoutPercentageActual = 0;

      // --- Steps 4 & 5 & 6: Update Government Offices, Player State, and Final Store Update ---
      let updatedGovernmentOfficesLocal = JSON.parse(
        JSON.stringify(governmentOffices)
      );
      let newPlayerOffice = playerPoliticianData.currentOffice;
      let playerWonAnySeatThisElection = false;
      const electionDefinition = ELECTION_TYPES_BY_COUNTRY[countryId]?.find(
        (et) => et.id === electionToEnd.officeNameTemplateId
      );
      const termLength =
        electionDefinition?.termLengthYears ||
        electionDefinition?.frequencyYears ||
        4;
      const currentElectionDate = createDateObj(electionToEnd.electionDate);
      let termEndDateObj = null;
      if (currentElectionDate) {
        termEndDateObj = new Date(currentElectionDate);
        termEndDateObj.setFullYear(
          currentElectionDate.getFullYear() + termLength
        );
        termEndDateObj.setDate(currentElectionDate.getDate() - 1);
        if (termEndDateObj.getDate() === 0) termEndDateObj.setDate(0);
      }
      const termEndDate = termEndDateObj
        ? {
            year: termEndDateObj.getFullYear(),
            month: termEndDateObj.getMonth() + 1,
            day: termEndDateObj.getDate(),
          }
        : {
            year: (state.activeCampaign.currentDate.year || 2000) + termLength,
            month: 1,
            day: 1,
          };

      if (determinedWinnersArray.length > 0) {
        const isLegislativeBodyElection =
          electionToEnd.electoralSystem === "PartyListPR" ||
          electionToEnd.electoralSystem === "MMP" ||
          (electionToEnd.electoralSystem !== "SNTV_MMD" &&
            electionToEnd.electoralSystem !== "BlockVote" &&
            !(
              electionToEnd.electoralSystem === "PluralityMMD" &&
              electionToEnd.officeNameTemplateId === "city_council_usa"
            ) &&
            seatsToFill > 1 &&
            (electionToEnd.level.includes("parliament") ||
              electionToEnd.level.includes("council") ||
              electionToEnd.level.includes("assembly") ||
              electionToEnd.level.includes("house") ||
              electionToEnd.level.includes("senate") ||
              electionToEnd.level === "local_city"));
        if (isLegislativeBodyElection) {
          const officeIndex = updatedGovernmentOfficesLocal.findIndex(
            (off) =>
              off.officeName === electionToEnd.officeName &&
              off.level === electionToEnd.level
          );
          const memberRole =
            electionDefinition?.memberRoleName ||
            `Member, ${electionToEnd.officeName}`;
          const newMembers = determinedWinnersArray.map((winner) => ({
            id: winner.id,
            name: winner.name,
            holder: getFullPoliticianById(winner.id, state.campaignData),
            partyId: winner.partyId,
            partyName: winner.partyName,
            partyColor: winner.partyColor,
            role: memberRole,
            termEnds: termEndDate,
          }));
          const newComposition = {};
          newMembers.forEach((mem) => {
            if (mem.partyId)
              newComposition[mem.partyId] =
                (newComposition[mem.partyId] || 0) + 1;
            else
              newComposition["independent"] =
                (newComposition["independent"] || 0) + 1;
          });
          if (officeIndex !== -1) {
            console.log(
              `[ProcessResults DEBUG] UPDATING existing legislative body: ${electionToEnd.officeName}`
            );
            updatedGovernmentOfficesLocal[officeIndex].members = newMembers;
            updatedGovernmentOfficesLocal[officeIndex].termEnds = termEndDate;
            updatedGovernmentOfficesLocal[
              officeIndex
            ].currentCompositionByParty = newComposition;
            updatedGovernmentOfficesLocal[officeIndex].numberOfSeatsToFill =
              electionToEnd.numberOfSeatsToFill;
            updatedGovernmentOfficesLocal[officeIndex].cityId =
              electionToEnd.entityDataSnapshot.id;
            updatedGovernmentOfficesLocal[officeIndex].instanceIdBase =
              electionToEnd.instanceIdBase;
          } else {
            console.log(
              `[ProcessResults DEBUG] ADDING new legislative body: ${electionToEnd.officeName}`
            );
            if (
              electionToEnd.level.includes("local_state") ||
              electionToEnd.level.includes("local_prefecture") ||
              electionToEnd.level.includes("local_province")
            ) {
              updatedGovernmentOfficesLocal.push({
                officeId: `${
                  electionToEnd.instanceIdBase || electionToEnd.id
                }_${generateId()}`,
                officeNameTemplateId: electionToEnd.officeNameTemplateId,
                officeName: electionToEnd.officeName,
                level: electionToEnd.level,
                holder: null,
                members: newMembers,
                termEnds: termEndDate,
                currentCompositionByParty: newComposition,
                instanceIdBase: electionToEnd.instanceIdBase,
                numberOfSeatsToFill: electionToEnd.numberOfSeatsToFill,
                stateId: electionToEnd.entityDataSnapshot.id,
              });
            } else {
              updatedGovernmentOfficesLocal.push({
                officeId: `${
                  electionToEnd.instanceIdBase || electionToEnd.id
                }_${generateId()}`,
                officeNameTemplateId: electionToEnd.officeNameTemplateId,
                officeName: electionToEnd.officeName,
                level: electionToEnd.level,
                holder: null,
                members: newMembers,
                termEnds: termEndDate,
                currentCompositionByParty: newComposition,
                instanceIdBase: electionToEnd.instanceIdBase,
                numberOfSeatsToFill: electionToEnd.numberOfSeatsToFill,
                cityId: electionToEnd.entityDataSnapshot.id,
              });
            }
          }
          if (newMembers.some((mem) => mem.id === playerPoliticianData.id)) {
            newPlayerOffice = memberRole;
            playerWonAnySeatThisElection = true;
          }
        } else {
          const winner = determinedWinnersArray[0];

          const newHolder = { ...winner, role: "", termEnds: termEndDate };
          delete newHolder.votes;

          const finalOfficeName = electionToEnd.officeName;
          newHolder.role = finalOfficeName;

          let finalCityIdForOffice = electionToEnd.entityDataSnapshot.id;
          if (finalCityIdForOffice.includes("_seat")) {
            finalCityIdForOffice = finalCityIdForOffice.substring(
              0,
              finalCityIdForOffice.lastIndexOf("_seat")
            );
          }

          let officeDataToSave = {};

          if (electionToEnd.level === "local_city") {
            officeDataToSave = {
              officeId: `${
                electionToEnd.instanceIdBase ||
                electionToEnd.officeNameTemplateId
              }_${generateId()}`,
              officeNameTemplateId: electionToEnd.officeNameTemplateId,
              officeName: finalOfficeName,
              level: electionToEnd.level,
              holder: newHolder,
              termEnds: termEndDate,
              cityId: finalCityIdForOffice,
              instanceIdBase: electionToEnd.instanceIdBase,
              numberOfSeatsToFill: electionToEnd.numberOfSeatsToFill,
            };
          } else if (
            electionToEnd.level.includes("local_state") ||
            electionToEnd.level.includes("local_prefecture") ||
            electionToEnd.level.includes("local_province")
          ) {
            officeDataToSave = {
              officeId: `${
                electionToEnd.instanceIdBase ||
                electionToEnd.officeNameTemplateId
              }_${generateId()}`,
              officeNameTemplateId: electionToEnd.officeNameTemplateId,
              officeName: finalOfficeName,
              level: electionToEnd.level,
              holder: newHolder,
              termEnds: termEndDate,
              stateId: electionToEnd.entityDataSnapshot.id,
              instanceIdBase: electionToEnd.instanceIdBase,
              numberOfSeatsToFill: electionToEnd.numberOfSeatsToFill,
            };
          } else {
            officeDataToSave = {
              officeId: `${
                electionToEnd.instanceIdBase ||
                electionToEnd.officeNameTemplateId
              }_${generateId()}`,
              officeNameTemplateId: electionToEnd.officeNameTemplateId,
              officeName: finalOfficeName,
              level: electionToEnd.level,
              holder: newHolder,
              termEnds: termEndDate,
              cityId: finalCityIdForOffice,
              instanceIdBase: electionToEnd.instanceIdBase,
              numberOfSeatsToFill: electionToEnd.numberOfSeatsToFill,
            };
          }

          const officeIndex = updatedGovernmentOfficesLocal.findIndex(
            (off) =>
              (typeof off.instanceIdBase === "string" &&
                off.instanceIdBase === electionToEnd.instanceIdBase) ||
              (off.officeName === finalOfficeName &&
                off.level === electionToEnd.level &&
                off.cityId === electionToEnd.entityDataSnapshot.id)
          );

          if (officeIndex !== -1) {
            if (officeDataToSave.level === "local_city") {
              updatedGovernmentOfficesLocal[officeIndex] = {
                ...updatedGovernmentOfficesLocal[officeIndex],
                holder: officeDataToSave.holder,
                termEnds: officeDataToSave.termEnds,
                officeName: officeDataToSave.officeName,
                officeNameTemplateId: officeDataToSave.officeNameTemplateId,
                level: officeDataToSave.level,
                cityId: officeDataToSave.cityId,
                instanceIdBase: officeDataToSave.instanceIdBase,
                numberOfSeatsToFill: officeDataToSave.numberOfSeatsToFill,
              };
            } else if (
              officeDataToSave.level.includes("local_state") ||
              electionToEnd.level.includes("local_prefecture") ||
              electionToEnd.level.includes("local_province")
            ) {
              updatedGovernmentOfficesLocal[officeIndex] = {
                ...updatedGovernmentOfficesLocal[officeIndex],
                holder: officeDataToSave.holder,
                termEnds: officeDataToSave.termEnds,
                officeName: officeDataToSave.officeName,
                officeNameTemplateId: officeDataToSave.officeNameTemplateId,
                level: officeDataToSave.level,
                stateId: officeDataToSave.stateId,
                instanceIdBase: officeDataToSave.instanceIdBase,
                numberOfSeatsToFill: officeDataToSave.numberOfSeatsToFill,
              };
            } else {
              updatedGovernmentOfficesLocal[officeIndex] = {
                ...updatedGovernmentOfficesLocal[officeIndex],
                holder: officeDataToSave.holder,
                termEnds: officeDataToSave.termEnds,
                officeName: officeDataToSave.officeName,
                officeNameTemplateId: officeDataToSave.officeNameTemplateId,
                level: officeDataToSave.level,
                cityId: officeDataToSave.cityId,
                instanceIdBase: officeDataToSave.instanceIdBase,
                numberOfSeatsToFill: officeDataToSave.numberOfSeatsToFill,
              };
            }
            if (!officeDataToSave.holder?.name) {
              console.log("hello!", officeDataToSave);
            }
            console.log(
              `[ProcessResults DEBUG] Updated existing single office: ${officeDataToSave.cityId} (Holder: ${officeDataToSave.holder.name})`
            );
          } else {
            updatedGovernmentOfficesLocal.push(officeDataToSave);
            console.log(
              `[ProcessResults DEBUG] Added new single office: ${officeDataToSave.officeName} (Holder: ${officeDataToSave.holder.name})`
            );
          }
          if (newHolder.id === playerPoliticianData.id) {
            newPlayerOffice = finalOfficeName;
            playerWonAnySeatThisElection = true;
          }
        }
      }

      const playerPoliticianUpdated = { ...playerPoliticianData };
      if (electionToEnd.playerIsCandidate) {
        const stillInOtherCampaigns = elections.some(
          (e) =>
            e.id !== electionId &&
            e.playerIsCandidate &&
            e.outcome?.status === "upcoming"
        );
        playerPoliticianUpdated.isInCampaign = stillInOtherCampaigns;
      }
      if (playerWonAnySeatThisElection) {
        playerPoliticianUpdated.currentOffice = newPlayerOffice;
        playerPoliticianUpdated.approvalRating = Math.min(
          100,
          Math.max(
            0,
            (playerPoliticianUpdated.approvalRating || 50) +
              getRandomInt(10, 20)
          )
        );
        playerPoliticianUpdated.politicalCapital =
          (playerPoliticianUpdated.politicalCapital || 0) +
          getRandomInt(10, 25);
      } else if (
        electionToEnd.playerIsCandidate &&
        !playerWonAnySeatThisElection
      ) {
        playerPoliticianUpdated.approvalRating = Math.min(
          100,
          Math.max(
            0,
            (playerPoliticianUpdated.approvalRating || 50) +
              getRandomInt(-15, -5)
          )
        );
      }

      const updatedElectionsArray = [...state.activeCampaign.elections];
      updatedElectionsArray[electionIndex] = electionToEnd;

      console.log(
        `[ProcessResults] Completed for ${
          electionToEnd.officeName
        }. Outcome Winners: ${
          electionToEnd.outcome.winners.length
        }, Party Vote Entries: ${
          electionToEnd.outcome.resultsByParty.votes.length
        }, Party Seat Entries: ${
          Object.keys(electionToEnd.outcome.resultsByParty.seats).length
        }`
      );

      console.log(
        `[ProcessResults] FINAL governmentOffices count before returning (Line 1342): ${updatedGovernmentOfficesLocal.length}`
      );
      console.log(
        "[ProcessResults] Final governmentOffices content (Line 1342):",
        JSON.parse(JSON.stringify(updatedGovernmentOfficesLocal))
      );

      return {
        activeCampaign: {
          ...state.activeCampaign,
          elections: updatedElectionsArray,
          politician: playerPoliticianUpdated,
          governmentOffices: updatedGovernmentOfficesLocal,
        },
      };
    });
  },

  setupElectionNightDetails: (electionDateToSetup) => {
    set((state) => {
      if (!state.activeCampaign || !state.activeCampaign.startingCity) {
        // startingCity might not be needed if totalEligibleVoters already on mayor election
        console.warn(
          "setupElectionNightDetails: Active campaign data not found."
        );
        return {};
      }

      const updatedElections = state.activeCampaign.elections.map((e) => {
        const electionCopy = { ...e }; // Work on a copy

        if (
          electionCopy.electionDate.year === electionDateToSetup.year &&
          electionCopy.electionDate.month === electionDateToSetup.month &&
          electionCopy.electionDate.day === electionDateToSetup.day &&
          electionCopy.outcome?.status === "upcoming"
        ) {
          if (electionCopy.officeNameTemplateId === "mayor") {
            electionCopy.voterTurnoutPercentage = calculateRandomVoterTurnout(
              25,
              90
            ); // Example: Mayor turnout range
            // electionCopy.totalEligibleVoters is already set
            console.log(
              `Election Night Setup (Turnout): Mayor ${electionCopy.officeName} - Turnout: ${electionCopy.voterTurnoutPercentage}% (Eligible: ${electionCopy.totalEligibleVoters})`
            );
          } else if (electionCopy.officeNameTemplateId === "city_council") {
            electionCopy.seatVoterTurnoutPercentage =
              calculateRandomVoterTurnout(20, 75);
            // electionCopy.seatAssignedPopulation is already set
            console.log(
              `Election Night Setup (Turnout): Council Seat ${electionCopy.officeName} - Turnout: ${electionCopy.seatVoterTurnoutPercentage}% (Pop: ${electionCopy.seatAssignedPopulation})`
            );
          }
        }
        return electionCopy;
      });

      return {
        activeCampaign: {
          ...state.activeCampaign,
          elections: updatedElections,
        },
      };
    });
  },
});
