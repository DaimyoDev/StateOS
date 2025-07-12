// ui-src/src/stores/legislationSlice.js
import {
  generateId,
  isDateSameOrBefore,
  isDateBefore,
} from "../utils/generalUtils";
import { CITY_POLICIES } from "../data/policyDefinitions";
import { getRandomInt } from "../utils/generalUtils";
import { RATING_LEVELS, ECONOMIC_OUTLOOK_LEVELS } from "../data/governmentData";

const getInitialLegislationState = () => ({
  proposedLegislation: [],
  activeLegislation: [],
  availablePoliciesForProposal: [...CITY_POLICIES],
});

export const createLegislationSlice = (set, get) => ({
  // Spread initial state for this slice
  ...getInitialLegislationState(),

  actions: {
    resetLegislationState: () => {
      set(getInitialLegislationState());
    },

    proposePolicy: (policyId, proposerId, chosenParametersInput) => {
      const policyToPropose = CITY_POLICIES.find((p) => p.id === policyId);
      const currentDate = get().activeCampaign?.currentDate;

      if (!policyToPropose) {
        console.error(
          `[LegislationSlice] ProposePolicy: Policy ID "${policyId}" not found.`
        );
        if (get().actions.addToast) {
          get().actions.addToast({
            message: `Error: Policy definition not found for ${policyId}.`,
            type: "error",
          });
        }
        return;
      }

      const activeCampaignForProposal = get().activeCampaign;
      if (!activeCampaignForProposal) {
        console.warn(
          "[LegislationSlice] ProposePolicy: No active campaign, cannot create proposal."
        );
        if (get().actions.addToast) {
          get().actions.addToast({
            message: "Cannot propose policy: No active campaign.",
            type: "error",
          });
        }
        return;
      }
      if (!currentDate) {
        console.warn(
          "[LegislationSlice] ProposePolicy: No current date for proposal. Using campaign's date or defaulting."
        );
      }

      let finalChosenParameters = null;
      let finalParameterDetails = null;

      if (policyToPropose.isParameterized && policyToPropose.parameterDetails) {
        finalParameterDetails = { ...policyToPropose.parameterDetails };
        const pDetails = policyToPropose.parameterDetails;
        const paramKey = pDetails.key || "amount";
        let amount;

        if (
          chosenParametersInput &&
          chosenParametersInput[paramKey] !== undefined
        ) {
          amount = chosenParametersInput[paramKey];
        } else {
          amount = pDetails.defaultValue;
          console.log(chosenParametersInput);
          if (chosenParametersInput) {
            console.warn(
              `[LegislationSlice] ProposePolicy: Parameter key "${paramKey}" not found or value is undefined in chosenParametersInput for ${policyToPropose.name}. Using default value. Input was:`,
              chosenParametersInput
            );
          } else {
            console.warn(
              `[LegislationSlice] ProposePolicy: chosenParametersInput was null/undefined for ${policyToPropose.name}. Using default value.`
            );
          }
        }

        // Validate and clamp the amount
        if (typeof pDetails.min === "number" && amount < pDetails.min) {
          amount = pDetails.min;
          if (get().actions.addToast)
            get().actions.addToast({
              message: `Proposed amount for ${
                policyToPropose.name
              } clamped to minimum: ${
                pDetails.unit || ""
              }${amount.toLocaleString()}`,
              type: "warning",
              duration: 3500,
            });
        } else if (typeof pDetails.max === "number" && amount > pDetails.max) {
          amount = pDetails.max;
          if (get().actions.addToast)
            get().actions.addToast({
              message: `Proposed amount for ${
                policyToPropose.name
              } clamped to maximum: ${
                pDetails.unit || ""
              }${amount.toLocaleString()}`,
              type: "warning",
              duration: 3500,
            });
        }

        finalChosenParameters = { [paramKey]: amount };
      }

      set((state) => {
        const newProposal = {
          id: `prop_${generateId()}`,
          policyId: policyToPropose.id,
          policyName: policyToPropose.name,
          description: policyToPropose.description,
          proposerId: proposerId,
          status: "proposed",
          dateProposed: {
            ...(currentDate ||
              activeCampaignForProposal.currentDate || {
                year: 0,
                month: 0,
                day: 0,
              }),
          },
          votingOpensDate: null,
          votingClosesDate: null,
          votes: { yea: [], nay: [], abstain: [] },
          councilVotesCast: {},
          isParameterized: policyToPropose.isParameterized || false,
          parameterDetails: finalParameterDetails,
          chosenParameters: finalChosenParameters,
        };

        const currentProposed = state.proposedLegislation || [];
        return { proposedLegislation: [...currentProposed, newProposal] };
      });

      let proposalSpecifics = "";
      if (
        policyToPropose.isParameterized &&
        finalChosenParameters &&
        policyToPropose.parameterDetails
      ) {
        const paramKey = policyToPropose.parameterDetails.key || "amount";
        const amount = finalChosenParameters[paramKey];
        const unit = policyToPropose.parameterDetails.unit || "";
        const targetLine =
          policyToPropose.parameterDetails.targetBudgetLine || "funding";
        if (amount !== undefined) {
          const changeDesc =
            amount >= 0
              ? `an increase of ${unit}${Math.abs(amount).toLocaleString()}`
              : `a decrease of ${unit}${Math.abs(amount).toLocaleString()}`;
          proposalSpecifics = ` (Involving ${changeDesc} for ${targetLine
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}) `;
        }
      }

      if (get().actions.addToast) {
        get().actions.addToast({
          message: `Policy "${policyToPropose.name}"${proposalSpecifics}proposed.`,
          type: "info",
          duration: 4000,
        });
      }

      if (get().actions.addNewsEvent && currentDate) {
        let summary = `${policyToPropose.name} has been proposed for consideration by the city council.`;
        if (proposalSpecifics) {
          summary = `${policyToPropose.name}${proposalSpecifics}has been proposed for consideration.`;
        } else if (policyToPropose.description) {
          summary = `${policyToPropose.description.substring(
            0,
            100
          )}... It will be reviewed by the council.`;
        }

        get().actions.addNewsEvent({
          date: { ...currentDate },
          headline: `New Policy Proposed: "${policyToPropose.name}"`,
          summary: summary,
          type: "political",
          scope: "local",
          impact: "neutral",
          relatedEntities: [
            {
              type: "policy",
              id: policyToPropose.id,
              name: policyToPropose.name,
            },
          ],
        });
      } else if (!currentDate) {
        console.warn(
          "[LegislationSlice] ProposePolicy: Cannot add news event due to missing date."
        );
      }
    },

    updateProposalDetails: (proposalId, updates) => {
      // More generic update action
      set(() => {
        const proposedLegislation = get().proposedLegislation || [];
        const proposalIndex = proposedLegislation.findIndex(
          (p) => p.id === proposalId
        );
        if (proposalIndex === -1) return {};

        const updatedProposals = proposedLegislation.map((p, index) => {
          if (index === proposalIndex) {
            return { ...p, ...updates }; // Spread updates onto the proposal
          }
          return p;
        });
        return { proposedLegislation: updatedProposals };
      });
    },

    recordCouncilVote: (proposalId, councilMemberId, voteChoice = null) => {
      set(() => {
        const proposedLegislation = get().proposedLegislation || [];
        const proposalIndex = proposedLegislation.findIndex(
          (p) => p.id === proposalId
        );
        if (
          proposalIndex === -1 ||
          proposedLegislation[proposalIndex].status !== "voting_period_open"
        ) {
          console.warn(
            `[Legislation] Cannot record vote for ${proposalId}. Not found or not in voting period.`
          );
          return {};
        }

        const updatedProposals = proposedLegislation.map((p) => ({ ...p })); // New array of new objects
        const proposal = updatedProposals[proposalIndex];

        // Ensure votes and councilVotesCast are new objects/arrays for immutability
        proposal.votes = {
          yea: [...(proposal.votes.yea || [])],
          nay: [...(proposal.votes.nay || [])],
          abstain: [...(proposal.votes.abstain || [])],
        };
        proposal.councilVotesCast = { ...(proposal.councilVotesCast || {}) };

        // Remove previous vote if member is re-voting (shouldn't happen if UI prevents)
        proposal.votes.yea = proposal.votes.yea.filter(
          (id) => id !== councilMemberId
        );
        proposal.votes.nay = proposal.votes.nay.filter(
          (id) => id !== councilMemberId
        );
        proposal.votes.abstain = proposal.votes.abstain.filter(
          (id) => id !== councilMemberId
        );

        // Add new vote
        if (proposal.votes[voteChoice]) {
          proposal.votes[voteChoice].push(councilMemberId);
        }
        proposal.councilVotesCast[councilMemberId] = voteChoice;

        return { proposedLegislation: updatedProposals };
      });
    },

    // Action to finalize a vote on a policy (e.g., after all council members voted or deadline passed)
    finalizePolicyVote: (proposalId) => {
      let outerScopePolicyDidPass = false;
      let outerScopePolicyNameForDisplay = "A policy";
      let outerScopeProposerIdForAction = null;
      let outerScopeFinalChosenParameters = null;
      let outerScopeFinalParameterDetails = null;

      set((state) => {
        const proposedLegislationList = state.proposedLegislation || [];
        const activeCampaignContext = state.activeCampaign;

        const proposalIndex = proposedLegislationList.findIndex(
          (p) => p.id === proposalId
        );
        if (proposalIndex === -1) {
          console.warn(
            `[LegislationSlice] FinalizeVote: Proposal ID ${proposalId} not found.`
          );
          return {};
        }

        let mutableProposedLegislation = proposedLegislationList.map((p) => ({
          ...p,
        }));
        const proposalToFinalize = mutableProposedLegislation[proposalIndex];

        if (
          proposalToFinalize.status !== "voting_closed" &&
          proposalToFinalize.status !== "voting_period_open" &&
          proposalToFinalize.status !== "proposed"
        ) {
          console.warn(
            `[LegislationSlice] finalizePolicyVote: Proposal ${proposalId} not in a finalizable status. Status: ${proposalToFinalize.status}`
          );
          return {};
        }

        const policyDefinition = CITY_POLICIES.find(
          (p) => p.id === proposalToFinalize.policyId
        );
        if (!policyDefinition) {
          console.error(
            `[LegislationSlice] FinalizeVote: Policy Definition not found for policyId: ${proposalToFinalize.policyId} in proposal ${proposalId}`
          );
          outerScopePolicyNameForDisplay =
            proposalToFinalize.policyName ||
            "Unknown Policy (Definition Missing)";
          outerScopeProposerIdForAction = proposalToFinalize.proposerId;
          return {
            proposedLegislation: proposedLegislationList.filter(
              (p) => p.id !== proposalId
            ),
          };
        }

        outerScopePolicyNameForDisplay = policyDefinition.name;
        outerScopeProposerIdForAction = proposalToFinalize.proposerId;
        if (proposalToFinalize.isParameterized) {
          outerScopeFinalChosenParameters = proposalToFinalize.chosenParameters
            ? { ...proposalToFinalize.chosenParameters }
            : null;
          outerScopeFinalParameterDetails = proposalToFinalize.parameterDetails
            ? { ...proposalToFinalize.parameterDetails }
            : null;
        }

        const yeaVotes = proposalToFinalize.votes?.yea?.length || 0;
        const councilMembers =
          activeCampaignContext?.governmentOffices?.filter(
            (off) =>
              off.officeNameTemplateId.includes("council") &&
              off.level === "local_city" &&
              activeCampaignContext.startingCity?.name &&
              off.officeName.includes(
                activeCampaignContext.startingCity.name
              ) &&
              off.holder
          ) || [];
        const totalCouncilMembers =
          councilMembers.length > 0 ? councilMembers.length : 1;
        const majorityNeeded = Math.floor(totalCouncilMembers / 2) + 1;

        let newProposedList = mutableProposedLegislation.filter(
          (p) => p.id !== proposalId
        );
        let newActiveList = [...(state.activeLegislation || [])];

        if (yeaVotes >= majorityNeeded) {
          outerScopePolicyDidPass = true;
          newActiveList.push({
            id: `active_${proposalToFinalize.id}`,
            policyId: proposalToFinalize.policyId,
            policyName: policyDefinition.name,
            description: policyDefinition.description,
            dateEnacted: { ...(activeCampaignContext?.currentDate || {}) },
            monthsUntilEffective: policyDefinition.durationToImplement || 0,
            effectsApplied: false,
            effects: policyDefinition.effects,
            proposerId: proposalToFinalize.proposerId,
            isParameterized: proposalToFinalize.isParameterized,
            parameterDetails: proposalToFinalize.parameterDetails
              ? { ...proposalToFinalize.parameterDetails }
              : null,
            chosenParameters: proposalToFinalize.chosenParameters
              ? { ...proposalToFinalize.chosenParameters }
              : null,
          });
        } else {
          outerScopePolicyDidPass = false;
        }
        return {
          proposedLegislation: newProposedList,
          activeLegislation: newActiveList,
        };
      });

      const campaignContextForNews = get().activeCampaign;
      const currentDateForNews = campaignContextForNews?.currentDate;

      if (outerScopePolicyDidPass) {
        let passedPolicyNewsSummary = `The City Council has voted to pass "${outerScopePolicyNameForDisplay}".`;
        if (
          outerScopeFinalChosenParameters &&
          outerScopeFinalParameterDetails
        ) {
          const amount =
            outerScopeFinalChosenParameters[
              outerScopeFinalParameterDetails.key || "amount"
            ];
          const unit = outerScopeFinalParameterDetails.unit || "";
          const targetLine =
            outerScopeFinalParameterDetails.targetBudgetLine || "funding";
          if (amount != null) {
            const changeDesc =
              amount >= 0
                ? `an increase of ${unit}${Math.abs(amount).toLocaleString()}`
                : `a decrease of ${unit}${Math.abs(amount).toLocaleString()}`;
            passedPolicyNewsSummary += ` This involves ${changeDesc} for the ${targetLine
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}.`;
          }
        }
        passedPolicyNewsSummary += ` It will take effect in the coming months.`;

        if (get().actions.addToast) {
          get().actions.addToast({
            message: `Policy Enacted: "${outerScopePolicyNameForDisplay}" has passed!`,
            type: "success",
            duration: 4000,
          });
        }
        if (get().actions.addNewsEvent && currentDateForNews) {
          get().actions.addNewsEvent({
            date: { ...currentDateForNews },
            headline: `Policy Passed: "${outerScopePolicyNameForDisplay}"`,
            summary: passedPolicyNewsSummary,
            type: "political",
            scope: "local",
            impact: "positive",
          });
        }
        if (
          outerScopeProposerIdForAction ===
            campaignContextForNews?.politician?.id &&
          get().actions.adjustPlayerApproval
        ) {
          get().actions.adjustPlayerApproval(getRandomInt(2, 5));
        }
      } else {
        if (get().actions.addToast) {
          get().actions.addToast({
            message: `Policy Defeated: "${outerScopePolicyNameForDisplay}" failed to pass.`,
            type: "error",
            duration: 4000,
          });
        }
        if (get().actions.addNewsEvent && currentDateForNews) {
          get().actions.addNewsEvent({
            date: { ...currentDateForNews },
            headline: `Policy Defeated: "${outerScopePolicyNameForDisplay}"`,
            summary: `The "${outerScopePolicyNameForDisplay}" failed to gain enough support in the City Council and was defeated.`,
            type: "political",
            scope: "local",
            impact: "negative",
          });
        }
        if (
          outerScopeProposerIdForAction ===
            campaignContextForNews?.politician?.id &&
          get().actions.adjustPlayerApproval
        ) {
          get().actions.adjustPlayerApproval(getRandomInt(-3, -1));
        }
      }
    },
    applyActiveLegislationEffects: () => {
      const currentActiveLegislationList = get().activeLegislation || [];
      if (currentActiveLegislationList.length === 0) {
        return;
      }

      let itemsForPolicySliceProcessing = []; // This will hold the full activeLegislation items
      let newsDataForPolicySlice = []; // For "Policy Enacted" news
      let didAnyLegislationItemChange = false;

      const nextActiveLegislationList = currentActiveLegislationList
        .map((leg) => {
          let currentLegItem = { ...leg }; // Work on a copy

          if (
            currentLegItem.effectsApplied &&
            currentLegItem.monthsUntilEffective <= 0
          ) {
            return currentLegItem; // Already applied and done (if not recurring)
          }

          if (currentLegItem.monthsUntilEffective > 0) {
            currentLegItem.monthsUntilEffective = Math.max(
              0,
              currentLegItem.monthsUntilEffective - 1
            );
            didAnyLegislationItemChange = true;
          }

          if (
            currentLegItem.monthsUntilEffective <= 0 &&
            !currentLegItem.effectsApplied
          ) {
            didAnyLegislationItemChange = true;
            console.log(
              `[Legislation Slice] Preparing effects for: ${currentLegItem.policyName} (ID: ${currentLegItem.policyId})`
            );

            // Instead of iterating effects here, pass the whole active policy item.
            // policySlice will handle if it's parameterized or look at its static 'effects' array.
            itemsForPolicySliceProcessing.push({ ...currentLegItem }); // Pass a clone of the current state of the active policy

            currentLegItem.effectsApplied = true; // Mark as applied (for one-time application)

            // General "Policy Enacted" news
            newsDataForPolicySlice.push({
              headline: `Policy Enacted: "${currentLegItem.policyName}"`,
              summary: `The policy "${currentLegItem.policyName}" has now taken full effect.`,
              type: "policy_effect", // This type is for general enactment
              impact: "neutral",
              scope: "local",
            });
          }
          return currentLegItem;
        })
        .filter(() => {
          // Logic for removing policies that are truly finished (e.g., one-time effect applied, and not a recurring law)
          // For now, if effectsApplied is true and monthsUntilEffective is 0, it stays unless explicitly removed.
          // You might add a flag like `isRecurring: false` to policies and filter those out here.
          return true; // Keep all for now, or add filter logic
        });

      if (didAnyLegislationItemChange) {
        set({ activeLegislation: nextActiveLegislationList });
      }

      if (
        itemsForPolicySliceProcessing.length > 0 ||
        newsDataForPolicySlice.length > 0
      ) {
        if (get().actions.processPolicyOutcomesAndUpdateCampaign) {
          console.log(
            "[LegislationSlice] Sending to policySlice:",
            itemsForPolicySliceProcessing,
            newsDataForPolicySlice
          );
          get().actions.processPolicyOutcomesAndUpdateCampaign(
            itemsForPolicySliceProcessing, // This now contains full active policy items with chosenParameters
            newsDataForPolicySlice
          );
        } else {
          console.error(
            "processPolicyOutcomesAndUpdateCampaign action not found in policySlice!"
          );
        }
      }
    },
    processDailyProposalActivity: (currentDate) => {
      const proposedLegislationList = get().proposedLegislation || [];
      const activeCampaign = get().activeCampaign; // Get activeCampaign once
      if (!activeCampaign) return; // Guard if no active campaign

      const councilMembers =
        activeCampaign.governmentOffices?.filter(
          (off) =>
            off.holder &&
            !off.holder.isPlayer &&
            off.officeNameTemplateId.includes("council") &&
            off.level === "local_city" &&
            activeCampaign.startingCity?.name &&
            off.officeName.includes(activeCampaign.startingCity.name)
        ) || [];
      if (proposedLegislationList.length === 0) return;

      proposedLegislationList.forEach((proposal) => {
        if (
          proposal.status === "passed" ||
          proposal.status === "failed" ||
          proposal.status === "enacted"
        ) {
          return;
        }

        if (proposal.status === "proposed") {
          if (!proposal.dateProposed || !currentDate) return; // Guard against missing dates
          const proposalDateObj = new Date(
            proposal.dateProposed.year,
            proposal.dateProposed.month - 1,
            proposal.dateProposed.day
          );
          const currentDateObj = new Date(
            currentDate.year,
            currentDate.month - 1,
            currentDate.day
          );
          const daysSinceProposed =
            (currentDateObj.getTime() - proposalDateObj.getTime()) /
            (1000 * 60 * 60 * 24);
          const debatePeriodDays = 3;

          if (daysSinceProposed >= debatePeriodDays) {
            const votingStartDate = { ...currentDate };
            const votingEndObj = new Date(
              currentDate.year,
              currentDate.month - 1,
              currentDate.day
            );
            votingEndObj.setDate(votingEndObj.getDate() + 7);
            const votingCloseDate = {
              year: votingEndObj.getFullYear(),
              month: votingEndObj.getMonth() + 1,
              day: votingEndObj.getDate(),
            };
            get().actions.updateProposalDetails(proposal.id, {
              status: "voting_period_open",
              votingOpensDate: votingStartDate,
              votingClosesDate: votingCloseDate,
            });
            if (get().actions.addNewsEvent) {
              get().actions.addNewsEvent({
                date: { ...currentDate },
                headline: `Voting Opens: "${proposal.policyName}"`,
                summary: `The city council has begun its voting period for "${proposal.policyName}". Voting will conclude on ${votingCloseDate.month}/${votingCloseDate.day}/${votingCloseDate.year}.`,
                type: "political",
                scope: "local",
                impact: "neutral",
              });
            }
          }
        } else if (proposal.status === "voting_period_open") {
          if (isDateSameOrBefore(currentDate, proposal.votingClosesDate)) {
            const cityStats = activeCampaign.startingCity?.stats;

            councilMembers.forEach((councilMemberOffice) => {
              const councilMember = councilMemberOffice.holder;
              if (
                councilMember &&
                cityStats &&
                !proposal.councilVotesCast?.[councilMember.id]
              ) {
                if (Math.random() < 0.33) {
                  const policyDefinition = CITY_POLICIES.find(
                    (p) => p.id === proposal.policyId
                  );
                  let voteChoice = "abstain";

                  if (policyDefinition) {
                    let combinedScore = 0;
                    // 1. Ideological Factor
                    const ideologicalFactor =
                      policyDefinition.baseSupport?.[
                        councilMember.calculatedIdeology
                      ] || 0;
                    combinedScore += ideologicalFactor * 1.1; // User's preferred weight

                    // 2. Conviction Factor
                    if (Math.abs(ideologicalFactor) > 0.5) {
                      combinedScore += ideologicalFactor * 0.3;
                    }

                    // 3. Personal Stance Factor (Based on POLICY_QUESTIONS)
                    let personalStanceFactor = 0;
                    if (
                      policyDefinition.relevantPolicyQuestions &&
                      councilMember.policyStances
                    ) {
                      policyDefinition.relevantPolicyQuestions.forEach(
                        (pqLink) => {
                          const aiStance =
                            councilMember.policyStances[pqLink.questionId];
                          if (aiStance) {
                            if (
                              pqLink.alignsWithOptionValues?.includes(aiStance)
                            ) {
                              personalStanceFactor += 0.35;
                            } else if (
                              pqLink.opposesOptionValues?.includes(aiStance)
                            ) {
                              personalStanceFactor -= 0.35;
                            }
                          }
                        }
                      );
                    }
                    combinedScore += personalStanceFactor * 1.5; // Personal stances are very important

                    // --- 4. Enhanced City Stat Context & Budget/Tax Impact Factor ---
                    let fiscalPolicyScoreAdjustment = 0; // Accumulator for fiscal/contextual adjustments

                    let actualProposedChangeValue = 0; // For budget lines: + for increase, - for cut. For taxes: + for rate increase, - for rate decrease.
                    let isBudgetPolicy = false;
                    let isTaxPolicy = false;

                    if (
                      proposal.isParameterized &&
                      proposal.chosenParameters &&
                      proposal.parameterDetails
                    ) {
                      const paramKey =
                        proposal.parameterDetails.key || "amount";
                      actualProposedChangeValue =
                        proposal.chosenParameters[paramKey] || 0;

                      if (proposal.parameterDetails.targetBudgetLine) {
                        isBudgetPolicy = true;
                      } else if (proposal.parameterDetails.targetTaxRate) {
                        isTaxPolicy = true;
                      }
                    } else if (policyDefinition.cost?.budget) {
                      // Fixed cost spending
                      isBudgetPolicy = true;
                      actualProposedChangeValue = policyDefinition.cost.budget; // Positive value for cost
                    } else if (policyDefinition.cost?.budget_impact_estimate) {
                      // Fixed revenue loss (tax cut)
                      // Assuming negative budget_impact_estimate means revenue loss / tax cut
                      if (policyDefinition.cost.budget_impact_estimate < 0) {
                        isTaxPolicy = true; // Treat as a tax cut effect
                        // We need a 'change' value. If it's a fixed amount, it's hard to represent as rate change.
                        // For simplicity, let's use a proxy for its negative impact.
                        actualProposedChangeValue = -0.01; // Proxy for a moderate tax cut effect
                      } else {
                        // Positive budget_impact_estimate could be a generic cost
                        isBudgetPolicy = true;
                        actualProposedChangeValue =
                          policyDefinition.cost.budget_impact_estimate;
                      }
                    } else if (
                      policyDefinition.effects?.some(
                        (e) =>
                          e.targetStat?.startsWith("budget.taxRates") &&
                          e.type === "absolute_set_rate"
                      )
                    ) {
                      // Non-parameterized new tax (e.g. "Introduce 1% Income Tax")
                      const taxEffect = policyDefinition.effects.find((e) =>
                        e.targetStat?.startsWith("budget.taxRates")
                      );
                      if (taxEffect) {
                        isTaxPolicy = true;
                        const taxRateKey = taxEffect.targetStat
                          .split(".")
                          .pop();
                        const currentRate =
                          taxRateKey && cityStats.budget?.taxRates?.[taxRateKey]
                            ? cityStats.budget.taxRates[taxRateKey]
                            : 0;
                        actualProposedChangeValue =
                          taxEffect.change - currentRate; // This is the change in rate
                      }
                    }

                    // Financial state flags (recalculated for voting context)
                    const currentCityIncome =
                      cityStats.budget.totalAnnualIncome ||
                      cityStats.budget.annualIncome ||
                      1;
                    const currentCityBalance = cityStats.budget.balance || 0;
                    const currentCityDebt =
                      cityStats.budget.accumulatedDebt || 0;
                    const currentBalanceToIncomeRatio =
                      currentCityBalance / currentCityIncome;
                    const currentDebtToIncomeRatio =
                      currentCityDebt / currentCityIncome;

                    const council_hasLargeSurplus =
                      currentBalanceToIncomeRatio > 0.15 &&
                      currentDebtToIncomeRatio < 0.2;
                    const council_isComfortableFinancially =
                      currentBalanceToIncomeRatio > 0.05 &&
                      currentDebtToIncomeRatio < 0.4;
                    const council_hasSignificantDeficit =
                      currentBalanceToIncomeRatio < -0.075;
                    const council_hasHighDebt = currentDebtToIncomeRatio > 0.85;
                    const council_hasDireFinances =
                      currentBalanceToIncomeRatio < -0.12 ||
                      currentDebtToIncomeRatio > 1.2;
                    const council_isStrainedFinances =
                      (council_hasSignificantDeficit || council_hasHighDebt) &&
                      !council_hasDireFinances;

                    // -- Apply fiscal policy score adjustments --
                    if (isBudgetPolicy) {
                      if (actualProposedChangeValue > 0) {
                        // Spending Increase
                        if (council_hasDireFinances)
                          fiscalPolicyScoreAdjustment -= 2.0; // Strong penalty
                        else if (council_isStrainedFinances)
                          fiscalPolicyScoreAdjustment -= 1.2; // Moderate penalty
                        else if (council_hasLargeSurplus)
                          fiscalPolicyScoreAdjustment += 0.2; // Small OKAY for spending
                      } else if (actualProposedChangeValue < 0) {
                        // Spending Cut
                        if (council_hasDireFinances)
                          fiscalPolicyScoreAdjustment += 2.0; // Strong incentive
                        else if (council_isStrainedFinances)
                          fiscalPolicyScoreAdjustment += 1.2; // Moderate incentive
                        else if (council_hasLargeSurplus)
                          fiscalPolicyScoreAdjustment -= 0.7; // Penalize cuts with large surplus
                      }
                    } else if (isTaxPolicy) {
                      if (actualProposedChangeValue > 0) {
                        // Tax Increase
                        if (council_hasDireFinances)
                          fiscalPolicyScoreAdjustment += 3.0; // VERY Strong incentive
                        else if (council_isStrainedFinances)
                          fiscalPolicyScoreAdjustment += 2.0; // Strong incentive
                        else if (
                          council_isComfortableFinancially &&
                          currentBalanceToIncomeRatio < 0.02 &&
                          currentCityBalance >= 0
                        )
                          fiscalPolicyScoreAdjustment += 0.75;
                        else if (
                          currentCityBalance < 0 &&
                          !council_isStrainedFinances &&
                          !council_hasDireFinances
                        )
                          fiscalPolicyScoreAdjustment += 0.5; // Neutral but in red
                        else if (council_hasLargeSurplus)
                          fiscalPolicyScoreAdjustment -= 1.5; // Penalize tax hikes with large surplus
                      } else if (actualProposedChangeValue < 0) {
                        // Tax Cut
                        if (council_hasDireFinances)
                          fiscalPolicyScoreAdjustment -= 2.5; // Strong penalty
                        else if (council_isStrainedFinances)
                          fiscalPolicyScoreAdjustment -= 1.5; // Moderate penalty
                        else if (council_hasLargeSurplus)
                          fiscalPolicyScoreAdjustment += 1.0; // Good to cut taxes with surplus
                      }
                    }
                    combinedScore += fiscalPolicyScoreAdjustment;

                    // -- Fiscal Pragmatism / Necessity Modifier --
                    // This applies if the AI is ideologically opposed but finances demand action.
                    if (council_hasDireFinances) {
                      if (isTaxPolicy && actualProposedChangeValue > 0.002) {
                        // Tax increase of at least 0.2pp
                        if (ideologicalFactor < -0.2) {
                          // If AI is moderately to strongly opposed
                          combinedScore +=
                            0.5 + Math.abs(ideologicalFactor * 0.5); // Significantly reduce opposition, add bonus
                        } else {
                          combinedScore += 0.3; // General dire need bonus for tax hike
                        }
                      } else if (
                        isBudgetPolicy &&
                        actualProposedChangeValue < -(currentCityIncome * 0.01)
                      ) {
                        // Significant spending cut
                        if (ideologicalFactor < -0.2) {
                          // If AI is moderately to strongly opposed to cuts
                          combinedScore +=
                            0.4 + Math.abs(ideologicalFactor * 0.4);
                        } else {
                          combinedScore += 0.25;
                        }
                      }
                    } else if (council_isStrainedFinances) {
                      if (isTaxPolicy && actualProposedChangeValue > 0.001) {
                        // Tax increase of at least 0.1pp
                        if (ideologicalFactor < -0.1) {
                          // If AI is somewhat opposed
                          combinedScore +=
                            0.3 + Math.abs(ideologicalFactor * 0.3);
                        } else {
                          combinedScore += 0.15;
                        }
                      }
                    }

                    // Final Vote Decision
                    const yeaThreshold = 0.2; // Standard Yea
                    const nayThreshold = -0.2; // Standard Nay

                    if (combinedScore > yeaThreshold) {
                      voteChoice = "yea";
                    } else if (combinedScore < nayThreshold) {
                      voteChoice = "nay";
                    } else {
                      // Abstain or lean based on fiscal pressure
                      voteChoice = "abstain"; // Default
                      if (
                        council_hasDireFinances ||
                        council_isStrainedFinances
                      ) {
                        if (isTaxPolicy && actualProposedChangeValue > 0)
                          voteChoice = "yea"; // Lean YEA on tax hikes
                        else if (
                          isBudgetPolicy &&
                          actualProposedChangeValue < 0
                        )
                          voteChoice = "yea"; // Lean YEA on spending cuts
                        else if (
                          isBudgetPolicy &&
                          actualProposedChangeValue > 0
                        )
                          voteChoice = "nay"; // Lean NAY on spending increases
                        else if (isTaxPolicy && actualProposedChangeValue < 0)
                          voteChoice = "nay"; // Lean NAY on tax cuts
                      }
                    }
                  } // end if (policyDefinition)
                  get().actions.recordCouncilVote(
                    proposal.id,
                    councilMember.id,
                    voteChoice
                  );
                }
              }
            });
          }
          if (!isDateBefore(currentDate, proposal.votingClosesDate)) {
            get().actions.updateProposalDetails(proposal.id, {
              status: "voting_closed",
            });
            get().actions.finalizePolicyVote(proposal.id);
          }
        }
      });
    },
    updateProposalStatus: (proposalId, newStatus) => {
      set((state) => {
        const proposalIndex = state.proposedLegislation.findIndex(
          (p) => p.id === proposalId
        );
        if (proposalIndex === -1) return {};

        const updatedProposals = state.proposedLegislation.map((p, index) => {
          if (index === proposalIndex) {
            return { ...p, status: newStatus };
          }
          return p;
        });
        console.log(
          `[Legislation] Proposal ${proposalId} status updated to ${newStatus}`
        );

        return { proposedLegislation: updatedProposals };
      });
    },
  },
});
