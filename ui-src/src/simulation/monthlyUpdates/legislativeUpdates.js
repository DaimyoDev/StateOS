// src/simulation/monthlyUpdates/legislativeUpdates.js

import { decideAndAuthorAIBill } from "../aiProposal.js";
import { getRandomElement } from "../../utils/core.js";
import { getBillProgressionWorkflow, processBillStage, getNextBillStage } from "../../utils/billProgressionUtils.js";
import { addDaysToDate } from "../../stores/legislationSlice.js";

/**
 * Handles all legislative-related monthly updates including AI bill proposals
 */
export class LegislativeUpdater {
  /**
   * Generate AI bills from council members and other political actors
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - { newBills: Array, newsItems: Array }
   */
  generateAIBills(campaign, getFromStore) {
    const results = {
      newBills: [],
      newsItems: []
    };

    if (!campaign?.startingCity?.stats?.electoratePolicyProfile) {
      return results;
    }

    try {
      // Get city offices
      const cityOffices = getFromStore().actions?.getCurrentCityGovernmentOffices?.() || { 
        executive: [], 
        legislative: [] 
      };
      
      // Generate bills from council members
      const councilBills = this._generateCouncilMemberBills(
        cityOffices.legislative,
        campaign,
        getFromStore
      );
      results.newBills.push(...councilBills);

      // Generate bills from advocacy groups/factions
      const advocacyBills = this._generateAdvocacyBills(campaign, getFromStore);
      results.newBills.push(...advocacyBills);

      // Generate news for significant bills
      results.newsItems = this._generateBillNews(results.newBills, campaign);

    } catch (error) {
      console.error('Error generating AI bills:', error);
    }

    return results;
  }

  /**
   * Generate bills from council members based on their party affiliation and priorities
   */
  _generateCouncilMemberBills(councilOffices, campaign, getFromStore) {
    const bills = [];
    const councilMembers = [];

    // Extract all council members
    councilOffices.forEach(office => {
      if (office.members && Array.isArray(office.members)) {
        councilMembers.push(...office.members);
      }
    });

    // Generate bills from random council members (not player)
    const eligibleMembers = councilMembers.filter(member => 
      member.id !== campaign.playerPoliticianId
    );

    if (eligibleMembers.length === 0) return bills;

    // Select 1-2 random members to propose bills this month
    const numberOfProposers = Math.min(
      Math.floor(Math.random() * 2) + 1,
      eligibleMembers.length
    );

    for (let i = 0; i < numberOfProposers; i++) {
      const randomMember = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
      
      try {
        // Get available policies for the city level
        const availablePolicyIds = this._getAvailablePolicyIds(campaign, "city");
        const activeLegislation = getFromStore?.()?.city?.activeLegislation || [];
        const proposedLegislation = getFromStore?.()?.city?.proposedBills || [];
        
        const bill = decideAndAuthorAIBill(
          randomMember,
          availablePolicyIds,
          campaign.startingCity.stats,
          activeLegislation,
          proposedLegislation,
          [] // allPolicyDefsForLevel - will need to implement if needed
        );

        if (bill && bill.policies?.length > 0) {
          // Add additional metadata for monthly generation
          bill.proposerId = randomMember.id;
          bill.proposerName = randomMember.name || "Council Member";
          bill.dateProposed = campaign.currentDate;
          bill.level = "city";
          bills.push(bill);
        }
      } catch (error) {
        console.warn(`Failed to generate bill for council member ${randomMember.id}:`, error);
      }
    }

    return bills;
  }

