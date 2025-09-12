// Bill progression utilities for different political systems
import { BILL_PROGRESSION_WORKFLOWS, COMMITTEE_MEMBERSHIP_RULES, COMMITTEE_TYPES } from '../data/legislativeCommittees';
import { addDaysToDate } from '../stores/legislationSlice';

// Get the bill progression workflow for a country's political system and level
export const getBillProgressionWorkflow = (politicalSystemId, level = 'state') => {
  // City level uses simplified city council workflow regardless of political system
  if (level === 'city') {
    return BILL_PROGRESSION_WORKFLOWS.CITY_COUNCIL || BILL_PROGRESSION_WORKFLOWS.PRESIDENTIAL_REPUBLIC;
  }
  
  // State level uses simplified state workflow
  if (level === 'state') {
    return BILL_PROGRESSION_WORKFLOWS.STATE_LEGISLATURE || BILL_PROGRESSION_WORKFLOWS.PRESIDENTIAL_REPUBLIC;
  }
  
  // National/federal level uses the full political system workflow
  if (!politicalSystemId || !BILL_PROGRESSION_WORKFLOWS[politicalSystemId]) {
    // Fallback to presidential republic if no system found
    return BILL_PROGRESSION_WORKFLOWS.PRESIDENTIAL_REPUBLIC;
  }
  
  return BILL_PROGRESSION_WORKFLOWS[politicalSystemId];
};

// Get committee membership rules for a political system
export const getCommitteeMembershipRules = (politicalSystemId) => {
  if (!politicalSystemId || !COMMITTEE_MEMBERSHIP_RULES[politicalSystemId]) {
    // Fallback to presidential republic if no system found
    return COMMITTEE_MEMBERSHIP_RULES.PRESIDENTIAL_REPUBLIC;
  }
  
  return COMMITTEE_MEMBERSHIP_RULES[politicalSystemId];
};

// Determine the next stage for a bill based on its current stage and political system
export const getNextBillStage = (bill, politicalSystemId, currentDate) => {
  const workflow = getBillProgressionWorkflow(politicalSystemId, bill.level);
  const currentStage = bill.currentStage || 'committee_assignment';
  
  // Find current stage by matching actual step names, not workflow keys
  const workflowEntries = Object.entries(workflow);
  const currentIndex = workflowEntries.findIndex(([key, config]) => config.step === currentStage);
  
  if (currentIndex === -1 || currentIndex >= workflowEntries.length - 1) {
    return null; // Bill has completed all stages
  }
  
  const [nextStageKey, nextStageConfig] = workflowEntries[currentIndex + 1];
  const actualNextStageName = nextStageConfig.step;
  
  // Calculate when this stage should be scheduled
  const daysToAdd = Math.floor(Math.random() * (nextStageConfig.duration.max - nextStageConfig.duration.min + 1)) + nextStageConfig.duration.min;
  
  return {
    stage: actualNextStageName,
    scheduledFor: addDaysToDate(currentDate, daysToAdd),
    requirements: nextStageConfig.requirements,
    step: nextStageConfig.step
  };
};

// Check if a bill meets the requirements for its current stage
export const checkStageRequirements = (bill, stage, legislature, politicalSystemId) => {
  const workflow = getBillProgressionWorkflow(politicalSystemId, bill.level);
  
  // Find stage config by matching step name
  const stageConfig = Object.values(workflow).find(config => config.step === stage);
  
  if (!stageConfig) return false;
  
  // Basic requirement checking - this can be expanded
  const requirements = stageConfig.requirements;
  
  // For now, we'll assume basic requirements are met
  // In the future, this could check for specific committee assignments,
  // required hearings, etc.
  return requirements.every(req => {
    switch (req) {
      case 'sponsor_member':
        return bill.proposerId !== null;
      case 'committee_majority':
        // For now, assume we have committee support
        // This would need actual committee data to implement properly
        return true;
      case 'bicameral_approval':
        // Check if we need both chambers to approve
        return legislature?.upperHouse?.length > 0 ? bill.upperHouseApproval : true;
      default:
        return true;
    }
  });
};

