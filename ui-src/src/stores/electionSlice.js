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
  distributeVotesToCandidates,
  calculateBaseCandidateScore,
  getElectionInstances,
  isElectionDue,
  getIncumbentsForOfficeInstance,
  calculateSeatDetailsForInstance,
  generateElectionParticipants,
  initializeElectionObject,
  distributePopulationToSeats,
  normalizePolling,
} from "../utils/electionUtils.js";

const INCUMBENT_RUNS_CHANCE = 0.8;
const POSSIBLE_POLICY_FOCUSES_FOR_ELECTION_SLICE = [
  "Economic Growth",
  "Public Safety",
  "Education Quality",
  "Infrastructure Development",
  "Healthcare Access",
  "Social Welfare",
];

// Placeholder for PR Seat Allocation (e.g., Sainte-Laguë or D'Hondt)
// You NEED to implement a proper version of this.
const allocateSeatsProportionally = (
  partyVotesMap,
  totalSeatsToAllocate,
  thresholdPercent = 0,
  allocationMethod = "dHondt"
) => {
  console.warn(
    `Using placeholder PR seat allocation: ${allocationMethod}. Implement a real algorithm.`
  );
  const seats = {};
  let allocatedCount = 0;
  const eligibleParties = Object.entries(partyVotesMap)
    .map(([id, data]) => ({ ...data, id })) // Add id back for easier access
    .filter(
      (p) =>
        (p.votes /
          Object.values(partyVotesMap).reduce((s, pv) => s + pv.votes, 1)) *
          100 >=
        thresholdPercent
    );

  if (eligibleParties.length === 0 || totalSeatsToAllocate === 0) return seats;

  // Very simple proportional distribution for placeholder
  const totalEligibleVotes = eligibleParties.reduce(
    (sum, p) => sum + p.votes,
    0
  );
  if (totalEligibleVotes === 0) {
    // If no eligible parties got votes, distribute among them if any seats
    if (eligibleParties.length > 0) {
      const seatsPerParty = Math.floor(
        totalSeatsToAllocate / eligibleParties.length
      );
      eligibleParties.forEach((p) => (seats[p.id] = seatsPerParty));
      allocatedCount = Object.values(seats).reduce((s, c) => s + c, 0);
    }
  } else {
    eligibleParties.forEach((p) => {
      seats[p.id] = Math.floor(
        (p.votes / totalEligibleVotes) * totalSeatsToAllocate
      );
      allocatedCount += seats[p.id];
    });
  }

  // Distribute remainder seats
  let remainderSeats = totalSeatsToAllocate - allocatedCount;
  if (remainderSeats > 0) {
    eligibleParties.sort(
      (a, b) =>
        (((b.votes / totalEligibleVotes) * totalSeatsToAllocate) % 1) -
          (((a.votes / totalEligibleVotes) * totalSeatsToAllocate) % 1) ||
        b.votes - a.votes
    ); // Sort by largest remainder/votes
    for (let i = 0; i < remainderSeats; i++) {
      if (eligibleParties.length > 0) {
        seats[eligibleParties[i % eligibleParties.length].id]++;
      }
    }
  }
  return seats; // Returns { partyId1: X_seats, partyId2: Y_seats }
};

