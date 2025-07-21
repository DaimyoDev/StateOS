// src/stores/electionSlice.js
// This slice manages the state of all elections within an active campaign.
// It orchestrates calls to the specialized election modules to handle complex logic.

// NOTE: Import paths are updated to reflect the new refactored structure.
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData.js";
import { createDateObj, getRandomInt, generateId } from "../utils/core.js"; // Added adjustStatLevel
import { calculateElectionOutcome } from "../elections/electionResults.js";
import { normalizePolling } from "../General Scripts/PollingFunctions.js";
import {
  calculateBaseCandidateScore,
  generateElectionParticipants,
  getElectionInstances,
} from "../utils/electionUtils.js";
import {
  MOOD_LEVELS,
  ECONOMIC_OUTLOOK_LEVELS,
} from "../data/governmentData.js";

// --- Local Helper Functions (To be moved to electionManager.js later) ---

const getIncumbentsForOfficeInstance = (
  resolvedOfficeName,
  electionType,
  governmentOffices
) => {
  const matchingOffices = governmentOffices.filter(
    (off) => off.officeName === resolvedOfficeName && off.holder
  );
  if (matchingOffices.length === 0) return null;
  if (electionType.generatesOneWinner) {
    return {
      ...matchingOffices[0].holder,
      isActuallyRunning: Math.random() < 0.8,
    };
  } else {
    return matchingOffices.map((off) => ({
      ...off.holder,
      isActuallyRunning: Math.random() < 0.7,
    }));
  }
};

const calculateSeatDetailsForInstance = (electionType, entityPopulation) => {
  if (electionType.generatesOneWinner) {
    return { numberOfSeats: 1, seatDistributionMethod: "single_winner" };
  }
  let numberOfSeats = electionType.minCouncilSeats || 0;
  if (
    electionType.councilSeatPopulationTiers &&
    typeof entityPopulation === "number" &&
    entityPopulation > 0
  ) {
    for (const tier of electionType.councilSeatPopulationTiers) {
      if (entityPopulation < tier.popThreshold) {
        numberOfSeats += getRandomInt(
          tier.extraSeatsRange[0],
          tier.extraSeatsRange[1]
        );
        return { numberOfSeats, seatDistributionMethod: "multi_winner" };
      }
    }
    const lastTier =
      electionType.councilSeatPopulationTiers[
        electionType.councilSeatPopulationTiers.length - 1
      ];
    if (entityPopulation >= lastTier.popThreshold) {
      numberOfSeats += getRandomInt(
        lastTier.extraSeatsRange[0],
        lastTier.extraSeatsRange[1]
      );
    }
  }
  return { numberOfSeats, seatDistributionMethod: "multi_winner" };
};

/**
 * Initializes the final election object for the store.
 */