// Initialize a bill with the proper stages for its political system
export const initializeBillStages = (bill, politicalSystemId, currentDate) => {
  const workflow = getBillProgressionWorkflow(politicalSystemId, bill.level);
  const firstStage = Object.keys(workflow)[0];
  const firstStageConfig = workflow[firstStage];
  
  // Use the actual step name, not the workflow key
  const actualStageName = firstStageConfig.step;
  
  // Calculate initial stage completion date
  const daysToAdd = Math.floor(Math.random() * (firstStageConfig.duration.max - firstStageConfig.duration.min + 1)) + firstStageConfig.duration.min;
  
  const enhancedBill = {
    ...bill,
    currentStage: actualStageName,
    stageScheduledFor: addDaysToDate(currentDate, daysToAdd),
    stageHistory: [{
      stage: actualStageName,
      enteredOn: currentDate,
      status: 'in_progress'
    }],
    politicalSystemId
  };

  // Add level-specific vote information
  if (bill.level === 'city') {
    // City bills get council vote info - schedule for end of full process
    // Calculate total time: proposal_submitted (1-3) + public_comment_period (7-14) days
    const proposalDays = daysToAdd; // Current stage duration (1-3 days)
    const publicCommentDays = Math.floor(Math.random() * 8) + 7; // 7-14 days for public comment
    const totalDaysUntilVote = proposalDays + publicCommentDays;
    
    const councilVoteDate = addDaysToDate(currentDate, totalDaysUntilVote);
    enhancedBill.councilVoteInfo = {
      councilVoteScheduled: councilVoteDate,
      councilType: 'City Council',
      voteType: 'council_vote',
      jurisdiction: ['local_ordinances', 'city_budget', 'zoning'],
      voteStatus: 'scheduled'
    };
    
    // Only use council vote date for actual council vote stage, not earlier stages
    const isCityVotingStage = actualStageName === 'council_vote';
    
    if (isCityVotingStage) {
      enhancedBill.stageScheduledFor = councilVoteDate;
    }
  } else {
    // State/national bills get committee information
    enhancedBill.committeeInfo = assignBillToCommittee(bill, politicalSystemId, currentDate);
    
    // Only use committee vote date for actual voting stages, not assignment
    const isCommitteeVotingStage = actualStageName && (
      actualStageName === 'committee_markup' ||
      actualStageName === 'committee_review'
    );
    
    // committee_assignment should use its own duration, not committee vote date
    if (isCommitteeVotingStage && enhancedBill.committeeInfo?.committeeVoteScheduled) {
      enhancedBill.stageScheduledFor = enhancedBill.committeeInfo.committeeVoteScheduled;
    }
  }

  return enhancedBill;
};

// Assign a bill to appropriate committee based on policy content
const assignBillToCommittee = (bill, politicalSystemId, currentDate) => {
  
  // Determine appropriate committee based on bill's policies
  const primaryPolicy = bill.policies?.[0];
  let assignedCommittee = 'JUDICIARY'; // Default fallback
  
  if (primaryPolicy?.policyId) {
    // Map policy types to committees
    const policyToCommitteeMap = {
      // Education policies
      'education': 'EDUCATION',
      'school': 'EDUCATION',
      'teacher': 'EDUCATION',
      'student': 'EDUCATION',
      
      // Healthcare policies  
      'health': 'HEALTH',
      'medical': 'HEALTH',
      'hospital': 'HEALTH',
      'healthcare': 'HEALTH',
      
      // Economic/Finance policies
      'tax': 'FINANCE',
      'budget': 'FINANCE',
      'economic': 'FINANCE',
      'finance': 'FINANCE',
      'debt': 'FINANCE',
      
      // Commerce/Business
      'business': 'COMMERCE',
      'trade': 'COMMERCE',
      'commerce': 'COMMERCE',
      'regulation': 'COMMERCE',
      
      // Environment
      'environment': 'ENVIRONMENT',
      'climate': 'ENVIRONMENT',
      'energy': 'ENVIRONMENT',
      'pollution': 'ENVIRONMENT',
      
      // Agriculture
      'agriculture': 'AGRICULTURE',
      'farm': 'AGRICULTURE',
      'food': 'AGRICULTURE',
      
      // Transportation
      'transport': 'TRANSPORTATION',
      'highway': 'TRANSPORTATION',
      'transit': 'TRANSPORTATION',
      'infrastructure': 'TRANSPORTATION',
      
      // Defense/Security
      'defense': 'DEFENSE',
      'military': 'DEFENSE',
      'security': 'DEFENSE',
      'police': 'DEFENSE'
    };
    
    // Check policy ID and name for committee assignment
    const policyText = `${primaryPolicy.policyId} ${primaryPolicy.policyName || ''}`.toLowerCase();
    
    for (const [keyword, committee] of Object.entries(policyToCommitteeMap)) {
      if (policyText.includes(keyword)) {
        assignedCommittee = committee;
        break;
      }
    }
  }
  
  const committeeData = COMMITTEE_TYPES.STANDING[assignedCommittee] || COMMITTEE_TYPES.STANDING.JUDICIARY;
  
  // Don't schedule committee vote yet - this happens when advancing to committee_markup
  return {
    assignedCommittee: assignedCommittee,
    committeeName: committeeData.name,
    committeeJurisdiction: committeeData.jurisdiction,
    committeeVoteScheduled: null, // Will be scheduled when advancing to committee_markup
    committeeStatus: 'under_review',
    assignedDate: currentDate
  };
};

