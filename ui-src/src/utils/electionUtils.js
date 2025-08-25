import {
  BASE_IDEOLOGIES,
  IDEOLOGY_DEFINITIONS,
} from "../data/ideologiesData.js";
import { generateId, getRandomElement, getRandomInt } from "./core.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import { POSSIBLE_POLICY_FOCUSES } from "../data/governmentData.js";
import { generateFullAIPolitician } from "../entities/personnel.js";
import {
  isMayorLikeElection,
  generateMayorElectionInstances,
  isCityCouncilElectionType,
  generateCityCouncilElectionInstances,
  isStateLegislativeElectionType,
  generateStateLegislativeElectionInstances,
  isNationalLegislativeElectionType,
  generateNationalLegislativeElectionInstances,
} from "../elections/electionInstance.js";
import {
  generateOptimizedElectionParticipants,
  generatePoliticiansBatch,
} from "../General Scripts/OptimizedElectionGeneration.js";
// MMP and MMD functions will be handled by optimized generation or fallback

/**
 * Calculates the number of seats for a given election type and city population.
 * @param {object} electionType - The election type object from electionsData.js.
 * @param {number} cityPopulation - The population of the city.
 * @returns {number} The calculated number of seats.
 */
export function calculateNumberOfSeats(electionType, cityPopulation) {
  if (!electionType || electionType.generatesOneWinner) {
    return electionType ? electionType.minCouncilSeats || 0 : 0;
  }

  let calculatedSeats = electionType.minCouncilSeats || 0;

  if (
    electionType.councilSeatPopulationTiers &&
    electionType.councilSeatPopulationTiers.length > 0 &&
    typeof cityPopulation === "number"
  ) {
    let tierApplied = false;
    // Tiers should be sorted by popThreshold ascending in your data file
    for (const tier of electionType.councilSeatPopulationTiers) {
      if (cityPopulation < tier.popThreshold) {
        calculatedSeats += getRandomInt(
          tier.extraSeatsRange[0],
          tier.extraSeatsRange[1]
        );
        tierApplied = true;
        break;
      }
    }

    if (!tierApplied) {
      const lastTier =
        electionType.councilSeatPopulationTiers[
          electionType.councilSeatPopulationTiers.length - 1
        ];
      if (cityPopulation >= lastTier.popThreshold) {
        calculatedSeats += getRandomInt(
          lastTier.extraSeatsRange[0],
          lastTier.extraSeatsRange[1]
        );
      }
    }
  }
  return calculatedSeats;
}

/**
 * Distributes the total population randomly among a number of seats.
 * Ensures the sum of seat populations equals the total population.
 * @param {number} totalPopulation - The total population to distribute.
 * @param {number} numberOfSeats - The number of seats to distribute population across.
 * @returns {number[]} An array of populations for each seat.
 */
