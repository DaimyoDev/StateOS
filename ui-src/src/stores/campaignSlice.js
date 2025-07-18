// ui-src/src/stores/campaignSlice.js
import {
  calculateBaseCandidateScore,
  normalizePolling,
} from "../utils/electionUtils.js";
import {
  getRandomInt,
  calculateAdultPopulation,
  createDateObj,
} from "../utils/generalUtils.js";
normalizePolling;

export const createCampaignSlice = (set, get) => ({
  // --- State ---
  activeCampaign: null,

  // --- Actions ---
  actions: {
    /**
     * A helper function to check if the player can perform a major action today.
     * This is intended for internal use by other actions.
     * @returns {boolean} - True if an action can be performed, otherwise false.
     */
    _canPlayerPerformMajorAction: () => {
      const activeCampaign = get().activeCampaign;
      if (!activeCampaign) {
        console.warn("[_canPlayerPerformMajorAction] No active campaign.");
        return false;
      }
      if (activeCampaign.playerCampaignActionToday) {
        get().actions.addToast?.({
          message:
            "You have already dedicated your campaign efforts for today.",
          type: "info",
          duration: 2500,
        });
        return false;
      }
      return true;
    },

    /**
     * Starts a brand new campaign with all the initial settings.
     * @param {object} campaignSettings - Contains all necessary data like politician, country, etc.
     */
    startNewCampaign: (campaignSettings) => {
      const {
        politician,
        country,
        region,
        partyChoice,
        startingCity,
        governmentOffices,
      } = campaignSettings;

      if (!politician) {
        console.error("Cannot start campaign: Politician data is missing.");
        return;
      }

      console.log(campaignSettings);

      const partyInfo =
        partyChoice.type === "independent"
          ? { type: "independent", name: "Independent", id: "independent" }
          : { ...partyChoice, type: "party_member" };

      const campaignStartDate = { year: 2024, month: 1, day: 1 };

      set({
        activeCampaign: {
          politician: { ...politician },
          country: { ...country },
          region: { ...region },
          partyInfo: partyInfo,
          startingCity: { ...startingCity },
          governmentOffices: governmentOffices,
          treasury: politician.treasury || 10000, // Use politician's treasury if available
          playerApproval: 50,
          currentDate: campaignStartDate,
          viewingElectionNightForDate: null,
          elections: [],
          staff: [],
          localIssues: [],
          politicalCapital: 10,
          playerCampaignActionToday: false,
        },
        activeMainGameTab: "Dashboard",
        currentScene: "MainGame",
      });
    },

    /**
     * Ends the current campaign and resets relevant state slices.
     */
    endCampaign: () => {
      set({
        activeCampaign: null,
        currentScene: "MainMenu",
      });
      get().actions.resetLegislationState?.();
      get().actions.resetTimeState?.();
      get().actions.resetNewsState?.();
      get().actions.resetElectionState?.();
    },

    /**
     * Improves the Oratory skill for the player's politician.
     */
    improveSkillOratory: () => {
      set((state) => {
        if (!state.activeCampaign || !state.activeCampaign.politician)
          return {};

        const cost = 500;
        const currentTreasury = state.activeCampaign.politician.treasury || 0;
        const attrs = state.activeCampaign.politician.attributes;
        const currentOratory = attrs?.oratory || 0;

        if (currentOratory >= 10) {
          get().actions.addToast?.({
            message: "Oratory skill is already at maximum.",
            type: "info",
          });
          return {};
        }
        if (currentTreasury < cost) {
          get().actions.addToast?.({
            message: `Not enough funds. Need $${cost}.`,
            type: "error",
          });
          return {};
        }

        const didImprove = Math.random() < 0.7;
        let newOratory = currentOratory;

        if (didImprove) {
          newOratory = Math.min(10, currentOratory + 1);
          get().actions.addToast?.({
            message: `Improved Oratory skill! ${currentOratory} -> ${newOratory}.`,
            type: "success",
          });
        } else {
          get().actions.addToast?.({
            message: "Oratory training had no effect this time.",
            type: "info",
          });
        }

        return {
          activeCampaign: {
            ...state.activeCampaign,
            politician: {
              ...state.activeCampaign.politician,
              treasury: currentTreasury - cost,
              attributes: { ...attrs, oratory: newOratory },
            },
          },
        };
      });
    },

    /**
     * Placeholder action for networking with the player's party.
     */
    networkWithParty: () => {
      set((state) => {
        console.log(`[Career Action] Networking with party officials.`);
        get().actions.addToast?.({
          message: "You spent the day networking with party members.",
          type: "info",
        });
        return state;
      });
    },

    /**
     * Perform a public appearance to boost approval and name recognition.
     */
    makePublicAppearance: () => {
      if (!get().actions._canPlayerPerformMajorAction()) {
        return;
      }

      set((state) => {
        if (
          !state.activeCampaign?.politician ||
          !state.activeCampaign?.startingCity
        ) {
          console.error(
            "[makePublicAppearance] Missing critical campaign, politician, or city data."
          );
          return {};
        }

        const cost = 100;
        const politician = state.activeCampaign.politician;
        const city = state.activeCampaign.startingCity;

        if ((politician.treasury || 0) < cost) {
          get().actions.addToast?.({
            message: `Not enough personal treasury (Need $${cost}) for public appearance.`,
            type: "error",
          });
          return {};
        }

        const approvalBoostBase = getRandomInt(0, 2);
        const charismaFactor = Math.max(
          0.5,
          (politician.attributes?.charisma || 3) / 5
        );
        const finalApprovalBoost = Math.round(
          approvalBoostBase * charismaFactor
        );
        const newApprovalRating = Math.min(
          100,
          Math.max(0, (politician.approvalRating || 50) + finalApprovalBoost)
        );

        let nameRecognitionGain = 0;
        let newNameRecognition = politician.nameRecognition || 0;
        const adultPopulation = calculateAdultPopulation(
          city.population,
          city.demographics?.ageDistribution
        );

        if (adultPopulation > 0) {
          const potentialNewReach = Math.max(
            0,
            adultPopulation - newNameRecognition
          );
          if (potentialNewReach > 0) {
            const baseGainAbsolute = getRandomInt(
              Math.floor(potentialNewReach * 0.0005) + 10,
              Math.floor(potentialNewReach * 0.002) + 50
            );
            const charismaModifier =
              ((politician.attributes?.charisma || 5) - 5) * 0.05;
            const charismaNameRecBonus = Math.floor(
              baseGainAbsolute * charismaModifier
            );
            const mediaBuzzFactor = (politician.mediaBuzz || 0) / 100;
            const mediaBuzzNameRecBonus = Math.floor(
              baseGainAbsolute * mediaBuzzFactor * 0.25
            );
            nameRecognitionGain = Math.max(
              0,
              Math.round(
                baseGainAbsolute + charismaNameRecBonus + mediaBuzzNameRecBonus
              )
            );
            newNameRecognition = Math.min(
              adultPopulation,
              newNameRecognition + nameRecognitionGain
            );
          }
        }

        const mediaBuzzGainEffect =
          getRandomInt(2, 6) +
          Math.floor((politician.attributes?.charisma || 5) / 3);
        const newMediaBuzz = Math.min(
          100,
          (politician.mediaBuzz || 0) + mediaBuzzGainEffect
        );

        get().actions.addToast?.({
          message: `Public appearance! Approval +${finalApprovalBoost}%, Name Rec +${nameRecognitionGain.toLocaleString()}, Buzz +${mediaBuzzGainEffect}.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...state.activeCampaign,
            politician: {
              ...politician,
              treasury: (politician.treasury || 0) - cost,
              approvalRating: newApprovalRating,
              nameRecognition: newNameRecognition,
              mediaBuzz: newMediaBuzz,
            },
            playerCampaignActionToday: true,
          },
        };
      });
    },

    /**
     * Address a key city issue to gain approval.
     * @param {string} issueName - The name of the issue being addressed.
     */
    addressKeyCityIssue: (issueName) => {
      if (!get().actions._canPlayerPerformMajorAction()) return;

      set((state) => {
        if (
          !state.activeCampaign?.politician ||
          !state.activeCampaign?.startingCity?.stats
        ) {
          console.warn(
            "[Action] Address Issue: Missing critical campaign data."
          );
          return {};
        }

        const cost = 250;
        const currentTreasury = state.activeCampaign.politician.treasury || 0;
        if (currentTreasury < cost) {
          get().actions.addToast?.({
            message: `Not enough funds to address issue (Need $${cost}).`,
            type: "error",
          });
          return {};
        }

        const playerAttrs = state.activeCampaign.politician.attributes;
        const oratory = playerAttrs?.oratory || 5;
        const intelligence = playerAttrs?.intelligence || 5;
        const cityStats = state.activeCampaign.startingCity.stats;
        let successMessage = `You addressed the issue of "${issueName}". `;
        let approvalChange = 0;

        const baseChance = 0.6;
        const skillFactor = (oratory + intelligence) / 2 / 10;
        const isSuccess =
          Math.random() < baseChance + (skillFactor * 0.3 - 0.15);

        if (isSuccess) {
          approvalChange =
            getRandomInt(1, 3) +
            (intelligence > 7 ? 1 : 0) +
            (oratory > 7 ? 1 : 0);
          successMessage += `Public approval increased by ${approvalChange}%.`;
          get().actions.addToast?.({
            message: successMessage,
            type: "success",
          });
        } else {
          approvalChange = getRandomInt(-1, 0);
          successMessage +=
            "Your efforts didn't seem to make a significant impact.";
          get().actions.addToast?.({ message: successMessage, type: "info" });
        }

        return {
          activeCampaign: {
            ...state.activeCampaign,
            politician: {
              ...state.activeCampaign.politician,
              treasury: currentTreasury - cost,
            },
            playerApproval: Math.min(
              100,
              Math.max(
                0,
                (state.activeCampaign.playerApproval || 50) + approvalChange
              )
            ),
            startingCity: {
              ...state.activeCampaign.startingCity,
              stats: { ...cityStats },
            },
            playerCampaignActionToday: true,
          },
        };
      });
    },

    /**
     * Clears the context for viewing an election night result.
     */
    clearViewingElectionNightContext: () =>
      set((state) => ({
        activeCampaign: state.activeCampaign
          ? { ...state.activeCampaign, viewingElectionNightForDate: null }
          : null,
      })),
    processDailyCampaignEffects: () => {
      set((state) => {
        if (!state.activeCampaign) return {};

        const currentCampaign = state.activeCampaign;
        let playerPolitician = { ...currentCampaign.politician }; // Ensure we're working on a copy

        // 1. Process active elections for polling updates
        const updatedElections = currentCampaign.elections.map((election) => {
          if (election.outcome?.status === "upcoming") {
            // Recalculate polling for all candidates in upcoming elections
            const electionAdultPop =
              election.entityDataSnapshot?.population || 0;
            const electionDemographics =
              election.entityDataSnapshot?.demographics;
            const adultPopForPolling = calculateAdultPopulation(
              electionAdultPop,
              electionDemographics?.ageDistribution
            );

            const candidatesWithUpdatedBaseScores = election.candidates.map(
              (candidate) => {
                return {
                  ...candidate,
                  baseScore:
                    candidate.baseScore ||
                    calculateBaseCandidateScore(
                      candidate,
                      election,
                      currentCampaign
                    ),
                };
              }
            );

            const normalizedCandidates = normalizePolling(
              candidatesWithUpdatedBaseScores,
              adultPopForPolling
            );

            // Check if election day is today
            // Note: createDateObj is from generalUtils.js and must be imported or aliased from get().actions if in a different slice

            const today = createDateObj(state.currentDate); // Using createDateObj imported directly
            const electionDate = createDateObj(election.electionDate); // Using createDateObj imported directly

            if (today === electionDate) {
              // It's election day! Trigger results processing.
              // This relies on processElectionResults being an action on the root `actions` object, usually from electionSlice.
              get().actions.processElectionResults(election.id); // Assuming processElectionResults is exposed via get().actions
              return {
                ...election,
                outcome: { ...election.outcome, status: "concluded" },
              };
            }

            return { ...election, candidates: normalizedCandidates }; // Update candidates with new polling
          }
          return election;
        });

        // 2. Reset playerCampaignActionToday for the new day
        playerPolitician.playerCampaignActionToday = false; // Reset for a new day

        return {
          activeCampaign: {
            ...currentCampaign,
            elections: updatedElections,
            politician: playerPolitician, // Ensure the updated politician object is saved
          },
        };
      });
    },
  },
});
