import { politicians as temporaryPoliticianStore } from "../entities/personnel";

// The initial state for a Struct of Arrays (SoA) data store for politicians.
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

const replacer = (key, value) => {
  if (value instanceof Map) {
    return { __type: "Map", value: Array.from(value.entries()) };
  }
  if (value instanceof Set) {
    return { __type: "Set", value: Array.from(value.values()) };
  }
  return value;
};

const reviver = (key, value) => {
  if (typeof value === "object" && value !== null && value.__type === "Map") {
    return new Map(value.value);
  }
  if (typeof value === "object" && value !== null && value.__type === "Set") {
    return new Set(value.value);
  }
  return value;
};

export const createDataSlice = (set, get) => ({
  // This holds the TEMPLATES for custom politicians. This is what gets saved.
  savedPoliticians: getInitialPoliticianSoA(),

  actions: {
    /**
     * REFACTORED: Adds a politician's data to a specified SoA store, supporting nested paths.
     * @param {object} politicianData - The full politician object to add.
     * @param {string} storePath - The path to the SoA store (e.g., 'savedPoliticians' or 'activeCampaign.politicians').
     */
    addPoliticianToStore: (politicianData, storePath) => {
      set((state) => {
        const { id } = politicianData;
        if (!id) {
          console.error("Cannot add politician without an ID.");
          return state;
        }

        const pathParts = storePath.split(".");
        const newState = { ...state };
        let currentLevel = newState;

        // Traverse the path to the parent of the target store
        for (let i = 0; i < pathParts.length - 1; i++) {
          currentLevel[pathParts[i]] = { ...currentLevel[pathParts[i]] };
          currentLevel = currentLevel[pathParts[i]];
        }

        const storeKey = pathParts[pathParts.length - 1];
        const targetStore = currentLevel[storeKey];

        if (!targetStore) {
          console.error(
            `SoA store with key "${storeKey}" does not exist at path.`
          );
          return state;
        }

        // Immutable update: create new Maps by copying the old ones.
        const newSoA = {
          base: new Map(targetStore.base),
          attributes: new Map(targetStore.attributes),
          policyStances: new Map(targetStore.policyStances),
          ideologyScores: new Map(targetStore.ideologyScores),
          finances: new Map(targetStore.finances),
          background: new Map(targetStore.background),
          state: new Map(targetStore.state),
          campaign: new Map(targetStore.campaign),
          staff: new Map(targetStore.staff),
        };

        // Dehydrate the monolithic object into the SoA structure
        newSoA.base.set(id, {
          id: politicianData.id,
          firstName: politicianData.firstName,
          lastName: politicianData.lastName,
          name: `${politicianData.firstName} ${politicianData.lastName}`,
          age: politicianData.age,
          gender: politicianData.gender,
          isPlayer: politicianData.isPlayer || false,
          partyId: politicianData.partyId || null,
          factionId: politicianData.factionId || null,
          currentOffice: politicianData.currentOffice || null,
          calculatedIdeology: politicianData.calculatedIdeology,
        });
        newSoA.attributes.set(id, politicianData.attributes);
        newSoA.policyStances.set(
          id,
          new Map(Object.entries(politicianData.policyStances || {}))
        );
        newSoA.ideologyScores.set(id, politicianData.ideologyScores);
        newSoA.finances.set(id, {
          treasury: politicianData.treasury,
          campaignFunds: politicianData.campaignFunds,
        });
        newSoA.background.set(id, politicianData.background);
        newSoA.state.set(id, {
          politicalCapital: politicianData.politicalCapital,
          nameRecognition: politicianData.nameRecognition,
          approvalRating: politicianData.approvalRating,
          mediaBuzz: politicianData.mediaBuzz,
          partySupport: politicianData.partySupport,
          polling: politicianData.polling,
        });
        newSoA.campaign.set(id, {
          isInCampaign: politicianData.isInCampaign,
          workingHours: politicianData.workingHours,
          maxWorkingHours: politicianData.maxWorkingHours,
          volunteerCount: politicianData.volunteerCount,
          currentAdStrategy: politicianData.currentAdStrategy,
        });

        currentLevel[storeKey] = newSoA;
        return newState;
      });
    },

    addMultiplePoliticiansToStore: (politiciansArray, storePath) => {
      set((state) => {
        if (!politiciansArray || politiciansArray.length === 0) return state;

        // --- (This setup logic is the same as addPoliticianToStore) ---
        const pathParts = storePath.split(".");
        const newState = { ...state };
        let currentLevel = newState;
        for (let i = 0; i < pathParts.length - 1; i++) {
          currentLevel[pathParts[i]] = { ...currentLevel[pathParts[i]] };
          currentLevel = currentLevel[pathParts[i]];
        }
        const storeKey = pathParts[pathParts.length - 1];
        const targetStore = currentLevel[storeKey];
        if (!targetStore) {
          console.error(`SoA store at "${storePath}" does not exist.`);
          return state;
        }
        const newSoA = {
          base: new Map(targetStore.base),
          attributes: new Map(targetStore.attributes),
          // ... (copy all other maps)
        };
        // --- (End setup logic) ---

        // Loop through the provided array and add EACH politician to the new maps
        politiciansArray.forEach((politicianData) => {
          const { id } = politicianData;
          if (id) {
            // This is the same "dehydration" logic from your addPoliticianToStore action
            newSoA.base.set(id, {
              id: politicianData.id,
              firstName: politicianData.firstName,
              lastName: politicianData.lastName,
              name: `${politicianData.firstName} ${politicianData.lastName}`,
              age: politicianData.age,
              gender: politicianData.gender,
              isPlayer: politicianData.isPlayer || false,
              partyId: politicianData.partyId || null,
              factionId: politicianData.factionId || null,
              currentOffice: politicianData.currentOffice || null,
              calculatedIdeology: politicianData.calculatedIdeology,
            });
            newSoA.attributes.set(id, politicianData.attributes);
            newSoA.policyStances.set(
              id,
              new Map(Object.entries(politicianData.policyStances || {}))
            );
            newSoA.ideologyScores.set(id, politicianData.ideologyScores);
            newSoA.finances.set(id, {
              treasury: politicianData.treasury,
              campaignFunds: politicianData.campaignFunds,
            });
            newSoA.background.set(id, politicianData.background);
            newSoA.state.set(id, {
              politicalCapital: politicianData.politicalCapital,
              nameRecognition: politicianData.nameRecognition,
              approvalRating: politicianData.approvalRating,
              mediaBuzz: politicianData.mediaBuzz,
              partySupport: politicianData.partySupport,
              polling: politicianData.polling,
            });
            newSoA.campaign.set(id, {
              isInCampaign: politicianData.isInCampaign,
              workingHours: politicianData.workingHours,
              maxWorkingHours: politicianData.maxWorkingHours,
              volunteerCount: politicianData.volunteerCount,
              currentAdStrategy: politicianData.currentAdStrategy,
            });
          }
        });

        currentLevel[storeKey] = newSoA;
        return newState;
      });
    },

    /**
     * REFACTORED: Deletes a politician from a specified SoA store, supporting nested paths.
     */
    deletePoliticianFromStore: (politicianId, storePath) => {
      set((state) => {
        const pathParts = storePath.split(".");
        const newState = { ...state };
        let currentLevel = newState;

        for (let i = 0; i < pathParts.length - 1; i++) {
          currentLevel[pathParts[i]] = { ...currentLevel[pathParts[i]] };
          currentLevel = currentLevel[pathParts[i]];
        }

        const storeKey = pathParts[pathParts.length - 1];
        const targetStore = currentLevel[storeKey];

        if (!targetStore) {
          console.error(
            `SoA store with key "${storeKey}" does not exist at path.`
          );
          return state;
        }

        const newSoA = {
          base: new Map(targetStore.base),
          attributes: new Map(targetStore.attributes),
          policyStances: new Map(targetStore.policyStances),
          ideologyScores: new Map(targetStore.ideologyScores),
          finances: new Map(targetStore.finances),
          background: new Map(targetStore.background),
          state: new Map(targetStore.state),
          campaign: new Map(targetStore.campaign),
          staff: new Map(targetStore.staff),
        };

        Object.values(newSoA).forEach((map) => map.delete(politicianId));

        currentLevel[storeKey] = newSoA;
        return newState;
      });
    },

    /**
     * NEW: Clears the temporary global politician store after generation is complete.
     */
    clearTemporaryPoliticians: () => {
      Object.values(temporaryPoliticianStore).forEach((map) => map.clear());
      console.log("Temporary politician store cleared.");
    },
    persistSavedPoliticians: () => {
      try {
        const stateToSave = {
          savedPoliticians: get().savedPoliticians,
        };
        // --- FIX: Use the 'replacer' function we just defined ---
        const serializedState = JSON.stringify(stateToSave, replacer);
        localStorage.setItem("stateos-politician-templates", serializedState);
        console.log("Politician templates saved manually.");
      } catch (error) {
        console.error("Error saving politician templates:", error);
      }
    },

    loadSavedPoliticians: () => {
      try {
        const savedState = localStorage.getItem("stateos-politician-templates");
        if (savedState) {
          // --- FIX: Use the 'reviver' function we just defined ---
          const restoredState = JSON.parse(savedState, reviver);
          if (restoredState.savedPoliticians) {
            set({ savedPoliticians: restoredState.savedPoliticians });
            console.log("Successfully loaded saved politician templates.");
          }
        }
      } catch (error) {
        console.error("Error loading politician templates:", error);
      }
    },
  },
});
