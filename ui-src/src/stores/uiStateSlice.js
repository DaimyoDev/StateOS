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
  themeToEdit: null,
  viewingCountryId: null,
  isLoadingGame: false,
  loadingMessage: "",
  isVotingSessionActive: false,
  activeVotingSessionBillId: null,
  viewingBillDetails: null,
  isBillDetailsModalOpen: false,
  voteQueue: [],
  isPolicyVoteDetailsModalOpen: false,
  viewingVoteDetailsForBill: null,
  viewingArticleId: null,
  isArticleModalOpen: false,

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

    navigateToCountryDetails: (countryId) => {
      set({ viewingCountryId: countryId });
      get().actions.navigateTo("CountryDetailsScreen");
    },

    // UPDATE navigateBack to clear the viewingCountryId
    navigateBack: () =>
      set((state) => ({
        currentScene: state.previousScene || "MainMenu", // Uses stored scene to go back
        previousScene: null, // Clears the previous scene
        viewingCountryId: null, // Ensure this is cleared when navigating back
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
    setViewedEntity: (id, type) => set({ viewedEntity: { id, type } }),
    clearViewedEntity: () => set({ viewedEntity: { id: null, type: null } }),
    setLoadingGame: (isLoading, message = "") =>
      set({ isLoadingGame: isLoading, loadingMessage: message }),
    startVotingQueue: (billIds) => {
      if (!billIds || billIds.length === 0) return;

      // Instead of forcing the session open, we just populate the queue
      // The UI will show an alert based on the queue having items.
      set({ voteQueue: billIds });
      // We can also trigger a toast notification here
      get().actions.addToast({
        message: `Legislative session has begun. ${billIds.length} bill(s) are up for a vote.`,
        type: "info",
      });
    },

    // UPDATED: This now specifically opens the LiveVoteSession overlay
    startVotingSession: () => {
      const queue = get().voteQueue;
      if (queue.length > 0) {
        set({
          isVotingSessionActive: true,
          activeVotingSessionBillId: queue[0], // Vote on the first bill in the queue
        });
      }
    },

    // UPDATED: This now processes the queue
    endVotingSession: () => {
      const currentBillId = get().activeVotingSessionBillId;
      get().actions.finalizeBillVote(currentBillId);

      const remainingQueue = get().voteQueue.filter(
        (id) => id !== currentBillId
      );

      if (remainingQueue.length > 0) {
        // There's another bill to vote on. Keep the alert up, but close the session view.
        set({
          isVotingSessionActive: false, // Close the current session view
          activeVotingSessionBillId: null,
          voteQueue: remainingQueue,
        });
        // You could automatically start the next vote here, or let the player initiate
      } else {
        // No more bills, end everything.
        set({
          isVotingSessionActive: false,
          activeVotingSessionBillId: null,
          voteQueue: [],
        });
      }
    },

    // NEW: Action for when the player chooses to skip viewing the vote
    skipAndProcessVote: (billIdToSkip) => {
      console.log(billIdToSkip);
      // This requires a helper function to run all AI votes instantly
      get().actions.runAllAIVotesForBill(billIdToSkip);
      get().actions.finalizeBillVote(billIdToSkip);

      set((state) => ({
        voteQueue: state.voteQueue.filter((id) => id !== billIdToSkip),
      }));
    },
    openBillDetailsModal: (bill) =>
      set({ viewingBillDetails: bill, isBillDetailsModalOpen: true }),
    closeBillDetailsModal: () =>
      set({ viewingBillDetails: null, isBillDetailsModalOpen: false }),
    openPolicyVoteDetailsModal: (bill) =>
      set({
        viewingVoteDetailsForBill: bill,
        isPolicyVoteDetailsModalOpen: true,
      }),
    closePolicyVoteDetailsModal: () =>
      set({
        viewingVoteDetailsForBill: null,
        isPolicyVoteDetailsModalOpen: false,
      }),
    clearVoteQueue: () => set({ voteQueue: [] }),
    viewArticle: (articleId) => {
      const article = get().newsItems.find((n) => n.id === articleId);
      if (article) {
        set({ viewingArticleId: articleId, isArticleModalOpen: true });
      } else {
        console.warn(`Article with ID ${articleId} not found.`);
      }
    },

    closeArticleModal: () => {
      set({ viewingArticleId: null, isArticleModalOpen: false });
    },
  },
});
