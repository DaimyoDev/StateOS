import React, { useState, useMemo } from "react";
import useGameStore from "../../store"; // Import your Zustand store
import "./TabStyles.css";
import "./NewsEventsTab.css";

// Simple helper to get an emoji/icon based on event type and impact
const getEventIcon = (type, impact) => {
  // (Your existing getEventIcon function - no changes needed here)
  if (type === "election_result") return "🏆";
  if (type === "city_stat_change") {
    if (impact === "positive") return "📈";
    if (impact === "negative") return "📉";
    return "📊";
  }
  if (type === "policy_effect") {
    // Added this to match news from policySlice
    if (impact === "positive") return "✅";
    if (impact === "negative") return "❌";
    return "⚖️"; // Neutral policy effect
  }
  if (type === "political") return "🗣️";
  if (type === "player_action_consequence") {
    if (impact === "positive") return "👍";
    if (impact === "negative") return "👎";
    return "📝";
  }
  if (type === "random_event") {
    if (impact === "positive") return "✨";
    if (impact === "negative") return "⚡";
    return "🎲";
  }
  return "📰"; // Default news icon
};

const NewsItem = ({ event }) => {
  const { date, headline, summary, type, impact, scope } = event;
  const icon = getEventIcon(type, impact);

  // Basic check for date object
  const displayDate =
    date && typeof date === "object" && date.year && date.month && date.day
      ? `${date.month}/${date.day}/${date.year}`
      : "Date N/A";

  return (
    <div
      className={`news-item impact-${impact || "neutral"} type-${
        type || "unknown"
      } scope-${scope || "unknown"}`} // Added fallback for type/scope
    >
      <div className="news-item-icon-column">
        <span className="news-icon" title={`Type: ${type}, Impact: ${impact}`}>
          {icon}
        </span>
      </div>
      <div className="news-item-content-column">
        <div className="news-header">
          <strong className="news-headline">{headline || "No Headline"}</strong>
          <span className="news-date">{displayDate}</span>
        </div>
        <p className="news-summary">{summary || "No summary available."}</p>
      </div>
    </div>
  );
};

// If campaignData is NO LONGER needed for anything else in this tab, you can remove it as a prop.
// If it IS still needed for other purposes, you can keep it.
// For this example, I'm assuming it might still be used or can be removed if only for news.
const NewsEventsTab = () => {
  // Select newsItems directly from the Zustand store
  const allNewsItems = useGameStore((state) => state.newsItems); // Or state.news.newsItems if nested

  const [filterScope, setFilterScope] = useState("all");

  // newsAndEventsFromProp is no longer the primary source
  // const newsAndEventsFromProp = campaignData?.newsAndEvents; // This line can be removed

  const filteredEvents = useMemo(() => {
    // Use allNewsItems from the store, which should already be sorted newest first
    // if your addNewsEvent prepends new items.
    const currentNewsAndEvents = allNewsItems || [];

    if (filterScope === "all") {
      return currentNewsAndEvents;
    }
    return currentNewsAndEvents.filter((event) => event.scope === filterScope);
  }, [filterScope, allNewsItems]); // Dependency is now on allNewsItems from the store

  return (
    <div className="tab-content-container news-events-tab ui-panel">
      <div className="news-events-header">
        <h2 className="tab-title">News & Recent Events</h2>
        <div className="news-filters">
          <span>Filter by Scope: </span>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
          >
            <option value="all">All</option>
            <option value="local">Local</option>
            <option value="regional">Regional</option>
            <option value="national">National</option>
            {/* <option value="global">Global</option> */}
          </select>
        </div>
      </div>

      <div className="news-feed">
        {filteredEvents && filteredEvents.length > 0 ? ( // Added check for filteredEvents itself
          filteredEvents.map((event) =>
            // Ensure event and event.id exist to prevent runtime errors
            event && event.id ? <NewsItem key={event.id} event={event} /> : null
          )
        ) : (
          <p className="no-news-message">
            No news or events to display for the selected scope.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsEventsTab;
