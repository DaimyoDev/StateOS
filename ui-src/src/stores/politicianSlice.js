// stores/politicianSlice.js
import { generateId } from "../utils/core";
import { POLICY_QUESTIONS } from "../data/policyData";
import { calculateIdeologyFromStances } from "../entities/personnel";
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";

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
  savedPoliticians: [],
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
      const { navigateBack } = get().actions;
      // We directly use the creatingPolitician object which now holds the correct stat values
      const newPolitician = { ...get().creatingPolitician };

      if (!newPolitician.id) {
        newPolitician.id = `pol_${generateId()}`;
      }

      set((state) => {
        const existingIndex = state.savedPoliticians.findIndex(
          (p) => p.id === newPolitician.id
        );
        let updatedSavedPoliticians;
        if (existingIndex > -1) {
          updatedSavedPoliticians = [...state.savedPoliticians];
          updatedSavedPoliticians[existingIndex] = newPolitician;
        } else {
          updatedSavedPoliticians = [...state.savedPoliticians, newPolitician];
        }
        return { savedPoliticians: updatedSavedPoliticians };
      });

      get().actions.resetCreatingPolitician();
      navigateBack();
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
        get().actions.navigateTo("PoliticianCreator");
      }
    },

    deleteSavedPolitician: (politicianId) => {
      set((state) => ({
        savedPoliticians: state.savedPoliticians.filter(
          (p) => p.id !== politicianId
        ),
      }));
    },
  },
});
