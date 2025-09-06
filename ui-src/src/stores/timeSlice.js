// ui-src/src/stores/timeSlice.js
import { isDateBefore, areDatesEqual, getRandomInt } from "../utils/core";
import {
  runMonthlyBudgetUpdate,
  runMonthlyStatUpdate,
  runMonthlyPlayerApprovalUpdate,
  runMonthlyPartyPopularityUpdate,
  runAIBillProposals,
  runMonthlyRegionalUpdates,
} from "../simulation/monthlyTick.js";
import { 
  shouldGenerateRandomEvent, 
  generateRandomEvent, 
  processRandomEvent 
} from "../simulation/randomEventsSystem.js";
import { simulateAICampaignDayForPolitician } from "../utils/aiUtils.js";
import { rehydrateLeanCampaigner } from "../entities/personnel.js";
import { pollingOptimizer } from "../General Scripts/OptimizedPollingFunctions.js";

const _updateCityStatsPure = (campaign, statUpdates) => {
  if (!campaign?.startingCity?.stats) return campaign;
  return {
    ...campaign,
    startingCity: {
      ...campaign.startingCity,
      stats: { ...campaign.startingCity.stats, ...statUpdates },
    },
  };
};

const areGameDatesEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  );
};

const _updateBudgetFiguresPure = (campaign, budgetUpdates) => {
  if (!budgetUpdates || !campaign?.startingCity?.stats?.budget) return campaign;
  return {
    ...campaign,
    startingCity: {
      ...campaign.startingCity,
      stats: {
        ...campaign.startingCity.stats,
        budget: { ...campaign.startingCity.stats.budget, ...budgetUpdates },
      },
    },
  };
};

const _updatePoliticalLandscapePure = (campaign, newLandscape) => {
  if (!campaign?.startingCity) return campaign;
  return {
    ...campaign,
    startingCity: {
      ...campaign.startingCity,
      politicalLandscape: newLandscape,
    },
  };
};

const _updatePlayerApprovalPure = (campaign, playerId, newApproval) => {
  if (newApproval === null || !campaign || !playerId) return campaign;

  const politicians = campaign.politicians;
  const stateData = politicians.state.get(playerId);
  if (!stateData) return campaign;

  const newStateMap = new Map(politicians.state);
  newStateMap.set(playerId, {
    ...stateData,
    approvalRating: newApproval,
  });

  return {
    ...campaign,
    politicians: { ...politicians, state: newStateMap },
  };
};

const _updateCountryPure = (campaign, updatedCountry) => {
  if (!updatedCountry || !campaign?.country) return campaign;
  return {
    ...campaign,
    country: updatedCountry,
  };
};

const _updateRegionsPure = (campaign, updatedRegions) => {
  if (!updatedRegions || !Object.keys(updatedRegions).length || !campaign?.regions) return campaign;
  const newRegions = campaign.regions.map(region => 
    updatedRegions[region.id] ? updatedRegions[region.id] : region
  );
  return {
    ...campaign,
    regions: newRegions,
  };
};

