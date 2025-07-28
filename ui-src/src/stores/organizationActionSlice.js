// ui-src/src/stores/organizationActionSlice.js
import { generateId, getRandomInt, getRandomElement } from "../utils/core";

export const createOrganizationActionSlice = (set, get) => ({
  /**
   * Player action to meet with a lobbying group. Spends political capital.
   * @param {string} lobbyGroupId - The ID of the group to meet with.
   */
  meetWithLobbyist: (lobbyGroupId) => {
    set((state) => {
      const group = state.activeCampaign?.lobbyingGroups?.find(
        (g) => g.id === lobbyGroupId
      );
      if (!group) {
        console.warn(
          `Lobbying Action: Group with ID ${lobbyGroupId} not found.`
        );
        return state;
      }

      // Logic: Spend political capital, get a random outcome.
      const cost = 5; // Political capital cost
      const currentCapital = state.activeCampaign.politician.politicalCapital;

      if (currentCapital < cost) {
        get().actions.addToast({
          message: "Not enough political capital to meet.",
          type: "error",
        });
        return state;
      }

      // Random outcome
      const roll = Math.random();
      let message = `You met with representatives from ${group.name}.`;

      if (roll < 0.4) {
        // 40% chance of a donation offer
        const donationAmount =
          getRandomInt(5000, 25000) * (group.financialPower / 50);
        message += ` They were impressed and offered a donation of $${Math.floor(
          donationAmount
        )} to your campaign!`;
        // In a real implementation, this would queue a decision for the player
      } else if (roll < 0.7) {
        // 30% chance of improved relations
        message +=
          " The meeting was productive and strengthened your relationship.";
      } else {
        // 30% chance of a neutral/negative outcome
        message += " The discussion was tense, and no agreements were reached.";
      }

      get().actions.addToast({ message, type: "info" });

      return {
        activeCampaign: {
          ...state.activeCampaign,
          politician: {
            ...state.activeCampaign.politician,
            politicalCapital: currentCapital - cost,
          },
        },
      };
    });
  },

  /**
   * Player action to grant an interview to a news outlet. Consumes time and generates a news story.
   * @param {string} outletId - The ID of the news outlet.
   */
  grantInterview: (outletId) => {
    const state = get();
    const outlet = state.activeCampaign?.newsOutlets?.find(
      (o) => o.id === outletId
    );
    if (!outlet) {
      console.warn(`News Action: Outlet with ID ${outletId} not found.`);
      return;
    }

    // Logic: Consume time, generate a news story based on oratory skill and outlet bias.
    const politician = state.activeCampaign.politician;
    const oratory = politician.attributes.oratory;
    const currentDate = state.activeCampaign.currentDate;

    // Determine if interview was positive or negative
    const successChance = (oratory / 10) * 0.5 + 0.25; // Base chance + skill bonus
    const isSuccess = Math.random() < successChance;

    const headline = isSuccess
      ? `"${politician.lastName}" Shines in Exclusive Interview`
      : `"${politician.lastName}" Stumbles Under Questioning`;

    const summary = isSuccess
      ? `In a compelling interview with ${outlet.name}, the candidate laid out a clear and popular vision.`
      : `The candidate appeared unprepared during an interview with ${outlet.name}, dodging several key questions.`;

    // Find a random journalist from the outlet to be the author
    const author =
      outlet.staff?.length > 0
        ? getRandomElement(outlet.staff)
        : { name: "Outlet Staff" };

    // UPDATED: Use the correct action from newsSlice
    get().actions.addNewsArticle({
      id: `news_article_${generateId()}`,
      headline,
      summary,
      outletId,
      authorId: author.id,
      author: author, // Include full author object for display
      date: currentDate,
      type: "interview",
    });

    // Add a toast notification for the player
    get().actions.addToast({
      message: `Your interview with ${outlet.name} has been published.`,
      type: "info",
    });
  },
});
