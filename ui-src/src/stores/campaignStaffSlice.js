// ui-src/src/stores/campaignStaffSlice.js
import { STAFF_ROLES_INFO } from "../data/campaignStaffData";
import { getRandomInt } from "../utils/generalUtils";

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
        // You might generate a unique name for the staff member here
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

  // Placeholder for volunteer actions
  recruitVolunteers: (amount) => {
    set((state) => {
      if (!state.activeCampaign || !state.activeCampaign.politician) return {};
      // Cost, success chance, etc. would be involved
      const currentVolunteers =
        state.activeCampaign.politician.volunteerCount || 0;
      const newVolunteers =
        currentVolunteers + getRandomInt(5 * amount, 15 * amount); // amount could be effort level
      get().actions.addToast?.({
        message: `${newVolunteers - currentVolunteers} new volunteers joined!`,
        type: "success",
      });
      return {
        activeCampaign: {
          ...state.activeCampaign,
          politician: {
            ...state.activeCampaign.politician,
            volunteerCount: newVolunteers,
            // campaignActionToday: true, // If this is a major action
          },
        },
      };
    });
  },
});

// IMPORTANT: You'll need to integrate this slice into your main Zustand store
// and ensure that `activeCampaign.politician` has fields like `hiredStaff: []` and `volunteerCount: 0`
// initialized, perhaps in your `getInitialCreatingPoliticianState` or when a campaign starts.
// For example, add to getInitialCreatingPoliticianState:
// hiredStaff: [],
// volunteerCount: 0,
// advertisingBudget: 0, // For the new ad system
// mediaOutletRelations: {}, // For media appearances
