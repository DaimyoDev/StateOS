import {
  NAMES_BY_COUNTRY,
  GENERIC_FIRST_NAMES_MALE,
  GENERIC_FIRST_NAMES_FEMALE,
  GENERIC_LAST_NAMES,
} from "../data/namesData.js";
import {
  BASE_IDEOLOGIES,
  IDEOLOGY_KEYWORDS,
  GENERIC_ADJECTIVES,
  GENERIC_NOUNS,
  ABSTRACT_NOUNS,
} from "../data/ideologiesData.js";
import { generateId, getRandomElement, getRandomInt } from "./generalUtils.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import { POSSIBLE_POLICY_FOCUSES } from "../data/governmentData.js";
import {
  generateMayorElectionInstances,
  isMayorLikeElection,
  isCityCouncilElectionType,
  generateCityCouncilElectionInstances,
  isStateLegislativeElectionType,
  generateStateLegislativeElectionInstances,
  isNationalLegislativeElectionType,
  generateNationalLegislativeElectionInstances,
} from "./electionGenUtils";
import {
  handleFPTPParticipants,
  handlePartyListPRParticipants,
  handleMMPParticipants,
  handleMMDParticipants,
} from "./electionSystems.js"; // Adjust path if needed

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
 * Generates a random AI candidate name based on country context.
 * @param {string} countryId - The ID of the country (e.g., "JPN", "USA", "GER", "PHL").
 * @returns {string} A randomly generated name or "AI Candidate" as fallback.
 */
export const generateAICandidateNameForElection = (countryId) => {
  const countryNameData = NAMES_BY_COUNTRY[countryId];

  let firstNamesMale = GENERIC_FIRST_NAMES_MALE;
  let firstNamesFemale = GENERIC_FIRST_NAMES_FEMALE;
  let lastNames = GENERIC_LAST_NAMES;
  let selectedFirstNamePool;

  if (countryNameData) {
    firstNamesMale =
      countryNameData.male && countryNameData.male.length > 0
        ? countryNameData.male
        : GENERIC_FIRST_NAMES_MALE;
    firstNamesFemale =
      countryNameData.female && countryNameData.female.length > 0
        ? countryNameData.female
        : GENERIC_FIRST_NAMES_FEMALE;
    lastNames =
      countryNameData.last && countryNameData.last.length > 0
        ? countryNameData.last
        : GENERIC_LAST_NAMES;
  } else {
    console.warn(
      `Name data not found for countryId: ${countryId}. Using generic names.`
    );
  }

  // Randomly pick between male and female first names
  if (Math.random() < 0.5 && firstNamesMale.length > 0) {
    selectedFirstNamePool = firstNamesMale;
  } else if (firstNamesFemale.length > 0) {
    selectedFirstNamePool = firstNamesFemale;
  } else if (firstNamesMale.length > 0) {
    // Fallback if female pool was empty but male wasn't
    selectedFirstNamePool = firstNamesMale;
  } else {
    // Both specific pools were empty, rely on generic ones already set
    if (Math.random() < 0.5 && GENERIC_FIRST_NAMES_MALE.length > 0) {
      selectedFirstNamePool = GENERIC_FIRST_NAMES_MALE;
    } else if (GENERIC_FIRST_NAMES_FEMALE.length > 0) {
      selectedFirstNamePool = GENERIC_FIRST_NAMES_FEMALE;
    } else {
      return "AI Candidate"; // Absolute fallback
    }
  }

  if (selectedFirstNamePool.length === 0 || lastNames.length === 0) {
    // This case should be rare if GENERIC lists are populated
    console.warn(
      `Selected name pools are empty for ${countryId}. Using absolute fallback.`
    );
    return "AI Candidate";
  }

  const firstName = getRandomElement(selectedFirstNamePool);
  const lastName = getRandomElement(lastNames);

  return `${firstName} ${lastName}`;
};

/**
 * Normalizes candidate base scores into polling percentages (0-100).
 * Expects each candidate in candidatesList to have a 'baseScore' property.
 * Adds/updates a 'polling' property on each candidate.
 *
 * @param {Array<object>} candidatesList - List of candidate objects, each with a 'baseScore'.
 * @returns {Array<object>} Candidates list with 'polling' percentages, sorted by polling descending.
 */
