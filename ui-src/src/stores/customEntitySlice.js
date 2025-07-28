// stores/customEntitySlice.js
import { generateId } from "../utils/core";
import { POLICY_QUESTIONS } from "../data/policyData";
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";
import { calculateIdeologyFromStances } from "../entities/personnel";

const getInitialCreatingPartyState = () => ({
  id: null,
  name: "",
  color: "#CCCCCC",
  logoDataUrl: null,
  policyStances: {},
  ideology: "Centrist",
  ideologyScores: {},
});

export const createCustomEntitySlice = (set, get) => ({
  allCustomParties: [],
  savedElectionSetups: [],
  creatingParty: getInitialCreatingPartyState(),

  actions: {
    // --- Custom Party Actions ---
    addCustomParty: (newParty) =>
      set((state) => ({
        allCustomParties: [
          ...state.allCustomParties,
          { ...newParty, id: `custom-party-${generateId()}` },
        ],
      })),

    updateCustomParty: (updatedParty) =>
      set((state) => ({
        allCustomParties: state.allCustomParties.map((p) =>
          p.id === updatedParty.id ? updatedParty : p
        ),
      })),

    deleteCustomParty: (partyId) =>
      set((state) => ({
        allCustomParties: state.allCustomParties.filter(
          (p) => p.id !== partyId
        ),
      })),

    // --- Party Creator Screen Actions ---
    // NEW ACTION for resetting the form state directly, just like for politicians.
    resetCreatingParty: () => {
      set({ creatingParty: getInitialCreatingPartyState() });
    },

    // This composite action is good practice, but we'll call the pieces directly from the UI for now.
    startCreatingNewParty: () => {
      get().actions.resetCreatingParty();
      get().actions.navigateTo("PartyCreatorScreen");
    },

    loadPartyForEditing: (partyId) => {
      const partyToEdit = get().allCustomParties.find((p) => p.id === partyId);
      if (partyToEdit) {
        set({
          creatingParty: { ...getInitialCreatingPartyState(), ...partyToEdit },
        });
        get().actions.navigateTo("PartyCreatorScreen");
      }
    },

    updateCreatingPartyField: (field, value) => {
      set((state) => ({
        creatingParty: { ...state.creatingParty, [field]: value },
      }));
    },

    updateCreatingPartyPolicyStance: (questionId, value) => {
      set((state) => {
        const newStances = {
          ...state.creatingParty.policyStances,
          [questionId]: value,
        };
        const { ideologyName, ideologyScores } = calculateIdeologyFromStances(
          null,
          POLICY_QUESTIONS,
          IDEOLOGY_DEFINITIONS,
          null, // No base scores needed here, calculated fresh
          newStances
        );
        return {
          creatingParty: {
            ...state.creatingParty,
            policyStances: newStances,
            ideology: ideologyName,
            ideologyScores: ideologyScores,
          },
        };
      });
    },

    finalizeNewParty: () => {
      const party = get().creatingParty;
      if (party.id) {
        // It's an existing party
        get().actions.updateCustomParty(party);
      } else {
        // It's a new party
        get().actions.addCustomParty(party);
      }
      set({ creatingParty: getInitialCreatingPartyState() });
      get().actions.navigateTo("CreatorHub");
    },

    // --- Saved Election Setup Actions ---
    saveElectionSetup: (setupData) =>
      set((state) => ({
        savedElectionSetups: [...state.savedElectionSetups, setupData],
      })),

    updateElectionSetup: (updatedSetup) =>
      set((state) => ({
        savedElectionSetups: state.savedElectionSetups.map((s) =>
          s.id === updatedSetup.id ? updatedSetup : s
        ),
      })),

    deleteElectionSetup: (setupId) =>
      set((state) => ({
        savedElectionSetups: state.savedElectionSetups.filter(
          (s) => s.id !== setupId
        ),
      })),

    loadElectionSetup: (setupId) => {
      const setupToLoad = get().savedElectionSetups.find(
        (s) => s.id === setupId
      );
      if (setupToLoad) {
        console.log("Loading setup:", setupToLoad);
      }
    },
  },
});