export const distributePopulationToSeats = (totalPopulation, numberOfSeats) => {
  if (numberOfSeats <= 0) return [];
  if (totalPopulation <= 0) return new Array(numberOfSeats).fill(0);
  if (numberOfSeats === 1) return [totalPopulation];

  const MIN_POPULATION_PER_SEAT = 25; // Keep this, but it will be a post-distribution adjustment
  let populations = new Array(numberOfSeats).fill(0);

  // --- Step 1: Assign random weights ---
  let weights = new Array(numberOfSeats);
  let totalWeight = 0;
  for (let i = 0; i < numberOfSeats; i++) {
    // Generate a random weight, e.g., between 10 and 100 for variability
    // A larger range here will lead to more variance in seat sizes.
    weights[i] = getRandomInt(10, 100);
    totalWeight += weights[i];
  }

  if (totalWeight === 0) {
    // Highly unlikely if weights are >= 10, but a fallback
    const popPerSeat = Math.floor(totalPopulation / numberOfSeats);
    populations.fill(popPerSeat);
    let remainder = totalPopulation % numberOfSeats;
    for (let i = 0; i < remainder; i++) {
      populations[i]++;
    }
    return populations;
  }

  // --- Step 2: Distribute population based on weights and handle remainder ---
  let assignedPopulation = 0;
  for (let i = 0; i < numberOfSeats; i++) {
    const proportion = weights[i] / totalWeight;
    populations[i] = Math.floor(proportion * totalPopulation);
    assignedPopulation += populations[i];
  }

  let remainderToDistribute = totalPopulation - assignedPopulation;
  // Distribute remainder, prioritizing seats with higher initial weights (or just randomly)
  // Sorting by weight helps give "more deserving" seats the rounding benefit
  const seatsWithWeights = populations.map((p, i) => ({
    index: i,
    weight: weights[i],
    pop: p,
  }));
  seatsWithWeights.sort((a, b) => b.weight - a.weight);

  for (let i = 0; i < remainderToDistribute; i++) {
    populations[seatsWithWeights[i % numberOfSeats].index]++;
  }

  // --- Step 3: Enforce MIN_POPULATION_PER_SEAT (if feasible) ---
  // This is trickier as it requires taking from some to give to others while maintaining the sum.
  // Let's first see the distribution from steps 1 & 2. If it's still too skewed or has too many tiny seats,
  // we can add a more complex redistribution step here.
  // A simpler minimum enforcement for now: if totalPopulation is large enough.
  if (totalPopulation >= numberOfSeats * MIN_POPULATION_PER_SEAT) {
    let deficits = [];
    let _surpluses = [];
    let totalDeficit = 0;

    for (let i = 0; i < numberOfSeats; i++) {
      if (populations[i] < MIN_POPULATION_PER_SEAT) {
        const deficit = MIN_POPULATION_PER_SEAT - populations[i];
        deficits.push({ index: i, amount: deficit });
        totalDeficit += deficit;
        populations[i] = MIN_POPULATION_PER_SEAT; // Temporarily bring up to min
      }
    }

    if (totalDeficit > 0) {
      // We took `totalDeficit` from the "air", now we need to subtract it from surplus seats
      // This needs to be done carefully to not push other seats below MIN.
      // A more robust way is to iteratively adjust.

      // Simpler redistribution of deficit:
      // Collect all population above MIN_POPULATION_PER_SEAT from other seats
      let availableToRedistribute = 0;
      for (let i = 0; i < numberOfSeats; i++) {
        if (!deficits.find((d) => d.index === i)) {
          // If not a seat that was already deficient
          if (populations[i] > MIN_POPULATION_PER_SEAT) {
            availableToRedistribute += populations[i] - MIN_POPULATION_PER_SEAT;
          }
        }
      }

      if (availableToRedistribute < totalDeficit) {
        // Cannot satisfy all minimums, this implies initial check was insufficient or logic error.
        // This would mean the initial totalPopulation wasn't enough, which our outer if should catch.
        // Or, the previous distribution was so skewed that this simple adjustment won't work.
        // For now, we'll just log a warning and the current distribution might be imperfect.
        console.warn(
          `DistributePopulation: Could not satisfy all minimums. Total deficit: ${totalDeficit}, Available surplus to take: ${availableToRedistribute}`
        );
      } else {
        // Subtract totalDeficit from seats that are above MIN_POPULATION_PER_SEAT proportionally or randomly
        let deficitToApply = totalDeficit;
        // This loop needs to be smarter to not push seats below MIN while taking deficit.
        // Iterative approach:
        while (deficitToApply > 0) {
          let tookFromSomeone = false;
          for (let i = 0; i < numberOfSeats && deficitToApply > 0; i++) {
            // Only take from seats that are not in the original deficit list AND are above MIN
            if (
              !deficits.find((d) => d.index === i) &&
              populations[i] > MIN_POPULATION_PER_SEAT
            ) {
              populations[i]--;
              deficitToApply--;
              tookFromSomeone = true;
            }
          }
          if (!tookFromSomeone) break; // Avoid infinite loop if cannot take anymore
        }
      }
    }
    // Re-verify sum after min population enforcement
    const finalSumCheck = populations.reduce((sum, pop) => sum + pop, 0);
    if (finalSumCheck !== totalPopulation) {
      console.error(
        `Population sum error after min enforcement! Expected ${totalPopulation}, got ${finalSumCheck}. This needs fixing.`
      );
      // Correct the sum by adding/removing the difference from the largest/smallest seat as a last resort
      let diffToFix = totalPopulation - finalSumCheck;
      if (diffToFix !== 0 && populations.length > 0) {
        populations.sort((a, b) => a - b); // sort ascending
        if (diffToFix > 0)
          populations[populations.length - 1] += diffToFix; // add to largest
        else populations[0] = Math.max(0, populations[0] + diffToFix); // remove from smallest (ensure not negative)
      }
    }
  } else if (totalPopulation < numberOfSeats) {
    // Handles very low population again for clarity
    populations.fill(0);
    for (let i = 0; i < totalPopulation; i++) {
      populations[i] = 1;
    }
  } // else: totalPopulation is positive but not enough for MIN_POPULATION_PER_SEAT for all; populations remain as distributed after step 2.

  // Final shuffle (optional, but can help if weight generation or remainder distribution has bias)
  for (let i = populations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [populations[i], populations[j]] = [populations[j], populations[i]];
  }

  return populations;
};

/**
 * Calculates a random voter turnout percentage.
 * @param {number} [minPercentage=5] - The minimum turnout percentage.
 * @param {number} [maxPercentage=90] - The maximum turnout percentage.
 * @returns {number} A random voter turnout percentage.
 */
export const calculateRandomVoterTurnout = (
  minPercentage = 5,
  maxPercentage = 90
) => {
  return getRandomInt(minPercentage, maxPercentage);
};

