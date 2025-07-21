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
const updateTargetPolitician = (state, politicianId, updateFn) => {
  if (!state.activeCampaign) return state.activeCampaign;

  const actualPoliticianId =
    politicianId || state.activeCampaign.politician?.id;
  let newActiveCampaign = { ...state.activeCampaign };
  let campaignWasModified = false;

  // Update player object if targeted
  if (
    !politicianId &&
    newActiveCampaign.politician?.id === actualPoliticianId
  ) {
    const updatedPlayer = updateFn(newActiveCampaign.politician);
    if (updatedPlayer !== newActiveCampaign.politician) {
      newActiveCampaign.politician = updatedPlayer;
      campaignWasModified = true;
    }
  }

  // Update politician's representation in any elections
  if (newActiveCampaign.elections) {
    newActiveCampaign.elections = newActiveCampaign.elections.map(
      (election) => {
        const candidateIndex = election.candidates?.findIndex(
          (c) => c.id === actualPoliticianId
        );
        if (candidateIndex > -1) {
          const updatedCandidates = [...election.candidates];
          const updatedCandidate = updateFn(updatedCandidates[candidateIndex]);
          if (updatedCandidate !== updatedCandidates[candidateIndex]) {
            updatedCandidates[candidateIndex] = updatedCandidate;
            campaignWasModified = true;
            return { ...election, candidates: updatedCandidates };
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
    personalFundraisingActivity: (hoursToSpend = 2, politicianId = null) => {
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) return;
      set((state) => {
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (politician) => {
            const fundraisingSkill = politician.attributes?.fundraising || 5;
            const nameRec = politician.nameRecognition || 0;
            const nameRecMultiplier = 0.5 + nameRec / 200000;
            const fundsRaised = Math.round(
              getRandomInt(500, 1500) *
                hoursToSpend *
                (fundraisingSkill / 4) *
                nameRecMultiplier
            );

            if (!politicianId) {
              get().actions.addToast?.({
                message: `Spent ${hoursToSpend}hr(s) fundraising. Raised $${fundsRaised.toLocaleString()}!`,
                type: "success",
              });
            }

            return {
              ...politician,
              campaignFunds: (politician.campaignFunds || 0) + fundsRaised,
            };
          }
        );
        return { activeCampaign: newActiveCampaign };
      });
    },

    holdRallyActivity: (hoursForRally = 4, politicianId = null) => {
      const preCheck = get().activeCampaign;
      const politician = politicianId
        ? preCheck.elections
            ?.flatMap((e) => e.candidates)
            .find((c) => c.id === politicianId)
        : preCheck.politician;
      if (!politician) return;

      const rallyCost = 500 + hoursForRally * 150;
      if ((politician.campaignFunds || 0) < rallyCost) {
        if (!politicianId)
          get().actions.addToast?.({
            message: `Not enough funds for Rally (Need $${rallyCost.toLocaleString()}).`,
            type: "error",
          });
        return;
      }
      if (!get().actions.spendCampaignHours(hoursForRally, politicianId))
        return;

      set((state) => {
        const campaign = state.activeCampaign;
        const city = campaign.startingCity;
        const election = campaign.elections.find((e) =>
          e.candidates.some((c) => c.id === politician.id)
        );
        if (!election) return state;

        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const nameRecFraction = (politician.nameRecognition || 0) / adultPop;
        const scoreBoost = Math.round(
          getRandomInt(hoursForRally, hoursForRally * 2) +
            politician.attributes.oratory / 2 +
            nameRecFraction * 3
        );
        const mediaBuzzGain = getRandomInt(
          3 * hoursForRally,
          7 * hoursForRally
        );
        const nameRecGain = Math.round(
          getRandomInt(50 * hoursForRally, 200 * hoursForRally) *
            (1 + (politician.mediaBuzz || 0) / 200)
        );

        const updatedElections = campaign.elections.map((e) => {
          if (e.id === election.id) {
            const updatedCandidates = e.candidates.map((c) =>
              c.id === politician.id
                ? { ...c, baseScore: (c.baseScore || 10) + scoreBoost }
                : c
            );
            return {
              ...e,
              candidates: normalizePolling(updatedCandidates, adultPop),
            };
          }
          return e;
        });

        if (!politicianId) {
          get().actions.addToast?.({
            message: `Rally! Polling Score +${scoreBoost}. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
            type: "success",
          });
        }

        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({
            ...p,
            campaignFunds: (p.campaignFunds || 0) - rallyCost,
            mediaBuzz: Math.min(100, (p.mediaBuzz || 0) + mediaBuzzGain),
            nameRecognition: Math.min(
              adultPop,
              (p.nameRecognition || 0) + nameRecGain
            ),
          })
        );

        return {
          activeCampaign: { ...newActiveCampaign, elections: updatedElections },
        };
      });
    },

    goDoorKnocking: (hoursToSpend = 2, politicianId = null) => {
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) return;
      set((state) => {
        const city = state.activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;

        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => {
            const reachPerPlayerHour =
              10 + ((p.attributes?.charisma || 5) - 5) * 2;
            const peopleReachedByVolunteers =
              (p.volunteerCount || 0) * 3 * hoursToSpend;
            const totalPeopleReached = Math.round(
              reachPerPlayerHour * hoursToSpend + peopleReachedByVolunteers
            );
            const potentialNewReach = Math.max(
              0,
              adultPop - (p.nameRecognition || 0)
            );
            const actualNewPeopleRecognized = Math.min(
              potentialNewReach,
              totalPeopleReached
            );

            if (!politicianId) {
              get().actions.addToast?.({
                message: `Door knocking: Reached ~${totalPeopleReached} people. Name Rec +${actualNewPeopleRecognized.toLocaleString()}.`,
                type: "info",
              });
            }

            return {
              ...p,
              nameRecognition:
                (p.nameRecognition || 0) + actualNewPeopleRecognized,
            };
          }
        );
        return { activeCampaign: newActiveCampaign };
      });
    },

    makePublicAppearanceActivity: (hoursToSpend = 2, politicianId = null) => {
      const cost = 100;
      const politician = politicianId
        ? get()
            .activeCampaign.elections?.flatMap((e) => e.candidates)
            .find((c) => c.id === politicianId)
        : get().activeCampaign.politician;
      if (!politician || (politician.campaignFunds || 0) < cost) {
        if (!politicianId)
          get().actions.addToast?.({
            message: `Not enough funds (Need $${cost}).`,
            type: "error",
          });
        return;
      }
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) return;

      set((state) => {
        const city = state.activeCampaign.startingCity;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => {
            const charismaFactor = Math.max(
              0.5,
              (p.attributes?.charisma || 3) / 5
            );
            const approvalBoost = Math.round(
              getRandomInt(0, hoursToSpend) * charismaFactor
            );
            const nameRecGain = Math.round(
              getRandomInt(10 * hoursToSpend, 30 * hoursToSpend) *
                charismaFactor
            );
            const mediaBuzzGain =
              getRandomInt(1 * hoursToSpend, 3 * hoursToSpend) +
              Math.floor((p.attributes?.charisma || 5) / 2);

            if (!politicianId) {
              get().actions.addToast?.({
                message: `Public appearance: Approval +${approvalBoost}%. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
                type: "success",
              });
            }

            return {
              ...p,
              campaignFunds: (p.campaignFunds || 0) - cost,
              approvalRating: Math.min(
                100,
                (p.approvalRating || 0) + approvalBoost
              ),
              nameRecognition: Math.min(
                adultPop,
                (p.nameRecognition || 0) + nameRecGain
              ),
              mediaBuzz: Math.min(100, (p.mediaBuzz || 0) + mediaBuzzGain),
            };
          }
        );
        return { activeCampaign: newActiveCampaign };
      });
    },

    recruitVolunteers: (hoursToSpend = 2, politicianId = null) => {
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) return;
      set((state) => {
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => {
            const charismaFactor =
              1 + ((p.attributes?.charisma || 5) - 5) * 0.1;
            const newVolunteers = Math.round(
              getRandomInt(3, 8) * hoursToSpend * charismaFactor
            );

            if (!politicianId) {
              get().actions.addToast?.({
                message: `Recruiting: Gained ${newVolunteers} new volunteers!`,
                type: "success",
              });
            }

            return {
              ...p,
              volunteerCount: (p.volunteerCount || 0) + newVolunteers,
            };
          }
        );
        return { activeCampaign: newActiveCampaign };
      });
    },
  },
});
