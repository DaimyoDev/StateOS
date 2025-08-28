// src/simulation/newsGenerator.js
import { createNewsArticleObject } from "../entities/organizationEntities";
import { getRandomElement } from "../utils/core";
import { CITY_POLICIES } from "../data/cityPolicyDefinitions";
import { formatOfficeTitleForDisplay } from "../utils/governmentUtils";

const ARTICLE_COMPONENTS = {
  positive_adjectives: [
    "landmark",
    "visionary",
    "common-sense",
    "crucial",
    "beneficial",
    "popular",
    "forward-thinking",
    "progressive",
    "groundbreaking",
    "transformative",
    "innovative",
    "essential"
  ],
  negative_adjectives: [
    "controversial",
    "divisive",
    "dangerous",
    "unpopular",
    "rushed",
    "short-sighted",
    "draconian",
    "misguided",
    "reckless",
    "ill-conceived",
    "problematic",
    "flawed"
  ],
  neutral_verbs: ["passed", "enacted", "voted on", "approved", "rejected", "considered", "debated"],
  positive_verbs: [
    "secured victory for",
    "championed",
    "delivered on",
    "pushed through",
    "successfully advanced",
    "skillfully negotiated"
  ],
  negative_verbs: [
    "forced through",
    "rammed through",
    "pushed a divisive agenda on",
    "failed to pass",
    "steamrolled opposition for",
    "ignored public concerns about"
  ],
  citizen_quotes: {
    support: [
      "I'm glad to see the council is finally listening to reason.",
      "This is exactly what our city needs right now. It's a great day.",
      "I feel more optimistic about the future of our community.",
      "Finally, someone is looking out for working families like mine.",
      "This shows our representatives actually care about their constituents.",
      "I've been waiting years for something like this to happen."
    ],
    oppose: [
      "I can't believe they went through with this. It's a disaster waiting to happen.",
      "Who are these politicians working for? Certainly not us.",
      "I'm genuinely worried about what this means for my family.",
      "This is going to hurt small businesses like mine.",
      "They clearly don't understand the real-world consequences of their actions.",
      "We'll be paying for this mistake for years to come."
    ],
    neutral: [
      "I guess we'll see how this plays out.",
      "Time will tell if this was the right decision.",
      "I'm cautiously optimistic but we need to watch closely.",
      "There are valid arguments on both sides of this issue.",
      "I hope our leaders know what they're doing."
    ]
  },
  story_angles: {
    policy_vote: [
      "process", "impact", "reaction", "background", "future_implications"
    ],
    economic_update: [
      "trend_analysis", "expert_opinion", "local_business_impact", "comparison"
    ],
    election_results: [
      "victory_speech", "concession", "analysis", "voter_turnout", "next_steps"
    ]
  }
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
 * Gets the appropriate legislative body name based on context and policy level
 * @param {object} context - Event context that may contain governmentOffices, policyId, or level info
 * @param {string} cityName - Name of the city 
 * @returns {string} The appropriate legislative body name
 */
const getLegislativeBodyName = (context, cityName) => {
  // First check if we have explicit level information in context
  if (context?.level) {
    switch (context.level) {
      case 'national':
      case 'federal':
        return 'Congress';
      case 'state':
        return 'State Legislature';
      case 'county':
        return 'County Council';
      case 'city':
      case 'local':
        return cityName ? `${cityName} City Council` : 'City Council';
    }
  }
  
  // Try to infer from policy ID patterns
  if (context?.policyId) {
    const policyId = context.policyId.toLowerCase();
    if (policyId.includes('federal')) {
      return 'Congress';
    } else if (policyId.includes('state')) {
      return 'State Legislature';
    } else if (policyId.includes('county')) {
      return 'County Council';
    }
  }
  
  // Try to find offices from the context and determine level
  if (context?.governmentOffices) {
    const relevantOffice = context.governmentOffices.find(office => 
      office.officeName?.toLowerCase().includes('council') ||
      office.officeName?.toLowerCase().includes('legislature') ||
      office.officeNameTemplateId?.includes('council') ||
      office.level
    );
    
    if (relevantOffice) {
      // Check office level
      if (relevantOffice.level?.includes('state')) {
        return 'State Legislature';
      } else if (relevantOffice.level?.includes('federal')) {
        return 'Congress';
      } else if (relevantOffice.level?.includes('county')) {
        return 'County Council';
      } else if (relevantOffice.level?.includes('city') || relevantOffice.level?.includes('local')) {
        return cityName ? `${cityName} City Council` : 'City Council';
      }
      
      // Use the actual office name, formatted properly
      const formattedName = formatOfficeTitleForDisplay(relevantOffice, cityName)
        .replace(/ Member.*|Councilor.*|Councillor.*|Representative.*|Senator.*/, '')
        .trim();
      
      if (formattedName && formattedName !== 'Office') {
        return formattedName;
      }
    }
  }
  
  // Fallback - assume city level if we have a city name, otherwise generic
  return cityName ? `${cityName} City Council` : "the local council";
};

/**
 * Generates the full, biased content for a news article based on an event.
 * @param {object} event - The game event.
 * @param {object} outlet - The news outlet publishing the story.
 * @param {object} allPoliticians - A list of all politicians for sourcing quotes.
 * @param {string} cityName - Name of the city for context
 * @returns {object} An object containing { headline, summary, fullBody, tone }.
 */
const generateArticleComponents = (event, outlet, cityName) => {
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

        const legislativeBody = getLegislativeBodyName(context, cityName);
        summary = `In a ${
          stance === "neutral" ? "session today" : "heated session"
        }, the ${legislativeBody} ${
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
        const legislativeBody = getLegislativeBodyName(context, cityName);
        headline =
          stance === "support"
            ? `"${policyName}" Initiative Defeated in Contentious Vote`
            : `Victory for Citizens: Unpopular "${policyName}" Bill Rejected`;
        if (stance === "neutral")
          headline = `"${policyName}" Proposal Fails to Pass ${legislativeBody.replace(/City |Municipal /, '')}`;

        summary = `A vote of ${yeaVotes}-${nayVotes} today saw the defeat of the much-debated ${policyName} proposal in the ${legislativeBody}.`;
        fullBody.paragraphs.push(
          summary,
          `The failure of the bill has been met with relief by its detractors, who called it a ${getRandomElement(
            ARTICLE_COMPONENTS.negative_adjectives
          )} piece of legislation. Proponents, however, expressed frustration, arguing that a key opportunity has been missed.`
        );
        
        // Add variety with different quotes based on stance
        const quoteType = stance === "neutral" ? "neutral" : (stance === "oppose" ? "support" : "oppose");
        fullBody.quotes.push({
          text: getRandomElement(ARTICLE_COMPONENTS.citizen_quotes[quoteType]),
          source: "A Local Resident",
          sourceAffiliation: "Citizen",
        });
      }
      break;
    }
    case "economic_update": {
      const { stat, oldValue, newValue, direction } = context;
      tone = direction === "positive" ? "positive" : "negative";
      const trend = direction === "positive" ? "an improvement" : "a worrying trend";
      const changeDesc = direction === "positive" ? "a welcome drop" : "a sharp rise";
      const magnitude = Math.abs(newValue - oldValue);
      const intensifier = magnitude > 2 ? "dramatic" : magnitude > 1 ? "significant" : "modest";

      // Vary headlines based on magnitude and direction
      const headlineVariations = {
        positive: [
          `Local Economy Shows Promise as ${stat} Improves`,
          `${stat} Decline Brings Hope for Economic Recovery`,
          `City Sees ${intensifier.charAt(0).toUpperCase() + intensifier.slice(1)} Economic Progress`
        ],
        negative: [
          `Economic Concerns Mount as ${stat} Rises`,
          `City Faces Growing Challenge with ${stat} Increase`,
          `Local Officials Respond to ${intensifier.charAt(0).toUpperCase() + intensifier.slice(1)} ${stat} Spike`
        ]
      };
      
      headline = getRandomElement(headlineVariations[direction]);
      summary = `New figures released this month show ${stat} moving from ${oldValue}% to ${newValue}%, representing a ${intensifier} change that economists are calling "${trend}".`;
      
      // Add more detailed economic context
      const contextParagraphs = [
        `This ${changeDesc} in ${stat} is expected to have a ripple effect across the local economy. Local businesses are ${direction === "positive" ? "cautiously optimistic" : "expressing concern"} about the implications.`,
        `Economic analysts suggest this trend ${direction === "positive" ? "could signal the beginning of sustained growth" : "warrants close monitoring by city officials"}. The ${stat} metric is often seen as an early indicator of broader economic health.`
      ];
      
      fullBody.paragraphs.push(summary, ...contextParagraphs);
      
      // Add an expert quote
      const expertQuotes = {
        positive: [
          "This is exactly the kind of trend we want to see. If it continues, we could be looking at a real turnaround.",
          "The numbers are encouraging, but we need to see sustained improvement over several quarters.",
          "Local policy decisions seem to be paying off. This is a positive development."
        ],
        negative: [
          "These figures are concerning and require immediate attention from local leadership.",
          "We need to understand what's driving this trend before it becomes a more serious problem.",
          "This is a wake-up call that our economic policies may need reassessment."
        ]
      };
      
      fullBody.quotes.push({
        text: getRandomElement(expertQuotes[direction]),
        source: "Dr. Sarah Martinez",
        sourceAffiliation: "Regional Economic Institute",
      });
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
    case "scandal": {
      const { politician, type: scandalType, severity } = context;
      tone = "negative";
      
      const scandalHeadlines = {
        corruption: `${politician.name} Under Fire Over Corruption Allegations`,
        ethics: `Ethics Questions Surround ${politician.name}'s Recent Actions`,
        financial: `Financial Impropriety Alleged Against ${politician.name}`
      };
      
      headline = scandalHeadlines[scandalType] || `Controversy Engulfs ${politician.name}`;
      summary = `Local ${politician.office || 'official'} ${politician.name} faces mounting pressure amid allegations of ${scandalType} that have rocked the political establishment.`;
      
      fullBody.paragraphs.push(
        summary,
        `The allegations, which ${politician.name} has ${Math.random() > 0.5 ? "vehemently denied" : "yet to address publicly"}, have prompted calls for investigation from opposition figures and civic groups alike.`
      );
      break;
    }
    case "community_event": {
      const { eventName, attendance, outcome } = context;
      tone = outcome === "positive" ? "positive" : "neutral";
      
      headline = `Community Comes Together for ${eventName}`;
      summary = `Over ${attendance} residents participated in ${eventName}, highlighting the strong community spirit that defines our city.`;
      
      fullBody.paragraphs.push(
        summary,
        `The event, which ${outcome === "positive" ? "exceeded organizers' expectations" : "drew a steady crowd throughout the day"}, demonstrates the continuing importance of civic engagement in local affairs.`
      );
      break;
    }
    case "infrastructure": {
      const { projectName, status, impact } = context;
      tone = status === "completed" ? "positive" : "neutral";
      
      const statusMap = {
        started: "begins",
        ongoing: "continues",
        completed: "reaches completion",
        delayed: "faces setbacks"
      };
      
      headline = `${projectName} Project ${statusMap[status].charAt(0).toUpperCase() + statusMap[status].slice(1)}`;
      summary = `The much-anticipated ${projectName} initiative has ${statusMap[status]}, with ${impact || "significant implications for local residents"}.`;
      
      fullBody.paragraphs.push(
        summary,
        `City officials say the project ${status === "completed" ? "represents a major step forward" : "remains on track despite challenges"} for infrastructure development in the region.`
      );
      break;
    }
    default:
      headline = event.headline || "Local News Update";
      summary = event.summary || "Details are still emerging on this developing story.";
      fullBody.paragraphs.push(summary);
      
      // Add some generic local interest
      if (!event.headline && !event.summary) {
        const genericStories = [
          "City Council Meeting Addresses Resident Concerns",
          "Local Business Leaders Meet with Officials",
          "Community Groups Plan Upcoming Events",
          "Municipal Services Update Announced"
        ];
        headline = getRandomElement(genericStories);
        summary = "City officials and community members continue working together on local issues and initiatives.";
      }
      break;
  }

  // Add random local interest details to make articles feel more authentic
  if (fullBody.quotes.length === 0 && Math.random() > 0.7) {
    const neutralQuote = getRandomElement(ARTICLE_COMPONENTS.citizen_quotes.neutral);
    fullBody.quotes.push({
      text: neutralQuote,
      source: "A Local Resident",
      sourceAffiliation: "Community Member",
    });
  }
  
  // Occasionally add a follow-up paragraph for depth
  if (Math.random() > 0.6 && fullBody.paragraphs.length < 4) {
    const followUpLines = [
      "This story continues to develop and updates will be provided as more information becomes available.",
      "City staff indicated they will monitor the situation closely in the coming weeks.",
      "Community feedback on this matter will be collected at the next public meeting.",
      "Local residents are encouraged to stay informed about ongoing developments."
    ];
    fullBody.paragraphs.push(getRandomElement(followUpLines));
  }

  return { headline, summary, fullBody, tone };
};

/**
 * Generates a biased news article based on a game event and a news outlet's biases.
 * @param {object} event - The game event (e.g., { type: 'policy_vote', context: { ... } }).
 * @param {object} outlet - The news outlet object publishing the story.
 * @param {object} date - The current in-game date.
 * @param {Array<object>} allPoliticians - All politicians in the game.
 * @param {string} cityName - Name of the city for context.
 * @returns {object} A new news article object.
 */
export const generateNewsForEvent = (
  event,
  outlet,
  date,
  allPoliticians = [],
  cityName = null
) => {
  const author = getRandomElement(outlet.staff);
  const { headline, summary, fullBody, tone } = generateArticleComponents(
    event,
    outlet,
    cityName
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
