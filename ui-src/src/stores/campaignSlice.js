// src/stores/campaignSlice.js
import { normalizePolling } from "../General Scripts/PollingFunctions.js";
import { getRandomInt, calculateAdultPopulation } from "../utils/core.js";

/**
 * Helper function to find and update a specific politician (player or AI) within the activeCampaign state.
 * This is crucial for generalizing actions that can be performed by either the player or an AI.
 * @param {object} state - The current Zustand state.
 * @param {string | null} politicianId - The ID of the politician to update. If null, it targets the player.
 * @param {function} updateFn - A function that takes the politician object and returns the updated version.
 * @returns {object} The new activeCampaign state.
 */

export const createCampaignSlice = (set, get) => ({
  // --- State ---
  activeCampaign: null,

  // --- Actions ---
  actions: {
    endCampaign: () => {
      set({ activeCampaign: null, currentScene: "MainMenu" });
      get().actions.resetLegislationState?.();
      get().actions.resetTimeState?.();
      get().actions.resetNewsState?.();
      get().actions.resetElectionState?.();
    },

    spendCampaignHours: (hoursToSpend) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const hoursAvailable = campaignData?.campaignHoursRemainingToday || 0;

        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough time. Need ${hoursToSpend}hr, have ${hoursAvailable}hr.`,
            type: "warning",
          });
          return state;
        }

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        return {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: { ...politicians, campaign: newCampaignMap },
          },
        };
      });
    },

    resetDailyCampaignHours: () => {
      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign || !activeCampaign.politicians) return state;
        const dirtyList = activeCampaign.politicianIdsWithSpentHours;
        if (dirtyList.size === 0) return state; // Nothing to do, return immediately.
        const newCampaignMap = new Map(activeCampaign.politicians.campaign);

        // Iterate over all politicians in the campaign
        for (const id of dirtyList) {
          const campaignData = newCampaignMap.get(id);
          if (campaignData) {
            newCampaignMap.set(id, {
              ...campaignData,
              campaignHoursRemainingToday: campaignData.maxWorkingHours || 8,
            });
          }
        }

        return {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: new Set(),
            politicians: {
              ...activeCampaign.politicians,
              campaign: newCampaignMap,
            },
          },
        };
      });
    },

    personalFundraisingActivity: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const financesData = politicians.finances.get(playerPoliticianId);
        const attributesData = politicians.attributes.get(playerPoliticianId);

        const hoursAvailable = campaignData?.campaignHoursRemainingToday || 0;
        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough time. Need ${hoursToSpend}hrs.`,
            type: "warning",
          });
          return state;
        }

        let fundsRaised = Math.round(
          getRandomInt(500, 1500) *
            hoursToSpend *
            ((attributesData.fundraising || 5) / 4)
        );

        // Note: Staff boost logic would need to be refactored here

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
        });

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          campaignFunds: (financesData.campaignFunds || 0) + fundsRaised,
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        get().actions.addToast?.({
          message: `Spent ${hoursToSpend}hr(s) fundraising. Raised $${fundsRaised.toLocaleString()}!`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: {
              ...politicians,
              campaign: newCampaignMap,
              finances: newFinancesMap,
            },
          },
        };
      });
    },

    holdRallyActivity: (hoursToSpend = 4) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const financesData = politicians.finances.get(playerPoliticianId);
        const stateData = politicians.state.get(playerPoliticianId);
        const attributesData = politicians.attributes.get(playerPoliticianId);

        const cost = 500 + hoursToSpend * 150;
        const hoursAvailable = campaignData.campaignHoursRemainingToday || 0;
        const fundsAvailable = financesData.campaignFunds || 0;

        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough hours (Need ${hoursToSpend})`,
            type: "warning",
          });
          return state;
        }
        if (fundsAvailable < cost) {
          get().actions.addToast?.({
            message: `Not enough funds (Need $${cost.toLocaleString()})`,
            type: "error",
          });
          return state;
        }

        const oratoryFactor = Math.max(0.6, (attributesData.oratory || 3) / 5);
        const nameRecGain = Math.round(
          getRandomInt(100 * hoursToSpend, 250 * hoursToSpend) * oratoryFactor
        );
        const mediaBuzzGain = Math.round(
          getRandomInt(5 * hoursToSpend, 10 * hoursToSpend) * oratoryFactor
        );
        const pollingBoost = Math.round(getRandomInt(0, 2) * oratoryFactor); // Small polling boost

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
        });

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          campaignFunds: fundsAvailable - cost,
        });

        const newStateMap = new Map(politicians.state);
        newStateMap.set(playerPoliticianId, {
          ...stateData,
          nameRecognition: (stateData.nameRecognition || 0) + nameRecGain,
          mediaBuzz: Math.min(100, (stateData.mediaBuzz || 0) + mediaBuzzGain),
          polling: (stateData.polling || 0) + pollingBoost, // Note: polling will be renormalized later
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        get().actions.addToast?.({
          message: `Rally successful! Name Rec +${nameRecGain.toLocaleString()}, Buzz +${mediaBuzzGain}.`,
          type: "success",
        });

        // Find which elections the player is participating in to trigger polling updates
        const playerElections = activeCampaign.elections?.filter(election => 
          election.candidates.some(candidate => candidate.id === playerPoliticianId)
        ) || [];
        
        const result = {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: {
              ...politicians,
              campaign: newCampaignMap,
              finances: newFinancesMap,
              state: newStateMap,
            },
          },
        };
        
        // Trigger polling updates for player's elections after state update
        setTimeout(() => {
          if (playerElections.length > 0) {
            get().actions.updatePollingForAffectedElections(
              playerElections.map(e => e.id)
            );
            playerElections.forEach(election => {
              get().actions.generateNewPollForElection?.(election.id);
            });
          }
        }, 0);
        
        return result;
      });
    },

    goDoorKnocking: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians, startingCity } =
          activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const stateData = politicians.state.get(playerPoliticianId);
        const attributesData = politicians.attributes.get(playerPoliticianId);

        const hoursAvailable = campaignData?.campaignHoursRemainingToday || 0;
        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough hours (need ${hoursToSpend}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }

        const adultPop =
          calculateAdultPopulation(
            startingCity.population,
            startingCity.demographics?.ageDistribution
          ) || 1;
        const reachPerPlayerHour =
          10 + ((attributesData?.charisma || 5) - 5) * 2;
        const peopleReachedByVolunteers =
          (campaignData.volunteerCount || 0) * 3 * hoursToSpend;
        const totalPeopleReached = Math.round(
          reachPerPlayerHour * hoursToSpend + peopleReachedByVolunteers
        );
        const currentRecognition = stateData.nameRecognition || 0;
        const potentialNewReach = Math.max(0, adultPop - currentRecognition);
        const actualNewPeopleRecognized = Math.min(
          potentialNewReach,
          totalPeopleReached
        );

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
        });

        const newStateMap = new Map(politicians.state);
        newStateMap.set(playerPoliticianId, {
          ...stateData,
          nameRecognition: currentRecognition + actualNewPeopleRecognized,
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        get().actions.addToast?.({
          message: `Door knocking: Reached ~${totalPeopleReached} people. Name Rec +${actualNewPeopleRecognized.toLocaleString()}.`,
          type: "info",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: {
              ...politicians,
              campaign: newCampaignMap,
              state: newStateMap,
            },
          },
        };
      });
    },

    makePublicAppearanceActivity: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians, startingCity } =
          activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const financesData = politicians.finances.get(playerPoliticianId);
        const stateData = politicians.state.get(playerPoliticianId);
        const attributesData = politicians.attributes.get(playerPoliticianId);

        const cost = 200;
        const hoursAvailable = campaignData.campaignHoursRemainingToday || 0;
        const fundsAvailable = financesData.campaignFunds || 0;

        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough hours (Need ${hoursToSpend}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }
        if (fundsAvailable < cost) {
          get().actions.addToast?.({
            message: `Not enough funds (Need $${cost}).`,
            type: "error",
          });
          return state;
        }

        const adultPop =
          calculateAdultPopulation(
            startingCity.population,
            startingCity.demographics?.ageDistribution
          ) || 1;
        const charismaFactor = Math.max(
          0.5,
          (attributesData.charisma || 3) / 5
        );
        const approvalBoost = Math.round(
          getRandomInt(0, hoursToSpend) * charismaFactor
        );
        const nameRecGain = Math.round(
          getRandomInt(10 * hoursToSpend, 30 * hoursToSpend) * charismaFactor
        );
        const mediaBuzzGain =
          getRandomInt(1 * hoursToSpend, 3 * hoursToSpend) +
          Math.floor((attributesData.charisma || 5) / 2);

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
        });

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          campaignFunds: fundsAvailable - cost,
        });

        const newStateMap = new Map(politicians.state);
        newStateMap.set(playerPoliticianId, {
          ...stateData,
          approvalRating: Math.min(
            100,
            (stateData.approvalRating || 0) + approvalBoost
          ),
          nameRecognition: Math.min(
            adultPop,
            (stateData.nameRecognition || 0) + nameRecGain
          ),
          mediaBuzz: Math.min(100, (stateData.mediaBuzz || 0) + mediaBuzzGain),
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        get().actions.addToast?.({
          message: `Public appearance: Approval +${approvalBoost}%. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politicians: {
              ...politicians,
              campaign: newCampaignMap,
              finances: newFinancesMap,
              state: newStateMap,
            },
          },
        };
      });
    },

    recruitVolunteers: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const attributesData = politicians.attributes.get(playerPoliticianId);

        // Staff logic will need a future refactor
        const hoursCost = hoursToSpend;

        if ((campaignData.campaignHoursRemainingToday || 0) < hoursCost) {
          get().actions.addToast?.({
            message: `Not enough time to recruit. Need ${hoursCost}hrs.`,
            type: "warning",
          });
          return state;
        }

        const charismaFactor = 1 + ((attributesData.charisma || 5) - 5) * 0.1;
        const newVolunteers = Math.round(
          getRandomInt(3, 8) * hoursToSpend * charismaFactor
        );

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday:
            (campaignData.campaignHoursRemainingToday || 0) - hoursCost,
          volunteerCount: (campaignData.volunteerCount || 0) + newVolunteers,
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        get().actions.addToast?.({
          message: `You spent ${hoursToSpend}hrs and recruited ${newVolunteers} new volunteers!`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: { ...politicians, campaign: newCampaignMap },
          },
        };
      });
    },

    setMonthlyAdvertisingBudget: (amount) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const financesData = politicians.finances.get(playerPoliticianId);
        const parsedAmount = parseInt(amount, 10);

        if (isNaN(parsedAmount) || parsedAmount < 0) {
          get().actions.addToast?.({
            message: "Invalid budget amount.",
            type: "error",
          });
          return state;
        }

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          advertisingBudgetMonthly: parsedAmount,
        });

        get().actions.addToast?.({
          message: `Monthly ad budget set to $${parsedAmount.toLocaleString()}`,
          type: "info",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politicians: { ...politicians, finances: newFinancesMap },
          },
        };
      });
    },

    setAdvertisingStrategy: (strategyData) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const { focus, targetId, intensity } = strategyData;

        if (!focus) {
          get().actions.addToast?.({
            message: "Invalid ad strategy focus.",
            type: "error",
          });
          return state;
        }
        if (
          (focus === "attack_opponent" || focus === "advocacy_issue") &&
          !targetId
        ) {
          get().actions.addToast?.({
            message: "A target must be selected for this strategy.",
            type: "error",
          });
          return state;
        }

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          currentAdStrategy: {
            focus,
            targetId: targetId || null,
            intensity: intensity || 0,
          },
        });

        get().actions.addToast?.({
          message: `Ongoing advertising strategy has been updated.`,
          type: "info",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politicians: { ...politicians, campaign: newCampaignMap },
          },
        };
      });
    },

    launchManualAdBlitz: (params) => {
      set((state) => {
        const { spendAmount, hoursSpent } = params;
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const campaignData = politicians.campaign.get(playerPoliticianId);
        const financesData = politicians.finances.get(playerPoliticianId);
        const stateData = politicians.state.get(playerPoliticianId);
        const attributesData = politicians.attributes.get(playerPoliticianId);

        const hoursCost = hoursSpent; // Staff delegation logic removed for now

        if ((financesData.campaignFunds || 0) < spendAmount) {
          get().actions.addToast?.({
            message: `Not enough funds. Need $${spendAmount.toLocaleString()}`,
            type: "error",
          });
          return state;
        }
        if ((campaignData.campaignHoursRemainingToday || 0) < hoursCost) {
          get().actions.addToast?.({
            message: `Not enough time for an ad blitz. Need ${hoursCost}hrs.`,
            type: "warning",
          });
          return state;
        }

        const effectiveSkill = attributesData.charisma || 5;
        const toastMessage = `You launched a ${hoursSpent}hr ad blitz for $${spendAmount.toLocaleString()}!`;

        const effectivenessFactor =
          (spendAmount / 1000) *
          (hoursSpent / 3) *
          (1 + ((effectiveSkill || 5) - 5) * 0.1);
        const mediaBuzzEffect = Math.round(
          getRandomInt(3, 6) * effectivenessFactor
        );
        const nameRecEffect = Math.round(
          getRandomInt(50, 200) * effectivenessFactor
        );

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          campaignHoursRemainingToday:
            (campaignData.campaignHoursRemainingToday || 0) - hoursCost,
        });

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          campaignFunds: (financesData.campaignFunds || 0) - spendAmount,
        });

        const newStateMap = new Map(politicians.state);
        newStateMap.set(playerPoliticianId, {
          ...stateData,
          mediaBuzz: Math.min(
            100,
            (stateData.mediaBuzz || 0) + mediaBuzzEffect
          ),
          nameRecognition: (stateData.nameRecognition || 0) + nameRecEffect,
        });

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        newDirtyList.add(playerPoliticianId);

        get().actions.addToast?.({ message: toastMessage, type: "success" });

        // Find which elections the player is participating in to trigger polling updates
        const playerElections = activeCampaign.elections?.filter(election => 
          election.candidates.some(candidate => candidate.id === playerPoliticianId)
        ) || [];
        
        const result = {
          activeCampaign: {
            ...activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: {
              ...politicians,
              campaign: newCampaignMap,
              finances: newFinancesMap,
              state: newStateMap,
            },
          },
        };
        
        // Trigger polling updates for player's elections after state update
        setTimeout(() => {
          if (playerElections.length > 0) {
            get().actions.updatePollingForAffectedElections(
              playerElections.map(e => e.id)
            );
            playerElections.forEach(election => {
              get().actions.generateNewPollForElection?.(election.id);
            });
          }
        }, 0);
        
        return result;
      });
    },
    updatePollingForAffectedElections: (affectedElectionIds) => {
      set((state) => {
        if (!state.activeCampaign?.elections) return {};

        const affectedIdsSet = new Set(affectedElectionIds);
        const city = state.activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;

        const { politicians } = state.activeCampaign;
        
        const updatedElections = state.activeCampaign.elections.map(
          (election) => {
            if (affectedIdsSet.has(election.id)) {
              // Handle both Map and Array cases efficiently
              let updatedCandidatesArray;
              
              if (election.candidates instanceof Map) {
                // Work directly with Map for better performance
                updatedCandidatesArray = [];
                for (const candidate of election.candidates.values()) {
                  const stateData = politicians.state.get(candidate.id);
                  const attributesData = politicians.attributes.get(candidate.id);
                  
                  if (stateData || attributesData) {
                    updatedCandidatesArray.push({
                      ...candidate,
                      baseScore: stateData?.baseScore || candidate.baseScore,
                      nameRecognition: stateData?.nameRecognition || candidate.nameRecognition,
                      approvalRating: stateData?.approvalRating || candidate.approvalRating,
                      mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz,
                      ...(attributesData && { attributes: { ...candidate.attributes, ...attributesData } })
                    });
                  } else {
                    updatedCandidatesArray.push(candidate);
                  }
                }
              } else {
                // Handle array case
                updatedCandidatesArray = election.candidates.map(candidate => {
                  const stateData = politicians.state.get(candidate.id);
                  const attributesData = politicians.attributes.get(candidate.id);
                  
                  if (stateData || attributesData) {
                    return {
                      ...candidate,
                      baseScore: stateData?.baseScore || candidate.baseScore,
                      nameRecognition: stateData?.nameRecognition || candidate.nameRecognition,
                      approvalRating: stateData?.approvalRating || candidate.approvalRating,
                      mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz,
                      ...(attributesData && { attributes: { ...candidate.attributes, ...attributesData } })
                    };
                  }
                  return candidate;
                });
              }
              
              // Re-normalize polling with updated candidate data
              const updatedCandidates = normalizePolling(
                updatedCandidatesArray,
                adultPop
              );
              return { ...election, candidates: updatedCandidates };
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
    applyDailyAICampaignResults: (allAIResults) => {
      if (!allAIResults || allAIResults.length === 0) return;

      const affectedElectionIds = new Set();

      set((state) => {
        if (!state.activeCampaign?.politicians) return state;

        const { politicians, startingCity } = state.activeCampaign;
        const adultPop =
          calculateAdultPopulation(
            startingCity.population,
            startingCity.demographics?.ageDistribution
          ) || 1;

        // Create mutable copies of the SoA maps to update
        const newCampaignMap = new Map(politicians.campaign);
        const newFinancesMap = new Map(politicians.finances);
        const newStateMap = new Map(politicians.state);

        for (const result of allAIResults) {
          const { politicianId, dailyResults, electionId } = result;

          // Get the current data for the AI from the new maps
          let campaignData = newCampaignMap.get(politicianId) || {};
          let financesData = newFinancesMap.get(politicianId) || {};
          let stateData = newStateMap.get(politicianId) || {};
          // We need attributes for calculations, but they don't change daily
          const attributesData = politicians.attributes.get(politicianId) || {};

          for (const actionResult of dailyResults) {
            // A flag to mark if an action affects polling
            let pollingAffected = false;

            switch (actionResult.actionName) {
              case "personalFundraisingActivity": {
                const fundraisingSkill = attributesData.fundraising || 5;
                const nameRec = stateData.nameRecognition || 0;
                const nameRecMultiplier = 0.5 + nameRec / 200000;
                const fundsGained = Math.round(
                  getRandomInt(500, 1500) *
                    actionResult.hoursSpent *
                    (fundraisingSkill / 4) *
                    nameRecMultiplier
                );
                financesData.campaignFunds =
                  (financesData.campaignFunds || 0) + fundsGained;
                break;
              }
              case "goDoorKnocking": {
                const reachPerHour =
                  10 + ((attributesData.charisma || 5) - 5) * 2;
                const volunteerReach =
                  (campaignData.volunteerCount || 0) *
                  3 *
                  actionResult.hoursSpent;
                const totalReached = Math.round(
                  reachPerHour * actionResult.hoursSpent + volunteerReach
                );
                const potentialNewReach = Math.max(
                  0,
                  adultPop - (stateData.nameRecognition || 0)
                );
                const newRecognition = Math.min(
                  potentialNewReach,
                  totalReached
                );
                stateData.nameRecognition =
                  (stateData.nameRecognition || 0) + newRecognition;
                break;
              }
              case "holdRallyActivity": {
                pollingAffected = true;
                const nameRecFraction =
                  (stateData.nameRecognition || 0) / adultPop;
                const scoreBoost = Math.round(
                  getRandomInt(
                    actionResult.hoursSpent,
                    actionResult.hoursSpent * 2
                  ) +
                    attributesData.oratory / 2 +
                    nameRecFraction * 3
                );
                const mediaBuzzGain = getRandomInt(
                  3 * actionResult.hoursSpent,
                  7 * actionResult.hoursSpent
                );
                const nameRecGain = Math.round(
                  getRandomInt(
                    50 * actionResult.hoursSpent,
                    200 * actionResult.hoursSpent
                  ) *
                    (1 + (stateData.mediaBuzz || 0) / 200)
                );

                stateData.mediaBuzz = Math.min(
                  100,
                  (stateData.mediaBuzz || 0) + mediaBuzzGain
                );
                stateData.nameRecognition = Math.min(
                  adultPop,
                  (stateData.nameRecognition || 0) + nameRecGain
                );
                stateData.baseScore = (stateData.baseScore || 10) + scoreBoost; // Assuming baseScore is part of stateData now
                break;
              }
              case "recruitVolunteers": {
                const charismaFactor =
                  1 + ((attributesData.charisma || 5) - 5) * 0.1;
                const newVolunteers = Math.round(
                  getRandomInt(3, 8) * actionResult.hoursSpent * charismaFactor
                );
                campaignData.volunteerCount =
                  (campaignData.volunteerCount || 0) + newVolunteers;
                break;
              }
              case "launchManualAdBlitz": {
                pollingAffected = true;
                // Simplified logic from your example; this would need to handle attack ads
                const { charisma = 5, intelligence = 5 } = attributesData;
                const { spendAmount } = actionResult.params;
                const effectivenessFactor =
                  (spendAmount / 1000) *
                  (actionResult.hoursSpent / 3) *
                  (1 + ((intelligence + charisma) / 2 - 5) * 0.1);
                stateData.baseScore =
                  (stateData.baseScore || 10) +
                  getRandomInt(1, 2) * effectivenessFactor;
                break;
              }
            }

            campaignData.campaignHoursRemainingToday =
              (campaignData.campaignHoursRemainingToday || 0) -
              actionResult.hoursSpent;

            if (pollingAffected) {
              affectedElectionIds.add(electionId);
            }
          }


          // Put the updated data back into the maps
          newCampaignMap.set(politicianId, campaignData);
          newFinancesMap.set(politicianId, financesData);
          newStateMap.set(politicianId, stateData);
        }

        // Create the new politician SoA object with the updated maps
        const newPoliticiansSoA = {
          ...politicians,
          campaign: newCampaignMap,
          finances: newFinancesMap,
          state: newStateMap,
        };

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        allAIResults.forEach((result) => newDirtyList.add(result.politicianId));

        return {
          activeCampaign: {
            ...state.activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            politicians: newPoliticiansSoA,
          },
        };
      });

      // After the main state update, trigger the polling update for affected elections
      if (affectedElectionIds.size > 0) {
        get().actions.updatePollingForAffectedElections(
          Array.from(affectedElectionIds)
        );
        
        // Generate new polls only periodically (every 3-7 days) for realism
        const currentDate = get().activeCampaign?.currentDate;
        if (currentDate && get().actions.shouldGenerateNewPolls?.(currentDate)) {
          affectedElectionIds.forEach(electionId => {
            get().actions.generateNewPollForElection?.(electionId);
          });
        }
      }
    },

    shouldGenerateNewPolls: (currentDate) => {
      const state = get();
      const lastPollDate = state.activeCampaign?.lastPollGenerationDate;
      
      if (!lastPollDate) {
        // First poll generation
        get().actions.updateActiveCampaign({ lastPollGenerationDate: currentDate });
        return true;
      }
      
      // Calculate days since last poll
      const dateToDays = (date) => {
        // A simplified conversion of a date object to a total number of days.
        // This is an approximation and doesn't account for leap years, but is more
        // accurate than the previous implementation for calculating intervals.
        const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let totalDays = date.year * 365;
        for (let m = 1; m < date.month; m++) {
          totalDays += daysInMonth[m];
        }
        totalDays += date.day;
        return totalDays;
      };

      const daysSinceLastPoll = dateToDays(currentDate) - dateToDays(lastPollDate);
      
      // Generate polls every 3-7 days (with some randomness)
      const minDaysBetweenPolls = 3;
      const maxDaysBetweenPolls = 7;
      const shouldGenerate = daysSinceLastPoll >= minDaysBetweenPolls && 
        (daysSinceLastPoll >= maxDaysBetweenPolls || Math.random() < 0.3);
      
      if (shouldGenerate) {
        get().actions.updateActiveCampaign({ lastPollGenerationDate: currentDate });
      }
      
      return shouldGenerate;
    },

    updateActiveCampaign: (updates) => {
      set((state) => {
        if (!state.activeCampaign) return {};
        return {
          activeCampaign: {
            ...state.activeCampaign,
            ...updates,
          },
        };
      });
    },

    updatePlayerPolitician: (politicianUpdates) => {
      set((state) => {
        if (!state.activeCampaign?.politician) return {};
        return {
          activeCampaign: {
            ...state.activeCampaign,
            politician: {
              ...state.activeCampaign.politician,
              ...politicianUpdates,
            },
          },
        };
      });
    },
  },
});
