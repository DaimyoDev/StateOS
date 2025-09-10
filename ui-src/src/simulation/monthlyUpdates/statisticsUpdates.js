// src/simulation/monthlyUpdates/statisticsUpdates.js

import { adjustStatLevel, getRandomElement } from "../../utils/core.js";
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
} from "../../data/governmentData.js";
import { calculateAllCityStats } from "../../utils/statCalculationEngine.js";
import { generateNewsForEvent } from "../newsGenerator.js";

/**
 * Handles all statistics-related monthly updates for cities
 */
export class StatisticsUpdater {
  /**
   * Update city statistics and derived ratings
   * @param {Object} campaign - The current campaign state
   * @returns {Object} - { statUpdates: Object, newsItems: Array }
   */
  updateCityStatistics(campaign) {
    const statUpdates = {};
    let newsItems = [];
    const city = campaign.startingCity;
    const allOutlets = campaign.newsOutlets || [];

    if (!city?.stats) {
      return { statUpdates, newsItems };
    }

    const oldStats = { ...city.stats };
    const calculatedStats = calculateAllCityStats(city);
    Object.assign(statUpdates, calculatedStats);
    const newStats = { ...oldStats, ...statUpdates };

    // Process unemployment changes
    const unemploymentNews = this._processUnemploymentChanges(
      oldStats,
      newStats,
      allOutlets,
      campaign
    );
    newsItems.push(...unemploymentNews);

    // No longer need qualitative ratings - all metrics are numerical

    // Update economic outlook
    this._updateEconomicOutlook(statUpdates, newStats, city.stats);

    // Update citizen mood
    this._updateCitizenMood(statUpdates, newStats, city.stats);

    return { statUpdates, newsItems };
  }

  /**
   * Process significant unemployment rate changes and generate news
   */
  _processUnemploymentChanges(oldStats, newStats, allOutlets, campaign) {
    const newsItems = [];

    // Ensure unemployment rates are valid numbers
    const oldUnemployment = parseFloat(oldStats.unemploymentRate) || 6.0;
    const newUnemployment = parseFloat(newStats.unemploymentRate) || 6.0;

    // Fix any NaN unemployment values
    if (
      isNaN(newStats.unemploymentRate) ||
      !isFinite(newStats.unemploymentRate)
    ) {
      console.warn(
        `[StatisticsUpdater] Fixed NaN unemployment rate, resetting to ${oldUnemployment}`
      );
      newStats.unemploymentRate = oldUnemployment;
    }

    // Generate news for significant changes (> 0.5% change)
    if (Math.abs(newUnemployment - oldUnemployment) > 0.5) {
      const event = {
        type: "economic_update",
        context: {
          stat: "unemployment rate",
          oldValue: oldUnemployment.toFixed(1),
          newValue: newUnemployment.toFixed(1),
          direction:
            newUnemployment < oldUnemployment ? "positive" : "negative",
        },
      };

      // Generate a story from a random outlet
      if (allOutlets.length > 0) {
        const reportingOutlet = getRandomElement(allOutlets);
        const cityName = campaign.startingCity?.name || null;
        const newsStory = generateNewsForEvent(
          event,
          reportingOutlet,
          campaign.currentDate,
          [],
          cityName
        );
        if (newsStory) {
          newsItems.push(newsStory);
        }
      }
    }

    return newsItems;
  }

  /**
   * Update qualitative ratings derived from numerical stats
   */
  _updateQualitativeRatings(statUpdates, cityStats) {
    // Education Quality (placeholder logic based on poverty rate)
    statUpdates.educationQuality = this._deriveRatingFromValue(
      cityStats.povertyRate,
      [10, 15, 22, 30],
      RATING_LEVELS.slice().reverse()
    );
  }

  /**
   * Update economic outlook based on unemployment
   */
  _updateEconomicOutlook(statUpdates, cityStatsWithUpdates, originalStats) {
    let econChange = 0;
    if (cityStatsWithUpdates.unemploymentRate < 4.0) econChange++;
    if (cityStatsWithUpdates.unemploymentRate > 8.0) econChange--;

    if (econChange !== 0) {
      const newEconOutlook = adjustStatLevel(
        originalStats.economicOutlook,
        ECONOMIC_OUTLOOK_LEVELS,
        econChange
      );
      if (newEconOutlook !== originalStats.economicOutlook) {
        statUpdates.economicOutlook = newEconOutlook;
      }
    }
  }

  /**
   * Update citizen mood based on multiple city health factors
   */
  _updateCitizenMood(statUpdates, cityStatsWithUpdates, originalStats) {
    let moodChange = 0;

    // Economic outlook influence
    const currentEconOutlook =
      statUpdates.economicOutlook || originalStats.economicOutlook;
    if (ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook) >= 3) moodChange++; // Moderate Growth or Booming
    if (ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook) <= 1) moodChange--; // Stagnant or Recession

    // Crime rate influence
    if (cityStatsWithUpdates.crimeRatePer1000 < 25) moodChange++;
    if (cityStatsWithUpdates.crimeRatePer1000 > 60) moodChange--;

    // Poverty rate influence
    if (cityStatsWithUpdates.povertyRate < 10) moodChange++;
    if (cityStatsWithUpdates.povertyRate > 25) moodChange--;

    // Healthcare coverage influence
    if (cityStatsWithUpdates.healthcareCoverage > 90) moodChange++;

    if (moodChange !== 0) {
      const oldMood = originalStats.overallCitizenMood;
      const newMood = adjustStatLevel(oldMood, MOOD_LEVELS, moodChange);
      if (newMood !== oldMood) {
        statUpdates.overallCitizenMood = newMood;
      }
    }
  }

  /**
   * Derives a qualitative rating from a numerical stat
   * @param {number} value - The numerical value of the stat
   * @param {Array<number>} thresholds - Thresholds from best to worst
   * @param {Array<string>} labels - The RATING_LEVELS labels
   * @returns {string} The qualitative rating
   */
  _deriveRatingFromValue(value, thresholds, labels) {
    for (let i = 0; i < thresholds.length; i++) {
      if (value <= thresholds[i]) {
        return labels[labels.length - 1 - i];
      }
    }
    return labels[0]; // Return the worst rating if value exceeds all thresholds
  }
}
