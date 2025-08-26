// src/simulation/newsGenerator.js
import { createNewsArticleObject } from "../entities/organizationEntities";
import { getRandomElement } from "../utils/core";
import { CITY_POLICIES } from "../data/cityPolicyDefinitions";

const ARTICLE_COMPONENTS = {
  positive_adjectives: [
    "landmark",
    "visionary",
    "common-sense",
    "crucial",
    "beneficial",
    "popular",
    "forward-thinking",
  ],
  negative_adjectives: [
    "controversial",
    "divisive",
    "dangerous",
    "unpopular",
    "rushed",
    "short-sighted",
    "draconian",
  ],
  neutral_verbs: ["passed", "enacted", "voted on", "approved", "rejected"],
  positive_verbs: [
    "secured victory for",
    "championed",
    "delivered on",
    "pushed through",
  ],
  negative_verbs: [
    "forced through",
    "rammed through",
    "pushed a divisive agenda on",
    "failed to pass",
  ],
  citizen_quotes: {
    support: [
      "I'm glad to see the council is finally listening to reason.",
      "This is exactly what our city needs right now. It's a great day.",
      "I feel more optimistic about the future of our community.",
    ],
    oppose: [
      "I can't believe they went through with this. It's a disaster waiting to happen.",
      "Who are these politicians working for? Certainly not us.",
      "I'm genuinely worried about what this means for my family.",
    ],
  },
};

/**
 * Determines an outlet's likely stance on a policy by cross-referencing biases.
 * @param {object} outlet - The news outlet object.
 * @param {string} policyId - The ID of the policy in question.
 * @returns {string} 'support', 'oppose', or 'neutral'.
 */
const determineOutletStanceOnPolicy = (outlet, policyId) => {
  if (outlet.biases.policyBiases && outlet.biases.policyBiases[policyId]) {
    return outlet.biases.policyBiases[policyId];
  }

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

  if (totalScore > 1.5) return "support";
  if (totalScore < -1.5) return "oppose";
  return "neutral";
};

/**
 * Generates the full, biased content for a news article based on an event.
 * @param {object} event - The game event.
 * @param {object} outlet - The news outlet publishing the story.
 * @param {object} allPoliticians - A list of all politicians for sourcing quotes.
 * @returns {object} An object containing { headline, summary, fullBody, tone }.
 */
