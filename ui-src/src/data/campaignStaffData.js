// ui-src/src/data/campaignStaffData.js
export const STAFF_ROLES_INFO = {
  CAMPAIGN_MANAGER: {
    id: "campaign_manager",
    name: "Campaign Manager",
    description:
      "Oversees strategy, budget, and daily operations. Improves overall campaign efficiency.",
    costPerWeek: 1000,
    uiIcon: "📈",
    effectsSummary: "Boosts overall efficiency, unlocks some actions.",
    autonomousTasks: [
      "oversee_operations",
      "coordinate_volunteers",
      "manage_schedule"
    ],
    playerActionBoosts: {
      "all_actions": 0.15, // 15% efficiency boost to all player actions
      "recruitVolunteers": 0.25 // Extra boost for volunteer recruitment
    },
    dailyAutonomousActions: {
      "oversee_operations": {
        hoursRequired: 6,
        effects: {
          volunteerEfficiency: 0.1, // Volunteers work 10% more effectively
          campaignHoursBonus: 1 // Player gets +1 campaign hour per day
        }
      },
      "coordinate_volunteers": {
        hoursRequired: 4,
        effects: {
          volunteerRecruitment: 2, // Automatically recruit 2 volunteers per day
          volunteerRetention: 0.05 // 5% better volunteer retention
        }
      }
    }
  },
  COMMUNICATIONS_DIRECTOR: {
    id: "comms_director",
    name: "Communications Director",
    description:
      "Manages messaging, media relations, press releases, and ad strategy.",
    costPerWeek: 850,
    uiIcon: "📰",
    effectsSummary: "Improves ad effectiveness and media appearance outcomes.",
    autonomousTasks: [
      "run_advertising",
      "media_outreach",
      "manage_messaging"
    ],
    playerActionBoosts: {
      "launchManualAdBlitz": 0.3, // 30% more effective ad campaigns
      "makePublicAppearanceActivity": 0.2, // 20% better media appearances
      "holdRallyActivity": 0.15 // 15% better rally messaging
    },
    dailyAutonomousActions: {
      "run_advertising": {
        hoursRequired: 5,
        effects: {
          mediaBuzzGain: 3, // +3 media buzz per day
          nameRecognitionGain: 50 // +50 name recognition per day
        }
      },
      "media_outreach": {
        hoursRequired: 4,
        effects: {
          mediaRelations: 0.1, // Improve media relations
          freeMediaCoverage: 0.15 // 15% chance of free positive coverage
        }
      }
    }
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
    autonomousTasks: [
      "organize_canvassing",
      "phone_banking",
      "rally_logistics"
    ],
    playerActionBoosts: {
      "goDoorKnocking": 0.4, // 40% more effective door knocking
      "holdRallyActivity": 0.25, // 25% better rally organization
      "recruitVolunteers": 0.35 // 35% better volunteer recruitment
    },
    dailyAutonomousActions: {
      "organize_canvassing": {
        hoursRequired: 6,
        effects: {
          nameRecognitionGain: 75, // +75 name recognition per day
          volunteerEffectiveness: 0.2 // Volunteers 20% more effective
        }
      },
      "phone_banking": {
        hoursRequired: 4,
        effects: {
          voterContactRate: 100, // Contact 100 additional voters per day
          supporterIdentification: 5 // Identify 5 new supporters per day
        }
      }
    }
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
    autonomousTasks: [
      "conduct_polling",
      "analyze_data",
      "track_trends"
    ],
    playerActionBoosts: {
      "all_actions": 0.1, // 10% strategic boost to all actions
      "setAdvertisingStrategy": 0.25 // 25% better ad targeting
    },
    dailyAutonomousActions: {
      "conduct_polling": {
        hoursRequired: 5,
        effects: {
          internalPollingAccuracy: 0.2, // More accurate internal polling
          voterInsights: 1 // Gain 1 voter insight per day
        }
      },
      "analyze_data": {
        hoursRequired: 3,
        effects: {
          strategicIntelligence: 0.15, // Better understanding of voter trends
          competitorAnalysis: 0.1 // Better analysis of opponents
        }
      }
    }
  },
  FUNDRAISING_DIRECTOR: {
    id: "fundraising_director",
    name: "Fundraising Director",
    description:
      "Manages fundraising strategy, donor outreach, and organizes fundraising events.",
    costPerWeek: 800,
    uiIcon: "💰",
    effectsSummary:
      "Significantly boosts fundraising totals and unlocks larger events.",
    autonomousTasks: [
      "donor_outreach",
      "organize_events",
      "manage_database"
    ],
    playerActionBoosts: {
      "personalFundraisingActivity": 0.5, // 50% more effective fundraising
      "all_actions": 0.05 // Small boost to all actions from better funding
    },
    dailyAutonomousActions: {
      "donor_outreach": {
        hoursRequired: 6,
        effects: {
          dailyFundraisingAmount: 800, // Raise $800 per day automatically
          donorRelations: 0.1 // Improve donor relationships
        }
      },
      "organize_events": {
        hoursRequired: 4,
        effects: {
          eventEfficiency: 0.2, // 20% more effective fundraising events
          majorDonorChance: 0.05 // 5% chance to attract major donor
        }
      }
    }
  },
};

// Task delegation options for each role
export const STAFF_TASK_OPTIONS = {
  campaign_manager: [
    { value: "idle", label: "Idle (Assist Player)", description: "Provides boosts to all player actions" },
    { value: "oversee_operations", label: "Oversee Operations", description: "Improves volunteer efficiency and grants bonus campaign hours" },
    { value: "coordinate_volunteers", label: "Coordinate Volunteers", description: "Automatically recruits volunteers and improves retention" }
  ],
  comms_director: [
    { value: "idle", label: "Idle (Assist Player)", description: "Provides boosts to advertising and media actions" },
    { value: "run_advertising", label: "Run Advertising", description: "Automatically generates media buzz and name recognition" },
    { value: "media_outreach", label: "Media Outreach", description: "Improves media relations and chance for free coverage" }
  ],
  field_director: [
    { value: "idle", label: "Idle (Assist Player)", description: "Provides boosts to grassroots and rally actions" },
    { value: "organize_canvassing", label: "Organize Canvassing", description: "Automatically increases name recognition and volunteer effectiveness" },
    { value: "phone_banking", label: "Phone Banking", description: "Contacts voters and identifies supporters automatically" }
  ],
  pollster: [
    { value: "idle", label: "Idle (Assist Player)", description: "Provides strategic insights for all actions" },
    { value: "conduct_polling", label: "Conduct Polling", description: "Improves polling accuracy and provides voter insights" },
    { value: "analyze_data", label: "Analyze Data", description: "Provides strategic intelligence and competitor analysis" }
  ],
  fundraising_director: [
    { value: "idle", label: "Idle (Assist Player)", description: "Provides boosts to fundraising actions" },
    { value: "donor_outreach", label: "Donor Outreach", description: "Automatically raises funds daily and improves donor relations" },
    { value: "organize_events", label: "Organize Events", description: "Improves event efficiency and attracts major donors" }
  ]
};
