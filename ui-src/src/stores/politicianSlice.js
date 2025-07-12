// ui-src/src/stores/politicianSlice.js
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData.js";
import { POLICY_QUESTIONS } from "../data/policyData.js"; // Adjust path
import { generateId } from "../utils/generalUtils.js"; // Adjust path

const getInitialCreatingPoliticianState = () => ({
  id: "",
  firstName: "",
  lastName: "",
  age: 35,
  policyStances: {},
  attributes: {
    charisma: 5,
    integrity: 5,
    intelligence: 5,
    negotiation: 5,
    oratory: 5,
    fundraising: 5,
  },
  background: { education: "", career: "", narrative: "" },
  calculatedIdeology: "Centrist",
  politicalCapital: 0,
  nameRecognition: 0,
  treasury: 0,
  campaignFunds: 0,
  approvalRating: 0,
  mediaBuzz: 0,
  partySupport: 0,
  currentOffice: null,
  campaignHoursPerDay: 10,
  campaignHoursRemainingToday: 10,
  hiredStaff: [],
  volunteerCount: 0,
  advertisingBudgetMonthly: 0,
  isInCampaign: false,
  currentAdStrategy: {
    focus: "none",
    targetId: null,
    intensity: 50,
  },
});

export function calculateIdeologyFromStances(
  stances,
  policyQuestionsData, // Pass PROCESSED_POLICY_QUESTIONS here
  IDEOLOGY_DEFINITIONS
) {
  const AXES = [
    "economic",
    "social_traditionalism",
    "sovereignty",
    "ecology",
    "theocratic",
    "digitalization",
    "personal_liberty",
    "authority_structure",
    "state_intervention_scope",
    "societal_focus",
    "rural_priority",
    "governance_approach",
  ];
  const NUM_AXES = AXES.length;

  const currentScores = {};
  AXES.forEach((axis) => (currentScores[axis] = 0));

  // New: Counter for questions with non-zero effects for EACH axis
  const questionsWithNonZeroEffectOnAxis = {};
  AXES.forEach((axis) => (questionsWithNonZeroEffectOnAxis[axis] = 0));

  let totalQuestionsWithAnyEffectAnswered = 0; // Global counter for overall engagement

  const useOptionsMap =
    policyQuestionsData.length > 0 &&
    policyQuestionsData[0].optionsMap instanceof Map;

  policyQuestionsData.forEach((pq) => {
    if (!pq || !pq.id) {
      // Basic check for valid question structure
      // console.warn("Skipping malformed policy question object:", pq);
      return;
    }
    const selectedOptionValue = stances[pq.id];
    if (selectedOptionValue) {
      let effects = null;
      if (useOptionsMap) {
        const optionData = pq.optionsMap.get(selectedOptionValue);
        if (optionData && optionData.axis_effects) {
          // Assuming key is axis_effects
          effects = optionData.axis_effects;
        } else if (optionData && optionData.ideologyEffect) {
          // Fallback if old key name is still in map
          effects = optionData.ideologyEffect;
        }
      } else {
        const selectedOptionData = (pq.options || []).find(
          // Ensure pq.options is an array
          (opt) => opt && opt.value === selectedOptionValue
        );
        if (selectedOptionData) {
          effects =
            selectedOptionData.axis_effects ||
            selectedOptionData.ideologyEffect; // Check both keys
        }
      }

      if (effects && typeof effects === "object") {
        let questionContributedToGlobalCountThisIteration = false;
        AXES.forEach((axis) => {
          const effectValue = effects[axis];
          if (typeof effectValue === "number") {
            currentScores[axis] += effectValue; // Add effect, even if 0
            if (effectValue !== 0) {
              questionsWithNonZeroEffectOnAxis[axis]++; // Increment per-axis counter ONLY for non-zero effects
              questionContributedToGlobalCountThisIteration = true;
            }
          }
        });
        if (questionContributedToGlobalCountThisIteration) {
          totalQuestionsWithAnyEffectAnswered++;
        }
      }
    }
  });

  const rawScores = { ...currentScores };

  // If no questions had any effect on any axis, return Centrist.
  if (totalQuestionsWithAnyEffectAnswered === 0) {
    const zeroScores = {};
    AXES.forEach((axis) => (zeroScores[axis] = 0));
    return {
      ideologyName: "Centrist",
      scores: { ...zeroScores },
      rawScores: { ...zeroScores },
      questionsAnswered: 0, // Reflects questions with non-zero impact
      allDistances: {},
    };
  }

  const normalizedScores = {};
  AXES.forEach((axis) => {
    if (questionsWithNonZeroEffectOnAxis[axis] > 0) {
      normalizedScores[axis] =
        currentScores[axis] / questionsWithNonZeroEffectOnAxis[axis];
    } else {
      // If no questions had a non-zero effect on this specific axis,
      // the normalized score for this axis is 0 (as currentScores[axis] would also be 0).
      normalizedScores[axis] = 0;
    }
  });

  let determinedIdeologyName = "Centrist";
  let minDistanceSquared = Infinity;
  const distances = {};

  if (!IDEOLOGY_DEFINITIONS || Object.keys(IDEOLOGY_DEFINITIONS).length === 0) {
    console.error(
      "IDEOLOGY_DEFINITIONS is missing or empty! Cannot calculate ideology."
    );
    return {
      ideologyName: "Centrist",
      scores: normalizedScores,
      rawScores: rawScores,
      questionsAnswered: totalQuestionsWithAnyEffectAnswered,
      allDistances: {},
    };
  }

  const ideologyDefsArray = Object.values(IDEOLOGY_DEFINITIONS);

  for (const ideologyDef of ideologyDefsArray) {
    if (!ideologyDef.idealPoint) {
      console.warn(
        `Ideology ${ideologyDef.name} is missing an idealPoint definition.`
      );
      continue;
    }
    let distanceSquared = 0;
    AXES.forEach((axis) => {
      const idealAxisScore = ideologyDef.idealPoint[axis] || 0;
      const normalizedScoreForAxis = normalizedScores[axis] || 0;
      const diff = normalizedScoreForAxis - idealAxisScore;
      distanceSquared += diff * diff;
    });

    distances[ideologyDef.name] = Math.sqrt(distanceSquared);

    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      determinedIdeologyName = ideologyDef.name;
    }
  }

  const averageAbsoluteScore =
    AXES.reduce((sum, axis) => sum + Math.abs(normalizedScores[axis] || 0), 0) /
    NUM_AXES;

  const trueCentristAvgAbsThreshold = 0.25; // This threshold may still need tuning

  if (averageAbsoluteScore < trueCentristAvgAbsThreshold) {
    determinedIdeologyName = "Centrist";
  }

  return {
    ideologyName: determinedIdeologyName,
    scores: normalizedScores,
    rawScores: rawScores,
    questionsAnswered: totalQuestionsWithAnyEffectAnswered, // Total questions that had *some* effect
    allDistances: distances,
  };
}

