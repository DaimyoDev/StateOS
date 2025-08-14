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

    holdRallyActivity: () => {
      // This is a complex action that updates multiple politician stats and election polling.
      // It will require a more detailed refactor once election data is also normalized.
      // For now, it is disabled to prevent data corruption.
      console.warn(
        "holdRallyActivity is temporarily disabled pending a full refactor."
      );
      get().actions.addToast?.({
        message: "Rally functionality is under rework.",
        type: "info",
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
            politicianIdsWithSpentHours: newDirtyList,
            ...activeCampaign,
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

        return {
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
      });
    },

    applyDailyAICampaignResults: (allAIResults) => {
      set((state) => {
        if (!state.activeCampaign?.elections) return state;

        const city = state.activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;

        const resultsMap = new Map(
          allAIResults.map((res) => [res.politicianId, res.dailyResults])
        );

        const newDirtyList = new Set(
          state.activeCampaign.politicianIdsWithSpentHours
        );
        allAIResults.forEach((result) => newDirtyList.add(result.politicianId));

        const updatedElections = state.activeCampaign.elections.map(
          (election) => {
            const newCandidates = new Map(election.candidates);
            let hasChanges = false;
            let needsPollingUpdate = false;

            for (const [candidateId, candidate] of newCandidates.entries()) {
              const resultsForThisCandidate = resultsMap.get(candidateId);
              if (!resultsForThisCandidate) continue;

              let updatedCandidate = { ...candidate };
              hasChanges = true;

              resultsForThisCandidate.forEach((actionResult) => {
                switch (actionResult.actionName) {
                  case "personalFundraisingActivity": {
                    const fundraisingSkill =
                      updatedCandidate.attributes?.fundraising || 5;
                    const nameRec = updatedCandidate.nameRecognition || 0;
                    const nameRecMultiplier = 0.5 + nameRec / 200000;
                    const fundsGained = Math.round(
                      getRandomInt(500, 1500) *
                        actionResult.hoursSpent *
                        (fundraisingSkill / 4) *
                        nameRecMultiplier
                    );
                    updatedCandidate.campaignFunds =
                      (updatedCandidate.campaignFunds || 0) + fundsGained;
                    break;
                  }
                  case "goDoorKnocking": {
                    const reachPerHour =
                      10 +
                      ((updatedCandidate.attributes?.charisma || 5) - 5) * 2;
                    const volunteerReach =
                      (updatedCandidate.volunteerCount || 0) *
                      3 *
                      actionResult.hoursSpent;
                    const totalReached = Math.round(
                      reachPerHour * actionResult.hoursSpent + volunteerReach
                    );
                    const potentialNewReach = Math.max(
                      0,
                      adultPop - (updatedCandidate.nameRecognition || 0)
                    );
                    const newRecognition = Math.min(
                      potentialNewReach,
                      totalReached
                    );
                    updatedCandidate.nameRecognition =
                      (updatedCandidate.nameRecognition || 0) + newRecognition;
                    break;
                  }
                  case "holdRallyActivity": {
                    needsPollingUpdate = true;
                    const nameRecFraction =
                      (updatedCandidate.nameRecognition || 0) / adultPop;
                    const scoreBoost = Math.round(
                      getRandomInt(
                        actionResult.hoursSpent,
                        actionResult.hoursSpent * 2
                      ) +
                        updatedCandidate.attributes.oratory / 2 +
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
                        (1 + (updatedCandidate.mediaBuzz || 0) / 200)
                    );
                    updatedCandidate.mediaBuzz = Math.min(
                      100,
                      (updatedCandidate.mediaBuzz || 0) + mediaBuzzGain
                    );
                    updatedCandidate.nameRecognition = Math.min(
                      adultPop,
                      (updatedCandidate.nameRecognition || 0) + nameRecGain
                    );
                    updatedCandidate.baseScore =
                      (updatedCandidate.baseScore || 10) + scoreBoost;
                    break;
                  }
                  case "recruitVolunteers": {
                    const charismaFactor =
                      1 +
                      ((updatedCandidate.attributes?.charisma || 5) - 5) * 0.1;
                    const newVolunteers = Math.round(
                      getRandomInt(3, 8) *
                        actionResult.hoursSpent *
                        charismaFactor
                    );
                    updatedCandidate.volunteerCount =
                      (updatedCandidate.volunteerCount || 0) + newVolunteers;
                    break;
                  }
                  case "launchManualAdBlitz": {
                    needsPollingUpdate = true;
                    const { adType, targetId, spendAmount } =
                      actionResult.params;
                    const {
                      charisma = 5,
                      integrity = 5,
                      intelligence = 5,
                    } = updatedCandidate.attributes;
                    const effectivenessFactor =
                      (spendAmount / 1000) *
                      (actionResult.hoursSpent / 3) *
                      (1 + ((intelligence + charisma) / 2 - 5) * 0.1);
                    let baseScoreChangePlayer = 0;

                    if (adType === "positive") {
                      baseScoreChangePlayer =
                        getRandomInt(1, 2) * effectivenessFactor;
                    } else if (adType === "attack" && targetId) {
                      const backlashChance =
                        0.15 + Math.max(0, (5 - integrity) * 0.05);
                      if (Math.random() < backlashChance) {
                        baseScoreChangePlayer =
                          getRandomInt(0, 1) * effectivenessFactor * -1;
                      }
                    }
                    updatedCandidate.baseScore =
                      (updatedCandidate.baseScore || 10) +
                      Math.round(baseScoreChangePlayer);
                    break;
                  }
                }
                updatedCandidate.campaignHoursRemainingToday -=
                  actionResult.hoursSpent;
              });

              newCandidates.set(candidateId, updatedCandidate);
            }

            if (hasChanges) {
              if (needsPollingUpdate) {
                return {
                  ...election,
                  candidates: normalizePolling(newCandidates, adultPop),
                };
              }
              return { ...election, candidates: newCandidates };
            }
            return election;
          }
        );

        return {
          activeCampaign: {
            ...state.activeCampaign,
            politicianIdsWithSpentHours: newDirtyList,
            elections: updatedElections,
          },
        };
      });
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
