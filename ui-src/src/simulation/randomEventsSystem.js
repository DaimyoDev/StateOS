// src/simulation/randomEventsSystem.js

import { RANDOM_EVENT_TEMPLATES, getRandomEvent } from '../data/randomEventsData';
import { generateNewsForEvent } from './newsGenerator';
import { getRandomElement } from '../utils/core';
import { shouldLobbyingGroupRespond, generateLobbyingGroupResponse } from '../entities/organizationEntities';
import { 
  calculateEventCoalitionEffects, 
  processCascadingCoalitionUpdates,
  CoalitionSpatialAggregator 
} from '../General Scripts/CoalitionSystem';

/**
 * Generate a random event based on current game context
 * @param {object} gameContext - Current game state including location, date, etc.
 * @returns {object} A generated event with full context
 */
export const generateRandomEvent = (gameContext = {}) => {
  const { 
    currentDate,
    locationName,
    cityName,
    countryId,
    regionId,
    recentEvents = [],
    currentPolicies = []
  } = gameContext;

  // Get a random event template
  const eventTemplate = getRandomEvent();
  
  if (!eventTemplate) {
    console.warn('No event template found');
    return null;
  }

  // Generate context for the event
  const context = eventTemplate.contextGenerator ? 
    eventTemplate.contextGenerator(locationName || cityName || 'Local') : 
    {};

  // Create the full event object
  const event = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: eventTemplate.id,
    type: 'random_event',
    category: eventTemplate.category,
    name: eventTemplate.name,
    description: eventTemplate.description,
    severity: eventTemplate.severity,
    newsWorthiness: eventTemplate.newsWorthiness,
    date: currentDate || { year: 2025, month: 1, day: 1 },
    location: {
      countryId,
      regionId,
      cityName: cityName || locationName
    },
    context: {
      ...context,
      eventName: eventTemplate.name,
      eventCategory: eventTemplate.category,
      severity: eventTemplate.severity
    },
    relevantPolicies: eventTemplate.relevantPolicies || [],
    relevantIdeologies: eventTemplate.relevantIdeologies || [],
    processed: false,
    newsArticles: []
  };

  return event;
};

/**
 * Determine which outlets should report on an event based on relevance
 * @param {object} event - The event object
 * @param {Array} newsOutlets - Available news outlets
 * @returns {Array} Outlets that should report on this event
 */
export const getRelevantOutlets = (event, newsOutlets = []) => {
  if (!event || !newsOutlets.length) return [];

  const relevantOutlets = newsOutlets.filter(outlet => {
    // All outlets report on critical events
    if (event.severity === 'critical') return true;
    
    // Major events have 80% chance of coverage
    if (event.severity === 'major' && Math.random() < 0.8) return true;
    
    // Check ideological relevance
    if (event.relevantIdeologies && outlet.biases?.ideologyBiases) {
      const hasRelevantIdeology = event.relevantIdeologies.some(ideology => {
        const bias = outlet.biases.ideologyBiases[ideology];
        // Outlets with strong opinions (positive or negative) on relevant ideologies will cover it
        return Math.abs(bias || 0) > 5;
      });
      if (hasRelevantIdeology) return true;
    }
    
    // Check policy relevance
    if (event.relevantPolicies && outlet.biases?.policyBiases) {
      const hasRelevantPolicy = event.relevantPolicies.some(policy => 
        outlet.biases.policyBiases[policy] !== undefined
      );
      if (hasRelevantPolicy) return true;
    }
    
    // Random chance for moderate events based on newsworthiness
    if (event.severity === 'moderate') {
      const chance = (event.newsWorthiness || 5) / 20; // 25-50% chance
      return Math.random() < chance;
    }
    
    // Minor events only covered by outlets with specific interest
    return false;
  });

  return relevantOutlets;
};

/**
 * Generate news responses for a random event
 * @param {object} event - The event to generate news for
 * @param {Array} newsOutlets - All available news outlets
 * @param {object} additionalContext - Additional context like politicians, city name, lobbyingGroups
 * @returns {Array} Array of news articles
 */
