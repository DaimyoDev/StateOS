// ui-src/src/stores/timeSlice.js
import { isDateBefore, areDatesEqual, getRandomInt } from "../utils/core";
import { TimeOrchestrator } from "./timeOrchestrator.js";
import { simulateAICampaignDayForPolitician } from "../utils/aiUtils.js";
import { rehydrateLeanCampaigner } from "../entities/personnel.js";
import { pollingOptimizer } from "../General Scripts/OptimizedPollingFunctions.js";
import { shouldGenerateRandomEvent, generateRandomEvent, processRandomEvent } from "../simulation/randomEventsSystem.js";
import { getNextBillStage, getBillProgressionWorkflow, processBillStage } from "../utils/billProgressionUtils.js";

/**
 * Apply orchestrated state updates using nested path notation
 */
const _applyOrchestratedUpdates = (set, get, stateUpdates) => {
  set((state) => {
    let newState = { ...state };
    
    // Apply each update using path notation
    Object.entries(stateUpdates).forEach(([path, value]) => {
      if (path.includes('.')) {
        // Handle nested paths like 'campaign.startingCity.stats'
        const pathParts = path.split('.');
        let current = newState;
        
        // Navigate to the parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) current[pathParts[i]] = {};
          current = current[pathParts[i]];
        }
        
        // Set the final value
        current[pathParts[pathParts.length - 1]] = value;
      } else {
        // Handle direct updates
        switch (path) {
          case 'playerApprovalUpdate':
            newState = _updatePlayerApprovalPure(
              newState.activeCampaign,
              newState.activeCampaign?.playerPoliticianId,
              value
            );
            newState = { ...state, activeCampaign: newState };
            break;
            
          case 'playerPoliticalCapitalUpdate':
            newState = _updatePlayerPoliticalCapitalPure(
              newState.activeCampaign,
              newState.activeCampaign?.playerPoliticianId,
              value,
              get
            );
            newState = { ...state, activeCampaign: newState };
            break;
            
          case 'billStatusUpdates':
            newState = _updateBillStatusesPure(newState, value);
            break;
            
          default:
            // Handle other update types as needed
            break;
        }
      }
    });
    
    return newState;
  });
};

const _processDailyBillProgressions = (state, campaign) => {
  if (!campaign || !state) return state;
  
  const currentDate = campaign.currentDate;
  let updatedState = { ...state };
  updatedState.activeCampaign = { ...campaign };
  
  console.log(`[Bill Progress] Processing daily progressions for ${currentDate.month}/${currentDate.day}/${currentDate.year}`);
  
  // Check bills at each level for progression - bills are stored directly in state, not in campaign
  ['city', 'state', 'national'].forEach(level => {
    if (!updatedState[level]?.proposedBills) {
      console.log(`[Bill Progress] No proposed bills at ${level} level`);
      return;
    }
    
    console.log(`[Bill Progress] Found ${updatedState[level].proposedBills.length} bills at ${level} level`);
    
    const updatedProposedBills = updatedState[level].proposedBills.map(bill => {
      console.log(`[Bill Progress] Processing bill: ${bill.name || bill.id}, Status: ${bill.status}, Level: ${level}`);
      
      // Skip bills that are already finished
      if (bill.status === 'passed' || bill.status === 'failed') {
        console.log(`[Bill Progress] Skipping completed bill: ${bill.name || bill.id}`);
        return bill;
      }
      
      // Fix: If bill doesn't have stageScheduledFor, add it based on when it was proposed
      let billToProcess = bill;
      if (!bill.stageScheduledFor && bill.dateProposed) {
        const daysToAdd = level === 'city' ? 
          Math.floor(Math.random() * 3) + 1 :  // 1-4 days for city (much faster)
          Math.floor(Math.random() * 14) + 7;  // 7-21 days for state/national
        
        const newScheduledDate = _addDays(bill.dateProposed, daysToAdd);
        console.log(`[Bill Progress] Adding scheduled date to ${bill.name || bill.id}: ${newScheduledDate.month}/${newScheduledDate.day}/${newScheduledDate.year}`);
        
        billToProcess = {
          ...bill,
          stageScheduledFor: newScheduledDate
        };
      }
      
      // If bill STILL doesn't have a scheduled date, force one for TODAY (emergency fix for stuck bills)
      if (!billToProcess.stageScheduledFor) {
        console.log(`[Bill Progress] Emergency: Setting today's date for stuck bill: ${bill.name || bill.id}`);
        billToProcess = {
          ...billToProcess,
          stageScheduledFor: currentDate  // Schedule for today so it progresses immediately
        };
      }
      
      // Check if bill should progress today
      const shouldProgress = _shouldBillProgressToday(billToProcess, currentDate);
      console.log(`[Bill Progress] Bill ${bill.name || bill.id} should progress: ${shouldProgress}, scheduled for: ${billToProcess.stageScheduledFor?.month}/${billToProcess.stageScheduledFor?.day}/${billToProcess.stageScheduledFor?.year}, stage: ${billToProcess.currentStage}, status: ${billToProcess.status}`);
      
      if (shouldProgress) {
        const advancedBill = _advanceBillToNextStage(billToProcess, level, currentDate);
        
        // Debug: Log when bills advance (can remove later)
        if (advancedBill.status !== billToProcess.status) {
          console.log(`[Bill Progress] ${advancedBill.name || 'Bill'} advanced from ${billToProcess.status} to ${advancedBill.status}`);
        }
        
        return advancedBill;
      }
      
      return billToProcess;
    });
    
    updatedState[level] = {
      ...updatedState[level],
      proposedBills: updatedProposedBills
    };
  });
  
  return updatedState;
};

