import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";
import { getRandomInt } from "../utils/core";

/**
 * Calculates an initial polling score for a newly generated AI candidate.
 * This score is a raw value, typically normalized later.
 * @param {object} candidate - The generated AI candidate object.
 * @param {string} countryId - The ID of the country.
 * @param {Array<object>} allPartiesInGame - All parties currently defined in the game/scope.
 * @param {Array<object>} policyQuestionsData - All policy questions data (not directly used for basic polling).
 * @param {object} ideologyData - All ideology definitions (not directly used for basic polling).
 * @returns {{totalScore: number}} An object containing the calculated raw polling score.
 */
export function calculateInitialPolling(
  candidate,
  countryId, // Unused, but kept for signature consistency
  allPartiesInGame,
  policyQuestionsData, // This is POLICY_QUESTIONS
  ideologyData, // This is IDEOLOGY_DEFINITIONS
  electorateIdeologyCenter,
  electorateIdeologySpread,
  electorateIssueStances
) {
  let totalScore = 40; // Base starting score

  // --- REINTRODUCED LOGIC ---

  // 1. Party Popularity Factor
  if (candidate.partyId && allPartiesInGame && allPartiesInGame.length > 0) {
    const candidateParty = allPartiesInGame.find(
      (p) => p.id === candidate.partyId
    );
    if (candidateParty && candidateParty.popularity !== undefined) {
      // Popularity is likely 0-100. Normalize to -0.5 to 0.5 and apply a weight.
      // "Decently important" weight
      totalScore += (candidateParty.popularity / 100 - 0.5) * 15;
    }
  }

  // 2. Candidate Attributes Factor (Charisma and Integrity)
  if (candidate.attributes) {
    // Assuming attributes like charisma and integrity are numbers, e.g., 0-100
    // Charisma: provides a bigger boost
    if (candidate.attributes.charisma !== undefined) {
      totalScore += (candidate.attributes.charisma / 100 - 0.5) * 20;
    }
    // Integrity: not as much boost
    if (candidate.attributes.integrity !== undefined) {
      totalScore += (candidate.attributes.integrity / 100 - 0.5) * 10;
    }
    // Other attributes could be added here later
  }

  // ... (Ideological Alignment logic - remains the same as provided)
  if (candidate.ideologyScores && electorateIdeologyCenter) {
    const AXES = Object.keys(electorateIdeologyCenter);
    let ideologyMatchScore = 0;
    let axisCount = 0;

    AXES.forEach((axis) => {
      const candScore = candidate.ideologyScores[axis] || 0;
      const electorateCenter = electorateIdeologyCenter[axis] || 0;
      const electorateSpread = electorateIdeologySpread[axis] || 1;

      const distance = Math.abs(candScore - electorateCenter);
      const normalizedDistance = distance / Math.max(1, electorateSpread);
      const impactScale = 1 - Math.min(1, normalizedDistance / 4);

      ideologyMatchScore += impactScale;
      axisCount++;
    });

    if (axisCount > 0) {
      const averageMatchScore = ideologyMatchScore / axisCount;
      totalScore += (averageMatchScore - 0.5) * 30;
    }
  }

  // **MODIFIED LOGIC: Factor in Alignment with Electorate's Main Issues** (remains the same as provided)
  if (
    candidate.policyStances &&
    electorateIssueStances &&
    policyQuestionsData
  ) {
    // Added policyQuestionsData check
    let issueMatchScore = 0;
    let issueCount = 0;
    Object.keys(electorateIssueStances).forEach((issueId) => {
      const electorateStance = electorateIssueStances[issueId]; // This is a number (e.g., 0)
      const chosenPolicyStanceString = candidate.policyStances[issueId]; // This is a string (e.g., 'moderate_increase_top')

      let candidateNumericStance = null;
      const policyQuestion = policyQuestionsData.find((q) => q.id === issueId); // Find the full question definition

      if (policyQuestion && chosenPolicyStanceString) {
        const chosenOption = policyQuestion.options.find(
          (opt) => opt.value === chosenPolicyStanceString
        );

        if (chosenOption && chosenOption.axis_effects) {
          // Calculate an average numerical value for the candidate's stance based on axis effects.
          // Assuming axis effects are in a similar scale to IDEOLOGY_DEFINITIONS's idealPoint (-4 to 4).
          const IDEOLOGY_AXES = Object.keys(
            IDEOLOGY_DEFINITIONS.centrist.idealPoint
          ); // Consistent set of axes
          let sumOptionEffects = 0;
          let effectAxisCount = 0;
          IDEOLOGY_AXES.forEach((axis) => {
            // Iterate over all known axes
            if (chosenOption.axis_effects[axis] != null) {
              // Check if this option has an effect on this axis
              sumOptionEffects += chosenOption.axis_effects[axis];
              effectAxisCount++;
            }
          });

          if (effectAxisCount > 0) {
            // Average the effect and scale it to a range comparable with electorateStance (-100 to 100).
            // If average axis effect ranges from -4 to 4, scale it by 25 to get -100 to 100.
            candidateNumericStance = (sumOptionEffects / effectAxisCount) * 25;
          }
        }
      }

      if (candidateNumericStance != null && electorateStance != null) {
        const distance = Math.abs(candidateNumericStance - electorateStance);
        const match = 1 - distance / 200; // Max distance is 200 (-100 to 100 scale)
        issueMatchScore += match;
        issueCount++;
      }
    });

    if (issueCount > 0) {
      const averageIssueMatch = issueMatchScore / issueCount;
      totalScore += (averageIssueMatch - 0.5) * 20;
    }
  }

  // Add some final random variance
  totalScore += getRandomInt(-5, 5);

  // Clamp final score between 0 and 100
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  return { totalScore };
}