export const generateNewsResponsesForEvent = (event, newsOutlets, additionalContext = {}) => {
  const relevantOutlets = getRelevantOutlets(event, newsOutlets);
  const newsArticles = [];

  relevantOutlets.forEach(outlet => {
    // Convert the random event to a news event format
    const newsEvent = {
      type: 'random_event',
      context: {
        ...event.context,
        eventId: event.id,
        category: event.category,
        severity: event.severity,
        relevantIdeologies: event.relevantIdeologies,
        relevantPolicies: event.relevantPolicies
      },
      headline: generateHeadlineForEvent(event, outlet),
      summary: generateSummaryForEvent(event, outlet)
    };

    const article = generateNewsForEvent(
      newsEvent,
      outlet,
      event.date,
      additionalContext.allPoliticians || [],
      additionalContext.cityName || event.location?.cityName
    );

    newsArticles.push(article);
  });

  // Generate organization responses
  const lobbyingGroups = additionalContext.lobbyingGroups || [];
  lobbyingGroups.forEach(group => {
    if (shouldLobbyingGroupRespond(group, event)) {
      // Find outlets that align with this organization's stance or are neutral
      const suitableOutlets = relevantOutlets.filter(outlet => {
        // Groups prefer outlets that aren't strongly opposed to their interests
        if (group.focus.includes("Corporate") || group.focus.includes("Business")) {
          return outlet.biases?.ideologyBiases?.socialist !== undefined ? 
            outlet.biases.ideologyBiases.socialist > -7 : true;
        }
        if (group.focus.includes("Environmental") || group.focus.includes("Social")) {
          return outlet.biases?.ideologyBiases?.conservative !== undefined ? 
            outlet.biases.ideologyBiases.conservative > -7 : true;
        }
        return true;
      });
      
      if (suitableOutlets.length > 0) {
        const selectedOutlet = getRandomElement(suitableOutlets);
        const orgResponse = generateLobbyingGroupResponse(group, event, selectedOutlet);
        newsArticles.push(orgResponse);
      }
    }
  });

  return newsArticles;
};

/**
 * Generate a headline for an event based on outlet bias
 * @param {object} event - The event object
 * @param {object} outlet - The news outlet
 * @returns {string} Generated headline
 */
const generateHeadlineForEvent = (event, outlet) => {
  const { name, category, severity, context } = event;
  
  // Determine outlet's stance on the event
  const stance = determineOutletStanceOnEvent(event, outlet);
  
  // Generate headlines based on category and stance
  const headlines = {
    healthcare: {
      positive: [`Hope for ${context.hospitalName || 'Healthcare'}`, `Medical Progress: ${name}`],
      negative: [`Crisis: ${name} Threatens Community`, `Healthcare System Failing: ${name}`],
      neutral: [`${name} Announced`, `Breaking: ${name}`]
    },
    economic: {
      positive: [`Economic Opportunity: ${context.companyName || name}`, `Jobs Coming: ${name}`],
      negative: [`Economic Disaster: ${name}`, `Workers Betrayed by ${context.companyName || 'Industry'}`],
      neutral: [`${name}: What It Means`, `Economic Update: ${name}`]
    },
    environmental: {
      positive: [`Green Victory: ${name}`, `Environmental Progress Achieved`],
      negative: [`Environmental Crisis: ${name}`, `Pollution Disaster Unfolds`],
      neutral: [`Environmental Report: ${name}`, `${name} Reported`]
    },
    crime: {
      positive: [`Law and Order: ${name}`, `Safety Initiative: ${name}`],
      negative: [`Crime Crisis: ${name}`, `Community Under Threat`],
      neutral: [`Crime Report: ${name}`, `Police Announce ${name}`]
    },
    education: {
      positive: [`Education Excellence: ${name}`, `Students Win with ${name}`],
      negative: [`Education Crisis: ${name}`, `Schools in Peril`],
      neutral: [`Education News: ${name}`, `School District: ${name}`]
    },
    infrastructure: {
      positive: [`Progress: ${name}`, `Infrastructure Investment Pays Off`],
      negative: [`Infrastructure Failure: ${name}`, `Crumbling Systems: ${name}`],
      neutral: [`Infrastructure Update: ${name}`, `${name} Announced`]
    },
    social: {
      positive: [`Community Triumph: ${name}`, `People Power: ${name}`],
      negative: [`Social Unrest: ${name}`, `Division Grows: ${name}`],
      neutral: [`Community Event: ${name}`, `${name} Takes Place`]
    },
    technology: {
      positive: [`Tech Innovation: ${name}`, `Digital Progress: ${name}`],
      negative: [`Tech Threat: ${name}`, `Digital Danger: ${name}`],
      neutral: [`Technology News: ${name}`, `Tech Update: ${name}`]
    }
  };

  const categoryHeadlines = headlines[category] || headlines.social;
  const stanceHeadlines = categoryHeadlines[stance] || categoryHeadlines.neutral;
  
  return getRandomElement(stanceHeadlines);
};

/**
 * Generate a summary for an event based on outlet bias
 * @param {object} event - The event object
 * @param {object} outlet - The news outlet
 * @returns {string} Generated summary
 */
