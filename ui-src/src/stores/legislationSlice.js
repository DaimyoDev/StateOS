// src/stores/legislationSlice.js
// This slice manages the state of proposed and active legislation.
// It contains the full logic for AI voting and applying policy effects to the campaign state.

import { generateId, getRandomInt } from "../utils/core.js";
import { CITY_POLICIES, STATE_POLICIES } from "../data/policyDefinitions";
import { NATIONAL_POLICIES } from "../data/nationalPolicyDefinitions";
import { produce } from "immer";
import { applyPolicyEffect } from "../simulation/applyPolicyEffects.js";
import { decideAndAuthorAIBill, shouldAIProposeBasedOnNeeds } from "../simulation/aiProposal.js";
import { mergeAIProposals } from "../simulation/billMerging.js";
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

        get().actions.addNotification?.({
          message: `Bill Proposed: "${newBill.name}"`,
          category: 'Legislation',
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
    finalizeBillVote: (billId, level, aiVotes = {}) => {
      set((state) => {
        console.log(`[Vote] Finalizing vote for bill ${billId} at ${level} level.`);
        let bill = null;
        let foundLevel = null;

        // Find the bill and its level
        for (const key of ["city", "state", "national"]) {
          const foundBill = state[key].proposedBills.find((b) => b.id === billId);
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

        // Debug logging to understand the vote data
        console.log(`[Vote Debug] Existing votes:`, bill.councilVotesCast);
        console.log(`[Vote Debug] AI votes passed:`, aiVotes);
        
        // Combine existing votes with the new AI votes being passed in
        const combinedVotes = { ...bill.councilVotesCast, ...aiVotes };
        console.log(`[Vote Debug] Combined votes:`, combinedVotes);
        
        const yeaVotes = Object.values(combinedVotes).filter((v) => v === "yea" || v === "YEA").length;
        const nayVotes = Object.values(combinedVotes).filter((v) => v === "nay" || v === "NAY").length;
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
        let newFailedBillsHistory = [...state[level].failedBillsHistory];

        if (billDidPass) {
          const passedBillRecord = {
            ...bill,
            status: "passed",
            councilVotesCast: combinedVotes,
            datePassed: { ...get().activeCampaign.currentDate },
          };
          newPassedBillsArchive.push(passedBillRecord);

          if (bill.billType === 'repeal' && bill.targetLawId) {
            newActiveLegislationList = newActiveLegislationList.filter(law => law.id !== bill.targetLawId);
            get().actions.addNotification?.({
              message: `Law "${bill.name}" has been repealed.`,
              category: 'Legislation',
              type: 'success',
            });
          } else if (bill.billType === 'amend' && bill.targetLawId) {
            newActiveLegislationList = newActiveLegislationList.map(law => {
              if (law.id === bill.targetLawId) {
                const updatedPolicies = bill.policies.map(policyInBill => {
                  const policyDef = state.availablePolicies[level].find(def => def.id === policyInBill.policyId);
                  return {
                    ...policyDef,
                    chosenParameters: policyInBill.chosenParameters,
                    monthsUntilEffective: policyDef.monthsUntilEffective || 0,
                    effectsApplied: false,
                  };
                });
                return { ...law, name: bill.name, policies: updatedPolicies };
              }
              return law;
            });
            get().actions.addNotification?.({
              message: `Law "${bill.name}" has been amended.`,
              category: 'Legislation',
              type: 'success',
            });
          } else { // 'new' bill type
            const newPoliciesForLaw = bill.policies.map(policyInBill => {
              const policyDef = state.availablePolicies[level].find(def => def.id === policyInBill.policyId);
              return {
                ...policyDef,
                chosenParameters: policyInBill.chosenParameters,
                monthsUntilEffective: policyDef?.monthsUntilEffective || 0,
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

        const updatedBills = state[level].proposedBills.filter((b) => b.id !== billId);

        get().actions.addNotification?.({
          message: `Vote on "${bill.name}" (${level}) has concluded. The bill has ${billDidPass ? "passed" : "failed"}.`,
          category: 'Legislation',
          type: billDidPass ? 'success' : 'error',
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
        const proposedLegislation = [...existingProposedBills, ...proposalsThisCycle];

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
              name: authoredBill.name || `${proposerName}'s Bill`
            };
            individualProposals.push(proposal);
            
            // Add this proposal to the cycle tracker so subsequent AIs can see it
            proposalsThisCycle.push({
              id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
              name: proposal.name,
              policies: proposal.policies,
              proposerId: ai.id,
              proposerName: proposerName
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
          governmentOffices: activeCampaign.governmentOffices || [],
          allPolicyDefsForLevel: state.availablePolicies[level].reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
        };

        const mergedBills = mergeAIProposals(individualProposals, context);

        mergedBills.forEach(bill => {
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
              if (ai.isPlayer || ai.id === activeCampaign.playerPoliticianId) return;
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
                  // Convert array to object with policy IDs as keys, and include bill-specific policies
                  {
                    ...state.availablePolicies[level].reduce((acc, policy, index) => {
                      acc[policy.id] = policy;
                      return acc;
                    }, {}),
                    ...(bill.policyDefinitions || {})
                  }
                );

                let stance = "undecided";
                if (voteLeaning === "yea") stance = "leaning_yea";
                if (voteLeaning === "nay") stance = "leaning_nay";

                const politicianData = activeCampaign.politicians.state.get(ai.id);

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

      const { members } = getLegislatureDetails(activeCampaign, level);
      console.log(`[runAllAIVotesForBill Debug] Total members from getLegislatureDetails:`, members?.length || 0);
      console.log(`[runAllAIVotesForBill Debug] Members:`, members);
      
      // AI members are those who are not the player (isPlayer: false)
      const aiCouncilMembers = members.filter((m) => !m.isPlayer);
      console.log(`[runAllAIVotesForBill Debug] AI members after filtering:`, aiCouncilMembers);
      
      const policiesForLevel = availablePolicies[level];
      const stats = getStatsForLevel(activeCampaign, level);

      console.log(`[runAllAIVotesForBill Debug] Processing ${aiCouncilMembers.length} AI members for bill ${billId}`);
      console.log(`[runAllAIVotesForBill Debug] Existing votes on bill:`, bill.councilVotesCast);
      
      const votes = {};
      
      for (const aiMember of aiCouncilMembers) {
        console.log(`[runAllAIVotesForBill Debug] Checking AI member ${aiMember.id} (${aiMember.name})`);
        if (bill.councilVotesCast && bill.councilVotesCast[aiMember.id]) {
          console.log(`[runAllAIVotesForBill Debug] Skipping ${aiMember.id} - vote already cast: ${bill.councilVotesCast[aiMember.id]}`);
          continue; // Skip if vote already cast
        }
        console.log(`[runAllAIVotesForBill Debug] About to call decideAIVote for ${aiMember.id}`);
        
        try {
          const voteChoice = decideAIVote(
            aiMember,
            bill,
            stats,
            get()[level].activeLegislation,
            get()[level].proposedBills,
            activeCampaign.governmentOffices || [], // Pass government offices from activeCampaign
            // Convert array to object with policy IDs as keys, and include bill-specific policies
            {
              ...policiesForLevel.reduce((acc, policy) => {
                acc[policy.id] = policy;
                return acc;
              }, {}),
              ...(bill.policyDefinitions || {})
            }
          );
          console.log(`[runAllAIVotesForBill Debug] ${aiMember.id} voted: ${voteChoice}`);
          votes[aiMember.id] = voteChoice;
        } catch (error) {
          console.error(`[runAllAIVotesForBill Debug] Error calling decideAIVote for ${aiMember.id}:`, error);
          votes[aiMember.id] = "abstain"; // Default to abstain on error
        }
        console.log(`[runAllAIVotesForBill Debug] Votes object after adding ${aiMember.id}:`, votes);
      }

      console.log(`[runAllAIVotesForBill Debug] Final votes object:`, votes);
      console.log(`[runAllAIVotesForBill Debug] Final votes object keys:`, Object.keys(votes));
      return votes; // Return the calculated votes
    },

    skipAndProcessVote: (billId, level) => {
      const aiVotes = get().actions.runAllAIVotesForBill?.(billId, level);
      console.log(`[skipAndProcessVote Debug] AI votes calculated:`, aiVotes);
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
