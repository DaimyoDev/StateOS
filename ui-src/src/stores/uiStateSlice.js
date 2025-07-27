// ui-src/src/stores/uiStateSlice.js
import { themes, defaultTheme } from "../themes"; //
import { generateId } from "../utils/core";

// Helper function to apply theme (can be kept here or moved to a more general UI util)
const applyThemeToDocument = (themeData) => {
  // Changed to accept themeData directly
  if (!themeData) {
    console.warn(
      `applyThemeToDocument (uiStateSlice): No theme data provided.`
    );
    return;
  }

  if (themeData.colors) {
    Object.keys(themeData.colors).forEach((key) =>
      document.documentElement.style.setProperty(key, themeData.colors[key])
    );
  }
  if (themeData.fonts) {
    Object.keys(themeData.fonts).forEach((key) =>
      document.documentElement.style.setProperty(key, themeData.fonts[key])
    );
  }
  if (themeData.styles) {
    Object.keys(themeData.styles).forEach((key) =>
      document.documentElement.style.setProperty(key, themeData.styles[key])
    );
  }
};

export const createUISlice = (set, get) => ({
  // State owned by this slice
  currentScene: "MainMenu",
  availableThemes: themes, // Initializing with predefined themes
  activeThemeName: defaultTheme, // Setting default active theme
  activeMainGameTab: "Dashboard",
  showElectionDayModal: false,
  electionsForModal: [],
  isAdvancingToNextElection: false,
  isWinnerAnnouncementModalOpen: false,
  winnerAnnouncementData: null,
  toasts: [],
  viewingPolitician: null,
  isViewPoliticianModalOpen: false,
  isPolicyVoteDetailsModalOpen: false,
  policyVoteDetailsData: null,
  themeToEdit: null, // NEW: State to hold the theme being edited

  actions: {
    navigateTo: (sceneName) => set({ currentScene: sceneName }),

    setActiveTheme: (themeName) => {
      set((state) => {
        const themeToSet = state.availableThemes[themeName];
        if (themeToSet) {
          applyThemeToDocument(themeToSet);
          return { activeThemeName: themeName };
        } else {
          console.warn(
            `setActiveTheme (uiStateSlice): Theme "${themeName}" not found. Applying default.`
          );
          const defaultThemeData = state.availableThemes[defaultTheme]; //
          if (defaultThemeData) {
            applyThemeToDocument(defaultThemeData);
            return { activeThemeName: defaultTheme }; //
          }
          return {}; // No change if default theme also not found (shouldn't happen)
        }
      });
    },

    // Action to add or update a theme
    addOrUpdateTheme: (themeKey, themeData) => {
      set((state) => ({
        availableThemes: {
          ...state.availableThemes,
          [themeKey]: themeData,
        },
      }));
      // Automatically set the newly added/updated theme as active
      get().actions.setActiveTheme(themeKey);
    },

    // Action to delete a theme
    deleteTheme: (themeKey) => {
      set((state) => {
        const newAvailableThemes = { ...state.availableThemes };
        delete newAvailableThemes[themeKey];

        let newActiveThemeName = state.activeThemeName;
        // If the deleted theme was active, switch to default
        if (newActiveThemeName === themeKey) {
          newActiveThemeName = defaultTheme; //
        }

        return {
          availableThemes: newAvailableThemes,
          activeThemeName: newActiveThemeName,
        };
      });
      // Apply the new active theme (or default)
      get().actions.setActiveTheme(get().activeThemeName);
    },

    // NEW ACTION: Set a theme for editing and navigate
    editTheme: (themeKey) => {
      set((state) => ({
        // If themeKey is null, it means we are creating a new theme
        themeToEdit: themeKey ? state.availableThemes[themeKey] : null,
        currentScene: "ThemeCreatorEditor",
      }));
    },
    // NEW ACTION: Clear the theme being edited state (e.g., when returning from editor)
    clearThemeToEdit: () => set({ themeToEdit: null }),

    setActiveMainGameTab: (tabName) => set({ activeMainGameTab: tabName }),

    openElectionDayModal: (electionsDetails) => {
      console.log(
        "[UISlice] Opening election day modal for:",
        electionsDetails
      );
      set({
        showElectionDayModal: true,
        electionsForModal: electionsDetails || [],
      });
    },

    closeElectionDayModal: () => {
      console.log("[UISlice] Closing election day modal (Dismiss).");
      const electionsToProcess = get().electionsForModal;

      if (electionsToProcess && electionsToProcess.length > 0) {
        electionsToProcess.forEach((electionInModal) => {
          if (electionInModal && electionInModal.id) {
            if (get().actions?.processElectionResults) {
              get().actions.processElectionResults(electionInModal.id);
            } else {
              console.error(
                "UISlice: processElectionResults action not found. Ensure it's part of the main store actions or accessible via get()."
              );
            }
          }
        });
      }
      set({
        showElectionDayModal: false,
        electionsForModal: [],
      });
      get().actions?.clearViewingElectionNightContext?.();
    },

    viewElectionResultsAndNavigate: () => {
      const contextDate = get().activeCampaign?.viewingElectionNightForDate;
      console.log(
        "[UISlice] Navigating to Election Night Screen. Context date:",
        contextDate
      );
      set({
        showElectionDayModal: false,
        electionsForModal: [],
        currentScene: "ElectionNightScreen",
      });
    },

    setIsAdvancingToNextElection: (isAdvancing) =>
      set({ isAdvancingToNextElection: isAdvancing }),

    // Initial theme application (to be called once when store initializes)
    applyInitialTheme: () => {
      // Use the activeThemeName from the store after rehydration
      const activeThemeNameFromStore = get().activeThemeName;
      const themeDataToApply =
        get().availableThemes[activeThemeNameFromStore] ||
        get().availableThemes[defaultTheme]; //
      applyThemeToDocument(themeDataToApply);
    },
    openViewPoliticianModal: (politicianData) => {
      if (politicianData) {
        console.log("Opening politician view modal for:", politicianData.name);
        set({
          viewingPolitician: politicianData,
          isViewPoliticianModalOpen: true,
        });
      } else {
        console.warn("openViewPoliticianModal called with no politicianData.");
      }
    },

    closeViewPoliticianModal: () => {
      console.log("[UISlice] Closing ViewPoliticianModal.");
      set({
        viewingPolitician: null,
        isViewPoliticianModalOpen: false,
      });
    },
    openWinnerAnnouncementModal: (data) => {
      console.log("[UISlice] Opening Winner Announcement Modal for:", data);
      set({
        isWinnerAnnouncementModalOpen: true,
        winnerAnnouncementData: data,
      });
    },

    closeWinnerAnnouncementModal: () => {
      console.log("[UISlice] Closing Winner Announcement Modal.");
      set({
        isWinnerAnnouncementModalOpen: false,
        winnerAnnouncementData: null, // Clear the data when closing
      });
    },
    addToast: (toast) => {
      const newToast = {
        id: generateId(), // Generate a unique ID for each toast
        duration: 3000, // Default duration
        ...toast, // Spread incoming toast properties (message, type, optional duration)
      };
      set((state) => ({ toasts: [...state.toasts, newToast] }));
    },

    removeToast: (toastId) => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== toastId),
      }));
    },
    openPolicyVoteDetailsModal: (proposalData) => {
      console.log(
        "[UISlice] Opening Policy Vote Details Modal for:",
        proposalData?.policyName
      );
      set({
        isPolicyVoteDetailsModalOpen: true,
        policyVoteDetailsData: proposalData,
      });
    },

    closePolicyVoteDetailsModal: () => {
      set({
        isPolicyVoteDetailsModalOpen: false,
        policyVoteDetailsData: null,
      });
    },
    setViewedEntity: (id, type) => {
      set({ viewedEntity: { id, type } });
    },

    clearViewedEntity: () => {
      set({ viewedEntity: { id: null, type: null } });
    },
  },
});