export function normalizePolling(candidatesList = [], adultPopulation = 0) {
  if (!candidatesList || candidatesList.length === 0) {
    return [];
  }

  const safeAdultPopulation = Math.max(1, adultPopulation);

  const candidatesWithEffectiveWeights = candidatesList.map((c) => {
    const baseScore = Number(c.baseScore) >= 0 ? Number(c.baseScore) : 1;

    const recognizedCount = Math.min(
      c.nameRecognition || 0,
      safeAdultPopulation
    );
    const recognitionFraction = recognizedCount / safeAdultPopulation;
    const effectiveWeight = baseScore * recognitionFraction;

    return {
      ...c,
      processedBaseScore: baseScore,
      recognitionFraction: recognitionFraction,
      effectiveWeight: effectiveWeight,
    };
  });

  const totalEffectiveWeight = candidatesWithEffectiveWeights.reduce(
    (sum, candidate) => sum + candidate.effectiveWeight,
    0
  );

  let normalizedCandidates;

  if (totalEffectiveWeight === 0) {
    const numCandidates = candidatesWithEffectiveWeights.length;
    if (numCandidates === 0) return [];

    const equalShare = Math.floor(100 / numCandidates);
    let remainderPoints = 100 % numCandidates;
    normalizedCandidates = candidatesWithEffectiveWeights.map(
      (candidate, idx) => {
        const pollingValue = equalShare + (idx < remainderPoints ? 1 : 0);
        remainderPoints -= idx < remainderPoints ? 1 : 0;
        return {
          ...candidate,
          polling: pollingValue,
          rawPolling: pollingValue,
          remainder: 0,
        };
      }
    );
  } else {
    const candidatesWithRawPolling = candidatesWithEffectiveWeights.map(
      (candidate) => {
        const rawPolling =
          (candidate.effectiveWeight / totalEffectiveWeight) * 100;
        return { ...candidate, rawPolling };
      }
    );
    candidatesWithRawPolling.forEach((candidate) => {
      candidate.polling = Math.floor(candidate.rawPolling);
      candidate.remainder = candidate.rawPolling - candidate.polling;
    });

    let sumOfFlooredPolling = candidatesWithRawPolling.reduce(
      (sum, candidate) => sum + candidate.polling,
      0
    );
    let deficit = 100 - sumOfFlooredPolling;

    candidatesWithRawPolling.sort((a, b) => {
      if (b.remainder !== a.remainder) {
        return b.remainder - a.remainder;
      }
      if (b.effectiveWeight !== a.effectiveWeight) {
        return b.effectiveWeight - a.effectiveWeight;
      }
      return b.processedBaseScore - a.processedBaseScore;
    });

    for (let i = 0; i < deficit; i++) {
      const candidateToAdjust =
        candidatesWithRawPolling[i % candidatesWithRawPolling.length];
      if (candidateToAdjust) {
        candidateToAdjust.polling++;
      }
    }
    normalizedCandidates = candidatesWithRawPolling;
  }

  return normalizedCandidates.sort(
    (a, b) => (b.polling || 0) - (a.polling || 0)
  );
}
/**
 * Generates AI candidates for an election.
 * @param {number} minChallengers - Minimum number of AI challengers.
 * @param {number} maxChallengers - Maximum number of AI challengers.
 * @param {Array<object>} countryParties - List of available parties in the country.
 * @param {object|null} incumbentDetails - Details of the incumbent, if any.
 * @returns {Array<object>} A list of generated AI candidate objects.
 */
const getNumericalCampaignFunds = (fundLevelString) => {
  switch (fundLevelString) {
    case "High":
      return getRandomInt(15000, 30000); // Example: Higher range for "High"
    case "Moderate":
      return getRandomInt(5000, 14999);
    case "Low":
    default:
      return getRandomInt(1000, 4999);
  }
};

