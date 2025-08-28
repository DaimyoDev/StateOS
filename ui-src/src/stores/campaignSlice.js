// src/stores/campaignSlice.js
import { pollingOptimizer } from "../General Scripts/OptimizedPollingFunctions.js";
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

        let baseFundsRaised = Math.round(
          getRandomInt(500, 1500) *
            hoursToSpend *
            ((attributesData.fundraising || 5) / 4)
        );

        // Apply staff boosts
        const staffBoosts = get().actions.calculateStaffBoosts?.("personalFundraisingActivity", { fundsRaised: baseFundsRaised });
        const fundsRaised = staffBoosts?.boostedEffects?.fundsRaised || baseFundsRaised;
        
        // Show staff contributions if any
        if (staffBoosts?.contributions?.length > 0) {
          const boostMessage = staffBoosts.contributions.map(c => 
            `${c.staffName}: +${Math.round(c.boost * 100)}%`
          ).join(", ");
          get().actions.addNotification?.({
            message: `Staff Assistance: ${boostMessage}`,
            type: "info",
            category: "Campaign Staff"
          });
        }

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

        get().actions.addNotification?.({
          message: `Spent ${hoursToSpend}hr(s) fundraising. Raised $${fundsRaised.toLocaleString()}!`,
          type: "success",
          category: 'Campaign'
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
        const baseNameRecGain = Math.round(
          getRandomInt(100 * hoursToSpend, 250 * hoursToSpend) * oratoryFactor
        );
        const baseMediaBuzzGain = Math.round(
          getRandomInt(5 * hoursToSpend, 10 * hoursToSpend) * oratoryFactor
        );
        const basePollingBoost = Math.round(getRandomInt(0, 2) * oratoryFactor);
        
        // Apply staff boosts
        const staffBoosts = get().actions.calculateStaffBoosts?.("holdRallyActivity", {
          nameRecGain: baseNameRecGain,
          mediaBuzzGain: baseMediaBuzzGain,
          pollingBoost: basePollingBoost
        });
        
        const nameRecGain = staffBoosts?.boostedEffects?.nameRecGain || baseNameRecGain;
        const mediaBuzzGain = staffBoosts?.boostedEffects?.mediaBuzzGain || baseMediaBuzzGain;
        const pollingBoost = staffBoosts?.boostedEffects?.pollingBoost || basePollingBoost;
        
        // Show staff contributions if any
        if (staffBoosts?.contributions?.length > 0) {
          const boostMessage = staffBoosts.contributions.map(c => 
            `${c.staffName}: +${Math.round(c.boost * 100)}%`
          ).join(", ");
          get().actions.addNotification?.({
            message: `Rally Staff Assistance: ${boostMessage}`,
            type: "info",
            category: "Campaign Staff"
          });
        }

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

        get().actions.addNotification?.({
          message: `Rally successful! Name Rec +${nameRecGain.toLocaleString()}, Buzz +${mediaBuzzGain}.`,
          type: "success",
          category: 'Campaign'
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
        const baseTotalPeopleReached = Math.round(
          reachPerPlayerHour * hoursToSpend + peopleReachedByVolunteers
        );
        
        // Apply staff boosts
        const staffBoosts = get().actions.calculateStaffBoosts?.("goDoorKnocking", {
          totalPeopleReached: baseTotalPeopleReached
        });
        const totalPeopleReached = staffBoosts?.boostedEffects?.totalPeopleReached || baseTotalPeopleReached;
        
        const currentRecognition = stateData.nameRecognition || 0;
        const potentialNewReach = Math.max(0, adultPop - currentRecognition);
        const actualNewPeopleRecognized = Math.min(
          potentialNewReach,
          totalPeopleReached
        );
        
        // Show staff contributions if any
        if (staffBoosts?.contributions?.length > 0) {
          const boostMessage = staffBoosts.contributions.map(c => 
            `${c.staffName}: +${Math.round(c.boost * 100)}%`
          ).join(", ");
          get().actions.addNotification?.({
            message: `Door Knocking Staff Assistance: ${boostMessage}`,
            type: "info",
            category: "Campaign Staff"
          });
        }

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

        get().actions.addNotification?.({
          message: `Door knocking: Reached ~${totalPeopleReached} people. Name Rec +${actualNewPeopleRecognized.toLocaleString()}.`,
          type: "info",
          category: 'Campaign'
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

        get().actions.addNotification?.({
          message: `Public appearance: Approval +${approvalBoost}%. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
          type: "success",
          category: 'Campaign'
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
        const baseNewVolunteers = Math.round(
          getRandomInt(3, 8) * hoursToSpend * charismaFactor
        );
        
        // Apply staff boosts
        const staffBoosts = get().actions.calculateStaffBoosts?.("recruitVolunteers", {
          newVolunteers: baseNewVolunteers
        });
        const newVolunteers = staffBoosts?.boostedEffects?.newVolunteers || baseNewVolunteers;
        
        // Show staff contributions if any
        if (staffBoosts?.contributions?.length > 0) {
          const boostMessage = staffBoosts.contributions.map(c => 
            `${c.staffName}: +${Math.round(c.boost * 100)}%`
          ).join(", ");
          get().actions.addNotification?.({
            message: `Volunteer Recruitment Staff Assistance: ${boostMessage}`,
            type: "info",
            category: "Campaign Staff"
          });
        }

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

        get().actions.addNotification?.({
          message: `You spent ${hoursToSpend}hrs and recruited ${newVolunteers} new volunteers!`,
          type: "success",
          category: 'Campaign'
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

        get().actions.addNotification?.({
          message: `Monthly ad budget set to $${parsedAmount.toLocaleString()}`,
          type: "info",
          category: 'Campaign'
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

        get().actions.addNotification?.({
          message: `Ongoing advertising strategy has been updated.`,
          type: "info",
          category: 'Campaign'
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

        get().actions.addNotification?.({ message: toastMessage, type: "success", category: 'Campaign' });

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
        const totalElections = state.activeCampaign.elections.length;
        
        const city = state.activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;

        const { politicians } = state.activeCampaign;
        
        // Create election lookup index for O(1) access instead of O(n) find operations
        const electionLookup = new Map();
        const electionIndexLookup = new Map();
        for (let i = 0; i < state.activeCampaign.elections.length; i++) {
          const election = state.activeCampaign.elections[i];
          electionLookup.set(election.id, election);
          electionIndexLookup.set(election.id, i);
        }
        
        // Collect affected elections for batch processing
        const affectedElections = [];
        const electionUpdates = new Map();
        
        for (const electionId of affectedIdsSet) {
          const election = electionLookup.get(electionId);
          if (!election) continue;
          
          // Sync politician data to election candidates efficiently
          const updatedCandidates = new Map();
          
          for (const [candidateId, candidate] of election.candidates) {
            const stateData = politicians.state.get(candidateId);
            const attributesData = politicians.attributes.get(candidateId);
            
            if (stateData || attributesData) {
              updatedCandidates.set(candidateId, {
                ...candidate,
                baseScore: stateData?.baseScore || candidate.baseScore,
                nameRecognition: stateData?.nameRecognition || candidate.nameRecognition,
                approvalRating: stateData?.approvalRating || candidate.approvalRating,
                mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz,
                ...(attributesData && { attributes: { ...candidate.attributes, ...attributesData } })
              });
            } else {
              updatedCandidates.set(candidateId, candidate);
            }
          }
          
          affectedElections.push({ ...election, candidates: updatedCandidates });
        }
        
        // Batch process polling updates
        const pollingResults = pollingOptimizer.batchUpdateElectionPolling(affectedElections, adultPop);
        
        // Direct mutation approach - use O(1) lookup instead of O(n) findIndex
        for (const [electionId, updatedCandidates] of pollingResults) {
          const electionIndex = electionIndexLookup.get(electionId);
          if (electionIndex !== undefined) {
            // Update both polling and sync the underlying candidate data
            const election = state.activeCampaign.elections[electionIndex];
            const syncedCandidates = new Map();
            
            // Ensure candidate data is synchronized with SoA store
            for (const [candidateId, pollingCandidate] of updatedCandidates) {
              const stateData = politicians.state.get(candidateId);
              const attributesData = politicians.attributes.get(candidateId);
              
              syncedCandidates.set(candidateId, {
                ...pollingCandidate, // Keep the updated polling values
                // Sync with latest SoA data to prevent stale values
                baseScore: stateData?.baseScore || pollingCandidate.baseScore,
                nameRecognition: stateData?.nameRecognition || pollingCandidate.nameRecognition,
                approvalRating: stateData?.approvalRating || pollingCandidate.approvalRating,
                mediaBuzz: stateData?.mediaBuzz || pollingCandidate.mediaBuzz,
                ...(attributesData && { attributes: { ...pollingCandidate.attributes, ...attributesData } })
              });
            }
            
            state.activeCampaign.elections[electionIndex].candidates = syncedCandidates;
          }
        }

        return state;
      });
    },

    /**
     * Sync candidate data for a specific player election only
     */
    syncPlayerElectionCandidateData: () => {
      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign) return state;

        // Find the player's active election
        const playerElection = activeCampaign.elections.find(
          (election) => election.playerIsCandidate && election.outcome?.status === "upcoming"
        );
        
        if (!playerElection) return state;

        const { politicians } = activeCampaign;
        const syncedCandidates = new Map();
        
        // Update candidate data with fresh SoA values
        for (const [candidateId, candidate] of playerElection.candidates) {
          const stateData = politicians.state.get(candidateId);
          const attributesData = politicians.attributes.get(candidateId);
          
          syncedCandidates.set(candidateId, {
            ...candidate,
            // Sync with latest SoA data
            baseScore: stateData?.baseScore || candidate.baseScore,
            nameRecognition: stateData?.nameRecognition || candidate.nameRecognition,
            approvalRating: stateData?.approvalRating || candidate.approvalRating,
            mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz,
            ...(attributesData && { attributes: { ...candidate.attributes, ...attributesData } })
          });
        }

        // Find and update only this specific election
        const electionIndex = activeCampaign.elections.findIndex(e => e.id === playerElection.id);
        if (electionIndex !== -1) {
          state.activeCampaign.elections[electionIndex].candidates = syncedCandidates;
          
          // Trigger a new poll if there have been significant changes in candidate standings
          const hasSignificantChanges = Array.from(syncedCandidates.values()).some((candidate, index) => {
            const originalCandidate = Array.from(playerElection.candidates.values())[index];
            const pollingDiff = Math.abs((candidate.polling || 0) - (originalCandidate?.polling || 0));
            const nameRecDiff = Math.abs((candidate.nameRecognition || 0) - (originalCandidate?.nameRecognition || 0));
            return pollingDiff > 5 || nameRecDiff > 10000; // Threshold for significant change
          });
          
          if (hasSignificantChanges) {
            // Generate a fresh poll to reflect current campaign dynamics
            setTimeout(() => {
              const actions = get().actions;
              actions.generateNewPollForElection?.(playerElection.id);
            }, 0);
          }
        }

        return state;
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
                    actionResult.hoursSpent * 2,
                    actionResult.hoursSpent * 4
                  ) +
                    attributesData.oratory / 2 +
                    nameRecFraction * 5
                );
                const mediaBuzzGain = getRandomInt(
                  5 * actionResult.hoursSpent,
                  10 * actionResult.hoursSpent
                );
                const nameRecGain = Math.round(
                  getRandomInt(
                    100 * actionResult.hoursSpent,
                    300 * actionResult.hoursSpent
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
                stateData.baseScore = (stateData.baseScore || 10) + scoreBoost;
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
                const scoreBoost = Math.round(
                  getRandomInt(2, 4) * effectivenessFactor + 
                  (spendAmount / 5000) // Additional boost based on spending
                );
                stateData.baseScore =
                  (stateData.baseScore || 10) + scoreBoost;
                
                // Ad campaigns also boost name recognition
                const nameRecBoost = Math.round(
                  (spendAmount / 100) * actionResult.hoursSpent
                );
                stateData.nameRecognition = Math.min(
                  adultPop,
                  (stateData.nameRecognition || 0) + nameRecBoost
                );
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

      // After the main state update, trigger the polling update for affected elections (throttled to reduce overhead)
      if (affectedElectionIds.size > 0) {
        // Only update polling if significant changes occurred or enough time has passed
        const shouldUpdatePolling = get().actions.shouldUpdatePolling?.(affectedElectionIds.size);
        
        if (shouldUpdatePolling) {
          get().actions.updatePollingForAffectedElections(
            Array.from(affectedElectionIds)
          );
          
          // Generate new polls only periodically (every 3-7 days) for realism
          const currentDate = get().activeCampaign?.currentDate;
          if (currentDate && get().actions.shouldGenerateNewPolls?.(currentDate)) {
            // Batch poll generation to reduce overhead
            get().actions.batchGenerateNewPolls?.(Array.from(affectedElectionIds));
          }
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

    shouldUpdatePolling: (affectedElectionCount) => {
      const state = get();
      const lastPollingUpdate = state.activeCampaign?.lastPollingUpdateTime || 0;
      const currentTime = Date.now();
      
      // Throttle polling updates to at most once every 500ms for performance
      const timeSinceLastUpdate = currentTime - lastPollingUpdate;
      const shouldUpdate = timeSinceLastUpdate > 500 || affectedElectionCount > 3;
      
      if (shouldUpdate) {
        get().actions.updateActiveCampaign({ lastPollingUpdateTime: currentTime });
      }
      
      return shouldUpdate;
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

    applyForJob: (jobData) => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        // Update the player's current job in the SoA structure
        const financesData = politicians.finances.get(playerPoliticianId) || {};
        const campaignData = politicians.campaign.get(playerPoliticianId) || {};

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          currentJob: jobData,
          monthlyJobSalary: jobData.salary,
        });

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          // Reduce available working hours based on job time commitment
          maxWorkingHours: Math.max(1, 12 - jobData.timeCommitment),
          campaignHoursRemainingToday: Math.max(1, 12 - jobData.timeCommitment),
        });

        // Also update the legacy politician object for compatibility
        const updatedPolitician = {
          ...activeCampaign.politician,
          currentJob: jobData,
          treasury: (activeCampaign.politician.treasury || 0), // Keep current treasury
          workingHours: Math.max(1, 12 - jobData.timeCommitment),
        };

        get().actions.addNotification?.({
          message: `You are now employed as a ${jobData.title}! Monthly salary: $${jobData.salary.toLocaleString()}`,
          type: "success",
          category: "Career"
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            politicians: {
              ...politicians,
              finances: newFinancesMap,
              campaign: newCampaignMap,
            },
          },
        };
      });
    },

    quitJob: () => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        // Remove job from the SoA structure
        const financesData = politicians.finances.get(playerPoliticianId) || {};
        const campaignData = politicians.campaign.get(playerPoliticianId) || {};

        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          currentJob: null,
          monthlyJobSalary: 0,
        });

        const newCampaignMap = new Map(politicians.campaign);
        newCampaignMap.set(playerPoliticianId, {
          ...campaignData,
          // Restore full working hours
          maxWorkingHours: 12,
          campaignHoursRemainingToday: 12,
        });

        // Also update the legacy politician object for compatibility
        const updatedPolitician = {
          ...activeCampaign.politician,
          currentJob: null,
          workingHours: 12,
        };

        get().actions.addNotification?.({
          message: "You have quit your job and now have more time for political activities.",
          type: "info",
          category: "Career"
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            politicians: {
              ...politicians,
              finances: newFinancesMap,
              campaign: newCampaignMap,
            },
          },
        };
      });
    },

    processMonthlyJobIncome: () => {
      set((state) => {
        const { activeCampaign } = state;
        const { playerPoliticianId, politicians } = activeCampaign;
        if (!playerPoliticianId || !politicians) return state;

        const financesData = politicians.finances.get(playerPoliticianId) || {};
        const currentJob = financesData.currentJob;

        if (!currentJob || !currentJob.salary) return state;

        const salary = currentJob.salary;
        const newFinancesMap = new Map(politicians.finances);
        newFinancesMap.set(playerPoliticianId, {
          ...financesData,
          treasury: (financesData.treasury || 0) + salary,
        });

        // Also update the legacy politician object
        const updatedPolitician = {
          ...activeCampaign.politician,
          treasury: (activeCampaign.politician.treasury || 0) + salary,
        };

        get().actions.addNotification?.({
          message: `Monthly salary received: $${salary.toLocaleString()} from ${currentJob.title}`,
          type: "success",
          category: "Income"
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            politicians: {
              ...politicians,
              finances: newFinancesMap,
            },
          },
        };
      });
    },
  },
});
