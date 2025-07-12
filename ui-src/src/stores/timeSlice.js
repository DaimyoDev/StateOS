// ui-src/src/stores/timeSlice.js
import {
  isDateBefore,
  areDatesEqual,
  // isDateSameOrBefore, // No longer needed directly in timeSlice if legislation handles it
  getRandomInt,
  // adjustStatLevel, // Not needed directly if monthlyUtils handles it
} from "../utils/generalUtils.js";
// Import level constants if needed by any remaining logic, but mostly monthlyUtils will use them
// import { ECONOMIC_OUTLOOK_LEVELS, RATING_LEVELS, MOOD_LEVELS } from "../data/governmentData.js";
// import { normalizePolling } from "../utils/electionUtils.js"; // For AI campaigning if it stays here

// Import the new monthly utility functions
import {
  recalculateMonthlyBudget,
  simulateMonthlyCityStatChanges,
  simulateMonthlyPlayerApprovalUpdate,
  simulateAIPolicyProposals,
  updateMonthlyPartyPopularity,
} from "../utils/monthlyCalcUtils.js"; // Adjust path
import { simulateAICampaignDayForPolitician } from "../utils/aiUtils.js";

export const createTimeSlice = (set, get) => {
  // Initialize the monthly utils with store's set and get
  // This is called once when the store is created.

  // --- Internal Helper Actions to modify parts of activeCampaign (kept in timeSlice) ---
  const _updateCityStat = (statName, newValue) => {
    set((state) => {
      if (!state.activeCampaign?.startingCity?.stats) return {};
      return {
        activeCampaign: {
          ...state.activeCampaign,
          startingCity: {
            ...state.activeCampaign.startingCity,
            stats: {
              ...state.activeCampaign.startingCity.stats,
              [statName]: newValue,
            },
          },
        },
      };
    });
  };

  const _updateBudgetFigures = (budgetUpdates) => {
    if (!budgetUpdates) return; // No changes to apply
    set((state) => {
      if (!state.activeCampaign?.startingCity?.stats?.budget) return {};
      return {
        activeCampaign: {
          ...state.activeCampaign,
          startingCity: {
            ...state.activeCampaign.startingCity,
            stats: {
              ...state.activeCampaign.startingCity.stats,
              budget: {
                ...state.activeCampaign.startingCity.stats.budget,
                ...budgetUpdates, // Spread the updates (income, expenses, balance, debt)
              },
            },
          },
        },
      };
    });
  };

  const _updatePoliticalLandscape = (newLandscape) => {
    set((state) => {
      if (!state.activeCampaign?.startingCity) return {};
      return {
        activeCampaign: {
          ...state.activeCampaign,
          startingCity: {
            ...state.activeCampaign.startingCity,
            politicalLandscape: newLandscape,
          },
        },
      };
    });
  };

  const _updatePlayerApproval = (newApproval) => {
    if (newApproval === null) return; // No change
    set((state) => {
      if (!state.activeCampaign) return {};
      return {
        activeCampaign: {
          ...state.activeCampaign,
          playerApproval: newApproval,
        },
      };
    });
  };

  return {
    isAdvancingToNextElection: false,

    actions: {
      // updateMonthlyPartyPopularityInternal is now replaced by updateMonthlyPartyPopularity in monthlyUtils

      processMonthlyUpdates: () => {
        const campaignAtStartOfMonth = get().activeCampaign;
        if (
          !campaignAtStartOfMonth?.currentDate ||
          !campaignAtStartOfMonth.startingCity?.stats
        ) {
          console.warn(
            "[TimeSlice] ProcessMonthlyUpdates: Initial campaign data missing."
          );
          return;
        }

        let collectedNewsThisMonth = [];

        // 1. Apply active legislation effects (this calls policySlice which updates activeCampaign)
        get().actions.applyActiveLegislationEffects?.();

        // 2. Recalculate Budget (based on state after policy effects)
        const campaignAfterPolicyEffects = get().activeCampaign;
        if (!campaignAfterPolicyEffects) {
          console.error("Campaign disappeared after policy effects!");
          return;
        }
        const budgetSimResult = recalculateMonthlyBudget(
          campaignAfterPolicyEffects
        );
        if (budgetSimResult.budgetUpdates) {
          _updateBudgetFigures(budgetSimResult.budgetUpdates);
        }
        collectedNewsThisMonth.push(...budgetSimResult.newsItems);

        // 3. Simulate city stat changes (based on state after budget updates)
        const campaignAfterBudget = get().activeCampaign;
        if (!campaignAfterBudget) {
          console.error("Campaign disappeared after budget update!");
          return;
        }
        const cityStatSimResults = simulateMonthlyCityStatChanges(
          campaignAfterBudget,
          get
        ); // Pass `get`
        if (Object.keys(cityStatSimResults.statUpdates).length > 0) {
          for (const [statName, newValue] of Object.entries(
            cityStatSimResults.statUpdates
          )) {
            _updateCityStat(statName, newValue);
          }
        }
        collectedNewsThisMonth.push(...cityStatSimResults.newsItems);

        // 4. Simulate player approval update (based on state after city stat changes)
        const campaignAfterCityStats = get().activeCampaign;
        if (!campaignAfterCityStats) {
          console.error("Campaign disappeared after city stat changes!");
          return;
        }
        const newPlayerApproval = simulateMonthlyPlayerApprovalUpdate(
          campaignAfterCityStats
        );
        _updatePlayerApproval(newPlayerApproval); // Will only set if not null

        // 5. AI Policy Proposal Logic (based on latest state)
        const campaignForAI = get().activeCampaign;
        if (!campaignForAI) {
          console.error("Campaign disappeared before AI proposals!");
          return;
        }
        const aiProposals = simulateAIPolicyProposals(campaignForAI, get);
        if (aiProposals.length > 0) {
          aiProposals.forEach((proposal) => {
            get().actions.proposePolicy?.(
              proposal.policyId,
              proposal.proposerId,
              proposal.chosenParameters
            );
          });
        }

        // 6. Update Dynamic Party Popularity (based on latest state)
        const campaignForPartyPop = get().activeCampaign;
        if (!campaignForPartyPop) {
          console.error("Campaign disappeared before party popularity update!");
          return;
        }
        const partyPopResults = updateMonthlyPartyPopularity(
          campaignForPartyPop,
          get
        );
        _updatePoliticalLandscape(partyPopResults.newPoliticalLandscape);
        collectedNewsThisMonth.push(...partyPopResults.newsItems);

        // 7. Dispatch all collected news for the month
        if (collectedNewsThisMonth.length > 0) {
          const finalCampaignStateForNewsDate = get().activeCampaign;
          if (finalCampaignStateForNewsDate?.currentDate) {
            const datedNews = collectedNewsThisMonth.map((d) => ({
              ...d,
              date: { ...finalCampaignStateForNewsDate.currentDate },
            }));
            get().actions.addNewsEvent?.(datedNews);
          }
        }
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

        const initialDate = campaignAtStartOfDay.currentDate; // Direct reference, no spread needed for read-only
        const yearBeforeAdvance = initialDate.year;

        let electionDayInfo = {
          shouldShowModal: false,
          modalElectionDetails: [],
          electionDayContextForModal: null,
        };

        // Efficiently find election IDs for today
        // Consider optimizing this further if 'elections' is massive by pre-indexing elections by date.
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
          // IMPORTANT: setupElectionNightDetails should perform its own granular immutable updates
          // and NOT use structuredClone internally on large parts of the state.
          get().actions.setupElectionNightDetails?.(initialDate);

          // Re-fetch campaign state ONLY if setupElectionNightDetails could have modified it.
          // If it only reads or sets very specific flags, this re-fetch might be optimized.
          const campaignAfterSetup = get().activeCampaign;
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
              electionDayContextForModal: { ...initialDate }, // Spreading small date object is fine
            };
          }
        }

        // --- PHASE 2: Perform the primary state update for date advancement & player politician ---
        // This `set` call is now granular and avoids cloning the entire activeCampaign.
        set((state) => {
          if (!state.activeCampaign?.currentDate) {
            // This should ideally not be hit if the top-level guard worked,
            // but as a safeguard within `set`.
            return state;
          }

          // Calculate new date based on the current state from `state.activeCampaign.currentDate`
          let { year, month, day } = state.activeCampaign.currentDate;
          const daysInMonthArr = [
            0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
          ];
          if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            daysInMonthArr[2] = 29; // Leap year
          }
          day++;
          if (day > daysInMonthArr[month]) {
            day = 1;
            month++;
            if (month > 12) {
              month = 1;
              year++;
            }
          }
          const newDate = { year, month, day };

          // Player politician updates (ensure politician object exists)
          let updatedPlayerPolitician = state.activeCampaign.politician;
          if (state.activeCampaign.politician) {
            let newPlayerMediaBuzz =
              state.activeCampaign.politician.playerMediaBuzz || 0;
            if (state.activeCampaign.politician.playerMediaBuzz > 0) {
              newPlayerMediaBuzz = Math.max(
                0,
                state.activeCampaign.politician.playerMediaBuzz -
                  getRandomInt(1, 2)
              );
            }
            updatedPlayerPolitician = {
              ...state.activeCampaign.politician,
              campaignActionToday: false,
              playerMediaBuzz: newPlayerMediaBuzz,
            };
          }

          return {
            activeCampaign: {
              ...state.activeCampaign, // Spread to keep other top-level properties
              currentDate: newDate,
              politician: updatedPlayerPolitician,
              viewingElectionNightForDate: electionDayInfo.shouldShowModal
                ? electionDayInfo.electionDayContextForModal
                : state.activeCampaign.viewingElectionNightForDate,
              // Other large arrays like 'elections', 'generatedPartiesSnapshot' are carried over by reference
            },
          };
        });

        // --- PHASE 3: Post-date-advancement operations (using the NEW date) ---
        // Get the campaign state AFTER the date advancement.
        const campaignAfterDateAdvance = get().activeCampaign;
        if (!campaignAfterDateAdvance?.currentDate) {
          console.error(
            "[TimeSlice:advanceDay] Critical error: State not as expected after date advancement set."
          );
          return;
        }
        const effectiveDate = campaignAfterDateAdvance.currentDate;

        // Monthly updates
        if (effectiveDate.day === 1) {
          get().actions.processMonthlyUpdates(); // Must be performant and use granular updates
        }

        // Daily proposal activity
        get().actions.processDailyProposalActivity?.(effectiveDate); // Must be performant

        // --- PHASE 4: AI Campaign Simulation Loop ---
        const storeActions = get().actions; // Get all actions once
        const campaignForAILoop = campaignAfterDateAdvance;

        if (campaignForAILoop && campaignForAILoop.elections) {
          // Create a list of AI candidate references to process.
          // This avoids issues if the `elections` array itself is modified by an AI action mid-loop.
          // We are collecting references from the current state.
          const aiProcessingQueue = [];
          campaignForAILoop.elections.forEach((election) => {
            if (
              election.outcome?.status === "upcoming" &&
              election.candidates
            ) {
              election.candidates.forEach((candidate) => {
                if (!candidate.isPlayer && candidate.id) {
                  // We pass the candidate object itself. `resetAIPoliticianDailyHours` will operate by its ID.
                  // `simulateAICampaignDayForPolitician` will receive this object.
                  // If it needs an even "fresher" version due to prior AIs in this loop,
                  // `simulateAICampaignDayForPolitician` would need to re-fetch by ID using `get()`.
                  aiProcessingQueue.push(candidate);
                }
              });
            }
          });

          // Process each AI from the queue
          aiProcessingQueue.forEach((aiCandidateObject) => {
            // This action MUST find the candidate by ID and update them immutably.
            storeActions.resetAIPoliticianDailyHours?.(aiCandidateObject.id);

            simulateAICampaignDayForPolitician(
              aiCandidateObject, // The object from the queue (contains ID)
              get().activeCampaign, // Pass the LATEST campaign state for context
              storeActions
            );
          });
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
          get().actions.generateScheduledElections?.(); // Must be performant
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
    },
  };
};
