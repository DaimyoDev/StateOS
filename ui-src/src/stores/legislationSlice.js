// src/stores/legislationSlice.js
// This slice manages the state of proposed and active legislation.
// It contains the full logic for AI voting and applying policy effects to the campaign state.

import { generateId } from "../utils/core.js";
import { CITY_POLICIES } from "../data/policyDefinitions";
import { applyPolicyEffect } from "../simulation/applyPolicyEffects.js";
import { decideAndAuthorAIBill } from "../simulation/aiProposal.js";
import { decideAIVote } from "../simulation/aiVoting.js";

const getInitialLegislationState = () => ({
  proposedBills: [],
  activeLegislation: [],
  availablePoliciesForProposal: [...CITY_POLICIES],
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

  actions: {
    resetLegislationState: () => set(getInitialLegislationState()),

    proposeBill: (billName, policies, proposerId, proposerName) => {
      set((state) => {
        const dateProposed = { ...state.activeCampaign.currentDate };
        // Schedule the vote for 10 days from when it was proposed
        const voteScheduledFor = addDaysToDate(dateProposed, 10);

        const newBill = {
          id: `bill_${generateId()}`,
          name:
            billName ||
            generateAIBillName(state.activeCampaign.currentDate.year),
          proposerId,
          proposerName,
          policies: policies.map((p) => {
            const def = CITY_POLICIES.find((def) => def.id === p.policyId);
            return {
              ...p,
              policyName: def?.name,
              description: def?.description,
              parameterDetails: def?.parameterDetails,
            };
          }),
          status: "pending_vote",
          dateProposed: dateProposed,
          voteScheduledFor: voteScheduledFor, // Add the new property
          votes: { yea: [], nay: [], abstain: [] },
          councilVotesCast: {},
        };

        get().actions.addToast?.({
          message: `Bill Proposed: "${newBill.name}"`,
          type: "info",
        });
        return {
          proposedBills: [...state.proposedBills, newBill],
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
        const bill = state.proposedBills.find((b) => b.id === billId);
        if (!bill) return state;

        const councilSize = get().actions.getCityCouncilSize?.() || 1; // Assumes a helper action
        const majorityNeeded = Math.floor(councilSize / 2) + 1;
        const yeaVotes = bill.votes.yea?.length || 0;
        const billDidPass = yeaVotes >= majorityNeeded;

        let newActiveLegislationList = [...state.activeLegislation];
        if (billDidPass) {
          // Add ALL policies from the bill to the active legislation list
          bill.policies.forEach((policyInBill) => {
            const policyDef = CITY_POLICIES.find(
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
                isParameterized: policyDef.isParameterized,
                parameterDetails: policyDef.parameterDetails,
                chosenParameters: policyInBill.chosenParameters,
              });
            }
          });
        }

        get().actions.addToast?.({
          message: `Vote on "${bill.name}" has concluded. The bill has ${
            billDidPass ? "passed" : "failed"
          }.`,
          type: billDidPass ? "success" : "error",
        });

        // Update the bill's status instead of removing it immediately, so it can be viewed in the "past votes" list
        const updatedBills = state.proposedBills.map((b) =>
          b.id === billId
            ? { ...b, status: billDidPass ? "passed" : "failed" }
            : b
        );

        return {
          proposedBills: updatedBills,
          activeLegislation: newActiveLegislationList,
        };
      });
    },

    processAIDailyActions: () => {
      const { activeCampaign, proposedBills } = get();
      if (!activeCampaign?.governmentOffices) return;

      // Find all AI council members
      const councilOffice = activeCampaign.governmentOffices.find((o) =>
        o.officeNameTemplateId.includes("council")
      );
      const aiCouncilMembers =
        councilOffice?.members.filter((m) => !m.isPlayer) || [];

      aiCouncilMembers.forEach((ai) => {
        // Give each AI a chance to propose something if they haven't already
        const hasProposedBillThisTurn = proposedBills.some(
          (b) => b.proposerId === ai.id && b.status === "pending_vote"
        );
        if (hasProposedBillThisTurn) return;

        // Use a random chance to prevent every AI from proposing a bill every day
        if (Math.random() > 0.1) {
          // 10% chance per day
          return;
        }

        // Call the NEW AI bill authoring logic
        const authoredPolicies = get().actions.decideAndAuthorAIBill(
          ai,
          get().availablePoliciesForProposal.map((p) => p.id), // Pass all available policy IDs
          activeCampaign.startingCity.stats,
          get().activeLegislation,
          proposedBills
        );

        if (authoredPolicies && authoredPolicies.length > 0) {
          // If the AI authored a valid bill, propose it
          const proposerName = `${ai.firstName} ${ai.lastName}`;
          get().actions.proposeBill(
            null,
            authoredPolicies,
            ai.id,
            proposerName
          ); // Pass null for name to have one generated
        }
      });
    },

    decideAndAuthorAIBill,

    recordCouncilVote: (billId, councilMemberId, voteChoice) => {
      set((state) => {
        const updatedBills = state.proposedBills.map((bill) => {
          // Find the correct bill by its ID
          if (bill.id === billId) {
            // Create a new votes object, removing any previous vote from this member
            const newVotes = {
              yea: bill.votes.yea.filter((id) => id !== councilMemberId),
              nay: bill.votes.nay.filter((id) => id !== councilMemberId),
              abstain: bill.votes.abstain.filter(
                (id) => id !== councilMemberId
              ),
            };

            // Add the member's ID to the correct new vote array
            if (newVotes[voteChoice]) {
              newVotes[voteChoice].push(councilMemberId);
            }

            // Return the updated bill object
            return {
              ...bill,
              votes: newVotes,
              councilVotesCast: {
                ...bill.councilVotesCast,
                [councilMemberId]: voteChoice,
              },
            };
          }
          return bill; // Return other bills unchanged
        });

        // Update the state with the new array of bills
        return { proposedBills: updatedBills };
      });
    },

    applyActiveLegislationEffects: () => {
      set((state) => {
        if (!state.activeCampaign) return state; //

        let legislationChanged = false;
        let newState = { ...state }; // Start with a copy of the top-level state
        let updatedActiveCampaign = { ...newState.activeCampaign }; // Copy activeCampaign

        const effectsToApplyNow = [];

        // First pass: update monthsUntilEffective and identify policies to apply
        const updatedActiveLegislation = newState.activeLegislation.map(
          (leg) => {
            if (leg.monthsUntilEffective > 0) {
              legislationChanged = true;
              return {
                ...leg,
                monthsUntilEffective: leg.monthsUntilEffective - 1,
              };
            }
            if (leg.monthsUntilEffective === 0 && !leg.effectsApplied) {
              legislationChanged = true;
              effectsToApplyNow.push(leg); // Collect policies whose effects should be applied this tick
              return { ...leg, effectsApplied: true }; // Mark as applied to prevent re-application
            }
            return leg;
          }
        );
        newState.activeLegislation = updatedActiveLegislation; // Update activeLegislation in the newState draft

        // Second pass: apply the effects for policies identified
        if (effectsToApplyNow.length > 0) {
          console.log(
            "Applying policy effects:",
            effectsToApplyNow.map((e) => e.policyName)
          );
          effectsToApplyNow.forEach((policyToApply) => {
            // Apply generic effects defined in the policy's 'effects' array
            policyToApply.effects.forEach((effect) => {
              updatedActiveCampaign = applyPolicyEffect(
                updatedActiveCampaign,
                { ...effect, parameterDetails: policyToApply.parameterDetails },
                policyToApply.chosenParameters
              );
            });

            // NOW, apply effects specifically from chosenParameters if it's a parameterized policy affecting budget/tax
            if (
              policyToApply.isParameterized &&
              policyToApply.parameterDetails &&
              policyToApply.chosenParameters
            ) {
              const pDetails = policyToApply.parameterDetails;
              const chosenValue = policyToApply.chosenParameters[pDetails.key];

              if (chosenValue !== undefined) {
                if (pDetails.targetBudgetLine) {
                  const budgetLinePath = `startingCity.stats.budget.expenseAllocations.${pDetails.targetBudgetLine}`;
                  const tempEffect = {
                    targetStat: budgetLinePath,
                    change: chosenValue,
                    type: "absolute_change",
                  };
                  updatedActiveCampaign = applyPolicyEffect(
                    updatedActiveCampaign,
                    tempEffect
                  );
                  console.log(
                    `[Legislation] Applied parameterized budget change for ${policyToApply.policyName} to ${pDetails.targetBudgetLine}: ${chosenValue}`
                  ); //
                } else if (pDetails.targetTaxRate) {
                  const taxRatePath = `startingCity.stats.budget.taxRates.${pDetails.targetTaxRate}`;
                  const tempEffect = {
                    targetStat: taxRatePath,
                    change: chosenValue,
                    type: "percentage_point_change",
                  };
                  updatedActiveCampaign = applyPolicyEffect(
                    updatedActiveCampaign,
                    tempEffect
                  );
                  console.log(
                    `[Legislation] Applied parameterized tax rate change for ${policyToApply.policyName} to ${pDetails.targetTaxRate}: ${chosenValue}`
                  ); //
                }
              }
            }

            // Add a news event for the policy being enacted
            get().actions.addNewsEvent?.({
              headline: `Policy Enacted: "${policyToApply.policyName}"`,
              summary: `The policy has now taken full effect across the city.`,
              type: "policy_enacted",
              policyId: policyToApply.policyId,
            });
          });
          newState.activeCampaign = updatedActiveCampaign;
          legislationChanged = true;
        }

        if (legislationChanged) {
          return newState;
        }
        return state;
      });
    },
    processDailyBillCommentary: () => {
      set((state) => {
        const { activeCampaign, proposedBills, activeLegislation } = state;
        const councilMembers = state.actions.getCityCouncilMembers?.() || [];

        const updatedBills = proposedBills.map((bill) => {
          if (bill.status !== "pending_vote") return bill;

          const newStances = [...(bill.publicStances || [])];

          councilMembers.forEach((ai) => {
            if (ai.isPlayer) return; // Skip player

            // Check if this AI already has a public stance
            const hasStance = newStances.some((s) => s.politicianId === ai.id);
            if (hasStance) return;

            // Give AI a chance to comment each day
            if (Math.random() < 0.25) {
              // 25% chance per day to form an opinion
              // Use decideAIVote to get a preliminary opinion
              const voteLeaning = decideAIVote(
                ai,
                bill,
                activeCampaign.startingCity.stats,
                activeLegislation,
                proposedBills,
                activeCampaign.governmentOffices
              );

              let stance = "undecided";
              if (voteLeaning === "yea") stance = "leaning_yea";
              if (voteLeaning === "nay") stance = "leaning_nay";

              newStances.push({
                politicianId: ai.id,
                politicianName: `${ai.firstName} ${ai.lastName}`,
                stance: stance,
              });
            }
          });
          return { ...bill, publicStances: newStances };
        });

        return { proposedBills: updatedBills };
      });
    },
    runAllAIVotesForBill: (billId) => {
      const { activeCampaign, proposedBills, activeLegislation } = get();
      const bill = proposedBills.find((b) => b.id === billId);

      if (!bill) {
        console.warn(
          `[runAllAIVotesForBill] Could not find bill with ID: ${billId}`
        );
        return;
      }

      const councilMembers = get().actions.getCityCouncilMembers?.() || [];

      councilMembers.forEach((ai) => {
        // Skip the player and anyone who has already voted
        if (
          ai.isPlayer ||
          (bill.councilVotesCast && bill.councilVotesCast[ai.id])
        ) {
          return;
        }

        // Run the voting simulation for this AI member
        const voteChoice = decideAIVote(
          ai,
          bill,
          activeCampaign.startingCity.stats,
          activeLegislation,
          proposedBills,
          activeCampaign.governmentOffices
        );

        // Record the vote using the existing action
        get().actions.recordCouncilVote(billId, ai.id, voteChoice);
      });
    },
  },
});
