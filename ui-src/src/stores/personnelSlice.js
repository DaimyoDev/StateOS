// src/stores/personnelSlice.js
import { generateId, getRandomElement, getRandomInt } from "../utils/core";
import { generateAICandidateNameForElection } from "../entities/personnel"; // For generating names

export const createStaffObject = (params = {}) => ({
  id: `staff_${generateId()}`,
  name: params.name || "Unnamed Staffer",
  role: params.role || "Campaign Aide",
  attributes: {
    strategy: params.strategy || getRandomInt(1, 10),
    communication: params.communication || getRandomInt(1, 10),
    fundraising: params.fundraising || getRandomInt(1, 10),
    loyalty: params.loyalty || getRandomInt(1, 10),
  },
  salary: params.salary || getRandomInt(2000, 8000), // Monthly salary
  isScouted: params.isScouted || false, // Determines if stats are visible to the player
});

// --- Initial State ---
const getInitialPersonnelState = () => ({
  politicianRelationships: {},
  // The pool of potential hires available in the game world
  talentPool: [],
  // The player's currently hired staff members
  hiredStaff: [],
});

export const createPersonnelSlice = (set, get) => ({
  ...getInitialPersonnelState(),

  actions: {
    /**
     * Initializes the relationship tracker for all AI politicians at the start of a campaign.
     * @param {Array<object>} politicians - A list of all politician objects in the game.
     */
    initializeRelationships: (politicians) => {
      const initialRelationships = {};
      if (Array.isArray(politicians)) {
        politicians.forEach((pol) => {
          if (pol && pol.id && !pol.isPlayer) {
            // All relationships start at a neutral 0
            initialRelationships[pol.id] = { relationship: 0 };
          }
        });
      }
      set({ politicianRelationships: initialRelationships });
    },

    /**
     * Adjusts the player's relationship score with a specific politician.
     * @param {string} politicianId - The ID of the politician to affect.
     * @param {number} amount - The amount to change the score by (can be positive or negative).
     */
    adjustRelationship: (politicianId, amount) => {
      set((state) => {
        const currentScore =
          state.politicianRelationships[politicianId]?.relationship || 0;
        // Clamp the score between -10 (Rival) and +10 (Ally)
        const newScore = Math.max(-10, Math.min(10, currentScore + amount));

        return {
          politicianRelationships: {
            ...state.politicianRelationships,
            [politicianId]: {
              ...state.politicianRelationships[politicianId],
              relationship: newScore,
            },
          },
        };
      });
    },

    /**
     * Action to spend resources to learn more about a politician.
     * Currently a placeholder that deducts cost and shows a notification.
     * @param {string} politicianId - The ID of the politician to investigate.
     */
    gatherIntelOnPolitician: () => {
      const cost = 500; // Cost in personal treasury
      const playerPolitician = get().activeCampaign.politician;
      const currentTreasury = playerPolitician.treasury;

      if (currentTreasury < cost) {
        get().actions.addToast({
          message:
            "Not enough money in your personal treasury to hire an investigator.",
          type: "error",
        });
        return;
      }

      // --- BUG FIX & REFACTOR ---
      // Deduct cost by calling the correct action from campaignSlice
      get().actions.updatePlayerPolitician({
        treasury: currentTreasury - cost,
      });

      get().actions.addToast({
        message: `Hired an investigator for $${cost}. An intelligence report will be ready in a few days.`,
        type: "info",
      });

      // FUTURE TODO: Add the politicianId to a "scouting_in_progress" list.
      // The daily tick would check this list, count down days, and then reveal the info.
    },
    generateTalentPool: (countryId) => {
      const roles = [
        "Campaign Manager",
        "Communications Director",
        "Fundraising Manager",
        "Policy Advisor",
      ];
      const newTalentPool = [];
      for (let i = 0; i < 15; i++) {
        // Generate 15 initial candidates
        newTalentPool.push(
          createStaffObject({
            name: generateAICandidateNameForElection(countryId),
            role: getRandomElement(roles),
          })
        );
      }
      set({ talentPool: newTalentPool, hiredStaff: [] });
    },

    /**
     * Scouts a staff candidate, revealing their stats at a cost.
     * @param {string} staffId - The ID of the staff member to scout.
     */
    scoutStaffCandidate: (staffId) => {
      const cost = 250; // Cost from personal treasury
      const playerPolitician = get().activeCampaign.politician;
      const currentTreasury = playerPolitician.treasury;

      if (currentTreasury < cost) {
        get().actions.addToast({
          message: `Not enough funds to scout. Need $${cost}.`,
          type: "error",
        });
        return;
      }

      // Deduct cost
      get().actions.updatePlayerPolitician({
        treasury: currentTreasury - cost,
      });

      // Reveal the candidate's stats
      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId ? { ...staff, isScouted: true } : staff
        ),
      }));

      get().actions.addToast({
        message: `Scouting report complete. You can now see the candidate's full details.`,
        type: "success",
      });
    },

    /**
     * Hires a scouted staff member.
     * @param {string} staffId - The ID of the staff member to hire.
     */
    hireStaff: (staffId) => {
      const staffToHire = get().talentPool.find((s) => s.id === staffId);
      if (!staffToHire) return;
      if (!staffToHire.isScouted) {
        get().actions.addToast({
          message: "You must scout a candidate before hiring them.",
          type: "info",
        });
        return;
      }

      // Add their salary to the monthly campaign expenses
      const currentExpenses =
        get().activeCampaign.startingCity.stats.budget.monthlyExpenses || 0;
      get().actions.updateActiveCampaign({
        startingCity: {
          ...get().activeCampaign.startingCity,
          stats: {
            ...get().activeCampaign.startingCity.stats,
            budget: {
              ...get().activeCampaign.startingCity.stats.budget,
              monthlyExpenses: currentExpenses + staffToHire.salary,
            },
          },
        },
      });

      // Move from talent pool to hired staff
      set((state) => ({
        talentPool: state.talentPool.filter((s) => s.id !== staffId),
        hiredStaff: [...state.hiredStaff, staffToHire],
      }));

      get().actions.addToast({
        message: `${staffToHire.name} has been hired!`,
        type: "success",
      });
    },

    /**
     * Fires a staff member.
     * @param {string} staffId - The ID of the staff member to fire.
     */
    fireStaff: (staffId) => {
      const staffToFire = get().hiredStaff.find((s) => s.id === staffId);
      if (!staffToFire) return;

      // Remove their salary from monthly expenses
      const currentExpenses =
        get().activeCampaign.startingCity.stats.budget.monthlyExpenses || 0;
      get().actions.updateActiveCampaign({
        startingCity: {
          ...get().activeCampaign.startingCity,
          stats: {
            ...get().activeCampaign.startingCity.stats,
            budget: {
              ...get().activeCampaign.startingCity.stats.budget,
              monthlyExpenses: Math.max(
                0,
                currentExpenses - staffToFire.salary
              ),
            },
          },
        },
      });

      // Move from hired staff back to the talent pool (as unscouted again)
      set((state) => ({
        hiredStaff: state.hiredStaff.filter((s) => s.id !== staffId),
        talentPool: [...state.talentPool, { ...staffToFire, isScouted: false }],
      }));

      get().actions.addToast({
        message: `${staffToFire.name} has been fired.`,
        type: "info",
      });
    },
  },
});
