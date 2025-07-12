// ui-src/src/stores/uiStateSlice.js
import { themes, defaultTheme } from "../themes";
import { generateId } from "../utils/generalUtils";

// Helper function to apply theme (can be kept here or moved to a more general UI util)
const applyThemeToDocument = (themeNameInput) => {
  const themeToApply = themes[themeNameInput] || themes[defaultTheme];
  if (themeToApply) {
    if (themeToApply.colors) {
      Object.keys(themeToApply.colors).forEach((key) =>
        document.documentElement.style.setProperty(
          key,
          themeToApply.colors[key]
        )
      );
    }
    if (themeToApply.fonts) {
      Object.keys(themeToApply.fonts).forEach((key) =>
        document.documentElement.style.setProperty(key, themeToApply.fonts[key])
      );
    }
    if (themeToApply.styles) {
      Object.keys(themeToApply.styles).forEach((key) =>
        document.documentElement.style.setProperty(
          key,
          themeToApply.styles[key]
        )
      );
    }
  } else {
    console.warn(
      `applyThemeToDocument (uiStateSlice): Theme "${themeNameInput}" not found, applying default.`
    );
    if (themes[defaultTheme]) applyThemeToDocument(defaultTheme); // Apply default if current is invalid
  }
};

export const createUISlice = (set, get) => ({
  // State owned by this slice
  currentScene: "MainMenu",
  availableThemes: themes, // Make themes available via store if needed, or components can import directly
  activeThemeName: defaultTheme,
  activeMainGameTab: "Dashboard",
  showElectionDayModal: false,
  electionsForModal: [], // Data for the election day modal
  isAdvancingToNextElection: false,
  isWinnerAnnouncementModalOpen: false, // <<<< NEW: For this modal
  winnerAnnouncementData: null,
  toasts: [],

  // Actions primarily managing UI state
  navigateTo: (sceneName) => set({ currentScene: sceneName }),

  setActiveTheme: (themeName) => {
    if (get().availableThemes[themeName]) {
      set({ activeThemeName: themeName });
      applyThemeToDocument(themeName);
    } else {
      console.warn(
        `setActiveTheme (uiStateSlice): Theme "${themeName}" not found.`
      );
    }
  },

  setActiveMainGameTab: (tabName) => set({ activeMainGameTab: tabName }),

  openElectionDayModal: (electionsDetails) => {
    console.log("[UISlice] Opening election day modal for:", electionsDetails);
    // This action should also tell the campaignSlice to set `viewingElectionNightForDate`
    // This requires careful handling of inter-slice communication or a more orchestrating action.
    // For now, we set the modal state. `advanceDay` in campaignSlice will set `viewingElectionNightForDate`.
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
          // Call election processing from electionSlice (which is part of campaignSlice or main store)
          if (get().actions?.processElectionResults) {
            // Check if action exists
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
    // Signal campaignSlice to clear its context if needed
    get().actions?.clearViewingElectionNightContext?.(); // Example of calling another slice's action
  },

  viewElectionResultsAndNavigate: () => {
    // `viewingElectionNightForDate` is set by campaignSlice's advanceDay.
    // This action just handles the UI transition.
    const contextDate = get().activeCampaign?.viewingElectionNightForDate;
    console.log(
      "[UISlice] Navigating to Election Night Screen. Context date:",
      contextDate
    );
    set({
      showElectionDayModal: false, // Close modal if open
      electionsForModal: [], // Clear modal specific data
      currentScene: "ElectionNightScreen", // Navigate
    });
  },

  setIsAdvancingToNextElection: (isAdvancing) =>
    set({ isAdvancingToNextElection: isAdvancing }),

  // Initial theme application (to be called once when store initializes)
  applyInitialTheme: () => {
    applyThemeToDocument(get().activeThemeName);
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
    // toast is an object like { message: string, type: 'success' | 'error' | 'info', duration?: number }
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
    // proposalData should be the specific proposal object from legislationSlice.proposedLegislation
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
});
