// src/stores/electionSlice.js
// This slice manages the state of all elections within an active campaign.
// It orchestrates calls to the specialized election modules to handle complex logic.

// NOTE: Import paths are updated to reflect the new refactored structure.
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData.js";
import { createDateObj, getRandomInt } from "../utils/core.js"; // Added adjustStatLevel
import { calculateElectionOutcome } from "../elections/electionResults.js";
import { normalizePolling } from "../General Scripts/PollingFunctions.js";
import {
  calculateBaseCandidateScore,
  generateElectionParticipants,
  getElectionInstances,
  initializeElectionObject,
} from "../utils/electionUtils.js";
import { generateNewsForEvent } from "../simulation/newsGenerator.js";

// --- Local Helper Functions (To be moved to electionManager.js later) ---

const cleanWinnerName = (name) => {
  if (typeof name !== "string") return name;
  // This regex removes a trailing parenthetical that includes "List #"
  return name.replace(/\s*\([^)]*List\s*#\d+\)$/, "").trim();
};

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
export const createElectionSlice = (set, get) => ({
  isSimulationMode: false,
  simulatedElections: [],
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

            const lastHeldElection = existingElections
              .filter(
                (e) =>
                  e.instanceIdBase === instanceIdBase &&
                  e.outcome?.status === "concluded"
              )
              .sort((a, b) => b.electionDate.year - a.electionDate.year)[0];

            const lastHeldYear = lastHeldElection
              ? lastHeldElection.electionDate.year
              : 0;

            // 2. Check if the election is due based on its frequency.
            // (Assumes start year is 2025 for the very first election scheduling)
            const isFirstTimeRun =
              lastHeldYear === 0 && currentDate.year === 2025;
            const isDue =
              currentDate.year >= lastHeldYear + electionType.frequencyYears;

            // 3. If it's not the first run and it's not due yet, skip it.
            if (!isFirstTimeRun && !isDue) {
              return; // Skip scheduling this election
            }

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
              activeCampaign: state.activeCampaign, // <-- Add this line
              incumbentInfoForDisplay: incumbentInfo, // <-- Rename this parameter
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

        let updatedPlayerPolitician = state.activeCampaign.politician;

        if (
          outcome.winnerAssignment?.winners &&
          outcome.winnerAssignment.winners.length > 0
        ) {
          const winners = outcome.winnerAssignment.winners;
          const playerIsWinner = winners.some(
            (winner) => winner.id === state.activeCampaign.politician.id
          );

          if (playerIsWinner) {
            updatedPlayerPolitician = {
              ...state.activeCampaign.politician,
              currentOffice: updatedElection.officeName,
            };
          }

          const officeIndex = updatedGovernmentOffices.findIndex(
            (o) => o.officeName === updatedElection.officeName
          );

          if (outcome.winnerAssignment.type === "MEMBERS_ARRAY") {
            const newMembers = winners.map((winner, i) => ({
              // Added index 'i' here
              ...winner,
              name: cleanWinnerName(winner.name),
              holder: {
                ...winner,
                name: cleanWinnerName(winner.name),
              },
              // The role now includes a specific seat number
              role: `Member, ${updatedElection.officeName} (Seat ${i + 1})`,
            }));

            if (officeIndex > -1) {
              updatedGovernmentOffices[officeIndex] = {
                ...updatedGovernmentOffices[officeIndex],
                members: newMembers,
                termEnds,
              };
            } else {
              updatedGovernmentOffices.push({
                officeId: `gov_${updatedElection.instanceIdBase}`,
                officeName: updatedElection.officeName,
                level: updatedElection.level, // Add level
                cityId:
                  updatedElection.entityDataSnapshot.parentCityId ||
                  updatedElection.entityDataSnapshot.id, // Add cityId
                members: newMembers,
                termEnds,
                officeNameTemplateId: updatedElection.officeNameTemplateId,
              });
            }
          } else {
            // SINGLE_HOLDER
            const winner = winners[0];
            const newHolder = {
              ...winner,
              name: cleanWinnerName(winner.name),
              role: updatedElection.officeName,
            };

            if (officeIndex > -1) {
              updatedGovernmentOffices[officeIndex] = {
                ...updatedGovernmentOffices[officeIndex],
                holder: newHolder,
                termEnds,
              };
            } else {
              updatedGovernmentOffices.push({
                officeId: `gov_${updatedElection.instanceIdBase}`,
                officeName: updatedElection.officeName,
                level: updatedElection.level, // Add level
                cityId:
                  updatedElection.entityDataSnapshot.parentCityId ||
                  updatedElection.entityDataSnapshot.id, // Add cityId
                holder: newHolder,
                termEnds,
                officeNameTemplateId: updatedElection.officeNameTemplateId,
              });
            }
          }
        }

        // --- NEW: NEWS GENERATION LOGIC ---
        const { newsContext } = outcome;
        const allOutlets = state.activeCampaign.newsOutlets || [];
        const currentDate = state.activeCampaign.currentDate;
        let newNewsItems = [...state.newsItems];

        if (
          newsContext &&
          newsContext.winners &&
          newsContext.winners.length > 0 &&
          allOutlets.length > 0
        ) {
          const winner = newsContext.winners[0];
          const event = {
            type: "election_results",
            context: {
              officeName: newsContext.officeName,
              winnerName: winner.name,
              winnerPartyName: winner.partyName,
              // You could expand context to include losers for more detailed articles
              losers: [],
            },
          };

          // Generate news from up to 3 random outlets to show different perspectives
          const outletsToReport = allOutlets
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          outletsToReport.forEach((outlet) => {
            const article = generateNewsForEvent(event, outlet, currentDate);
            newNewsItems.unshift(article); // Add new article to the top of the list
          });
        }

        return {
          activeCampaign: {
            ...state.activeCampaign,
            elections: updatedElections,
            governmentOffices: updatedGovernmentOffices,
            politician: updatedPlayerPolitician,
          },
          newsItems: newNewsItems,
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
              ...politician,
              id: politician.id,
              name: `${politician.firstName} ${politician.lastName}`,
              isPlayer: true,
              isIncumbent: election.incumbentInfo?.id === politician.id,
              ...partyDetails,
            };

            const currentCandidatesArray = Array.from(
              election.candidates.values()
            );

            // 2. Add the player to the array
            const newCandidateList = [
              ...currentCandidatesArray,
              playerAsCandidate,
            ];

            const adultPop = election.totalEligibleVoters / 0.7; // Estimate
            const candidatesWithScores = newCandidateList.map((c) => ({
              ...c,
              baseScore:
                c.baseScore ||
                calculateBaseCandidateScore(c, election, state.activeCampaign),
            }));

            // 3. Normalize polling on the array, which returns a new Map
            const finalCandidatesMap = normalizePolling(
              candidatesWithScores,
              adultPop
            );

            successfullyDeclared = true;
            get().actions.addToast?.({
              message: `Successfully declared candidacy for ${election.officeName}!`,
              type: "success",
            });
            return {
              ...election,
              candidates: finalCandidatesMap,
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
    setIsSimulationMode: (isSim) => set({ isSimulationMode: isSim }),

    // Sets the election data to be used by the simulation screens
    setSimulatedElections: (elections) =>
      set({ simulatedElections: elections }),

    // Clears the simulation data when it's over
    clearSimulatedElections: () => set({ simulatedElections: [] }),
    resetElectionState: () =>
      set({
        isSimulationMode: false,
        simulatedElections: [],
        isWinnerAnnouncementModalOpen: false,
        winnerAnnouncementData: null,
      }),
  },
});
