// ui-src/src/data/campaignStaffData.js
export const STAFF_ROLES_INFO = {
  CAMPAIGN_MANAGER: {
    id: "campaign_manager",
    name: "Campaign Manager",
    description:
      "Oversees strategy, budget, and daily operations. Improves overall campaign efficiency.",
    costPerWeek: 1000, // Example cost, adjust based on your game's economy
    uiIcon: "📈", // Placeholder for a potential icon
    effectsSummary: "Boosts overall efficiency, unlocks some actions.",
    // Detailed effects would be applied by your game logic
  },
  COMMUNICATIONS_DIRECTOR: {
    id: "comms_director",
    name: "Communications Director",
    description:
      "Manages messaging, media relations, press releases, and ad strategy.",
    costPerWeek: 850,
    uiIcon: "📰",
    effectsSummary: "Improves ad effectiveness and media appearance outcomes.",
  },
  FIELD_DIRECTOR: {
    id: "field_director",
    name: "Field Director",
    description:
      "Organizes grassroots efforts, volunteer activities (canvassing, phone banking), and rally logistics.",
    costPerWeek: 700,
    uiIcon: "📢",
    effectsSummary:
      "Boosts volunteer recruitment/effectiveness and rally impact.",
  },
  POLLSTER: {
    id: "pollster",
    name: "Pollster",
    description:
      "Conducts internal polling, analyzes voter data, and provides strategic insights.",
    costPerWeek: 900,
    uiIcon: "📊",
    effectsSummary:
      "Provides detailed internal polling data and identifies key voter concerns.",
  },
  FUNDRAISING_DIRECTOR: {
    // More specialized than just the player action
    id: "fundraising_director",
    name: "Fundraising Director",
    description:
      "Manages fundraising strategy, donor outreach, and organizes fundraising events.",
    costPerWeek: 800,
    uiIcon: "💰",
    effectsSummary:
      "Significantly boosts fundraising totals and unlocks larger events.",
  },
};
