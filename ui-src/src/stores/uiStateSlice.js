// ui-src/src/stores/uiStateSlice.js
import { themes, defaultTheme } from "../themes";
import { generateId } from "../utils/core";
import { rehydratePolitician } from "../entities/personnel";

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
  viewingStateId: null,
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
  isCommitteeMeetingModalOpen: false,
  currentCommitteeMeeting: null,

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

    navigateToStateDetails: (stateId) => {
      set({ viewingStateId: stateId });
      get().actions.navigateTo("StateDetailsScreen");
    },

    // UPDATE navigateBack to clear viewing IDs
    navigateBack: () =>
      set((state) => ({
        currentScene: state.previousScene || "MainMenu", // Uses stored scene to go back
        previousScene: null, // Clears the previous scene
        viewingCountryId: null, // Ensure this is cleared when navigating back
        viewingStateId: null, // Ensure this is cleared when navigating back
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

        
        // Try to get the complete politician data from SoA store first
        let fullPolitician = politician;
        
        if (state.activeCampaign?.politicians && politician.id) {
          const rehydratedPolitician = rehydratePolitician(politician.id, state.activeCampaign.politicians);
          if (rehydratedPolitician) {
            fullPolitician = rehydratedPolitician;
            console.log(`Successfully rehydrated politician ${politician.id} for modal`);
          } else {
            console.warn(`Failed to rehydrate politician ${politician.id}, using original data`);
          }
        }

        // If rehydration failed or party data is still corrupted, fix party data manually
        if (fullPolitician.partyId && fullPolitician.partyId !== "independent" && fullPolitician.partyName === "Independent") {
          const allParties = [
            ...(state.activeCampaign.generatedPartiesSnapshot || []),
            ...(state.activeCampaign.customPartiesSnapshot || []),
          ];
          const partyDetails = allParties.find(p => p.id === fullPolitician.partyId);
          
          if (partyDetails) {
            fullPolitician = {
              ...fullPolitician,
              partyName: partyDetails.name,
              partyColor: partyDetails.color,
            };
            console.log(`Fixed party data for politician ${politician.id}: ${partyDetails.name}`);
          }
        }

        // Set the complete politician object into state for the modal to display
        return {
          isViewPoliticianModalOpen: true,
          viewingPolitician: fullPolitician,
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
      if (!votesToQueue || votesToQueue.length === 0) return;

      set({ voteQueue: votesToQueue });
    },

    // UPDATED: This now specifically opens the LiveVoteSession overlay
    startVotingSession: () => {
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

    setupElectionNightDetails: (electionDate) => {
      set((state) => ({
        activeCampaign: state.activeCampaign
          ? { ...state.activeCampaign, viewingElectionNightForDate: electionDate }
          : null,
      }));
    },

    clearViewingElectionNightContext: () => {
      set((state) => ({
        activeCampaign: state.activeCampaign
          ? { ...state.activeCampaign, viewingElectionNightForDate: null }
          : null,
      }));
    },
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

    openBillDetailsModal: (bill) => {
      set({
        isBillDetailsModalOpen: true,
        viewingBillDetails: bill,
      });
    },

    closeBillDetailsModal: () => {
      set({
        isBillDetailsModalOpen: false,
        viewingBillDetails: null,
      });
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
    
    openCommitteeMeetingModal: (meeting) => {
      set({
        isCommitteeMeetingModalOpen: true,
        currentCommitteeMeeting: meeting,
      });
    },
    
    closeCommitteeMeetingModal: () => {
      set({
        isCommitteeMeetingModalOpen: false,
        currentCommitteeMeeting: null,
      });
    },
  },
});
