// ui-src/src/stores/campaignStaffSlice.js
import { STAFF_ROLES_INFO, STAFF_TASK_OPTIONS } from "../data/campaignStaffData";
import { getRandomInt } from "../utils/core";

export const createCampaignStaffSlice = (set, get) => ({
  hireStaff: (roleId) => {
    set((state) => {
      if (!state.activeCampaign || !state.activeCampaign.politician) return {};
      const roleInfo = Object.values(STAFF_ROLES_INFO).find(
        (r) => r.id === roleId
      );
      if (!roleInfo) {
        get().actions.addToast?.({
          message: "Invalid staff role.",
          type: "error",
        });
        return {};
      }

      const currentStaff = state.activeCampaign.politician.hiredStaff || [];
      if (currentStaff.some((s) => s.roleId === roleId)) {
        get().actions.addToast?.({
          message: `You already have a ${roleInfo.name}.`,
          type: "info",
        });
        return {};
      }

      // Deduct hiring cost or first week's salary from campaignFunds
      // For now, assume cost is per week and will be handled by a weekly budget cycle
      // This is a simplified hire action. A full system would have a pool of candidates.
      const newStaffMember = {
        id: `staff_${Date.now()}_${roleId}`,
        roleId: roleId,
        roleName: roleInfo.name,
        costPerWeek: roleInfo.costPerWeek,
        delegatedTask: "idle", // Default to idle (assisting player)
        name: generateStaffName(),
        attributes: generateStaffAttributes(),
        experience: 0,
        loyalty: getRandomInt(60, 85)
      };

      get().actions.addToast?.({
        message: `${roleInfo.name} hired!`,
        type: "success",
      });
      return {
        activeCampaign: {
          ...state.activeCampaign,
          politician: {
            ...state.activeCampaign.politician,
            hiredStaff: [...currentStaff, newStaffMember],
            // Potentially deduct a setup cost from campaignFunds here
            // campaignFunds: (state.activeCampaign.politician.campaignFunds || 0) - (roleInfo.hiringCost || 0),
          },
        },
      };
    });
  },

  fireStaff: (staffMemberId) => {
    set((state) => {
      if (
        !state.activeCampaign ||
        !state.activeCampaign.politician ||
        !state.activeCampaign.politician.hiredStaff
      )
        return {};

      const staffToFire = state.activeCampaign.politician.hiredStaff.find(
        (s) => s.id === staffMemberId
      );
      if (!staffToFire) {
        get().actions.addToast?.({
          message: "Staff member not found.",
          type: "error",
        });
        return {};
      }

      // Add severance cost or reputation hit later
      get().actions.addToast?.({
        message: `${staffToFire.roleName} dismissed.`,
        type: "info",
      });
      return {
        activeCampaign: {
          ...state.activeCampaign,
          politician: {
            ...state.activeCampaign.politician,
            hiredStaff: state.activeCampaign.politician.hiredStaff.filter(
              (s) => s.id !== staffMemberId
            ),
          },
        },
      };
    });
  },

  setStaffDelegatedTask: (staffId, taskId) => {
    set((state) => {
      if (!state.activeCampaign?.politician?.hiredStaff) return {};

      const staffIndex = state.activeCampaign.politician.hiredStaff.findIndex(
        (s) => s.id === staffId
      );
      if (staffIndex === -1) {
        get().actions.addToast?.({
          message: "Staff member not found.",
          type: "error",
        });
        return {};
      }

      const updatedStaff = [...state.activeCampaign.politician.hiredStaff];
      updatedStaff[staffIndex] = {
        ...updatedStaff[staffIndex],
        delegatedTask: taskId,
      };

      get().actions.addToast?.({
        message: `${updatedStaff[staffIndex].roleName} task updated to: ${taskId}`,
        type: "success",
      });

      return {
        activeCampaign: {
          ...state.activeCampaign,
          politician: {
            ...state.activeCampaign.politician,
            hiredStaff: updatedStaff,
          },
        },
      };
    });
  },

  calculateStaffBoosts: (actionName, baseEffects) => {
    const state = get();
    const hiredStaff = state.activeCampaign?.politician?.hiredStaff || [];
    
    let totalBoost = 1.0; // Start with no boost
    let staffContributions = [];

    for (const staff of hiredStaff) {
      if (staff.delegatedTask !== "idle") continue; // Only idle staff provide player action boosts
      
      const roleInfo = STAFF_ROLES_INFO[staff.roleId.toUpperCase()];
      if (!roleInfo?.playerActionBoosts) continue;

      // Check for specific action boost
      if (roleInfo.playerActionBoosts[actionName]) {
        const boost = roleInfo.playerActionBoosts[actionName];
        totalBoost += boost;
        staffContributions.push({
          staffName: staff.roleName,
          boost: boost,
          type: "specific"
        });
      }
      // Check for general "all_actions" boost
      else if (roleInfo.playerActionBoosts["all_actions"]) {
        const boost = roleInfo.playerActionBoosts["all_actions"];
        totalBoost += boost;
        staffContributions.push({
          staffName: staff.roleName,
          boost: boost,
          type: "general"
        });
      }
    }

    return {
      multiplier: totalBoost,
      contributions: staffContributions,
      boostedEffects: applyBoostToEffects(baseEffects, totalBoost)
    };
  },

  processDailyStaffTasks: () => {
    set((state) => {
      const { activeCampaign } = state;
      if (!activeCampaign?.politician?.hiredStaff) return {};

      const { playerPoliticianId, politicians } = activeCampaign;
      if (!playerPoliticianId || !politicians) return {};

      const campaignData = politicians.campaign.get(playerPoliticianId) || {};
      const financesData = politicians.finances.get(playerPoliticianId) || {};
      const stateData = politicians.state.get(playerPoliticianId) || {};

      let newCampaignData = { ...campaignData };
      let newFinancesData = { ...financesData };
      let newStateData = { ...stateData };
      let dailyResults = [];

      for (const staff of activeCampaign.politician.hiredStaff) {
        if (staff.delegatedTask === "idle") continue; // Idle staff don't perform autonomous tasks

        const roleInfo = STAFF_ROLES_INFO[staff.roleId.toUpperCase()];
        const taskInfo = roleInfo?.dailyAutonomousActions?.[staff.delegatedTask];
        
        if (!taskInfo) continue;

        // Apply task effects
        const effects = taskInfo.effects;
        let taskResults = [];

        for (const [effectType, value] of Object.entries(effects)) {
          switch (effectType) {
            case "dailyFundraisingAmount":
              const fundsRaised = Math.round(value * (0.8 + Math.random() * 0.4)); // ±20% variance
              newFinancesData.campaignFunds = (newFinancesData.campaignFunds || 0) + fundsRaised;
              taskResults.push(`Raised $${fundsRaised.toLocaleString()}`);
              break;
              
            case "volunteerRecruitment":
              const newVolunteers = Math.round(value * (0.7 + Math.random() * 0.6)); // ±30% variance
              newCampaignData.volunteerCount = (newCampaignData.volunteerCount || 0) + newVolunteers;
              taskResults.push(`Recruited ${newVolunteers} volunteers`);
              break;
              
            case "nameRecognitionGain":
              const nameRecGain = Math.round(value * (0.8 + Math.random() * 0.4));
              newStateData.nameRecognition = (newStateData.nameRecognition || 0) + nameRecGain;
              taskResults.push(`+${nameRecGain.toLocaleString()} name recognition`);
              break;
              
            case "mediaBuzzGain":
              const buzzGain = Math.round(value * (0.8 + Math.random() * 0.4));
              newStateData.mediaBuzz = Math.min(100, (newStateData.mediaBuzz || 0) + buzzGain);
              taskResults.push(`+${buzzGain} media buzz`);
              break;
              
            case "campaignHoursBonus":
              const hoursBonus = value;
              newCampaignData.maxWorkingHours = (newCampaignData.maxWorkingHours || 8) + hoursBonus;
              taskResults.push(`+${hoursBonus} daily campaign hours`);
              break;
              
            case "voterContactRate":
              const votersContacted = Math.round(value * (0.8 + Math.random() * 0.4));
              taskResults.push(`Contacted ${votersContacted} voters`);
              break;
              
            case "supporterIdentification":
              const supportersFound = Math.round(value * (0.7 + Math.random() * 0.6));
              taskResults.push(`Identified ${supportersFound} new supporters`);
              break;
          }
        }

        if (taskResults.length > 0) {
          dailyResults.push({
            staffName: staff.roleName,
            task: staff.delegatedTask,
            results: taskResults
          });
        }
      }

      // Update politician data
      const newCampaignMap = new Map(politicians.campaign);
      const newFinancesMap = new Map(politicians.finances);
      const newStateMap = new Map(politicians.state);
      
      newCampaignMap.set(playerPoliticianId, newCampaignData);
      newFinancesMap.set(playerPoliticianId, newFinancesData);
      newStateMap.set(playerPoliticianId, newStateData);

      // Show daily staff results
      if (dailyResults.length > 0) {
        const summaryMessage = dailyResults.map(result => 
          `${result.staffName}: ${result.results.join(", ")}`
        ).join(" | ");
        
        get().actions.addNotification?.({
          message: `Daily Staff Results: ${summaryMessage}`,
          type: "info",
          category: "Campaign Staff"
        });
      }

      return {
        activeCampaign: {
          ...activeCampaign,
          politicians: {
            ...politicians,
            campaign: newCampaignMap,
            finances: newFinancesMap,
            state: newStateMap,
          },
        },
      };
    });
  },
});

// Helper functions
function generateStaffName() {
  const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Sage", "Drew"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateStaffAttributes() {
  return {
    strategy: getRandomInt(3, 8),
    communication: getRandomInt(3, 8),
    fundraising: getRandomInt(3, 8),
    loyalty: getRandomInt(4, 9),
    experience: getRandomInt(1, 6)
  };
}

function applyBoostToEffects(baseEffects, multiplier) {
  const boostedEffects = { ...baseEffects };
  
  // Apply multiplier to numeric effects
  for (const [key, value] of Object.entries(boostedEffects)) {
    if (typeof value === "number") {
      boostedEffects[key] = Math.round(value * multiplier);
    }
  }
  
  return boostedEffects;
}

// Export task options for UI
export { STAFF_TASK_OPTIONS };
