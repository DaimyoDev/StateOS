// src/stores/personnelSlice.js
import { generateAICandidateNameForElection } from "../entities/personnel";
import { generateResume } from "../simulation/resumeGenerator";
import { generateId, getRandomInt, getRandomElement } from "../utils/core";

export const createStaffObject = (params = {}) => {
  const baseAttributes = {
    strategy: params.strategy || getRandomInt(1, 10),
    communication: params.communication || getRandomInt(1, 10),
    fundraising: params.fundraising || getRandomInt(1, 10),
    loyalty: params.loyalty || getRandomInt(1, 10),
    judgement: params.judgement || getRandomInt(1, 10), // For HR Directors
  };

  // --- NEW: Gem & Bust Potential System ---
  let potential = "normal";
  let displayedAttributes = { ...baseAttributes };
  const potentialRoll = Math.random();
  if (potentialRoll < 0.1) {
    // 10% chance of being a Gem
    potential = "gem";
    // Displayed attributes are slightly lower than their true potential
    Object.keys(displayedAttributes).forEach((key) => {
      displayedAttributes[key] = Math.max(
        1,
        baseAttributes[key] - getRandomInt(1, 2)
      );
    });
  } else if (potentialRoll < 0.2) {
    // 10% chance of being a Bust
    potential = "bust";
    // Displayed attributes are slightly higher than their true potential
    Object.keys(displayedAttributes).forEach((key) => {
      displayedAttributes[key] = Math.min(
        10,
        baseAttributes[key] + getRandomInt(1, 2)
      );
    });
  }

  const priorities = [
    "salary",
    "ideology_alignment",
    "work_life_balance",
    "location",
  ];
  const shuffledPriorities = priorities.sort(() => 0.5 - Math.random());
  const resumeData = generateResume(params.role);

  return {
    id: `staff_${generateId()}`,
    name: params.name || "Unnamed Staffer",
    role: params.role || "Campaign Aide",

    // --- MODIFIED: Attribute System ---
    attributes: displayedAttributes, // What the player sees initially
    trueAttributes: baseAttributes, // The staffer's actual, hidden attributes
    potential: potential, // 'gem', 'bust', or 'normal'

    // --- NEW: Negotiation System ---
    salary: params.salary || getRandomInt(2000, 8000), // This is now their minimum acceptable salary
    expectedSalary: Math.round(
      (params.salary || 4000) * (1 + getRandomInt(5, 25) / 100)
    ), // What they ask for initially
    negotiationFlexibility: Math.random(), // Hidden value from 0 to 1 for how much they'll bend

    isCurrentlyEmployed: params.isCurrentlyEmployed || Math.random() > 0.5,
    interestInJoining: params.interestInJoining || getRandomInt(3, 10),

    scoutingLevel: "unscouted",
    revealedAttributes: {},
    revealedPriorities: [],
    revealedPotential: null,

    resume: resumeData,
    resumeClueAttribute: resumeData.clueAttribute,

    biases: {
      ideologicalLean: getRandomElement([
        "pragmatist",
        "ideologue",
        "populist",
      ]),
      strategicFocus: getRandomElement([
        "aggressive",
        "grassroots",
        "data_driven",
        "positive_messaging",
      ]),
      priorities: shuffledPriorities.slice(0, 2),
    },

    delegatedTask: "idle",
    quizScore: null,
  };
};

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
    generateTalentPool: (countryId) => {
      const roles = [
        "Campaign Manager",
        "Communications Director", 
        "Fundraising Manager",
        "Policy Advisor",
        "HR Director",
        "Field Organizer",
        "Data Analyst",
        "Social Media Manager",
        "Event Coordinator",
        "Volunteer Coordinator",
        "Press Secretary",
        "Research Director",
        "Digital Director",
        "Finance Director",
        "Operations Manager"
      ];
      const newTalentPool = [];
      
      // Generate 50 candidates for a larger talent pool
      for (let i = 0; i < 50; i++) {
        const staffName = get().actions.generateDynamicName({ countryId });
        newTalentPool.push(
          createStaffObject({
            name: staffName,
            role: getRandomElement(roles),
          })
        );
      }
      set({ talentPool: newTalentPool, hiredStaff: [] });
    },
    
    getFilteredTalentPool: (roleFilter = null) => {
      const talentPool = get().talentPool;
      if (!roleFilter || roleFilter === "all") {
        return talentPool;
      }
      return talentPool.filter(staff => staff.role === roleFilter);
    },
    
    getAvailableRoles: () => {
      const talentPool = get().talentPool;
      const roles = [...new Set(talentPool.map(staff => staff.role))];
      return roles.sort();
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

      get().actions.addNotification({
        message: `Scouting report for purchased. You can now review the candidate's resume.`,
        type: "success",
        category: 'Personnel',
      });
    },

    /**
     * NEW: Reviews a resume to uncover some key skills.
     */
    reviewResume: (staffId) => {
      const staffMember = get().talentPool.find((s) => s.id === staffId);
      if (!staffMember || staffMember.scoutingLevel !== "scouted") return;

      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                scoutingLevel: "resume_reviewed",
              }
            : staff
        ),
      }));
    },

    /**
     * NEW: Conducts an interview to reveal all remaining attributes.
     */
    conductInterview: (staffId) => {
      const cost = 150;
      const playerPolitician = get().activeCampaign.politician;
      const currentTreasury = playerPolitician.treasury;
      const staffMember = get().talentPool.find((s) => s.id === staffId);

      if (
        !staffMember ||
        !["resume_reviewed"].includes(staffMember.scoutingLevel)
      ) {
        return; // Can only interview after reviewing resume
      }

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

      // --- NEW LOGIC: Reveal priorities and give attribute hints ---
      const highAttribute = Object.keys(staffMember.trueAttributes).reduce(
        (a, b) =>
          staffMember.trueAttributes[a] > staffMember.trueAttributes[b] ? a : b
      );

      const hintText = `They emphasized the importance of '${staffMember.biases.priorities[0].replace(
        "_",
        " "
      )}' and spoke confidently about their experience with ${highAttribute}.`;

      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                scoutingLevel: "interviewed",
                revealedPriorities: staff.biases.priorities, // Reveal priorities
                // Optionally add the hint to the staff object if you want to display it
              }
            : staff
        ),
      }));

      get().actions.addNotification({
        message: `Interview with ${staffMember.name} complete.`,
        type: "success",
        category: 'Personnel',
      });
    },

    hireStaff: (staffId, finalSalary) => {
      const staffToHire = get().talentPool.find((s) => s.id === staffId);
      if (!staffToHire) return;

      if (
        !["interviewed", "quizzed", "vetted"].includes(
          staffToHire.scoutingLevel
        )
      ) {
        get().actions.addToast({
          message:
            "You must fully interview or vet a candidate before offering them a job.",
          type: "info",
        });
        return;
      }

      const hiredStaffMember = {
        ...staffToHire,
        salary: finalSalary,
      };

      set((state) => ({
        talentPool: state.talentPool.filter((s) => s.id !== staffId),
        hiredStaff: [...state.hiredStaff, hiredStaffMember],
      }));

      get().actions.addToast({
        message: `${
          staffToHire.name
        } has been hired for $${finalSalary.toLocaleString()}/month!`,
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

      get().actions.addNotification({
        message: `${staffToFire.name} has been fired.`,
        type: "info",
        category: 'Personnel',
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
        get().actions.addNotification({
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

    /**
     * Toggle a politician's favorite status
     * @param {string} politicianId - The ID of the politician to favorite/unfavorite
     */
    toggleFavoritePolitician: (politicianId) => {
      set((state) => {
        const currentFavorites = state.favoritePoliticians || [];
        const isFavorite = currentFavorites.includes(politicianId);
        
        const newFavorites = isFavorite
          ? currentFavorites.filter(id => id !== politicianId)
          : [...currentFavorites, politicianId];
        
        const targetPolitician = state.activeCampaign.governmentOffices
          .flatMap((o) => o.members || (o.holder ? [o.holder] : []))
          .find((p) => p && p.id === politicianId);
        
        if (targetPolitician) {
          get().actions.addToast({
            message: `${targetPolitician.name} ${isFavorite ? 'removed from' : 'added to'} favorites.`,
            type: "info",
          });
        }
        
        return {
          favoritePoliticians: newFavorites,
        };
      });
    },

    /**
     * Age all politicians by one year (called on year advance)
     */
    agePoliticians: () => {
      set((state) => {
        const newGovernmentOffices = state.activeCampaign.governmentOffices.map(office => {
          const updatedOffice = { ...office };
          
          // Age office holder
          if (office.holder && !office.holder.isPlayer) {
            updatedOffice.holder = {
              ...office.holder,
              age: office.holder.age + 1
            };
          }
          
          // Age office members
          if (office.members) {
            updatedOffice.members = office.members.map(member => {
              if (member && !member.isPlayer) {
                return {
                  ...member,
                  age: member.age + 1
                };
              }
              return member;
            });
          }
          
          return updatedOffice;
        });
        
        return {
          activeCampaign: {
            ...state.activeCampaign,
            governmentOffices: newGovernmentOffices,
          },
        };
      });
    },

    beginNegotiation: (staffId) => {
      const staffMember = get().talentPool.find((s) => s.id === staffId);
      if (!staffMember || staffMember.scoutingLevel !== "interviewed") {
        get().actions.addToast({
          message:
            "You must fully interview a candidate before making an offer.",
          type: "warning",
        });
        return;
      }
      // This action would set state in a UI slice to open the negotiation modal
      // e.g., get().actions.openNegotiationModal(staffId);
      console.log(`Opening negotiation panel for ${staffMember.name}`);
      get().actions.addToast({
        message: `Prepare your offer for ${staffMember.name}.`,
        type: "info",
      });
    },

    /**
     * NEW: The core logic for handling a player's salary offer.
     */
    makeHiringOffer: (staffId, offerAmount) => {
      const staff = get().talentPool.find((s) => s.id === staffId);
      if (!staff) return;

      const acceptanceThreshold =
        staff.salary +
        (staff.expectedSalary - staff.salary) *
          (1 - staff.negotiationFlexibility);

      if (offerAmount >= staff.expectedSalary) {
        // Offer meets or exceeds expectations: INSTANT HIRE
        get().actions.addToast({
          message: `${staff.name} is thrilled with the offer and accepts immediately!`,
          type: "success",
        });
        get().actions.hireStaff(staffId, offerAmount);
      } else if (offerAmount >= acceptanceThreshold) {
        // Offer is within their flexible range: HIRE
        get().actions.addToast({
          message: `After some consideration, ${staff.name} accepts your offer.`,
          type: "success",
        });
        get().actions.hireStaff(staffId, offerAmount);
      } else if (offerAmount > staff.salary * 0.9) {
        // Offer is too low but not insulting: COUNTER-OFFER
        const counterOffer = Math.round(acceptanceThreshold * 1.05);
        // In a real implementation, you'd set state to show this counter-offer in the UI
        get().actions.addToast({
          message: `${staff.name} counters your offer. They are asking for $${counterOffer}.`,
          type: "info",
        });
      } else {
        // Offer is insultingly low: REJECTION
        get().actions.addToast({
          message: `${staff.name} has rejected your offer and is no longer interested.`,
          type: "error",
        });
        // Remove from talent pool for a while
        set((state) => ({
          talentPool: state.talentPool.filter((s) => s.id !== staffId),
        }));
      }
    },
    completeStaffQuiz: (staffId, answers) => {
      const staffMember = get().talentPool.find((s) => s.id === staffId);
      if (!staffMember) return;

      let score = 0;
      // The first question's answer is in the resume
      if (answers["resume_clue"] === staffMember.resumeClueAttribute) {
        score++;
      }
      // The second question's answer is based on their strategic focus
      if (answers["strategic_focus"] === staffMember.biases.strategicFocus) {
        score++;
      }

      const passingGrade = score >= 1; // Require at least 1 of 2 correct for a pass

      if (passingGrade) {
        get().actions.addToast({
          message: `Quiz Passed! Your analysis of ${staffMember.name} was correct. Their attributes and potential are now revealed.`,
          type: "success",
        });
        set((state) => ({
          talentPool: state.talentPool.map((staff) =>
            staff.id === staffId
              ? {
                  ...staff,
                  scoutingLevel: "quizzed",
                  revealedAttributes: staff.attributes,
                  revealedPotential: staff.potential,
                }
              : staff
          ),
        }));
      } else {
        get().actions.addToast({
          message: `Quiz Failed. Your deductions were incorrect. You'll need an HR Director to learn more about ${staffMember.name}.`,
          type: "warning",
        });
        set((state) => ({
          talentPool: state.talentPool.map((staff) =>
            staff.id === staffId
              ? { ...staff, scoutingLevel: "quizzed" }
              : staff
          ),
        }));
      }
    },

    vetCandidateWithHR: (staffId) => {
      const hrDirector = get().hiredStaff.find((s) => s.role === "HR Director");
      if (!hrDirector) {
        get().actions.addToast({
          message: "You need to hire an HR Director to perform final vetting.",
          type: "warning",
        });
        return;
      }

      const staffMember = get().talentPool.find((s) => s.id === staffId);
      if (!staffMember) return;

      // Simulate vetting process, accuracy depends on HR Director's 'judgement'
      const discoveryChance = hrDirector.attributes.judgement / 10;
      let toastMessage = `Your HR Director has finished vetting ${staffMember.name}. Their full attributes have been confirmed.`;

      if (Math.random() < discoveryChance) {
        if (staffMember.potential === "gem") {
          toastMessage = `HR Report: ${staffMember.name} is a potential GEM! Their true abilities are likely higher than they appear.`;
        } else if (staffMember.potential === "bust") {
          toastMessage = `HR Report: Your team has red-flagged ${staffMember.name} as a potential BUST. Be cautious.`;
        }
      }

      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                scoutingLevel: "vetted",
                revealedAttributes: staff.trueAttributes, // HR reveals the TRUE attributes
              }
            : staff
        ),
      }));
      get().actions.addToast({ message: toastMessage, type: "success" });
    },
    askInterviewQuestion: (staffId, questionKey) => {
      set((state) => {
        const talentPool = state.talentPool;
        const staffIndex = talentPool.findIndex((s) => s.id === staffId);
        if (staffIndex === -1) return state;

        const staffMember = talentPool[staffIndex];
        let note = "Their answer was non-committal."; // Default response

        // Generate a hint based on the question and the staffer's true attributes
        switch (questionKey) {
          case "biggest_success": {
            const bestSkill = Object.keys(staffMember.trueAttributes).reduce(
              (a, b) =>
                staffMember.trueAttributes[a] > staffMember.trueAttributes[b]
                  ? a
                  : b
            );
            note = `When asked about their biggest success, their story clearly highlighted their strength in **${bestSkill}**.`;
            break;
          }
          case "work_style":
            note = `They described their work style as **${staffMember.biases.strategicFocus.replace(
              "_",
              " "
            )}**.`;
            break;
          case "motivation":
            note = `Their primary motivation seems to be **${staffMember.biases.priorities[0].replace(
              "_",
              " "
            )}**.`;
            break;
        }

        const newStaffMember = {
          ...staffMember,
          interviewNotes: {
            ...staffMember.interviewNotes,
            [questionKey]: note,
          },
        };

        const newTalentPool = [...talentPool];
        newTalentPool[staffIndex] = newStaffMember;

        return { talentPool: newTalentPool };
      });
    },
    finishInterview: (staffId) => {
      set((state) => ({
        talentPool: state.talentPool.map((staff) =>
          staff.id === staffId
            ? { ...staff, scoutingLevel: "interviewed" }
            : staff
        ),
      }));
    },
    generateDynamicName: (context) => {
      const { countryId, regionId, cityId } = context;
      const { activeCampaign, currentCampaignSetup, availableCountries } =
        get();
      let demographics = null;

      if (activeCampaign && activeCampaign.availableCountries) {
        // --- LOGIC FOR AN ACTIVE CAMPAIGN ---
        const country = activeCampaign.availableCountries.find(
          (c) => c.id === countryId
        );
        if (cityId && activeCampaign.startingCity?.id === cityId) {
          demographics = activeCampaign.startingCity.demographics;
        } else if (regionId && country?.regions) {
          const region = country.regions.find((r) => r.id === regionId);
          demographics = region?.demographics;
        } else if (country) {
          demographics = country.demographics;
        }
      } else {
        // --- LOGIC FOR CAMPAIGN SETUP ---
        const country = availableCountries.find((c) => c.id === countryId);
        if (cityId && currentCampaignSetup?.customCity?.id === cityId) {
          demographics = currentCampaignSetup.customCity.demographics;
        } else if (regionId && country?.regions) {
          const region = country.regions.find((r) => r.id === regionId);
          demographics = region?.demographics;
        } else if (country) {
          demographics = country.demographics;
        }
      }

      return generateAICandidateNameForElection(countryId, demographics);
    },
  },
});