export function calculateBaseCandidateScore(candidate, election, campaignData) {
  if (
    !candidate ||
    !campaignData ||
    !campaignData.startingCity ||
    !campaignData.startingCity.stats
  ) {
    return 10; // Default base
  }

  const { startingCity } = campaignData;
  const cityStats = startingCity.stats;
  const politicalLandscape = startingCity.politicalLandscape || []; // Party popularities
  const electorateProfile = cityStats.electoratePolicyProfile || {};
  const cityMainIssues = cityStats.mainIssues || [];

  let score = 15; // Base score for any candidate

  // Factor 1: Incumbency & Voter Priorities (Simplified)
  const WEIGHT_INCUMBENCY = 2.0; // Max +/- 20-30 if mood is extreme
  if (candidate.isIncumbent && election.incumbent?.id === candidate.id) {
    // Ensure this candidate IS the listed incumbent for *this* election
    let incumbentEffect = 0;
    // Use overallCitizenMood as a proxy for performance on priorities
    if (
      cityStats.overallCitizenMood === "Prospering" ||
      cityStats.overallCitizenMood === "Optimistic"
    ) {
      incumbentEffect = getRandomInt(10, 15);
    } else if (cityStats.overallCitizenMood === "Content") {
      incumbentEffect = getRandomInt(0, 5);
    } else if (cityStats.overallCitizenMood === "Concerned") {
      incumbentEffect = getRandomInt(-5, 0);
    } else if (
      cityStats.overallCitizenMood === "Frustrated" ||
      cityStats.overallCitizenMood === "Very Unhappy"
    ) {
      incumbentEffect = getRandomInt(-15, -10);
    }
    score += incumbentEffect * WEIGHT_INCUMBENCY;
    // console.log(`${candidate.name} (Incumbent) effect: ${incumbentEffect * WEIGHT_INCUMBENCY}`);
  } else if (
    election.incumbent &&
    (cityStats.overallCitizenMood === "Frustrated" ||
      cityStats.overallCitizenMood === "Very Unhappy")
  ) {
    // Challengers get a small boost if incumbent (not necessarily this candidate) is unpopular
    score += getRandomInt(0, 5) * WEIGHT_INCUMBENCY * 0.5; // Smaller boost for challengers
  }

  // Factor 2: Party Popularity
  const WEIGHT_PARTY = 0.3; // Each percentage point of party popularity gives 0.3 score points
  if (candidate.partyId && candidate.partyName !== "Independent") {
    const partyData = politicalLandscape.find(
      (p) => p.id === candidate.partyId
    );
    if (partyData && partyData.popularity) {
      score += partyData.popularity * WEIGHT_PARTY;
      // console.log(`${candidate.name} (Party: ${candidate.partyName}) party pop effect: ${partyData.popularity * WEIGHT_PARTY}`);
    }
  } else {
    // Independent
    score += 5; // Small base for being independent (or could be 0)
  }

  // Factor 3: Voter Stances (Policy Alignment)
  const WEIGHT_POLICY_ALIGNMENT_KEY = 3; // Points for matching a key city issue
  const WEIGHT_POLICY_ALIGNMENT_OTHER = 1; // Points for matching other issues
  let policyAlignmentScore = 0;
  if (candidate.policyStances && electorateProfile) {
    for (const questionId in candidate.policyStances) {
      if (
        candidate.policyStances[questionId] === electorateProfile[questionId]
      ) {
        if (
          cityMainIssues.includes(
            POLICY_QUESTIONS.find((q) => q.id === questionId)?.category
          ) || // Check if category is a main issue
          cityMainIssues.some((mainIssue) =>
            POLICY_QUESTIONS.find(
              (q) => q.id === questionId
            )?.questionText.includes(mainIssue)
          )
        ) {
          // or if text includes main issue
          policyAlignmentScore += WEIGHT_POLICY_ALIGNMENT_KEY;
        } else {
          policyAlignmentScore += WEIGHT_POLICY_ALIGNMENT_OTHER;
        }
      }
    }
  }
  score += policyAlignmentScore;

  // Add a small random factor for general variability
  score += getRandomInt(-3, 3);

  return Math.max(1, Math.round(score)); // Ensure score is at least 1
}

/**
 * Normalizes an array of party popularities so their sum is 100.
 * Ensures no party goes below a minimum threshold (e.g., 1%).
 * @param {Array<{id: string, name: string, popularity: number, ...rest}>} landscape
 * @param {number} [minPopularity=1] - Minimum popularity percentage for any party.
 * @returns {Array<{id: string, name: string, popularity: number, ...rest}>} The normalized landscape.
 */
