// src/simulation/monthlyUpdates/politicalUpdates.js

import { getRandomInt } from "../../utils/core.js";
import { MOOD_LEVELS } from "../../data/governmentData.js";
import { normalizePartyPopularities } from "../../utils/electionUtils.js";
import { 
  calculateMonthlyPoliticalCapitalAdjustment,
  assessPartyPerformance 
} from "../../entities/politicalCapitalSystem.js";

/**
 * Handles all political-related monthly updates
 */
export class PoliticalUpdater {
  /**
   * Update player approval rating based on city mood and incumbent status
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {number|null} - New approval rating or null if no change
   */
  updatePlayerApproval(campaign, getFromStore) {
    const cityStats = campaign.startingCity?.stats;
    const playerPoliticianId = campaign.playerPoliticianId;
    const politiciansStore = campaign.politicians;

    if (!cityStats || !playerPoliticianId || !politiciansStore) return null;

    // Use store helper to get city offices
    const cityOffices = getFromStore().actions?.getCurrentCityGovernmentOffices?.() || { 
      executive: [], 
      legislative: [] 
    };
    const mayorOffice = cityOffices.executive?.find(
      (off) => off.officeNameTemplateId === "mayor"
    );
    const mayorId = mayorOffice?.holder?.id;

    const playerState = politiciansStore.state.get(playerPoliticianId);
    if (!playerState) return null;

    const currentApproval = parseFloat(playerState.approvalRating) || 50;
    const currentOverallCitizenMood = cityStats.overallCitizenMood;

    let approvalChangeFromMood = 0;
    const moodIndex = MOOD_LEVELS.indexOf(currentOverallCitizenMood);
    if (moodIndex !== -1) {
      approvalChangeFromMood = [-2, -1, 0, 1, 2, 3][moodIndex] || 0;
    }

    let newPlayerApproval = currentApproval;

    // Check if the player is the mayor
    if (mayorId && mayorId === playerPoliticianId) {
      // Mayor is more affected by city mood
      newPlayerApproval = Math.round(
        Math.min(
          100,
          Math.max(
            0,
            currentApproval + approvalChangeFromMood + getRandomInt(-1, 1)
          )
        )
      );
    } else {
      // Non-mayor is less affected by city mood
      newPlayerApproval = Math.round(
        Math.min(
          100,
          Math.max(
            0,
            currentApproval +
              getRandomInt(-1, 1) +
              Math.floor(approvalChangeFromMood / 2)
          )
        )
      );
    }

    // Safety check to prevent NaN
    if (isNaN(newPlayerApproval) || !isFinite(newPlayerApproval)) {
      console.warn(`[PoliticalUpdater] Invalid approval calculated: ${newPlayerApproval}, using current: ${currentApproval}`);
      return null;
    }

    return newPlayerApproval !== currentApproval ? newPlayerApproval : null;
  }

  /**
   * Update player political capital based on performance and context
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object|null} - Political capital update data or null
   */
  updatePlayerPoliticalCapital(campaign, getFromStore) {
    const playerPoliticianId = campaign.playerPoliticianId;
    const politiciansStore = campaign.politicians;
    const cityStats = campaign.startingCity?.stats;

    if (!playerPoliticianId || !politiciansStore || !cityStats) return null;

    // Get player data
    const playerState = politiciansStore.state.get(playerPoliticianId);
    const playerBase = politiciansStore.base?.get(playerPoliticianId);
    if (!playerState || !playerBase) return null;

    // Get city offices to determine if player is incumbent
    const cityOffices = getFromStore().actions?.getCurrentCityGovernmentOffices?.() || { 
      executive: [], 
      legislative: [] 
    };
    const mayorOffice = cityOffices.executive?.find(
      (off) => off.officeNameTemplateId === "mayor"
    );
    const councilOffices = cityOffices.legislative || [];

    const isPlayerMayor = mayorOffice?.holder?.id === playerPoliticianId;
    const isPlayerCouncilMember = councilOffices.some(office => 
      office.members?.some(member => member.id === playerPoliticianId)
    );
    const isIncumbent = isPlayerMayor || isPlayerCouncilMember;

    // Determine party control and performance
    const playerPartyId = playerBase.partyId;
    const mayorPartyId = mayorOffice?.holder?.partyId;
    const isMajorityParty = playerPartyId === mayorPartyId;

    // Assess party performance based on city metrics
    const partyPerformance = assessPartyPerformance({
      cityStats,
      partyControl: { mayorPartyId, playerPartyId }
    });

    // Get recent bills from store
    const recentBills = getFromStore()?.passedBillsArchive?.slice(-3) || [];

    // TODO: Implement election tracking for victory bonuses
    const wonElectionThisMonth = false;

    // Calculate adjustment
    const politician = {
      ...playerBase,
      ...playerState,
      approvalRating: playerState.approvalRating || 50,
      politicalCapital: playerBase.politicalCapital || 20
    };

    const context = {
      isIncumbent,
      isMajorityParty,
      partyPerformance,
      recentBills,
      wonElectionThisMonth
    };

    const adjustment = calculateMonthlyPoliticalCapitalAdjustment(politician, context);

    // Only return if there's an actual change
    if (adjustment.adjustment === 0) return null;

    return {
      newPoliticalCapital: adjustment.newTotal,
      adjustment: adjustment.adjustment,
      breakdown: adjustment.breakdown
    };
  }

