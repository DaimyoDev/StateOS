// ui-src/src/stores/timeSlice.js
import {
  isDateBefore,
  areDatesEqual,
  getRandomInt,
} from "../utils/generalUtils.js";
import {
  recalculateMonthlyBudget,
  simulateMonthlyCityStatChanges,
  simulateMonthlyPlayerApprovalUpdate,
  simulateAIPolicyProposals,
  updateMonthlyPartyPopularity,
} from "../utils/monthlyCalcUtils.js";
import { simulateAICampaignDayForPolitician } from "../utils/aiUtils.js";

// --- Refactored Internal Helper Functions (now pure functions, no longer calling set directly) ---
const _updateCityStatPure = (campaign, statName, newValue) => {
  if (!campaign?.startingCity?.stats) return campaign;
  return {
    ...campaign,
    startingCity: {
      ...campaign.startingCity,
      stats: {
        ...campaign.startingCity.stats,
        [statName]: newValue,
      },
    },
  };
};

const _updateBudgetFiguresPure = (campaign, budgetUpdates) => {
  if (!budgetUpdates || !campaign?.startingCity?.stats?.budget) return campaign;
  return {
    ...campaign,
    startingCity: {
      ...campaign.startingCity,
      stats: {
        ...campaign.startingCity.stats,
        budget: {
          ...campaign.startingCity.stats.budget,
          ...budgetUpdates,
        },
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
    playerApproval: newApproval,
  };
};

export const createTimeSlice = (set, get) => {
  return {
    isAdvancingToNextElection: false,

    actions: {
      processMonthlyUpdates: () => {
        set((state) => {
          // All updates within this single set() call
          let currentCampaign = { ...state.activeCampaign }; // Start with a fresh clone of activeCampaign for local modifications
          if (
            !currentCampaign?.currentDate ||
            !currentCampaign.startingCity?.stats
          ) {
            console.warn(
              "[TimeSlice] ProcessMonthlyUpdates: Initial campaign data missing or invalid."
            );
            return state; // Return original state if conditions not met
          }

          let collectedNewsThisMonth = [];

          // 1. Apply active legislation effects (This action itself calls set(), so we'll re-fetch state after it runs)
          // Since it's a separate action, its effects are applied via its own set()
          // and we need to ensure this is truly reflected in currentCampaign for subsequent steps.
          // For simplicity, we assume applyActiveLegislationEffects updates state correctly before proceeding.
          get().actions.applyActiveLegislationEffects?.();
          // After this, currentCampaign might be stale, so we re-fetch for the next steps
          currentCampaign = get().activeCampaign; // Re-fetch the latest state after external action

          // Defensive check if campaign somehow became null after re-fetch
          if (!currentCampaign) {
            console.error(
              "[TimeSlice] Campaign disappeared after policy effects re-fetch!"
            );
            return state;
          }

          // 2. Recalculate Budget
          const budgetSimResult = recalculateMonthlyBudget(currentCampaign);
          if (budgetSimResult.budgetUpdates) {
            currentCampaign = _updateBudgetFiguresPure(
              currentCampaign,
              budgetSimResult.budgetUpdates
            );
          }
          collectedNewsThisMonth.push(...budgetSimResult.newsItems);

          // 3. Simulate city stat changes
          const cityStatSimResults = simulateMonthlyCityStatChanges(
            currentCampaign,
            get
          );
          if (Object.keys(cityStatSimResults.statUpdates).length > 0) {
            for (const [statName, newValue] of Object.entries(
              cityStatSimResults.statUpdates
            )) {
              currentCampaign = _updateCityStatPure(
                currentCampaign,
                statName,
                newValue
              );
            }
          }
          collectedNewsThisMonth.push(...cityStatSimResults.newsItems);

          // 4. Simulate player approval update
          const newPlayerApproval =
            simulateMonthlyPlayerApprovalUpdate(currentCampaign);
          currentCampaign = _updatePlayerApprovalPure(
            currentCampaign,
            newPlayerApproval
          );

          // 5. AI Policy Proposal Logic
          const aiProposals = simulateAIPolicyProposals(currentCampaign, get);
          if (aiProposals.length > 0) {
            aiProposals.forEach((proposal) => {
              // Note: proposePolicy is an external action that calls set() itself.
              // Its effects on proposedLegislation are handled by its own dispatch.
              get().actions.proposePolicy?.(
                proposal.policyId,
                proposal.proposerId,
                proposal.chosenParameters
              );
            });
            // After proposePolicy, currentCampaign *could* be stale again for subsequent AI proposals in the loop.
            // For now, we accept this slight potential desync within a single monthly tick for AI proposals,
            // as they are usually added, not modifying existing campaign state other than proposedLegislation list.
          }

          // 6. Update Dynamic Party Popularity
          const partyPopResults = updateMonthlyPartyPopularity(
            currentCampaign,
            get
          );
          if (partyPopResults.newPoliticalLandscape) {
            currentCampaign = _updatePoliticalLandscapePure(
              currentCampaign,
              partyPopResults.newPoliticalLandscape
            );
          }
          collectedNewsThisMonth.push(...partyPopResults.newsItems);

          // 7. Dispatch all collected news for the month
          if (collectedNewsThisMonth.length > 0) {
            if (currentCampaign?.currentDate) {
              // Use currentCampaign here
              const datedNews = collectedNewsThisMonth.map((d) => ({
                ...d,
                date: { ...currentCampaign.currentDate },
              }));
              get().actions.addNewsEvent?.(datedNews);
            }
          }

          // Return the final, updated campaign object
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
              campaignActionToday: false,
              playerMediaBuzz: newPlayerMediaBuzz,
            };
          }

          // Update modal-related viewing flags
          updatedCampaign.viewingElectionNightForDate =
            electionDayInfo.shouldShowModal
              ? electionDayInfo.electionDayContextForModal
              : updatedCampaign.viewingElectionNightForDate;

          return { activeCampaign: updatedCampaign }; // Return the fully updated campaign
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

        // Monthly updates
        if (effectiveDate.day === 1) {
          get().actions.processMonthlyUpdates(); // This action has been refactored to aggregate its own changes
        }

        // Daily proposal activity
        get().actions.processDailyProposalActivity?.(effectiveDate);

        // --- PHASE 4: AI Campaign Simulation Loop ---
        const storeActions = get().actions;
        const campaignForAILoop = get().activeCampaign; // Re-fetch to ensure latest state after monthly updates

        if (campaignForAILoop && campaignForAILoop.elections) {
          const aiProcessingQueue = [];
          campaignForAILoop.elections.forEach((election) => {
            if (
              election.outcome?.status === "upcoming" &&
              election.candidates
            ) {
              election.candidates.forEach((candidate) => {
                if (!candidate.isPlayer && candidate.id) {
                  aiProcessingQueue.push(candidate);
                }
              });
            }
          });

          aiProcessingQueue.forEach((aiCandidateObject) => {
            storeActions.resetAIPoliticianDailyHours?.(aiCandidateObject.id);
            simulateAICampaignDayForPolitician(
              aiCandidateObject,
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
