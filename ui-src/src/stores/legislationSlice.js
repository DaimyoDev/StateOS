// src/stores/legislationSlice.js
// This slice manages the state of proposed and active legislation.
// It contains the full logic for AI voting and applying policy effects to the campaign state.

import { generateId, getRandomInt } from "../utils/core.js";
import {
  CITY_POLICIES,
  STATE_POLICIES,
  NATIONAL_POLICIES,
} from "../data";
import { applyPolicyEffect } from "../simulation/applyPolicyEffects.js";
import { decideAndAuthorAIBill } from "../simulation/aiProposal.js";
import { decideAIVote } from "../simulation/aiVoting.js";
import {
  getLegislatureDetails,
  getStatsForLevel,
} from "../utils/legislationUtils";

const getInitialLegislationState = () => ({
  city: {
    proposedBills: [],
    activeLegislation: [],
    passedBillsArchive: [],
  },
  state: {
    proposedBills: [],
    activeLegislation: [],
    passedBillsArchive: [],
  },
  national: {
    proposedBills: [],
    activeLegislation: [],
    passedBillsArchive: [],
  },
  savedBillTemplates: [],
});

const addDaysToDate = (date, days) => {
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
    city: CITY_POLICIES,
    state: STATE_POLICIES,
    national: NATIONAL_POLICIES,
  },

  actions: {
    resetLegislationState: () => set({
      ...getInitialLegislationState(),
      availablePolicies: {
        city: CITY_POLICIES,
        state: STATE_POLICIES,
        national: NATIONAL_POLICIES,
      },
    }),

    proposeBill: (level, billName, policies, proposerId, proposerName) => {
      set((state) => {
        if (!state[level]) {
          return state;
        }

        const dateProposed = { ...state.activeCampaign.currentDate };
        const voteScheduledFor = addDaysToDate(dateProposed, getRandomInt(7, 21));

        const newBill = {
          id: `bill_${generateId()}`,
          name:
            billName ||
            generateAIBillName(state.activeCampaign.currentDate.year),
          proposerId,
          proposerName,
          level, // Store the level on the bill itself
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
          status: "pending_vote",
          dateProposed: dateProposed,
          voteScheduledFor: voteScheduledFor,
          votes: { yea: [], nay: [], abstain: [] },
          councilVotesCast: {},
        };

        get().actions.addToast?.({
          message: `Bill Proposed at ${level} level: "${newBill.name}"`,
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
    saveBillTemplate: (templateName, policies) => {
      set((state) => {
        const newTemplate = {
          templateId: `bill_template_${generateId()}`,
          name: templateName,
          policies: policies,
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

    // NEW: This action now finalizes a BILL vote
    finalizeBillVote: (billId) => {
      set((state) => {
        let bill = null;
        let level = null;

        // Find the bill and its level
        for (const key of ["city", "state", "national"]) {
          const foundBill = state[key].proposedBills.find((b) => b.id === billId);
          if (foundBill) {
            bill = foundBill;
            level = key;
            break;
          }
        }

        if (!bill) {
          return state;
        }

        const { size: legislatureSize } = getLegislatureDetails(
          state.activeCampaign,
          level
        );
        const councilSize = legislatureSize;
        const majorityNeeded = Math.floor(councilSize / 2) + 1;
        const yeaVotes = bill.votes.yea?.length || 0;
        const nayVotes = bill.votes.nay?.length || 0;
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
          },
        };
        get().actions.generateAndAddNewsForAllOutlets?.(voteEvent);

        let newActiveLegislationList = [...state[level].activeLegislation];
        let newPassedBillsArchive = [...state[level].passedBillsArchive];

        if (billDidPass) {
          bill.policies.forEach((policyInBill) => {
            const policyDef = state.availablePolicies[level].find(
              (p) => p.id === policyInBill.policyId
            );
            if (policyDef) {
              newActiveLegislationList.push({
                id: `active_${policyInBill.policyId}_${generateId()}`,
                policyId: policyInBill.policyId,
                policyName: policyDef.name,
                description: policyDef.description,
                dateEnacted: { ...state.activeCampaign.currentDate },
                monthsUntilEffective: policyDef.durationToImplement || 0,
                effectsApplied: false,
                effects: policyDef.effects,
                proposerId: bill.proposerId,
                level: level,
                isParameterized: policyDef.isParameterized,
                parameterDetails: policyDef.parameterDetails,
                chosenParameters: policyInBill.chosenParameters,
              });
            }
          });

          const archivedBill = {
            ...bill,
            datePassed: { ...state.activeCampaign.currentDate },
            status: "passed",
          };
          newPassedBillsArchive = [...state[level].passedBillsArchive, archivedBill];
        }

        get().actions.addToast?.({
          message: `Vote on "${bill.name}" (${level}) has concluded. The bill has ${
            billDidPass ? "passed" : "failed"
          }.`,
          type: billDidPass ? "success" : "error",
        });

        const updatedBills = state[level].proposedBills.map((b) =>
          b.id === billId
            ? { ...b, status: billDidPass ? "passed" : "failed" }
            : b
        );

        return {
          [level]: {
            ...state[level],
            proposedBills: updatedBills,
            activeLegislation: newActiveLegislationList,
            passedBillsArchive: newPassedBillsArchive,
          },
        };
      });
    },

    processAIProposals: () => {
      const { activeCampaign } = get();
      if (!activeCampaign) {
        return;
      }

      const levels = ["city", "state", "national"];
      levels.forEach((level) => {
        const { members: legislators } = getLegislatureDetails(
          activeCampaign,
          level
        );

        const aiLegislators = legislators.filter(
          (m) => m.id !== activeCampaign.playerPoliticianId
        );

        aiLegislators.forEach((ai) => {
          const proposalChance =
            level === "city" ? 0.5 : level === "state" ? 0.3 : 0.2;
          const roll = Math.random();

          if (roll < proposalChance) {
            const state = get();
            const availablePolicies = state.availablePolicies?.[level] || [];
            const availablePolicyIds = availablePolicies.map(p => p.id);

            const relevantStats = level === 'city' ? activeCampaign.startingCity?.stats : 
                               level === 'state' ? activeCampaign.regions?.find(r => r.id === activeCampaign.startingCity?.regionId)?.stats :
                               activeCampaign.country?.stats;

            const activeLegislation = get()[level]?.activeLegislation || [];
            const proposedLegislation = get()[level]?.proposedBills || [];

            const authoredPolicies = decideAndAuthorAIBill(
              ai,
              availablePolicyIds,
              relevantStats,
              activeLegislation,
              proposedLegislation,
              availablePolicies
            );

            if (!authoredPolicies || !authoredPolicies.policies || authoredPolicies.policies.length === 0) {
              return;
            }

            const politicianData = activeCampaign.politicians.state.get(ai.id);
            const proposerName = politicianData?.name || ai.name || 'An AI Politician';

            get().actions.proposeBill(
              level,
              null,
              authoredPolicies.policies,
              ai.id,
              proposerName
            );
          }
        });
      });
    },

    decideAndAuthorAIBill,

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
      set((state) => {
        if (!state.activeCampaign) return state;

        let legislationChanged = false;
        let updatedState = { ...state };
        let updatedActiveCampaign = { ...state.activeCampaign };

        for (const level of ["city", "state", "national"]) {
          const effectsToApplyNow = [];
          const updatedLevelLegislation = updatedState[level].activeLegislation.map((leg) => {
            if (leg.monthsUntilEffective > 0) {
              legislationChanged = true;
              return { ...leg, monthsUntilEffective: leg.monthsUntilEffective - 1 };
            }
            if (leg.monthsUntilEffective === 0 && !leg.effectsApplied) {
              legislationChanged = true;
              effectsToApplyNow.push(leg);
              return { ...leg, effectsApplied: true };
            }
            return leg;
          });

          updatedState = {
            ...updatedState,
            [level]: { ...updatedState[level], activeLegislation: updatedLevelLegislation },
          };

          if (effectsToApplyNow.length > 0) {
            effectsToApplyNow.forEach((policy) => {
              const targetObjectPath = level === 'city' ? 'startingCity.stats' : (level === 'state' ? 'activeState.stats' : 'national.stats');

              policy.effects.forEach((effect) => {
                const effectWithScope = { ...effect, targetScope: targetObjectPath };
                updatedActiveCampaign = applyPolicyEffect(
                  updatedActiveCampaign,
                  { ...effectWithScope, parameterDetails: policy.parameterDetails },
                  policy.chosenParameters
                );
              });

              if (policy.isParameterized && policy.parameterDetails && policy.chosenParameters) {
                const pDetails = policy.parameterDetails;
                const chosenValue = policy.chosenParameters[pDetails.key];
                if (chosenValue !== undefined) {
                  let path = '';
                  if (pDetails.targetBudgetLine) {
                    path = `${targetObjectPath}.budget.expenseAllocations.${pDetails.targetBudgetLine}`;
                  } else if (pDetails.targetTaxRate) {
                    path = `${targetObjectPath}.budget.taxRates.${pDetails.targetTaxRate}`;
                  }

                  if(path){
                    const tempEffect = {
                      targetStat: path,
                      change: chosenValue,
                      type: pDetails.valueType === 'percentage_point' ? 'percentage_point_change' : 'absolute_change',
                    };
                    updatedActiveCampaign = applyPolicyEffect(updatedActiveCampaign, tempEffect);
                  }
                }
              }

              get().actions.addNewsEvent?.({
                headline: `Policy Enacted: "${policy.policyName}" (${level})`,
                summary: `The policy has now taken full effect.`, 
                type: "policy_enacted",
                policyId: policy.policyId,
              });
            });
          }
        }

        if (legislationChanged) {
          return { ...updatedState, activeCampaign: updatedActiveCampaign };
        }

        return state;
      });
    },

    processDailyBillCommentary: () => {
      set((state) => {
        const { activeCampaign } = state;
        for (const level of ["city", "state", "national"]) {
          const { members: legislators } = getLegislatureDetails(
            activeCampaign,
            level
          );
          const relevantStats = getStatsForLevel(activeCampaign, level);

          if (!legislators || !relevantStats) continue;

          const updatedBills = state[level].proposedBills.map((bill) => {
            if (bill.status !== "pending_vote") return bill;

            const newStances = [...(bill.publicStances || [])];

            legislators.forEach((ai) => {
              if (ai.id === activeCampaign.playerPoliticianId) return;
              const hasStance = newStances.some((s) => s.politicianId === ai.id);
              if (hasStance) return;

              if (Math.random() < 0.25) {
                const voteLeaning = decideAIVote(
                  ai,
                  bill,
                  relevantStats,
                  state[level].activeLegislation,
                  state[level].proposedBills,
                  activeCampaign.governmentOffices
                );

                let stance = "undecided";
                if (voteLeaning === "yea") stance = "leaning_yea";
                if (voteLeaning === "nay") stance = "leaning_nay";

                const politicianData = activeCampaign.politicians.state.get(ai.id);

                newStances.push({
                  politicianId: ai.id,
                  politicianName: politicianData?.name || 'AI Politician',
                  stance: stance,
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

    runAllAIVotesForBill: (billId) => {
      const { activeCampaign } = get();
      let bill = null;
      let level = null;

      for (const key of ["city", "state", "national"]) {
        const foundBill = get()[key].proposedBills.find((b) => b.id === billId);
        if (foundBill) {
          bill = foundBill;
          level = key;
          break;
        }
      }

      if (!bill) {
        return;
      }

      const { members: legislators } = getLegislatureDetails(activeCampaign, level);
      const relevantStats = getStatsForLevel(activeCampaign, level);

      if (!legislators || !relevantStats) return;

      legislators.forEach((ai) => {
        if (
          ai.id === activeCampaign.playerPoliticianId ||
          (bill.councilVotesCast && bill.councilVotesCast[ai.id])
        ) {
          return;
        }

        const voteChoice = decideAIVote(
          ai,
          bill,
          relevantStats,
          get()[level].activeLegislation,
          get()[level].proposedBills,
          activeCampaign.governmentOffices
        );

        get().actions.recordCouncilVote(billId, ai.id, voteChoice);
      });
    },

    processImpendingVotes: () => {
      const state = get();
      const currentDate = state.activeCampaign.currentDate;
      const allProposedBills = [
        ...state.city.proposedBills,
        ...state.state.proposedBills,
        ...state.national.proposedBills,
      ];

      allProposedBills.forEach((bill) => {
        if (
          bill.status === "pending_vote" &&
          bill.voteScheduledFor.year === currentDate.year &&
          bill.voteScheduledFor.month === currentDate.month &&
          bill.voteScheduledFor.day === currentDate.day
        ) {
          get().actions.finalizeBillVote(bill.id);
        }
      });
    },
  },
});
