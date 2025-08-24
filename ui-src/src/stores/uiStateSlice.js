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
  activeVotingSessionDetails: null, // { billId, level }
  viewingBillDetails: null,
  isBillDetailsModalOpen: false,
  voteQueue: [],
  isPolicyVoteDetailsModalOpen: false,
  viewingVoteDetailsForBill: null,
  viewingArticleId: null,
  isArticleModalOpen: false,
  donationEntity: null,
  isDonationModalOpen: false,
  isBillAuthoringModalOpen: false,
  billAuthoringMode: 'new', // 'new', 'amend', 'repeal'
  billAuthoringTargetLaw: null,

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

    openViewPoliticianModal: (politician) => {
      set((state) => {
        if (!politician) return state;

        // --- THIS IS THE FIX ---
        // Get the full list of parties from the active campaign
        const allParties = [
          ...(state.activeCampaign.generatedPartiesSnapshot || []),
          ...(state.activeCampaign.customPartiesSnapshot || []),
        ];
        const partiesMap = new Map(allParties.map((p) => [p.id, p]));

        // Find the politician's party details using their partyId
        const partyDetails = partiesMap.get(politician.partyId);

        // Create an "enriched" politician object with the party name and color
        const enrichedPolitician = {
          ...politician,
          partyName: partyDetails?.name || "Independent",
          partyColor: partyDetails?.color || "#888888",
        };
        // --- END OF FIX ---

        // Set the enriched object into state for the modal to display
        return {
          isViewPoliticianModalOpen: true,
          viewingPolitician: enrichedPolitician,
        };
      });
    },
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
    startVotingQueue: (votesToQueue) => { // Expects [{ billId, level }]
      console.log('[VoteQueue] Starting queue with:', votesToQueue);
      if (!votesToQueue || votesToQueue.length === 0) return;

      set({ voteQueue: votesToQueue });
      get().actions.addToast({
        message: `Legislative session has begun. ${votesToQueue.length} bill(s) are up for a vote.`,
        type: "info",
      });
    },

    // UPDATED: This now specifically opens the LiveVoteSession overlay
    startVotingSession: () => {
      console.log('[VoteQueue] Starting session for next bill.');
      const queue = get().voteQueue;
      if (queue.length > 0) {
        set({
          isVotingSessionActive: true,
          activeVotingSessionDetails: queue[0], // Vote on the first bill in the queue { billId, level }
        });
      }
    },

    // UPDATED: This now processes the queue
    endVotingSession: () => {
      const { billId, level } = get().activeVotingSessionDetails;
      console.log(`[VoteQueue] Ending session for bill: ${billId}`);
      get().actions.finalizeBillVote(billId, level);

      const remainingQueue = get().voteQueue.filter(
        (vote) => vote.billId !== billId
      );

      if (remainingQueue.length > 0) {
        set({
          isVotingSessionActive: false,
          activeVotingSessionDetails: null,
          voteQueue: remainingQueue,
        });
      } else {
        set({
          isVotingSessionActive: false,
          activeVotingSessionDetails: null,
          voteQueue: [],
        });
      }
    },

    // NEW: Action for when the player chooses to skip viewing the vote
    skipAndProcessVote: (billIdToSkip, level) => {
      console.log(`[VoteQueue] Skipping and processing vote for bill: ${billIdToSkip}`);
      // Run AI votes and get the results back.
      const aiVotes = get().actions.runAllAIVotesForBill(billIdToSkip, level);
      // Finalize the bill with the AI votes.
      get().actions.finalizeBillVote(billIdToSkip, level, aiVotes);

      // Remove the processed vote from the queue.
      set((state) => ({
        voteQueue: state.voteQueue.filter(
          (vote) => vote.billId !== billIdToSkip
        ),
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
    openDonationModal: (entity) => {
      if (!entity) {
        console.error("Attempted to open donation modal without an entity.");
        return;
      }
      set({ isDonationModalOpen: true, donationEntity: entity });
    },
    closeDonationModal: () => {
      set({ isDonationModalOpen: false, donationEntity: null });
    },

    openBillAuthoringModal: (mode = 'new', targetLaw = null) => {
      set({
        isBillAuthoringModalOpen: true,
        billAuthoringMode: mode,
        billAuthoringTargetLaw: targetLaw,
      });
    },

    closeBillAuthoringModal: () => {
      set({
        isBillAuthoringModalOpen: false,
        billAuthoringMode: 'new',
        billAuthoringTargetLaw: null,
      });
    },
  },
});
