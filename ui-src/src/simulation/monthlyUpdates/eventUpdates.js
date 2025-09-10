// src/simulation/monthlyUpdates/eventUpdates.js

import { generateRandomEvent } from "../randomEventsSystem.js";
import { 
  processCascadingCoalitionUpdates 
} from "../../General Scripts/CoalitionSystem.js";

/**
 * Handles all event-related monthly updates including random events and coalition updates
 */
export class EventUpdater {
  /**
   * Process random events and their effects
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - { events: Array, newsItems: Array, coalitionUpdates: Object, campaignUpdates: Object }
   */
  processRandomEvents(campaign, getFromStore) {
    const results = {
      events: [],
      newsItems: [],
      coalitionUpdates: null,
      performanceMetrics: null,
      campaignUpdates: null
    };

    if (!campaign?.startingCity) {
      return results;
    }

    try {
      // Generate random event (30% chance per month)
      if (Math.random() < 0.3) {
        const gameContext = {
          currentDate: campaign.currentDate,
          locationName: campaign.startingCity?.name,
          cityName: campaign.startingCity?.name,
          countryId: campaign.country?.id,
          regionId: campaign.startingCity?.regionId,
          recentEvents: campaign.recentEvents || [],
          currentPolicies: [] // TODO: Extract current policies if needed
        };
        
        const randomEvent = generateRandomEvent(gameContext);

        if (randomEvent) {
          const processedEvent = this._processEventEffects(randomEvent, campaign, getFromStore);
          results.events.push(processedEvent);
          
          // Extract news articles for the main news feed
          if (processedEvent.newsArticles && processedEvent.newsArticles.length > 0) {
            results.newsItems.push(...processedEvent.newsArticles);
          }
          
          // Extract coalition effects if they exist
          if (processedEvent.coalitionEffects) {
            results.coalitionUpdates = processedEvent.coalitionEffects;
            results.performanceMetrics = processedEvent.coalitionEffects.performanceReport;
          }

          // Update campaign with this event (for future reference)
          const updatedRecentEvents = [...(campaign.recentEvents || []), processedEvent]
            .slice(-10); // Keep only last 10 events
          
          results.campaignUpdates = {
            recentEvents: updatedRecentEvents,
            lastEventDate: campaign.currentDate
          };
        }
      }
    } catch (error) {
      console.error('Error processing monthly events:', error);
      // Continue without failing the entire monthly tick
    }

    return results;
  }

  /**
   * Update coalition mobilization based on policy changes and events
   * @param {Object} campaign - The current campaign state
   * @param {Array} policyEvents - Policy changes that occurred this month
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - { coalitionUpdates: Object, performanceMetrics: Object }
   */
  updateCoalitionMobilization(campaign, policyEvents = [], getFromStore) {
    if (!campaign?.startingCity?.coalitions) {
      return { coalitionUpdates: null, performanceMetrics: null };
    }

    try {
      // Convert policy events to coalition events
      const coalitionPolicyEvents = policyEvents.map(policyEvent => ({
        id: `policy_${policyEvent.id}_${Date.now()}`,
        type: `${policyEvent.category}_policy_change`,
        jurisdictionId: campaign.startingCity.id,
        jurisdictionType: 'city',
        magnitude: policyEvent.impact || 1.0,
        date: campaign.currentDate,
        context: {
          policyId: policyEvent.id,
          policyName: policyEvent.name,
          direction: policyEvent.direction || 0
        }
      }));

      // Process coalition effects from policy changes
      const results = processCascadingCoalitionUpdates(
        campaign.startingCity.coalitions,
        coalitionPolicyEvents, // City events
        [], // No state events for now
        [], // No national events for now
        null, // Default spatial aggregator
        {
          enablePerformanceMonitoring: true,
          enableCaching: true
        }
      );

      return {
        coalitionUpdates: results.coalitionSoA,
        performanceMetrics: results.performanceReport
      };
    } catch (error) {
      console.error('Error updating coalition mobilization:', error);
      return { coalitionUpdates: null, performanceMetrics: null };
    }
  }

  /**
   * Process the effects of a generated event
   */
  _processEventEffects(event, campaign, getFromStore) {
    const processedEvent = { ...event };

    try {
      // Apply direct stat effects if the event has them
      if (event.effects && event.effects.length > 0) {
        processedEvent.appliedEffects = this._applyEventStatEffects(
          event.effects,
          campaign.startingCity.stats
        );
      }

      // Process coalition effects if the event affects coalitions
      if (event.coalitionEvents && campaign.startingCity.coalitions) {
        try {
          const coalitionResults = processCascadingCoalitionUpdates(
            campaign.startingCity.coalitions,
            event.coalitionEvents, // City events
            [], // No state events
            [], // No national events
            null, // Default spatial aggregator
            {
              enablePerformanceMonitoring: true,
              enableCaching: true
            }
          );
          
          processedEvent.coalitionEffects = coalitionResults.coalitionSoA;
          processedEvent.performanceMetrics = coalitionResults.performanceReport;
        } catch (error) {
          console.warn('Failed to process coalition effects for event:', error);
        }
      }

      // Generate additional news coverage if this is a major event
      if (event.severity >= 0.7) {
        processedEvent.additionalCoverage = this._generateAdditionalEventCoverage(
          event,
          campaign
        );
      }

    } catch (error) {
      console.error('Error processing event effects:', error);
      processedEvent.processingErrors = [error.message];
    }

    return processedEvent;
  }

