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
import { createOrganizationActionSlice } from "./stores/organizationActionSlice.js";
import { createCustomEntitySlice } from "./stores/customEntitySlice.js";
import { createPersonnelSlice } from "./stores/personnelSlice.js";

// --- Helper Functions (to be moved to relevant slices or utils later) ---

// Will move to campaignSetupSlice
const getInitialCampaignSetupState = () => ({
  selectedPoliticianId: null,
  selectedCountryId: null,
  selectedRegionId: null,
  selectedSecondAdminRegionId: null,
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
      const organizationActions = createOrganizationActionSlice(set, get);
      const customEntitySlice = createCustomEntitySlice(set, get);
      const personnelSlice = createPersonnelSlice(set, get);

      return {
        creatingPolitian: politicianSliceData.creatingPolitician,
        savedPoliticians: politicianSliceData.savedPoliticians,
        activeCampaign: campaignSlice.activeCampaign,
        proposedLegislation: legislationSlice.proposedLegislation,
        activeLegislation: legislationSlice.activeLegislation,
        availablePoliciesForProposal:
          legislationSlice.availablePoliciesForProposal,

        isVotingSessionActive: uiSliceData.isVotingSessionActive,
        activeVotingSessionBillId: uiSliceData.activeVotingSessionBillId,
        viewingBillDetails: uiSliceData.viewingBillDetails,
        isBillDetailsModalOpen: uiSliceData.isBillDetailsModalOpen,
        isAdvancingToNextElection: uiSliceData.isAdvancingToNextElection,
        showElectionDayModal: uiSliceData.showElectionDayModal,
        electionsForModal: uiSliceData.electionsForModal,
        viewingPolitician: uiSliceData.viewingPolitician,
        isViewPoliticianModalOpen: uiSliceData.isViewPoliticianModalOpen,
        voteQueue: uiSliceData.voteQueue,

        availableCountries: [],
        toasts: [],
        availableThemes: uiSliceData.availableThemes, // Themes now managed by uiSlice
        activeThemeName: uiSliceData.activeThemeName, //
        newsItems: newsSlice.newsItems,

        allCustomParties: customEntitySlice.allCustomParties,
        savedElectionSetups: customEntitySlice.savedElectionSetups,
        politicianRelationships: personnelSlice.politicianRelationships,

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
          ...organizationActions,
          ...customEntitySlice.actions,
          ...personnelSlice.actions,

          improveSkillOratory: () => {
            set((state) => {
              if (!state.activeCampaign?.politician) return {};
              const cost = 500;
              const currentPolitician = state.activeCampaign.politician;
              const currentTreasury = currentPolitician.treasury || 0;
              const currentOratory = currentPolitician.attributes?.oratory || 0;
              const MAX_ATTRIBUTE_LEVEL = 10;

              if (currentOratory >= MAX_ATTRIBUTE_LEVEL) return {}; // Already maxed
              if (currentTreasury < cost) return {}; // Not enough funds

              const didImprove = Math.random() < 0.7;
              const newOratory = didImprove
                ? Math.min(MAX_ATTRIBUTE_LEVEL, currentOratory + 1)
                : currentOratory;

              get().actions.addToast?.({
                message: didImprove
                  ? `Your Oratory skill increased to ${newOratory}!`
                  : `You spent $${cost} on coaching, but didn't feel much improvement.`,
                type: didImprove ? "success" : "info",
              });

              return {
                activeCampaign: {
                  ...state.activeCampaign,
                  politician: {
                    ...currentPolitician,
                    treasury: currentTreasury - cost,
                    attributes: {
                      ...currentPolitician.attributes,
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
              if (!state.activeCampaign?.politician) return {};
              const cost = 100;
              const currentPolitician = state.activeCampaign.politician;
              const currentTreasury = currentPolitician.treasury || 0;
              const campaignActionToday = currentPolitician.campaignActionToday;

              if (campaignActionToday) {
                get().actions.addToast?.({
                  message: "You have already taken a major action today.",
                  type: "info",
                });
                return {};
              }
              if (currentTreasury < cost) {
                get().actions.addToast?.({
                  message: `Not enough funds. Need $${cost}.`,
                  type: "error",
                });
                return {};
              }

              const approvalBoost = getRandomInt(0, 1);
              const newApproval = Math.min(
                100,
                (currentPolitician.approvalRating || 0) + approvalBoost
              );

              get().actions.addToast?.({
                message: `Your public appearance was well-received, costing $${cost}.`,
                type: "success",
              });

              return {
                activeCampaign: {
                  ...state.activeCampaign,
                  politician: {
                    ...currentPolitician,
                    treasury: currentTreasury - cost,
                    approvalRating: newApproval,
                    campaignActionToday: true, // Mark that an action was taken
                  },
                },
              };
            });
          },

          // ---- Actions to be moved to campaignSetupSlice ----
          initializeNewCampaignSetup: (politicianId) => {
            set({ currentCampaignSetup: getInitialCampaignSetupState() }); // Reset setup state
            get().actions.setSelectedPoliticianForSetup(politicianId); // Set the chosen politician
            get().actions.navigateTo("CampaignSetupScreen"); // Navigate to the setup screen
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
                generatedPartiesInCountry: countryId
                  ? state.currentCampaignSetup.generatedPartiesInCountry
                  : [],
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

          setSelectedSecondAdminRegion: (regionId) => {
            set((state) => ({
              currentCampaignSetup: {
                ...state.currentCampaignSetup,
                selectedSecondAdminRegionId: regionId,
              },
            }));
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
            const setup = get().currentCampaignSetup;

            // Find the full country object from your available data
            const selectedCountryData = get().availableCountries.find(
              (c) => c.id === setup.selectedCountryId
            );

            // Determine if this country requires a second-level admin region selection
            const hasSecondAdminRegions =
              selectedCountryData?.secondAdminRegions?.length > 0;

            // Check the base requirements first
            const baseRequirementsMet =
              setup.selectedPoliticianId &&
              setup.selectedCountryId &&
              setup.selectedRegionId &&
              setup.playerPartyChoice &&
              (setup.playerPartyChoice.type || setup.playerPartyChoice.id);
            const secondAdminRegionRequirementMet =
              !hasSecondAdminRegions ||
              (hasSecondAdminRegions && setup.selectedSecondAdminRegionId);

            if (baseRequirementsMet && secondAdminRegionRequirementMet) {
              get().actions.navigateTo("LocalAreaSetupScreen");
            } else {
              console.error("Campaign setup incomplete", {
                setup,
                baseRequirementsMet,
                secondAdminRegionRequirementMet,
              });
              get().actions.addToast({
                id: `setup-incomplete-${Date.now()}`,
                message: "Please complete all required setup selections.",
                type: "error",
              });
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