// Map current stage to appropriate status
const getStatusFromStage = (stage, level) => {
  if (!stage) return 'unknown';
  
  // City level stages
  if (level === 'city') {
    switch (stage) {
      case 'proposal_submitted': return 'under_review';
      case 'public_comment_period': return 'under_review';
      case 'council_vote': return 'pending_vote';
      default: return 'under_review';
    }
  }
  
  // State/National level stages
  switch (stage) {
    case 'committee_assignment': return 'in_committee';
    case 'committee_markup': return 'in_committee';
    case 'committee_review': return 'in_committee';
    case 'committee_vote': return 'pending_vote';
    case 'floor_consideration': return 'floor_consideration';
    case 'floor_debate': return 'floor_consideration';
    case 'floor_vote': return 'pending_vote';
    case 'second_chamber': return 'second_chamber';
    case 'gubernatorial_action': return 'awaiting_signature';
    case 'presidential_action': return 'awaiting_signature';
    default: return 'in_progress';
  }
};

// Process a bill through its current stage
export const processBillStage = (bill, aiVotes, legislature, politicalSystemId, currentDate) => {
  console.log(`[BILL STAGE PROCESSING] Processing "${bill.name}" at stage "${bill.currentStage}" with ${Object.keys(aiVotes || {}).length} votes`);
  
  const workflow = getBillProgressionWorkflow(politicalSystemId, bill.level);
  const currentStage = bill.currentStage || 'committee_assignment';
  
  // Find stage config by matching step name
  const stageConfig = Object.values(workflow).find(config => config.step === currentStage);
  
  if (!stageConfig) {
    return { ...bill, status: 'error', error: `Invalid stage configuration for stage: ${currentStage}` };
  }
  
  // Check if requirements are met
  if (!checkStageRequirements(bill, currentStage, legislature, politicalSystemId)) {
    return {
      ...bill,
      status: 'stalled',
      stalledReason: 'Requirements not met for current stage'
    };
  }
  
  // Determine if the stage passes based on the step type and voting
  let stageResult = 'passed';
  
  // Define which stages actually require voting
  const actualVotingStages = [
    'committee_vote',
    'committee_markup', // This is the actual committee voting stage
    'council_vote',
    'floor_vote', // Actual floor voting stage
    'floor_consideration' // Floor consideration requires a floor vote
  ];
  
  // Non-voting stages that should auto-advance
  const nonVotingStages = [
    'committee_assignment',
    'proposal_submitted', 
    'public_comment_period'
  ];
  
  const isVotingStage = actualVotingStages.includes(stageConfig.step);
  const isNonVotingStage = nonVotingStages.includes(stageConfig.step);
  
  if (isNonVotingStage) {
    // Non-voting stages automatically pass
    console.log(`[BILL PROGRESSION] Auto-advancing "${bill.name}" through non-voting stage: ${currentStage}`);
    stageResult = 'passed';
  } else if (isVotingStage) {
    // This stage requires a vote
    // Check if any votes have actually been cast (including votes passed as aiVotes parameter)
    const existingVotes = Object.values(bill.councilVotesCast || {});
    const newVotes = Object.values(aiVotes || {});
    const totalVotesCast = existingVotes.length + newVotes.length;
    
    if (totalVotesCast === 0) {
      console.log(`[ERROR] No votes cast for voting stage "${currentStage}" on bill "${bill.name}"`);
      return {
        ...bill,
        status: 'error',
        error: `No votes cast for voting stage: ${currentStage}`
      };
    }
    
    let legislatureSize = 0;
    
    // Check if this is a committee stage
    const isCommitteeStage = currentStage.includes('committee') || 
                           currentStage === 'committee_assignment' ||
                           currentStage === 'committee_markup' ||
                           currentStage === 'committee_review';
    
    if (isCommitteeStage) {
      // For committee votes, use the number of people who actually voted
      legislatureSize = Object.keys(bill.councilVotesCast || {}).length;
    } else {
      // For full legislature votes, calculate legislature size based on the level
      if (bill.level === 'city') {
        // For city bills, count the members array directly
        legislatureSize = legislature?.members?.length || 0;
      } else {
        // For state/national bills, use upper/lower house structure
        legislatureSize = (legislature?.lowerHouse?.length || 0) + (legislature?.upperHouse?.length || 0);
      }
    }
    
    const majorityNeeded = Math.floor(legislatureSize / 2) + 1;
    
    // Count all votes from the bill's councilVotesCast (includes both AI and player votes)
    const allVotes = Object.values(bill.councilVotesCast || {});
    const yeaVotes = allVotes.filter(v => 
      v === 'yea' || v === 'YEA' || v === 'YEA_PLAYER'
    ).length;
    const nayVotes = allVotes.filter(v => 
      v === 'nay' || v === 'NAY' || v === 'NAY_PLAYER'
    ).length;
    const abstainVotes = allVotes.filter(v => 
      v === 'abstain' || v === 'ABSTAIN' || v === 'ABSTAIN_PLAYER'
    ).length;
    
    stageResult = yeaVotes >= majorityNeeded ? 'passed' : 'failed';
  }
  
  // Update stage history - find and update the current stage entry instead of adding a new one
  const existingStageHistory = bill.stageHistory || [];
  
  // Find the most recent entry for the current stage that's still in progress
  const currentStageIndex = existingStageHistory.findIndex(entry => 
    entry.stage === currentStage && 
    entry.status === 'in_progress' && 
    !entry.completedOn
  );
  
  let updatedStageHistory;
  if (currentStageIndex !== -1) {
    // Update the existing in-progress entry
    updatedStageHistory = existingStageHistory.map((entry, index) => 
      index === currentStageIndex 
        ? { ...entry, completedOn: currentDate, status: stageResult }
        : entry
    );
  } else {
    // Fallback: add new entry if somehow not found
    updatedStageHistory = [
      ...existingStageHistory,
      {
        stage: currentStage,
        completedOn: currentDate,
        status: stageResult
      }
    ];
  }
  
  if (stageResult === 'failed') {
    // Calculate vote tallies if this was a voting stage
    let voteData = {};
    const votingStages = [
      'committee_vote',
      'committee_markup', // Committee markup involves voting
      'council_vote',
      'floor_vote',
      'floor_consideration'
    ];
    
    if (votingStages.includes(stageConfig.step) || stageConfig.step.includes('vote') || stageConfig.step.includes('approval')) {
      const allVotes = Object.values(bill.councilVotesCast || {});
      voteData = {
        yeaVotes: allVotes.filter(v => v === 'yea' || v === 'YEA' || v === 'YEA_PLAYER').length,
        nayVotes: allVotes.filter(v => v === 'nay' || v === 'NAY' || v === 'NAY_PLAYER').length,
        abstainVotes: allVotes.filter(v => v === 'abstain' || v === 'ABSTAIN' || v === 'ABSTAIN_PLAYER').length
      };
      
      console.log(`[VOTE TALLY] "${bill.name}" failed at ${stageConfig.step} with votes: ${voteData.yeaVotes} Yea, ${voteData.nayVotes} Nay, ${voteData.abstainVotes} Abstain`);
    }

    return {
      ...bill,
      status: 'failed',
      stageHistory: updatedStageHistory,
      failureStage: currentStage,
      dateFailed: currentDate,
      ...voteData
    };
  }
  
  // Move to next stage
  const nextStage = getNextBillStage(bill, politicalSystemId, currentDate);
  
  if (!nextStage) {
    // Bill has completed all stages successfully
    return {
      ...bill,
      status: 'passed',
      stageHistory: updatedStageHistory,
      datePassed: currentDate
    };
  }
  
  // Update stage scheduling based on vote info
  let finalStageScheduledFor = nextStage.scheduledFor;
  let floorVoteInfo = bill.floorVoteInfo;
  let updatedCommitteeInfo = bill.committeeInfo; // Initialize early for use in scheduling
  
  // Check stage types for scheduling logic
  const isGubernatorialStage = nextStage.stage === 'gubernatorial_action';
  const isFloorStage = nextStage.stage === 'floor_consideration';
  
  // For city bills moving to voting stages, use council vote info
  if (bill.level === 'city') {
    const isCityVotingStage = nextStage.stage === 'council_vote';
    
    if (isCityVotingStage && bill.councilVoteInfo?.councilVoteScheduled) {
      finalStageScheduledFor = bill.councilVoteInfo.councilVoteScheduled;
    }
  } else {
    // For state/national bills moving to committee stages, handle committee scheduling
    const isCommitteeStage = nextStage.stage && (
      nextStage.stage.includes('committee') || 
      nextStage.stage === 'committee_assignment' ||
      nextStage.stage === 'committee_markup' ||
      nextStage.stage === 'committee_review'
    );
    
    if (isCommitteeStage) {
      if (nextStage.stage === 'committee_markup') {
        // When advancing TO committee_markup, schedule the committee vote
        console.log(`[DEBUG] Bill "${bill.name}" advancing to committee_markup. Current committee vote scheduled: ${bill.committeeInfo?.committeeVoteScheduled ? 'YES' : 'NO'}`);
        
        if (!bill.committeeInfo?.committeeVoteScheduled) {
          // Schedule committee vote if not already scheduled
          const committeeMeetingDays = Math.floor(Math.random() * 21) + 14; // 14-35 days
          const committeeVoteDate = addDaysToDate(currentDate, committeeMeetingDays);
          
          console.log(`[COMMITTEE VOTE SCHEDULING] Bill "${bill.name}" advancing to committee markup on ${currentDate.month}/${currentDate.day}/${currentDate.year}`);
          console.log(`[COMMITTEE VOTE SCHEDULING] Committee vote scheduled for ${committeeVoteDate.month}/${committeeVoteDate.day}/${committeeVoteDate.year} (in ${committeeMeetingDays} days)`);
          
          // Update committee info with vote date
          updatedCommitteeInfo = {
            ...bill.committeeInfo,
            committeeVoteScheduled: committeeVoteDate
          };
          
          finalStageScheduledFor = committeeVoteDate;
        } else {
          // Use existing committee vote date
          finalStageScheduledFor = bill.committeeInfo.committeeVoteScheduled;
        }
      } else if (nextStage.stage === 'committee_assignment') {
        // committee_assignment is non-voting, so use calculated duration
        finalStageScheduledFor = nextStage.scheduledFor;
      }
    }
    
    // For floor consideration stage, schedule a floor vote
    if (isFloorStage) {
      // Schedule floor vote 7-21 days after advancing to floor consideration
      const floorVoteDays = Math.floor(Math.random() * 15) + 7; // 7-21 days
      const floorVoteDate = addDaysToDate(currentDate, floorVoteDays);
      
      console.log(`[FLOOR VOTE SCHEDULING] Bill "${bill.name}" advancing to floor consideration on ${currentDate.month}/${currentDate.day}/${currentDate.year}`);
      console.log(`[FLOOR VOTE SCHEDULING] Floor vote scheduled for ${floorVoteDate.month}/${floorVoteDate.day}/${floorVoteDate.year} (in ${floorVoteDays} days)`);
      
      floorVoteInfo = {
        floorVoteScheduled: floorVoteDate,
        floorVoteType: bill.level === 'state' ? 'state_legislature' : 'congress',
        voteStatus: 'scheduled'
      };
      
      // The floor consideration stage should wait until the floor vote date
      finalStageScheduledFor = floorVoteDate;
    }
    
    // For gubernatorial action stage, schedule the governor's decision
    if (isGubernatorialStage) {
      // Schedule governor's decision 3-10 days after bill reaches this stage
      const decisionDays = Math.floor(Math.random() * 8) + 3; // 3-10 days
      const decisionDate = addDaysToDate(currentDate, decisionDays);
      
      console.log(`[GUBERNATORIAL SCHEDULING] Bill "${bill.name}" sent to governor on ${currentDate.month}/${currentDate.day}/${currentDate.year}`);
      console.log(`[GUBERNATORIAL SCHEDULING] Governor decision scheduled for ${decisionDate.month}/${decisionDate.day}/${decisionDate.year} (in ${decisionDays} days)`);
      
      // Add gubernatorial decision info to bill
      const gubernatorialInfo = {
        decisionScheduled: decisionDate,
        status: 'under_review',
        sentToGovernor: currentDate
      };
      
      // Update the final result to include gubernatorial info
      finalStageScheduledFor = decisionDate;
      
      // We'll add this to the result below
    }
  }

  // Add new stage entry for the next stage
  const finalStageHistory = [
    ...updatedStageHistory,
    {
      stage: nextStage.stage,
      enteredOn: currentDate,
      status: 'in_progress'
    }
  ];

  // Update committee status if bill is moving past committee stage
  // updatedCommitteeInfo already declared above
  const wasCommitteeStage = currentStage && (
    currentStage.includes('committee') || 
    currentStage === 'committee_assignment' ||
    currentStage === 'committee_markup' ||
    currentStage === 'committee_review'
  );
  const isLeavingCommittee = wasCommitteeStage && !nextStage.stage.includes('committee');
  
  if (isLeavingCommittee && bill.committeeInfo) {
    console.log(`[COMMITTEE] "${bill.name}" committee status: ${stageResult === 'passed' ? 'passed' : 'completed'}`);
    updatedCommitteeInfo = {
      ...updatedCommitteeInfo, // Preserve any previous updates (like scheduled vote date)
      committeeStatus: stageResult === 'passed' ? 'passed' : 'completed',
      committeeVoteCompleted: currentDate
    };
  }

  const result = {
    ...bill,
    currentStage: nextStage.stage,
    status: getStatusFromStage(nextStage.stage, bill.level),
    stageScheduledFor: finalStageScheduledFor,
    stageHistory: finalStageHistory,
    stageRequirements: nextStage.requirements,
    committeeInfo: updatedCommitteeInfo,
    floorVoteInfo: floorVoteInfo
  };
  
  // Add gubernatorial info if advancing to gubernatorial stage
  if (isGubernatorialStage) {
    result.gubernatorialInfo = {
      decisionScheduled: finalStageScheduledFor,
      status: 'under_review',
      sentToGovernor: currentDate
    };
  }
  
  return result;
};

