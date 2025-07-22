import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// Util imports
import { getRandomInt } from "./utils/core.js";

// --- Slice Creators ---
import { createUISlice } from "./stores/uiStateSlice.js";
import { createPoliticianSlice } from "./stores/politicianSlice.js";
import { createElectionSlice } from "./stores/electionSlice.js";
import { createCampaignSlice } from "./stores/campaignSlice.js";
import { createLegislationSlice } from "./stores/legislationSlice.js";
import { createCampaignSetupSlice } from "./stores/campaignSetupSlice.js";
import { createPolicySlice } from "./stores/policySlice.js";
import { createTimeSlice } from "./stores/timeSlice.js";
import { createNewsSlice } from "./stores/newsSlice.js";
import { createCampaignStaffSlice } from "./stores/campaignStaffSlice.js";

// --- Helper Functions (to be moved to relevant slices or utils later) ---

// Will move to campaignSetupSlice
const getInitialCampaignSetupState = () => ({
  selectedPoliticianId: null,
  selectedCountryId: null,
  selectedRegionId: null,
  generatedPartiesInCountry: [],
  playerPartyChoice: {},
  regionPoliticalLandscape: {},
  governmentOffices: [],
});

// --- ZUSTAND STORE CREATION ---
const useGameStore = create(
  persist(
    (set, get) => {
      const uiSliceData = createUISlice(set, get);
      const politicianSliceData = createPoliticianSlice(set, get);
      const electionSliceActions = createElectionSlice(set, get);
      const campaignSlice = createCampaignSlice(set, get);
      const legislationSlice = createLegislationSlice(set, get);
      const campaignSetupSlice = createCampaignSetupSlice(set, get);
      const policySlice = createPolicySlice(set, get);
      const timeSlice = createTimeSlice(set, get);
      const newsSlice = createNewsSlice(set, get);
      const campaignStaffSlice = createCampaignStaffSlice(set, get);

      return {
        creatingPolitian: politicianSliceData.creatingPolitician,
        savedPoliticians: politicianSliceData.savedPoliticians,
        activeCampaign: campaignSlice.activeCampaign,
        proposedLegislation: legislationSlice.proposedLegislation,
        activeLegislation: legislationSlice.activeLegislation,
        availablePoliciesForProposal:
          legislationSlice.availablePoliciesForProposal,

        availableCountries: [],
        allCustomParties: [],
        toasts: [],
        availableThemes: uiSliceData.availableThemes, // Themes now managed by uiSlice
        activeThemeName: uiSliceData.activeThemeName, //
        newsItems: newsSlice.newsItems,

        currentCampaignSetup: getInitialCampaignSetupState(),

        actions: {
          ...electionSliceActions.actions,
          ...campaignSlice.actions,
          ...legislationSlice.actions,
          ...uiSliceData.actions,
          ...politicianSliceData.actions,
          ...campaignSetupSlice.actions,
          ...policySlice,
          ...timeSlice.actions,
          ...newsSlice.actions,
          ...campaignStaffSlice,

          improveSkillOratory: () => {
            set((state) => {
              if (!state.activeCampaign || !state.activeCampaign.politician) {
                console.warn(
                  "[Action] Improve Oratory: No active campaign or politician."
                );
                // TODO: UI Feedback: "No active campaign."
                return {};
              }

              const cost = 500; // Cost for the oratory training
              const currentTreasury = state.activeCampaign.treasury || 0;
              const currentAttributes =
                state.activeCampaign.politician.attributes;
              const currentOratory = currentAttributes?.oratory || 0;
              const MAX_ATTRIBUTE_LEVEL = 10; // Define a max level for attributes

              if (currentOratory >= MAX_ATTRIBUTE_LEVEL) {
                console.log(
                  "[Action] Improve Oratory: Oratory skill is already at maximum."
                );
                // TODO: UI Feedback: "Your Oratory skill is already maxed out!"
                return {}; // No change if already maxed
              }

              if (currentTreasury < cost) {
                console.warn(
                  `[Action] Improve Oratory: Not enough personal funds. Need $${cost}, have $${currentTreasury}`
                );
                // TODO: UI Feedback: "Not enough funds for oratory training."
                return {};
              }

              // Simulate training: ~70% chance of success for a +1 increase
              const didImprove = Math.random() < 0.7;
              let newOratory = currentOratory;
              //let feedbackMessage = `You spent $${cost} on oratory coaching. `;

              if (didImprove) {
                newOratory = Math.min(MAX_ATTRIBUTE_LEVEL, currentOratory + 1);
                //feedbackMessage += `Your Oratory skill increased to ${newOratory}!`;
                console.log(
                  `[Action] Oratory skill improved from ${currentOratory} to ${newOratory}.`
                );
              } else {
                //feedbackMessage +=
                ("You didn't feel much improvement this time.");
                console.log(
                  `[Action] Oratory skill training had no effect this time.`
                );
              }
              // TODO: Show feedbackMessage in the UI

              return {
                activeCampaign: {
                  ...state.activeCampaign,
                  treasury: currentTreasury - cost,
                  politician: {
                    ...state.activeCampaign.politician,
                    attributes: {
                      ...currentAttributes,
                      oratory: newOratory,
                    },
                  },
                },
              };
            });
          },

          networkWithParty: () => {
            set((state) => {
              if (!state.activeCampaign || !state.activeCampaign.politician) {
                console.warn(
                  "Network With Party: No active campaign or politician."
                );
                return {};
              }
              if (
                !state.activeCampaign.partyInfo ||
                state.activeCampaign.partyInfo.type === "independent"
              ) {
                console.warn(
                  "Network With Party: Player is Independent or no party info."
                );
                // TODO: UI Feedback: "You are not affiliated with a party to network with."
                return {};
              }

              // For now, just log. Later, this could improve party standing, take time, or have small cost.
              console.log(
                `[Career Action] Networking with officials from ${
                  state.activeCampaign.partyInfo.name || "your party"
                }.`
              );
              // TODO: UI Feedback: "You spent the day networking with party members."
              // Example: could slightly increase partySupport or unlock future interactions
              return state; // No direct state change yet other than console log
            });
          },

          makePublicAppearance: () => {
            set((state) => {
              if (!state.activeCampaign) {
                console.warn("Make Public Appearance: No active campaign.");
                return {};
              }
              const cost = 100; // Small cost for logistics, travel etc.
              const currentTreasury = state.activeCampaign.treasury || 0;

              if (currentTreasury < cost) {
                console.warn(
                  `Make Public Appearance: Not enough personal funds. Need $${cost}, have $${currentTreasury}`
                );
                // TODO: UI Feedback
                return {};
              }

              // For now, just log. Later, this could give a small, temporary local approval boost.
              const approvalBoost = getRandomInt(0, 1); // 0 to +1% approval
              const newApproval = Math.min(
                100,
                (state.activeCampaign.playerApproval || 0) + approvalBoost
              );

              console.log(
                `[Career Action] Made a public appearance. Cost: $${cost}. Approval change: +${approvalBoost}%`
              );
              // TODO: UI Feedback: "Your recent public appearance was well-received!"
              return {
                activeCampaign: {
                  ...state.activeCampaign,
                  treasury: currentTreasury - cost,
                  playerApproval: newApproval,
                },
              };
            });
          },

          // ---- Actions to be moved to campaignSetupSlice ----
          initializeNewCampaignSetup: (
            politicianId,
            targetCountryId = "JPN"
          ) => {
            set({ currentCampaignSetup: getInitialCampaignSetupState() }); // Reset local state
            get().actions.setSelectedPoliticianForSetup(politicianId); // Call action (will be in campaignSetupSlice)
            get().actions.selectCountryForCampaign(targetCountryId); // Call action (will be in campaignSetupSlice)
            get().actions.navigateTo("CampaignSetupScreen"); // Call UI slice action
          },
          setSelectedPoliticianForSetup: (
            politicianId // To campaignSetupSlice
          ) =>
            set((state) => ({
              currentCampaignSetup: {
                ...state.currentCampaignSetup,
                selectedPoliticianId: politicianId,
              },
            })),
          selectCountryForCampaign: (countryId) => {
            set((state) => ({
              currentCampaignSetup: {
                ...state.currentCampaignSetup,
                selectedCountryId: countryId,
                selectedRegionId: null,
              },
            }));
          },
          setSelectedRegion: (regionId) => {
            set((state) => {
              if (!regionId) {
                // Handle clearing the region
                return {
                  currentCampaignSetup: {
                    ...state.currentCampaignSetup,
                    selectedRegionId: null,
                    regionPoliticalLandscape: [],
                  },
                };
              }

              const selectedCountry = state.availableCountries.find(
                (c) => c.id === state.currentCampaignSetup.selectedCountryId
              );

              // Find the region that was already processed
              const regionData = selectedCountry?.regions?.find(
                (r) => r.id === regionId
              );

              return {
                currentCampaignSetup: {
                  ...state.currentCampaignSetup,
                  selectedRegionId: regionId,
                  // Set the landscape from the data we already generated
                  regionPoliticalLandscape:
                    regionData?.politicalLandscape || [],
                },
              };
            });
          },

          choosePlayerParty: (
            partyChoice // To campaignSetupSlice
          ) =>
            set((state) => ({
              currentCampaignSetup: {
                ...state.currentCampaignSetup,
                playerPartyChoice: partyChoice,
              },
            })),
          startCampaign: () => {
            // To campaignSetupSlice / orchestrator
            const setup = get().currentCampaignSetup;
            if (
              setup.selectedPoliticianId &&
              setup.selectedCountryId &&
              setup.selectedRegionId &&
              setup.playerPartyChoice &&
              (setup.playerPartyChoice.type || setup.playerPartyChoice.id)
            ) {
              get().actions.navigateTo("LocalAreaSetupScreen"); // from uiSlice
            } else {
              console.log(setup);
              console.error("Campaign setup incomplete");
            }
          },
          // ---- Actions to be moved to dataSlice ----
          loadCountries: (countriesData) =>
            set({ availableCountries: countriesData }),

          clearViewingElectionNightContext: () => {
            // Called by uiSlice if modal is dismissed
            set((state) => ({
              activeCampaign: state.activeCampaign
                ? { ...state.activeCampaign, viewingElectionNightForDate: null }
                : null,
            }));
          },
        },
      };
    },
    {
      name: "stateos-game-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeThemeName: state.activeThemeName,
        savedPoliticians: state.savedPoliticians,
      }),
      onRehydrateStorage: () => {
        return (hydratedState, error) => {
          if (error) {
            console.error("Zustand: Error during rehydration:", error);
          } else if (hydratedState) {
            console.log(
              "Zustand: Rehydration finished. Persisted activeThemeName:",
              hydratedState.activeThemeName
            );
          } else {
            console.log(
              "Zustand: No persisted state found or state was empty."
            );
          }
        };
      },
    }
  )
);

const initialThemeAction = useGameStore.getState().actions.applyInitialTheme;
if (initialThemeAction) {
  console.log("Store.js: Applying initial or persisted theme via action.");
  initialThemeAction();
}

const resetPoliticianAction =
  useGameStore.getState().actions.resetCreatingPolitician;
const politicianToEditIdFromStore = useGameStore.getState().politicianToEditId;

if (resetPoliticianAction && !politicianToEditIdFromStore) {
  console.log("Store.js: Resetting creating politician state.");
  resetPoliticianAction();
} else if (politicianToEditIdFromStore) {
  console.log(
    "Store.js: Politician edit in progress, not resetting creation form."
  );
} else {
  console.warn("Store.js: resetCreatingPolitician action not found.");
}

console.log("Store.js: Initial store setup actions complete.");

export default useGameStore;