export const createElectionSlice = (set) => ({
  // --- EXISTING ACTIONS (potentially with minor adjustments if needed) ---
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
        // regionId, // Used by getElectionInstances via activeCampaign
        // startingCity, // Used by getElectionInstances via activeCampaign
        elections: existingElections = [],
        lastElectionYear: lastElectionYearsByInstanceIdBase = {}, // Keyed by instanceIdBase
        governmentOffices = [],
        // availableCountries, // Already destructured, passed within activeCampaign to utils
        // --- You might need to pass more specific parts of your game world data if not all in availableCountries ---
        // For example, if district definitions are separate:
        // allDistricts: state.allDistricts, (example)
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
            _isSingleSeatContest, // Flag from getElectionInstances
            _effectiveElectoralSystem, // Effective system for this instance
            _effectiveGeneratesOneWinner, // Effective GOW for this instance
          } = instanceContext;
          const electionYear = currentDate.year;

          // Determine the effective election type to use for this instance
          const effectiveElectionType = {
            ...originalElectionType, // Start with the base type
            generatesOneWinner: _effectiveGeneratesOneWinner,
            electoralSystem: _effectiveElectoralSystem,
            // If it's a single district seat, tiers/minCouncil for overall council don't apply here
            minCouncilSeats: _isSingleSeatContest
              ? 1
              : originalElectionType.minCouncilSeats,
            councilSeatPopulationTiers: _isSingleSeatContest
              ? null
              : originalElectionType.councilSeatPopulationTiers,
          };

          if (
            !isElectionDue(
              instanceIdBase,
              effectiveElectionType,
              currentDate,
              updatedLastElectionYears
            )
          ) {
            return;
          }
          const alreadyScheduled = existingElections.find(
            (e) =>
              e.instanceIdBase === instanceIdBase &&
              e.electionDate.year === electionYear
          );
          if (alreadyScheduled) return;
          updatedLastElectionYears[instanceIdBase] = electionYear;

          const incumbentInfo = getIncumbentsForOfficeInstance(
            resolvedOfficeName,
            effectiveElectionType,
            governmentOffices
          );

          // Calculate seats for THIS specific instance/contest
          // If _isSingleSeatContest is true, this will return 1.
          // If it's an at-large instance, this uses your calculateNumberOfSeats (via calculateSeatDetailsForInstance)
          const seatDetailsForThisContest = calculateSeatDetailsForInstance(
            effectiveElectionType,
            entityData.population
          );

          if (seatDetailsForThisContest.numberOfSeats <= 0) {
            console.warn(
              `Skipping election instance ${resolvedOfficeName} (ID base: ${instanceIdBase}) - 0 seats to fill.`
            );
            return;
          }

          // Now, determine if we are creating "conceptual seat" items for an AT-LARGE MMD
          // (This is your "Model A" for Japanese councils, etc.)
          const isPluralityMultiMemberSystem = [
            "BlockVote",
            "SNTV_MMD",
            "PluralityMMD",
          ].includes(effectiveElectionType.electoralSystem);

          const shouldCreateConceptualSeatItems =
            !_isSingleSeatContest && // Ensure it's an at-large contest instance from getElectionInstances
            !effectiveElectionType.generatesOneWinner && // The election type itself generates multiple winners as one contest
            seatDetailsForThisContest.numberOfSeats > 1 && // There's more than one seat to fill
            isPluralityMultiMemberSystem && // Use the new helper for cleaner check against common multi-member plurality systems
            (effectiveElectionType.level.includes("council") || // Apply specifically to 'council' level elections
              effectiveElectionType.level.includes("assembly")); // Or other similar multi-seat local bodies if applicable

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
                ...instanceContext, // base entity data
                instanceIdBase: conceptualSeatInstanceIdBase,
                resolvedOfficeName: conceptualSeatOfficeName,
                entityData: {
                  // This "seat" conceptually has a portion of the population
                  ...entityData, // Base city data
                  id: `${entityData.id}_seat${seatNumber}`, // Unique ID for this conceptual seat entity
                  name: `Seat ${seatNumber} of ${entityData.name}`,
                  population:
                    seatPopulations[i] ||
                    Math.floor(entityData.population / totalSeatsInCouncil),
                  // Inherit/override stats, landscape, issues for this conceptual seat if desired
                  stats: entityData.stats,
                  politicalLandscape: entityData.politicalLandscape, // Or seat-specific if you model that
                },
              };
              const partiesInScope =
                state.activeCampaign.generatedPartiesSnapshot.filter((p) => {
                  if (p) {
                    return true;
                  }
                });
              const participantsForConceptualSeat =
                generateElectionParticipants({
                  electionType: {
                    ...effectiveElectionType,
                    generatesOneWinner: true,
                    electoralSystem: "FPTP",
                  }, // Treat as FPTP for generation
                  instanceContext: conceptualInstanceContext,
                  partiesInScope,
                  incumbentInfo: conceptualSeatIncumbent,
                  numberOfSeatsToFill: 1,
                  countryId,
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
            // --- Create ONE election item for this instance ---
            // (This path is taken for:
            //    1. True single-winner races like Mayor.
            //    2. District-based races where getElectionInstances already returned one instance per district.
            //    3. At-large PR/MMP list contests.
            //    4. At-large MMDs (SNTV/BlockVote) IF you DON'T want to explode them into conceptual seat items.
            // )
            const partiesInScope =
              state.activeCampaign.generatedPartiesSnapshot.filter((p) => {
                if (p) {
                  return true;
                }
              });
            const participantsData = generateElectionParticipants({
              electionType: effectiveElectionType, // Use the effective type for this instance
              partiesInScope,
              incumbentInfo,
              numberOfSeatsToFill: seatDetailsForThisContest.numberOfSeats,
              countryId,
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
        }); // End forEach electionInstance
      }); // End forEach originalElectionType

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
            lastElectionYear: updatedLastElectionYears, // Corrected: this is lastElectionYearsByInstanceIdBase
          },
        };
      }
      return {}; // No changes
    });
  },

  declareCandidacy: (electionId) => {
    set((state) => {
      if (!state.activeCampaign || !state.activeCampaign.politician) {
        console.warn("declareCandidacy: No active campaign or politician.");
        return state; // Return current state to prevent errors
      }

      const {
        politician: playerPoliticianObject,
        partyInfo,
        elections: currentElections,
        customPartiesSnapshot = [],
        generatedPartiesSnapshot = [],
      } = state.activeCampaign;
      const allThemes = state.availableThemes || {}; // Assuming these are available
      const activeThemeName = state.activeThemeName || defaultTheme; // Assuming defaultTheme
      const activeThemeObject =
        allThemes[activeThemeName] || themes[defaultTheme]; // Assuming themes

      let successfullyDeclaredForUpcoming = false;

      const updatedElections = currentElections.map((election) => {
        if (election.id === electionId) {
          if (
            !election.playerIsCandidate &&
            election.outcome?.status === "upcoming" // STRICTLY check for "upcoming"
          ) {
            // Filing deadline check (should ideally be in UI too, but good to have in action)
            const today = createDateObj(state.currentDate); // Assuming state.currentDate exists
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
              return election; // No change
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
              partyIdeology: determinedPartyIdeology, // This should be player's actual ideology
              partyColor: determinedPartyColor,
              // baseScore will be calculated next
              polling: 0, // Initial polling
              funds: "Player Controlled", // Or link to playerPoliticianObject.campaignFunds
              isPlayer: true,
              isIncumbent:
                election.incumbentInfo?.id === playerPoliticianObject.id, // Check against incumbentInfo
              // campaignHours fields are on playerPoliticianObject, not per candidate entry in election
            };

            let newCandidateList = (election.candidates || []).filter(
              (c) => c.id !== playerPoliticianObject.id
            ); // Remove player if somehow already listed as non-player
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

      let candidatesWithFinalVotes = [];
      let totalVotesActuallyCast = 0;
      const seatsToFill = electionToEnd.numberOfSeatsToFill || 1;

      let determinedWinnersArray = [];
      let partyVoteSummary = []; // For outcome: [{id, name, color, votes, percentage}]
      let partySeatSummary = {}; // For outcome: {partyId: count}

      // --- Step 1: Determine Vote Counts & Initial Candidate List ---
      if (simulatedElectionData) {
        console.log(
          `[ProcessResults] Using simulatedElectionData for ${electionToEnd.officeName}`
        );
        totalVotesActuallyCast = simulatedElectionData.totalExpectedVotes || 0;
        electionToEnd.outcome.turnoutActual = totalVotesActuallyCast;
        electionToEnd.outcome.voterTurnoutPercentageActual =
          simulatedElectionData.voterTurnoutPercentage;
        candidatesWithFinalVotes = (simulatedElectionData.candidates || []).map(
          (c) => ({ ...c, votes: c.currentVotes || 0 })
        );
      } else {
        console.log(
          `[ProcessResults] No simulatedElectionData for ${electionToEnd.officeName}, using fallback.`
        );
        let turnoutPerc = electionToEnd.voterTurnoutPercentage;
        if (turnoutPerc == null || turnoutPerc < 5 || turnoutPerc > 95) {
          turnoutPerc = getRandomInt(40, 75);
        }
        electionToEnd.outcome.voterTurnoutPercentageActual = turnoutPerc;
        totalVotesActuallyCast = Math.round(
          (electionToEnd.totalEligibleVoters || 0) * (turnoutPerc / 100)
        );
        electionToEnd.outcome.turnoutActual = totalVotesActuallyCast;

        // For fallback, determine the base list of candidates to work with
        let baseCandidatesForSim = [];
        if (electionToEnd.electoralSystem === "MMP") {
          // For MMP fallback, prioritize constituency candidates if defined
          if (electionToEnd.mmpData) {
            baseCandidatesForSim.push(
              ...Object.values(
                electionToEnd.mmpData.constituencyCandidatesByParty || {}
              ).flat()
            );
            baseCandidatesForSim.push(
              ...(electionToEnd.mmpData.independentConstituencyCandidates || [])
            );
          }
          // If still no constituency candidates for MMP, election.candidates might be a flat list of them
          if (
            baseCandidatesForSim.length === 0 &&
            electionToEnd.candidates?.length > 0
          ) {
            baseCandidatesForSim = [...electionToEnd.candidates];
          }
          console.log(
            `[ProcessResults Fallback MMP] Base candidates for sim: ${baseCandidatesForSim.length}`
          );
        } else if (electionToEnd.electoralSystem !== "PartyListPR") {
          // For FPTP, SNTV, etc.
          baseCandidatesForSim = electionToEnd.candidates || [];
          console.log(
            `[ProcessResults Fallback Other Systems] Base candidates for sim: ${baseCandidatesForSim.length}`
          );
        }
        // For PartyListPR fallback, candidatesWithFinalVotes will remain empty initially,
        // as party votes are generated directly in its specific block.
        // For other systems (MMP, FPTP etc.), if we have base candidates and votes, distribute them.
        if (
          baseCandidatesForSim.length > 0 &&
          totalVotesActuallyCast > 0 &&
          electionToEnd.electoralSystem !== "PartyListPR"
        ) {
          candidatesWithFinalVotes = distributeVotesToCandidates(
            baseCandidatesForSim,
            totalVotesActuallyCast,
            electionId
          );
        } else if (baseCandidatesForSim.length > 0) {
          // If no votes or if PR (but this branch not for PR)
          candidatesWithFinalVotes = baseCandidatesForSim.map((c) => ({
            ...c,
            votes: 0,
            partyId: c.partyId || null,
          }));
        }
      }
      console.log(
        `[ProcessResults] Total Votes Cast set to: ${totalVotesActuallyCast}`
      );
      console.log(
        "[ProcessResults] Initial candidatesWithFinalVotes (first 3):",
        JSON.parse(JSON.stringify(candidatesWithFinalVotes.slice(0, 3)))
      );

      // --- Step 2: Process based on Electoral System ---

      if (electionToEnd.electoralSystem === "PartyListPR") {
        console.log(
          `[ProcessResults PR] Processing ${electionToEnd.officeName}`
        );
        let currentPartyVoteTotals = {};
        const firstSimEntity = candidatesWithFinalVotes?.[0];

        if (firstSimEntity && firstSimEntity.isPartyEntity === true) {
          console.log(
            "[ProcessResults PR] Using pre-aggregated party votes from simulation data."
          );
          candidatesWithFinalVotes.forEach((partyEntity) => {
            if (partyEntity?.id && typeof partyEntity.votes === "number") {
              currentPartyVoteTotals[partyEntity.id] =
                (currentPartyVoteTotals[partyEntity.id] || 0) +
                partyEntity.votes;
            }
          });
        } else if (
          electionToEnd.partyLists &&
          Object.keys(electionToEnd.partyLists).length > 0 &&
          totalVotesActuallyCast > 0
        ) {
          console.warn(
            "[ProcessResults PR] Using fallback vote generation for parties."
          );
          const partiesInvolved = Object.keys(electionToEnd.partyLists);
          let totalBaseStrength = 0;
          const partyStrengths = partiesInvolved.map((pId) => {
            const pData = allPartiesInGame.find((p) => p.id === pId);
            const strength =
              pData?.popularity ||
              (partiesInvolved.length > 0 ? 100 / partiesInvolved.length : 1);
            totalBaseStrength += strength;
            return { partyId: pId, strength };
          });

          if (totalBaseStrength > 0) {
            partyStrengths.forEach(
              (ps) =>
                (currentPartyVoteTotals[ps.partyId] = Math.round(
                  (ps.strength / totalBaseStrength) * totalVotesActuallyCast
                ))
            );
          } else if (partiesInvolved.length > 0) {
            const equalShare = Math.floor(
              totalVotesActuallyCast / partiesInvolved.length
            );
            partiesInvolved.forEach(
              (pId) => (currentPartyVoteTotals[pId] = equalShare)
            );
          }
          let currentSum = Object.values(currentPartyVoteTotals).reduce(
            (s, v) => s + (v || 0),
            0
          );
          let remainder = totalVotesActuallyCast - currentSum;
          if (remainder !== 0 && partiesInvolved.length > 0) {
            const sortedP = partiesInvolved.sort(
              (a, b) =>
                (currentPartyVoteTotals[b] || 0) -
                (currentPartyVoteTotals[a] || 0)
            );
            for (let k = 0; k < Math.abs(remainder); ++k)
              currentPartyVoteTotals[sortedP[k % sortedP.length]] +=
                Math.sign(remainder);
          }
        } else {
          console.error(
            "[ProcessResults PR] Cannot determine party votes for PR."
          );
        }

        const totalEffectivePartyListVotes = Object.values(
          currentPartyVoteTotals
        ).reduce((sum, v) => sum + (v || 0), 0);
        Object.keys(currentPartyVoteTotals).forEach((partyId) => {
          const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
            name: partyId,
            color: "#888",
          };
          partyVoteSummary.push({
            id: partyId,
            name: partyData.name,
            color: partyData.color,
            votes: currentPartyVoteTotals[partyId] || 0,
            percentage:
              totalEffectivePartyListVotes > 0
                ? ((currentPartyVoteTotals[partyId] || 0) /
                    totalEffectivePartyListVotes) *
                  100
                : 0,
          });
        });
        partyVoteSummary.sort((a, b) => (b.votes || 0) - (a.votes || 0));

        const allocatedSeatsByIndex = allocateSeatsProportionally(
          partyVoteSummary,
          seatsToFill,
          electionToEnd.prThresholdPercent || 0,
          electionToEnd.prAllocationMethod || "dHondt"
        );
        if (
          typeof allocatedSeatsByIndex === "object" &&
          allocatedSeatsByIndex !== null
        ) {
          Object.keys(allocatedSeatsByIndex).forEach((indexKey) => {
            const partyIndex = parseInt(indexKey, 10);
            if (partyVoteSummary[partyIndex]?.id) {
              const actualPartyId = partyVoteSummary[partyIndex].id;
              const numSeats = allocatedSeatsByIndex[indexKey] || 0;
              partySeatSummary[actualPartyId] = numSeats;
              if (numSeats > 0) {
                const listCands =
                  electionToEnd.partyLists?.[actualPartyId] || [];
                const partyWinners = listCands.slice(0, numSeats);
                partyWinners.forEach((indivCand) => {
                  if (indivCand?.id && indivCand.name) {
                    determinedWinnersArray.push({
                      ...indivCand,
                      partyId: actualPartyId,
                      partyName: partyVoteSummary[partyIndex].name,
                      partyColor: partyVoteSummary[partyIndex].color,
                    });
                  }
                });
              }
            }
          });
        }
      } else if (electionToEnd.electoralSystem === "MMP") {
        console.log(
          `[ProcessResults MMP] Processing ${electionToEnd.officeName}`
        );
        // For MMP, candidatesWithFinalVotes should contain constituency candidates with their votes.
        // This is true if simulatedElectionData was provided and ElectionNightScreen prepared constituency candidates.
        // Or, if !simulatedElectionData, the fallback logic for baseCandsForFallback and distributeVotesToCandidates should populate it.

        const numConstituencySeats =
          electionToEnd.mmpData?.numConstituencySeats ||
          (electionToEnd.voteTarget === "dual_candidate_and_party"
            ? Math.floor(seatsToFill / 2)
            : seatsToFill); // Example split
        const numListSeats = seatsToFill - numConstituencySeats;

        // 1. Determine constituency winners
        if (candidatesWithFinalVotes.length > 0) {
          const constituencyWinnersFound = [...candidatesWithFinalVotes]
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, numConstituencySeats);
          determinedWinnersArray.push(...constituencyWinnersFound);
          constituencyWinnersFound.forEach((winner) => {
            // Track seats won by party from constituency
            if (winner.partyId)
              partySeatSummary[winner.partyId] =
                (partySeatSummary[winner.partyId] || 0) + 1;
          });
        } else {
          console.warn(
            "[ProcessResults MMP] No constituency candidates with votes to determine constituency winners."
          );
        }

        // 2. Determine Party Votes for List Seats (using a consistent method)
        let mmpPartyVoteTotals = {};
        const firstMmpSimEntity = candidatesWithFinalVotes?.[0];
        // Option A: If sim data had party entities (unlikely for MMP's constituency part, but for robustness)
        if (
          firstMmpSimEntity &&
          firstMmpSimEntity.isPartyEntity === true &&
          firstMmpSimEntity.mmpPartyVote === true
        ) {
          // Hypothetical mmpPartyVote flag
          console.log(
            "[ProcessResults MMP] Using pre-aggregated MMP party votes from sim data."
          );
          candidatesWithFinalVotes.forEach((partyEntity) => {
            if (partyEntity?.id && typeof partyEntity.votes === "number") {
              // Assuming .votes here are party votes
              mmpPartyVoteTotals[partyEntity.id] =
                (mmpPartyVoteTotals[partyEntity.id] || 0) + partyEntity.votes;
            }
          });
        }
        // Option B: Derive party votes from constituency candidate votes (if no separate party vote simulated)
        // This is a common simplification if only one vote is cast in sim.
        else if (
          candidatesWithFinalVotes.length > 0 &&
          !firstMmpSimEntity?.isPartyEntity
        ) {
          console.log(
            "[ProcessResults MMP] Deriving party votes from constituency candidate votes."
          );
          candidatesWithFinalVotes.forEach((cand) => {
            if (cand.partyId && typeof cand.votes === "number") {
              // cand.votes are constituency votes
              mmpPartyVoteTotals[cand.partyId] =
                (mmpPartyVoteTotals[cand.partyId] || 0) + cand.votes;
            }
          });
        }
        // Option C: Fallback if no sim data (direct processing)
        else if (
          electionToEnd.partyLists &&
          Object.keys(electionToEnd.partyLists).length > 0 &&
          totalVotesActuallyCast > 0
        ) {
          console.warn(
            "[ProcessResults MMP] No candidate sim data for party votes, using fallback for list seats."
          );
          // Using a portion of totalVotesActuallyCast for the party vote, or full if no constituency votes.
          const partyVotePortion = totalVotesActuallyCast; // Or some fraction like totalVotesActuallyCast * 0.5;
          const partiesInvolved = Object.keys(electionToEnd.partyLists);
          // ... (similar fallback logic as in PR to populate mmpPartyVoteTotals using partyStrengths from partiesInvolved and partyVotePortion)
          let totalBaseStrength = 0;
          const partyStrengths = partiesInvolved.map((pId) => {
            const pData = allPartiesInGame.find((p) => p.id === pId);
            const strength =
              pData?.popularity ||
              (partiesInvolved.length > 0 ? 100 / partiesInvolved.length : 1);
            totalBaseStrength += strength;
            return { partyId: pId, strength };
          });
          if (totalBaseStrength > 0)
            partyStrengths.forEach(
              (ps) =>
                (mmpPartyVoteTotals[ps.partyId] = Math.round(
                  (ps.strength / totalBaseStrength) * partyVotePortion
                ))
            );
          else if (partiesInvolved.length > 0)
            partiesInvolved.forEach(
              (pId) =>
                (mmpPartyVoteTotals[pId] = Math.floor(
                  partyVotePortion / partiesInvolved.length
                ))
            );
          // Remainder ...
        } else {
          console.error(
            "[ProcessResults MMP] Cannot determine party votes for MMP list seats."
          );
        }

        const totalEffectiveMMPPartyVotes = Object.values(
          mmpPartyVoteTotals
        ).reduce((s, v) => s + (v || 0), 0);
        Object.keys(mmpPartyVoteTotals).forEach((partyId) => {
          const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
            name: partyId,
            color: "#888",
          };
          partyVoteSummary.push({
            id: partyId,
            name: partyData.name,
            color: partyData.color,
            votes: mmpPartyVoteTotals[partyId] || 0,
            percentage:
              totalEffectiveMMPPartyVotes > 0
                ? ((mmpPartyVoteTotals[partyId] || 0) /
                    totalEffectiveMMPPartyVotes) *
                  100
                : 0,
          });
        });
        partyVoteSummary.sort((a, b) => (b.votes || 0) - (a.votes || 0));

        // 3. Allocate List Seats for MMP
        if (
          numListSeats > 0 &&
          partyVoteSummary.length > 0 &&
          electionToEnd.partyLists
        ) {
          const allocatedListSeatsByIndexMMP = allocateSeatsProportionally(
            partyVoteSummary,
            numListSeats,
            electionToEnd.prThresholdPercent || 0,
            electionToEnd.prAllocationMethod || "dHondt"
          );
          if (
            typeof allocatedListSeatsByIndexMMP === "object" &&
            allocatedListSeatsByIndexMMP !== null
          ) {
            Object.keys(allocatedListSeatsByIndexMMP).forEach((indexKey) => {
              const partyIndex = parseInt(indexKey, 10);
              if (partyVoteSummary[partyIndex]?.id) {
                const actualPartyId = partyVoteSummary[partyIndex].id;
                const numPartyListSeats =
                  allocatedListSeatsByIndexMMP[indexKey] || 0;
                partySeatSummary[actualPartyId] =
                  (partySeatSummary[actualPartyId] || 0) + numPartyListSeats;

                const listCands =
                  electionToEnd.partyLists?.[actualPartyId] || [];
                const listWinners = listCands
                  .filter(
                    (lc) =>
                      lc &&
                      lc.id &&
                      !determinedWinnersArray.some((cw) => cw.id === lc.id)
                  ) // Avoid duplicates
                  .slice(0, numPartyListSeats);
                listWinners.forEach((indivCand) => {
                  if (indivCand.name) {
                    // ID already checked by filter
                    determinedWinnersArray.push({
                      ...indivCand,
                      partyId: actualPartyId,
                      partyName: partyVoteSummary[partyIndex].name,
                      partyColor: partyVoteSummary[partyIndex].color,
                    });
                  }
                });
              }
            });
          }
        }
      } else {
        // FPTP, SNTV, BlockVote, etc.
        console.log(
          `[ProcessResults Other] System: ${electionToEnd.electoralSystem} for ${electionToEnd.officeName}`
        );
        if (candidatesWithFinalVotes && candidatesWithFinalVotes.length > 0) {
          determinedWinnersArray = [...candidatesWithFinalVotes]
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, seatsToFill);
        } else {
          console.warn(
            `[ProcessResults Other] No candidates with final votes for ${electionToEnd.officeName}.`
          );
        }

        // Calculate party performance for these systems
        const partyTotals = {};
        (candidatesWithFinalVotes || []).forEach((cand) => {
          // Ensure candidatesWithFinalVotes is an array
          if (cand?.partyId)
            partyTotals[cand.partyId] =
              (partyTotals[cand.partyId] || 0) + (cand.votes || 0);
        });
        const totalPartySystemVotes = Object.values(partyTotals).reduce(
          (s, v) => s + (v || 0),
          0
        );
        Object.keys(partyTotals).forEach((partyId) => {
          const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
            name: partyId,
            color: "#888",
          };
          partyVoteSummary.push({
            id: partyId,
            name: partyData.name,
            color: partyData.color,
            votes: partyTotals[partyId] || 0,
            percentage:
              totalPartySystemVotes > 0
                ? ((partyTotals[partyId] || 0) / totalPartySystemVotes) * 100
                : 0,
          });
        });
        partyVoteSummary.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        determinedWinnersArray.forEach((winner) => {
          if (winner.partyId)
            partySeatSummary[winner.partyId] =
              (partySeatSummary[winner.partyId] || 0) + 1;
        });
      }

      // --- Step 3: Finalize Outcome Object ---
      electionToEnd.outcome.status = "concluded";
      electionToEnd.outcome.winners = determinedWinnersArray.map((winner) => ({
        id: winner.id,
        name: winner.name,
        partyId: winner.partyId,
        partyName: winner.partyName,
        partyColor: winner.partyColor,
      }));

      let allRelevantIndividuals = [];
      if (
        electionToEnd.electoralSystem === "PartyListPR" ||
        electionToEnd.electoralSystem === "MMP"
      ) {
        const individualsFromLists = Object.values(
          electionToEnd.partyLists || {}
        )
          .flat()
          .filter((c) => c && c.id);
        const individualsFromMMPConst = electionToEnd.mmpData
          ? [
              ...Object.values(
                electionToEnd.mmpData.constituencyCandidatesByParty || {}
              )
                .flat()
                .filter((c) => c && c.id),
              ...(
                electionToEnd.mmpData.independentConstituencyCandidates || []
              ).filter((c) => c && c.id),
            ]
          : [];
        const baseIndividualPool =
          electionToEnd.candidates &&
          !electionToEnd.candidates[0]?.isPartyEntity
            ? electionToEnd.candidates.filter((c) => c && c.id)
            : [];

        const combinedIndividuals = [
          ...individualsFromLists,
          ...individualsFromMMPConst,
          ...baseIndividualPool,
        ];
        allRelevantIndividuals = Array.from(
          new Map(combinedIndividuals.map((c) => [c.id, c])).values()
        );

        if (
          candidatesWithFinalVotes.length > 0 &&
          !candidatesWithFinalVotes[0]?.isPartyEntity
        ) {
          allRelevantIndividuals = allRelevantIndividuals.map((indiv) => {
            const votedData = candidatesWithFinalVotes.find(
              (votedCand) => votedCand.id === indiv.id
            );
            const partyDetails = allPartiesInGame.find(
              (p) => p.id === indiv.partyId
            );
            return {
              ...indiv,
              votes: votedData?.votes ?? null,
              partyName: partyDetails?.name || indiv.partyName,
              partyColor: partyDetails?.color || indiv.partyColor,
            };
          });
        } else {
          // No individual votes directly simulated (e.g. PR sim was parties) or no sim data
          allRelevantIndividuals = allRelevantIndividuals.map((indiv) => {
            const partyDetails = allPartiesInGame.find(
              (p) => p.id === indiv.partyId
            );
            return {
              ...indiv,
              votes: null,
              partyName: partyDetails?.name || indiv.partyName,
              partyColor: partyDetails?.color || indiv.partyColor,
            };
          });
        }
      } else {
        allRelevantIndividuals = candidatesWithFinalVotes;
      }

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
      // (This part of your code seems largely fine and is kept as is, ensure all variables are correctly scoped and passed)
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
      const currentElectionDate = createDateObj(electionToEnd.electionDate); // Use helper
      let termEndDateObj = null;
      if (currentElectionDate) {
        termEndDateObj = new Date(currentElectionDate);
        termEndDateObj.setFullYear(
          currentElectionDate.getFullYear() + termLength
        );
        termEndDateObj.setDate(currentElectionDate.getDate() - 1); // End of term is day before new term starts
        if (termEndDateObj.getDate() === 0) termEndDateObj.setDate(0); // handles month boundaries correctly
      }
      const termEndDate = termEndDateObj
        ? {
            year: termEndDateObj.getFullYear(),
            month: termEndDateObj.getMonth() + 1,
            day: termEndDateObj.getDate(),
          }
        : {
            /* fallback if date calc fails */ year:
              (state.activeCampaign.currentDate.year || 2000) + termLength,
            month: 1,
            day: 1,
          };

      if (determinedWinnersArray.length > 0) {
        const isLegislativeBodyElection =
          electionToEnd.electoralSystem === "PartyListPR" ||
          electionToEnd.electoralSystem === "MMP" ||
          (seatsToFill > 1 &&
            (electionToEnd.level.includes("parliament") ||
              electionToEnd.level.includes("council") ||
              electionToEnd.level.includes("assembly") ||
              electionToEnd.level.includes("house") ||
              electionToEnd.level.includes("senate")));
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
            updatedGovernmentOfficesLocal[officeIndex].members = newMembers;
            updatedGovernmentOfficesLocal[officeIndex].termEnds = termEndDate;
            updatedGovernmentOfficesLocal[
              officeIndex
            ].currentCompositionByParty = newComposition;
          } else {
            updatedGovernmentOfficesLocal.push({
              officeId: `gov_office_body_${
                electionToEnd.instanceIdBase || electionToEnd.id
              }_${generateId()}`,
              officeNameTemplateId: electionToEnd.officeNameTemplateId,
              officeName: electionToEnd.officeName,
              level: electionToEnd.level,
              holder: null,
              members: newMembers,
              termEnds: termEndDate,
              currentCompositionByParty: newComposition,
            });
          }
          if (newMembers.some((mem) => mem.id === playerPoliticianData.id)) {
            newPlayerOffice = memberRole;
            playerWonAnySeatThisElection = true;
          }
        } else {
          // This block handles single-winner offices and the "conceptual seats" after explosion
          determinedWinnersArray.forEach((winner, index) => {
            const newHolder = { ...winner, role: "", termEnds: termEndDate };
            delete newHolder.votes;
            let finalOfficeName = electionToEnd.officeName;

            // The 'isConceptualSeatModel' logic below is for cases where conceptual seats were NOT
            // pre-exploded. For correctly pre-exploded conceptual seats, electionToEnd.officeName
            // should already contain the seat number (e.g., "City Council (Seat 1)").
            const isConceptualSeatModel =
              !electionToEnd.generatesOneWinner &&
              seatsToFill > 1 &&
              (electionToEnd.electoralSystem === "SNTV_MMD" ||
                electionToEnd.electoralSystem === "BlockVote" ||
                electionToEnd.electoralSystem === "PluralityMMD");
            if (isConceptualSeatModel)
              finalOfficeName = `${electionToEnd.officeName} (Seat ${
                index + 1
              })`;

            newHolder.role = finalOfficeName;

            // FIND/UPDATE existing office: Prioritize matching by instanceIdBase, fallback to officeName
            const officeIndex = updatedGovernmentOfficesLocal.findIndex(
              (off) => {
                // If both the existing office and the current election have an instanceIdBase, use it for a precise match.
                if (off.instanceIdBase && electionToEnd.instanceIdBase) {
                  return off.instanceIdBase === electionToEnd.instanceIdBase;
                }
                // Fallback: If instanceIdBase is missing on the existing office or the election,
                // try matching by officeName. This helps update older entries from previous game states.
                return off.officeName === finalOfficeName;
              }
            );

            if (officeIndex !== -1) {
              // Found an existing office, update its holder and relevant details.
              updatedGovernmentOfficesLocal[officeIndex].holder = newHolder;
              updatedGovernmentOfficesLocal[officeIndex].termEnds = termEndDate;
              // Crucially, ensure instanceIdBase and cityId are set on the existing office,
              // especially for entries from older game states that might be missing them.
              updatedGovernmentOfficesLocal[officeIndex].instanceIdBase =
                electionToEnd.instanceIdBase;
              updatedGovernmentOfficesLocal[officeIndex].cityId =
                electionToEnd.entityDataSnapshot.id;
              updatedGovernmentOfficesLocal[officeIndex].officeNameTemplateId =
                electionToEnd.officeNameTemplateId;
              updatedGovernmentOfficesLocal[officeIndex].officeName =
                finalOfficeName; // Ensure the display name is up-to-date
              updatedGovernmentOfficesLocal[officeIndex].level =
                electionToEnd.level;
            } else {
              // No existing office found, create a new one.
              updatedGovernmentOfficesLocal.push({
                officeId: `gov_office_${
                  electionToEnd.instanceIdBase ||
                  electionToEnd.officeNameTemplateId
                }_${generateId()}`, // Use instanceIdBase for a unique base, plus generateId
                officeNameTemplateId: electionToEnd.officeNameTemplateId,
                officeName: finalOfficeName,
                level: electionToEnd.level,
                holder: newHolder,
                termEnds: termEndDate,
                cityId: electionToEnd.entityDataSnapshot.id,
                instanceIdBase: electionToEnd.instanceIdBase, // Store instanceIdBase for future lookups
              });
            }
            if (newHolder.id === playerPoliticianData.id) {
              newPlayerOffice = finalOfficeName;
              playerWonAnySeatThisElection = true;
            }
          });
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

      console.log(updatedGovernmentOfficesLocal);

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