  /**
   * Update party popularity at city and state levels
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - { cityPoliticalLandscape: Array|null, statePoliticalLandscape: Array|null, newsItems: Array }
   */
  updatePartyPopularity(campaign, getFromStore) {
    const results = {
      cityPoliticalLandscape: null,
      statePoliticalLandscape: null,
      newsItems: [],
    };

    // Update city-level party popularity
    if (campaign?.startingCity?.politicalLandscape?.length) {
      results.cityPoliticalLandscape = this._updateCityPartyPopularity(
        campaign,
        getFromStore
      );
    }

    // Update state-level party popularity
    if (campaign?.parentState?.politicalLandscape?.length) {
      results.statePoliticalLandscape = this._updateStatePartyPopularity(
        campaign,
        getFromStore
      );
    }

    return results;
  }

  /**
   * Update city-level party popularity based on local performance
   */
  _updateCityPartyPopularity(campaign, getFromStore) {
    const politicalLandscape = campaign.startingCity.politicalLandscape;
    const cityStats = campaign.startingCity.stats;
    const electorateProfile = cityStats.electoratePolicyProfile || {};

    // Get incumbent information
    const cityOffices = getFromStore().actions?.getCurrentCityGovernmentOffices?.() || { 
      executive: [], 
      legislative: [] 
    };
    const mayorOffice = cityOffices.executive?.find(
      (off) => off.officeNameTemplateId === "mayor"
    );
    const councilOffices = cityOffices.legislative || [];

    const mayorPartyId = mayorOffice?.holder?.partyId;
    const councilPartyComposition = this._getPartyComposition(councilOffices);

    // Get recent legislative performance
    const recentBills = getFromStore?.()?.passedBillsArchive?.slice(-6) || [];
    const billPerformance = this._analyzeBillPerformance(recentBills, electorateProfile);

    const newLandscape = politicalLandscape.map((party) => {
      let totalShift = getRandomInt(-15, 15) / 100; // Base randomness

      // Executive performance (Mayor)
      const isMayorParty = party.id === mayorPartyId && 
                          mayorPartyId && 
                          !mayorPartyId.includes("independent");
      if (isMayorParty) {
        totalShift += this._calculateExecutivePerformance(cityStats, "city");
      }

      // Legislative performance (Council)
      const councilInfluence = councilPartyComposition[party.id] || 0;
      if (councilInfluence > 0) {
        totalShift += this._calculateLegislativePerformance(billPerformance, councilInfluence);
      }

      // Policy alignment with electorate
      totalShift += this._calculatePolicyAlignment() * 0.3;

      // Opposition benefit from poor governance
      if (!isMayorParty && councilInfluence < 0.3) {
        totalShift += this._calculateOppositionBonus(cityStats, "city");
      }

      const newPopularity = Math.max(0.5, Math.min(95, (party.popularity || 0) + totalShift));
      return { ...party, popularity: newPopularity };
    });

    return normalizePartyPopularities(newLandscape);
  }

  /**
   * Update state-level party popularity
   */
  _updateStatePartyPopularity(campaign, getFromStore) {
    const stateLandscape = campaign.parentState.politicalLandscape;
    const stateStats = campaign.parentState.stats || {};

    const stateOffices = getFromStore().actions?.getCurrentStateGovernmentOffices?.() || { 
      executive: [], 
      legislative: { lowerHouse: [], upperHouse: [] } 
    };
    const governorOffice = stateOffices.executive?.find(
      (off) => off.officeNameTemplateId === "governor"
    );
    const legislatureOffices = [
      ...(stateOffices.legislative?.lowerHouse || []),
      ...(stateOffices.legislative?.upperHouse || [])
    ];

    const governorPartyId = governorOffice?.holder?.partyId;
    const legislatureComposition = this._getPartyComposition(legislatureOffices);

    const newLandscape = stateLandscape.map((party) => {
      let totalShift = getRandomInt(-10, 10) / 100; // Less randomness at state level

      // Executive performance (Governor)
      const isGovernorParty = party.id === governorPartyId && 
                             governorPartyId && 
                             !governorPartyId.includes("independent");
      if (isGovernorParty) {
        totalShift += this._calculateExecutivePerformance(stateStats, "state");
      }

      // Legislative performance
      const legislativeInfluence = legislatureComposition[party.id] || 0;
      if (legislativeInfluence > 0) {
        totalShift += legislativeInfluence * 0.2; // Placeholder for state-level bills
      }

      // Policy alignment
      totalShift += this._calculatePolicyAlignment() * 0.25;

      // Opposition benefit
      if (!isGovernorParty && legislativeInfluence < 0.3) {
        totalShift += this._calculateOppositionBonus(stateStats, "state");
      }

      const newPopularity = Math.max(1.0, Math.min(90, (party.popularity || 0) + totalShift));
      return { ...party, popularity: newPopularity };
    });

    return normalizePartyPopularities(newLandscape);
  }

