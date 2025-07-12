import { getPlayerActiveElectionDetailsForCampaignActions } from "../utils/electionUtils";
import { getRandomInt, calculateAdultPopulation } from "../utils/generalUtils";
import { normalizePolling } from "../utils/electionUtils";

/**
 * Helper function to find and update a specific politician (player or AI) within the activeCampaign state.
 * This is crucial for generalizing actions.
 * * @param {object} state - The current Zustand state.
 * @param {string | null} politicianId - The ID of the politician to update. Null for player.
 * @param {function} updateFn - A function that takes the politician object and returns the updated politician object.
 * @returns {object} The new activeCampaign state or the original state if politician not found/not updated.
 */
const updateTargetPolitician = (state, politicianId, updateFn) => {
  if (!state.activeCampaign) return state;

  let campaignWasModified = false;
  let newActiveCampaign = { ...state.activeCampaign };

  if (!politicianId || politicianId === state.activeCampaign.politician?.id) {
    // Target is the player
    if (state.activeCampaign.politician) {
      const updatedPlayerPolitician = updateFn(state.activeCampaign.politician);
      if (updatedPlayerPolitician !== state.activeCampaign.politician) {
        // Check if updateFn actually changed something
        newActiveCampaign.politician = updatedPlayerPolitician;
        campaignWasModified = true;
      }
    }
  } else {
    // Target is an AI politician; search in elections and offices
    let foundAndUpdatedInElections = false;
    if (newActiveCampaign.elections) {
      newActiveCampaign.elections = newActiveCampaign.elections.map(
        (election) => {
          if (election.candidates) {
            let specificCandidateUpdated = false;
            const newCandidates = election.candidates.map((candidate) => {
              if (candidate.id === politicianId) {
                const updatedAICandidate = updateFn(candidate);
                if (updatedAICandidate !== candidate) {
                  specificCandidateUpdated = true;
                  foundAndUpdatedInElections = true; // Mark that we found and potentially updated
                  return updatedAICandidate;
                }
              }
              return candidate;
            });
            if (specificCandidateUpdated) {
              return { ...election, candidates: newCandidates };
            }
          }
          return election;
        }
      );
    }

    // Also check/update in governmentOffices if they are stored there with all stats
    // This assumes that the AI politician object in elections and offices might be the same reference
    // or that we need to update both if they are separate but represent the same AI.
    // For simplicity, if found in elections, we might assume that's the primary campaign-relevant object.
    // If not found in elections, check offices.
    if (!foundAndUpdatedInElections && newActiveCampaign.governmentOffices) {
      newActiveCampaign.governmentOffices =
        newActiveCampaign.governmentOffices.map((office) => {
          if (office.holder?.id === politicianId) {
            const updatedAIHolder = updateFn(office.holder);
            if (updatedAIHolder !== office.holder) {
              // console.log(`Updating AI ${politicianId} in office ${office.officeName}`);
              return { ...office, holder: updatedAIHolder };
            }
          }
          return office;
        });
    }
    campaignWasModified =
      foundAndUpdatedInElections ||
      newActiveCampaign.governmentOffices !==
        state.activeCampaign.governmentOffices;
  }

  return campaignWasModified ? newActiveCampaign : state.activeCampaign; // Return original state.activeCampaign if no changes
};