const generateArticleComponents = (event, outlet) => {
  const { type, context } = event;
  let headline = "",
    summary = "",
    fullBody = { paragraphs: [], quotes: [] },
    tone = "neutral";

  switch (type) {
    case "policy_vote": {
      const { policyName, didPass, policyId, yeaVotes, nayVotes } = context;
      const stance = determineOutletStanceOnPolicy(outlet, policyId);
      const adj =
        stance === "support"
          ? getRandomElement(ARTICLE_COMPONENTS.positive_adjectives)
          : getRandomElement(ARTICLE_COMPONENTS.negative_adjectives);

      if (didPass) {
        tone =
          stance === "support"
            ? "positive"
            : stance === "oppose"
            ? "negative"
            : "neutral";
        headline =
          stance === "support"
            ? `Landmark "${policyName}" Reform Passes Council`
            : `Controversial "${policyName}" Bill Forced Through Council`;
        if (stance === "neutral")
          headline = `Council Enacts "${policyName}" Policy After ${yeaVotes}-${nayVotes} Vote`;

        summary = `In a ${
          stance === "neutral" ? "session today" : "heated session"
        }, the City Council ${
          stance === "support" ? "has passed" : "voted to approve"
        } the ${adj} ${policyName} policy, following a vote of ${yeaVotes} to ${nayVotes}.`;

        fullBody.paragraphs.push(
          summary,
          `The decision marks the culmination of weeks of intense debate that has divided both the public and political figures. Supporters have hailed it as a ${getRandomElement(
            ARTICLE_COMPONENTS.positive_adjectives
          )} step forward, while opponents warn of unforeseen consequences.`
        );
        fullBody.quotes.push({
          text: getRandomElement(
            ARTICLE_COMPONENTS.citizen_quotes[
              stance === "support" ? "support" : "oppose"
            ]
          ),
          source: "A Local Resident",
          sourceAffiliation: "Citizen",
        });
        fullBody.paragraphs.push(
          `The new legislation is expected to take effect in the coming months, with the city administration now tasked with its implementation. All eyes will be on the long-term impacts of this ${adj} decision.`
        );
      } else {
        // Policy Failed
        tone =
          stance === "support"
            ? "negative"
            : stance === "oppose"
            ? "positive"
            : "neutral";
        headline =
          stance === "support"
            ? `"${policyName}" Initiative Defeated in Contentious Vote`
            : `Victory for Citizens: Unpopular "${policyName}" Bill Rejected`;
        if (stance === "neutral")
          headline = `"${policyName}" Proposal Fails to Pass Council`;

        summary = `A vote of ${yeaVotes}-${nayVotes} today saw the defeat of the much-debated ${policyName} proposal.`;
        fullBody.paragraphs.push(
          summary,
          `The failure of the bill has been met with relief by its detractors, who called it a ${getRandomElement(
            ARTICLE_COMPONENTS.negative_adjectives
          )} piece of legislation. Proponents, however, expressed frustration, arguing that a key opportunity has been missed.`
        );
      }
      break;
    }
    case "economic_update": {
      const { stat, oldValue, newValue, direction } = context;
      tone = direction === "positive" ? "positive" : "negative";
      const trend =
        direction === "positive" ? "an improvement" : "a worrying trend";
      const changeDesc =
        direction === "positive" ? "a welcome drop" : "a sharp rise";

      headline = `City Economy Shows Signs of ${
        direction === "positive" ? "Strength" : "Weakness"
      } as ${stat} Shifts`;
      summary = `New figures released this month show ${stat} moving from ${oldValue}% to ${newValue}%, a development economists are calling "${trend}".`;
      fullBody.paragraphs.push(
        summary,
        `This ${changeDesc} in ${stat} is expected to have a ripple effect across the local economy. Experts are cautiously watching to see if this trend will continue in the next quarter.`
      );
      break;
    }
    case "election_results": {
      const { officeName, winnerName, winnerPartyName, losers } = context;
      // Determine stance based on bias towards the winning party
      const winnerPartyBias = Object.entries(
        outlet.biases.partyBiases || {}
      ).find(([partyId]) => winnerPartyName.includes(partyId.name));
      let stance = "neutral";
      if (winnerPartyBias && winnerPartyBias[1] > 3) stance = "support";
      if (winnerPartyBias && winnerPartyBias[1] < -3) stance = "oppose";

      tone =
        stance === "support"
          ? "positive"
          : stance === "oppose"
          ? "negative"
          : "neutral";
      const adj = stance === "support" ? "decisive" : "shocking";

      headline = `${winnerName} Wins ${officeName} Election in ${adj} Result`;
      summary = `After a long and hard-fought campaign, ${winnerName} of ${winnerPartyName} has been declared the winner for the office of ${officeName}.`;

      fullBody.paragraphs.push(
        summary,
        `The result is being seen as a major ${
          stance === "support" ? "victory" : "upset"
        } for the ${winnerPartyName}. The mood at the winner's election headquarters was jubilant, while a somber tone fell over the camps of ${losers.join(
          ", "
        )}.`
      );
      fullBody.paragraphs.push(
        `Political analysts are now debating what this means for the future political direction of the region. "${winnerName}'s victory will undoubtedly reshape the landscape," said one commentator. "The question now is how they will govern."`
      );
      break;
    }
    default:
      headline = event.headline || "An Event Occurred";
      summary = event.summary || "Details are still emerging.";
      fullBody.paragraphs.push(summary);
      break;
  }

  return { headline, summary, fullBody, tone };
};

/**
 * Generates a biased news article based on a game event and a news outlet's biases.
 * @param {object} event - The game event (e.g., { type: 'policy_vote', context: { ... } }).
 * @param {object} outlet - The news outlet object publishing the story.
 * @param {object} date - The current in-game date.
 * @param {Array<object>} allPoliticians - All politicians in the game.
 * @returns {object} A new news article object.
 */
export const generateNewsForEvent = (
  event,
  outlet,
  date,
  allPoliticians = []
) => {
  const author = getRandomElement(outlet.staff);
  const { headline, summary, fullBody, tone } = generateArticleComponents(
    event,
    outlet,
    allPoliticians
  );

  return createNewsArticleObject({
    headline,
    summary,
    fullBody,
    tone,
    outletId: outlet.id,
    authorId: author?.id,
    date,
    type: event.type,
    context: event.context,
  });
};