const _shouldBillProgressToday = (bill, currentDate) => {
  // If no scheduled date, set a fallback based on when it was proposed
  if (!bill.stageScheduledFor) {
    if (bill.dateProposed) {
      const daysSinceProposed = _daysBetween(bill.dateProposed, currentDate);
      // City bills should advance after 7-14 days, state/national after 21-35 days
      const minDays = bill.level === 'city' ? 7 : 21;
      const maxDays = bill.level === 'city' ? 14 : 35;
      return daysSinceProposed >= minDays && Math.random() < 0.3;
    }
    return false;
  }
  
  const scheduledDate = new Date(
    bill.stageScheduledFor.year,
    bill.stageScheduledFor.month - 1,
    bill.stageScheduledFor.day
  );
  const today = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day
  );
  
  return today >= scheduledDate;
};

const _daysBetween = (startDate, endDate) => {
  const start = new Date(startDate.year, startDate.month - 1, startDate.day);
  const end = new Date(endDate.year, endDate.month - 1, endDate.day);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const _advanceBillToNextStage = (bill, level, currentDate) => {
  const progressChance = Math.random();
  
  if (level === 'city') {
    // City bills: Use the new detailed stage progression system
    if (bill.status === 'under_review' || bill.status === 'pending_vote') {
      // Use the imported bill progression utils
      const politicalSystemId = 'CITY_COUNCIL'; // Use city council workflow
      
      // For non-voting stages, advance automatically with high probability  
      const workflow = getBillProgressionWorkflow(politicalSystemId, 'city');
      const currentStageConfig = Object.values(workflow).find(config => config.step === bill.currentStage);
      
      if (currentStageConfig && bill.currentStage !== 'council_vote') {
        // This is a non-voting stage, advance with high probability
        if (progressChance < 0.9) {
          const nextStage = getNextBillStage(bill, politicalSystemId, currentDate);
          if (nextStage) {
            console.log(`[Bill Progress] Advancing city bill ${bill.name} from ${bill.currentStage} to ${nextStage.stage}`);
            
            // Update status based on stage
            let newStatus = bill.status;
            if (nextStage.stage === 'council_vote') {
              newStatus = 'pending_vote';
            }
            
            return {
              ...bill,
              status: newStatus,
              currentStage: nextStage.stage,
              stageScheduledFor: nextStage.scheduledFor,
              stageHistory: [
                ...(bill.stageHistory || []),
                {
                  stage: bill.currentStage,
                  completedOn: currentDate,
                  status: 'passed'
                }
              ],
              // Don't override council vote info - keep the original scheduled date
              councilVoteInfo: bill.councilVoteInfo
            };
          }
        }
      } else if (bill.status === 'pending_vote') {
        // Bill is ready for voting - DON'T automatically pass/fail here
        console.log(`[Bill Progress] City bill ${bill.name || bill.id} is ready for voting - letting vote queue system handle it`);
        return bill; // Keep the bill in pending_vote status for the vote queue system
      }
    }
  } else {
    // State/national bills: Use the proper processBillStage function
    if (bill.status === 'in_committee' || bill.status === 'pending_vote' || bill.status === 'floor_consideration') {
      const countryData = bill.country || { politicalSystemId: 'PRESIDENTIAL_REPUBLIC' };
      const politicalSystemId = countryData.politicalSystemId || 'PRESIDENTIAL_REPUBLIC';
      
      // Check if this is a non-voting stage that should auto-advance
      const nonVotingStages = ['committee_assignment', 'proposal_submitted', 'public_comment_period'];
      const isNonVotingStage = nonVotingStages.includes(bill.currentStage);
      
      if (isNonVotingStage) {
        // Auto-advance non-voting stages using proper processBillStage function
        console.log(`[Bill Progress] ${bill.name} at non-voting stage ${bill.currentStage}, progress chance: ${progressChance.toFixed(2)}, threshold: 0.8`);
        if (progressChance < 0.8) {
          console.log(`[Bill Progress] Auto-advancing ${bill.name} from non-voting stage ${bill.currentStage} using processBillStage`);
          
          try {
            // Use the proper processBillStage function which handles committee vote scheduling
            const advancedBill = processBillStage(bill, {}, {}, politicalSystemId, currentDate);
            
            // Debug the result
            if (advancedBill.currentStage !== bill.currentStage) {
              console.log(`[Bill Progress] SUCCESS: ${bill.name} advanced from ${bill.currentStage} to ${advancedBill.currentStage}`);
            } else {
              console.log(`[Bill Progress] NO CHANGE: ${bill.name} still at ${bill.currentStage}, status: ${advancedBill.status}`);
            }
            
            return advancedBill;
          } catch (error) {
            console.error(`[Bill Progress] Error advancing ${bill.name}:`, error);
            return bill;
          }
        }
      } else {
        // For voting stages, don't auto-advance - let the voting system handle it
        console.log(`[Bill Progress] ${bill.name} at voting stage ${bill.currentStage} - letting vote system handle it`);
        return bill; // Don't modify voting stage bills
      }
    }
  }
  
  return bill;
};

const _addDays = (date, daysToAdd) => {
  const newDate = new Date(date.year, date.month - 1, date.day);
  newDate.setDate(newDate.getDate() + daysToAdd);
  
  return {
    year: newDate.getFullYear(),
    month: newDate.getMonth() + 1,
    day: newDate.getDate()
  };
};

const _updateBillStatusesPure = (state, billStatusUpdates) => {
  if (!billStatusUpdates || billStatusUpdates.length === 0) {
    return state;
  }
  
  const newState = { ...state };
  
  ['city', 'state', 'national'].forEach(level => {
    if (!newState[level]?.proposedBills) return;
    
    const updatedProposedBills = newState[level].proposedBills.map(bill => {
      const update = billStatusUpdates.find(u => u.billId === bill.id);
      if (update) {
        return {
          ...bill,
          status: update.newStatus,
          stageScheduledFor: update.nextStageScheduledFor || bill.stageScheduledFor,
          lastStatusUpdate: newState.activeCampaign?.currentDate
        };
      }
      return bill;
    });
    
    newState[level] = {
      ...newState[level],
      proposedBills: updatedProposedBills
    };
  });
  
  return newState;
};

const areGameDatesEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  );
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