const generateSummaryForEvent = (event, outlet) => {
  const { description, context, severity } = event;
  const stance = determineOutletStanceOnEvent(event, outlet);
  
  let summary = description;
  
  // Add context details
  if (context.jobsLost) {
    summary += ` ${context.jobsLost} jobs will be lost.`;
  }
  if (context.jobsCreated) {
    summary += ` ${context.jobsCreated} new jobs will be created.`;
  }
  if (context.peopleAffected) {
    summary += ` ${context.peopleAffected} people are affected.`;
  }
  if (context.investment) {
    summary += ` Total investment: ${context.investment}.`;
  }
  
  // Add stance-based commentary
  if (stance === 'positive') {
    summary += ' This represents a significant positive development for our community.';
  } else if (stance === 'negative') {
    summary += ' Critics warn of serious negative consequences.';
  } else {
    summary += ' The full impact remains to be seen.';
  }
  
  return summary;
};

/**
 * Determine an outlet's stance on a random event
 * @param {object} event - The event object
 * @param {object} outlet - The news outlet
 * @returns {string} 'positive', 'negative', or 'neutral'
 */
export const determineOutletStanceOnEvent = (event, outlet) => {
  if (!outlet.biases) return 'neutral';
  
  let score = 0;
  
  // Check ideological alignment
  if (event.relevantIdeologies && outlet.biases.ideologyBiases) {
    event.relevantIdeologies.forEach(ideology => {
      const bias = outlet.biases.ideologyBiases[ideology] || 0;
      score += bias;
    });
  }
  
  // Category-specific biases
  const categoryBiases = {
    healthcare: { progressive: 2, socialist: 3, conservative: -1 },
    economic: { libertarian: 2, conservative: 1, socialist: -2 },
    environmental: { green: 3, progressive: 2, conservative: -2 },
    crime: { conservative: 2, libertarian: 1, progressive: -1 },
    education: { progressive: 2, technocratic: 1, conservative: -1 },
    infrastructure: { progressive: 1, moderate: 1, libertarian: -1 },
    social: { progressive: 2, socialist: 2, conservative: -2 },
    technology: { technocratic: 3, libertarian: 2, conservative: -1 }
  };
  
  const categoryBias = categoryBiases[event.category];
  if (categoryBias && outlet.biases.ideologyBiases) {
    Object.entries(categoryBias).forEach(([ideology, weight]) => {
      const outletBias = outlet.biases.ideologyBiases[ideology] || 0;
      score += outletBias * weight * 0.5;
    });
  }
  
  // Determine stance based on score
  if (score > 5) return 'positive';
  if (score < -5) return 'negative';
  return 'neutral';
};

/**
 * Process a random event and generate all news coverage
 * @param {object} event - The event to process
 * @param {object} gameState - Current game state with outlets, politicians, lobbying groups, etc.
 * @returns {object} Processed event with news articles
 */
export const processRandomEvent = (event, gameState) => {
  const { newsOutlets, allPoliticians, cityName, lobbyingGroups } = gameState;
  
  // Generate news responses
  const newsArticles = generateNewsResponsesForEvent(event, newsOutlets, {
    allPoliticians,
    cityName,
    lobbyingGroups
  });
  
  // Update event with generated articles
  event.newsArticles = newsArticles;
  event.processed = true;
  
  return event;
};

/**
 * Check if it's time to generate a random event
 * @param {object} gameState - Current game state
 * @returns {boolean} Whether to generate an event
 */
export const shouldGenerateRandomEvent = (gameState) => {
  const { currentDate, lastEventDate, eventFrequency = 7 } = gameState;
  
  if (!lastEventDate) return true;
  
  // Calculate days since last event
  const daysSinceLastEvent = calculateDaysBetween(lastEventDate, currentDate);
  
  // Base chance increases with time
  const baseChance = Math.min(daysSinceLastEvent / eventFrequency, 1);
  
  // Add some randomness
  return Math.random() < baseChance * 0.5;
};

/**
 * Calculate days between two dates
 * @param {object} date1 - First date
 * @param {object} date2 - Second date
 * @returns {number} Number of days between dates
 */
const calculateDaysBetween = (date1, date2) => {
  // Simplified calculation (assumes 30 days per month)
  const days1 = date1.year * 360 + date1.month * 30 + date1.day;
  const days2 = date2.year * 360 + date2.month * 30 + date2.day;
  return Math.abs(days2 - days1);
};

/**
 * Process coalition effects from a city event
 * @param {object} event - The processed event with news articles
 * @param {object} coalitionSoA - The coalition data structure
 * @param {object} cityData - City context data
 * @returns {object} Results of coalition processing
 */
