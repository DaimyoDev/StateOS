import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";
import { getRandomInt } from "../utils/generalUtils";

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
  countryId,
  allPartiesInGame,
  policyQuestionsData, // This is POLICY_QUESTIONS
  ideologyData, // This is IDEOLOGY_DEFINITIONS
  electorateIdeologyCenter,
  electorateIdeologySpread,
  electorateIssueStances
) {
  let totalScore = 40;

  // ... (Party Popularity, Attributes, Name Recognition factors remain the same)

  // NEW LOGIC: Factor in Ideological Alignment with Electorate (remains the same as fixed)
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

  // **MODIFIED LOGIC: Factor in Alignment with Electorate's Main Issues**
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
  totalScore += getRandomInt(-5, 5); //

  // Clamp final score between 0 and 100
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  return { totalScore };
}

/**
 * Normalizes candidate base scores (polling percentages) to sum to 100 across the list.
 * Expects each candidate in candidatesList to have a 'baseScore' property.
 * Adds/updates a 'polling' property on each candidate.
 *
 * @param {Array<object>} candidatesList - List of candidate objects, each with a 'baseScore'.
 * @param {number} [totalPopulationContext=0] - Total population context (e.g., adult population of the entity).
 * @param {boolean} [isSimulationMode=false] - NEW: If true, uses baseScore directly for effectiveWeight (for simulator).
 * @returns {Array<object>} Candidates list with 'polling' percentages, sorted by polling descending.
 */
export function normalizePolling(
  candidatesList = [],
  totalPopulationContext = 0,
  isSimulationMode = false
) {
  // Added isSimulationMode
  if (!candidatesList || candidatesList.length === 0) {
    return [];
  }
  const safeAdultPopulation = Math.max(1, totalPopulationContext);

  const candidatesWithEffectiveWeights = candidatesList.map((c) => {
    const baseScore = Number(c.baseScore) >= 0 ? Number(c.baseScore) : 1; // baseScore is typically polling (0-100)

    let effectiveWeight;

    if (isSimulationMode) {
      // For simulator, baseScore is already the desired polling basis, so use it directly.
      effectiveWeight = baseScore;
    } else {
      // For campaign mode, factor in name recognition (original logic)
      const recognizedCount = Math.min(
        c.nameRecognition || 0,
        safeAdultPopulation
      );
      // Avoid division by zero if population is extremely small or zero
      const recognitionFraction =
        safeAdultPopulation > 0 ? recognizedCount / safeAdultPopulation : 0;
      effectiveWeight = baseScore * Math.max(0.01, recognitionFraction); // Ensure effective weight is not 0 due to fraction

      // Add a small constant to ensure all candidates have some weight, preventing totalEffectiveWeight from being zero
      // and providing a floor for smaller fractions.
      effectiveWeight += 0.001; // Small constant to add weight
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

  // This block ensures that if, for some reason, totalEffectiveWeight is still zero (e.g., all candidates have 0 baseScore in sim mode),
  // it distributes polling equally.
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