  /**
   * Helper methods for party popularity calculations
   */
  _getPartyComposition(offices) {
    const composition = {};
    let totalMembers = 0;

    offices.forEach((office) => {
      const members = office.members || (office.holder ? [office.holder] : []);
      members.forEach((member) => {
        if (member.partyId && !member.partyId.includes("independent")) {
          composition[member.partyId] = (composition[member.partyId] || 0) + 1;
          totalMembers++;
        }
      });
    });

    // Convert to percentages
    Object.keys(composition).forEach((partyId) => {
      composition[partyId] = totalMembers > 0 ? composition[partyId] / totalMembers : 0;
    });

    return composition;
  }

  _analyzeBillPerformance(recentBills, electorateProfile) {
    if (!recentBills.length) return { successRate: 0.5, publicSupport: 0 };

    const passedBills = recentBills.filter((bill) => bill.status === "passed");
    const successRate = passedBills.length / recentBills.length;

    // Calculate public support based on policy alignment
    let totalSupport = 0;
    passedBills.forEach((bill) => {
      if (bill.policies) {
        bill.policies.forEach((policy) => {
          if (electorateProfile[policy.categoryId]) {
            totalSupport += 0.1;
          }
        });
      }
    });

    return {
      successRate,
      publicSupport: Math.min(1, totalSupport / Math.max(1, passedBills.length)),
    };
  }

  _calculateExecutivePerformance(stats, level) {
    let performanceShift = 0;

    if (level === "city") {
      // City-level executive performance
      if (stats.povertyRate > 20) performanceShift -= 0.6;
      else if (stats.povertyRate < 12) performanceShift += 0.4;

      if (stats.crimeRatePer1000 > 55) performanceShift -= 0.7;
      else if (stats.crimeRatePer1000 < 25) performanceShift += 0.5;

      if (stats.unemploymentRate > 7.5) performanceShift -= 0.5;
      else if (stats.unemploymentRate < 4.0) performanceShift += 0.4;

      // Budget performance
      if (stats.budget?.balance < -stats.budget?.totalAnnualIncome * 0.1) {
        performanceShift -= 0.3;
      } else if (stats.budget?.balance > 0) {
        performanceShift += 0.2;
      }

      // Citizen mood
      const moodLevels = ["Angry", "Frustrated", "Neutral", "Content", "Happy", "Euphoric"];
      const moodIndex = moodLevels.indexOf(stats.overallCitizenMood);
      if (moodIndex >= 0) {
        performanceShift += (moodIndex - 2.5) * 0.15;
      }
    } else if (level === "state") {
      // State-level executive performance
      if (stats.unemploymentRate > 8) performanceShift -= 0.4;
      else if (stats.unemploymentRate < 5) performanceShift += 0.3;

      if (stats.economicGrowth < -1) performanceShift -= 0.5;
      else if (stats.economicGrowth > 3) performanceShift += 0.4;
    }

    return performanceShift;
  }

  _calculateLegislativePerformance(billPerformance, partyInfluence) {
    let performanceShift = 0;

    // Reward successful legislation
    if (billPerformance.successRate > 0.7) {
      performanceShift += 0.3 * partyInfluence;
    } else if (billPerformance.successRate < 0.3) {
      performanceShift -= 0.4 * partyInfluence;
    }

    // Reward popular legislation
    if (billPerformance.publicSupport > 0.6) {
      performanceShift += 0.2 * partyInfluence;
    } else if (billPerformance.publicSupport < 0.3) {
      performanceShift -= 0.3 * partyInfluence;
    }

    return performanceShift;
  }

  _calculatePolicyAlignment() {
    const cachedValues = [-0.1, -0.08, -0.05, -0.03, 0, 0.02, 0.05, 0.07, 0.1];
    return cachedValues[Math.floor(Math.random() * cachedValues.length)];
  }

  _calculateOppositionBonus(stats, level) {
    let bonus = 0;

    if (level === "city") {
      if (stats.povertyRate > 20) bonus += 0.3;
      if (stats.crimeRatePer1000 > 55) bonus += 0.4;
      if (stats.unemploymentRate > 7.5) bonus += 0.25;
      if (stats.overallCitizenMood === "Angry" || stats.overallCitizenMood === "Frustrated") {
        bonus += 0.3;
      }
    } else if (level === "state") {
      if (stats.unemploymentRate > 8) bonus += 0.2;
      if (stats.economicGrowth < -1) bonus += 0.3;
    }

    return Math.min(0.5, bonus);
  }
}