  /**
   * Apply direct statistical effects from events
   */
  _applyEventStatEffects(effects, cityStats) {
    const appliedEffects = [];

    effects.forEach(effect => {
      try {
        if (effect.target && effect.change !== undefined) {
          const currentValue = this._getNestedStatValue(cityStats, effect.target);
          if (currentValue !== undefined) {
            const newValue = this._calculateNewStatValue(
              currentValue,
              effect.change,
              effect.type || 'additive'
            );
            
            appliedEffects.push({
              target: effect.target,
              oldValue: currentValue,
              newValue: newValue,
              change: effect.change,
              description: effect.description || `${effect.target} changed`
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to apply effect to ${effect.target}:`, error);
      }
    });

    return appliedEffects;
  }

  /**
   * Get a nested statistic value using dot notation
   */
  _getNestedStatValue(stats, path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], stats);
  }

  /**
   * Calculate new stat value based on change type
   */
  _calculateNewStatValue(currentValue, change, type) {
    switch (type) {
      case 'multiplicative':
        return currentValue * (1 + change);
      case 'percentage':
        return currentValue + (currentValue * change);
      case 'additive':
      default:
        return currentValue + change;
    }
  }

  /**
   * Generate additional news coverage for major events
   */
  _generateAdditionalEventCoverage(event, campaign) {
    const additionalCoverage = [];

    // Generate follow-up stories for major events
    if (event.type === 'economic_crisis' || event.type === 'natural_disaster') {
      additionalCoverage.push({
        headline: `${campaign.startingCity.name} Responds to ${event.name}`,
        summary: `City officials outline response plans following recent ${event.type.replace('_', ' ')}.`,
        type: "follow_up_coverage",
        scope: "local",
        impact: "neutral",
        relatedEventId: event.id,
        date: campaign.currentDate
      });
    }

    // Generate political reaction stories
    if (event.severity >= 0.8) {
      additionalCoverage.push({
        headline: `Political Leaders React to Recent ${event.name}`,
        summary: `Local politicians weigh in on the impact and response to recent events.`,
        type: "political_reaction",
        scope: "local",
        impact: "neutral",
        relatedEventId: event.id,
        date: campaign.currentDate
      });
    }

    return additionalCoverage;
  }

  /**
   * Process scheduled events (elections, budget deadlines, etc.)
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - { scheduledEvents: Array, newsItems: Array }
   */
  processScheduledEvents(campaign, getFromStore) {
    const results = {
      scheduledEvents: [],
      newsItems: []
    };

    // Check for upcoming elections
    const electionEvents = this._checkUpcomingElections(campaign);
    results.scheduledEvents.push(...electionEvents);

    // Check for budget deadlines
    const budgetEvents = this._checkBudgetDeadlines(campaign);
    results.scheduledEvents.push(...budgetEvents);

    // Generate news for important scheduled events
    results.newsItems = this._generateScheduledEventNews(
      results.scheduledEvents,
      campaign
    );

    return results;
  }

  /**
   * Check for upcoming elections based on campaign timeline
   */
  _checkUpcomingElections(campaign) {
    const elections = [];
    
    // This would integrate with the electoral system
    // For now, just a placeholder for the structure
    
    return elections;
  }

  /**
   * Check for budget deadlines and fiscal events
   */
  _checkBudgetDeadlines(campaign) {
    const budgetEvents = [];
    
    // Check if it's budget planning season (e.g., certain months)
    const currentMonth = new Date(campaign.currentDate).getMonth();
    
    if (currentMonth === 2 || currentMonth === 8) { // March and September
      budgetEvents.push({
        type: 'budget_planning',
        name: 'Budget Planning Period',
        description: 'City budget planning and review period begins',
        date: campaign.currentDate,
        impact: 'administrative'
      });
    }
    
    return budgetEvents;
  }

  /**
   * Generate news for scheduled events
   */
  _generateScheduledEventNews(scheduledEvents, campaign) {
    const newsItems = [];

    scheduledEvents.forEach(event => {
      if (event.type === 'budget_planning') {
        newsItems.push({
          headline: `${campaign.startingCity.name} Begins Budget Planning Process`,
          summary: `City officials begin reviewing and planning the upcoming budget allocation.`,
          type: "administrative_news",
          scope: "local",
          impact: "neutral",
          date: campaign.currentDate
        });
      }
    });

    return newsItems;
  }
}