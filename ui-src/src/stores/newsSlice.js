// ui-src/src/stores/newsSlice.js
import { createNewsEventObject } from "../utils/generalUtils"; // Ensure correct path

const MAX_NEWS_ITEMS = 200; // Define a limit for total news items

export const createNewsSlice = (set, get) => ({
  // State owned by this slice
  newsItems: [],

  // Actions nested for clarity (optional, but good practice)
  actions: {
    addNewsEvent: (eventDetailsOrArray) => {
      // Get current date from timeSlice (if not already in eventDetails)
      // It's better if eventDetails already contains a 'date' field.
      const defaultDate = get().actions.time?.getCurrentDate?.() ||
        get().activeCampaign?.currentDate || { year: 0, month: 0, day: 0 };

      const eventsToAddInput = Array.isArray(eventDetailsOrArray)
        ? eventDetailsOrArray
        : [eventDetailsOrArray];

      if (eventsToAddInput.length === 0) return;

      const newCompleteEvents = eventsToAddInput.map((details) =>
        // Ensure createNewsEventObject is flexible or details always include a date
        createNewsEventObject(details.date || defaultDate, details)
      );

      set((state) => ({
        // 'state' here is the newsSlice's own state
        newsItems: [...newCompleteEvents, ...state.newsItems].slice(
          0,
          MAX_NEWS_ITEMS
        ),
      }));
    },

    clearAllNews: () => {
      set({ newsItems: [] });
    },
    // You might want an action to clear news related to a specific campaignId if you add that to news items
  },
});
