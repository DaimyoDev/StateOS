// src/stores/legislationSlice.js
// This slice manages the state of proposed and active legislation.
// It contains the full logic for AI voting and applying policy effects to the campaign state.

import { generateId, getRandomInt } from "../utils/core.js";
import { CITY_POLICIES } from "../data/cityPolicyDefinitions";
import { STATE_POLICIES } from "../data/statePolicyDefinitions";
import { FEDERAL_POLICIES } from "../data/nationalPolicyDefinitions";
import { GENERAL_POLICIES } from "../data/generalPolicyDefinitions";
import { applyPolicyEffect } from "../simulation/applyPolicyEffects.js";
import {
  decideAndAuthorAIBill,
  shouldAIProposeBasedOnNeeds,
} from "../simulation/aiProposal.js";
import { mergeAIProposals } from "../simulation/billMerging.js";
import { decideAIVote } from "../simulation/aiVoting.js";
import {
  getLegislatureDetails,
  getStatsForLevel,
} from "../utils/legislationUtils";
import {
  initializeBillStages,
  processBillStage,
  getBillProgressionWorkflow
} from "../utils/billProgressionUtils";
import {
  runStateBudgetUpdate,
  runNationalBudgetUpdate,
} from "../utils/regionalStatCalc.js";
import { runMonthlyBudgetUpdate } from "../simulation/monthlyTick.js";

// Helper function to recalculate budgets after policy effects
const recalculateBudgetsForLevel = (campaignState, level) => {
  try {
    if (level === "city") {
      // Update city budget
      if (campaignState?.startingCity?.stats?.budget) {
        const { budgetUpdates } = runMonthlyBudgetUpdate(campaignState);
        if (budgetUpdates && campaignState.startingCity.stats) {
          campaignState.startingCity.stats.budget = {
            ...campaignState.startingCity.stats.budget,
            ...budgetUpdates,
          };
        }
      }
    } else if (level === "state") {
      // Find the current region (state)
      const currentRegion = campaignState.regions?.find(
        (r) => r.id === campaignState.startingCity?.regionId
      );
      if (currentRegion?.stats?.budget) {
        const newStateBudget = runStateBudgetUpdate(
          currentRegion,
          campaignState.country?.stats?.budget
        );
        if (newStateBudget && currentRegion.stats) {
          currentRegion.stats.budget = newStateBudget;
        }
      }
    } else if (level === "national") {
      // Update national budget
      if (campaignState.country?.stats?.budget && campaignState.regions) {
        const newNationalBudget = runNationalBudgetUpdate(
          campaignState.country,
          campaignState.regions
        );
        if (newNationalBudget && campaignState.country.stats) {
          campaignState.country.stats.budget = newNationalBudget;
        }
      }
    }
    // All budget levels (city, state, national) are now handled above
  } catch (error) {
    console.error(
      `[ERROR] Failed to recalculate budget for level ${level}:`,
      error
    );
  }
};

const getInitialLegislationState = () => ({
  city: {
    proposedBills: [],
    activeLegislation: [],
    passedBillsArchive: [],
    failedBillsHistory: [], // Track failed bills for AI memory
  },
  state: {
    proposedBills: [],
    activeLegislation: [],
    passedBillsArchive: [],
    failedBillsHistory: [], // Track failed bills for AI memory
  },
  national: {
    proposedBills: [],
    activeLegislation: [],
    passedBillsArchive: [],
    failedBillsHistory: [], // Track failed bills for AI memory
  },
  savedBillTemplates: [],
});

export const addDaysToDate = (date, days) => {
  const newDate = new Date(date.year, date.month - 1, date.day);
  newDate.setDate(newDate.getDate() + days);
  return {
    year: newDate.getFullYear(),
    month: newDate.getMonth() + 1,
    day: newDate.getDate(),
  };
};