export const normalizePartyPopularities = (landscape, minPopularity = 1) => {
  if (!landscape || landscape.length === 0) return [];

  let totalRawPopularity = 0;
  const processedLandscape = landscape.map((party) => {
    const cappedPopularity = Math.max(
      minPopularity,
      party.popularity || minPopularity
    );
    totalRawPopularity += cappedPopularity;
    return { ...party, popularity: cappedPopularity };
  });

  if (totalRawPopularity === 0) {
    // Avoid division by zero if all somehow became min and summed to 0
    const equalShare = 100 / processedLandscape.length;
    return processedLandscape.map((party) => ({
      ...party,
      popularity: equalShare,
    }));
  }

  const normalizedLandscape = processedLandscape.map((party) => ({
    ...party,
    popularity: parseFloat(
      ((party.popularity / totalRawPopularity) * 100).toFixed(2)
    ),
  }));

  // Final pass to ensure sum is exactly 100 due to rounding
  let currentSum = normalizedLandscape.reduce(
    (sum, p) => sum + p.popularity,
    0
  );
  let diff = 100 - currentSum;

  if (diff !== 0 && normalizedLandscape.length > 0) {
    // Distribute difference to the party with the highest popularity to minimize visual impact
    // Or, more simply, add to the first party that can take it without going below min.
    normalizedLandscape.sort((a, b) => b.popularity - a.popularity); // Sort descending by popularity
    normalizedLandscape[0].popularity = parseFloat(
      (normalizedLandscape[0].popularity + diff).toFixed(2)
    );
    // Ensure the adjusted party doesn't go below min (unlikely if diff is small)
    normalizedLandscape[0].popularity = Math.max(
      minPopularity,
      normalizedLandscape[0].popularity
    );

    // Re-check sum if worried about complex diff distributions, but for small diffs this is usually okay.
  }

  // Re-sort by original order if needed, or by new popularity. For display, sorting by popularity is often good.
  // For now, let's re-sort by name for stability if ID doesn't imply order.
  normalizedLandscape.sort((a, b) => a.name.localeCompare(b.name));

  return normalizedLandscape;
};

export const generateRandomOfficeHolder = (
  countryParties = [],
  officeTitle = "Official",
  countryId
) => {
  let partyInfo = null;
  if (countryParties.length > 0 && Math.random() < 0.8) {
    partyInfo = getRandomElement(countryParties);
  } else {
    partyInfo = {
      id: `independent_holder_${generateId()}`,
      name: "Independent",
      ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
      color: "#888888",
    };
  }
  const officeHolder = generateFullAIPolitician(
    countryId,
    countryParties,
    POLICY_QUESTIONS,
    IDEOLOGY_DEFINITIONS,
    partyInfo.id,
    null,
    null,
    false,
    null,
    null,
    null
  );

  let policyFocus = null;
  // Assign a policy focus, especially if it's a significant role like Mayor
  if (officeTitle.toLowerCase().includes("mayor")) {
    policyFocus = getRandomElement(POSSIBLE_POLICY_FOCUSES);
  }
  return { ...officeHolder, role: officeTitle, policyFocus: policyFocus };
};

export const getPlayerActiveElectionDetailsForCampaignActions = (
  campaignState,
  politicianId = null
) => {
  if (!campaignState || !campaignState.elections || !campaignState.politician)
    return null;

  const targetId = politicianId || campaignState.politician.id;

  const playerElection = campaignState.elections.find(
    // Use Map.has() for a fast and correct check
    (e) => e.candidates?.has(targetId) && e.outcome?.status === "upcoming"
  );

  if (!playerElection) return null;

  // We no longer need the index, just the election object itself.
  return {
    playerElection,
    electionId: playerElection.id,
  };
};

/**
 * Determines all specific election instances that should be considered for scheduling.
 * @param {object} electionType - The election type definition from ELECTION_TYPES_BY_COUNTRY.
 * @param {object} activeCampaign - The entire active campaign state.
 * @returns {Array<object>} An array of "election instance contexts".
 * Each context: {
 * instanceId: string, // Unique ID for THIS specific election running (e.g., electionType.id + entity.id + year)
 * entityType: string, // e.g., "city", "state_legislative_district", "national_constituency", "nation", "pr_bloc"
 * entityData: object, // Data for the entity (e.g., city object, district object {id, name, population, parentId})
 * resolvedOfficeName: string // The fully resolved office name for this specific instance
 * }
 */