const initializeElectionObject = ({
  electionType,
  instanceContext,
  currentDate,
  incumbentInfo,
  participantsData,
  seatDetails,
}) => {
  const { instanceIdBase, entityData, resolvedOfficeName } = instanceContext;
  const electionYear = currentDate.year;
  const electionMonth = electionType.electionMonth || getRandomInt(4, 11);
  const electionDay = getRandomInt(1, 28);
  let filingMonth = electionMonth - getRandomInt(2, 4);
  let filingYear = electionYear;
  if (filingMonth <= 0) {
    filingMonth += 12;
    filingYear -= 1;
  }
  const filingDay = getRandomInt(1, 15);

  // CRITICAL FIX: The unique ID is generated here and must not be overwritten.
  const uniqueElectionId = `election_${instanceIdBase}_${electionYear}_${generateId()}`;

  return {
    // Manually cherry-pick properties from electionType to avoid overwriting the unique ID
    level: electionType.level,
    electoralSystem: electionType.electoralSystem,
    generatesOneWinner: electionType.generatesOneWinner,
    partyListType: electionType.partyListType,
    prThresholdPercent: electionType.prThresholdPercent,
    prAllocationMethod: electionType.prAllocationMethod,
    mmpConstituencySeatsRatio: electionType.mmpConstituencySeatsRatio,
    mmpListSeatsRatio: electionType.mmpListSeatsRatio,
    voteTarget: electionType.voteTarget,

    // Unique generated properties
    id: uniqueElectionId, // Use the unique ID
    instanceIdBase,
    officeName: resolvedOfficeName,
    officeNameTemplateId: electionType.id, // Keep original template ID for reference
    electionDate: {
      year: electionYear,
      month: electionMonth,
      day: electionDay,
    },
    filingDeadline: { year: filingYear, month: filingMonth, day: filingDay },
    incumbentInfo,
    numberOfSeatsToFill: seatDetails.numberOfSeats,
    totalEligibleVoters: Math.floor(
      (entityData.population || 0) * (0.6 + Math.random() * 0.25)
    ),
    politicalLandscape: entityData.politicalLandscape || [],
    entityDataSnapshot: { ...entityData },
    playerIsCandidate: false,
    outcome: {
      status: "upcoming",
      winners: [],
      resultsByCandidate: [],
      resultsByParty: {},
    },

    // Participant data
    candidates:
      participantsData.type === "individual_candidates"
        ? participantsData.data
        : [],
    partyLists:
      participantsData.type === "party_lists" ? participantsData.data : {},
    mmpData:
      participantsData.type === "mmp_participants"
        ? participantsData.data
        : null,
  };
};

