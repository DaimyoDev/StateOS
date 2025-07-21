// ui-src/src/stores/politicianSlice.js
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import { calculateIdeologyFromStances } from "../entities/personnel.js";
import { generateId } from "../utils/core.js";

// --- Helper Function (Stays outside the slice) ---
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

// --- Main Slice Creator ---
export const createPoliticianSlice = (set, get) => ({
  // --- State ---
  creatingPolitician: getInitialCreatingPoliticianState(),
  politicianToEditId: null,
  savedPoliticians: [],

  // --- Actions ---
  actions: {
    /**
     * Resets the politician creation form to its initial state.
     */
    resetCreatingPolitician: () => {
      set({
        creatingPolitician: getInitialCreatingPoliticianState(),
        politicianToEditId: null,
      });
    },

    /**
     * Updates a single field in the `creatingPolitician` object.
     * @param {string} field - The name of the field to update.
     * @param {*} value - The new value for the field.
     */
    updateCreatingPoliticianField: (field, value) =>
      set((state) => ({
        creatingPolitician: { ...state.creatingPolitician, [field]: value },
      })),

    /**
     * Updates a policy stance for the politician being created.
     * @param {string} policyQuestionId - The ID of the policy question.
     * @param {string} answerValue - The selected answer value.
     */
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

    /**
     * Updates a single attribute (like charisma, integrity) for the politician.
     * @param {string} attributeName - The name of the attribute.
     * @param {number} value - The new value for the attribute.
     */
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

    /**
     * Updates a field in the politician's background.
     * @param {string} field - The background field to update (e.g., 'education').
     * @param {string} value - The new value.
     */
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

    /**
     * Recalculates the politician's ideology based on their current policy stances.
     */
    recalculateIdeology: () => {
      const stances = get().creatingPolitician.policyStances;
      const { ideologyName, scores } = calculateIdeologyFromStances(
        stances,
        POLICY_QUESTIONS,
        IDEOLOGY_DEFINITIONS
      );
      set((state) => ({
        creatingPolitician: {
          ...state.creatingPolitician,
          calculatedIdeology: ideologyName,
          ideologyScores: scores,
        },
      }));
    },

    /**
     * Finalizes the creation or update of a politician and saves them.
     */
    finalizeNewPolitician: () => {
      const { creatingPolitician, politicianToEditId } = get();
      const newPolitician = {
        ...creatingPolitician,
        id:
          politicianToEditId || creatingPolitician.id || `pol_${generateId()}`,
      };

      if (politicianToEditId) {
        // Update existing politician
        set((state) => ({
          savedPoliticians: state.savedPoliticians.map((p) =>
            p.id === politicianToEditId ? newPolitician : p
          ),
        }));
        get().actions.navigateTo("ManagePoliticiansScreen");
      } else {
        // Add a new politician
        set((state) => ({
          savedPoliticians: [...state.savedPoliticians, newPolitician],
        }));
        get().actions.initializeNewCampaignSetup(newPolitician.id);
      }
      get().actions.resetCreatingPolitician(); // Reset form after saving
    },

    /**
     * Loads an existing politician's data into the creator form for editing.
     * @param {string} politicianId - The ID of the politician to edit.
     */
    loadPoliticianForEditing: (politicianId) => {
      const politicianToEdit = get().savedPoliticians.find(
        (p) => p.id === politicianId
      );
      if (politicianToEdit) {
        set({
          creatingPolitician: { ...politicianToEdit },
          politicianToEditId: politicianId,
        });
        get().actions.navigateTo("PoliticianCreator");
      }
    },

    /**
     * Deletes a politician from the list of saved politicians.
     * @param {string} politicianId - The ID of the politician to delete.
     */
    deleteSavedPolitician: (politicianId) => {
      set((state) => ({
        savedPoliticians: state.savedPoliticians.filter(
          (p) => p.id !== politicianId
        ),
      }));
    },
  },
});
