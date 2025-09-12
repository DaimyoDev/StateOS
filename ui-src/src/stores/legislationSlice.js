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
import { calculateCityPartyLineVotes } from "../simulation/partyLineVoting.js";
import { batchProcessCityProposals, batchProcessCityVoting, createLegislationActivitySummary } from "../simulation/cityLegislationManager.js";
import {
  getLegislatureDetails,
  getStatsForLevel,
} from "../utils/legislationUtils";
import {
  initializeBillStages,
  processBillStage,
  getBillProgressionWorkflow,
} from "../utils/billProgressionUtils";
import {
  runStateBudgetUpdate,
  runNationalBudgetUpdate,
} from "../utils/statCalculationEngine.js";
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

const getInitialCityLegislationState = () => ({
  proposedBills: [],
  activeLegislation: [],
  passedBillsArchive: [],
  failedBillsHistory: [], // Track failed bills for AI memory
});

const getInitialLegislationState = () => ({
  cities: {}, // Will be populated with cityId -> getInitialCityLegislationState() structure
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

  // Auto-migration and initialization flag
  _migrationChecked: false,

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

    // Initialize legislation for a specific city
    initializeCityLegislation: (cityId) => {
      set((state) => {
        if (!state.cities[cityId]) {
          return {
            ...state,
            cities: {
              ...state.cities,
              [cityId]: getInitialCityLegislationState(),
            },
          };
        }
        return state;
      });
    },

    // Initialize legislation for the active campaign's starting city
    initializeActiveCityLegislation: () => {
      const state = get();
      const cityId = state.activeCampaign?.startingCity?.id;
      if (cityId) {
        get().actions.initializeCityLegislation(cityId);
      }
    },

    // Migration function: Move old flat city legislation to hierarchical structure
    migrateToHierarchicalCityStructure: () => {
      set((state) => {
        // Check if we have old flat 'city' data that needs migration
        if (state.city && typeof state.city === 'object' && 
            (state.city.proposedBills || state.city.activeLegislation)) {
          
          console.log('[LegislationSlice] Migrating old flat city legislation to hierarchical structure');
          
          const cityId = state.activeCampaign?.startingCity?.id;
          if (!cityId) {
            console.warn('[LegislationSlice] Cannot migrate: no starting city ID found');
            return state;
          }
          
          const newState = {
            ...state,
            cities: {
              ...state.cities,
              [cityId]: {
                proposedBills: state.city.proposedBills || [],
                activeLegislation: state.city.activeLegislation || [],
                passedBillsArchive: state.city.passedBillsArchive || [],
                failedBillsHistory: state.city.failedBillsHistory || [],
              }
            },
            _migrationChecked: true
          };
          
          // Remove the old flat city property
          delete newState.city;
          
          console.log(`[LegislationSlice] Migration completed for city ${cityId}`);
          return newState;
        }
        
        return state;
      });
    },

    // Ensure migration and initialization are complete
    ensureLegislationStructure: () => {
      const state = get();
      
      // Run migration if not checked yet
      if (!state._migrationChecked) {
        get().actions.migrateToHierarchicalCityStructure();
        set((s) => ({ ...s, _migrationChecked: true }));
      }
      
      // Initialize active city if needed
      const cityId = state.activeCampaign?.startingCity?.id;
      if (cityId && !state.cities[cityId]) {
        get().actions.initializeCityLegislation(cityId);
      }
    },

    // Helper function to get city legislation state, ensuring it's initialized
    getCityLegislationState: (state, cityId) => {
      if (!cityId) {
        // Fallback: use the player's starting city
        cityId = state.activeCampaign?.startingCity?.id;
      }
      
      if (!state.cities[cityId]) {
        // Initialize the city's legislation state if it doesn't exist
        state.cities[cityId] = getInitialCityLegislationState();
      }
      
      return state.cities[cityId];
    },

    proposeBill: (
      level,
      billName,
      policies,
      proposerId,
      proposerName,
      parameters = null,
      billType = "new",
      targetLawId = null,
      cityId = null // New parameter for city-specific bills
    ) => {
      // Ensure proper legislation structure before proposing
      get().actions.ensureLegislationStructure();
      
      set((state) => {
        // Handle hierarchical city structure
        if (level === "city") {
          if (!cityId) {
            cityId = state.activeCampaign?.startingCity?.id;
          }
          if (!cityId) {
            console.error('[proposeBill] Cannot propose city bill: no cityId provided and no starting city found');
            return state;
          }
          
          // Ensure city legislation state is initialized
          if (!state.cities[cityId]) {
            state.cities[cityId] = getInitialCityLegislationState();
          }
        } else if (!state[level]) {
          return state;
        }

        const dateProposed = { ...state.activeCampaign.currentDate };

        // Get country's political system for bill progression
        const countryData =
          state.activeCampaign.availableCountries?.find(
            (c) => c.id === state.activeCampaign.countryId
          ) || state.activeCampaign.country;
        const politicalSystemId =
          countryData?.politicalSystemId || "PRESIDENTIAL_REPUBLIC";

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
          status: level === "city" ? "under_review" : "in_committee", // City bills don't use committees
          dateProposed: dateProposed,
          votes: { yea: [], nay: [], abstain: [] },
          councilVotesCast: {},
        };

        // Initialize bill with political system-based stages
        const newBill = initializeBillStages(
          baseBill,
          politicalSystemId,
          dateProposed
        );

        get().actions.addNotification?.({
          message: `Bill Proposed: "${newBill.name}"`,
          category: "Legislation",
          type: "info",
        });

        // Store the bill in appropriate hierarchical structure
        if (level === "city") {
          return {
            ...state,
            cities: {
              ...state.cities,
              [cityId]: {
                ...state.cities[cityId],
                proposedBills: [...state.cities[cityId].proposedBills, newBill],
              },
            },
          };
        } else {
          return {
            ...state,
            [level]: {
              ...state[level],
              proposedBills: [...state[level].proposedBills, newBill],
            },
          };
        }
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
        let foundCityId = null;

        // Find the bill and its level
        // Check city bills first (hierarchical structure)
        for (const cityId of Object.keys(state.cities)) {
          const foundBill = state.cities[cityId].proposedBills.find(
            (b) => b.id === billId
          );
          if (foundBill) {
            bill = foundBill;
            foundLevel = "city";
            foundCityId = cityId;
            break;
          }
        }
        
        // Check state and national bills (flat structure)
        if (!bill) {
          for (const key of ["state", "national"]) {
            const foundBill = state[key].proposedBills.find(
              (b) => b.id === billId
            );
            if (foundBill) {
              bill = foundBill;
              foundLevel = key;
              break;
            }
          }
        }

        if (!bill) {
          return state;
        }

        level = foundLevel;

        // Get political system and legislature info
        const countryData =
          state.activeCampaign.availableCountries?.find(
            (c) => c.id === state.activeCampaign.countryId
          ) || state.activeCampaign.country;
        const politicalSystemId =
          countryData?.politicalSystemId ||
          bill.politicalSystemId ||
          "PRESIDENTIAL_REPUBLIC";
        const legislature = getLegislatureDetails(state.activeCampaign, level);

        // Merge AI votes into the bill's vote record before processing
        const billWithAIVotes = {
          ...bill,
          councilVotesCast: {
            ...(bill.councilVotesCast || {}),
            ...aiVotes,
          },
        };

        // Process the bill through its current stage
        const processedBill = processBillStage(
          billWithAIVotes,
          aiVotes,
          legislature,
          politicalSystemId,
          state.activeCampaign.currentDate
        );

        // Handle the result based on the bill's new status
        // Get the appropriate legislation state based on level and city
        const legislationState = foundLevel === "city" 
          ? state.cities[foundCityId] 
          : state[foundLevel];
          
        let newActiveLegislationList = [...legislationState.activeLegislation];
        let newPassedBillsArchive = [...legislationState.passedBillsArchive];
        let newFailedBillsHistory = [...legislationState.failedBillsHistory];
        let updatedBills = [...legislationState.proposedBills];

        // Update the bill in the proposed bills list
        const billIndex = updatedBills.findIndex((b) => b.id === billId);
        if (billIndex !== -1) {
          if (processedBill.status === "passed") {
            // Bill completed all stages, move to active legislation
            updatedBills.splice(billIndex, 1);

            // Handle different bill types for passed bills
            if (
              processedBill.billType === "repeal" &&
              processedBill.targetLawId
            ) {
              newActiveLegislationList = newActiveLegislationList.filter(
                (law) => law.id !== processedBill.targetLawId
              );
              get().actions.addNotification?.({
                message: `Law "${processedBill.name}" has been repealed.`,
                category: "Legislation",
                type: "success",
              });
            } else if (
              processedBill.billType === "amend" &&
              processedBill.targetLawId
            ) {
              // Amendment logic
              newActiveLegislationList = newActiveLegislationList.map((law) => {
                if (law.id === processedBill.targetLawId) {
                  const updatedPolicies = processedBill.policies.map(
                    (policyInBill) => {
                      const policyDef = state.availablePolicies[level].find(
                        (def) => def.id === policyInBill.policyId
                      );
                      return {
                        ...policyDef,
                        chosenParameters: policyInBill.chosenParameters,
                        monthsUntilEffective:
                          policyDef.durationToImplement || 0,
                        effectsApplied: false,
                      };
                    }
                  );
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
              const newPoliciesForLaw = processedBill.policies.map(
                (policyInBill) => {
                  const policyDef = state.availablePolicies[level].find(
                    (def) => def.id === policyInBill.policyId
                  );
                  return {
                    ...policyDef,
                    chosenParameters: policyInBill.chosenParameters,
                    monthsUntilEffective: policyDef?.durationToImplement || 0,
                    effectsApplied: false,
                  };
                }
              );
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
          } else if (processedBill.status === "failed") {
            // Bill failed at some stage, move to failed history
            updatedBills.splice(billIndex, 1);
            newFailedBillsHistory.push(processedBill);
            if (newFailedBillsHistory.length > 50) {
              newFailedBillsHistory = newFailedBillsHistory.slice(-50);
            }

            get().actions.addNotification?.({
              message: `Bill "${
                processedBill.name
              }" failed at ${processedBill.failureStage?.replace(
                /_/g,
                " "
              )} stage.`,
              category: "Legislation",
              type: "error",
            });
          } else {
            // Bill continues to next stage
            updatedBills[billIndex] = processedBill;
            const stageName = processedBill.currentStage
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            get().actions.addNotification?.({
              message: `Bill "${processedBill.name}" advanced to ${stageName} stage.`,
              category: "Legislation",
              type: "info",
            });
          }
        }

        // Return updated state with proper hierarchical structure
        if (foundLevel === "city") {
          return {
            ...state,
            cities: {
              ...state.cities,
              [foundCityId]: {
                ...state.cities[foundCityId],
                proposedBills: updatedBills,
                activeLegislation: newActiveLegislationList,
                passedBillsArchive: newPassedBillsArchive,
                failedBillsHistory: newFailedBillsHistory,
              },
            },
          };
        } else {
          return {
            ...state,
            [foundLevel]: {
              ...state[foundLevel],
              proposedBills: updatedBills,
              activeLegislation: newActiveLegislationList,
              passedBillsArchive: newPassedBillsArchive,
              failedBillsHistory: newFailedBillsHistory,
            },
          };
        }
      });
    },

    // DEPRECATED: Legacy function for backward compatibility - now uses the new stage system
    finalizeBillVote: (billId, level, aiVotes = {}) => {
      console.log(
        `[Legislation] finalizeBillVote called for ${billId} at ${level} level with ${
          Object.keys(aiVotes).length
        } AI votes`
      );
      // For backward compatibility, just call the new processBillStage function
      get().actions.processBillStage(billId, level, aiVotes);
    },

    // LEGACY: This action now finalizes a BILL vote (kept for reference but deprecated)
    finalizeBillVoteOld: (billId, level, aiVotes = {}) => {
      set((state) => {
        let bill = null;
        let foundLevel = null;

        // Find the bill and its level
        let foundCityId = null;
        
        // Check city bills first (hierarchical structure)
        for (const cityId of Object.keys(state.cities)) {
          const foundBill = state.cities[cityId].proposedBills.find(
            (b) => b.id === billId
          );
          if (foundBill) {
            bill = foundBill;
            foundLevel = "city";
            foundCityId = cityId;
            break;
          }
        }
        
        // Check state and national bills (flat structure)
        if (!bill) {
          for (const key of ["state", "national"]) {
            const foundBill = state[key].proposedBills.find(
              (b) => b.id === billId
            );
            if (foundBill) {
              bill = foundBill;
              foundLevel = key;
              break;
            }
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

        // Get the appropriate legislation state based on level and city (legacy function)
        const legislationState = foundLevel === "city" 
          ? state.cities[foundCityId] 
          : state[foundLevel];
          
        let newActiveLegislationList = [...legislationState.activeLegislation];
        let newPassedBillsArchive = [...legislationState.passedBillsArchive];
        let newFailedBillsHistory = [...legislationState.failedBillsHistory];

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

        const updatedBills = legislationState.proposedBills.filter(
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

        // Return updated state with proper hierarchical structure (legacy function)
        if (foundLevel === "city") {
          return {
            ...state,
            cities: {
              ...state.cities,
              [foundCityId]: {
                ...state.cities[foundCityId],
                proposedBills: updatedBills,
                activeLegislation: newActiveLegislationList,
                passedBillsArchive: newPassedBillsArchive,
                failedBillsHistory: newFailedBillsHistory,
              },
            },
          };
        } else {
          return {
            ...state,
            [foundLevel]: {
              ...state[foundLevel],
              proposedBills: updatedBills,
              activeLegislation: newActiveLegislationList,
              passedBillsArchive: newPassedBillsArchive,
              failedBillsHistory: newFailedBillsHistory,
            },
          };
        }
      });
    },

    processAIProposals: (level) => {
      const { activeCampaign } = get();
      if (!activeCampaign || !level) {
        return;
      }

      // Ensure proper legislation structure before processing
      get().actions.ensureLegislationStructure();

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
        
        // Get legislation state based on hierarchical structure
        let activeLegislation, existingProposedBills;
        if (level === "city") {
          const cityLegislation = state.cities?.[cityId] || { activeLegislation: [], proposedBills: [] };
          activeLegislation = cityLegislation.activeLegislation || [];
          existingProposedBills = cityLegislation.proposedBills || [];
        } else {
          activeLegislation = state[level]?.activeLegislation || [];
          existingProposedBills = state[level]?.proposedBills || [];
        }
        const proposedLegislation = [
          ...existingProposedBills,
          ...proposalsThisCycle,
        ];

        // Get failed bills history based on hierarchical structure
        let failedBillsHistory;
        if (level === "city") {
          const cityLegislation = state.cities?.[cityId] || { failedBillsHistory: [] };
          failedBillsHistory = cityLegislation.failedBillsHistory || [];
        } else {
          failedBillsHistory = state[level]?.failedBillsHistory || [];
        }

        const shouldPropose = shouldAIProposeBasedOnNeeds(
          ai,
          availablePolicyIds,
          relevantStats,
          activeLegislation,
          proposedLegislation,
          availablePolicies,
          failedBillsHistory,
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
        
        // Get legislation state based on hierarchical structure for context
        let contextActiveLegislation, contextProposedBills;
        if (level === "city") {
          const cityLegislation = state.cities?.[cityId] || { activeLegislation: [], proposedBills: [] };
          contextActiveLegislation = cityLegislation.activeLegislation || [];
          contextProposedBills = cityLegislation.proposedBills || [];
        } else {
          contextActiveLegislation = state[level]?.activeLegislation || [];
          contextProposedBills = state[level]?.proposedBills || [];
        }
        
        const context = {
          level,
          cityStats: getStatsForLevel(activeCampaign, level),
          activeLegislation: contextActiveLegislation,
          proposedBills: contextProposedBills,
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
            primaryProposer.name,
            null, // parameters
            "new", // billType
            null, // targetLawId
            cityId // cityId for hierarchical city structure
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

        // Process hierarchical city legislation
        for (const cityId of Object.keys(state.cities)) {
          const cityLegislation = state.cities[cityId];
          const activeLegislation = cityLegislation.activeLegislation;
          const effectsToApplyNow = [];
          const updatedLegislation = [];
          
          // Process city legislation (same logic as before)
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
              const updatedPolicies =
                leg.policies?.map((policy) => ({
                  ...policy,
                  monthsUntilEffective: Math.max(
                    0,
                    (policy.monthsUntilEffective || leg.monthsUntilEffective) -
                      1
                  ),
                })) || [];

              updatedLegislation.push({
                ...leg,
                monthsUntilEffective: leg.monthsUntilEffective - 1,
                policies: updatedPolicies,
              });
              hasChanges = true;
            } else if (leg.monthsUntilEffective === 0 && !leg.effectsApplied) {
              effectsToApplyNow.push(leg);

              // Update policies to mark as effective
              const updatedPolicies =
                leg.policies?.map((policy) => ({
                  ...policy,
                  monthsUntilEffective: 0,
                  effectsApplied: true,
                })) || [];

              updatedLegislation.push({
                ...leg,
                effectsApplied: true,
                policies: updatedPolicies,
              });
              hasChanges = true;
            } else {
              updatedLegislation.push(leg);
            }
          }

          if (hasChanges) {
            if (!updates.cities) updates.cities = {};
            updates.cities[cityId] = {
              ...state.cities[cityId],
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
                      { ...effect, level: "city" },
                      policy.chosenParameters
                    );
                  });
                }

                // Handle parameterized policies...
                if (
                  policy.isParameterized &&
                  policy.parameterDetails &&
                  policy.chosenParameters
                ) {
                  const pDetails = policy.parameterDetails;
                  const chosenValue = policy.chosenParameters[pDetails.key];

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
                        level: "city",
                      };
                      applyPolicyEffect(state.activeCampaign, tempEffect);
                    }

                    // Handle simulation variables
                    if (policy.setsSimulationVariable && pDetails.targetStat) {
                      const tempEffect = {
                        targetStat: pDetails.targetStat,
                        change: chosenValue,
                        type:
                          pDetails.adjustmentType === "set_value"
                            ? "absolute_set_rate"
                            : "absolute_change",
                        level: "city",
                        setsSimulationVariable: true,
                        parameterDetails: pDetails,
                        parameters: { [pDetails.key]: chosenValue },
                      };
                      applyPolicyEffect(state.activeCampaign, tempEffect);
                    }
                  }
                }

                newsEventsToAdd.push({
                  headline: `Policy Enacted: "${policy.name}" (city)`,
                  summary: `The policy has now taken full effect.`,
                  type: "policy_enacted",
                  policyId: policy.id,
                });
              });
            });

            // Recalculate budgets for affected city
            recalculateBudgetsForLevel(state.activeCampaign, "city");
          }
        }
        
        // Process state and national legislation (flat structure)
        for (const level of ["state", "national"]) {
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
              const updatedPolicies =
                leg.policies?.map((policy) => ({
                  ...policy,
                  monthsUntilEffective: Math.max(
                    0,
                    (policy.monthsUntilEffective || leg.monthsUntilEffective) -
                      1
                  ),
                })) || [];

              updatedLegislation.push({
                ...leg,
                monthsUntilEffective: leg.monthsUntilEffective - 1,
                policies: updatedPolicies,
              });
              hasChanges = true;
            } else if (leg.monthsUntilEffective === 0 && !leg.effectsApplied) {
              effectsToApplyNow.push(leg);

              // Update policies to mark as effective
              const updatedPolicies =
                leg.policies?.map((policy) => ({
                  ...policy,
                  monthsUntilEffective: 0,
                  effectsApplied: true,
                })) || [];

              updatedLegislation.push({
                ...leg,
                effectsApplied: true,
                policies: updatedPolicies,
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
          // Ensure proper immutable updates for each level and cities
          Object.keys(updates).forEach((key) => {
            if (key === "cities") {
              // Handle hierarchical city updates
              newState.cities = { ...newState.cities };
              Object.keys(updates.cities).forEach((cityId) => {
                newState.cities[cityId] = { ...newState.cities[cityId], ...updates.cities[cityId] };
              });
            } else {
              // Handle flat state/national updates
              newState[key] = { ...newState[key], ...updates[key] };
            }
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
      // Ensure proper legislation structure before processing
      get().actions.ensureLegislationStructure();
      
      set((state) => {
        const { activeCampaign } = state;

        // Process hierarchical city legislation
        for (const cityId of Object.keys(state.cities || {})) {
          const cityLegislation = state.cities[cityId];
          
          // PERFORMANCE OPTIMIZATION: Only fetch government offices relevant to this city
          const contextualGovernmentOffices =
            get().actions.getGovernmentOfficesForContext(
              "city",
              cityId,
              null
            );
          const { members: legislators } = getLegislatureDetails(
            activeCampaign,
            "city",
            contextualGovernmentOffices
          );
          const relevantStats = getStatsForLevel(activeCampaign, "city");

          if (!legislators || !relevantStats) continue;

          const updatedBills = cityLegislation.proposedBills.map((bill) => {
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
                  cityLegislation.activeLegislation,
                  cityLegislation.proposedBills,
                  contextualGovernmentOffices,
                  // Convert array to object with policy IDs as keys, and include bill-specific policies
                  {
                    ...state.availablePolicies["city"].reduce((acc, policy) => {
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
            cities: {
              ...state.cities,
              [cityId]: { ...state.cities[cityId], proposedBills: updatedBills },
            },
          };
        }

        // Process state and national legislation (flat structure)
        for (const level of ["state", "national"]) {
          // PERFORMANCE OPTIMIZATION: Only fetch government offices relevant to this level
          const cityId = activeCampaign?.startingCity?.id;
          const stateId = level === "state" ? activeCampaign?.regionId : null;
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
      
      // Find the bill in hierarchical structure
      let bill = null;
      if (level === "city") {
        // Look through all cities for the bill
        const state = get();
        for (const cityId of Object.keys(state.cities)) {
          bill = state.cities[cityId].proposedBills.find((b) => b.id === billId);
          if (bill) break;
        }
      } else {
        bill = get()[level]?.proposedBills.find((b) => b.id === billId);
      }

      if (!bill) return {};

      let members = [];
      let isPlayerCity = false;

      if (level === "city") {
        // For city bills, get city council members directly
        const cityOffices =
          get().actions.getCurrentCityGovernmentOffices?.() || {
            executive: [],
            legislative: [],
          };

        // Extract all city council members from legislative offices
        const councilMembers = [];
        cityOffices.legislative?.forEach((office) => {
          if (office.members && Array.isArray(office.members)) {
            councilMembers.push(...office.members);
          }
        });

        members = councilMembers;
        
        // Determine if this is the player's city
        // For now, city bills are always for the player's starting city, so we use individual AI voting
        // In the future, when we have multiple cities, we'll check bill.cityId against player's current city
        const playerCityId = activeCampaign?.startingCity?.id;
        const billCityId = bill.cityId || bill.targetCityId || playerCityId; // Bill's target city
        isPlayerCity = billCityId === playerCityId;
      } else {
        // For state/national bills, use the existing system
        const cityId = activeCampaign?.startingCity?.id;
        const stateId = activeCampaign?.regionId;
        const contextualGovernmentOffices =
          get().actions.getGovernmentOfficesForContext(level, cityId, stateId);
        const legislatureDetails = getLegislatureDetails(
          activeCampaign,
          level,
          contextualGovernmentOffices
        );
        members = legislatureDetails.members || [];
      }

      // AI members are those who are not the player (isPlayer: false)
      const aiCouncilMembers = members.filter((m) => !m.isPlayer);

      const policiesForLevel = availablePolicies[level];
      const stats = getStatsForLevel(activeCampaign, level);

      // Get the appropriate government offices context for the AI voting function
      let governmentOffices;
      if (level === "city") {
        governmentOffices =
          get().actions.getCurrentCityGovernmentOffices?.() || {
            executive: [],
            legislative: [],
          };
      } else {
        const cityId = activeCampaign?.startingCity?.id;
        const stateId = activeCampaign?.regionId;
        governmentOffices = get().actions.getGovernmentOfficesForContext(
          level,
          cityId,
          stateId
        );
      }

      // Use different voting systems based on whether this is the player's city
      let votes = {};
      
      if (level === "city" && !isPlayerCity) {
        // Non-player cities use efficient party-line voting
        console.log(`[runAllAIVotesForBill] Using party-line voting for non-player city bill: ${bill.name}`);
        
        const allParties = [
          ...(activeCampaign.generatedPartiesSnapshot || []),
          ...(activeCampaign.customPartiesSnapshot || [])
        ];
        
        const cityStats = stats; // City stats for contextual voting
        votes = calculateCityPartyLineVotes(members, bill, cityStats, allParties);
        
      } else {
        // Player's city or state/national level uses individual AI voting for more detail
        console.log(`[runAllAIVotesForBill] Using individual AI voting for player city/state bill: ${bill.name}`);
        
        for (const aiMember of aiCouncilMembers) {
          if (bill.councilVotesCast && bill.councilVotesCast[aiMember.id]) {
            continue; // Skip if vote already cast
          }

          try {
            // Get legislation state based on hierarchical structure
            const state = get();
            let activeLegislation, proposedBills;
            if (level === "city") {
              const cityId = activeCampaign?.startingCity?.id;
              const cityLegislation = state.cities?.[cityId] || { activeLegislation: [], proposedBills: [] };
              activeLegislation = cityLegislation.activeLegislation || [];
              proposedBills = cityLegislation.proposedBills || [];
            } else {
              activeLegislation = state[level]?.activeLegislation || [];
              proposedBills = state[level]?.proposedBills || [];
            }
            
            const voteChoice = decideAIVote(
              aiMember,
              bill,
              stats,
              activeLegislation,
              proposedBills,
              governmentOffices,
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
      }

      return votes; // Return the calculated votes
    },

    skipAndProcessVote: (billId, level) => {
      const aiVotes = get().actions.runAllAIVotesForBill?.(billId, level);
      get().actions.finalizeBillVote?.(billId, level, aiVotes);
    },
    
    processGubernatorialDecision: (billId, level) => {
      // Ensure proper legislation structure before processing
      get().actions.ensureLegislationStructure();
      
      const state = get();
      
      // Find the bill in hierarchical structure
      let bill = null;
      if (level === "city") {
        // Look through all cities for the bill
        for (const cityId of Object.keys(state.cities)) {
          bill = state.cities[cityId].proposedBills.find(b => b.id === billId);
          if (bill) break;
        }
      } else {
        bill = state[level]?.proposedBills?.find(b => b.id === billId);
      }
      
      if (!bill || bill.status !== 'awaiting_signature') {
        console.error(`[GUBERNATORIAL] Bill ${billId} not found or not awaiting signature`);
        return;
      }
      
      // Get the governor
      const activeCampaign = state.activeCampaign;
      let governor = null;
      
      if (level === 'state') {
        const stateOffices = state.actions.getGovernmentOfficesForContext?.('state', activeCampaign?.startingCity?.id, activeCampaign?.regionId);
        governor = stateOffices?.executive?.find(office => 
          office.officeNameTemplateId?.includes('governor') || office.officeName?.toLowerCase().includes('governor')
        )?.members?.[0];
      }
      
      if (!governor) {
        console.error(`[GUBERNATORIAL] No governor found for ${level} level`);
        // Default to signing if no governor found
        get().actions.processBillStage(billId, level, {});
        return;
      }
      
      console.log(`[GUBERNATORIAL] Governor ${governor.name || 'Governor'} reviewing "${bill.name}"`);
      
      // Calculate governor's decision using similar logic to AI voting
      const shouldSign = get().actions.calculateGovernorDecision(bill, governor, activeCampaign);
      
      if (shouldSign) {
        console.log(`[GUBERNATORIAL] Governor ${governor.name || 'Governor'} SIGNED "${bill.name}"`);
        // Bill passes - advance to completion
        get().actions.processBillStage(billId, level, {});
      } else {
        console.log(`[GUBERNATORIAL] Governor ${governor.name || 'Governor'} VETOED "${bill.name}"`);
        // Bill gets vetoed - mark as failed
        set((state) => {
          // Handle hierarchical city structure
          if (level === "city") {
            // Find the city containing this bill
            let targetCityId = null;
            for (const cityId of Object.keys(state.cities)) {
              const foundBill = state.cities[cityId].proposedBills.find(b => b.id === billId);
              if (foundBill) {
                targetCityId = cityId;
                break;
              }
            }
            
            if (!targetCityId) return state;
            
            const cityLegislation = state.cities[targetCityId];
            const billIndex = cityLegislation.proposedBills.findIndex(b => b.id === billId);
            
            if (billIndex !== -1) {
              const vetoedBill = {
                ...cityLegislation.proposedBills[billIndex],
                status: 'vetoed',
                gubernatorialInfo: {
                  ...cityLegislation.proposedBills[billIndex].gubernatorialInfo,
                  status: 'vetoed',
                  vetoDate: activeCampaign.currentDate,
                  vetoedBy: governor.name || 'Governor'
                }
              };
              
              // Move to failed bills history
              const newFailedBillsHistory = [...(cityLegislation.failedBillsHistory || []), vetoedBill];
              const newProposedBills = cityLegislation.proposedBills.filter(b => b.id !== billId);
              
              return {
                ...state,
                cities: {
                  ...state.cities,
                  [targetCityId]: {
                    ...cityLegislation,
                    proposedBills: newProposedBills,
                    failedBillsHistory: newFailedBillsHistory
                  }
                }
              };
            }
          } else {
            // Handle flat state/national structure
            const levelBills = state[level].proposedBills;
            const billIndex = levelBills.findIndex(b => b.id === billId);
            
            if (billIndex !== -1) {
              const vetoedBill = {
                ...levelBills[billIndex],
                status: 'vetoed',
                gubernatorialInfo: {
                  ...levelBills[billIndex].gubernatorialInfo,
                  status: 'vetoed',
                  vetoDate: activeCampaign.currentDate,
                  vetoedBy: governor.name || 'Governor'
                }
              };
              
              // Move to failed bills history
              const newFailedBillsHistory = [...(state[level].failedBillsHistory || []), vetoedBill];
              const newProposedBills = levelBills.filter(b => b.id !== billId);
              
              return {
                ...state,
                [level]: {
                  ...state[level],
                  proposedBills: newProposedBills,
                  failedBillsHistory: newFailedBillsHistory
                }
              };
            }
          }
          
          return state;
        });
      }
    },
    
    calculateGovernorDecision: (bill, governor, activeCampaign) => {
      // Use similar logic to AI legislator voting but adapted for executive decision
      try {
        const availablePolicies = get().availablePolicies?.[bill.level] || [];
        const policyMap = availablePolicies.reduce((acc, policy) => {
          acc[policy.id] = policy;
          return acc;
        }, {});
        
        // Add bill-specific policies if any
        const allPolicies = { ...policyMap, ...(bill.policyDefinitions || {}) };
        
        // Calculate governor's stance on the bill using similar logic to AI voting
        const { calculatePoliticianStanceOnBill } = require('../utils/aiUtils.js');
        const stance = calculatePoliticianStanceOnBill(governor, bill, allPolicies);
        
        // Convert stance to sign/veto decision
        let signProbability = 0.5; // Base 50% chance
        
        if (stance === 'strongly_support') {
          signProbability = 0.9;
        } else if (stance === 'support') {
          signProbability = 0.75;
        } else if (stance === 'neutral') {
          signProbability = 0.6; // Slight bias toward signing (status quo)
        } else if (stance === 'oppose') {
          signProbability = 0.25;
        } else if (stance === 'strongly_oppose') {
          signProbability = 0.1;
        }
        
        // Add some randomness for political realism
        const randomFactor = Math.random() * 0.2 - 0.1; // ±10% random adjustment
        signProbability = Math.max(0.05, Math.min(0.95, signProbability + randomFactor));
        
        const shouldSign = Math.random() < signProbability;
        
        console.log(`[GUBERNATORIAL DECISION] Governor ${governor.name || 'Governor'} stance: ${stance}, sign probability: ${(signProbability * 100).toFixed(1)}%, decision: ${shouldSign ? 'SIGN' : 'VETO'}`);
        
        return shouldSign;
        
      } catch (error) {
        console.error('[GUBERNATORIAL] Error calculating governor decision:', error);
        // Default to signing on error (benefit of the doubt)
        return true;
      }
    },

    processImpendingVotes: () => {
      // Ensure proper legislation structure before processing
      get().actions.ensureLegislationStructure();
      
      const state = get();
      const currentDate = state.activeCampaign.currentDate;

      // Collect all proposed bills from hierarchical structure
      const allProposedBills = [];
      
      // Add city bills from hierarchical structure
      Object.values(state.cities || {}).forEach(cityLegislation => {
        allProposedBills.push(...(cityLegislation.proposedBills || []));
      });
      
      // Add state and national bills
      allProposedBills.push(...(state.state.proposedBills || []));
      allProposedBills.push(...(state.national.proposedBills || []));

      const votesToQueue = [];
      const existingQueue = state.voteQueue || [];
      const existingIds = new Set(existingQueue.map((v) => v.billId));

      allProposedBills.forEach((bill) => {
        // Get the appropriate vote date based on bill level AND current status
        let voteDate = null;
        let voteType = "unknown";

        if (
          bill.level === "city" &&
          bill.councilVoteInfo?.councilVoteScheduled
        ) {
          voteDate = bill.councilVoteInfo.councilVoteScheduled;
          voteType = "council";
        } else if (
          bill.level !== "city" &&
          bill.status === "in_committee" &&
          bill.committeeInfo?.committeeVoteScheduled
        ) {
          // Only check committee votes if bill is still in committee
          voteDate = bill.committeeInfo.committeeVoteScheduled;
          voteType = "committee";
          console.log(`[VOTE DETECTION] "${bill.name}" committee vote scheduled for ${voteDate.month}/${voteDate.day}/${voteDate.year}`);
        } else if (
          bill.level !== "city" &&
          bill.status === "floor_consideration" &&
          bill.floorVoteInfo?.floorVoteScheduled
        ) {
          // Only check floor votes if bill is at floor consideration
          voteDate = bill.floorVoteInfo.floorVoteScheduled;
          voteType = "floor";
        }

        // Debug bills in committee without votes scheduled
        if (bill.level !== "city" && bill.status === "in_committee" && !bill.committeeInfo?.committeeVoteScheduled) {
          console.log(`[VOTE ERROR] "${bill.name}" is in committee (stage: ${bill.currentStage}) but has no committee vote scheduled`);
        }
        
        // Check if vote is scheduled for today or overdue
        const voteToday =
          voteDate &&
          voteDate.year === currentDate.year &&
          voteDate.month === currentDate.month &&
          voteDate.day === currentDate.day;

        const voteOverdue =
          voteDate &&
          (voteDate.year < currentDate.year ||
            (voteDate.year === currentDate.year &&
              voteDate.month < currentDate.month) ||
            (voteDate.year === currentDate.year &&
              voteDate.month === currentDate.month &&
              voteDate.day < currentDate.day));

        if (
          bill.status === "pending_vote" ||
          (bill.status === "in_committee" && (voteToday || voteOverdue)) ||
          (bill.status === "floor_consideration" && (voteToday || voteOverdue))
        ) {
          if (voteToday || voteOverdue) {
            if (!existingIds.has(bill.id)) {
              console.log(
                `[VOTE] "${bill.name}" ${voteType} vote due (${voteDate?.month}/${voteDate?.day}/${voteDate?.year})`
              );
              votesToQueue.push({ billId: bill.id, level: bill.level });
            }
          } else if (bill.status === "pending_vote" && !voteDate) {
            // If a bill is pending_vote but has no scheduled date, assume it's due today
            if (!existingIds.has(bill.id)) {
              votesToQueue.push({ billId: bill.id, level: bill.level });
            }
          }
        }
      });

      if (votesToQueue.length > 0) {
        get().actions.startVotingQueue?.(votesToQueue);
      }

      // Return the list of votes found so the caller can use it immediately
      return votesToQueue;
    },

    // Party-based legislation system for non-player cities
    processPartyBasedLegislation: () => {
      const { activeCampaign } = get();
      if (!activeCampaign) return;

      const playerCityId = activeCampaign.startingCity?.id;
      const allParties = [
        ...(activeCampaign.generatedPartiesSnapshot || []),
        ...(activeCampaign.customPartiesSnapshot || [])
      ];
      
      // For now, we only have the player's city, but this is the framework
      // for when we have multiple cities
      const allCities = [activeCampaign.startingCity].filter(Boolean);
      
      if (allCities.length === 0 || allParties.length === 0) return;

      // Get appropriate policy definitions
      const allPolicyDefs = CITY_POLICIES; // City level for now
      
      try {
        // Batch process proposals for non-player cities
        const newProposals = batchProcessCityProposals(
          allCities,
          playerCityId,
          allParties,
          allPolicyDefs,
          activeCampaign.currentDate
        );

        // Add new proposals to city legislation
        Object.entries(newProposals).forEach(([cityId, proposals]) => {
          if (proposals.length > 0) {
            console.log(`[PartyLegislation] Adding ${proposals.length} party-proposed bills to city ${cityId}`);
            
            // For now, add to the main city's proposed bills since we only have one city
            // In future, this would go to each city's individual legislation store
            proposals.forEach(proposal => {
              get().actions.proposeBill(
                'city',
                proposal.policies,
                proposal.name,
                proposal.proposingPartyName || 'Unknown Party',
                proposal.id
              );
            });
          }
        });

        // Create activity summary for monitoring/debugging
        const activitySummary = createLegislationActivitySummary(newProposals, {});
        
        if (activitySummary.totalProposals > 0) {
          console.log('[PartyLegislation] Activity Summary:', {
            totalProposals: activitySummary.totalProposals,
            citiesActive: activitySummary.totalCitiesWithActivity,
            themes: activitySummary.proposalsByTheme,
            partiesActive: activitySummary.partiesActive.length
          });
        }

      } catch (error) {
        console.error('[PartyLegislation] Error processing party-based legislation:', error);
      }
    },
  },
});
