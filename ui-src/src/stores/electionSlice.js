// src/stores/electionSlice.js
// This slice manages the state of all elections within an active campaign.
// It orchestrates calls to the specialized election modules to handle complex logic.

// NOTE: Import paths are updated to reflect the new refactored structure.
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData.js";
import { createDateObj} from "../utils/core.js"; // Added adjustStatLevel
import { calculateElectionOutcome } from "../elections/electionResults.js";
import {
  getElectionInstances,
  generateElectionParticipants,
  initializeElectionObject,
  calculateSeatDetailsForInstance,
} from "../utils/electionUtils.js";
import { generateOptimizedElectionParticipants } from "../General Scripts/OptimizedElectionGeneration.js";
import { generateNewsForEvent } from "../simulation/newsGenerator.js";
import { rehydratePolitician } from "../entities/personnel.js";
import { _addPoliticiansToSoA_helper } from "./dataSlice.js";
import { calculateBaseCandidateScore } from "../utils/electionUtils.js";
import { normalizePollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";

// --- Local Helper Functions (To be moved to electionManager.js later) ---

/**
 * Checks if a player is eligible to declare candidacy for an election based on their location.
 * Players can only run for offices within their state or city.
 * @param {object} election - The election object
 * @param {object} playerLocation - Object containing startingCity, regionId, countryId
 * @returns {boolean} - True if eligible, false otherwise
 */
const checkCandidacyEligibility = (election, playerLocation) => {
  const { startingCity, regionId, countryId } = playerLocation;
  const entity = election.entityDataSnapshot;
  
  if (!entity) return false;
  
  // National elections - eligible if same country
  if (election.level && election.level.startsWith("national_")) {
    return entity.countryId === countryId || entity.id === countryId;
  }
  
  // Local city elections - eligible if same city
  if (election.level === "local_city" || election.level === "local_city_or_municipality") {
    return entity.id === startingCity?.id;
  }
  
  // State/regional elections - eligible if same state/region
  if (election.level && (election.level.startsWith("state_") || election.level.startsWith("regional_"))) {
    return (
      entity.id === regionId ||
      entity.stateId === regionId ||
      entity.parentId === regionId ||
      entity.id.startsWith(regionId + "_")
    );
  }
  
  // District elections within state - eligible if district is in player's state
  if (entity.stateId === regionId || entity.parentId === regionId || entity.id.startsWith(regionId + "_")) {
    return true;
  }
  
  // City council elections - eligible if same city
  if (election.level === "local_city_or_municipality_council") {
    return entity.id === startingCity?.id || entity.parentId === startingCity?.id;
  }
  
  return false;
};

const cleanWinnerName = (name) => {
  if (typeof name !== "string") return name;
  // This regex removes a trailing parenthetical that includes "List #"
  return name.replace(/\s*\([^)]*List\s*#\d+\)$/, "").trim();
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
        let allNewlyGeneratedChallengers = [];

        // --- OPTIMIZATION: Pre-calculate last held elections --- 
        const lastHeldElectionsMap = new Map();
        existingElections.forEach(e => {
            if (e.outcome?.status === "concluded") {
                const existing = lastHeldElectionsMap.get(e.instanceIdBase);
                if (!existing || e.electionDate.year > existing.electionDate.year) {
                    lastHeldElectionsMap.set(e.instanceIdBase, e);
                }
            }
        });

        // --- OPTIMIZATION: Create a set of elections already scheduled for the current year ---
        const scheduledInCurrentYearSet = new Set(
            existingElections
                .filter(e => e.electionDate.year === currentDate.year)
                .map(e => e.instanceIdBase)
        );

        // --- OPTIMIZATION: Pre-calculate incumbents by office name ---
        const incumbentsMap = new Map();
        governmentOffices.forEach(office => {
            if (office.holder) {
                const incumbents = incumbentsMap.get(office.officeName) || [];
                incumbents.push(office);
                incumbentsMap.set(office.officeName, incumbents);
            }
        });

        console.log(`[Election Generation] Processing ${countryElectionTypes.length} election types for ${currentDate.year}`);
        const startTime = performance.now();

        countryElectionTypes.forEach((electionType) => {
          const generationCampaignContext = {
            ...state.activeCampaign,
            regionId: null,
          };

          const instances = getElectionInstances(
            electionType,
            generationCampaignContext // Use the modified context
          );

          instances.forEach((instanceContext) => {
            const { instanceIdBase, entityData, resolvedOfficeName } =
              instanceContext;

            // --- OPTIMIZATION: Use the lookup map --- 
            const lastHeldElection = lastHeldElectionsMap.get(instanceIdBase);

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

            const alreadyScheduled = scheduledInCurrentYearSet.has(instanceIdBase);

            if (alreadyScheduled) return;

            const matchingOffices = incumbentsMap.get(resolvedOfficeName) || [];
            let incumbentInfo = null;
            if (matchingOffices.length > 0) {
              if (electionType.generatesOneWinner) {
                incumbentInfo = {
                  ...matchingOffices[0].holder,
                  isActuallyRunning: Math.random() < 0.8,
                };
              } else {
                incumbentInfo = matchingOffices.map((off) => ({
                  ...off.holder,
                  isActuallyRunning: Math.random() < 0.7,
                }));
              }
            }
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

            // Try optimized generation first, fall back to original if not supported
            let participantsData = generateOptimizedElectionParticipants({
              electionType,
              partiesInScope:
                state.activeCampaign.generatedPartiesSnapshot || [],
              incumbentInfo,
              numberOfSeatsToFill: seatDetails.numberOfSeats,
              countryId,
              activeCampaign: state.activeCampaign,
              electionPropertiesForScoring,
              entityPopulation: entityData.population,
            });

            // Fall back to original generation if optimized version doesn't support this election type
            if (!participantsData) {
              participantsData = generateElectionParticipants({
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
            }

            let allCandidatesInRace = [];
            switch (participantsData.type) {
              case "individual_candidates":
                // For FPTP/MMD, data is a Map of candidates.
                if (participantsData.data instanceof Map) {
                  allCandidatesInRace = Array.from(
                    participantsData.data.values()
                  );
                }
                break;
              case "party_lists":
                // For PartyListPR, data is an object where each property is an array of candidates.
                allCandidatesInRace = Object.values(
                  participantsData.data || {}
                ).flat();
                break;
              case "mmp_participants": {
                // For MMP, data is a complex object. We need to gather from all sources.
                const mmpData = participantsData.data || {};
                const listCands = Object.values(
                  mmpData.partyLists || {}
                ).flat();
                const constCands = Object.values(
                  mmpData.constituencyCandidatesByParty || {}
                ).flat();
                const indCands =
                  mmpData.independentConstituencyCandidates || [];
                allCandidatesInRace = [
                  ...listCands,
                  ...constCands,
                  ...indCands,
                ];
                break;
              }
              default:
                console.warn(
                  `Unknown participantsData type: ${participantsData.type}`
                );
            }

            // Now, we can safely find the new challengers from our unified list.
            const incumbentIds = new Set(
              (incumbentInfo
                ? Array.isArray(incumbentInfo)
                  ? incumbentInfo
                  : [incumbentInfo]
                : []
              ).map((i) => i.id)
            );

            const newChallengersForThisRace = allCandidatesInRace.filter(
              (candidate) => candidate && !incumbentIds.has(candidate.id)
            );

            allNewlyGeneratedChallengers.push(...newChallengersForThisRace);

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

        // Batch process all new politicians at once instead of per-election
        let updatedPoliticiansSoA = state.activeCampaign.politicians;
        if (allNewlyGeneratedChallengers.length > 0) {
          console.log(`[Election Generation] Adding ${allNewlyGeneratedChallengers.length} new challengers to politicians store`);
          updatedPoliticiansSoA = _addPoliticiansToSoA_helper(
            allNewlyGeneratedChallengers,
            state.activeCampaign.politicians
          );
        }

        const endTime = performance.now();
        console.log(`[Election Generation] Completed in ${(endTime - startTime).toFixed(2)}ms. Generated ${newElectionsToAdd.length} elections with ${allNewlyGeneratedChallengers.length} new candidates.`);

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
              politicians: updatedPoliticiansSoA,
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

        const partiesMap = new Map(allParties.map((p) => [p.id, p]));

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
          const rawWinners = outcome.winnerAssignment.winners.filter(Boolean);

          // --- THIS IS THE FIX ---
          // Enrich the raw winner objects with full party details
          const winners = rawWinners.map((winner) => {
            const partyDetails = partiesMap.get(winner.partyId);
            return {
              ...winner,
              partyName: partyDetails?.name || "Independent",
              partyColor: partyDetails?.color || "#888888",
            };
          });

          const playerPoliticianId = state.activeCampaign.playerPoliticianId;

          const playerIsWinner = winners.some(
            (winner) => winner.id === playerPoliticianId
          );

          if (playerIsWinner) {
            updatedPlayerPolitician = {
              ...state.activeCampaign.politician,
              currentOffice: updatedElection.officeName,
            };
          }

          const officeIndex = updatedGovernmentOffices.findIndex(
            (o) => o && o.instanceIdBase === updatedElection.instanceIdBase
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
                instanceIdBase: updatedElection.instanceIdBase,
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
          const outletsToReport = [...allOutlets].sort(() => 0.5 - Math.random()).slice(0, 3);

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
          politicians: politiciansSoA, // Get the SoA store
          playerPoliticianId,
          startingCity,
          regionId,
          countryId,
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
              get().actions.addNotification?.({
                message: "You are already a candidate in this election.",
                category: 'Election',
                type: "info",
              });
              return election;
            }

            // Check location-based eligibility
            const isEligible = checkCandidacyEligibility(election, {
              startingCity,
              regionId,
              countryId,
            });
            
            if (!isEligible) {
              get().actions.addToast?.({
                message: "You are not eligible to run for this office. You can only run for offices within your state or city.",
                type: "error",
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

            const initialCandidatesMap = election.candidates || new Map();
            const candidateIds = Array.from(initialCandidatesMap.keys());
            const soaStore = state.activeCampaign.politicians;

            const currentCandidatesArray = candidateIds
              .map((id) => {
                const candidate = rehydratePolitician(id, soaStore);
                if (candidate) {
                  // Ensure the candidate has a proper name
                  if (!candidate.name && candidate.firstName && candidate.lastName) {
                    candidate.name = `${candidate.firstName} ${candidate.lastName}`;
                  }
                  // Fallback if name is still missing
                  if (!candidate.name) {
                    candidate.name = candidate.id || "Unknown Candidate";
                  }
                }
                return candidate;
              })
              .filter(Boolean);

            const newCandidateList = [
              ...currentCandidatesArray,
              playerAsCandidate,
            ];

            const adultPop = election.totalEligibleVoters / 0.7;
            const candidatesWithScores = newCandidateList.map((c) => ({
              ...c,
              baseScore:
                c.baseScore ||
                calculateBaseCandidateScore(c, election, state.activeCampaign),
            }));

            const incorrectlyKeyedMap = normalizePollingOptimized(
              candidatesWithScores,
              adultPop
            );

            const finalCandidatesMap = new Map();
            for (const candidate of incorrectlyKeyedMap.values()) {
              if (candidate && candidate.id) {
                finalCandidatesMap.set(candidate.id, candidate);
              }
            }

            successfullyDeclared = true;
            get().actions.addNotification?.({
              message: `Successfully declared candidacy for ${election.officeName}!`,
              category: 'Election',
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

        let updatedPoliticiansSoA = politiciansSoA;

        // If candidacy was successful, we need to update the SoA store.
        if (successfullyDeclared) {
          const newCampaignMap = new Map(politiciansSoA.campaign);
          const campaignData = newCampaignMap.get(playerPoliticianId) || {};

          // Set isInCampaign to true for the player
          newCampaignMap.set(playerPoliticianId, {
            ...campaignData,
            isInCampaign: true,
          });

          updatedPoliticiansSoA = {
            ...politiciansSoA,
            campaign: newCampaignMap,
          };
        }

        return {
          activeCampaign: {
            ...state.activeCampaign,
            elections: updatedElections,
            politicians: updatedPoliticiansSoA,
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

        const updatedElections = state.activeCampaign.elections.map(
          (election) => {
            if (
              election.outcome?.status === "upcoming" ||
              election.outcome?.status === "campaigning"
            ) {
              // --- FIX STARTS HERE ---

              // 1. Run the polling calculation as before.
              const incorrectlyKeyedMap = normalizePollingOptimized(
                election.candidates,
                election.totalEligibleVoters // Using a more realistic population is better than 100
              );

              // 2. Create a new, empty map.
              const correctlyKeyedMap = new Map();

              // 3. Loop through the results and rebuild the map with the CORRECT ID as the key.
              for (const candidate of incorrectlyKeyedMap.values()) {
                if (candidate && candidate.id) {
                  // Ensure candidate and id exist
                  correctlyKeyedMap.set(candidate.id, candidate);
                }
              }

              return { ...election, candidates: correctlyKeyedMap };

              // --- FIX ENDS HERE ---
            }
            return election;
          }
        );

        return {
          activeCampaign: {
            ...state.activeCampaign,
            elections: updatedElections,
          },
        };
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
