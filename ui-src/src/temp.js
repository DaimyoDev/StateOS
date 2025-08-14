holdRallyActivity: (hoursForRally = 4) => {
      set((state) => {
        const { activeCampaign } = state;
        const player = activeCampaign.politician;
        const city = activeCampaign.startingCity;

        const electionDetails =
          getPlayerActiveElectionDetailsForCampaignActions(
            activeCampaign,
            player.id
          );
        if (!electionDetails) {
          get().actions.addToast?.({
            message: "Cannot hold rally: You are not in an active election.",
            type: "error",
          });
          return state;
        }

        const hoursAvailable = player.campaignHoursRemainingToday || 0;
        const fundsAvailable = player.campaignFunds || 0;
        const rallyCost = 500 + hoursForRally * 150;

        if (hoursAvailable < hoursForRally) {
          get().actions.addToast?.({
            message: `Not enough hours (Need ${hoursForRally}, have ${hoursAvailable}).`,
            type: "warning",
          });
          return state;
        }
        if (fundsAvailable < rallyCost) {
          get().actions.addToast?.({
            message: `Not enough funds for Rally (Need $${rallyCost.toLocaleString()}).`,
            type: "error",
          });
          return state;
        }

        const adultPop =
          calculateAdultPopulation(
            city.population,
            city.demographics?.ageDistribution
          ) || 1;
        const nameRecFraction = (player.nameRecognition || 0) / adultPop;
        const scoreBoost = Math.round(
          getRandomInt(hoursForRally, hoursForRally * 2) +
            player.attributes.oratory / 2 +
            nameRecFraction * 3
        );
        const mediaBuzzGain = getRandomInt(
          3 * hoursForRally,
          7 * hoursForRally
        );
        const nameRecGain = Math.round(
          getRandomInt(50 * hoursForRally, 200 * hoursForRally) *
            (1 + (player.mediaBuzz || 0) / 200)
        );

        const updates = {
          campaignHoursRemainingToday: hoursAvailable - hoursForRally,
          campaignFunds: fundsAvailable - rallyCost,
          mediaBuzz: Math.min(100, (player.mediaBuzz || 0) + mediaBuzzGain),
          nameRecognition: Math.min(
            adultPop,
            (player.nameRecognition || 0) + nameRecGain
          ),
          baseScore: (player.baseScore || 10) + scoreBoost,
        };

        const updatedPolitician = { ...player, ...updates };

        const updatedElections = activeCampaign.elections.map((e) => {
          if (e.id === electionDetails.playerElection.id) {
            const newCandidatesMap = new Map(e.candidates);
            const oldCandidateData = newCandidatesMap.get(player.id);
            newCandidatesMap.set(player.id, {
              ...oldCandidateData,
              ...updates,
            });
            return {
              ...e,
              candidates: normalizePolling(newCandidatesMap, adultPop),
            };
          }
          return e;
        });

        get().actions.addToast?.({
          message: `Rally! Polling Score +${scoreBoost}. Name Rec +${nameRecGain.toLocaleString()}. Buzz +${mediaBuzzGain}.`,
          type: "success",
        });

        return {
          activeCampaign: {
            ...activeCampaign,
            politician: updatedPolitician,
            elections: updatedElections,
          },
        };
      });
    },

    processDailyStaffActions: () => {
          set((state) => {
            const { activeCampaign } = state;
            const hiredStaff = get().hiredStaff || [];
    
            if (!activeCampaign || hiredStaff.length === 0) {
              return state;
            }
    
            let playerUpdates = {};
            let totalDailySalary = 0;
            let currentFunds = activeCampaign.politician.campaignFunds || 0;
            let currentBuzz = activeCampaign.politician.mediaBuzz || 0;
    
            hiredStaff.forEach((staff) => {
              totalDailySalary += Math.round(staff.salary / 30);
              switch (staff.role) {
                case "Communications Director": {
                  const buzzGain = Math.round(staff.attributes.communication / 4);
                  currentBuzz = Math.min(100, currentBuzz + buzzGain);
                  break;
                }
                case "Fundraising Manager": {
                  const passiveFunds = Math.round(
                    staff.attributes.fundraising * 25
                  );
                  currentFunds += passiveFunds;
                  break;
                }
              }
            });
    
            playerUpdates.campaignFunds = currentFunds - totalDailySalary;
            playerUpdates.mediaBuzz = currentBuzz;
    
            get().actions.addToast?.({
              message: `Daily staff salaries deducted: $${totalDailySalary.toLocaleString()}`,
              type: "info",
            });
    
            // Perform a single, safe update using the helper function.
            return {
              activeCampaign: updateTargetPolitician(state, null, (p) => ({
                ...p,
                ...playerUpdates,
              })),
            };
          });
        },