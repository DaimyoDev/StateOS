// ui-src/src/stores/uiStateSlice.js
import { themes, defaultTheme } from "../themes";
import { generateId } from "../utils/core";

const applyThemeToDocument = (themeData) => {
  if (!themeData) return;
  if (themeData.colors)
    Object.keys(themeData.colors).forEach((key) =>
      document.documentElement.style.setProperty(key, themeData.colors[key])
    );
  if (themeData.fonts)
    Object.keys(themeData.fonts).forEach((key) =>
      document.documentElement.style.setProperty(key, themeData.fonts[key])
    );
  if (themeData.styles)
    Object.keys(themeData.styles).forEach((key) =>
      document.documentElement.style.setProperty(key, themeData.styles[key])
    );
};

export const createUISlice = (set, get) => ({
  // --- STATE ---
  currentScene: "MainMenu",
  previousScene: null, // NEW: To track where navigation came from
  availableThemes: themes,
  activeThemeName: defaultTheme,
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
  themeToEdit: null,

  // --- ACTIONS ---
  actions: {
    // UPDATED: navigateTo now stores the previous scene before changing to the new one.
    navigateTo: (sceneName) =>
      set((state) => {
        // Avoid pushing the same scene onto the stack twice
        if (state.currentScene === sceneName) return {};
        return {
          previousScene: state.currentScene,
          currentScene: sceneName,
        };
      }),

    // NEW: navigateBack uses the stored previousScene to go back one step.
    navigateBack: () =>
      set((state) => ({
        currentScene: state.previousScene || "MainMenu", // Fallback to MainMenu
        previousScene: null, // Clear the previous scene after going back
      })),

    setActiveTheme: (themeName) => {
      set((state) => {
        const themeToSet = state.availableThemes[themeName];
        if (themeToSet) {
          applyThemeToDocument(themeToSet);
          return { activeThemeName: themeName };
        }
        return {};
      });
    },

    addOrUpdateTheme: (themeKey, themeData) => {
      set((state) => ({
        availableThemes: { ...state.availableThemes, [themeKey]: themeData },
      }));
      get().actions.setActiveTheme(themeKey);
    },

    deleteTheme: (themeKey) => {
      set((state) => {
        const newAvailableThemes = { ...state.availableThemes };
        delete newAvailableThemes[themeKey];
        const newActiveThemeName =
          state.activeThemeName === themeKey
            ? defaultTheme
            : state.activeThemeName;
        return {
          availableThemes: newAvailableThemes,
          activeThemeName: newActiveThemeName,
        };
      });
      get().actions.setActiveTheme(get().activeThemeName);
    },

    editTheme: (themeKey) => {
      set((state) => ({
        themeToEdit: themeKey ? state.availableThemes[themeKey] : null,
        currentScene: "ThemeCreatorEditor",
      }));
    },

    clearThemeToEdit: () => set({ themeToEdit: null }),

    setActiveMainGameTab: (tabName) => set({ activeMainGameTab: tabName }),

    openElectionDayModal: (electionsDetails) =>
      set({
        showElectionDayModal: true,
        electionsForModal: electionsDetails || [],
      }),

    closeElectionDayModal: () => {
      const electionsToProcess = get().electionsForModal;
      if (electionsToProcess?.length > 0) {
        electionsToProcess.forEach((election) => {
          if (election?.id && get().actions?.processElectionResults) {
            get().actions.processElectionResults(election.id);
          }
        });
      }
      set({ showElectionDayModal: false, electionsForModal: [] });
      get().actions?.clearViewingElectionNightContext?.();
    },

    viewElectionResultsAndNavigate: () =>
      set({
        showElectionDayModal: false,
        electionsForModal: [],
        currentScene: "ElectionNightScreen",
      }),

    setIsAdvancingToNextElection: (isAdvancing) =>
      set({ isAdvancingToNextElection: isAdvancing }),

    applyInitialTheme: () => {
      const activeThemeName = get().activeThemeName;
      const themeData =
        get().availableThemes[activeThemeName] ||
        get().availableThemes[defaultTheme];
      applyThemeToDocument(themeData);
    },

    openViewPoliticianModal: (politicianData) =>
      set({
        viewingPolitician: politicianData,
        isViewPoliticianModalOpen: true,
      }),
    closeViewPoliticianModal: () =>
      set({ viewingPolitician: null, isViewPoliticianModalOpen: false }),
    openWinnerAnnouncementModal: (data) =>
      set({
        isWinnerAnnouncementModalOpen: true,
        winnerAnnouncementData: data,
      }),
    closeWinnerAnnouncementModal: () =>
      set({
        isWinnerAnnouncementModalOpen: false,
        winnerAnnouncementData: null,
      }),

    addToast: (toast) => {
      const newToast = { id: generateId(), duration: 3000, ...toast };
      set((state) => ({ toasts: [...state.toasts, newToast] }));
    },

    removeToast: (toastId) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== toastId),
      })),

    openPolicyVoteDetailsModal: (proposalData) =>
      set({
        isPolicyVoteDetailsModalOpen: true,
        policyVoteDetailsData: proposalData,
      }),
    closePolicyVoteDetailsModal: () =>
      set({ isPolicyVoteDetailsModalOpen: false, policyVoteDetailsData: null }),
    setViewedEntity: (id, type) => set({ viewedEntity: { id, type } }),
    clearViewedEntity: () => set({ viewedEntity: { id: null, type: null } }),
  },
});
