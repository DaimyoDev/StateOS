// src/stores/legislationSlice.js
// This slice manages the state of proposed and active legislation.
// It contains the full logic for AI voting and applying policy effects to the campaign state.

import { generateId, getRandomInt } from "../utils/core.js";
import { CITY_POLICIES, STATE_POLICIES} from "../data/policyDefinitions";
import { NATIONAL_POLICIES } from "../data/nationalPolicyDefinitions";
import { produce } from "immer";
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
        const voteScheduledFor = addDaysToDate(dateProposed, getRandomInt(7, 21));

        const newBill = {
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
    saveBillTemplate: (templateName, policies, billType, targetLawId, proposerName) => {
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

    // NEW: This action now finalizes a BILL vote
    finalizeBillVote: (billId, level) => {
      console.log(`[Vote] Finalizing vote for bill ${billId} at ${level} level.`);
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

        console.log(`[Vote] Bill ${billId} ${billDidPass ? 'PASSED' : 'FAILED'}. YEA: ${yeaVotes}, NAY: ${nayVotes}`);

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
          const policyDef = state.availablePolicies[level].find(
            (p) => p.id === bill.policies[0]?.policyId
          );

          if (bill.billType === 'repeal' && bill.targetLawId) {
            newActiveLegislationList = newActiveLegislationList.filter(law => law.id !== bill.targetLawId);
            get().actions.addToast?.({ message: `Law "${bill.name}" has been repealed.`, type: 'success' });
          } else if (bill.billType === 'amend' && bill.targetLawId) {
            newActiveLegislationList = newActiveLegislationList.map(law => {
              if (law.id === bill.targetLawId) {
                return {
                  ...law, // Keep original ID and enactment date
                  name: bill.name,
                  policies: bill.policies.map(p => ({
                    ...state.availablePolicies[level].find(def => def.id === p.policyId),
                    parameters: bill.parameters,
                  })),
                  // Reset effect tracking for the amended law
                  monthsUntilEffective: state.availablePolicies[level].find(def => def.id === bill.policies[0]?.policyId)?.monthsUntilEffective || 0,
                  effectsApplied: false,
                };
              }
              return law;
            });
            get().actions.addToast?.({ message: `Law "${bill.name}" has been amended.`, type: 'success' });
          } else { // 'new' bill type
            const policyDef = state.availablePolicies[level].find(
              (p) => p.id === bill.policies[0]?.policyId
            );
            if (policyDef) {
              const newActiveLegislation = {
                id: `law_${bill.id}`,
                name: bill.name,
                level: level,
                proposerId: bill.proposerId,
                policies: [{ ...policyDef, parameters: bill.parameters }],
                dateEnacted: { ...get().activeCampaign.currentDate },
                monthsUntilEffective: policyDef.monthsUntilEffective || 0,
                effectsApplied: false,
              };
              newActiveLegislationList.push(newActiveLegislation);
            }
          }

          const passedBillRecord = {
            ...bill,
            status: "passed",
          };
          newPassedBillsArchive.push(passedBillRecord);
        } else {
          const failedBillRecord = {
            ...bill,
            status: "failed",
          };
          // For now, failed bills are just removed, not archived.
        }

        // Remove the finalized bill from the proposedBills list
        const updatedBills = state[level].proposedBills.filter(
          (b) => b.id !== billId
        );

        get().actions.addToast?.({
          message: `Vote on "${bill.name}" (${level}) has concluded. The bill has ${
            billDidPass ? "passed" : "failed"
          }.`,
          type: billDidPass ? "success" : "error",
        });

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

    processAIProposals: (level) => {
      console.log(`[AI] Processing proposals for ${level}`);
      const { activeCampaign } = get();
      if (!activeCampaign || !level) {
        return;
      }

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
          const availablePolicyIds = availablePolicies.map((p) => p.id);

          const relevantStats =
            level === "city"
              ? activeCampaign.startingCity?.stats
              : level === "state"
              ? activeCampaign.regions?.find(
                  (r) => r.id === activeCampaign.startingCity?.regionId
                )?.stats
              : activeCampaign.country?.stats;

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

          if (
            !authoredPolicies ||
            !authoredPolicies.policies ||
            authoredPolicies.policies.length === 0
          ) {
            return;
          }

          const politicianData = activeCampaign.politicians.state.get(ai.id);
          const proposerName =
            politicianData?.name || ai.name || "An AI Politician";

          get().actions.proposeBill(
            level,
            null,
            authoredPolicies.policies,
            ai.id,
            proposerName
          );
        }
      });
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
      set(
        produce((draft) => {
          if (!draft.activeCampaign) return;

          for (const level of ["city", "state", "national"]) {
            const effectsToApplyNow = [];
            draft[level].activeLegislation = draft[level].activeLegislation.map((leg) => {
              if (leg.monthsUntilEffective > 0) {
                return { ...leg, monthsUntilEffective: leg.monthsUntilEffective - 1 };
              }
              if (leg.monthsUntilEffective === 0 && !leg.effectsApplied) {
                effectsToApplyNow.push(leg);
                return { ...leg, effectsApplied: true };
              }
              return leg;
            });

            if (effectsToApplyNow.length > 0) {
              effectsToApplyNow.forEach((law) => {
                if (!law.policies || !Array.isArray(law.policies)) return;

                law.policies.forEach((policy) => {
                  if (policy.effects && Array.isArray(policy.effects)) {
                    policy.effects.forEach((effect) => {
                      applyPolicyEffect(
                        draft.activeCampaign,
                        { ...effect, level: law.level },
                        law.parameters
                      );
                    });
                  }

                  if (policy.isParameterized && policy.parameterDetails && law.parameters) {
                    const pDetails = policy.parameterDetails;
                    const chosenValue = law.parameters[pDetails.key];
                    if (chosenValue !== undefined) {
                      const tempEffect = {
                        targetStat: pDetails.targetBudgetLine || pDetails.targetTaxRate,
                        change: chosenValue,
                        type: pDetails.valueType === 'percentage_point' ? 'percentage_point_change' : 'absolute_change',
                        isBudgetItem: !!pDetails.targetBudgetLine,
                        isTaxRate: !!pDetails.targetTaxRate,
                        level: law.level,
                      };
                      applyPolicyEffect(draft.activeCampaign, tempEffect);
                    }
                  }

                  get().actions.addNewsEvent?.({
                    headline: `Policy Enacted: "${policy.name}" (${law.level})`,
                    summary: `The policy has now taken full effect.`,
                    type: "policy_enacted",
                    policyId: policy.id,
                  });
                });
              });
            }
          }
        })
      );
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
                  activeCampaign.governmentOffices,
                  state.availablePolicies[level]
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

    runAllAIVotesForBill: (billId, level) => {
      const { activeCampaign, city, state, national, availablePolicies } = get();
      const { members } = getLegislatureDetails(activeCampaign, level);
      const bill = get()[level].proposedBills.find((b) => b.id === billId);

      if (!bill) return;

      const aiCouncilMembers = members.filter((m) => m.isAI);
      const policiesForLevel = availablePolicies[level];
      const stats = getStatsForLevel(activeCampaign, level);

      const votes = {};
      aiCouncilMembers.forEach((aiMember) => {
        // Skip if this AI has already cast a vote on this bill
        if (bill.councilVotesCast && bill.councilVotesCast[aiMember.id]) {
          return;
        }

        const voteChoice = decideAIVote(aiMember, bill, policiesForLevel, stats);
        votes[aiMember.id] = voteChoice;
      });

      if (Object.keys(votes).length > 0) {
        get().actions.recordBatchCouncilVotes(billId, votes);
      }
    },

    processImpendingVotes: () => {
      set((state) => {
        const currentDate = state.activeCampaign.currentDate;
        const allProposedBills = [
          ...state.city.proposedBills,
          ...state.state.proposedBills,
          ...state.national.proposedBills,
        ];

        // Build a queue of bills scheduled to be voted on today
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
        return state;
      });
    },
  },
});
