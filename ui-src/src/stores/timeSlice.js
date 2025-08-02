// ui-src/src/stores/timeSlice.js
import { isDateBefore, areDatesEqual, getRandomInt } from "../utils/core";
import {
  runMonthlyBudgetUpdate,
  runMonthlyStatUpdate,
  runMonthlyPlayerApprovalUpdate,
  runMonthlyPartyPopularityUpdate,
  runAIBillProposals,
} from "../simulation/monthlyTick.js";
import { simulateAICampaignDayForPolitician } from "../utils/aiUtils.js";

// --- Refactored Internal Helper Functions (now pure functions, no longer calling set directly) ---
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

const _updatePlayerApprovalPure = (campaign, newApproval) => {
  if (newApproval === null || !campaign) return campaign;
  return {
    ...campaign,
    politician: { ...campaign.politician, approvalRating: newApproval },
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

          // 3. Simulate and update all city stats
          const statResult = runMonthlyStatUpdate(currentCampaign);
          if (Object.keys(statResult.statUpdates).length > 0) {
            currentCampaign = _updateCityStatsPure(
              currentCampaign,
              statResult.statUpdates
            );
          }
          collectedNewsThisMonth.push(...statResult.newsItems);

          // 4. Simulate player approval update
          const newPlayerApproval =
            runMonthlyPlayerApprovalUpdate(currentCampaign);
          currentCampaign = _updatePlayerApprovalPure(
            currentCampaign,
            newPlayerApproval
          );

          // 5. AI Policy Proposals
          const authoredBills = runAIBillProposals(currentCampaign, get);
          if (authoredBills.length > 0) {
            authoredBills.forEach((bill) => {
              // Call the correct "proposeBill" action with the correct bill data
              get().actions.proposeBill?.(
                bill.name,
                bill.policies,
                bill.proposerId,
                bill.proposerName
              );
            });
          }

          // 6. Update Party Popularity
          const partyPopResult = runMonthlyPartyPopularityUpdate(
            currentCampaign,
            get
          );
          if (partyPopResult.newPoliticalLandscape) {
            currentCampaign = _updatePoliticalLandscapePure(
              currentCampaign,
              partyPopResult.newPoliticalLandscape
            );
          }
          collectedNewsThisMonth.push(...partyPopResult.newsItems);

          // 7. Dispatch collected news
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

        // --- PHASE 2: Perform the primary state update for date advancement & player politician ---
        set((state) => {
          let updatedCampaign = { ...state.activeCampaign }; // Start update with current state

          // Calculate new date
          let { year, month, day } = updatedCampaign.currentDate;
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
          updatedCampaign.currentDate = { year, month, day };

          // Player politician updates
          if (updatedCampaign.politician) {
            let newPlayerMediaBuzz =
              updatedCampaign.politician.playerMediaBuzz || 0;
            if (updatedCampaign.politician.playerMediaBuzz > 0) {
              newPlayerMediaBuzz = Math.max(
                0,
                updatedCampaign.politician.playerMediaBuzz - getRandomInt(1, 2)
              );
            }
            updatedCampaign.politician = {
              ...updatedCampaign.politician,
              playerCampaignActionToday: false,
              playerMediaBuzz: newPlayerMediaBuzz,
            };
          }

          const newPoliticianState = {
            ...state.activeCampaign.politician,
            workingHours: state.activeCampaign.politician.maxWorkingHours, // Reset hours
            campaignActionToday: false, // Reset this too
          };

          // Update modal-related viewing flags
          updatedCampaign.viewingElectionNightForDate =
            electionDayInfo.shouldShowModal
              ? electionDayInfo.electionDayContextForModal
              : updatedCampaign.viewingElectionNightForDate;

          return {
            activeCampaign: {
              ...updatedCampaign,
              politician: newPoliticianState,
            },
          };
        });

        get().actions.processDailyCampaignEffects();

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

        const billsToVoteOnToday = get()
          .proposedBills.filter(
            (b) =>
              b.status === "pending_vote" &&
              b.voteScheduledFor &&
              areGameDatesEqual(effectiveDate, b.voteScheduledFor)
          )
          .map((b) => b.id);

        if (billsToVoteOnToday.length > 0) {
          // Add all of today's bills to the queue instead of starting the session directly
          get().actions.startVotingQueue?.(billsToVoteOnToday);
        }

        get().actions.processDailyBillCommentary?.();

        // Monthly updates
        if (effectiveDate.day === 1) {
          get().actions.processMonthlyUpdates();
          get().actions.applyActiveLegislationEffects();
        }

        // Daily proposal activity
        get().actions.processDailyProposalActivity?.(effectiveDate);

        // --- PHASE 4: AI Campaign Simulation Loop ---
        const storeActions = get().actions;
        let campaignForAILoop = get().activeCampaign; // Re-fetch to ensure latest state

        if (campaignForAILoop && campaignForAILoop.elections) {
          const aiProcessingQueue = [];

          campaignForAILoop.elections.forEach((election) => {
            if (
              election.outcome?.status === "upcoming" &&
              election.candidates
            ) {
              for (const candidate of election.candidates.values()) {
                if (!candidate.isPlayer && candidate.id) {
                  aiProcessingQueue.push({
                    aiPolitician: candidate,
                    electionContext: election,
                  });
                }
              }
            }
          });

          // --- NEW LOGIC: Collect results first ---
          const allAIResults = [];
          aiProcessingQueue.forEach((job) => {
            storeActions.resetDailyCampaignHours?.(job.aiPolitician.id);
            const result = simulateAICampaignDayForPolitician(
              job.aiPolitician,
              job.electionContext,
              campaignForAILoop // Pass the current campaign state
            );
            if (result) {
              allAIResults.push(result);
            }
          });

          // --- NEW LOGIC: Apply all results in a single batch update ---
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