export const createPoliticianSlice = (set, get) => ({
  // State owned by this slice
  creatingPolitician: getInitialCreatingPoliticianState(),
  politicianToEditId: null,
  savedPoliticians: [], // Array to store finalized politician objects

  // Actions
  resetCreatingPolitician: () => {
    set({
      creatingPolitician: getInitialCreatingPoliticianState(),
      politicianToEditId: null, // Also clear editing ID
    });
  },

  updateCreatingPoliticianField: (field, value) =>
    set((state) => ({
      creatingPolitician: { ...state.creatingPolitician, [field]: value },
    })),

  updateCreatingPoliticianPolicyStance: (policyQuestionId, answerValue) => {
    set((state) => ({
      creatingPolitician: {
        ...state.creatingPolitician,
        policyStances: {
          ...state.creatingPolitician.policyStances,
          [policyQuestionId]: answerValue,
        },
      },
    }));
  },

  updateCreatingPoliticianAttribute: (attributeName, value) =>
    set((state) => ({
      creatingPolitician: {
        ...state.creatingPolitician,
        attributes: {
          ...state.creatingPolitician.attributes,
          [attributeName]: value,
        },
      },
    })),

  updateCreatingPoliticianBackground: (field, value) =>
    set((state) => ({
      creatingPolitician: {
        ...state.creatingPolitician,
        background: {
          ...state.creatingPolitician.background,
          [field]: value,
        },
      },
    })),

  recalculateIdeology: () => {
    const stances = get().creatingPolitician.policyStances;
    const { ideologyName, scores } = calculateIdeologyFromStances(
      stances,
      POLICY_QUESTIONS,
      IDEOLOGY_DEFINITIONS
    );

    console.log(ideologyName, scores);

    set((state) => ({
      creatingPolitician: {
        ...state.creatingPolitician,
        calculatedIdeology: ideologyName,
        ideologyScores: scores,
      },
    }));
  },

  finalizeNewPolitician: () => {
    const currentCreatingPolitician = get().creatingPolitician;
    const politicianIdToEdit = get().politicianToEditId;

    // Ensure ID is generated for new politicians
    const newPolitician = {
      ...currentCreatingPolitician,
      id: politicianIdToEdit || currentCreatingPolitician.id || generateId(),
    };

    if (politicianIdToEdit) {
      // This is an UPDATE to an existing politician
      set((state) => ({
        savedPoliticians: state.savedPoliticians.map((p) =>
          p.id === politicianIdToEdit ? newPolitician : p
        ),
        creatingPolitician: getInitialCreatingPoliticianState(),
        politicianToEditId: null,
      }));
      console.log("Politician Updated:", newPolitician);
      if (get().actions.navigateTo) {
        // Check if navigateTo exists
        get().actions.navigateTo("ManagePoliticiansScreen");
      } else {
        console.error("finalizeNewPolitician: navigateTo action not found!");
      }
    } else {
      // This is a brand NEW politician
      set((state) => ({
        savedPoliticians: [...state.savedPoliticians, newPolitician],
        creatingPolitician: getInitialCreatingPoliticianState(),
      }));
      console.log("New Politician Finalized & Saved:", newPolitician);

      if (get().actions.initializeNewCampaignSetup) {
        console.log(
          `Calling initializeNewCampaignSetup with ID: ${newPolitician.id}`
        );
        get().actions.initializeNewCampaignSetup(newPolitician.id);
      } else {
        console.error(
          "finalizeNewPolitician: initializeNewCampaignSetup action not found! Cannot proceed to campaign setup with new politician."
        );
        if (get().actions.navigateTo)
          get().actions.navigateTo("CampaignSetupScreen");
      }
    }
  },

  loadPoliticianForEditing: (politicianId) => {
    const politicianToEdit = get().savedPoliticians.find(
      (p) => p.id === politicianId
    );
    if (politicianToEdit) {
      set({
        creatingPolitician: { ...politicianToEdit },
        politicianToEditId: politicianId,
      });
      get().actions.navigateTo("PoliticianCreator"); // Call UI slice action
    } else {
      console.warn(
        "loadPoliticianForEditing: Politician ID not found:",
        politicianId
      );
    }
  },

  // updateEditedPolitician: Merged into finalizeNewPolitician logic now.

  deleteSavedPolitician: (politicianId) => {
    set((state) => ({
      savedPoliticians: state.savedPoliticians.filter(
        (p) => p.id !== politicianId
      ),
    }));
    console.log("Deleted Politician with ID:", politicianId);
  },
});