const generateAIBillName = (currentYear) => {
  const prefixes = ["The", "A Bill Regarding", "An Act for", "The Charter for"];
  const topics = [
    "Urban Development",
    "Public Safety",
    "Economic Growth",
    "Community Support",
    "Fiscal Responsibility",
    "Infrastructure",
  ];
  const suffixes = [
    "Act",
    "Initiative",
    "Bill",
    "Charter Amendment",
    "Ordinance",
  ];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
    topics[Math.floor(Math.random() * topics.length)]
  } ${suffixes[Math.floor(Math.random() * suffixes.length)]} of ${currentYear}`;
};

export const createLegislationSlice = (set, get) => ({
  ...getInitialLegislationState(),
  availablePolicies: {
    city: [...CITY_POLICIES, ...GENERAL_POLICIES],
    state: [...STATE_POLICIES, ...GENERAL_POLICIES],
    national: [...FEDERAL_POLICIES, ...GENERAL_POLICIES],
  },

  actions: {
    resetLegislationState: () =>
      set({
        ...getInitialLegislationState(),
        availablePolicies: {
          city: [...CITY_POLICIES, ...GENERAL_POLICIES],
          state: [...STATE_POLICIES, ...GENERAL_POLICIES],
          national: [...FEDERAL_POLICIES, ...GENERAL_POLICIES],
        },
      }),

    proposeBill: (
      level,
      billName,
      policies,
      proposerId,
      proposerName,
      parameters = null,
      billType = "new",
      targetLawId = null
    ) => {
      set((state) => {
        if (!state[level]) {
          return state;
        }

        const dateProposed = { ...state.activeCampaign.currentDate };
        
        // Get country's political system for bill progression
        const countryData = state.activeCampaign.availableCountries?.find(c => c.id === state.activeCampaign.countryId) ||
                           state.activeCampaign.country;
        const politicalSystemId = countryData?.politicalSystemId || 'PRESIDENTIAL_REPUBLIC';

        const baseBill = {
          id: `bill_${generateId()}`,
          name:
            billName ||
            generateAIBillName(state.activeCampaign.currentDate.year),
          proposerId,
          proposerName,
          level, // Store the level on the bill itself
          billType: billType, // 'new', 'amend', 'repeal'
          targetLawId: targetLawId, // ID of the law being amended/repealed
          policies: policies.map((p) => {
            const policyDefinition = state.availablePolicies[level].find(
              (def) => def.id === p.policyId
            );
            return {
              ...p,
              policyName: policyDefinition?.name,
              description: policyDefinition?.description,
              parameterDetails: policyDefinition?.parameterDetails,
            };
          }),
          parameters: parameters, // Store the chosen parameters for the bill
          status: "in_committee", // Updated status for new progression system
          dateProposed: dateProposed,
          votes: { yea: [], nay: [], abstain: [] },
          councilVotesCast: {},
        };

        // Initialize bill with political system-based stages
        const newBill = initializeBillStages(baseBill, politicalSystemId, dateProposed);

        get().actions.addNotification?.({
          message: `Bill Proposed: "${newBill.name}"`,
          category: "Legislation",
          type: "info",
        });

        return {
          [level]: {
            ...state[level],
            proposedBills: [...state[level].proposedBills, newBill],
          },
        };
      });
    },

    // NEW: Save a bill template
    saveBillTemplate: (
      templateName,
      policies,
      billType,
      targetLawId,
      proposerName
    ) => {
      set((state) => {
        const newTemplate = {
          templateId: `bill_template_${generateId()}`,
          name: templateName,
          policies: policies,
          billType,
          targetLawId,
          proposerName,
        };
        get().actions.addToast?.({
          message: `Bill template "${templateName}" saved.`,
          type: "success",
        });
        return {
          savedBillTemplates: [...state.savedBillTemplates, newTemplate],
        };
      });
    },

    // NEW: Process a bill through its current stage in the political system workflow
    processBillStage: (billId, level, aiVotes = {}) => {
      set((state) => {
        let bill = null;
        let foundLevel = null;

        // Find the bill and its level
        for (const key of ["city", "state", "national"]) {
          const foundBill = state[key].proposedBills.find(
            (b) => b.id === billId
          );
          if (foundBill) {
            bill = foundBill;
            foundLevel = key;
            break;
          }
        }

        if (!bill) {
          return state;
        }

        level = foundLevel;

        // Get political system and legislature info
        const countryData = state.activeCampaign.availableCountries?.find(c => c.id === state.activeCampaign.countryId) ||
                           state.activeCampaign.country;
        const politicalSystemId = countryData?.politicalSystemId || bill.politicalSystemId || 'PRESIDENTIAL_REPUBLIC';
        const legislature = getLegislatureDetails(state.activeCampaign, level);

        // Process the bill through its current stage
        const processedBill = processBillStage(bill, aiVotes, legislature, politicalSystemId, state.activeCampaign.currentDate);

        // Handle the result based on the bill's new status
        let newActiveLegislationList = [...state[level].activeLegislation];
        let newPassedBillsArchive = [...state[level].passedBillsArchive];
        let newFailedBillsHistory = [...state[level].failedBillsHistory];
        let updatedBills = [...state[level].proposedBills];

        // Update the bill in the proposed bills list
        const billIndex = updatedBills.findIndex(b => b.id === billId);
        if (billIndex !== -1) {
          if (processedBill.status === 'passed') {
            // Bill completed all stages, move to active legislation
            updatedBills.splice(billIndex, 1);
            
            // Handle different bill types for passed bills
            if (processedBill.billType === "repeal" && processedBill.targetLawId) {
              newActiveLegislationList = newActiveLegislationList.filter(
                (law) => law.id !== processedBill.targetLawId
              );
              get().actions.addNotification?.({
                message: `Law "${processedBill.name}" has been repealed.`,
                category: "Legislation",
                type: "success",
              });
            } else if (processedBill.billType === "amend" && processedBill.targetLawId) {
              // Amendment logic
              newActiveLegislationList = newActiveLegislationList.map((law) => {
                if (law.id === processedBill.targetLawId) {
                  const updatedPolicies = processedBill.policies.map((policyInBill) => {
                    const policyDef = state.availablePolicies[level].find(
                      (def) => def.id === policyInBill.policyId
                    );
                    return {
                      ...policyDef,
                      chosenParameters: policyInBill.chosenParameters,
                      monthsUntilEffective: policyDef.durationToImplement || 0,
                      effectsApplied: false,
                    };
                  });
                  return {
                    ...law,
                    name: processedBill.name,
                    policies: updatedPolicies,
                    monthsUntilEffective: Math.max(
                      ...updatedPolicies.map((p) => p.durationToImplement || 0)
                    ),
                    effectsApplied: false,
                  };
                }
                return law;
              });
            } else {
              // New law
              const newPoliciesForLaw = processedBill.policies.map((policyInBill) => {
                const policyDef = state.availablePolicies[level].find(
                  (def) => def.id === policyInBill.policyId
                );
                return {
                  ...policyDef,
                  chosenParameters: policyInBill.chosenParameters,
                  monthsUntilEffective: policyDef?.durationToImplement || 0,
                  effectsApplied: false,
                };
              });
              if (newPoliciesForLaw.length > 0) {
                newActiveLegislationList.push({
                  id: `law_${processedBill.id}`,
                  name: processedBill.name,
                  level: level,
                  proposerId: processedBill.proposerId,
                  proposerName: processedBill.proposerName,
                  policies: newPoliciesForLaw,
                  dateEnacted: { ...state.activeCampaign.currentDate },
                  monthsUntilEffective: Math.max(
                    ...newPoliciesForLaw.map((p) => p.durationToImplement || 0)
                  ),
                  effectsApplied: false,
                });
              }
            }
            
            newPassedBillsArchive.push(processedBill);
            get().actions.addNotification?.({
              message: `Bill "${processedBill.name}" has been enacted into law!`,
              category: "Legislation",
              type: "success",
            });
            
          } else if (processedBill.status === 'failed') {
            // Bill failed at some stage, move to failed history
            updatedBills.splice(billIndex, 1);
            newFailedBillsHistory.push(processedBill);
            if (newFailedBillsHistory.length > 50) {
              newFailedBillsHistory = newFailedBillsHistory.slice(-50);
            }
            
            get().actions.addNotification?.({
              message: `Bill "${processedBill.name}" failed at ${processedBill.failureStage?.replace(/_/g, ' ')} stage.`,
              category: "Legislation",
              type: "error",
            });
            
          } else {
            // Bill continues to next stage
            updatedBills[billIndex] = processedBill;
            const stageName = processedBill.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            get().actions.addNotification?.({
              message: `Bill "${processedBill.name}" advanced to ${stageName} stage.`,
              category: "Legislation",
              type: "info",
            });
          }
        }

        return {
          [level]: {
            ...state[level],
            proposedBills: updatedBills,
            activeLegislation: newActiveLegislationList,
            passedBillsArchive: newPassedBillsArchive,
            failedBillsHistory: newFailedBillsHistory,
          },
        };
      });
    },

    // DEPRECATED: Legacy function for backward compatibility - now uses the new stage system
    finalizeBillVote: (billId, level, aiVotes = {}) => {
      // For backward compatibility, just call the new processBillStage function
      get().actions.processBillStage(billId, level, aiVotes);
    },

    // LEGACY: This action now finalizes a BILL vote (kept for reference but deprecated)
    finalizeBillVoteOld: (billId, level, aiVotes = {}) => {
      set((state) => {
        let bill = null;
        let foundLevel = null;

        // Find the bill and its level
        for (const key of ["city", "state", "national"]) {
          const foundBill = state[key].proposedBills.find(
            (b) => b.id === billId
          );
          if (foundBill) {
            bill = foundBill;
            foundLevel = key;
            break;
          }
        }

        if (!bill) {
          return state;
        }

        // Use the determined level for all subsequent logic
        level = foundLevel;

        const { size: legislatureSize } = getLegislatureDetails(
          state.activeCampaign,
          level
        );
        const councilSize = legislatureSize;
        const majorityNeeded = Math.floor(councilSize / 2) + 1;

        // Combine existing votes with the new AI votes being passed in
        const combinedVotes = { ...bill.councilVotesCast, ...aiVotes };

        const yeaVotes = Object.values(combinedVotes).filter(
          (v) => v === "yea" || v === "YEA"
        ).length;
        const nayVotes = Object.values(combinedVotes).filter(
          (v) => v === "nay" || v === "NAY"
        ).length;
        const billDidPass = yeaVotes >= majorityNeeded;

        const voteEvent = {
          type: "policy_vote",
          context: {
            policyName: bill.name,
            didPass: billDidPass,
            policyId: bill.policies[0]?.policyId,
            yeaVotes: yeaVotes,
            nayVotes: nayVotes,
            level: level,
            governmentOffices: state.activeCampaign?.governmentOffices || [],
          },
        };
        get().actions.generateAndAddNewsForAllOutlets?.(voteEvent);

        let newActiveLegislationList = [...state[level].activeLegislation];
        let newPassedBillsArchive = [...state[level].passedBillsArchive];
        let newFailedBillsHistory = [...state[level].failedBillsHistory];

        if (billDidPass) {
          const passedBillRecord = {
            ...bill,
            status: "passed",
            councilVotesCast: combinedVotes,
            datePassed: { ...get().activeCampaign.currentDate },
          };
          newPassedBillsArchive.push(passedBillRecord);

          if (bill.billType === "repeal" && bill.targetLawId) {
            newActiveLegislationList = newActiveLegislationList.filter(
              (law) => law.id !== bill.targetLawId
            );
            get().actions.addNotification?.({
              message: `Law "${bill.name}" has been repealed.`,
              category: "Legislation",
              type: "success",
            });
          } else if (bill.billType === "amend" && bill.targetLawId) {
            newActiveLegislationList = newActiveLegislationList.map((law) => {
              if (law.id === bill.targetLawId) {
                const updatedPolicies = bill.policies.map((policyInBill) => {
                  const policyDef = state.availablePolicies[level].find(
                    (def) => def.id === policyInBill.policyId
                  );
                  return {
                    ...policyDef,
                    chosenParameters: policyInBill.chosenParameters,
                    monthsUntilEffective: policyDef.durationToImplement || 0,
                    effectsApplied: false,
                  };
                });
                return {
                  ...law,
                  name: bill.name,
                  policies: updatedPolicies,
                  monthsUntilEffective: Math.max(
                    ...updatedPolicies.map((p) => p.durationToImplement || 0)
                  ),
                  effectsApplied: false,
                };
              }
              return law;
            });
            get().actions.addNotification?.({
              message: `Law "${bill.name}" has been amended.`,
              category: "Legislation",
              type: "success",
            });
          } else {
            // 'new' bill type
            const newPoliciesForLaw = bill.policies.map((policyInBill) => {
              const policyDef = state.availablePolicies[level].find(
                (def) => def.id === policyInBill.policyId
              );
              return {
                ...policyDef,
                chosenParameters: policyInBill.chosenParameters,
                monthsUntilEffective: policyDef?.durationToImplement || 0,
                effectsApplied: false,
              };
            });
            if (newPoliciesForLaw.length > 0) {
              newActiveLegislationList.push({
                id: `law_${bill.id}`,
                name: bill.name,
                level: level,
                proposerId: bill.proposerId,
                proposerName: bill.proposerName,
                policies: newPoliciesForLaw,
                dateEnacted: { ...get().activeCampaign.currentDate },
                monthsUntilEffective: Math.max(
                  ...newPoliciesForLaw.map((p) => p.durationToImplement || 0)
                ),
                effectsApplied: false,
              });
            }
          }
        } else {
          const failedBillRecord = {
            ...bill,
            status: "failed",
            councilVotesCast: combinedVotes,
            dateFailed: { ...get().activeCampaign.currentDate },
            yeaVotes: yeaVotes,
            nayVotes: nayVotes,
            marginOfDefeat: nayVotes - yeaVotes,
          };
          newFailedBillsHistory.push(failedBillRecord);
          if (newFailedBillsHistory.length > 50) {
            newFailedBillsHistory = newFailedBillsHistory.slice(-50);
          }
        }

        const updatedBills = state[level].proposedBills.filter(
          (b) => b.id !== billId
        );

        get().actions.addNotification?.({
          message: `Vote on "${
            bill.name
          }" (${level}) has concluded. The bill has ${
            billDidPass ? "passed" : "failed"
          }.`,
          category: "Legislation",
          type: billDidPass ? "success" : "error",
        });

        return {
          [level]: {
            ...state[level],
            proposedBills: updatedBills,
            activeLegislation: newActiveLegislationList,
            passedBillsArchive: newPassedBillsArchive,
            failedBillsHistory: newFailedBillsHistory,
          },
        };
      });
    },

    processAIProposals: (level) => {
      const { activeCampaign } = get();
      if (!activeCampaign || !level) {
        return;
      }

      // PERFORMANCE OPTIMIZATION: Only get government offices relevant to this level and player's context
      const cityId = level === "city" ? activeCampaign?.startingCity?.id : null;
      const stateId =
        level === "state" || level === "city" ? activeCampaign?.regionId : null;
      const contextualOffices = get().actions.getGovernmentOfficesForContext(
        level,
        cityId,
        stateId
      );

      const { members: legislators } = getLegislatureDetails(
        activeCampaign,
        level,
        contextualOffices
      );

      const aiLegislators = legislators.filter(
        (m) => m.id !== activeCampaign.playerPoliticianId
      );

      const individualProposals = [];
      // Track proposals made in this cycle so each AI can see previous ones
      let proposalsThisCycle = [];

      aiLegislators.forEach((ai) => {
        // Replace random dice roll with intelligent need-based decision making
        const state = get();
        const availablePolicies = state.availablePolicies?.[level] || [];
        const availablePolicyIds = availablePolicies.map((p) => p.id);
        const relevantStats = getStatsForLevel(activeCampaign, level);
        const activeLegislation = get()[level]?.activeLegislation || [];
        const existingProposedBills = get()[level]?.proposedBills || [];
        const proposedLegislation = [
          ...existingProposedBills,
          ...proposalsThisCycle,
        ];

        const shouldPropose = shouldAIProposeBasedOnNeeds(
          ai,
          availablePolicyIds,
          relevantStats,
          activeLegislation,
          proposedLegislation,
          availablePolicies,
          get()[level]?.failedBillsHistory || [],
          activeCampaign.currentDate
        );

        if (shouldPropose) {
          const authoredBill = decideAndAuthorAIBill(
            ai,
            availablePolicyIds,
            relevantStats,
            activeLegislation,
            proposedLegislation,
            availablePolicies
          );

          if (authoredBill && authoredBill.policies?.length > 0) {
            const politicianData = activeCampaign.politicians.state.get(ai.id);
            const proposerName =
              politicianData?.name || ai.name || "An AI Politician";
            const proposal = {
              proposer: { ...ai, name: proposerName },
              policies: authoredBill.policies,
              name: authoredBill.name || `${proposerName}'s Bill`,
            };
            individualProposals.push(proposal);

            // Add this proposal to the cycle tracker so subsequent AIs can see it
            proposalsThisCycle.push({
              id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
              name: proposal.name,
              policies: proposal.policies,
              proposerId: ai.id,
              proposerName: proposerName,
            });
          }
        }
      });

      if (individualProposals.length > 0) {
        const state = get();
        const context = {
          level,
          cityStats: getStatsForLevel(activeCampaign, level),
          activeLegislation: state[level]?.activeLegislation || [],
          proposedBills: state[level]?.proposedBills || [],
          governmentOffices: contextualOffices || [],
          allPolicyDefsForLevel: state.availablePolicies[level].reduce(
            (acc, p) => ({ ...acc, [p.id]: p }),
            {}
          ),
        };

        const mergedBills = mergeAIProposals(individualProposals, context);

        mergedBills.forEach((bill) => {
          const primaryProposer = bill.proposers[0];
          get().actions.proposeBill(
            level,
            bill.name,
            bill.policies,
            primaryProposer.id,
            primaryProposer.name
          );
        });
      }
    },

    decideAndAuthorAIBill,

    recordBatchCouncilVotes: (billId, votes) => {
      set((state) => {
        let level = null;
        for (const key of ["city", "state", "national"]) {
          const bill = state[key].proposedBills.find((b) => b.id === billId);
          if (bill) {
            level = key;
            break;
          }
        }

        if (!level) {
          return state;
        }

        const updatedBills = state[level].proposedBills.map((bill) => {
          if (bill.id === billId) {
            const newVotes = { ...bill.votes };
            const newCouncilVotesCast = { ...bill.councilVotesCast };

            for (const councilMemberId in votes) {
              const voteChoice = votes[councilMemberId];
              if (newVotes[voteChoice]) {
                newVotes[voteChoice].push(councilMemberId);
                newCouncilVotesCast[councilMemberId] = voteChoice;
              }
            }

            return {
              ...bill,
              votes: newVotes,
              councilVotesCast: newCouncilVotesCast,
            };
          }
          return bill;
        });

        return {
          [level]: {
            ...state[level],
            proposedBills: updatedBills,
          },
        };
      });
    },

    recordCouncilVote: (billId, councilMemberId, voteChoice) => {
      set((state) => {
        let level = null;
        for (const key of ["city", "state", "national"]) {
          const bill = state[key].proposedBills.find((b) => b.id === billId);
          if (bill) {
            level = key;
            break;
          }
        }

        if (!level) {
          return state;
        }

        const updatedBills = state[level].proposedBills.map((bill) => {
          if (bill.id === billId) {
            const newVotes = {
              yea: bill.votes.yea.filter((id) => id !== councilMemberId),
              nay: bill.votes.nay.filter((id) => id !== councilMemberId),
              abstain: bill.votes.abstain.filter(
                (id) => id !== councilMemberId
              ),
            };

            if (newVotes[voteChoice]) {
              newVotes[voteChoice].push(councilMemberId);
            }

            return {
              ...bill,
              votes: newVotes,
              councilVotesCast: {
                ...bill.councilVotesCast,
                [councilMemberId]: voteChoice,
              },
            };
          }
          return bill;
        });

        return {
          [level]: {
            ...state[level],
            proposedBills: updatedBills,
          },
        };
      });
    },

    applyActiveLegislationEffects: () => {
      const newsEventsToAdd = [];

      set((state) => {
        if (!state.activeCampaign) return state;

        const updates = {};
        let hasChanges = false;

        for (const level of ["city", "state", "national"]) {
          const activeLegislation = state[level].activeLegislation;
          const effectsToApplyNow = [];
          const updatedLegislation = [];

          // Process each legislation item
          for (let i = 0; i < activeLegislation.length; i++) {
            const leg = activeLegislation[i];
            

            // Fix legacy legislation with undefined properties
            if (leg.monthsUntilEffective === undefined) {
              leg.monthsUntilEffective = 0; // Apply immediately for existing legislation
            }
            if (leg.effectsApplied === undefined) {
              leg.effectsApplied = false;
            }

            if (leg.monthsUntilEffective > 0) {
              
              // Update both the bill level and policy level monthsUntilEffective
              const updatedPolicies = leg.policies?.map(policy => ({
                ...policy,
                monthsUntilEffective: Math.max(0, (policy.monthsUntilEffective || leg.monthsUntilEffective) - 1)
              })) || [];
              
              updatedLegislation.push({
                ...leg,
                monthsUntilEffective: leg.monthsUntilEffective - 1,
                policies: updatedPolicies
              });
              hasChanges = true;
            } else if (leg.monthsUntilEffective === 0 && !leg.effectsApplied) {
              
              effectsToApplyNow.push(leg);
              
              // Update policies to mark as effective
              const updatedPolicies = leg.policies?.map(policy => ({
                ...policy,
                monthsUntilEffective: 0,
                effectsApplied: true
              })) || [];
              
              updatedLegislation.push({ 
                ...leg, 
                effectsApplied: true,
                policies: updatedPolicies
              });
              hasChanges = true;
            } else {
              updatedLegislation.push(leg);
            }
          }

          if (hasChanges) {
            updates[level] = {
              ...state[level],
              activeLegislation: updatedLegislation,
            };
          }

          // Process effects outside of state update
          if (effectsToApplyNow.length > 0) {
            effectsToApplyNow.forEach((law) => {
              if (!law.policies || !Array.isArray(law.policies)) return;

              law.policies.forEach((policy) => {
                if (policy.effects && Array.isArray(policy.effects)) {
                  policy.effects.forEach((effect) => {
                    applyPolicyEffect(
                      state.activeCampaign,
                      { ...effect, level: law.level },
                      policy.chosenParameters
                    );
                  });
                }

                if (
                  policy.isParameterized &&
                  policy.parameterDetails &&
                  policy.chosenParameters
                ) {
                  const pDetails = policy.parameterDetails;
                  const chosenValue = policy.chosenParameters[pDetails.key];
                  console.log(
                    `[legislationSlice] Processing parameterized policy: ${policy.name}, chosenValue: ${chosenValue}, setsSimulationVariable: ${policy.setsSimulationVariable}, targetStat: ${pDetails.targetStat}`
                  );

                  if (chosenValue !== undefined) {
                    // Handle budget and tax rate changes
                    if (pDetails.targetBudgetLine || pDetails.targetTaxRate) {
                      const tempEffect = {
                        targetStat:
                          pDetails.targetBudgetLine || pDetails.targetTaxRate,
                        change: chosenValue,
                        type:
                          pDetails.valueType === "percentage_point"
                            ? "percentage_point_change"
                            : "absolute_change",
                        isBudgetItem: !!pDetails.targetBudgetLine,
                        isTaxRate: !!pDetails.targetTaxRate,
                        level: law.level,
                      };
                      applyPolicyEffect(state.activeCampaign, tempEffect);
                    }

                    // Handle simulation variables (like minimum wage)
                    if (policy.setsSimulationVariable && pDetails.targetStat) {
                      console.log(
                        `[Policy Effect] Setting simulation variable ${pDetails.targetStat}: ${chosenValue}`
                      );
                      const tempEffect = {
                        targetStat: pDetails.targetStat,
                        change: chosenValue,
                        type:
                          pDetails.adjustmentType === "set_value"
                            ? "absolute_set_rate"
                            : "absolute_change",
                        level: law.level,
                        setsSimulationVariable: true,
                        parameterDetails: pDetails,
                        parameters: { [pDetails.key]: chosenValue },
                      };
                      applyPolicyEffect(state.activeCampaign, tempEffect);
                    }
                  } else {
                    console.warn(
                      `[legislationSlice] No chosen value found for parameterized policy: ${policy.name}`
                    );
                  }
                } else {
                  console.log(
                    `[legislationSlice] Non-parameterized policy or missing data: ${
                      policy.name
                    }, isParameterized: ${
                      policy.isParameterized
                    }, hasParameterDetails: ${!!policy.parameterDetails}, hasChosenParameters: ${!!policy.chosenParameters}`
                  );
                }

                newsEventsToAdd.push({
                  headline: `Policy Enacted: "${policy.name}" (${law.level})`,
                  summary: `The policy has now taken full effect.`,
                  type: "policy_enacted",
                  policyId: policy.id,
                });
              });
            });

            // Recalculate budgets for affected levels after policy effects are applied
            const affectedLevels = new Set();
            effectsToApplyNow.forEach((law) => {
              if (law.level) {
                affectedLevels.add(law.level);
              }
            });

            // Trigger budget recalculation for each affected level
            affectedLevels.forEach((level) => {
              recalculateBudgetsForLevel(state.activeCampaign, level);
            });
          }
        }

        if (hasChanges) {
          const newState = { ...state };
          // Ensure proper immutable updates for each level
          Object.keys(updates).forEach(level => {
            newState[level] = { ...newState[level], ...updates[level] };
          });
          return newState;
        }
        return state;
      });

      // Add all news events in a single batch after state update
      if (newsEventsToAdd.length > 0) {
        const addNewsEvent = get().actions.addNewsEvent;
        if (addNewsEvent) {
          newsEventsToAdd.forEach((event) => addNewsEvent(event));
        }
      }
    },

    processDailyBillCommentary: () => {
      set((state) => {
        const { activeCampaign } = state;

        for (const level of ["city", "state", "national"]) {
          // PERFORMANCE OPTIMIZATION: Only fetch government offices relevant to this level
          const cityId =
            level === "city" ? activeCampaign?.startingCity?.id : null;
          const stateId =
            level === "state" || level === "city"
              ? activeCampaign?.regionId
              : null;
          const contextualGovernmentOffices =
            get().actions.getGovernmentOfficesForContext(
              level,
              cityId,
              stateId
            );
          const { members: legislators } = getLegislatureDetails(
            activeCampaign,
            level,
            contextualGovernmentOffices
          );
          const relevantStats = getStatsForLevel(activeCampaign, level);

          if (!legislators || !relevantStats) continue;

          const updatedBills = state[level].proposedBills.map((bill) => {
            if (bill.status !== "pending_vote") return bill;

            const newStances = [...(bill.publicStances || [])];

            legislators.forEach((ai) => {
              if (ai.isPlayer || ai.id === activeCampaign.playerPoliticianId)
                return;
              const hasStance = newStances.some(
                (s) => s.politicianId === ai.id
              );
              if (hasStance) return;

              if (Math.random() < 0.25) {
                const voteLeaning = decideAIVote(
                  ai,
                  bill,
                  relevantStats,
                  state[level].activeLegislation,
                  state[level].proposedBills,
                  contextualGovernmentOffices,
                  // Convert array to object with policy IDs as keys, and include bill-specific policies
                  {
                    ...state.availablePolicies[level].reduce((acc, policy) => {
                      acc[policy.id] = policy;
                      return acc;
                    }, {}),
                    ...(bill.policyDefinitions || {}),
                  }
                );

                let stance = "undecided";
                if (voteLeaning === "yea") stance = "leaning_yea";
                if (voteLeaning === "nay") stance = "leaning_nay";

                const politicianData = activeCampaign.politicians.state.get(
                  ai.id
                );

                newStances.push({
                  politicianId: ai.id,
                  stance,
                  name: ai.name || politicianData?.name || "AI Politician",
                  party: ai.party || politicianData?.party || "Independent",
                  date: activeCampaign.currentDate,
                });
              }
            });
            return { ...bill, publicStances: newStances };
          });

          state = {
            ...state,
            [level]: { ...state[level], proposedBills: updatedBills },
          };
        }

        return state;
      });
    },

    runAllAIVotesForBill: (billId, level) => {
      const { activeCampaign, availablePolicies } = get();
      const bill = get()[level]?.proposedBills.find((b) => b.id === billId);
      if (!bill) return {};

      // PERFORMANCE OPTIMIZATION: Only get government offices relevant to this level
      const cityId = level === "city" ? activeCampaign?.startingCity?.id : null;
      const stateId =
        level === "state" || level === "city" ? activeCampaign?.regionId : null;
      const contextualGovernmentOffices =
        get().actions.getGovernmentOfficesForContext(level, cityId, stateId);
      const { members } = getLegislatureDetails(
        activeCampaign,
        level,
        contextualGovernmentOffices
      );

      // AI members are those who are not the player (isPlayer: false)
      const aiCouncilMembers = members.filter((m) => !m.isPlayer);

      const policiesForLevel = availablePolicies[level];
      const stats = getStatsForLevel(activeCampaign, level);

      const votes = {};

      for (const aiMember of aiCouncilMembers) {
        if (bill.councilVotesCast && bill.councilVotesCast[aiMember.id]) {
          continue; // Skip if vote already cast
        }

        try {
          const voteChoice = decideAIVote(
            aiMember,
            bill,
            stats,
            get()[level].activeLegislation,
            get()[level].proposedBills,
            contextualGovernmentOffices,
            // Convert array to object with policy IDs as keys, and include bill-specific policies
            {
              ...policiesForLevel.reduce((acc, policy) => {
                acc[policy.id] = policy;
                return acc;
              }, {}),
              ...(bill.policyDefinitions || {}),
            }
          );
          votes[aiMember.id] = voteChoice;
        } catch (error) {
          console.error(
            `[runAllAIVotesForBill Debug] Error calling decideAIVote for ${aiMember.id}:`,
            error
          );
          votes[aiMember.id] = "abstain"; // Default to abstain on error
        }
      }

      return votes; // Return the calculated votes
    },

    skipAndProcessVote: (billId, level) => {
      const aiVotes = get().actions.runAllAIVotesForBill?.(billId, level);
      get().actions.finalizeBillVote?.(billId, level, aiVotes);
    },

    processImpendingVotes: () => {
      const state = get();
      const currentDate = state.activeCampaign.currentDate;
      const allProposedBills = [
        ...state.city.proposedBills,
        ...state.state.proposedBills,
        ...state.national.proposedBills,
      ];

      const votesToQueue = [];
      const existingQueue = state.voteQueue || [];
      const existingIds = new Set(existingQueue.map((v) => v.billId));

      allProposedBills.forEach((bill) => {
        if (
          bill.status === "pending_vote" &&
          bill.voteScheduledFor.year === currentDate.year &&
          bill.voteScheduledFor.month === currentDate.month &&
          bill.voteScheduledFor.day === currentDate.day &&
          !existingIds.has(bill.id)
        ) {
          votesToQueue.push({ billId: bill.id, level: bill.level });
        }
      });

      if (votesToQueue.length > 0) {
        get().actions.startVotingQueue?.(votesToQueue);
      }

      // Return the list of votes found so the caller can use it immediately
      return votesToQueue;
    },
  },
});
