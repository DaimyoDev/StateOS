// src/stores/legislationSlice.js
// This slice manages the state of proposed and active legislation.
// It contains the full logic for AI voting and applying policy effects to the campaign state.

import { generateId } from "../utils/core.js";
import { isDateSameOrBefore } from "../utils/generalUtils.js";
import { CITY_POLICIES } from "../data/policyDefinitions";
import { decideAIVote } from "../simulation/aiVoting.js";
import { applyPolicyEffect } from "../simulation/applyPolicyEffects.js";

const getInitialLegislationState = () => ({
  proposedLegislation: [],
  activeLegislation: [],
  availablePoliciesForProposal: [...CITY_POLICIES],
});

export const createLegislationSlice = (set, get) => ({
  ...getInitialLegislationState(),

  actions: {
    resetLegislationState: () => set(getInitialLegislationState()),

    proposePolicy: (policyId, proposerId, chosenParameters) => {
      set((state) => {
        const policyDef = CITY_POLICIES.find((p) => p.id === policyId); //
        if (!policyDef) {
          console.error(`[Legislation] Policy ID "${policyId}" not found.`);
          return state;
        }

        const newProposal = {
          id: `prop_${generateId()}`,
          policyId,
          proposerId,
          chosenParameters,
          policyName: policyDef.name, //
          description: policyDef.description, //
          isParameterized: policyDef.isParameterized, //
          parameterDetails: policyDef.parameterDetails, //
          status: "proposed",
          dateProposed: { ...state.activeCampaign.currentDate },
          councilVotesCast: {},
          votes: { yea: [], nay: [], abstain: [] },
        };

        get().actions.addToast?.({
          message: `Policy Proposed: "${policyDef.name}"`, //
          type: "info",
        });
        return {
          proposedLegislation: [...state.proposedLegislation, newProposal],
        };
      });
    },

    recordCouncilVote: (proposalId, councilMemberId, voteChoice) => {
      set((state) => {
        const updatedProposals = state.proposedLegislation.map((p) => {
          if (p.id === proposalId && p.status === "voting_period_open") {
            const newVotes = {
              yea: p.votes.yea.filter((id) => id !== councilMemberId),
              nay: p.votes.nay.filter((id) => id !== councilMemberId),
              abstain: p.votes.abstain.filter((id) => id !== councilMemberId),
            };
            if (newVotes[voteChoice]) {
              newVotes[voteChoice].push(councilMemberId);
            }
            return {
              ...p,
              votes: newVotes,
              councilVotesCast: {
                ...p.councilVotesCast,
                [councilMemberId]: voteChoice,
              },
            };
          }
          return p;
        });
        return { proposedLegislation: updatedProposals };
      });
    },

    finalizePolicyVote: (proposalId) => {
      set((state) => {
        const proposal = state.proposedLegislation.find(
          (p) => p.id === proposalId
        );
        if (!proposal) return state;

        const councilOffice = state.activeCampaign.governmentOffices.find(
          (
            o //
          ) => o.officeNameTemplateId?.includes("council")
        );
        const councilSize = councilOffice?.members?.length || 1; //
        const majorityNeeded = Math.floor(councilSize / 2) + 1;
        const yeaVotes = proposal.votes.yea?.length || 0;
        const policyDidPass = yeaVotes >= majorityNeeded;

        let newActiveList = [...state.activeLegislation];
        if (policyDidPass) {
          const policyDef = CITY_POLICIES.find(
            (p) => p.id === proposal.policyId
          ); //
          newActiveList.push({
            id: `active_${proposal.id}`,
            policyId: proposal.policyId,
            policyName: proposal.policyName,
            dateEnacted: { ...state.activeCampaign.currentDate },
            monthsUntilEffective: policyDef.durationToImplement || 0, //
            effectsApplied: false,
            effects: policyDef.effects, //
            proposerId: proposal.proposerId,
            isParameterized: proposal.isParameterized,
            parameterDetails: proposal.parameterDetails,
            chosenParameters: proposal.chosenParameters,
          });
        }

        get().actions.addToast?.({
          message: `Vote Finalized: "${proposal.policyName}" has ${
            policyDidPass ? "passed" : "failed"
          } (${yeaVotes}/${councilSize}).`,
          type: policyDidPass ? "success" : "error",
        });

        return {
          proposedLegislation: state.proposedLegislation.filter(
            (p) => p.id !== proposalId
          ),
          activeLegislation: newActiveList,
        };
      });
    },

    processDailyProposalActivity: (currentDate) => {
      const { proposedLegislation, activeCampaign } = get(); //
      if (!activeCampaign) return; //

      const councilOffice = activeCampaign.governmentOffices.find(
        (
          o //
        ) => o.officeNameTemplateId?.includes("council")
      );
      const councilMembers = councilOffice?.members || []; //
      const cityStats = activeCampaign.startingCity.stats; //
      const allActiveLegislation = get().activeLegislation;
      const allProposedLegislation = get().proposedLegislation;
      const governmentOffices = activeCampaign.governmentOffices; //

      proposedLegislation.forEach((proposal) => {
        if (proposal.status === "proposed") {
          const proposalDate = new Date(
            proposal.dateProposed.year,
            proposal.dateProposed.month - 1,
            proposal.dateProposed.day
          );
          const today = new Date(
            currentDate.year,
            currentDate.month - 1,
            currentDate.day
          );
          const daysSinceProposed =
            (today - proposalDate) / (1000 * 60 * 60 * 24);

          if (daysSinceProposed >= 3) {
            // Debate period ends
            const votingEndObj = new Date(today);
            votingEndObj.setDate(votingEndObj.getDate() + 7); // 7-day voting period
            const votingClosesDate = {
              year: votingEndObj.getFullYear(),
              month: votingEndObj.getMonth() + 1,
              day: votingEndObj.getDate(),
            };

            set((state) => ({
              proposedLegislation: state.proposedLegislation.map((p) =>
                p.id === proposal.id
                  ? { ...p, status: "voting_period_open", votingClosesDate }
                  : p
              ),
            }));
            get().actions.addNewsEvent?.({
              headline: `Voting Opens: "${proposal.policyName}"`,
              summary: `The council has begun its voting period for the proposed policy.`,
            });
          }
        } else if (proposal.status === "voting_period_open") {
          // Simulate AI Votes
          councilMembers.forEach((member) => {
            if (
              !member.isPlayer &&
              !proposal.councilVotesCast[member.id] &&
              Math.random() < 0.33 // AI has a chance to vote each day during the voting period
            ) {
              const aiVoteChoice = decideAIVote(
                //
                member,
                proposal,
                cityStats,
                allActiveLegislation,
                allProposedLegislation,
                governmentOffices
              );
              get().actions.recordCouncilVote(
                proposal.id,
                member.id,
                aiVoteChoice
              );
            }
          });

          // Check if voting period is over
          if (isDateSameOrBefore(proposal.votingClosesDate, currentDate)) {
            //
            get().actions.finalizePolicyVote(proposal.id);
          }
        }
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
  },
});
