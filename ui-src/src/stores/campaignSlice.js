// src/stores/campaignSlice.js
import { normalizePolling } from "../General Scripts/PollingFunctions.js";
import { getRandomInt, calculateAdultPopulation } from "../utils/core.js";
import { getPlayerActiveElectionDetailsForCampaignActions } from "../utils/electionUtils.js";

/**
 * Helper function to find and update a specific politician (player or AI) within the activeCampaign state.
 * This is crucial for generalizing actions that can be performed by either the player or an AI.
 * @param {object} state - The current Zustand state.
 * @param {string | null} politicianId - The ID of the politician to update. If null, it targets the player.
 * @param {function} updateFn - A function that takes the politician object and returns the updated version.
 * @returns {object} The new activeCampaign state.
 */
const updateTargetPolitician = (state, politicianId, updateFn) => {
  if (!state.activeCampaign) return state;

  let campaignWasModified = false;
  let newActiveCampaign = { ...state.activeCampaign };
  const actualPoliticianId =
    politicianId || state.activeCampaign.politician?.id;

  // 1. Update main player object
  if (!politicianId && newActiveCampaign.politician) {
    const updatedPlayer = updateFn(newActiveCampaign.politician);
    if (updatedPlayer !== newActiveCampaign.politician) {
      newActiveCampaign.politician = updatedPlayer;
      campaignWasModified = true;
    }
  }

  // 2. Update politician in any election they are a candidate in (using the Map)
  if (newActiveCampaign.elections) {
    newActiveCampaign.elections = newActiveCampaign.elections.map(
      (election) => {
        // Use Map.has() for a fast check
        if (election.candidates?.has(actualPoliticianId)) {
          // Use Map.get() for a fast lookup
          const oldCandidate = election.candidates.get(actualPoliticianId);
          const updatedCandidate = updateFn(oldCandidate);

          if (updatedCandidate !== oldCandidate) {
            campaignWasModified = true;
            // Create a new Map and set the updated candidate
            const newCandidatesMap = new Map(election.candidates);
            newCandidatesMap.set(actualPoliticianId, updatedCandidate);
            return { ...election, candidates: newCandidatesMap };
          }
        }
        return election;
      }
    );
  }

  // Update politician's representation in government offices
  if (newActiveCampaign.governmentOffices) {
    newActiveCampaign.governmentOffices =
      newActiveCampaign.governmentOffices.map((office) => {
        if (office.holder?.id === actualPoliticianId) {
          const updatedHolder = updateFn(office.holder);
          if (updatedHolder !== office.holder) {
            campaignWasModified = true;
            return { ...office, holder: updatedHolder };
          }
        }
        if (office.members) {
          const memberIndex = office.members.findIndex(
            (m) => m.holder?.id === actualPoliticianId
          );
          if (memberIndex > -1) {
            const updatedMembers = [...office.members];
            const updatedMemberHolder = updateFn(
              updatedMembers[memberIndex].holder
            );
            if (updatedMemberHolder !== updatedMembers[memberIndex].holder) {
              updatedMembers[memberIndex].holder = updatedMemberHolder;
              campaignWasModified = true;
              return { ...office, members: updatedMembers };
            }
          }
        }
        return office;
      });
  }

  return campaignWasModified ? newActiveCampaign : state.activeCampaign;
};

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

    processDailyCampaignEffects: () => {
      set((state) => {
        if (!state.activeCampaign) return {};
        return {
          activeCampaign: {
            ...state.activeCampaign,
            politician: {
              ...state.activeCampaign.politician,
              playerCampaignActionToday: false,
            },
          },
        };
      });
    },

    // --- CORE HOUR MANAGEMENT ---
    spendCampaignHours: (hoursToSpend, politicianId = null) => {
      let success = false;
      set((state) => {
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (politician) => {
            const hoursAvailable = politician.campaignHoursRemainingToday || 0;
            if (hoursAvailable >= hoursToSpend) {
              success = true;
              return {
                ...politician,
                campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
              };
            }
            if (!politicianId) {
              get().actions.addToast?.({
                message: `Not enough campaign hours (need ${hoursToSpend}, have ${hoursAvailable}).`,
                type: "warning",
              });
            }
            return politician;
          }
        );
        return { activeCampaign: newActiveCampaign };
      });
      return success;
    },

    resetDailyCampaignHours: (politicianId = null) => {
      set((state) => ({
        activeCampaign: updateTargetPolitician(
          state,
          politicianId,
          (politician) => ({
            ...politician,
            campaignHoursRemainingToday: politician.campaignHoursPerDay || 10,
          })
        ),
      }));
    },

    // --- CAMPAIGN ACTIONS ---
    personalFundraisingActivity: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;

        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough campaign hours (need ${hoursToSpend}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }

        const fundraisingSkill = player.attributes?.fundraising || 5;
        const nameRec = player.nameRecognition || 0;
        const nameRecMultiplier = 0.5 + nameRec / 200000;
        const fundsRaised = Math.round(
          getRandomInt(500, 1500) *
            hoursToSpend *
            (fundraisingSkill / 4) *
            nameRecMultiplier
        );

        const updates = {
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
          campaignFunds: (player.campaignFunds || 0) + fundsRaised,
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((election) => {
          if (election.candidates.has(player.id)) {
            const newCandidatesMap = new Map(election.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return { ...election, candidates: newCandidatesMap };
          }
          return election;
        });

        get().actions.addToast?.({
          message: `Spent ${hoursToSpend}hr(s) fundraising. Raised $${fundsRaised.toLocaleString()}!`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    holdRallyActivity: (hoursForRally = 4) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;
        const city = activeCampaign.startingCity;

        const electionDetails =
          getPlayerActiveElectionDetailsForCampaignActions(
            activeCampaign,
            player.id
          );
        if (!electionDetails) {
          get().actions.addToast?.({
            message: "Cannot hold rally: You are not in an active election.",
            type: "error",
          });
          return state;
        }

        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        const fundsAvailable = player.campaignFunds || 0;
        const rallyCost = 500 + hoursForRally * 150;

        if (hoursAvailable < hoursForRally) {
          get().actions.addToast?.({
            message: `Not enough hours (Need ${hoursForRally}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }
        if (fundsAvailable < rallyCost) {
          get().actions.addToast?.({
            message: `Not enough funds for Rally (Need $${rallyCost.toLocaleString()}).`,
            type: "error",
          });
          return state;
        }

        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const nameRecFraction = (player.nameRecognition || 0) / adultPop;
        const scoreBoost = Math.round(
          getRandomInt(hoursForRally, hoursForRally * 2) +
            player.attributes.oratory / 2 +
            nameRecFraction * 3
        );
        const mediaBuzzGain = getRandomInt(
          3 * hoursForRally,
          7 * hoursForRally
        );
        const nameRecGain = Math.round(
          getRandomInt(50 * hoursForRally, 200 * hoursForRally) *
            (1 + (player.mediaBuzz || 0) / 200)
        );

        const updates = {
          campaignHoursRemainingToday: hoursAvailable - hoursForRally,
          campaignFunds: fundsAvailable - rallyCost,
          mediaBuzz: Math.min(100, (player.mediaBuzz || 0) + mediaBuzzGain),
          nameRecognition: Math.min(
            adultPop,
            (player.nameRecognition || 0) + nameRecGain
          ),
          baseScore: (player.baseScore || 10) + scoreBoost,
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((e) => {
          if (e.id === electionDetails.playerElection.id) {
            const newCandidatesMap = new Map(e.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return {
              ...e,
              candidates: normalizePolling(newCandidatesMap, adultPop),
            };
          }
          return e;
        });

        get().actions.addToast?.({
          message: `Rally! Polling Score +${scoreBoost}. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    goDoorKnocking: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;

        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough campaign hours (need ${hoursToSpend}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }

        const city = activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const reachPerPlayerHour =
          10 + ((player.attributes?.charisma || 5) - 5) * 2;
        const peopleReachedByVolunteers =
          (player.volunteerCount || 0) * 3 * hoursToSpend;
        const totalPeopleReached = Math.round(
          reachPerPlayerHour * hoursToSpend + peopleReachedByVolunteers
        );
        const potentialNewReach = Math.max(
          0,
          adultPop - (player.nameRecognition || 0)
        );
        const actualNewPeopleRecognized = Math.min(
          potentialNewReach,
          totalPeopleReached
        );

        const updates = {
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
          nameRecognition:
            (player.nameRecognition || 0) + actualNewPeopleRecognized,
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((election) => {
          if (election.candidates.has(player.id)) {
            const newCandidatesMap = new Map(election.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return { ...election, candidates: newCandidatesMap };
          }
          return election;
        });

        get().actions.addToast?.({
          message: `Door knocking: Reached ~${totalPeopleReached} people. Name Rec +${actualNewPeopleRecognized.toLocaleString()}.`,
          type: "info",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    makePublicAppearanceActivity: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;

        const cost = 200;
        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        const fundsAvailable = player.campaignFunds || 0;

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

        const city = activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const charismaFactor = Math.max(
          0.5,
          (player.attributes?.charisma || 3) / 5
        );
        const approvalBoost = Math.round(
          getRandomInt(0, hoursToSpend) * charismaFactor
        );
        const nameRecGain = Math.round(
          getRandomInt(10 * hoursToSpend, 30 * hoursToSpend) * charismaFactor
        );
        const mediaBuzzGain =
          getRandomInt(1 * hoursToSpend, 3 * hoursToSpend) +
          Math.floor((player.attributes?.charisma || 5) / 2);

        const updates = {
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
          campaignFunds: fundsAvailable - cost,
          approvalRating: Math.min(
            100,
            (player.approvalRating || 0) + approvalBoost
          ),
          nameRecognition: Math.min(
            adultPop,
            (player.nameRecognition || 0) + nameRecGain
          ),
          mediaBuzz: Math.min(100, (player.mediaBuzz || 0) + mediaBuzzGain),
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((election) => {
          if (election.candidates.has(player.id)) {
            const newCandidatesMap = new Map(election.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return { ...election, candidates: newCandidatesMap };
          }
          return election;
        });

        get().actions.addToast?.({
          message: `Public appearance: Approval +${approvalBoost}%. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    recruitVolunteers: (hoursToSpend = 2) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;

        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        if (hoursAvailable < hoursToSpend) {
          get().actions.addToast?.({
            message: `Not enough campaign hours (need ${hoursToSpend}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }

        const charismaFactor =
          1 + ((player.attributes?.charisma || 5) - 5) * 0.1;
        const newVolunteers = Math.round(
          getRandomInt(3, 8) * hoursToSpend * charismaFactor
        );

        const updates = {
          campaignHoursRemainingToday: hoursAvailable - hoursToSpend,
          volunteerCount: (player.volunteerCount || 0) + newVolunteers,
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((election) => {
          if (election.candidates.has(player.id)) {
            const newCandidatesMap = new Map(election.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return { ...election, candidates: newCandidatesMap };
          }
          return election;
        });

        get().actions.addToast?.({
          message: `Recruiting: Gained ${newVolunteers} new volunteers!`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    setMonthlyAdvertisingBudget: (amount) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          get().actions.addToast?.({
            message: "Invalid budget amount. Please enter a positive number.",
            type: "error",
          });
          return state;
        }

        const updates = { advertisingBudgetMonthly: parsedAmount };
        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((election) => {
          if (election.candidates.has(player.id)) {
            const newCandidatesMap = new Map(election.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return { ...election, candidates: newCandidatesMap };
          }
          return election;
        });

        get().actions.addToast?.({
          message: `Monthly ad budget set to $${parsedAmount.toLocaleString()}`,
          type: "info",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    setAdvertisingStrategy: (strategyData) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;
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

        const updates = {
          currentAdStrategy: {
            focus,
            targetId: targetId || null,
            intensity: intensity || 0,
          },
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((election) => {
          if (election.candidates.has(player.id)) {
            const newCandidatesMap = new Map(election.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return { ...election, candidates: newCandidatesMap };
          }
          return election;
        });

        get().actions.addToast?.({
          message: `Ongoing advertising strategy has been updated.`,
          type: "info",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    launchManualAdBlitz: (params) => {
      const { adType, targetId, spendAmount, hoursSpent } = params;

      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;
        const city = activeCampaign.startingCity;

        const electionDetails =
          getPlayerActiveElectionDetailsForCampaignActions(
            activeCampaign,
            player.id
          );
        if (!electionDetails) {
          get().actions.addToast?.({
            message:
              "Could not launch blitz: You are not in an active election.",
            type: "error",
          });
          return state;
        }

        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        const fundsAvailable = player.campaignFunds || 0;

        if (hoursAvailable < hoursSpent) {
          get().actions.addToast?.({
            message: `Not enough campaign hours (need ${hoursSpent}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }
        if (fundsAvailable < spendAmount) {
          get().actions.addToast?.({
            message: `Not enough funds (Need $${spendAmount.toLocaleString()}).`,
            type: "error",
          });
          return state;
        }

        let baseScoreChangePlayer = 0;
        let baseScoreChangeOpponent = 0;
        let opponentToTargetObj = null;
        let mediaBuzzEffect = 0;
        let nameRecEffect = 0;

        const {
          charisma = 5,
          integrity = 5,
          intelligence = 5,
        } = player.attributes;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const effectivenessFactor =
          (spendAmount / 1000) *
          (hoursSpent / 3) *
          (1 + ((intelligence + charisma) / 2 - 5) * 0.1);

        if (adType === "positive") {
          baseScoreChangePlayer = getRandomInt(1, 2) * effectivenessFactor;
          mediaBuzzEffect = getRandomInt(3, 6) * effectivenessFactor;
          nameRecEffect = getRandomInt(50, 200) * effectivenessFactor;
        } else if (adType === "attack" && targetId) {
          opponentToTargetObj =
            electionDetails.playerElection.candidates.get(targetId);
          if (opponentToTargetObj) {
            const backlashChance = 0.15 + Math.max(0, (5 - integrity) * 0.05);
            if (Math.random() < backlashChance) {
              baseScoreChangePlayer =
                getRandomInt(0, 1) * effectivenessFactor * -1;
              mediaBuzzEffect = getRandomInt(2, 4) * effectivenessFactor;
              get().actions.addToast?.({
                message: "Your attack ad backfired slightly!",
                type: "warning",
              });
            } else {
              baseScoreChangeOpponent =
                getRandomInt(1, 3) * effectivenessFactor * -1;
              mediaBuzzEffect = getRandomInt(4, 8) * effectivenessFactor;
            }
          }
        } else if (adType === "issue") {
          baseScoreChangePlayer = getRandomInt(0, 2) * effectivenessFactor;
          mediaBuzzEffect = getRandomInt(2, 5) * effectivenessFactor;
          nameRecEffect = getRandomInt(30, 150) * effectivenessFactor;
        }

        const playerUpdates = {
          campaignHoursRemainingToday: hoursAvailable - hoursSpent,
          campaignFunds: fundsAvailable - spendAmount,
          nameRecognition: Math.min(
            adultPop,
            (player.nameRecognition || 0) + Math.round(nameRecEffect)
          ),
          mediaBuzz: Math.min(
            100,
            (player.mediaBuzz || 0) + Math.round(mediaBuzzEffect)
          ),
          baseScore:
            (player.baseScore || 10) + Math.round(baseScoreChangePlayer),
        };

        const updatedPolitician = { ...player, ...playerUpdates };

        const updatedElections = activeCampaign.elections.map((e) => {
          if (e.id === electionDetails.playerElection.id) {
            const newCandidatesMap = new Map(e.candidates);

            // Update player in the map
            const oldPlayerData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldPlayerData,
              ...playerUpdates,
            });

            // Update opponent in the map if necessary
            if (opponentToTargetObj && baseScoreChangeOpponent !== 0) {
              const opponent = newCandidatesMap.get(opponentToTargetObj.id);
              if (opponent) {
                newCandidatesMap.set(opponentToTargetObj.id, {
                  ...opponent,
                  baseScore: Math.max(
                    1,
                    (opponent.baseScore || 10) +
                      Math.round(baseScoreChangeOpponent)
                  ),
                });
              }
            }
            return {
              ...e,
              candidates: normalizePolling(newCandidatesMap, adultPop),
            };
          }
          return e;
        });

        get().actions.addToast?.({
          message: `Launched ${hoursSpent}hr Ad Blitz for $${spendAmount.toLocaleString()}! Effects applied.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
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

    // This is a more specific helper for updating nested fields on the player politician
    // to avoid spreading the entire politician object every time.
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