export const createElectionSlice = (set, get) => ({
  actions: {
    generateScheduledElections: () => {
      set((state) => {
        if (!state.activeCampaign) return {};

        const {
          currentDate,
          countryId,
          elections: existingElections = [],
          governmentOffices = [],
        } = state.activeCampaign;
        const countryElectionTypes = ELECTION_TYPES_BY_COUNTRY[countryId] || [];
        let newElectionsToAdd = [];

        countryElectionTypes.forEach((electionType) => {
          const instances = getElectionInstances(
            electionType,
            state.activeCampaign
          );

          instances.forEach((instanceContext) => {
            const { instanceIdBase, entityData, resolvedOfficeName } =
              instanceContext;
            const alreadyScheduled = existingElections.some(
              (e) =>
                e.instanceIdBase === instanceIdBase &&
                e.electionDate.year === currentDate.year
            );

            if (alreadyScheduled) return;

            const incumbentInfo = getIncumbentsForOfficeInstance(
              resolvedOfficeName,
              electionType,
              governmentOffices
            );
            const seatDetails = calculateSeatDetailsForInstance(
              electionType,
              entityData.population
            );
            if (seatDetails.numberOfSeats <= 0) return;

            const electionPropertiesForScoring = {
              ...electionType,
              officeName: resolvedOfficeName,
              incumbent: incumbentInfo,
              electorateIssues: entityData.issues || ["Economy", "Healthcare"],
              electorateLeaning: entityData.politicalLeaning || "Moderate",
            };

            const participantsData = generateElectionParticipants({
              electionType,
              partiesInScope:
                state.activeCampaign.generatedPartiesSnapshot || [],
              incumbentInfo,
              numberOfSeatsToFill: seatDetails.numberOfSeats,
              countryId,
              activeCampaign: state.activeCampaign,
              entityPopulation: entityData.population,
              electionPropertiesForScoring,
            });

            const newElection = initializeElectionObject({
              electionType,
              instanceContext,
              currentDate,
              incumbentInfo,
              participantsData,
              seatDetails,
            });
            newElectionsToAdd.push(newElection);
          });
        });

        if (newElectionsToAdd.length > 0) {
          const sortedElections = [
            ...existingElections,
            ...newElectionsToAdd,
          ].sort(
            (a, b) =>
              createDateObj(a.electionDate) - createDateObj(b.electionDate)
          );
          return {
            activeCampaign: {
              ...state.activeCampaign,
              elections: sortedElections,
            },
          };
        }
        return {};
      });
    },

    processElectionResults: (electionId, simulatedElectionData = null) => {
      set((state) => {
        if (!state.activeCampaign?.elections) return state;

        const electionIndex = state.activeCampaign.elections.findIndex(
          (e) => e.id === electionId
        );
        if (electionIndex === -1) return state;

        const electionToEnd = state.activeCampaign.elections[electionIndex];
        if (
          electionToEnd.outcome?.status === "concluded" &&
          !simulatedElectionData
        )
          return state;

        const allParties = [
          ...(state.activeCampaign.generatedPartiesSnapshot || []),
          ...(state.activeCampaign.customPartiesSnapshot || []),
        ];
        const outcome = calculateElectionOutcome(
          electionToEnd,
          allParties,
          simulatedElectionData
        );

        const updatedElection = {
          ...electionToEnd,
          outcome: {
            ...electionToEnd.outcome,
            ...outcome,
            status: "concluded",
          },
        };

        let updatedElections = [...state.activeCampaign.elections];
        updatedElections[electionIndex] = updatedElection;

        let updatedGovernmentOffices = [
          ...state.activeCampaign.governmentOffices,
        ];
        const electionDef = ELECTION_TYPES_BY_COUNTRY[
          state.activeCampaign.countryId
        ]?.find((e) => e.id === updatedElection.officeNameTemplateId);
        const termLength = electionDef?.frequencyYears || 4;
        const termEnds = {
          year: updatedElection.electionDate.year + termLength,
          month: updatedElection.electionDate.month,
          day: updatedElection.electionDate.day,
        };

        if (
          outcome.determinedWinnersArray &&
          outcome.determinedWinnersArray.length > 0
        ) {
          const isLegislativeBody =
            updatedElection.numberOfSeatsToFill > 1 &&
            !updatedElection.generatesOneWinner;

          if (isLegislativeBody) {
            const officeIndex = updatedGovernmentOffices.findIndex(
              (o) => o.officeName === updatedElection.officeName
            );
            const newMembers = outcome.determinedWinnersArray.map((winner) => {
              const fullWinnerData = allParties.find(
                (p) => p.id === winner.partyId
              )
                ? winner
                : { ...winner, ...get().activeCampaign.politician };
              return {
                ...fullWinnerData,
                holder: fullWinnerData, // This is potentially still a nested holder. Check source.
                role: `Member, ${updatedElection.officeName}`,
              };
            });
            if (officeIndex > -1) {
              updatedGovernmentOffices[officeIndex] = {
                ...updatedGovernmentOffices[officeIndex],
                members: newMembers,
                termEnds,
                officeNameTemplateId: updatedElection.officeNameTemplateId,
              };
            } else {
              updatedGovernmentOffices.push({
                officeId: `gov_${updatedElection.instanceIdBase}`,
                officeName: updatedElection.officeName,
                level: updatedElection.level,
                cityId: outcome.cityId,
                members: newMembers,
                termEnds,
                officeNameTemplateId: updatedElection.officeNameTemplateId,
              });
            }
          } else {
            // Single Winner Office
            const winner = outcome.determinedWinnersArray[0];
            const fullWinnerData = allParties.find(
              (p) => p.id === winner.partyId
            )
              ? winner
              : { ...winner, ...get().activeCampaign.politician };
            const officeIndex = updatedGovernmentOffices.findIndex(
              (o) => o.officeName === updatedElection.officeName
            );
            const newHolder = {
              ...fullWinnerData,
              role: updatedElection.officeName,
            };
            if (officeIndex > -1) {
              updatedGovernmentOffices[officeIndex] = {
                ...updatedGovernmentOffices[officeIndex],
                holder: newHolder,
                termEnds,
                officeNameTemplateId: updatedElection.officeNameTemplateId,
              };
            } else {
              updatedGovernmentOffices.push({
                officeId: `gov_${updatedElection.instanceIdBase}`,
                officeName: updatedElection.officeName,
                level: updatedElection.level,
                cityId: outcome.cityId,
                holder: newHolder,
                termEnds,
                officeNameTemplateId: updatedElection.officeNameTemplateId,
              });
            }
          }
        }

        return {
          activeCampaign: {
            ...state.activeCampaign,
            elections: updatedElections,
            governmentOffices: updatedGovernmentOffices,
          },
        };
      });
    },

    declareCandidacy: (electionId) => {
      set((state) => {
        if (!state.activeCampaign?.politician) return state;

        const {
          politician,
          partyInfo,
          elections,
          customPartiesSnapshot,
          generatedPartiesSnapshot,
        } = state.activeCampaign;
        let successfullyDeclared = false;

        const updatedElections = elections.map((election) => {
          if (
            election.id === electionId &&
            election.outcome?.status === "upcoming"
          ) {
            const today = createDateObj(state.activeCampaign.currentDate);
            const deadline = createDateObj(election.filingDeadline);
            if (today.getTime() > deadline.getTime()) {
              get().actions.addToast?.({
                message: "Filing deadline has passed.",
                type: "error",
              });
              return election;
            }
            if (election.playerIsCandidate) {
              get().actions.addToast?.({
                message: "You are already a candidate.",
                type: "info",
              });
              return election;
            }

            let partyDetails = {
              partyId: "player_independent",
              partyName: "Independent",
              partyColor: "#888888",
            };
            if (partyInfo?.type === "join_generated") {
              const party = generatedPartiesSnapshot.find(
                (p) => p.id === partyInfo.id
              );
              if (party)
                partyDetails = {
                  partyId: party.id,
                  partyName: party.name,
                  partyColor: party.color,
                };
            } else if (partyInfo?.type === "use_custom") {
              const party = customPartiesSnapshot.find(
                (p) => p.id === partyInfo.id
              );
              if (party)
                partyDetails = {
                  partyId: party.id,
                  partyName: party.name,
                  partyColor: party.color,
                };
            }

            const playerAsCandidate = {
              id: politician.id,
              name: `${politician.firstName} ${politician.lastName}`,
              isPlayer: true,
              isIncumbent: election.incumbentInfo?.id === politician.id,
              ...partyDetails,
            };

            const newCandidateList = [
              ...(election.candidates || []),
              playerAsCandidate,
            ];
            const adultPop = election.totalEligibleVoters / 0.7; // Estimate
            const finalCandidates = normalizePolling(
              newCandidateList.map((c) => ({
                ...c,
                baseScore:
                  c.baseScore ||
                  calculateBaseCandidateScore(
                    c,
                    election,
                    state.activeCampaign
                  ),
              })),
              adultPop
            );

            successfullyDeclared = true;
            get().actions.addToast?.({
              message: `Successfully declared candidacy for ${election.officeName}!`,
              type: "success",
            });
            return {
              ...election,
              candidates: finalCandidates,
              playerIsCandidate: true,
            };
          }
          return election;
        });

        return {
          activeCampaign: {
            ...state.activeCampaign,
            elections: updatedElections,
            politician: {
              ...politician,
              isInCampaign: successfullyDeclared || politician.isInCampaign,
            },
          },
        };
      });
    },

    // New action to update polling for all active elections daily

    updateDailyPolling: () => {
      set((state) => {
        if (!state.activeCampaign?.elections) return state;

        let pollingChanged = false;

        const updatedElections = state.activeCampaign.elections.map(
          (election) => {
            if (
              election.outcome?.status === "upcoming" ||
              election.outcome?.status === "campaigning"
            ) {
              const normalizedCandidates = normalizePolling(
                election.candidates,
                100
              ); //

              if (
                JSON.stringify(normalizedCandidates) !==
                JSON.stringify(election.candidates)
              ) {
                pollingChanged = true;
              }
              return { ...election, candidates: normalizedCandidates };
            }
            return election;
          }
        );

        if (pollingChanged) {
          return {
            activeCampaign: {
              ...state.activeCampaign,
              elections: updatedElections,
            },
          };
        }
        return state;
      });
    },
  },
});