export const createCampaignActionsSlice = (set, get) => {
  return {
    // --- CORE HOUR MANAGEMENT (Generalized for Player or AI) ---
    spendCampaignHours: (hoursToSpend, politicianId = null) => {
      // politicianId defaults to null (player)
      let success = false;
      let hoursActuallyAvailable = 0; // For toast message

      set((state) => {
        const campaign = state.activeCampaign;
        if (!campaign) {
          console.error("[spendCampaignHours] Active campaign not found.");
          return state; // Return original state
        }

        const targetPoliticianObject = politicianId
          ? campaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            campaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : campaign.politician;

        if (!targetPoliticianObject) {
          console.error(
            `[spendCampaignHours] Politician (ID: ${
              politicianId || "player"
            }) not found.`
          );
          return state;
        }
        if (hoursToSpend <= 0) {
          return state;
        }

        hoursActuallyAvailable =
          targetPoliticianObject.campaignHoursRemainingToday || 0;

        if (hoursActuallyAvailable >= hoursToSpend) {
          const newActiveCampaign = updateTargetPolitician(
            state,
            politicianId,
            (politicianToUpdate) => ({
              ...politicianToUpdate,
              campaignHoursRemainingToday:
                (politicianToUpdate.campaignHoursRemainingToday || 0) -
                hoursToSpend,
            })
          );
          success = newActiveCampaign !== state.activeCampaign; // Check if update actually happened
          return { activeCampaign: newActiveCampaign };
        } else {
          success = false;
          return state; // Not enough hours, return original state
        }
      });

      if (!success && hoursToSpend > 0) {
        // Only toast if an attempt was made with positive hours
        if (!politicianId) {
          // Only toast for player
          get().actions.addToast?.({
            message: `Not enough campaign hours remaining today (need ${hoursToSpend}, have ${hoursActuallyAvailable}).`,
            type: "warning",
          });
        } else {
          // console.log(`[AI Action] ${politicianId} - Not enough hours for action requiring ${hoursToSpend} (has ${hoursActuallyAvailable})`);
        }
      }
      return success;
    },

    resetDailyCampaignHours: (politicianId = null) => {
      // politicianId defaults to null (player)
      set((state) => {
        const campaign = state.activeCampaign;
        if (!campaign) return {};

        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (politicianToUpdate) => ({
            ...politicianToUpdate,
            campaignHoursRemainingToday:
              politicianToUpdate.campaignHoursPerDay || 10,
          })
        );

        if (
          newActiveCampaign === state.activeCampaign &&
          politicianId &&
          !state.activeCampaign?.politician &&
          !state.activeCampaign?.elections &&
          !state.activeCampaign?.governmentOffices
        ) {
          // This means updateTargetPolitician couldn't find the AI to update them.
          // console.warn(`[resetDailyCampaignHours] AI ${politicianId} not found to reset hours.`);
        }
        return { activeCampaign: newActiveCampaign };
      });
    },

    // --- Player/AI-Driven Campaign Actions (Generalized) ---

    personalFundraisingActivity: (hoursToSpend = 2, politicianId = null) => {
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) {
        return; // Not enough hours or other issue from spendCampaignHours
      }
      set((state) => {
        const campaign = state.activeCampaign;
        // Resolve the target politician (player or AI)
        const targetPoliticianInitial = politicianId
          ? campaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            campaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : campaign.politician;

        if (!targetPoliticianInitial) {
          console.warn(
            `[Fundraising] Target politician (ID: ${
              politicianId || "player"
            }) not found.`
          );
          return state; // Return original state if target not found
        }

        const city = campaign.startingCity; // Needed for adultPopulation

        // --- Calculate Name Recognition Factor ---
        let nameRecFundraisingMultiplier = 0.25; // Base effectiveness if unknown (e.g., 25%)
        if (
          city &&
          city.population &&
          city.demographics?.ageDistribution &&
          targetPoliticianInitial.nameRecognition != null
        ) {
          const adultPopulation =
            calculateAdultPopulation(
              city.population,
              city.demographics.ageDistribution
            ) || 1; // Ensure adultPopulation is at least 1 to avoid division by zero

          const currentNameRecognition =
            targetPoliticianInitial.nameRecognition || 0;
          // Ensure fraction is between 0 and 1
          const nameRecognitionFraction = Math.min(
            1,
            Math.max(0, currentNameRecognition / adultPopulation)
          );

          // Scale fundraising effectiveness: e.g., 25% at 0 name rec, up to 100% at full name rec.
          // You can adjust the 0.25 (base when unknown) and 0.75 (scaling part) for balance.
          nameRecFundraisingMultiplier = 0.25 + 0.75 * nameRecognitionFraction;
        }
        // --- End Name Recognition Factor ---

        const baseFundsPerAttempt = getRandomInt(250, 750); // Funds per "unit" of effort
        const attemptsPerHours = hoursToSpend * 2; // e.g., 2 fundraising "attempts" per hour
        const fundraisingSkillFactor =
          (targetPoliticianInitial.attributes?.fundraising || 5) / 4; // Adjusted factor (ranges e.g. 0.75 to 2.5 for attributes 3-10)

        const fundsRaisedBeforeNameRec =
          baseFundsPerAttempt * attemptsPerHours * fundraisingSkillFactor;
        const fundsRaised = Math.round(
          fundsRaisedBeforeNameRec * nameRecFundraisingMultiplier
        );

        const newCampaignFunds =
          (targetPoliticianInitial.campaignFunds || 0) + fundsRaised;

        let newMediaBuzz = targetPoliticianInitial.mediaBuzz || 0;
        // Media buzz gain also influenced by name recognition (more buzz if somewhat known) and hours
        if (
          Math.random() <
          0.1 +
            hoursToSpend * 0.05 +
            (nameRecFundraisingMultiplier - 0.25) * 0.1
        ) {
          newMediaBuzz = Math.min(
            100,
            newMediaBuzz +
              getRandomInt(
                hoursToSpend,
                Math.max(
                  hoursToSpend,
                  hoursToSpend *
                    2 *
                    parseFloat(nameRecFundraisingMultiplier.toFixed(2))
                )
              ) // More buzz if more known
          );
        }

        if (!politicianId) {
          // Only toast for player
          get().actions.addToast?.({
            message: `Spent ${hoursToSpend}hr(s) on fundraising. Raised $${fundsRaised.toLocaleString()}! (Name Rec Factor: ${nameRecFundraisingMultiplier.toFixed(
              2
            )})`,
            type: "success",
          });
        }

        const updatedActiveCampaign = updateTargetPolitician(
          state, // Pass the entire current state
          politicianId,
          (politicianToUpdate) => ({
            ...politicianToUpdate,
            campaignFunds: newCampaignFunds,
            mediaBuzz: newMediaBuzz,
            // nameRecognition is NOT changed by this specific fundraising action here
            // but other actions like rallies or media appearances WOULD change it.
          })
        );
        return { activeCampaign: updatedActiveCampaign };
      });
    },

    holdRallyActivity: (hoursForRally = 4, politicianId = null) => {
      const campaignPreCheck = get().activeCampaign;
      const politicianPreCheck = politicianId
        ? campaignPreCheck.elections
            ?.flatMap((e) => e.candidates)
            .find((c) => c.id === politicianId) ||
          campaignPreCheck.governmentOffices?.find(
            (o) => o.holder?.id === politicianId
          )?.holder
        : campaignPreCheck.politician;

      if (!politicianPreCheck || !campaignPreCheck.startingCity) return;

      const rallyCostBase = 500;
      const rallyCostPerHour = 150;
      const totalRallyCost = rallyCostBase + hoursForRally * rallyCostPerHour;

      if ((politicianPreCheck.campaignFunds || 0) < totalRallyCost) {
        if (!politicianId)
          get().actions.addToast?.({
            message: `Not enough funds for Rally (Need $${totalRallyCost.toLocaleString()}).`,
            type: "error",
          });
        return;
      }
      if ((politicianPreCheck.volunteerCount || 0) < 5 * hoursForRally) {
        if (!politicianId)
          get().actions.addToast?.({
            message: `Need at least ${
              5 * hoursForRally
            } volunteers for a ${hoursForRally}hr rally.`,
            type: "warning",
          });
        return;
      }
      if (!get().actions.spendCampaignHours(hoursForRally, politicianId)) {
        return;
      }

      set((state) => {
        const currentCampaign = state.activeCampaign; // Use fresh state from set()
        const currentPolitician = politicianId
          ? currentCampaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            currentCampaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : currentCampaign.politician;

        const currentCity = currentCampaign.startingCity;
        if (!currentPolitician || !currentCity) return state; // Should not happen if spendHours passed

        const electionDetails =
          getPlayerActiveElectionDetailsForCampaignActions(
            currentCampaign,
            politicianId
          ); // Modified to accept politicianId

        if (!electionDetails) {
          if (!politicianId)
            get().actions.addToast?.({
              message:
                "Cannot hold rally: Politician not in an active election.",
              type: "error",
            });
          return state;
        }
        const { playerElection, playerCandidateIndex: targetCandidateIndex } =
          electionDetails; // playerCandidateIndex is now targetCandidateIndex

        const oratory = currentPolitician.attributes?.oratory || 5;
        const adultPop =
          calculateAdultPopulation(
            currentCity.population,
            currentCity.demographics?.ageDistribution
          ) || 1;
        const nameRecFraction =
          (currentPolitician.nameRecognition || 0) / adultPop;
        const volunteerFactor =
          (currentPolitician.volunteerCount || 0) / (20 * hoursForRally);

        let baseScoreBoost =
          getRandomInt(hoursForRally, hoursForRally * 2) +
          Math.floor(oratory / 2) +
          Math.floor(nameRecFraction * 3) +
          Math.floor(volunteerFactor * 2);
        const finalScoreBoost = Math.max(0, Math.round(baseScoreBoost));
        const mediaBuzzGain =
          getRandomInt(3 * hoursForRally, 7 * hoursForRally) +
          Math.floor(oratory / 2);

        const potentialNewReach = Math.max(
          0,
          adultPop - (currentPolitician.nameRecognition || 0)
        );
        let nameRecGainAbsolute = 0;
        if (potentialNewReach > 0) {
          nameRecGainAbsolute = Math.min(
            potentialNewReach,
            getRandomInt(50 * hoursForRally, 200 * hoursForRally) *
              (1 + (currentPolitician.mediaBuzz || 0) / 200)
          );
        }
        const newNameRecognition = Math.min(
          adultPop,
          (currentPolitician.nameRecognition || 0) +
            Math.round(nameRecGainAbsolute)
        );

        let updatedCandidates = playerElection.candidates.map((c, idx) =>
          idx === targetCandidateIndex
            ? { ...c, baseScore: (c.baseScore || 10) + finalScoreBoost }
            : c
        );
        const normalizedCandidates = normalizePolling(
          updatedCandidates,
          adultPop
        ); // Pass adultPop
        const updatedElections = currentCampaign.elections.map((e) =>
          e.id === playerElection.id
            ? { ...e, candidates: normalizedCandidates }
            : e
        );

        if (!politicianId) {
          // Only toast for player
          get().actions.addToast?.({
            message: `Successful ${hoursForRally}hr Rally! Polling Score +${finalScoreBoost}. Name Rec +${Math.round(
              nameRecGainAbsolute
            ).toLocaleString()}. Media Buzz +${mediaBuzzGain}.`,
            type: "success",
          });
        }

        const politicianUpdates = {
          campaignFunds:
            (currentPolitician.campaignFunds || 0) - totalRallyCost,
          mediaBuzz: Math.min(
            100,
            (currentPolitician.mediaBuzz || 0) + mediaBuzzGain
          ),
          nameRecognition: newNameRecognition,
        };

        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({ ...p, ...politicianUpdates })
        );

        return {
          activeCampaign: {
            // Also update elections array on the campaign
            ...newActiveCampaign,
            elections: updatedElections,
          },
        };
      });
    },

    goDoorKnocking: (hoursToSpend = 2, politicianId = null) => {
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) {
        return;
      }
      set((state) => {
        const campaign = state.activeCampaign;
        const targetPoliticianInitial = politicianId
          ? campaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            campaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : campaign.politician;
        const city = campaign.startingCity;

        if (!targetPoliticianInitial || !city) return state;

        const adultPopulation =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const volunteersEffective = Math.min(
          targetPoliticianInitial.volunteerCount || 0,
          hoursToSpend * 10
        );
        const reachPerPlayerHour =
          10 + ((targetPoliticianInitial.attributes?.charisma || 5) - 5) * 2;
        const reachPerVolunteerAssist = 3;
        const totalPeopleReached = Math.round(
          reachPerPlayerHour * hoursToSpend +
            volunteersEffective * reachPerVolunteerAssist
        );
        const potentialNewReach = Math.max(
          0,
          adultPopulation - (targetPoliticianInitial.nameRecognition || 0)
        );
        const actualNewPeopleRecognized = Math.min(
          potentialNewReach,
          totalPeopleReached
        );
        const newNameRecognition = Math.min(
          adultPopulation,
          (targetPoliticianInitial.nameRecognition || 0) +
            actualNewPeopleRecognized
        );
        let approvalGain = 0;
        if (
          actualNewPeopleRecognized > 20 &&
          Math.random() <
            0.2 +
              ((targetPoliticianInitial.attributes?.charisma || 5) - 5) * 0.05
        ) {
          approvalGain = getRandomInt(0, 1);
        }
        const newApprovalRating = Math.min(
          100,
          (targetPoliticianInitial.approvalRating || 0) + approvalGain
        );

        if (!politicianId) {
          get().actions.addToast?.({
            message: `Spent ${hoursToSpend}hr(s) door knocking. Reached ~${totalPeopleReached} people. Name Rec +${actualNewPeopleRecognized.toLocaleString()}. Approval +${approvalGain}%`,
            type: "info",
          });
        }

        const politicianUpdates = {
          nameRecognition: newNameRecognition,
          approvalRating: newApprovalRating,
        };
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({ ...p, ...politicianUpdates })
        );
        return { activeCampaign: newActiveCampaign };
      });
    },

    makePublicAppearanceActivity: (hoursToSpend = 2, politicianId = null) => {
      const cost = 100;
      const campaignPreCheck = get().activeCampaign;
      const politicianPreCheck = politicianId
        ? campaignPreCheck.elections
            ?.flatMap((e) => e.candidates)
            .find((c) => c.id === politicianId) ||
          campaignPreCheck.governmentOffices?.find(
            (o) => o.holder?.id === politicianId
          )?.holder
        : campaignPreCheck.politician;

      if (!politicianPreCheck || (politicianPreCheck.treasury || 0) < cost) {
        if (!politicianId)
          get().actions.addToast?.({
            message: `Not enough personal treasury (Need $${cost}).`,
            type: "error",
          });
        return;
      }
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) {
        return;
      }
      set((state) => {
        const currentCampaign = state.activeCampaign;
        const currentPolitician = politicianId
          ? currentCampaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            currentCampaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : currentCampaign.politician;
        const city = currentCampaign.startingCity;
        if (!currentPolitician || !city) return state;

        const adultPopulation =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const approvalBoostBase = getRandomInt(0, hoursToSpend);
        const charismaFactor = Math.max(
          0.5,
          (currentPolitician.attributes?.charisma || 3) / 5
        );
        const finalApprovalBoost = Math.round(
          approvalBoostBase * charismaFactor
        );
        const newApprovalRating = Math.min(
          100,
          Math.max(
            0,
            (currentPolitician.approvalRating || 0) + finalApprovalBoost
          )
        );
        let nameRecGain = 0;
        const potentialNewReach = Math.max(
          0,
          adultPopulation - (currentPolitician.nameRecognition || 0)
        );
        if (potentialNewReach > 0) {
          let baseGainAbs = getRandomInt(
            Math.floor(potentialNewReach * 0.0002 * hoursToSpend) +
              10 * hoursToSpend,
            Math.floor(potentialNewReach * 0.001 * hoursToSpend) +
              30 * hoursToSpend
          );
          nameRecGain = Math.max(0, Math.round(baseGainAbs * charismaFactor));
        }
        const newNameRec = Math.min(
          adultPopulation,
          (currentPolitician.nameRecognition || 0) + nameRecGain
        );
        const mediaBuzzGain =
          getRandomInt(1 * hoursToSpend, 3 * hoursToSpend) +
          Math.floor((currentPolitician.attributes?.charisma || 5) / 2);
        const newMediaBuzz = Math.min(
          100,
          (currentPolitician.mediaBuzz || 0) + mediaBuzzGain
        );

        if (!politicianId) {
          get().actions.addToast?.({
            message: `Public appearance (${hoursToSpend}hrs). Approval +${finalApprovalBoost}%. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
            type: "success",
          });
        }

        const politicianUpdates = {
          treasury: (currentPolitician.treasury || 0) - cost,
          approvalRating: newApprovalRating,
          nameRecognition: newNameRec,
          mediaBuzz: newMediaBuzz,
        };
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({ ...p, ...politicianUpdates })
        );
        return { activeCampaign: newActiveCampaign };
      });
    },

    // --- NEW CAMPAIGN OVERHAUL ACTIONS (Generalized where appropriate) ---
    recruitVolunteers: (hoursToSpend = 2, politicianId = null) => {
      if (!get().actions.spendCampaignHours(hoursToSpend, politicianId)) {
        return;
      }
      set((state) => {
        const campaign = state.activeCampaign;
        const targetPoliticianInitial = politicianId
          ? campaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            campaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : campaign.politician;
        const city = campaign.startingCity;

        if (!targetPoliticianInitial || !city) return state;

        const charismaFactor =
          1 + ((targetPoliticianInitial.attributes?.charisma || 5) - 5) * 0.1;
        const adultPopForNameRec =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 100000; // fallback for division
        const nameRecFactor =
          (targetPoliticianInitial.nameRecognition || 0) / adultPopForNameRec;
        const baseRecruitsPerHour = getRandomInt(3, 8);
        let newVolunteersGained = Math.round(
          baseRecruitsPerHour *
            hoursToSpend *
            charismaFactor *
            (1 + nameRecFactor * 0.5)
        );
        // TODO: Field Director bonus
        newVolunteersGained = Math.max(0, newVolunteersGained);

        if (!politicianId) {
          get().actions.addToast?.({
            message: `Spent ${hoursToSpend}hrs recruiting. Gained ${newVolunteersGained} new volunteers!`,
            type: "success",
          });
        }

        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({
            ...p,
            volunteerCount: (p.volunteerCount || 0) + newVolunteersGained,
          })
        );
        return { activeCampaign: newActiveCampaign };
      });
    },

    setMonthlyAdvertisingBudget: (amount, politicianId = null) => {
      // Does NOT spend campaign hours
      set((state) => {
        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          if (!politicianId)
            get().actions.addToast?.({
              message: "Invalid budget amount.",
              type: "error",
            });
          return state;
        }
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({
            ...p,
            advertisingBudgetMonthly: parsedAmount,
          })
        );
        if (newActiveCampaign !== state.activeCampaign && !politicianId) {
          get().actions.addToast?.({
            message: `Player monthly ad budget set to $${parsedAmount.toLocaleString()}`,
            type: "info",
          });
        }
        return { activeCampaign: newActiveCampaign };
      });
    },

    setAdvertisingStrategy: (strategyData, politicianId = null) => {
      // { focus, targetId, intensity }, Does NOT spend campaign hours
      set((state) => {
        const newActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({
            ...p,
            currentAdStrategy: {
              focus: strategyData.focus || "none",
              targetId: strategyData.targetId || null,
              intensity: strategyData.intensity || 0,
            },
          })
        );
        if (newActiveCampaign !== state.activeCampaign && !politicianId) {
          get().actions.addToast?.({
            message: `Player ad strategy updated.`,
            type: "info",
          });
        }
        return { activeCampaign: newActiveCampaign };
      });
    },

    launchManualAdBlitz: (
      { adType, targetId, spendAmount, hoursSpent = 3 },
      politicianId = null
    ) => {
      const campaignPreCheck = get().activeCampaign;
      const politicianPreCheck = politicianId
        ? campaignPreCheck.elections
            ?.flatMap((e) => e.candidates)
            .find((c) => c.id === politicianId) ||
          campaignPreCheck.governmentOffices?.find(
            (o) => o.holder?.id === politicianId
          )?.holder
        : campaignPreCheck.politician;

      if (!politicianPreCheck) return;

      if ((politicianPreCheck.campaignFunds || 0) < spendAmount) {
        if (!politicianId)
          get().actions.addToast?.({
            message: `Not enough funds for Ad Blitz (Need $${spendAmount.toLocaleString()}).`,
            type: "error",
          });
        return;
      }
      if (!get().actions.spendCampaignHours(hoursSpent, politicianId)) {
        return;
      }

      set((state) => {
        const currentCampaign = state.activeCampaign;
        const currentPolitician = politicianId
          ? currentCampaign.elections
              ?.flatMap((e) => e.candidates)
              .find((c) => c.id === politicianId) ||
            currentCampaign.governmentOffices?.find(
              (o) => o.holder?.id === politicianId
            )?.holder
          : currentCampaign.politician;
        const city = currentCampaign.startingCity;
        const electionDetails =
          getPlayerActiveElectionDetailsForCampaignActions(
            currentCampaign,
            politicianId
          );
        if (!currentPolitician || !city) return state;

        let baseScoreChangePlayer = 0; // For player/target AI
        let baseScoreChangeOpponent = 0; // For opponent of player/target AI
        let opponentToTargetObj = null; // The actual opponent object
        let mediaBuzzEffect = 0;
        let nameRecEffect = 0;

        const charisma = currentPolitician.attributes?.charisma || 5;
        const integrity = currentPolitician.attributes?.integrity || 5;
        const intelligence = currentPolitician.attributes?.intelligence || 5;
        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const effectivenessFactor =
          (spendAmount / 1000) *
          (hoursSpent / 3) *
          (1 + ((intelligence + charisma) / 2 - 5) * 0.1);

        if (adType === "positive") {
          baseScoreChangePlayer = getRandomInt(1, 2) * effectivenessFactor;
          mediaBuzzEffect = getRandomInt(3, 6) * effectivenessFactor;
          nameRecEffect = getRandomInt(50, 200) * effectivenessFactor;
        } else if (adType === "attack" && targetId && electionDetails) {
          opponentToTargetObj = electionDetails.playerElection.candidates.find(
            (c) => c.id === targetId && c.id !== currentPolitician.id
          );
          if (opponentToTargetObj) {
            const backlashChance = 0.15 + Math.max(0, (5 - integrity) * 0.05);
            if (Math.random() < backlashChance) {
              baseScoreChangePlayer =
                getRandomInt(0, 1) * effectivenessFactor * -1;
              mediaBuzzEffect = getRandomInt(2, 4) * effectivenessFactor;
              if (!politicianId)
                get().actions.addToast?.({
                  message: "Your attack ad backfired slightly!",
                  type: "warning",
                });
            } else {
              baseScoreChangeOpponent =
                getRandomInt(1, 3) * effectivenessFactor * -1;
              mediaBuzzEffect = getRandomInt(4, 8) * effectivenessFactor;
            }
          }
        } else if (adType === "issue" && targetId) {
          // targetId is issue string
          baseScoreChangePlayer = getRandomInt(0, 2) * effectivenessFactor; // Simplified effect
          mediaBuzzEffect = getRandomInt(2, 5) * effectivenessFactor;
          nameRecEffect = getRandomInt(30, 150) * effectivenessFactor;
        }

        baseScoreChangePlayer = Math.round(baseScoreChangePlayer);
        baseScoreChangeOpponent = Math.round(baseScoreChangeOpponent);
        mediaBuzzEffect = Math.round(mediaBuzzEffect);
        nameRecEffect = Math.round(nameRecEffect);

        const newNameRecognition = Math.min(
          adultPop,
          (currentPolitician.nameRecognition || 0) + nameRecEffect
        );
        const newMediaBuzz = Math.min(
          100,
          (currentPolitician.mediaBuzz || 0) + mediaBuzzEffect
        );
        const newCampaignFunds =
          (currentPolitician.campaignFunds || 0) - spendAmount;

        let updatedElections = currentCampaign.elections;
        if (electionDetails) {
          updatedElections = currentCampaign.elections.map((e) => {
            if (e.id === electionDetails.playerElection.id) {
              const newCandidates = e.candidates.map((c) => {
                if (
                  c.id === currentPolitician.id &&
                  baseScoreChangePlayer !== 0
                ) {
                  // Target AI or Player
                  return {
                    ...c,
                    baseScore: (c.baseScore || 10) + baseScoreChangePlayer,
                  };
                }
                if (
                  opponentToTargetObj &&
                  c.id === opponentToTargetObj.id &&
                  baseScoreChangeOpponent !== 0
                ) {
                  return {
                    ...c,
                    baseScore: Math.max(
                      1,
                      (c.baseScore || 10) + baseScoreChangeOpponent
                    ),
                  };
                }
                return c;
              });
              return {
                ...e,
                candidates: normalizePolling(newCandidates, adultPop),
              };
            }
            return e;
          });
        }

        if (!politicianId) {
          get().actions.addToast?.({
            message: `Launched ${hoursSpent}hr Ad Blitz for $${spendAmount.toLocaleString()}! Effects applied.`,
            type: "success",
          });
        }

        const politicianUpdates = {
          campaignFunds: newCampaignFunds,
          nameRecognition: newNameRecognition,
          mediaBuzz: newMediaBuzz,
        };

        const finalActiveCampaign = updateTargetPolitician(
          state,
          politicianId,
          (p) => ({ ...p, ...politicianUpdates })
        );

        return {
          activeCampaign: {
            ...finalActiveCampaign, // Contains updated politician (player or AI)
            elections: updatedElections, // Elections array updated separately
          },
        };
      });
    },
  };
};