// Get a human-readable description of what happens in each stage
export const getStageDescription = (stageName, workflow) => {
  // Find stage config by matching step name
  const stageConfig = Object.values(workflow).find(config => config.step === stageName);
  if (!stageConfig) return 'Unknown stage';
  
  const descriptions = {
    // City council stages
    proposal_submitted: 'Bill is officially submitted to the city council',
    public_comment_period: 'Public review and comment period for community input',
    council_vote: 'City council votes on the ordinance',
    
    // State/federal committee stages  
    committee_assignment: 'Bill is assigned to the appropriate committee for review',
    committee_markup: 'Committee reviews, amends, and marks up the bill',
    committee_vote: 'Committee votes on whether to advance the bill',
    floor_consideration: 'Full legislature considers the bill on the floor',
    floor_debate: 'Legislative debate on the merits of the bill',
    floor_vote: 'Full legislative vote on the bill',
    second_chamber: 'Bill moves to the other chamber for consideration',
    conference_committee: 'Conference committee resolves differences between chambers',
    presidential_signature: 'Bill awaits presidential signature or veto',
    gubernatorial_action: 'Bill awaits governor signature or veto',
    veto_override: 'Legislature attempts to override presidential veto',
    royal_assent: 'Bill awaits ceremonial royal approval',
    first_reading: 'Bill is formally introduced and read for the first time',
    committee_review: 'Committee conducts detailed review of the bill',
    report_stage: 'Committee reports back to the full legislature',
    third_reading: 'Final reading and debate before final vote',
    automatic_assent: 'Bill receives automatic approval',
    federal_consultation: 'Federal and regional governments coordinate on the bill'
  };
  
  return descriptions[stageConfig.step] || `Bill undergoes ${stageConfig.step.replace(/_/g, ' ')}`;
};

export default {
  getBillProgressionWorkflow,
  getCommitteeMembershipRules,
  getNextBillStage,
  checkStageRequirements,
  initializeBillStages,
  processBillStage,
  getStageDescription
};