export const getElectionInstances = (electionType, activeCampaign) => {
  const {
    countryId,
    regionId,
    startingCity,
    availableCountries,
  } = // Ensure currentDate is available if needed by buildInstanceIdBase indirectly
    activeCampaign;
  const instances = [];
  const currentCountryData = availableCountries.find((c) => c.id === countryId);

  if (!currentCountryData) {
    console.warn(
      `getElectionInstances: Country data not found for ${countryId}`
    );
    return [];
  }

  const buildInstanceIdBaseLocal = (typeId, entitySpecificIdSuffix) =>
    `${typeId}_${entitySpecificIdSuffix}`;

  const baseOfficeName = electionType.officeNameTemplate;

  // --- Unified Mayor Logic ---
  if (isMayorLikeElection(electionType, countryId)) {
    if (startingCity && startingCity.id) {
      const mayorInstances = generateMayorElectionInstances(
        electionType,
        startingCity,
        countryId,
        buildInstanceIdBaseLocal
      );
      instances.push(...mayorInstances);
    } else if (
      electionType.level === "local_city" ||
      electionType.level === "local_city_or_municipality"
    ) {
      console.warn(
        `Mayor-like election type ${electionType.id} but no valid 'startingCity'.`
      );
    }
  }
  // --- Unified City Council Logic ---
  else if (isCityCouncilElectionType(electionType, countryId)) {
    if (startingCity && startingCity.id) {
      const councilInstances = generateCityCouncilElectionInstances(
        electionType,
        startingCity,
        countryId,
        currentCountryData,
        buildInstanceIdBaseLocal
      );
      instances.push(...councilInstances);
    } else if (
      electionType.level === "local_city" ||
      electionType.level === "local_city_council" ||
      electionType.level === "local_city_or_municipality_council"
    ) {
      console.warn(
        `City Council election type ${electionType.id} but no valid 'startingCity'.`
      );
    }
  }
  // --- Unified State/Prefecture/Province Legislative Logic ---
  else if (isStateLegislativeElectionType(electionType, countryId)) {
    // This function now handles USA state legislatures, JPN prefectural assemblies, PHL provincial boards, GER state parliaments.
    // The `activeCampaign.regionId` provides the context for which state/prefecture/province.
    // If regionId is null/countryId, the sub-function might iterate all relevant sub-regions.
    const stateLegInstances = generateStateLegislativeElectionInstances(
      electionType,
      activeCampaign,
      currentCountryData,
      buildInstanceIdBaseLocal
    );
    instances.push(...stateLegInstances);
  } // --- Unified National Legislative Logic ---
  else if (isNationalLegislativeElectionType(electionType)) {
    // countryId might not be strictly needed for the helper if level is enough
    const nationalLegInstances = generateNationalLegislativeElectionInstances(
      electionType,
      activeCampaign,
      currentCountryData,
      buildInstanceIdBaseLocal
    );
    instances.push(...nationalLegInstances);
  } else if (electionType.id === "president") {
    instances.push({
      instanceIdBase: buildInstanceIdBaseLocal(electionType.id, countryId),
      entityType: "nation",
      entityData: { ...currentCountryData },
      resolvedOfficeName: baseOfficeName.replace(
        "{countryName}",
        currentCountryData.name
      ),
      _isSingleSeatContest: true,
      _effectiveElectoralSystem: electionType.electoralSystem,
      _effectiveGeneratesOneWinner: true,
      ...electionType,
      id: electionType.id,
    });
  } else if (electionType.id === "vice_president") {
    instances.push({
      instanceIdBase: buildInstanceIdBaseLocal(electionType.id, countryId),
      entityType: "nation",
      entityData: { ...currentCountryData },
      resolvedOfficeName: baseOfficeName.replace(
        "{countryName}",
        currentCountryData.name
      ),
      _isSingleSeatContest: true,
      _effectiveElectoralSystem: electionType.electoralSystem,
      _effectiveGeneratesOneWinner: true,
      ...electionType,
      id: electionType.id,
    });
  } else if (electionType.id === "governor") {
    const stateOrEquivalentEntity =
      currentCountryData.regions?.find((r) => r.id === regionId) ||
      (countryId === "PHL"
        ? currentCountryData.provinces?.find((p) => p.id === regionId)
        : null);

    if (stateOrEquivalentEntity) {
      let resolvedOfficeNameStr = baseOfficeName;
      if (resolvedOfficeNameStr.includes("{stateName}")) {
        resolvedOfficeNameStr = resolvedOfficeNameStr.replace(
          "{stateName}",
          stateOrEquivalentEntity.name
        );
      } else if (resolvedOfficeNameStr.includes("{prefectureName}")) {
        resolvedOfficeNameStr = resolvedOfficeNameStr.replace(
          "{prefectureName}",
          stateOrEquivalentEntity.name
        );
      } else if (resolvedOfficeNameStr.includes("{provinceName}")) {
        resolvedOfficeNameStr = resolvedOfficeNameStr.replace(
          "{provinceName}",
          stateOrEquivalentEntity.name
        );
      }

      instances.push({
        instanceIdBase: buildInstanceIdBaseLocal(
          electionType.id,
          stateOrEquivalentEntity.id
        ),
        entityType:
          electionType.level === "local_prefecture"
            ? "prefecture"
            : electionType.level === "local_province"
            ? "province"
            : "state",
        entityData: { ...stateOrEquivalentEntity },
        resolvedOfficeName: resolvedOfficeNameStr,
        _isSingleSeatContest: true,
        _effectiveElectoralSystem: electionType.electoralSystem,
        _effectiveGeneratesOneWinner: true,
        ...electionType,
        id: electionType.id,
      });
    }
  }

  // --- Generic Fallback for unhandled single-instance national/state/province elections ---
  // This is a very broad fallback.
  else if (
    !instances.length && // Only if nothing else has matched
    (electionType.level.startsWith("national_") ||
      ((electionType.level.startsWith("local_state") ||
        electionType.level.startsWith("local_prefecture") ||
        electionType.level.startsWith("local_province")) &&
        regionId &&
        currentCountryData.regions?.find((r) => r.id === regionId)))
  ) {
    let entityForInstance;
    let idSuffix;
    let nameTemplate = baseOfficeName;
    let entityTypeForInstance;

    if (electionType.level.startsWith("national_")) {
      entityForInstance = { ...currentCountryData };
      idSuffix = countryId;
      nameTemplate = nameTemplate.replace(
        "{countryName}",
        currentCountryData.name
      );
      entityTypeForInstance = "nation";
    } else {
      // State/Prefecture/Province level
      const regionEntity =
        currentCountryData.regions?.find((r) => r.id === regionId) ||
        (countryId === "PHL" && electionType.level.startsWith("local_province")
          ? currentCountryData.provinces?.find((p) => p.id === regionId)
          : null);
      if (regionEntity) {
        entityForInstance = { ...regionEntity };
        idSuffix = regionEntity.id;
        nameTemplate = nameTemplate
          .replace("{stateName}", regionEntity.name)
          .replace("{prefectureName}", regionEntity.name)
          .replace("{provinceName}", regionEntity.name);
        entityTypeForInstance = "state_or_equivalent";
      } else {
        return instances; // Cannot create instance if context is missing
      }
    }

    console.warn(
      `[getElectionInstances] Using GENERIC FALLBACK for type '${electionType.id}' (Level: ${electionType.level}). Review if specific handling is needed.`
    );
    instances.push({
      instanceIdBase: buildInstanceIdBaseLocal(electionType.id, idSuffix),
      entityType: entityTypeForInstance,
      entityData: entityForInstance,
      resolvedOfficeName: nameTemplate,
      _isSingleSeatContest: electionType.generatesOneWinner,
      _effectiveElectoralSystem: electionType.electoralSystem,
      _effectiveGeneratesOneWinner: electionType.generatesOneWinner,
      _numberOfSeatsForThisInstance:
        !electionType.generatesOneWinner && electionType.minCouncilSeats
          ? electionType.minCouncilSeats
          : undefined,
      ...electionType,
      id: electionType.id,
    });
  } else if (!instances.length) {
    // console.log(`getElectionInstances: Type '${electionType.id}' (Lvl: ${electionType.level}, Cntry: ${countryId}) did not generate instances with context (regionId: ${regionId}, cityId: ${startingCity?.id}).`);
  }

  return instances;
};
/**
 * Checks if an election for a specific instance (identified by its instanceIdBase) is due.
 * lastElectionYearsByInstanceIdBase should store year of last election for that specific instance.
 */
