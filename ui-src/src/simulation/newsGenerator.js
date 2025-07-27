// src/simulation/newsGenerator.js
import { createNewsArticleObject } from "../entities/organizationEntities";
import { getRandomElement } from "../utils/core";
import { CITY_POLICIES } from "../data/policyDefinitions";

/**
 * Determines an outlet's likely stance on a policy by cross-referencing biases.
 * @param {object} outlet - The news outlet object.
 * @param {string} policyId - The ID of the policy in question.
 * @returns {string} 'support', 'oppose', or 'neutral'.
 */
const determineOutletStanceOnPolicy = (outlet, policyId) => {
  // 1. Check for a direct, pre-defined bias first.
  if (outlet.biases.policyBiases && outlet.biases.policyBiases[policyId]) {
    return outlet.biases.policyBiases[policyId];
  }

  // 2. If no direct bias, calculate one based on ideology.
  const policyDef = CITY_POLICIES.find((p) => p.id === policyId);
  if (!policyDef || !policyDef.baseSupport || !outlet.biases.ideologyBiases) {
    return "neutral";
  }

  let totalScore = 0;
  for (const [ideology, supportValue] of Object.entries(
    policyDef.baseSupport
  )) {
    const outletBiasForIdeology = outlet.biases.ideologyBiases[ideology] || 0;
    totalScore += supportValue * outletBiasForIdeology;
  }

  // Determine stance based on the calculated score
  if (totalScore > 1.5) return "support";
  if (totalScore < -1.5) return "oppose";
  return "neutral";
};

/**
 * Generates a biased news article based on a game event and a news outlet's biases.
 * @param {object} event - The game event (e.g., { type: 'policy_vote', context: { ... } }).
 * @param {object} outlet - The news outlet object publishing the story.
 * @param {object} date - The current in-game date.
 * @returns {object} A new news article object.
 */
export const generateNewsForEvent = (event, outlet, date) => {
  let headline = "";
  let summary = "";
  let body = "";

  const author = getRandomElement(outlet.staff);

  if (event.type === "policy_vote") {
    const { policyName, didPass, policyId, yeaVotes, nayVotes } = event.context;

    // Use the new intelligent function to determine the outlet's stance
    const outletStance = determineOutletStanceOnPolicy(outlet, policyId);

    if (didPass) {
      if (outletStance === "support") {
        headline = `Landmark "${policyName}" Reform Passes Council`;
        summary = `In a significant victory for common sense, the city council has enacted the much-needed ${policyName} policy, promising positive changes for the community. The final vote was ${yeaVotes} to ${nayVotes}.`;
      } else if (outletStance === "oppose") {
        headline = `Controversial "${policyName}" Bill Forced Through Council`;
        summary = `Ignoring widespread concerns, the city council has passed the divisive ${policyName} policy, raising serious questions about its future impact. The final vote was ${yeaVotes} to ${nayVotes}.`;
      } else {
        // Neutral
        headline = `Council Enacts "${policyName}" Policy`;
        summary = `Following a period of debate, the ${policyName} policy was passed by the city council today. The final vote was ${yeaVotes} to ${nayVotes}.`;
      }
    } else {
      // Policy Failed
      if (outletStance === "support") {
        headline = `"${policyName}" Initiative Defeated in Contentious Vote`;
        summary = `A setback for progress today as the council failed to pass the crucial ${policyName} reform. Opponents celebrated the vote, which leaves key issues unaddressed after a ${yeaVotes}-${nayVotes} decision.`;
      } else if (outletStance === "oppose") {
        headline = `Victory for Citizens: Unpopular "${policyName}" Bill Rejected by Council`;
        summary = `The city council today voted ${nayVotes} to ${yeaVotes} against the potentially harmful ${policyName} bill, heeding the concerns of community members.`;
      } else {
        // Neutral
        headline = `"${policyName}" Proposal Fails to Pass Council Vote`;
        summary = `The proposed ${policyName} policy did not achieve the majority needed for passage. The final vote was ${yeaVotes} to ${nayVotes}.`;
      }
    }
  } else {
    headline = event.headline || "An Event Occurred";
    summary = event.summary || "Details are still emerging.";
  }

  if (outlet.type === "TV/Radio") {
    body = `(Broadcast Transcript) Anchor: "Good evening. Our top story tonight: ${summary}"`;
  } else {
    body = `${summary} Further analysis suggests this decision will have significant long-term consequences for the city's political and economic landscape.`;
  }

  return createNewsArticleObject({
    headline,
    summary,
    body,
    outletId: outlet.id,
    authorId: author?.id,
    date,
    type: event.type,
    context: event.context,
  });
};