export const processEventCoalitionEffects = (event, coalitionSoA, cityData = {}) => {
  console.log(`[COALITION EVENTS PROCESSOR] Processing event:`, {
    id: event.id,
    category: event.category,
    templateId: event.templateId,
    hasCoalitionSoA: !!coalitionSoA
  });

  if (!event || !coalitionSoA) {
    console.log(`[COALITION EVENTS PROCESSOR] Missing data - event:`, !!event, 'coalitionSoA:', !!coalitionSoA);
    return { coalitionUpdates: null, performanceMetrics: null };
  }

  // Convert the random event to coalition system format
  const coalitionType = mapEventCategoryToCoalitionType(event.category, event.templateId);
  console.log(`[COALITION EVENTS PROCESSOR] Mapped event "${event.templateId}" (${event.category}) to coalition type: "${coalitionType}"`);
  
  const coalitionEvent = {
    id: event.id,
    type: coalitionType,
    jurisdictionId: cityData.id || 'current_city',
    jurisdictionType: 'city',
    magnitude: getEventMagnitudeFromSeverity(event.severity),
    date: event.date,
    context: event.context
  };

  try {
    // Process the event using the coalition system
    const results = processCascadingCoalitionUpdates(
      coalitionSoA,
      [coalitionEvent], // City events
      [], // No state events for now
      [], // No national events for now
      null, // Will use default spatial aggregator
      {
        enablePerformanceMonitoring: true,
        enableCaching: true
      }
    );

    return {
      coalitionUpdates: results,
      performanceMetrics: results.performanceReport
    };
  } catch (error) {
    console.error('Error processing event coalition effects:', error);
    return { coalitionUpdates: null, performanceMetrics: null };
  }
};

/**
 * Map event categories to coalition system event types
 * @param {string} category - Event category from randomEventsData
 * @param {string} templateId - Specific event template ID
 * @returns {string} Coalition system event type
 */
const mapEventCategoryToCoalitionType = (category, templateId) => {
  // Map event template IDs to coalition system event types
  const templateMapping = {
    // Healthcare events
    'hospital_closure': 'healthcare_crisis',
    'medical_breakthrough': 'healthcare_improvement',
    'drug_shortage': 'healthcare_crisis',
    
    // Economic events
    'factory_closure': 'economic_recession',
    'tech_expansion': 'economic_growth',
    'housing_crisis': 'economic_recession',
    
    // Environmental events
    'pollution_spike': 'environmental_crisis',
    'renewable_milestone': 'environmental_progress',
    
    // Crime events
    'crime_wave': 'crime_surge',
    'police_reform': 'police_reform',
    
    // Education events
    'school_crisis': 'education_crisis',
    'education_achievement': 'education_improvement',
    
    // Infrastructure events
    'bridge_collapse': 'infrastructure_failure',
    'transit_expansion': 'infrastructure_investment',
    
    // Social events
    'protest_march': 'social_unrest',
    'community_achievement': 'community_improvement',
    
    // Technology events
    'data_breach': 'cyber_security_incident',
    'ai_innovation': 'tech_innovation'
  };

  // Return specific mapping or fall back to category-based mapping
  return templateMapping[templateId] || mapCategoryToCoalitionType(category);
};

/**
 * Map general event categories to coalition event types
 * @param {string} category - Event category
 * @returns {string} Coalition event type
 */
const mapCategoryToCoalitionType = (category) => {
  const categoryMapping = {
    'healthcare': 'healthcare_reform',
    'economic': 'economic_growth',
    'environmental': 'environmental_regulation', 
    'crime': 'police_reform',
    'education': 'education_reform',
    'infrastructure': 'infrastructure_investment',
    'social': 'social_unrest',
    'technology': 'ai_innovation'
  };
  
  return categoryMapping[category] || 'general_policy_change';
};

/**
 * Convert event severity to coalition magnitude
 * @param {string} severity - Event severity level
 * @returns {number} Magnitude for coalition calculations (0.5 to 2.0)
 */
const getEventMagnitudeFromSeverity = (severity) => {
  const severityMagnitudes = {
    'minor': 0.5,
    'moderate': 0.8,
    'major': 1.2,
    'critical': 2.0
  };
  
  return severityMagnitudes[severity] || 1.0;
};

/**
 * Generate and process a city event with coalition effects
 * @param {object} gameContext - Current game context
 * @param {object} coalitionSoA - Coalition data structure
 * @param {object} gameState - Full game state for news processing
 * @returns {object} Event with news articles and coalition effects
 */
export const generateAndProcessCityEvent = (gameContext, coalitionSoA, gameState) => {
  // Generate the base event
  const event = generateRandomEvent(gameContext);
  if (!event) return null;

  // Process news coverage
  const processedEvent = processRandomEvent(event, gameState);

  // Process coalition effects if coalition system is available
  let coalitionResults = null;
  if (coalitionSoA) {
    const coalitionProcessing = processEventCoalitionEffects(
      processedEvent, 
      coalitionSoA, 
      gameContext
    );
    coalitionResults = coalitionProcessing.coalitionUpdates;
  }

  return {
    ...processedEvent,
    coalitionEffects: coalitionResults
  };
};