export const isElectionDue = (
  instanceIdBase,
  electionType,
  currentDate,
  lastElectionYearsByInstanceIdBase
) => {
  const lastHeldYear =
    lastElectionYearsByInstanceIdBase[instanceIdBase] ||
    currentDate.year - electionType.frequencyYears;

  if (currentDate.year < lastHeldYear + electionType.frequencyYears) {
    return false;
  }
  // }
  return true;
};

/**
 * Finds incumbent(s) for the specific resolved office name.
 * This is a simplified lookup; robust tracking might need instanceId in governmentOffices.
 */
export const getIncumbentsForOfficeInstance = (
  resolvedOfficeName,
  electionType,
  governmentOffices
) => {
  const matchingOffices = governmentOffices.filter(
    (off) => off.officeName === resolvedOfficeName && off.holder
  );

  if (matchingOffices.length === 0) return null;

  if (electionType.generatesOneWinner) {
    // Return the holder object for the first match (should be only one for single-winner)
    return {
      ...matchingOffices[0].holder,
      isActuallyRunning: Math.random() < 0.8,
    }; // INCUMBENT_RUNS_CHANCE
  } else {
    // For multi-winner offices (e.g. council seats if they share an officeName in governmentOffices)
    // This assumes governmentOffices might store multiple holders for the same generic officeName (e.g. "City Councilor")
    // and you'd need to differentiate them by other means if they are distinct seats.
    // Or, if each seat has a unique name like "City Councilor (Seat 1)", then generatesOneWinner would be true for that.
    // For PR lists, incumbency is more about party strength, not individual seat holders directly.
    // This function might return an array of incumbent objects for BlockVote/SNTV if applicable.
    return matchingOffices.map((off) => ({
      ...off.holder,
      isActuallyRunning: Math.random() < 0.7,
    }));
  }
};

/**
 * Calculates number of seats and distribution method for this specific election instance.
 * Adapts your existing calculateNumberOfSeats logic.
 */