export function generateAICandidates(
  minChallengers,
  maxChallengers,
  countryParties = [],
  incumbentFullDetails = null,
  countryId
) {
  const candidates = [];

  if (
    incumbentFullDetails &&
    incumbentFullDetails.isActuallyRunning &&
    incumbentFullDetails.id &&
    incumbentFullDetails.name
  ) {
    const incumbentFundsStr = getRandomElement(["Moderate", "High", "High"]); // Incumbents tend to have more
    candidates.push({
      ...incumbentFullDetails, // Spread the full politician details
      // baseScore will be calculated later by the caller (generateScheduledElections)
      polling: 0, // Initial polling, will be set by normalizePolling based on baseScore
      campaignFunds: getNumericalCampaignFunds(incumbentFundsStr), // Assign numerical funds
      isIncumbent: true,
      isPlayer: false,
    });
  }

  const numChallengersToGenerate = getRandomInt(minChallengers, maxChallengers);
  let availablePartiesForChallengers = [...(countryParties || [])];
  const maxPossibleChallengersWithUniqueParties =
    (countryParties?.length || 0) + 1;
  const actualNumChallengers = Math.min(
    numChallengersToGenerate,
    maxPossibleChallengersWithUniqueParties * 2 // Cap based on party variety
  );

  for (
    let i = 0;
    candidates.length <
      actualNumChallengers + (candidates.find((c) => c.isIncumbent) ? 1 : 0) &&
    i < actualNumChallengers * 3 + 10; // Increased loop guard slightly for safety
    i++
  ) {
    let assignedPartyForChallenger = {
      /* ... your party selection logic ... */
    };
    if (availablePartiesForChallengers.length > 0) {
      const partyIndex = Math.floor(
        Math.random() * availablePartiesForChallengers.length
      );
      const tempParty = availablePartiesForChallengers.splice(partyIndex, 1)[0];
      const runningIncumbent = candidates.find((c) => c.isIncumbent);
      if (
        runningIncumbent &&
        tempParty.id === runningIncumbent.partyId &&
        availablePartiesForChallengers.length > 0
      ) {
        availablePartiesForChallengers.push(tempParty);
        continue;
      } else {
        assignedPartyForChallenger = { ...tempParty };
      }
    } else if (countryParties && countryParties.length > 0) {
      assignedPartyForChallenger = { ...getRandomElement(countryParties) };
    } else {
      // Fallback to independent if no parties provided
      assignedPartyForChallenger = {
        id: `independent_ai_challenger_${generateId()}`,
        name: "Independent",
        ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
        color: "#888888",
      };
    }

    const newChallengerPolitician = generateFullAIPolitician(
      assignedPartyForChallenger,
      false,
      countryId
    );

    if (candidates.some((c) => c.name === newChallengerPolitician.name)) {
      continue;
    }

    const challengerFundsStr = getRandomElement(["Low", "Low", "Moderate"]);
    candidates.push({
      ...newChallengerPolitician,
      // baseScore will be calculated later by the caller
      polling: 0, // Initial polling
      campaignFunds: getNumericalCampaignFunds(challengerFundsStr), // Assign numerical funds
      // isIncumbent and isPlayer are already set by generateFullAIPolitician (as false)
    });
  }
  return candidates;
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

export function distributeVotesToCandidates(
  candidatesList,
  totalVotesToDistribute,
  electionIdForLog = "election"
) {
  if (!candidatesList || candidatesList.length === 0) {
    return [];
  }

  // Use polling as a basis for vote share.
  // Candidates already have polling normalized to 100 (or should have).
  let tempCandidates = candidatesList.map((c) => ({
    ...c,
    polling: c.polling || 0, // Ensure polling exists
    votes: 0, // Initialize votes
  }));

  const totalPollingSum = tempCandidates.reduce((sum, c) => sum + c.polling, 0);

  if (totalPollingSum === 0 && tempCandidates.length > 0) {
    // If all polling is 0 (unlikely if normalized, but a fallback), distribute equally
    const equalShare = Math.floor(
      totalVotesToDistribute / tempCandidates.length
    );
    let remainder = totalVotesToDistribute % tempCandidates.length;
    return tempCandidates.map((c) => {
      c.votes = equalShare + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      return c;
    });
  }

  if (totalPollingSum !== 100 && totalPollingSum > 0) {
    // if polling wasn't summing to 100, re-normalize for proportion calculation here
    console.warn(
      `[VoteSim/${electionIdForLog}] Total polling is ${totalPollingSum}, not 100. Will use proportions.`
    );
  }

  // Calculate votes based on polling share
  let assignedVotesCount = 0;
  tempCandidates.forEach((candidate) => {
    // If totalPollingSum is 0, this gives NaN. Handled by above block.
    const proportion =
      totalPollingSum > 0
        ? candidate.polling / totalPollingSum
        : 1 / tempCandidates.length;
    candidate.votes = Math.floor(proportion * totalVotesToDistribute);
    assignedVotesCount += candidate.votes;
  });

  // Distribute any remaining votes due to flooring, one by one, prioritizing higher polling
  // or use a more randomized approach for remainder to avoid always giving to top.
  let remainingVotes = totalVotesToDistribute - assignedVotesCount;
  if (remainingVotes > 0) {
    // Sort by polling descending to give remainder to "stronger" candidates first
    // Could also add a small random factor or distribute based on decimal remainders for more fairness
    tempCandidates.sort((a, b) => {
      // Primary sort by polling, secondary by random to break ties if needed
      if (b.polling === a.polling) return Math.random() - 0.5;
      return b.polling - a.polling;
    });
    for (let i = 0; i < remainingVotes; i++) {
      tempCandidates[i % tempCandidates.length].votes++;
    }
  }
  // Safety check: ensure total votes match
  let finalVoteSum = tempCandidates.reduce((sum, c) => sum + c.votes, 0);
  if (finalVoteSum !== totalVotesToDistribute && tempCandidates.length > 0) {
    console.warn(
      `[VoteSim/${electionIdForLog}] Vote sum mismatch. Expected ${totalVotesToDistribute}, got ${finalVoteSum}. Adjusting...`
    );
    let diff = totalVotesToDistribute - finalVoteSum;
    tempCandidates[0].votes += diff; // Add/remove from the first candidate (could be more sophisticated)
  }

  console.log(
    `[VoteSim/${electionIdForLog}] Final candidate votes:`,
    tempCandidates.map((c) => ({ name: c.name, votes: c.votes }))
  );
  return tempCandidates;
}

const calculateAIPoliticianIdeology = (stances, basePartyIdeology = null) => {
  if (basePartyIdeology && Math.random() < 0.7) {
    // 70% chance to align with party if provided
    return basePartyIdeology;
  }
  // Simplified: pick a random base ideology or derive from a few key stances
  // For now, let's just use a random base ideology if not strongly tied to party
  let socialScore = 0;
  let economicScore = 0;
  let N = 0;
  POLICY_QUESTIONS.forEach((pq) => {
    const selectedOptionValue = stances[pq.id];
    if (selectedOptionValue) {
      N++;
      const selectedOptionData = pq.options.find(
        (opt) => opt.value === selectedOptionValue
      );
      if (selectedOptionData && selectedOptionData.ideologyEffect) {
        socialScore += selectedOptionData.ideologyEffect.social || 0;
        economicScore += selectedOptionData.ideologyEffect.economic || 0;
      }
    }
  });

  if (N === 0 && basePartyIdeology) return basePartyIdeology;
  if (N === 0) return getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist";

  // Simplified logic (can be expanded like your player's recalculateIdeology)
  if (socialScore > N * 0.2 && economicScore < -N * 0.2) return "Progressive";
  if (socialScore < -N * 0.2 && economicScore > N * 0.2) return "Conservative";
  if (Math.abs(socialScore) < N * 0.1 && Math.abs(economicScore) < N * 0.1)
    return "Centrist";
  // Add more conditions or fall back to a random base ideology
  return getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist";
};

export function generateFullAIPolitician(
  assignedPartyInfo = null,
  isIncumbent = false,
  countryId
) {
  const fullName = generateAICandidateNameForElection(countryId);
  const nameParts = fullName.split(" ");
  const firstName =
    nameParts[0] === "AI" && nameParts[1] === "Candidate" ? "AI" : nameParts[0]; // Handle fallback case
  const lastName =
    nameParts[0] === "AI" && nameParts[1] === "Candidate"
      ? "Candidate"
      : nameParts.slice(1).join(" ") || `LastName_${generateId()}`;

  const policyStances = {};
  POLICY_QUESTIONS.forEach((question) => {
    if (question.options && question.options.length > 0) {
      policyStances[question.id] = getRandomElement(question.options).value;
    }
  });

  const partyIdeology = assignedPartyInfo?.ideology;
  const calculatedIdeology = calculateAIPoliticianIdeology(
    policyStances,
    partyIdeology
  );

  const attributes = {
    charisma: getRandomInt(3, 8),
    integrity: getRandomInt(2, 7),
    intelligence: getRandomInt(4, 9),
    negotiation: getRandomInt(3, 8),
    oratory: getRandomInt(3, 8),
    fundraising: getRandomInt(2, 7),
  };

  const educationLevels = [
    "High School Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
  ];
  const careerPaths = [
    "Lawyer",
    "Business Owner",
    "Community Organizer",
    "Teacher",
    "Local Bureaucrat",
    "Academic",
  ];
  const actualEducation = getRandomElement(educationLevels);
  const actualCareer = getRandomElement(careerPaths);

  const background = {
    education: actualEducation,
    career: actualCareer,
    narrative: `A dedicated public servant with a focus on community values and pragmatic solutions. Hopes to bring positive change through collaboration and hard work. Started their political journey after a career as a ${actualCareer.toLowerCase()}, building on a foundation from their ${actualEducation.toLowerCase()}.`,
  };

  let initialNameRecognition = 0;
  if (isIncumbent) {
    initialNameRecognition = getRandomInt(15000, 75000);
  } else {
    if (assignedPartyInfo && assignedPartyInfo.name !== "Independent") {
      initialNameRecognition = getRandomInt(2000, 15000);
    } else {
      initialNameRecognition = getRandomInt(500, 5000);
    }
  }
  // If adultPopulationForContext were available:
  // initialNameRecognition = Math.floor(adultPopulationForContext * (isIncumbent ? getRandomInt(10,30)/100 : getRandomInt(1,5)/100));

  const campaignHoursPerDayForAI = getRandomInt(6, 10); // AIs might have different daily hours

  return {
    id: `ai_pol_${generateId()}`,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    age: getRandomInt(35, 70),
    attributes: attributes,
    policyStances: policyStances,
    background: background,
    calculatedIdeology: calculatedIdeology,

    partyId: assignedPartyInfo?.id || `independent_ai_${generateId()}`,
    partyName: assignedPartyInfo?.name || "Independent",
    partyColor: assignedPartyInfo?.color || "#888888",

    isIncumbent: isIncumbent, // Contextual flag for generation
    isPlayer: false,

    // Initializing stats based on getInitialCreatingPoliticianState structure
    politicalCapital: getRandomInt(5, 30), // AIs start with some
    nameRecognition: initialNameRecognition,
    treasury: getRandomInt(5000, 50000), // Personal funds
    campaignFunds: isIncumbent
      ? getRandomInt(10000, 75000)
      : getRandomInt(500, 10000), // Seed money
    approvalRating: getRandomInt(35, 60), // Baseline approval
    mediaBuzz: getRandomInt(0, 20), // Start with low to moderate buzz
    partySupport:
      assignedPartyInfo && assignedPartyInfo.name !== "Independent"
        ? getRandomInt(30, 75)
        : 0,
    currentOffice: null, // This is typically set when they win an election and take office

    // Hour-based campaign system fields
    campaignHoursPerDay: campaignHoursPerDayForAI,
    campaignHoursRemainingToday: campaignHoursPerDayForAI, // Start with full hours

    // Other campaign-related fields from your recent getInitialCreatingPoliticianState
    hiredStaff: [],
    volunteerCount: isIncumbent ? getRandomInt(10, 50) : getRandomInt(0, 15),
    advertisingBudgetMonthly: 0,
    currentAdStrategy: {
      focus: "none",
      targetId: null,
      intensity: 0, // AIs will determine their strategy
    },
    isInCampaign: false, // Your added field, defaulting to false
    // campaignActionToday: false, // This is replaced by the hour system
  };
}

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
 * Generates a plausible and varied political party name.
 * @param {string} baseIdeologyName - The base ideology (e.g., "Conservative", "Socialist").
 * @param {string} countryName - The name of the country (e.g., "Japan", "United States").
 * @returns {string} A generated party name.
 */
export function generateNewPartyName(baseIdeologyName, countryName) {
  const roll = Math.random();
  let nameParts = [];

  const ideologySpecificWords =
    IDEOLOGY_KEYWORDS[baseIdeologyName] ||
    IDEOLOGY_KEYWORDS["Default"].concat(baseIdeologyName);
  const specificWord = getRandomElement(ideologySpecificWords);
  const genericAdj = getRandomElement(GENERIC_ADJECTIVES);
  const genericNoun = getRandomElement(GENERIC_NOUNS);
  const abstractNoun = getRandomElement(ABSTRACT_NOUNS);
  const countryAdj = countryName; // Could be refined to "Japanese", "American" etc. later

  // Define several templates
  if (roll < 0.1) {
    // Template 1: [Ideology] Party (simple and common)
    nameParts = [specificWord, "Party"];
  } else if (roll < 0.25) {
    // Template 2: [Generic Adj] [Specific/Ideology Word] [Generic Noun]
    nameParts = [genericAdj, specificWord, genericNoun];
  } else if (roll < 0.4) {
    // Template 3: [Specific/Ideology Word] [Generic Noun]
    nameParts = [specificWord, genericNoun];
  } else if (roll < 0.55 && countryName) {
    // Template 4: [Country Adj] [Specific/Ideology Word] [Party/Union/Alliance]
    nameParts = [
      countryAdj,
      specificWord,
      getRandomElement(["Party", "Union", "Alliance"]),
    ];
  } else if (roll < 0.7) {
    // Template 5: [Generic Adj] [Abstract Noun] [Generic Noun]
    nameParts = [genericAdj, abstractNoun, genericNoun];
  } else if (roll < 0.8 && countryName) {
    // Template 6: [Abstract Noun] of [Country]
    nameParts = [abstractNoun, "of", countryName];
  } else if (roll < 0.9) {
    // Template 7: The [Specific/Ideology Word] [Abstract Noun]
    nameParts = ["The", specificWord, abstractNoun];
  } else if (roll < 0.95 && specificWord !== baseIdeologyName) {
    // Template 8: [Base Ideology Name]'s [Specific Word]
    nameParts = [baseIdeologyName + "'s", specificWord];
  } else {
    // Fallback/Default: [Generic Adj] [Base Ideology Name] Party
    nameParts = [genericAdj, baseIdeologyName, "Party"];
  }

  // Clean up: Filter out empty strings, join, and remove duplicate consecutive words (simple version)
  let finalName = nameParts
    .filter((part) => part && part.trim() !== "")
    .join(" ");
  const words = finalName.split(" ");
  const uniqueConsecutiveWords = [];
  if (words.length > 0) {
    uniqueConsecutiveWords.push(words[0]);
    for (let i = 1; i < words.length; i++) {
      if (words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
        uniqueConsecutiveWords.push(words[i]);
      }
    }
  }
  finalName = uniqueConsecutiveWords.join(" ");

  // Replace placeholder [CountryName] if it made it through
  finalName = finalName.replace(/\[CountryName\]/g, countryName);

  // Ensure "Party Party" or similar doesn't happen often by checking last two words
  const nameSplit = finalName.split(" ");
  if (
    nameSplit.length > 1 &&
    nameSplit[nameSplit.length - 1].toLowerCase() ===
      nameSplit[nameSplit.length - 2].toLowerCase() &&
    GENERIC_NOUNS.includes(nameSplit[nameSplit.length - 1])
  ) {
    finalName = nameSplit.slice(0, -1).join(" "); // Remove last word if duplicate of second last and is a generic noun
  }
  if (finalName.trim() === "" || finalName.toLowerCase() === "party") {
    // Further fallback
    finalName = `${genericAdj} ${baseIdeologyName} ${getRandomElement(
      GENERIC_NOUNS
    )}`;
  }

  return finalName;
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
  const officeHolder = generateFullAIPolitician(partyInfo, false, countryId);
  let policyFocus = null;
  // Assign a policy focus, especially if it's a significant role like Mayor
  if (officeTitle.toLowerCase().includes("mayor")) {
    policyFocus = getRandomElement(POSSIBLE_POLICY_FOCUSES);
  }
  return { ...officeHolder, role: officeTitle, policyFocus: policyFocus };
};

export const getPlayerActiveElectionDetailsForCampaignActions = (
  campaignState
) => {
  if (!campaignState || !campaignState.elections || !campaignState.politician)
    return null;
  const playerElection = campaignState.elections.find(
    (e) => e.playerIsCandidate && e.outcome?.status === "upcoming"
  );
  if (!playerElection) return null;
  const playerCandidateIndex = playerElection.candidates.findIndex(
    (c) => c.id === campaignState.politician.id
  );
  if (playerCandidateIndex === -1) return null;
  return {
    playerElection,
    playerCandidateIndex,
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
 * Calls your existing generateAICandidates or new specific generators.
 */
export const generateElectionParticipants = ({
  electionType,
  partiesInScope,
  incumbentInfo,
  numberOfSeatsToFill,
  countryId,
  activeCampaign, // <--- NEW PARAMETER
  electionPropertiesForScoring, // <--- NEW PARAMETER
  entityPopulation, // <--- NEW PARAMETER
}) => {
  const system = electionType.electoralSystem;

  // Consolidate parameters for the system-specific handlers
  const handlerParams = {
    electionType,
    partiesInScope,
    incumbentInfo,
    numberOfSeatsToFill,
    countryId,
    activeCampaign,
    electionPropertiesForScoring,
    entityPopulation,
  };

  switch (system) {
    case "FPTP":
    case "TwoRoundSystem":
    case "ElectoralCollege":
      return handleFPTPParticipants(handlerParams);
    case "PartyListPR":
      return handlePartyListPRParticipants(handlerParams);
    case "MMP":
      return handleMMPParticipants(handlerParams);
    case "SNTV_MMD":
    case "BlockVote":
    case "PluralityMMD": // Assuming PluralityMMD also uses the MMD handler
      return handleMMDParticipants(handlerParams);
    default:
      console.warn(
        `[generateElectionParticipants] Unknown electoral system: ${system}. Defaulting to FPTP participant generation logic as a fallback.`
      );
      // Fallback to FPTP handler for any unhandled system, which typically returns individual candidates.
      return handleFPTPParticipants(handlerParams);
  }
};

/**
 * Initializes the final election object for the store.
 */
export const initializeElectionObject = ({
  electionType, // The effective election type for this specific instance (merged base + instance specifics)
  instanceContext, // { instanceIdBase, entityType, entityData, resolvedOfficeName, ... }
  currentDate, // For setting electionDate year
  activeCampaign, // To pass to calculateBaseCandidateScore
  incumbentInfoForDisplay, // Processed incumbent details for storing
  participantsData, // { type: 'individual_candidates' | 'party_lists' | 'mmp_participants' | 'party_lists_for_mmp', data: ... }
  seatDetails, // { numberOfSeats, seatDistributionMethod }
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
  let finalIndividualCandidates = [];
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
    const mmpSourceData = participantsData.data;
    finalMmpData = {
      constituencyCandidatesByParty: {},
      independentConstituencyCandidates: [],
    };

    // 1. Process Party Lists for MMP
    if (mmpSourceData.partyLists) {
      finalPartyLists = mmpSourceData.partyLists;
    }

    // 2. Process Constituency Candidate Pools for MMP
    if (mmpSourceData.constituencyCandidatesByParty) {
      finalMmpData.constituencyCandidatesByParty =
        mmpSourceData.constituencyCandidatesByParty;
    }
    if (mmpSourceData.independentConstituencyCandidates) {
      finalMmpData.independentConstituencyCandidates =
        mmpSourceData.independentConstituencyCandidates;
    }
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
