// Bill progression utilities for different political systems
import { BILL_PROGRESSION_WORKFLOWS, COMMITTEE_MEMBERSHIP_RULES, COMMITTEE_TYPES } from '../data/legislativeCommittees';
import { addDaysToDate } from '../stores/legislationSlice';

// Get the bill progression workflow for a country's political system and level
export const getBillProgressionWorkflow = (politicalSystemId, level = 'state') => {
  // City level uses simplified city council workflow regardless of political system
  if (level === 'city') {
    return BILL_PROGRESSION_WORKFLOWS.CITY_COUNCIL || BILL_PROGRESSION_WORKFLOWS.PRESIDENTIAL_REPUBLIC;
  }
  
  // State and federal levels use the full political system workflow
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
  const currentStage = bill.currentStage || 'introduction';
  
  // Define the stage progression order based on political system
  const stageOrder = Object.keys(workflow);
  const currentIndex = stageOrder.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) {
    return null; // Bill has completed all stages
  }
  
  const nextStageName = stageOrder[currentIndex + 1];
  const nextStageConfig = workflow[nextStageName];
  
  // Calculate when this stage should be scheduled
  const daysToAdd = Math.floor(Math.random() * (nextStageConfig.duration.max - nextStageConfig.duration.min + 1)) + nextStageConfig.duration.min;
  
  return {
    stage: nextStageName,
    scheduledFor: addDaysToDate(currentDate, daysToAdd),
    requirements: nextStageConfig.requirements,
    step: nextStageConfig.step
  };
};

// Check if a bill meets the requirements for its current stage
export const checkStageRequirements = (bill, stage, legislature, politicalSystemId) => {
  const workflow = getBillProgressionWorkflow(politicalSystemId, bill.level);
  const stageConfig = workflow[stage];
  
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
  
  // Calculate initial stage completion date
  const daysToAdd = Math.floor(Math.random() * (firstStageConfig.duration.max - firstStageConfig.duration.min + 1)) + firstStageConfig.duration.min;
  
  const enhancedBill = {
    ...bill,
    currentStage: firstStage,
    stageScheduledFor: addDaysToDate(currentDate, daysToAdd),
    stageHistory: [{
      stage: firstStage,
      enteredOn: currentDate,
      status: 'in_progress'
    }],
    politicalSystemId
  };

  // For state/national bills, add committee information
  if (bill.level !== 'city') {
    enhancedBill.committeeInfo = assignBillToCommittee(bill, politicalSystemId, currentDate);
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
  
  // Schedule committee vote
  const committeeMeetingDays = Math.floor(Math.random() * 21) + 14; // 14-35 days
  const committeeVoteDate = addDaysToDate(currentDate, committeeMeetingDays);
  
  return {
    assignedCommittee: assignedCommittee,
    committeeName: committeeData.name,
    committeeJurisdiction: committeeData.jurisdiction,
    committeeVoteScheduled: committeeVoteDate,
    committeeStatus: 'under_review',
    assignedDate: currentDate
  };
};

// Process a bill through its current stage
export const processBillStage = (bill, aiVotes, legislature, politicalSystemId, currentDate) => {
  const workflow = getBillProgressionWorkflow(politicalSystemId, bill.level);
  const currentStage = bill.currentStage || 'introduction';
  const stageConfig = workflow[currentStage];
  
  if (!stageConfig) {
    return { ...bill, status: 'error', error: 'Invalid stage configuration' };
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
  
  if (stageConfig.step.includes('vote') || stageConfig.step.includes('approval')) {
    // This stage requires a vote
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
    
    console.log(`[Bill Vote Processing] Bill: ${bill.name}`);
    console.log(`[Bill Vote Processing] Legislature size: ${legislatureSize}, Majority needed: ${majorityNeeded}`);
    console.log(`[Bill Vote Processing] All votes cast:`, bill.councilVotesCast);
    console.log(`[Bill Vote Processing] Vote counts - Yea: ${yeaVotes}, Nay: ${nayVotes}, Abstain: ${abstainVotes}`);
    console.log(`[Bill Vote Processing] Total votes cast: ${allVotes.length}`);
    
    stageResult = yeaVotes >= majorityNeeded ? 'passed' : 'failed';
    
    console.log(`[Bill Vote Processing] Stage result: ${stageResult}`);
  }
  
  // Update stage history
  const updatedStageHistory = [
    ...(bill.stageHistory || []),
    {
      stage: currentStage,
      completedOn: currentDate,
      status: stageResult
    }
  ];
  
  if (stageResult === 'failed') {
    return {
      ...bill,
      status: 'failed',
      stageHistory: updatedStageHistory,
      failureStage: currentStage
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
  
  return {
    ...bill,
    currentStage: nextStage.stage,
    stageScheduledFor: nextStage.scheduledFor,
    stageHistory: updatedStageHistory,
    stageRequirements: nextStage.requirements
  };
};

// Get a human-readable description of what happens in each stage
export const getStageDescription = (stageName, workflow) => {
  const stageConfig = workflow[stageName];
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