/**
 * Normalizes candidate base scores (polling percentages) to sum to 100 across the list.
 * Expects each candidate in candidatesList to have a 'baseScore' property.
 * Adds/updates a 'polling' property on each candidate.
 *
 * @param {Array|Map} candidates - List of candidate objects as an Array or a Map.
 * @param {number} [totalPopulationContext=0] - Total population context (e.g., adult population of the entity).
 * @param {boolean} [isSimulationMode=false] - If true, uses baseScore directly for effectiveWeight (for simulator).
 * @returns {Map<string, object>} A Map of candidate objects with 'polling' percentages, keyed by candidate ID.
 */
export function normalizePolling(
  candidates, // Can be an Array or a Map
  totalPopulationContext = 0,
  isSimulationMode = false
) {
  // 1. Convert the input to an array for consistent processing.
  const candidatesList = Array.isArray(candidates)
    ? candidates
    : Array.from(candidates.values());

  if (!candidatesList || candidatesList.length === 0) {
    return new Map(); // Always return a Map to be consistent
  }

  const safeAdultPopulation = Math.max(1, totalPopulationContext);

  const candidatesWithEffectiveWeights = candidatesList.map((c) => {
    const baseScore = Number(c.baseScore) >= 0 ? Number(c.baseScore) : 1;
    let effectiveWeight;
    if (isSimulationMode) {
      effectiveWeight = baseScore;
    } else {
      const recognizedCount = Math.min(
        c.nameRecognition || 0,
        safeAdultPopulation
      );
      const recognitionFraction =
        safeAdultPopulation > 0 ? recognizedCount / safeAdultPopulation : 0;
      effectiveWeight = baseScore * Math.max(0.01, recognitionFraction);
      effectiveWeight += 0.001;
    }
    return {
      ...c,
      processedBaseScore: baseScore,
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
    if (numCandidates === 0) return new Map();
    const equalShare = Math.floor(100 / numCandidates);
    let remainderPoints = 100 % numCandidates;
    normalizedCandidates = candidatesWithEffectiveWeights.map(
      (candidate, idx) => {
        const pollingValue = equalShare + (idx < remainderPoints ? 1 : 0);
        return { ...candidate, polling: pollingValue };
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

    candidatesWithRawPolling.sort(
      (a, b) =>
        b.remainder - a.remainder ||
        b.effectiveWeight - a.effectiveWeight ||
        b.processedBaseScore - a.processedBaseScore
    );

    for (let i = 0; i < deficit; i++) {
      const candidateToAdjust =
        candidatesWithRawPolling[i % candidatesWithRawPolling.length];
      if (candidateToAdjust) {
        candidateToAdjust.polling++;
      }
    }
    normalizedCandidates = candidatesWithRawPolling;
  }

  // 2. Convert the final array of candidates back into a Map before returning.
  const finalCandidatesMap = new Map(
    normalizedCandidates.map((c) => [c.id, c])
  );
  return finalCandidatesMap;
}