  /**
   * Generate bills from advocacy groups and political factions
   */
  _generateAdvocacyBills(campaign, getFromStore) {
    const bills = [];
    
    // Define advocacy group types based on electorate profile
    const electorateProfile = campaign.startingCity.stats.electoratePolicyProfile;
    const advocacyGroups = this._identifyActiveAdvocacyGroups(electorateProfile);

    // Generate 0-1 bills from advocacy groups per month
    if (Math.random() < 0.4 && advocacyGroups.length > 0) {
      const selectedGroup = advocacyGroups[Math.floor(Math.random() * advocacyGroups.length)];
      
      try {
        // Create a mock politician for the advocacy group
        const mockAdvocate = {
          id: `advocacy_${selectedGroup.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: selectedGroup.name,
          partyId: null,
          politicalCapital: 15, // Moderate political capital for advocacy groups
          ideology: this._getAdvocacyGroupIdeology(selectedGroup.type)
        };
        
        const availablePolicyIds = this._getAvailablePolicyIds(campaign, "city");
        const activeLegislation = getFromStore?.()?.city?.activeLegislation || [];
        const proposedLegislation = getFromStore?.()?.city?.proposedBills || [];
        
        const bill = decideAndAuthorAIBill(
          mockAdvocate,
          availablePolicyIds,
          electorateProfile,
          activeLegislation,
          proposedLegislation,
          []
        );

        if (bill && bill.policies?.length > 0) {
          bill.proposerId = mockAdvocate.id;
          bill.proposerName = selectedGroup.name;
          bill.dateProposed = campaign.currentDate;
          bill.level = "city";
          bills.push(bill);
        }
      } catch (error) {
        console.warn(`Failed to generate bill for advocacy group ${selectedGroup.name}:`, error);
      }
    }

    return bills;
  }

  /**
   * Identify active advocacy groups based on electorate policy profile
   */
  _identifyActiveAdvocacyGroups(electorateProfile) {
    const groups = [];
    
    // Economic advocacy groups
    if (electorateProfile.economic_policy >= 0.6) {
      groups.push({ 
        name: "Business Development Coalition", 
        type: "business_advocacy",
        priority: "economic_policy"
      });
    }
    if (electorateProfile.economic_policy <= 0.4) {
      groups.push({ 
        name: "Workers Rights Alliance", 
        type: "labor_advocacy",
        priority: "economic_policy"
      });
    }

    // Social advocacy groups
    if (electorateProfile.social_policy >= 0.6) {
      groups.push({ 
        name: "Progressive Community Network", 
        type: "social_advocacy",
        priority: "social_policy"
      });
    }
    if (electorateProfile.social_policy <= 0.4) {
      groups.push({ 
        name: "Traditional Values Society", 
        type: "conservative_advocacy",
        priority: "social_policy"
      });
    }

    // Environmental groups
    if (electorateProfile.environmental_policy >= 0.5) {
      groups.push({ 
        name: "Green Future Initiative", 
        type: "environmental_advocacy",
        priority: "environmental_policy"
      });
    }

    // Healthcare advocacy
    if (electorateProfile.healthcare_policy >= 0.5) {
      groups.push({ 
        name: "Healthcare Access Coalition", 
        type: "healthcare_advocacy",
        priority: "healthcare_policy"
      });
    }

    // Education advocacy
    if (electorateProfile.education_policy >= 0.5) {
      groups.push({ 
        name: "Education Excellence Fund", 
        type: "education_advocacy",
        priority: "education_policy"
      });
    }

    return groups;
  }

  /**
   * Generate news items for significant bill proposals
   */
  _generateBillNews(newBills, campaign) {
    const newsItems = [];

    // Generate news for high-impact or controversial bills
    newBills.forEach(bill => {
      if (bill.controversyLevel >= 0.7 || bill.estimatedCost > 1000000) {
        newsItems.push({
          headline: `${bill.authorName} Proposes ${bill.name}`,
          summary: `A new bill addressing ${bill.category} has been introduced with an estimated cost of $${bill.estimatedCost?.toLocaleString() || 'TBD'}.`,
          type: "bill_proposal",
          scope: "local",
          impact: bill.controversyLevel > 0.7 ? "controversial" : "neutral",
          relatedBillId: bill.id,
          date: campaign.currentDate
        });
      }
    });

    return newsItems;
  }

  /**
   * Process bill lifecycle updates (committee review, voting, etc.)
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - { billUpdates: Array, newsItems: Array }
   */
  processBillLifecycle(campaign, getFromStore) {
    const results = {
      billUpdates: [],
      newsItems: []
    };

    // Get current bills in various stages
    const activeBills = getFromStore()?.activeBills || [];
    const pendingBills = activeBills.filter(bill => 
      bill.status === 'proposed' || bill.status === 'in_committee' || bill.status === 'under_review'
    );

    // Process bill advancement through legislative process
    pendingBills.forEach(bill => {
      const advancement = this._processBillAdvancement(bill, campaign, getFromStore);
      if (advancement.statusChanged) {
        // Calculate next stage scheduled date if bill is still progressing
        const nextStageDate = this._calculateNextStageDate(advancement.newStatus, campaign.currentDate);
        
        results.billUpdates.push({
          billId: bill.id,
          newStatus: advancement.newStatus,
          statusReason: advancement.reason,
          nextStageScheduledFor: nextStageDate
        });

        // Generate news for significant status changes
        if (advancement.newStatus === 'passed' || advancement.newStatus === 'failed') {
          results.newsItems.push({
            headline: `${bill.name} ${advancement.newStatus === 'passed' ? 'Passes' : 'Fails'} ${bill.level === 'city' ? 'City Council' : 'Legislature'}`,
            summary: advancement.reason,
            type: "bill_outcome",
            scope: bill.level === 'city' ? "local" : (bill.level === 'state' ? "regional" : "national"),
            impact: advancement.newStatus === 'passed' ? "positive" : "neutral",
            relatedBillId: bill.id,
            date: campaign.currentDate
          });
        }
      }
    });

    return results;
  }

  /**
   * Process individual bill advancement through legislative stages
   */
  _processBillAdvancement(bill, campaign, getFromStore) {
    const advancement = {
      statusChanged: false,
      newStatus: bill.status,
      reason: ''
    };

    try {
      // Get the political system and bill level
      const politicalSystemId = campaign?.country?.politicalSystemId || 'PRESIDENTIAL_REPUBLIC';
      const currentDate = campaign.currentDate;
      
      // Check if it's time for this bill to advance to the next stage
      const shouldAdvance = this._shouldBillAdvance(bill, currentDate);
      
      if (!shouldAdvance) {
        return advancement;
      }

      // Handle different bill statuses based on level and progression
      if (bill.level === 'city') {
        return this._processCityBillAdvancement(bill, campaign, getFromStore);
      } else {
        return this._processStateNationalBillAdvancement(bill, campaign, getFromStore, politicalSystemId);
      }
      
    } catch (error) {
      console.warn(`Error processing bill advancement for ${bill.id}:`, error);
      return advancement;
    }
  }

  /**
   * Check if a bill should advance to the next stage based on its scheduled dates
   */
  _shouldBillAdvance(bill, currentDate) {
    // Check if we have a scheduled date for the current stage
    if (bill.stageScheduledFor) {
      const scheduledDate = new Date(
        bill.stageScheduledFor.year,
        bill.stageScheduledFor.month - 1,
        bill.stageScheduledFor.day
      );
      const today = new Date(
        currentDate.year,
        currentDate.month - 1,
        currentDate.day
      );
      
      return today >= scheduledDate;
    }
    
    // If no scheduled date, use random chance for advancement
    return Math.random() < 0.3;
  }

  /**
   * Process advancement for city-level bills (no committees)
   */
  _processCityBillAdvancement(bill, campaign, getFromStore) {
    const advancement = {
      statusChanged: false,
      newStatus: bill.status,
      reason: ''
    };

    const progressChance = Math.random();
    
    if (bill.status === 'under_review') {
      if (progressChance < 0.4) {
        // Move to pending vote
        advancement.statusChanged = true;
        advancement.newStatus = 'pending_vote';
        advancement.reason = 'Bill scheduled for city council vote';
      }
    } else if (bill.status === 'pending_vote') {
      // Simulate the vote outcome
      const voteChance = Math.random();
      if (voteChance < 0.6) {
        advancement.statusChanged = true;
        advancement.newStatus = 'passed';
        advancement.reason = 'Bill passed by city council';
      } else {
        advancement.statusChanged = true;
        advancement.newStatus = 'failed';
        advancement.reason = 'Bill failed to gain sufficient council support';
      }
    }

    return advancement;
  }

  /**
   * Process advancement for state/national bills (with committees)
   */
  _processStateNationalBillAdvancement(bill, campaign, getFromStore, politicalSystemId) {
    const advancement = {
      statusChanged: false,
      newStatus: bill.status,
      reason: ''
    };

    const progressChance = Math.random();
    
    if (bill.status === 'in_committee') {
      if (progressChance < 0.3) {
        // Committee votes to advance bill
        const committeeVoteChance = Math.random();
        if (committeeVoteChance < 0.7) {
          advancement.statusChanged = true;
          advancement.newStatus = 'pending_vote';
          advancement.reason = 'Bill advanced from committee to floor vote';
        } else {
          advancement.statusChanged = true;
          advancement.newStatus = 'failed';
          advancement.reason = 'Bill failed in committee review';
        }
      }
    } else if (bill.status === 'pending_vote') {
      // Simulate the floor vote outcome
      const voteChance = Math.random();
      if (voteChance < 0.6) {
        advancement.statusChanged = true;
        advancement.newStatus = 'passed';
        advancement.reason = `Bill passed by ${bill.level} legislature`;
      } else {
        advancement.statusChanged = true;
        advancement.newStatus = 'failed';
        advancement.reason = `Bill failed to gain sufficient ${bill.level} legislative support`;
      }
    }

    return advancement;
  }

  /**
   * Calculate when the next stage should be scheduled
   */
  _calculateNextStageDate(status, currentDate) {
    if (status === 'passed' || status === 'failed') {
      return null; // No next stage for completed bills
    }
    
    let daysToAdd;
    if (status === 'pending_vote') {
      daysToAdd = Math.floor(Math.random() * 14) + 7; // 1-2 weeks for votes
    } else if (status === 'under_review') {
      daysToAdd = Math.floor(Math.random() * 21) + 14; // 2-5 weeks for review
    } else {
      daysToAdd = Math.floor(Math.random() * 30) + 14; // 2-6 weeks for other stages
    }
    
    return addDaysToDate(currentDate, daysToAdd);
  }

  /**
   * Get available policy IDs for a given jurisdiction level
   */
  _getAvailablePolicyIds(campaign, level) {
    // This is a simplified version - in a full implementation, 
    // this would check what policies are available based on the jurisdiction
    const basicPolicyIds = [
      "economic_development",
      "public_safety",
      "education_funding",
      "infrastructure_investment",
      "environmental_protection",
      "healthcare_access",
      "housing_policy",
      "transportation_planning"
    ];
    
    return basicPolicyIds;
  }

  /**
   * Get ideology profile for advocacy group types
   */
  _getAdvocacyGroupIdeology(groupType) {
    const ideologies = {
      business_advocacy: { economic: 0.8, social: 0.5, environmental: 0.3 },
      labor_advocacy: { economic: 0.2, social: 0.7, environmental: 0.5 },
      social_advocacy: { economic: 0.4, social: 0.8, environmental: 0.6 },
      conservative_advocacy: { economic: 0.7, social: 0.2, environmental: 0.3 },
      environmental_advocacy: { economic: 0.3, social: 0.6, environmental: 0.9 },
      healthcare_advocacy: { economic: 0.4, social: 0.7, environmental: 0.5 },
      education_advocacy: { economic: 0.5, social: 0.6, environmental: 0.4 }
    };
    
    return ideologies[groupType] || { economic: 0.5, social: 0.5, environmental: 0.5 };
  }
}