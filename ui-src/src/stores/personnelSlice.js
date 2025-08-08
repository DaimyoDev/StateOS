// src/stores/personnelSlice.js
import { generateId, getRandomInt } from "../utils/core";

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
  salary: params.salary || getRandomInt(2000, 8000), // Base expected salary, can be negotiated
  isCurrentlyEmployed: params.isCurrentlyEmployed || Math.random() > 0.5,
  interestInJoining: params.interestInJoining || getRandomInt(3, 10), // Player's initial interest is hidden

  // New Scouting-related fields
  scoutingLevel: "unscouted", // Possible values: 'unscouted', 'scouted', 'resume_reviewed', 'interviewed'
  revealedAttributes: {}, // Attributes revealed to the player
  resume:
    params.resume ||
    "A detailed professional history will be available upon initial scouting.",
  delegatedTask: "idle",

  // To be implemented later
  quizScore: null,
});

// --- Initial State ---
const getInitialPersonnelState = () => ({
  politicianRelationships: {},
  talentPool: [],
  hiredStaff: [],
  politicianIntel: {},
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

    gatherIntelOnPolitician: (politicianId) => {
      set((state) => {
        const cost = 500;
        const playerPolitician = state.activeCampaign.politician;

        // Find the target politician from the comprehensive governmentOffices list
        const targetPolitician = state.activeCampaign.governmentOffices
          .flatMap((o) => o.members || (o.holder ? [o.holder] : []))
          .find((p) => p && p.id === politicianId);

        if (!targetPolitician) {
          console.error("Target politician for intel gathering not found.");
          return state;
        }

        if (playerPolitician.treasury < cost) {
          get().actions.addToast({
            message: `Not enough money in your personal treasury. Need $${cost}.`,
            type: "error",
          });
          return state; // Exit early
        }

        // 1. Prepare the intel update
        const newIntelState = {
          ...state.politicianIntel,
          [politicianId]: {
            ...state.politicianIntel[politicianId],
            attributes: targetPolitician.attributes,
          },
        };

        // 2. Prepare the player treasury update
        const newPlayerState = {
          ...playerPolitician,
          treasury: playerPolitician.treasury - cost,
        };

        get().actions.addToast({
          message: `Your investigator's report on ${targetPolitician.name} is in. Their core attributes are now known.`,
          type: "success",
        });

        // 3. Return both state changes at once
        return {
          politicianIntel: newIntelState,
          activeCampaign: {
            ...state.activeCampaign,
            politician: newPlayerState,
          },
        };
      });
    },

    scoutStaffCandidate: (staffId) => {
      const cost = 250;
      const playerPolitician = get().activeCampaign.politician;
      const currentTreasury = playerPolitician.treasury;

      if (currentTreasury < cost) {
        get().actions.addToast({
          message: `Not enough funds to scout. Need $${cost}.`,
          type: "error",
        });
        return;
      }

      get().actions.updatePlayerPolitician({
        treasury: currentTreasury - cost,
      });

      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                scoutingLevel: "scouted", // Update scouting level
                revealedAttributes: {}, // Ensure revealed attributes is initialized and empty
              }
            : staff
        ),
      }));

      get().actions.addToast({
        message: `Scouting report purchased for $${cost}. You can now review the candidate's resume.`,
        type: "success",
      });
    },

    /**
     * NEW: Reviews a resume to uncover some key skills.
     */
    reviewResume: (staffId) => {
      const staffMember = get().talentPool.find((s) => s.id === staffId);
      if (!staffMember || staffMember.scoutingLevel !== "scouted") return;

      const attributesToReveal = {};
      // Reveal different key skills based on the role
      switch (staffMember.role) {
        case "Campaign Manager":
          attributesToReveal.strategy = staffMember.attributes.strategy;
          attributesToReveal.loyalty = staffMember.attributes.loyalty;
          break;
        case "Communications Director":
          attributesToReveal.communication =
            staffMember.attributes.communication;
          break;
        case "Fundraising Manager":
          attributesToReveal.fundraising = staffMember.attributes.fundraising;
          break;
        case "Policy Advisor":
          attributesToReveal.strategy = staffMember.attributes.strategy;
          break;
        default:
          attributesToReveal.communication =
            staffMember.attributes.communication;
      }

      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                scoutingLevel: "resume_reviewed",
                revealedAttributes: {
                  ...staff.revealedAttributes,
                  ...attributesToReveal,
                },
              }
            : staff
        ),
      }));

      get().actions.addToast({
        message: `After reviewing ${staffMember.name}'s resume, you've learned more about their key skills.`,
        type: "info",
      });
    },

    /**
     * NEW: Conducts an interview to reveal all remaining attributes.
     */
    conductInterview: (staffId) => {
      const cost = 150; // Cost for time and resources for the interview
      const playerPolitician = get().activeCampaign.politician;
      const currentTreasury = playerPolitician.treasury;
      const staffMember = get().talentPool.find((s) => s.id === staffId);

      if (
        !staffMember ||
        !["scouted", "resume_reviewed"].includes(staffMember.scoutingLevel)
      )
        return;

      if (currentTreasury < cost) {
        get().actions.addToast({
          message: `Not enough funds for the interview. Need $${cost}.`,
          type: "error",
        });
        return;
      }

      get().actions.updatePlayerPolitician({
        treasury: currentTreasury - cost,
      });

      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                scoutingLevel: "interviewed",
                revealedAttributes: staff.attributes, // Reveal ALL attributes
              }
            : staff
        ),
      }));

      get().actions.addToast({
        message: `The interview with ${staffMember.name} was insightful. You now have a complete picture of their abilities.`,
        type: "success",
      });
    },

    /**
     * MODIFIED: Hires a staff member after they have been fully vetted.
     */
    hireStaff: (staffId) => {
      const staffToHire = get().talentPool.find((s) => s.id === staffId);
      if (!staffToHire) return;

      // Gate the hiring action based on the final interview stage
      if (staffToHire.scoutingLevel !== "interviewed") {
        get().actions.addToast({
          message:
            "You must fully interview a candidate before offering them a job.",
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
        message: `${staffToHire.name} has accepted your offer and has been hired!`,
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

    getCityCouncilMembers: () => {
      const { activeCampaign } = get();
      if (
        !activeCampaign?.governmentOffices ||
        !activeCampaign?.startingCity?.name
      ) {
        return [];
      }

      const councilOffice = activeCampaign.governmentOffices.find(
        (office) =>
          office.level === "local_city" &&
          office.officeNameTemplateId.includes("council") &&
          office.officeName.includes(activeCampaign.startingCity.name)
      );

      return councilOffice?.members || [];
    },
    setStaffDelegatedTask: (staffId, task) => {
      set((state) => ({
        hiredStaff: state.hiredStaff.map((staff) =>
          staff.id === staffId ? { ...staff, delegatedTask: task } : staff
        ),
      }));
      const staffer = get().hiredStaff.find((s) => s.id === staffId);
      if (staffer) {
        get().actions.addToast({
          message: `${staffer.name}'s focus is now set to: ${task.replace(
            /_/g,
            " "
          )}.`,
          type: "info",
        });
      }
    },
    praisePolitician: (politicianId) => {
      set((state) => {
        const cost = 100;
        const playerPolitician = state.activeCampaign.politician;

        const targetPolitician = state.activeCampaign.governmentOffices
          .flatMap((o) => o.members || (o.holder ? [o.holder] : []))
          .find((p) => p && p.id === politicianId);

        if (!targetPolitician) return state;

        if (playerPolitician.treasury < cost) {
          get().actions.addToast({
            message: `Not enough funds for a press release. Need $${cost}.`,
            type: "error",
          });
          return state;
        }

        // 1. Prepare the relationship update
        const currentScore =
          state.politicianRelationships[politicianId]?.relationship || 0;
        const newScore = Math.max(-10, Math.min(10, currentScore + 1));
        const newRelationshipsState = {
          ...state.politicianRelationships,
          [politicianId]: {
            ...state.politicianRelationships[politicianId],
            relationship: newScore,
          },
        };

        // 2. Prepare the player treasury update
        const newPlayerState = {
          ...playerPolitician,
          treasury: playerPolitician.treasury - cost,
        };

        // 3. IMPROVED FEEDBACK in the toast message
        get().actions.addToast({
          message: `Your relationship with ${targetPolitician.name} has improved to ${newScore}.`,
          type: "info",
        });

        // 4. Return both state changes at once
        return {
          politicianRelationships: newRelationshipsState,
          activeCampaign: {
            ...state.activeCampaign,
            politician: newPlayerState,
          },
        };
      });
    },
  },
});