export const calculateSeatDetailsForInstance = (
  electionType,
  entityPopulation
) => {
  let numberOfSeats = 0;
  let seatDistributionMethod = "single_winner";

  if (electionType.generatesOneWinner) {
    numberOfSeats = 1; // Always 1 for single-winner offices
  } else {
    // For multi-winner systems (PR, MMDs like BlockVote/SNTV, MMP list component)
    numberOfSeats = electionType.minCouncilSeats || 0; // Start with base
    if (
      electionType.councilSeatPopulationTiers &&
      typeof entityPopulation === "number" &&
      entityPopulation > 0
    ) {
      let tierApplied = false;
      for (const tier of electionType.councilSeatPopulationTiers) {
        if (entityPopulation < tier.popThreshold) {
          numberOfSeats += getRandomInt(
            tier.extraSeatsRange[0],
            tier.extraSeatsRange[1]
          );
          tierApplied = true;
          break;
        }
      }
      if (!tierApplied) {
        const lastTier =
          electionType.councilSeatPopulationTiers[
            electionType.councilSeatPopulationTiers.length - 1
          ];
        if (entityPopulation >= lastTier.popThreshold) {
          // Check if it's the Infinity tier
          numberOfSeats += getRandomInt(
            lastTier.extraSeatsRange[0],
            lastTier.extraSeatsRange[1]
          );
        }
      }
    }
    // Determine distribution method based on electoral system
    if (electionType.electoralSystem === "PartyListPR")
      seatDistributionMethod = "at_large_pr";
    else if (electionType.electoralSystem === "MMP")
      seatDistributionMethod = "mmp_list_component";
    // Assuming this is for the list part
    else if (
      electionType.electoralSystem === "BlockVote" ||
      electionType.electoralSystem === "SNTV_MMD"
    )
      seatDistributionMethod = "at_large_mmd";
    else seatDistributionMethod = "multiple_winners_other";
  }
  return { numberOfSeats: Math.max(0, numberOfSeats), seatDistributionMethod };
};

/**
 * DISPATCHER for generating candidates or party lists based on electoral system.
 */
export const generateElectionParticipants = ({
  electionType,
  partiesInScope,
  incumbentInfo,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  entityPopulation,
}) => {
  const system = electionType.electoralSystem;

  // Derive electorate context for this election instance from activeCampaign or sensible defaults
  // In campaign mode, electorate data would typically come from the startingCity/region data snapshot.
  // We'll use currentCampaignSetup's electorate settings first if available, otherwise city/entity stats, then neutral defaults.
  const electorateIdeologyCenter =
    activeCampaign?.currentCampaignSetup?.electorateIdeologyCenter || // From explicit setup
    activeCampaign?.startingCity?.stats?.electorateIdeologyCenter || // From starting city/entity
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).reduce(
      (acc, axis) => ({ ...acc, [axis]: 0 }),
      {}
    ); // Default neutral

  const electorateIdeologySpread =
    activeCampaign?.currentCampaignSetup?.electorateIdeologySpread || // From explicit setup
    activeCampaign?.startingCity?.stats?.electorateIdeologySpread || // From starting city/entity
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).reduce(
      (acc, axis) => ({ ...acc, [axis]: 1 }),
      {}
    ); // Default neutral spread

  const electorateIssueStances =
    activeCampaign?.currentCampaignSetup?.electorateIssueStances || // From explicit setup
    activeCampaign?.startingCity?.stats?.electoratePolicyProfile || // From starting city/entity
    POLICY_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {}); // Default to all zeros

  const handlerParams = {
    electionType,
    partiesInScope,
    incumbentInfo,
    numberOfSeatsToFill,
    countryId,
    activeCampaign,
    electionPropertiesForScoring,
    entityPopulation,
    electorateIdeologyCenter,
    electorateIdeologySpread,
    electorateIssueStances,
  };

  // Try optimized generation first for supported systems
  const optimizedResult = generateOptimizedElectionParticipants({
    electionType,
    partiesInScope,
    incumbentInfo,
    numberOfSeatsToFill,
    countryId,
    activeCampaign,
    electionPropertiesForScoring,
    entityPopulation,
  });

  if (optimizedResult) {
    return optimizedResult;
  }

  // Fall back to basic FPTP-style generation for unsupported systems
  console.warn(
    `[generateElectionParticipants] Electoral system "${system}" not yet optimized. Using basic candidate generation as fallback.`
  );
  
  // Generate basic candidates using optimized batch generation
  const candidateCount = Math.min(numberOfSeatsToFill * 2, 8);
  const basicCandidates = generatePoliticiansBatch(
    candidateCount,
    countryId,
    partiesInScope,
    {}
  );

  // Convert to Map format
  const candidatesMap = new Map();
  basicCandidates.forEach((candidate, index) => {
    candidatesMap.set(candidate.id, {
      ...candidate,
      polling: Math.max(5, Math.random() * 40),
    });
  });

  return { type: "individual_candidates", data: candidatesMap };
};

/**
 * Initializes the final election object for the store.
 */
