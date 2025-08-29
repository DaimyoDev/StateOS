// ui-src/src/simulation/billMerging.js
import { decideAIVote } from './aiVoting';

/**
 * Merges a list of individual AI bill proposals into a smaller list of omnibus bills.
 * @param {Array} proposals - A list of bill proposals from individual AIs.
 * Each proposal should be an object: { proposer, policies, ... }
 * @param {object} context - The necessary game state for vote decisions.
 * @returns {Array} A list of merged bills ready for the proposal process.
 */
const generateMergedBillName = (proposers, policies, allPolicyDefs) => {
  // Determine the dominant policy area from the bill's contents
  const policyAreas = policies.map(p => allPolicyDefs[p.policyId]?.area).filter(Boolean);
  const areaCounts = policyAreas.reduce((acc, area) => {
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});
  const dominantArea = Object.keys(areaCounts).sort((a, b) => areaCounts[b] - areaCounts[a])[0] || 'General';

  const proposerNames = proposers.map(p => p.name.split(' ').pop());
  const primaryProposerName = proposerNames[0];
  const secondaryProposerName = proposerNames.length > 1 ? proposerNames[1] : null;
  const year = new Date().getFullYear();

  const templates = [];

  // Generic templates
  if (proposers.length > 2) {
    templates.push(`The Omnibus Legislative Act of ${year}`);
    templates.push(`The Comprehensive Priorities Act`);
    templates.push(`${dominantArea} Funding and Reform Act`);
  }
  if (secondaryProposerName) {
    templates.push(`The ${primaryProposerName}-${secondaryProposerName} Cooperation Act`);
    templates.push(`The ${primaryProposerName}-${secondaryProposerName} Initiative`);
  }

  // Thematic templates
  templates.push(`The ${dominantArea} Improvement Act`);
  templates.push(`The Community ${dominantArea} Act`);
  templates.push(`A Bill to Support ${dominantArea} Programs`);
  templates.push(`${dominantArea} Revitalization Act of ${year}`);

  // Select a random template
  return templates[Math.floor(Math.random() * templates.length)];
};

// De-duplicates policies and averages their parameters.
const consolidatePolicies = (policies) => {
  const policyMap = new Map();

  policies.forEach(policy => {
    if (!policyMap.has(policy.policyId)) {
      policyMap.set(policy.policyId, { ...policy, count: 1, parameterSums: { ...policy.chosenParameters } });
    } else {
      const existing = policyMap.get(policy.policyId);
      existing.count++;
      for (const key in policy.chosenParameters) {
        if (typeof policy.chosenParameters[key] === 'number') {
          existing.parameterSums[key] = (existing.parameterSums[key] || 0) + policy.chosenParameters[key];
        }
      }
    }
  });

  const consolidated = [];
  for (const [policyId, data] of policyMap.entries()) {
    const averagedParameters = { ...data.parameterSums };
    if (data.count > 1) {
      for (const key in averagedParameters) {
        if (typeof averagedParameters[key] === 'number') {
          averagedParameters[key] /= data.count;
        }
      }
    }
    consolidated.push({ ...data, chosenParameters: averagedParameters, count: undefined, parameterSums: undefined });
  }

  return consolidated;
};


export const mergeAIProposals = (proposals, context) => {
  if (!proposals || proposals.length < 2) {
    return proposals.map(p => ({ ...p, proposers: [p.proposer] }));
  }

  // PERFORMANCE OPTIMIZATION: Flatten government offices once here
  // instead of doing it repeatedly in each decideAIVote call
  let flattenedGovernmentOffices;
  if (Array.isArray(context.governmentOffices)) {
    flattenedGovernmentOffices = context.governmentOffices;
  } else {
    flattenedGovernmentOffices = [];
    const govOffices = context.governmentOffices || {};
    
    // Add national offices
    if (govOffices.national) {
      if (govOffices.national.executive) flattenedGovernmentOffices.push(...govOffices.national.executive);
      if (govOffices.national.legislative?.lowerHouse) flattenedGovernmentOffices.push(...govOffices.national.legislative.lowerHouse);
      if (govOffices.national.legislative?.upperHouse) flattenedGovernmentOffices.push(...govOffices.national.legislative.upperHouse);
      if (govOffices.national.judicial) flattenedGovernmentOffices.push(...govOffices.national.judicial);
    }
    
    // Add state offices
    if (govOffices.states) {
      Object.values(govOffices.states).forEach(state => {
        if (state.executive) flattenedGovernmentOffices.push(...state.executive);
        if (state.legislative?.lowerHouse) flattenedGovernmentOffices.push(...state.legislative.lowerHouse);
        if (state.legislative?.upperHouse) flattenedGovernmentOffices.push(...state.legislative.upperHouse);
        if (state.judicial) flattenedGovernmentOffices.push(...state.judicial);
      });
    }
    
    // Add city offices
    if (govOffices.cities) {
      Object.values(govOffices.cities).forEach(city => {
        if (city.executive) flattenedGovernmentOffices.push(...city.executive);
        if (city.legislative) flattenedGovernmentOffices.push(...city.legislative);
        if (city.judicial) flattenedGovernmentOffices.push(...city.judicial);
      });
    }
    
    flattenedGovernmentOffices = flattenedGovernmentOffices.filter(Boolean);
  }

  const mergedBills = [];
  const mergedIndices = new Set();

  for (let i = 0; i < proposals.length; i++) {
    if (mergedIndices.has(i)) continue;

    let currentMergedBill = {
      proposers: [proposals[i].proposer],
      policies: [...proposals[i].policies],
      name: proposals[i].name,
    };
    mergedIndices.add(i);

    for (let j = i + 1; j < proposals.length; j++) {
      if (mergedIndices.has(j)) continue;

      const proposalB = proposals[j];
      const potentialPolicies = [...currentMergedBill.policies, ...proposalB.policies];
      const potentialProposers = [...currentMergedBill.proposers, proposalB.proposer];

      const tempBill = {
        policies: potentialPolicies,
        proposers: potentialProposers,
      };

      let isCompatible = true;
      for (const proposer of potentialProposers) {
        const vote = decideAIVote(
          proposer,
          tempBill,
          context.cityStats,
          context.activeLegislation,
          context.proposedBills,
          flattenedGovernmentOffices,
          context.allPolicyDefsForLevel
        );

        if (vote !== 'yea') {
          isCompatible = false;
          break;
        }
      }

      if (isCompatible) {
        currentMergedBill.policies = potentialPolicies;
        currentMergedBill.proposers = potentialProposers;
        mergedIndices.add(j);
      }
    }

    // Consolidate duplicate policies by averaging parameters
    if (currentMergedBill.policies.length > 1) {
      currentMergedBill.policies = consolidatePolicies(currentMergedBill.policies);
    }

    // Update the bill name if it was merged
    if (currentMergedBill.proposers.length > 1) {
      currentMergedBill.name = generateMergedBillName(currentMergedBill.proposers, currentMergedBill.policies, context.allPolicyDefsForLevel);
    }

    mergedBills.push(currentMergedBill);
  }

  return mergedBills;
};