const _updatePlayerPoliticalCapitalPure = (campaign, playerId, updateData, get) => {
  if (!updateData || !campaign || !playerId) return campaign;

  const politicians = campaign.politicians;
  const baseData = politicians.base?.get(playerId);
  if (!baseData) return campaign;

  const newBaseMap = new Map(politicians.base);
  newBaseMap.set(playerId, {
    ...baseData,
    politicalCapital: updateData.newPoliticalCapital,
  });

  // Add notification about political capital change
  if (get?.().actions?.addNotification) {
    const message = updateData.adjustment > 0 
      ? `Political Capital +${updateData.adjustment}: ${updateData.breakdown.join(', ')}`
      : `Political Capital ${updateData.adjustment}: ${updateData.breakdown.join(', ')}`;
    
    get().actions.addNotification({
      message,
      type: updateData.adjustment > 0 ? "success" : "warning",
      category: "Political Capital"
    });
  }

  return {
    ...campaign,
    politicians: { ...politicians, base: newBaseMap },
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
  // Initialize the time orchestrator
  const timeOrchestrator = new TimeOrchestrator();

  return {
    isAdvancingToNextElection: false,

    actions: {
      processMonthlyUpdates: () => {
        set((state) => {
          const currentCampaign = { ...state.activeCampaign };
          if (!currentCampaign?.currentDate) return state;

          // 1. Apply active legislation effects (this action calls its own `set`)
          get().actions.applyActiveLegislationEffects?.();
          
          // Re-fetch state after legislation effects
          const updatedState = get();
          if (!updatedState.activeCampaign) return state;

          // 2. Execute orchestrated monthly updates
          const orchestratorResult = timeOrchestrator.executeMonthlyTick(
            updatedState,
            get,
            (stateUpdates) => {
              // Apply state updates through the orchestrator
              _applyOrchestratedUpdates(set, get, stateUpdates);
            }
          );

          if (!orchestratorResult.success) {
            console.error('[TimeSlice] Monthly orchestrator failed:', orchestratorResult.error);
            return state; // Return original state on failure
          }

          // 3. Process monthly job income for player
          get().actions.processMonthlyJobIncome?.();

          // 4. Run AI Bill Proposals (handled by orchestrator now, but keeping for backwards compatibility)
          if (orchestratorResult.monthlyResults?.newBills?.length > 0) {
            get().actions.addProposedBills?.(orchestratorResult.monthlyResults.newBills);
          }

          // 5. Dispatch collected news
          if (orchestratorResult.monthlyResults?.newsItems?.length > 0) {
            const finalCampaign = get().activeCampaign;
            const datedNews = orchestratorResult.monthlyResults.newsItems.map((d) => ({
              ...d,
              date: { ...finalCampaign.currentDate },
            }));
            get().actions.addNewsEvent?.(datedNews);
          }

          // Return the final state
          return { activeCampaign: get().activeCampaign };
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

          // Check for bill progressions that should happen today
          console.log(`[Daily Progress] Checking bills for ${year}/${month}/${day}`);

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

          // Process bill progressions with the updated state
          const processedState = _processDailyBillProgressions(state, updatedCampaign);
          
          return processedState;
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
              import("../simulation/randomEventsSystem.js").then(({ processEventCoalitionEffects }) => {
                coalitionResults = processEventCoalitionEffects(
                  processedEvent, 
                  coalitionSoA, 
                  campaignAfterDateAdvance.startingCity,
                  campaignAfterDateAdvance.parentState
                );
                
                // Apply coalition updates if any occurred
                if (coalitionResults?.coalitionUpdates) {
                  get().actions.updateCityCoalitions?.(campaignAfterDateAdvance.startingCity.id, coalitionResults.coalitionUpdates);
                }
              });
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
        // Auto-process votes from PREVIOUS days if a live session wasn't started.
        // BUT: Don't auto-process votes that were just added today - give user a chance to see them
        const { isVotingSessionActive, voteQueue } = get();
        if (!isVotingSessionActive && voteQueue && voteQueue.length > 0) {
          console.log(`[Auto Vote Processing] Checking ${voteQueue.length} votes in queue for auto-processing`);
          
          // Only auto-process votes that are from previous days, not today
          const votesToProcess = voteQueue.filter(vote => {
            // Find the bill to check when it was added to queue
            const bill = get()[vote.level]?.proposedBills?.find(b => b.id === vote.billId);
            if (!bill) return false;
            
            // Get the appropriate vote date
            let voteDate = null;
            if (bill.level === 'city' && bill.councilVoteInfo?.councilVoteScheduled) {
              voteDate = bill.councilVoteInfo.councilVoteScheduled;
            } else if (bill.level !== 'city' && bill.committeeInfo?.committeeVoteScheduled) {
              voteDate = bill.committeeInfo.committeeVoteScheduled;
            }
            
            if (!voteDate) return false;
            
            const daysSinceScheduled = _daysBetween(voteDate, effectiveDate);
            const shouldAutoProcess = daysSinceScheduled >= 1; // Only auto-process if vote was due yesterday or earlier
            
            console.log(`[Auto Vote Processing] Bill ${bill.name}: scheduled ${daysSinceScheduled} days ago, auto-process: ${shouldAutoProcess}`);
            return shouldAutoProcess;
          });
          
          if (votesToProcess.length > 0) {
            console.log(`[Auto Vote Processing] Auto-processing ${votesToProcess.length} overdue votes`);
            votesToProcess.forEach((vote) => {
              const aiVotes = get().actions.runAllAIVotesForBill?.(vote.billId, vote.level);
              get().actions.finalizeBillVote?.(vote.billId, vote.level, aiVotes);
            });
            
            // Only remove the processed votes from the queue
            const remainingQueue = voteQueue.filter(vote => !votesToProcess.includes(vote));
            set({ voteQueue: remainingQueue });
          } else {
            console.log(`[Auto Vote Processing] No overdue votes to auto-process`);
          }
        }

        // --- PHASE 3a-2: Auto-process overdue pending votes ---
        // Process bills that have been in pending_vote status for more than 1 day
        // This prevents bills from getting stuck if user doesn't view voting sessions
        const finalCampaignAfterVoteProcessing = get().activeCampaign;
        ['city', 'state', 'national'].forEach(level => {
          const levelState = get()[level];
          if (!levelState?.proposedBills) return;
          
          levelState.proposedBills.forEach(bill => {
            if (bill.status === 'pending_vote') {
              // Get the appropriate vote date
              let voteDate = null;
              if (bill.level === 'city' && bill.councilVoteInfo?.councilVoteScheduled) {
                voteDate = bill.councilVoteInfo.councilVoteScheduled;
              } else if (bill.level !== 'city' && bill.committeeInfo?.committeeVoteScheduled) {
                voteDate = bill.committeeInfo.committeeVoteScheduled;
              }
              
              if (voteDate) {
                const daysSinceScheduled = _daysBetween(voteDate, effectiveDate);
                
                // Auto-process if vote was scheduled 2+ days ago (gives user time to see it)
                if (daysSinceScheduled >= 2) {
                  console.log(`[Auto Vote Processing] Processing overdue vote for bill: ${bill.name || bill.id} (${daysSinceScheduled} days overdue)`);
                  const aiVotes = get().actions.runAllAIVotesForBill?.(bill.id, level);
                  get().actions.finalizeBillVote?.(bill.id, level, aiVotes);
                }
              }
            } else if (bill.status === 'awaiting_signature' && bill.gubernatorialInfo?.decisionScheduled) {
              // Process gubernatorial decisions that are due
              const decisionDate = bill.gubernatorialInfo.decisionScheduled;
              const daysSinceScheduled = _daysBetween(decisionDate, effectiveDate);
              
              if (daysSinceScheduled >= 0) { // Process on the scheduled date
                console.log(`[Auto Gubernatorial Processing] Processing gubernatorial decision for bill: ${bill.name || bill.id}`);
                get().actions.processGubernatorialDecision?.(bill.id, level);
              }
            }
            
            // Safety mechanism: Force progression of bills stuck for too long
            if (bill.dateProposed) {
              const daysSinceProposed = _daysBetween(bill.dateProposed, effectiveDate);
              const maxDaysForLevel = level === 'city' ? 21 : 45; // City: 3 weeks, State/National: 6+ weeks
              
              if (daysSinceProposed >= maxDaysForLevel && (bill.status === 'under_review' || bill.status === 'in_committee')) {
                console.log(`[Safety Progression] Force advancing stuck bill: ${bill.name || bill.id} (${daysSinceProposed} days old, status: ${bill.status})`);
                // Force the bill to advance to pending_vote
                const advancedBill = _advanceBillToNextStage(bill, level, effectiveDate);
                if (advancedBill !== bill) {
                  // Apply the advancement immediately
                  const stateAfterSafetyAdvance = get();
                  set((state) => {
                    const updatedProposedBills = state[level].proposedBills.map(b => 
                      b.id === bill.id ? advancedBill : b
                    );
                    
                    return {
                      ...state,
                      [level]: {
                        ...state[level],
                        proposedBills: updatedProposedBills
                      }
                    };
                  });
                }
              }
            }
          });
        });

        // --- PHASE 3b: Daily Legislation Processing for NEW day ---
        get().actions.processImpendingVotes?.(); // Finds and queues votes for the NEW day
        get().actions.processDailyBillCommentary?.(); // AI politicians form stances
        // AI politicians propose new bills
        ['city', 'state', 'national'].forEach(level => {
          get().actions.processAIProposals?.(level);
        });
        
        // Party-based proposals for non-player cities (runs alongside individual AI proposals)
        get().actions.processPartyBasedLegislation?.();

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