export const createTimeSlice = (set, get) => {
  return {
    isAdvancingToNextElection: false,

    actions: {
      processMonthlyUpdates: () => {
        set((state) => {
          let currentCampaign = { ...state.activeCampaign };
          if (!currentCampaign?.currentDate) return state;

          const playerPoliticianId = currentCampaign.playerPoliticianId;
          let collectedNewsThisMonth = [];

          // --- REFACTORED MONTHLY UPDATE PIPELINE ---

          // 1. Apply active legislation effects (this action calls its own `set`)
          get().actions.applyActiveLegislationEffects?.();
          currentCampaign = get().activeCampaign; // Re-fetch state
          if (!currentCampaign) return state;

          // 2. Recalculate Budget
          const budgetResult = runMonthlyBudgetUpdate(currentCampaign);
          if (budgetResult.budgetUpdates) {
            currentCampaign = _updateBudgetFiguresPure(
              currentCampaign,
              budgetResult.budgetUpdates
            );
          }
                    collectedNewsThisMonth.push(...budgetResult.newsItems);

          // 2.5 Recalculate Regional & National Budgets
          const regionalResult = runMonthlyRegionalUpdates(currentCampaign);
          if (regionalResult.updatedRegions) {
            currentCampaign = _updateRegionsPure(currentCampaign, regionalResult.updatedRegions);
          }
          if (regionalResult.updatedCountry) {
            currentCampaign = _updateCountryPure(currentCampaign, regionalResult.updatedCountry);
          }
          collectedNewsThisMonth.push(...regionalResult.newsItems);

          // 3. Simulate and update all city stats
          const statResult = runMonthlyStatUpdate(currentCampaign);
          if (Object.keys(statResult.statUpdates).length > 0) {
            currentCampaign = _updateCityStatsPure(
              currentCampaign,
              statResult.statUpdates
            );
          }
          collectedNewsThisMonth.push(...statResult.newsItems);

          // 4. Process monthly job income for player
          get().actions.processMonthlyJobIncome?.();
          currentCampaign = get().activeCampaign; // Re-fetch state after job income

          // 5. Simulate player approval update
          const newPlayerApproval =
            runMonthlyPlayerApprovalUpdate(currentCampaign, get);
          currentCampaign = _updatePlayerApprovalPure(
            currentCampaign,
            playerPoliticianId,
            newPlayerApproval
          );


          // 7. Update Party Popularity (Multi-level)
          const partyPopResult = runMonthlyPartyPopularityUpdate(
            currentCampaign,
            get
          );
          
          // Update city-level political landscape
          if (partyPopResult.cityPoliticalLandscape) {
            currentCampaign = _updatePoliticalLandscapePure(
              currentCampaign,
              partyPopResult.cityPoliticalLandscape
            );
            
            // Invalidate coalition cache for all city elections due to party popularity changes
            const cityElections = currentCampaign.elections?.filter(e => e.level === 'city') || [];
            cityElections.forEach(election => {
              pollingOptimizer.invalidateCoalitionCache(election.id);
            });
          }
          
          // Update state-level political landscape
          if (partyPopResult.statePoliticalLandscape && currentCampaign.parentState) {
            currentCampaign = {
              ...currentCampaign,
              parentState: {
                ...currentCampaign.parentState,
                politicalLandscape: partyPopResult.statePoliticalLandscape
              }
            };
            
            // Invalidate coalition cache for all state elections due to party popularity changes
            const stateElections = currentCampaign.elections?.filter(e => e.level === 'state') || [];
            stateElections.forEach(election => {
              pollingOptimizer.invalidateCoalitionCache(election.id);
            });
          }
          
          collectedNewsThisMonth.push(...partyPopResult.newsItems);

          // 8. Run AI Bill Proposals
          const proposedBills = runAIBillProposals(currentCampaign, get);
          if (proposedBills.length > 0) {
            get().actions.addProposedBills?.(proposedBills);
          }

          // 9. Dispatch collected news
          if (collectedNewsThisMonth.length > 0) {
            const datedNews = collectedNewsThisMonth.map((d) => ({
              ...d,
              date: { ...currentCampaign.currentDate },
            }));
            get().actions.addNewsEvent?.(datedNews);
          }

          return { activeCampaign: currentCampaign };
        });
      },

      advanceDay: () => {
        // --- PHASE 1: Read initial state & determine election day (NO STATE MODIFICATION YET) ---
        const campaignAtStartOfDay = get().activeCampaign;
        if (!campaignAtStartOfDay?.currentDate) {
          console.warn(
            "[TimeSlice:advanceDay] No active campaign or current date."
          );
          return;
        }
        const initialDate = campaignAtStartOfDay.currentDate;
        const yearBeforeAdvance = initialDate.year;

        let electionDayInfo = {
          shouldShowModal: false,
          modalElectionDetails: [],
          electionDayContextForModal: null,
        };

        const electionIdsToday = [];
        if (campaignAtStartOfDay.elections) {
          for (const e of campaignAtStartOfDay.elections) {
            if (
              e.electionDate.year === initialDate.year &&
              e.electionDate.month === initialDate.month &&
              e.electionDate.day === initialDate.day &&
              e.outcome?.status === "upcoming"
            ) {
              electionIdsToday.push(e.id);
            }
          }
        }

        if (electionIdsToday.length > 0) {
          get().actions.setupElectionNightDetails?.(initialDate);
          // It's critical to ensure this re-fetch gets the state AFTER setupElectionNightDetails
          // (which calls its own set() operation).
          const campaignAfterSetup = get().activeCampaign; // Re-fetch after setup
          if (campaignAfterSetup?.elections) {
            const modalDetails = [];
            for (const e of campaignAfterSetup.elections) {
              if (
                electionIdsToday.includes(e.id) &&
                e.outcome?.status === "upcoming"
              ) {
                modalDetails.push({
                  id: e.id,
                  officeName: e.officeName,
                  electionDate: e.electionDate,
                });
              }
            }
            electionDayInfo = {
              shouldShowModal: modalDetails.length > 0,
              modalElectionDetails: modalDetails,
              electionDayContextForModal: { ...initialDate },
            };
          }
        }

        // Note: Do NOT auto-process voteQueue here. Leave queued votes for the UI to handle via VoteAlert/LiveVoteSession.

        // --- PHASE 2: Perform the primary state update for date advancement & player politician ---
        set((state) => {
          let updatedCampaign = { ...state.activeCampaign };
          const { playerPoliticianId, politicians } = updatedCampaign;

          // Calculate new date
          let { year, month, day } = updatedCampaign.currentDate;
          const daysInMonth = new Date(year, month, 0).getDate();
          day++;
          if (day > daysInMonth) {
            day = 1;
            month++;
            if (month > 12) {
              month = 1;
              year++;
            }
          }
          updatedCampaign.currentDate = { year, month, day };

          // Player politician daily updates using SoA
          if (playerPoliticianId && politicians) {
            const stateData = politicians.state.get(playerPoliticianId);

            if (stateData) {
              const newMediaBuzz = Math.max(
                0,
                (stateData.mediaBuzz || 0) - getRandomInt(1, 2)
              );
              const newStateMap = new Map(politicians.state);
              newStateMap.set(playerPoliticianId, {
                ...stateData,
                mediaBuzz: newMediaBuzz,
              });
              updatedCampaign.politicians = {
                ...politicians,
                state: newStateMap,
              };
            }
          }

          return { activeCampaign: updatedCampaign };
        });

        // This action now correctly resets hours for ALL politicians, including the player
        get().actions.resetDailyCampaignHours();
        
        // Process daily staff tasks before AI actions
        get().actions.processDailyStaffTasks?.();

        // --- PHASE 3: Post-date-advancement operations (using the NEW date) ---
        // Get the campaign state AFTER the date advancement. This is crucial for monthly updates and AI.
        const campaignAfterDateAdvance = get().activeCampaign;
        if (!campaignAfterDateAdvance?.currentDate) {
          console.error(
            "[TimeSlice:advanceDay] Critical error: State not as expected after date advancement set."
          );
          return;
        }
        const effectiveDate = campaignAfterDateAdvance.currentDate;

        const dayOfWeek = new Date(
          effectiveDate.year,
          effectiveDate.month - 1,
          effectiveDate.day
        ).getDay();

        // On Mondays (dayOfWeek === 1), run the weekly polling update
        if (dayOfWeek === 1) {
          get().actions.runWeeklyPollingUpdates?.();
        }

        // --- PHASE 3b: Random Events Generation ---
        // Check if we should generate a random event today
        if (shouldGenerateRandomEvent(campaignAfterDateAdvance)) {
          const gameContext = {
            currentDate: effectiveDate,
            locationName: campaignAfterDateAdvance.startingCity?.name,
            cityName: campaignAfterDateAdvance.startingCity?.name,
            countryId: campaignAfterDateAdvance.country?.id,
            regionId: campaignAfterDateAdvance.parentState?.id,
            recentEvents: [], // Could track recent events in the future
            currentPolicies: [] // Could get from active legislation
          };

          const randomEvent = generateRandomEvent(gameContext);
          if (randomEvent) {
            const gameState = {
              newsOutlets: campaignAfterDateAdvance.newsOutlets || [],
              allPoliticians: Array.from(campaignAfterDateAdvance.politicians?.state?.values() || []),
              cityName: campaignAfterDateAdvance.startingCity?.name,
              lobbyingGroups: campaignAfterDateAdvance.lobbyingGroups || []
            };

            const processedEvent = processRandomEvent(randomEvent, gameState);
            
            // Process coalition effects if coalition system is available
            const coalitionSoA = get().actions.getCoalitionsForCity?.(campaignAfterDateAdvance.startingCity?.id);
            let coalitionResults = null;
            if (coalitionSoA) {
              console.log(`[TIME SLICE] Processing coalition effects for event: ${processedEvent.name || processedEvent.title}`);
              import("../simulation/randomEventsSystem.js").then(({ processEventCoalitionEffects }) => {
                coalitionResults = processEventCoalitionEffects(
                  processedEvent, 
                  coalitionSoA, 
                  campaignAfterDateAdvance.startingCity
                );
                
                // Apply coalition updates if any occurred
                if (coalitionResults?.coalitionUpdates) {
                  console.log(`[TIME SLICE] Applying coalition updates from event effects`);
                  get().actions.updateCityCoalitions?.(campaignAfterDateAdvance.startingCity.id, coalitionResults.coalitionUpdates);
                }
              });
            } else {
              console.log(`[TIME SLICE] No coalition system available for event: ${processedEvent.name || processedEvent.title}`);
            }
            
            // Add the generated news articles to the news system
            if (processedEvent.newsArticles && processedEvent.newsArticles.length > 0) {
              get().actions.addNewsArticle?.(processedEvent.newsArticles);
            }
            
            // Store event in campaign (could be used for effects later)
            set((state) => ({
              activeCampaign: {
                ...state.activeCampaign,
                lastEventDate: effectiveDate,
                recentRandomEvents: [
                  ...(state.activeCampaign.recentRandomEvents || []).slice(0, 9), // Keep last 10 events
                  processedEvent
                ],
                // Store coalition results if available
                ...(coalitionResults && {
                  lastCoalitionEffects: coalitionResults
                })
              }
            }));
          }
        }

        // --- PHASE 3a: Daily Legislation Processing ---
        // These actions are now self-contained and iterate through city, state, and national levels.
        // --- PHASE 3a: Process Yesterday's Queued Votes ---
        // Auto-process votes from the PREVIOUS day if a live session wasn't started.
        const { isVotingSessionActive, voteQueue } = get();
        if (!isVotingSessionActive && voteQueue && voteQueue.length > 0) {
          const votesToProcess = [...voteQueue]; // Process the queue from the previous day
          votesToProcess.forEach((vote) => {
            const aiVotes = get().actions.runAllAIVotesForBill?.(vote.billId, vote.level);
            get().actions.finalizeBillVote?.(vote.billId, vote.level, aiVotes);
          });
          // Clear the queue AFTER processing yesterday's votes
          get().actions.clearVoteQueue?.();
        }

        // --- PHASE 3b: Daily Legislation Processing for NEW day ---
        get().actions.processImpendingVotes?.(); // Finds and queues votes for the NEW day
        get().actions.processDailyBillCommentary?.(); // AI politicians form stances
        // AI politicians propose new bills
        ['city', 'state', 'national'].forEach(level => {
          get().actions.processAIProposals?.(level);
        });

        // Monthly updates
        if (effectiveDate.day === 1) {
          get().actions.processMonthlyUpdates();
          // Note: applyActiveLegislationEffects is called within processMonthlyUpdates
        }

        // --- PHASE 4: AI Campaign Simulation Loop ---
        const storeActions = get().actions;
        let campaignForAILoop = get().activeCampaign; // Re-fetch to ensure latest state

        if (campaignForAILoop && campaignForAILoop.elections) {
          // Step 1: Gather and REHYDRATE all unique AI candidates ONCE.
          const allCandidatesMap = new Map();
          const electionContexts = new Map();
          const soaStore = campaignForAILoop.politicians;

          const opponentListsCache = new Map();

          for (const election of campaignForAILoop.elections) {
            if (
              election.outcome?.status === "upcoming" &&
              election.candidates &&
              election.playerIsCandidate // Only process elections where player is a candidate
            ) {
              // Pre-compute the full candidate list for this election once
              const candidatesInElection = Array.from(
                election.candidates.values()
              );
              opponentListsCache.set(election.id, candidatesInElection);

              for (const candidateId of election.candidates.keys()) {
                if (!allCandidatesMap.has(candidateId)) {
                  const leanCampaignerObject = rehydrateLeanCampaigner(
                    candidateId,
                    soaStore
                  );
                  if (leanCampaignerObject && !leanCampaignerObject.isPlayer) {
                    allCandidatesMap.set(candidateId, leanCampaignerObject);
                    electionContexts.set(candidateId, election);
                  }
                }
              }
            }
          }

          // Step 2: Call your original, performant function for each rehydrated AI
          const allAIResults = [];
          for (const candidate of allCandidatesMap.values()) {
            const context = electionContexts.get(candidate.id);
            const result = simulateAICampaignDayForPolitician(
              candidate,
              context,
              opponentListsCache,
              campaignForAILoop
            );
            if (result) {
              allAIResults.push(result);
            }
          }

          // Step 3: Apply the results in a single batch update
          if (allAIResults.length > 0) {
            storeActions.applyDailyAICampaignResults(allAIResults);
          }
        }

        // --- PHASE 5: Final Operations ---
        if (electionDayInfo.shouldShowModal) {
          get().actions.openElectionDayModal?.(
            electionDayInfo.modalElectionDetails
          );
        }

        if (
          effectiveDate.month === 1 &&
          effectiveDate.day === 1 &&
          effectiveDate.year > yearBeforeAdvance
        ) {
          get().actions.generateScheduledElections?.();
          get().actions.agePoliticians?.();
        }
      },

      advanceToNextElection: () => {
        if (get().isAdvancingToNextElection) return;
        const initialCampaignState = get().activeCampaign;
        if (
          !initialCampaignState?.currentDate ||
          !initialCampaignState.elections
        )
          return;

        const currentDate = initialCampaignState.currentDate;
        const nextUpcomingElection = initialCampaignState.elections
          .filter(
            (e) =>
              e.outcome?.status === "upcoming" &&
              isDateBefore(currentDate, e.electionDate)
          )
          .sort((a, b) => {
            // Ensure we get the *very next* one
            if (a.electionDate.year !== b.electionDate.year)
              return a.electionDate.year - b.electionDate.year;
            if (a.electionDate.month !== b.electionDate.month)
              return a.electionDate.month - b.electionDate.month;
            return a.electionDate.day - b.electionDate.day;
          })[0];

        if (!nextUpcomingElection) {
          console.log("No further upcoming elections.");
          get().actions.setIsAdvancingToNextElection(false); // From uiSlice if it exists
          return;
        }

        const targetElectionDate = nextUpcomingElection.electionDate;
        // Use the action from uiSlice to set this flag
        get().actions.setIsAdvancingToNextElection(true);

        let safetyMaxLoops = 365 * 5; // Max 5 years

        const simulateAdvanceLoop = () => {
          if (safetyMaxLoops-- <= 0) {
            console.error("advanceToNextElection: Max loops reached.");
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }

          const currentCampaign = get().activeCampaign;
          if (!currentCampaign) {
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }
          // Check if UI modal from uiSlice is open
          if (get().showElectionDayModal) {
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }
          // Check if we've reached or passed the target date
          if (!isDateBefore(currentCampaign.currentDate, targetElectionDate)) {
            get().actions.setIsAdvancingToNextElection(false);
            // If it's election day, advanceDay would have handled the modal.
            // If we overshot, this stops it.
            return;
          }

          get().actions.advanceDay(); // Call the refactored advanceDay

          // Check again immediately if a modal popped after this advanceDay or if target reached
          const newCurrentCampaign = get().activeCampaign;
          if (
            !newCurrentCampaign ||
            get().showElectionDayModal ||
            !isDateBefore(newCurrentCampaign.currentDate, targetElectionDate)
          ) {
            get().actions.setIsAdvancingToNextElection(false);
          } else {
            requestAnimationFrame(simulateAdvanceLoop);
          }
        };

        // Start the loop if not already on/past the date
        if (isDateBefore(currentDate, targetElectionDate)) {
          requestAnimationFrame(simulateAdvanceLoop);
        } else {
          get().actions.setIsAdvancingToNextElection(false);
          // If today IS the election day, advanceDay should run once to trigger it.
          if (areDatesEqual(currentDate, targetElectionDate)) {
            get().actions.advanceDay();
          }
        }
      },

      advanceToNextYear: () => {
        if (get().isAdvancingToNextElection) return; // Use UI slice state if available: get().ui.isAdvancing

        const initialCampaignState = get().activeCampaign;
        if (!initialCampaignState?.currentDate) return;

        const targetDate = {
          year: initialCampaignState.currentDate.year + 1,
          month: 1,
          day: 1,
        };

        get().actions.setIsAdvancingToNextElection(true); // Use uiSlice action
        let safetyMaxLoops = 400;

        const simulateYearAdvanceLoop = () => {
          if (safetyMaxLoops-- <= 0) {
            console.error("advanceToNextYear: Max loops reached.");
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }
          const currentCampaign = get().activeCampaign;
          if (!currentCampaign) {
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }

          if (get().showElectionDayModal) {
            // Check UI slice state
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }
          if (areDatesEqual(currentCampaign.currentDate, targetDate)) {
            get().actions.setIsAdvancingToNextElection(false);
            return;
          }
          if (isDateBefore(currentCampaign.currentDate, targetDate)) {
            get().actions.advanceDay();
            // Re-check modal state immediately after advancing
            if (get().showElectionDayModal) {
              get().actions.setIsAdvancingToNextElection(false);
              return;
            }
            requestAnimationFrame(simulateYearAdvanceLoop);
          } else {
            // Overshot or error
            get().actions.setIsAdvancingToNextElection(false);
          }
        };
        if (isDateBefore(initialCampaignState.currentDate, targetDate)) {
          requestAnimationFrame(simulateYearAdvanceLoop);
        } else {
          get().actions.setIsAdvancingToNextElection(false);
        }
      },
      runWeeklyPollingUpdates: () => {
        const { activeCampaign, actions } = get();
        if (!activeCampaign?.elections) return;

        // For performance, we only poll for a subset of elections each week
        // We'll focus on the player's election and a few other random ones.

        const playerElection = activeCampaign.elections.find(
          (e) => e.playerIsCandidate
        );
        if (playerElection) {
          actions.generateNewPollForElection?.(playerElection.id);
        }

        // Poll for a few other random, non-player elections to make the world feel alive
        const otherElections = activeCampaign.elections.filter(
          (e) => !e.playerIsCandidate && e.outcome?.status === "upcoming"
        );
        const numberOfRandomPolls = Math.min(otherElections.length, 10); // Poll up to 3 other races

        for (let i = 0; i < numberOfRandomPolls; i++) {
          const randomElection =
            otherElections[Math.floor(Math.random() * otherElections.length)];
          if (randomElection) {
            actions.generateNewPollForElection?.(randomElection.id);
          }
        }
      },
    },
  };
};
