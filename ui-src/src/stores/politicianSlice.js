// stores/politicianSlice.js
import { generateId } from "../utils/core";
import { POLICY_QUESTIONS } from "../data/policyData";
import { calculateIdeologyFromStances } from "../entities/personnel";
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";

const getInitialPoliticianSoA = () => ({
  base: new Map(),
  attributes: new Map(),
  policyStances: new Map(),
  ideologyScores: new Map(),
  state: new Map(),
  finances: new Map(),
  background: new Map(),
  campaign: new Map(),
  staff: new Map(),
});

const getInitialCreatingPoliticianState = () => ({
  id: null,
  firstName: "Alex",
  lastName: "Meridian",
  age: 35,
  sex: "female",
  policyFocus: "Economic Growth",
  politicalCapital: 20,
  nameRecognition: 5000,
  treasury: 10000,
  campaignFunds: 5000,
  workingHours: 8,
  maxWorkingHours: 8,
  attributes: {
    charisma: 5,
    integrity: 5,
    intelligence: 5,
    negotiation: 5,
    oratory: 5,
    fundraising: 5,
  },
  policyStances: {},
  background: { education: "", career: "", narrative: "" },
  calculatedIdeology: "Centrist",
  ideologyScores: {},
});

export const createPoliticianSlice = (set, get) => ({
  // --- STATE ---
  savedPoliticians: getInitialPoliticianSoA(),
  creatingPolitician: getInitialCreatingPoliticianState(),
  politicianToEditId: null,

  // --- ACTIONS ---
  actions: {
    resetCreatingPolitician: () =>
      set({
        creatingPolitician: getInitialCreatingPoliticianState(),
        politicianToEditId: null,
      }),

    updateCreatingPoliticianField: (field, value) => {
      set((state) => ({
        creatingPolitician: { ...state.creatingPolitician, [field]: value },
      }));
    },

    updateCreatingPoliticianAttribute: (attribute, value) => {
      set((state) => ({
        creatingPolitician: {
          ...state.creatingPolitician,
          attributes: {
            ...state.creatingPolitician.attributes,
            [attribute]: value,
          },
        },
      }));
    },

    updateCreatingPoliticianBackground: (field, value) => {
      set((state) => ({
        creatingPolitician: {
          ...state.creatingPolitician,
          background: {
            ...state.creatingPolitician.background,
            [field]: value,
          },
        },
      }));
    },

    updateCreatingPoliticianPolicyStance: (questionId, value) => {
      set((state) => ({
        creatingPolitician: {
          ...state.creatingPolitician,
          policyStances: {
            ...state.creatingPolitician.policyStances,
            [questionId]: value,
          },
        },
      }));
    },

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

    finalizeNewPolitician: () => {
      const { navigateBack, addPoliticianToStore } = get().actions;
      const politicianData = { ...get().creatingPolitician };

      const isEditing = !!politicianData.id;
      const id = isEditing ? politicianData.id : `pol_${generateId()}`;
      politicianData.id = id;

      // Call the centralized action to save the data to the 'savedPoliticians' SoA store
      addPoliticianToStore(politicianData, "savedPoliticians");
      get().actions.persistSavedPoliticians();

      get().actions.resetCreatingPolitician();
      navigateBack();
    },

    /**
     * REFACTORED: Loads a politician from the main data store into the creator form.
     */
    loadPoliticianForEditing: (politicianId) => {
      const soa = get().savedPoliticians; // Get the SoA store from the root state
      const base = soa.base.get(politicianId);
      if (!base) return;

      // Re-hydrate a monolithic object from the various maps
      const politicianToEdit = {
        ...base,
        attributes: soa.attributes.get(politicianId) || {},
        policyStances: Object.fromEntries(
          soa.policyStances.get(politicianId) || new Map()
        ),
        ideologyScores: soa.ideologyScores.get(politicianId) || {},
        ...(soa.finances.get(politicianId) || {}),
        background: soa.background.get(politicianId) || {},
        // Add other properties from other maps as needed
      };

      set({
        creatingPolitician: politicianToEdit,
        politicianToEditId: politicianId,
      });
      get().actions.navigateTo("PoliticianCreator");
    },

    /**
     * REFACTORED: Calls the dataSlice to delete a politician.
     */
    deleteSavedPolitician: (politicianId) => {
      get().actions.deletePoliticianFromStore(politicianId, "savedPoliticians");
      get().actions.persistSavedPoliticians();
    },
  },
});