export const initializeElectionObject = ({
  electionType,
  instanceContext,
  currentDate,
  activeCampaign,
  incumbentInfoForDisplay,
  participantsData,
  seatDetails,
}) => {
  const { instanceIdBase, entityData, resolvedOfficeName } = instanceContext;
  const electionYear = currentDate.year;

  // --- Election Date & Filing Deadline (as before) ---
  let electionMonthDetermined = electionType.electionMonth;
  if (
    electionMonthDetermined === null ||
    electionMonthDetermined === undefined
  ) {
    electionMonthDetermined = getRandomInt(4, 11);
  }
  const electionDayDetermined = getRandomInt(1, 28);
  let filingMonth = electionMonthDetermined - getRandomInt(2, 4);
  let filingYear = electionYear;
  if (filingMonth <= 0) {
    filingMonth += 12;
    filingYear -= 1;
  }
  const filingDayDetermined = getRandomInt(1, 15);

  // --- Electorate Profile (as before) ---
  const electorateIssues = entityData.issues || [
    "Economy",
    "Healthcare",
    "Local Development",
  ];
  const electorateLeaning = entityData.politicalLeaning || "Moderate";
  const entityPoliticalLandscape =
    entityData.politicalLandscape ||
    (activeCampaign.generatedPartiesSnapshot || []).map((p) => ({
      id: p.id,
      name: p.name,
      ideology: p.ideology,
      color: p.color,
      popularity:
        100 /
        Math.max(1, (activeCampaign.generatedPartiesSnapshot || []).length),
    }));

  // --- Process Participants: Calculate Base Scores and Initial Polling ---
  let finalIndividualCandidates = new Map();
  let finalPartyLists = {};
  let finalMmpData = null;

  if (participantsData.type === "individual_candidates") {
    finalIndividualCandidates = participantsData.data;
  } else if (
    participantsData.type === "party_lists" ||
    participantsData.type === "party_lists_for_mmp"
  ) {
    finalPartyLists = participantsData.data;
  } else if (participantsData.type === "mmp_participants") {
    const { partyLists: mmpPartyLists, ...constituencyData } =
      participantsData.data;

    finalPartyLists = mmpPartyLists || {};

    finalMmpData = {
      constituencyCandidatesByParty:
        constituencyData.constituencyCandidatesByParty || {},
      independentConstituencyCandidates:
        constituencyData.independentConstituencyCandidates || [],
    };
  }

  let expectedTurnout = 55;
  if (electionType.level?.startsWith("national_"))
    expectedTurnout = getRandomInt(50, 75);
  else if (electionType.level?.startsWith("local_state"))
    expectedTurnout = getRandomInt(40, 65);
  else expectedTurnout = getRandomInt(35, 60);

  const electionObject = {
    id: `election_${instanceIdBase}_${electionYear}_${generateId()}`,
    instanceIdBase: instanceIdBase,
    officeName: resolvedOfficeName,
    officeNameTemplateId: electionType.id, // Original template ID from ELECTION_TYPES_BY_COUNTRY
    level: electionType.level,
    electoralSystem: electionType.electoralSystem,
    electionDate: {
      year: electionYear,
      month: electionMonthDetermined,
      day: electionDayDetermined,
    },
    filingDeadline: {
      year: filingYear,
      month: filingMonth,
      day: filingDayDetermined,
    },
    incumbentInfo: incumbentInfoForDisplay, // Snapshot
    numberOfSeatsToFill: seatDetails.numberOfSeats,
    seatDistributionMethod: seatDetails.seatDistributionMethod,

    totalEligibleVoters: Math.floor(
      (entityData.population || 0) * (0.6 + Math.random() * 0.25)
    ),
    voterTurnoutPercentage: expectedTurnout,
    electorateIssues: electorateIssues,
    electorateLeaning: electorateLeaning,
    entityDataSnapshot: {
      id: entityData.id,
      name: entityData.name,
      population: entityData.population,
      issues: electorateIssues,
      politicalLeaning: electorateLeaning,
      stats: entityData.stats || {},
      politicalLandscape: entityPoliticalLandscape,
      demographics: activeCampaign.startingCity.demographics.ageDemographics,
    },

    playerIsCandidate: false,
    outcome: {
      status: "upcoming",
      winners: [],
      resultsByCandidate: [],
      resultsByParty: {},
      turnoutActual: null,
    },

    // Participant Data:
    candidates: finalIndividualCandidates, // For FPTP, BlockVote, SNTV - will be empty for PR/MMP
    partyLists: finalPartyLists, // For PartyListPR, and list component of MMP
    mmpData: finalMmpData, // For MMP: holds structured constituency candidate pools

    // Key properties from electionType for resolution logic & specific MMP details
    generatesOneWinner: electionType.generatesOneWinner, // Effective GOW for this instance from instanceContext
    partyListType: electionType.partyListType,
    prThresholdPercent: electionType.prThresholdPercent,
    prAllocationMethod: electionType.prAllocationMethod,
    mmpConstituencySeatsRatio: electionType.mmpConstituencySeatsRatio, // Store MMP ratios
    mmpListSeatsRatio: electionType.mmpListSeatsRatio,
    voteTarget: electionType.voteTarget, // Crucial for MMP ("dual_candidate_and_party")
  };

  return electionObject;
};
