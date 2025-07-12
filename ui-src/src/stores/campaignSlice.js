// ui-src/src/stores/campaignSlice.js
import { getRandomInt } from "../utils/generalUtils.js";
import { adjustStatLevel } from "../utils/generalUtils.js";
import { RATING_LEVELS } from "../data/governmentData.js";
import { calculateAdultPopulation } from "../utils/generalUtils.js";

export const createCampaignSlice = (set, get) => {
  const canPlayerPerformMajorAction = () => {
    const activeCampaign = get().activeCampaign;
    if (!activeCampaign) {
      console.warn("[_canPlayerPerformMajorAction] No active campaign.");
      return false;
    }
    if (activeCampaign.playerCampaignActionToday) {
      console.warn(
        "[_canPlayerPerformMajorAction] A major campaign action has already been taken today."
      );
      if (get().actions && get().actions.addToast) {
        // Check if addToast exists on the fully composed store
        get().actions.addToast({
          message: "You have already dedicated your efforts for today.",
          type: "info",
          duration: 2500,
        });
      } else {
        console.error(
          "_canPlayerPerformMajorAction: addToast action not found. Ensure UI slice and actions are merged."
        );
      }
      return false;
    }
    return true;
  };

  return {
    activeCampaign: null,
    improveSkillOratory: () =>
      set((state) => {
        if (!state.activeCampaign || !state.activeCampaign.politician)
          return {};
        const cost = 500;
        const currentTreasury = state.activeCampaign.treasury || 0;
        const attrs = state.activeCampaign.politician.attributes;
        const currentOratory = attrs?.oratory || 0;
        if (currentOratory >= 10 || currentTreasury < cost) return {};
        const didImprove = Math.random() < 0.7;
        let newOratory = currentOratory;
        if (didImprove) {
          newOratory = Math.min(10, currentOratory + 1);
          get().actions.addToast({
            message: `Improved Oratory skill! ${currentOratory} + ${currentOratory}.`,
            type: "success",
          });
        }
        return {
          activeCampaign: {
            ...state.activeCampaign,
            treasury: currentTreasury - cost,
            politician: {
              ...state.activeCampaign.politician,
              attributes: { ...attrs, oratory: newOratory },
            },
          },
        };
      }),
    networkWithParty: () =>
      set((state) => {
        /* ... logs for now ... */ return state;
      }),
    makePublicAppearance: () => {
      // It's good practice to check if the action can be performed at the start
      if (!get().actions.canPlayerPerformMajorCampaignAction()) {
        // Assumes this action exists and is updated
        get().actions.addToast?.({
          message: "You've already focused your campaign efforts today.",
          type: "warning",
        });
        return; // Important to actually return to prevent execution
      }

      set((state) => {
        if (
          !state.activeCampaign ||
          !state.activeCampaign.politician ||
          !state.activeCampaign.startingCity
        ) {
          console.error(
            "[makePublicAppearance] Missing critical campaign, politician, or city data."
          );
          return {}; // Return current state if essential data is missing
        }

        const cost = 100; // Cost from personal treasury
        const politician = state.activeCampaign.politician;
        const city = state.activeCampaign.startingCity;

        if ((politician.treasury || 0) < cost) {
          get().actions.addToast?.({
            message: `Not enough personal treasury (Need $${cost}) for public appearance.`,
            type: "error",
          });
          return {}; // Return current state
        }

        // Approval Boost Logic
        const approvalBoostBase = getRandomInt(0, 2); // 0, 1, or 2
        const charismaFactor = Math.max(
          0.5,
          (politician.attributes?.charisma || 3) / 5
        ); // Ensure factor is at least 0.5
        const finalApprovalBoost = Math.round(
          approvalBoostBase * charismaFactor
        );
        const newApprovalRating = Math.min(
          100,
          Math.max(0, (politician.approvalRating || 0) + finalApprovalBoost)
        );

        // Name Recognition Gain Logic (Absolute Number)
        let nameRecognitionGain = 0;
        let newNameRecognition = politician.nameRecognition || 0;
        const adultPopulation = calculateAdultPopulation(
          // Use the helper
          city.population,
          city.demographics?.ageDistribution
        );

        if (adultPopulation > 0) {
          // Gain a small percentage of the adults who DON'T know you yet,
          // or a base number influenced by charisma and media buzz.
          const potentialNewReach = Math.max(
            0,
            adultPopulation - newNameRecognition
          );
          let baseGainAbsolute = 0;

          if (potentialNewReach > 0) {
            // Example: Base gain of 0.05% to 0.2% of those not yet reached
            baseGainAbsolute = getRandomInt(
              Math.floor(potentialNewReach * 0.0005) + 10, // Min gain of 10 people + tiny %
              Math.floor(potentialNewReach * 0.002) + 50 // Max gain of 50 people + small %
            );
          } else {
            // If 100% recognized, small "reinforcement" gain, or chance of small loss if event goes poorly (not implemented here)
            baseGainAbsolute = getRandomInt(
              0,
              Math.floor(adultPopulation * 0.0001)
            );
          }

          // Charisma bonus to the number of people reached
          const charismaModifier =
            ((politician.attributes?.charisma || 5) - 5) * 0.05; // e.g., -20% to +20% based on charisma diff from 5
          const charismaNameRecBonus = Math.floor(
            baseGainAbsolute * charismaModifier
          );

          // Media buzz bonus
          const mediaBuzzFactor = (politician.mediaBuzz || 0) / 100; // 0 to 1
          const mediaBuzzNameRecBonus = Math.floor(
            baseGainAbsolute * mediaBuzzFactor * 0.25
          ); // Up to +25% from max buzz

          nameRecognitionGain = Math.max(
            0,
            Math.round(
              baseGainAbsolute + charismaNameRecBonus + mediaBuzzNameRecBonus
            )
          );

          newNameRecognition += nameRecognitionGain;
          // Cap by adult population and ensure it doesn't go below 0
          newNameRecognition = Math.max(
            0,
            Math.min(newNameRecognition, adultPopulation)
          );
        }

        const mediaBuzzGainEffect =
          getRandomInt(2, 6) +
          Math.floor((politician.attributes?.charisma || 5) / 3);
        const newMediaBuzz = Math.min(
          100,
          (politician.mediaBuzz || 0) + mediaBuzzGainEffect
        );

        get().actions.addToast?.({
          message: `Public appearance made! Approval +${finalApprovalBoost}%. Name recognition +${nameRecognitionGain.toLocaleString()} people. Media Buzz +${mediaBuzzGainEffect}.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...state.activeCampaign,
            politician: {
              ...politician, // Spread the existing politician state
              treasury: (politician.treasury || 0) - cost,
              approvalRating: newApprovalRating,
              nameRecognition: newNameRecognition, // Store the absolute number
              mediaBuzz: newMediaBuzz,
              campaignActionToday: true, // This was a major daily action
            },
          },
        };
      });
    },

    clearViewingElectionNightContext: () =>
      set((state) => ({
        activeCampaign: state.activeCampaign
          ? { ...state.activeCampaign, viewingElectionNightForDate: null }
          : null,
      })),
    addressKeyCityIssue: (issueName) => {
      if (!canPlayerPerformMajorAction()) return;

      set((state) => {
        if (
          !state.activeCampaign ||
          !state.activeCampaign.politician ||
          !state.activeCampaign.startingCity?.stats
        ) {
          console.warn(
            "[Action] Address Issue: Missing critical campaign data."
          );
          return {};
        }

        const cost = 250; // Cost from personal treasury
        const currentTreasury = state.activeCampaign.treasury || 0;
        const playerAttrs = state.activeCampaign.politician.attributes;
        const oratory = playerAttrs?.oratory || 5;
        const intelligence = playerAttrs?.intelligence || 5;
        const cityStats = state.activeCampaign.startingCity.stats;

        if (currentTreasury < cost) {
          get().actions.addToast({
            message: `Not enough personal funds to address issue (Need $${cost}).`,
            type: "error",
          });
          return {};
        }

        let successMessage = `You addressed the issue of "${issueName}". `;
        let approvalChange = 0;
        let statImproved = false;

        // Determine success and impact based on skills
        const baseChance = 0.6; // 60% base chance of positive outcome
        const skillFactor = (oratory + intelligence) / 2 / 10; // Average of oratory/intel, scaled 0-1
        const successRoll = Math.random();

        if (successRoll < baseChance + (skillFactor * 0.3 - 0.15)) {
          // Chance adjusted by skills (+/- 15%)
          approvalChange =
            getRandomInt(1, 3) +
            (intelligence > 7 ? 1 : 0) +
            (oratory > 7 ? 1 : 0);
          approvalChange = Math.min(5, approvalChange); // Cap approval change
          successMessage += `Public approval increased by ${approvalChange}%.`;

          // Optional: Tiny chance to improve a related city stat
          if (
            issueName.toLowerCase().includes("infrastructure") &&
            Math.random() < 0.2
          ) {
            cityStats.infrastructureState = adjustStatLevel(
              cityStats.infrastructureState,
              RATING_LEVELS,
              1
            );
            successMessage += ` Infrastructure shows slight improvement!`;
            statImproved = true;
          } else if (
            issueName.toLowerCase().includes("safety") ||
            (issueName.toLowerCase().includes("crime") && Math.random() < 0.2)
          ) {
            cityStats.publicSafetyRating = adjustStatLevel(
              cityStats.publicSafetyRating,
              RATING_LEVELS,
              1
            );
            successMessage += ` Public safety perception improved slightly!`;
            statImproved = true;
          } else if (
            issueName.toLowerCase().includes("education") &&
            Math.random() < 0.2
          ) {
            cityStats.educationQuality = adjustStatLevel(
              cityStats.educationQuality,
              RATING_LEVELS,
              1
            ); // Assuming RATING_LEVELS applies
            successMessage += ` Focus on education was noted positively!`;
            statImproved = true;
          }
          // Add more issue-to-stat mappings
          get().actions.addToast({
            message: successMessage,
            type: "success",
          });
        } else {
          approvalChange = getRandomInt(-1, 0); // Small or no negative impact on failure for now
          successMessage +=
            "Your efforts didn't seem to make a significant impact this time.";
          if (approvalChange < 0)
            successMessage += ` Approval slightly dipped.`;
          get().actions.addToast({ message: successMessage, type: "info" });
        }

        console.log(
          `[Player Action] Address Issue: ${issueName}. Approval change: ${approvalChange}. Stat improved: ${statImproved}`
        );

        return {
          activeCampaign: {
            ...state.activeCampaign,
            treasury: currentTreasury - cost,
            playerApproval: Math.min(
              100,
              Math.max(
                0,
                (state.activeCampaign.playerApproval || 0) + approvalChange
              )
            ),
            startingCity: {
              ...state.activeCampaign.startingCity,
              stats: { ...cityStats }, // Ensure updated cityStats are saved
            },
            playerCampaignActionToday: true, // Mark a major action as taken
          },
        };
      });
    },
  };
};
