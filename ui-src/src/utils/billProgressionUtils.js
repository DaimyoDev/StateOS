// Bill progression utilities for different political systems
import { BILL_PROGRESSION_WORKFLOWS, COMMITTEE_MEMBERSHIP_RULES } from '../data/legislativeCommittees';
import { addDaysToDate } from '../stores/legislationSlice';

// Get the bill progression workflow for a country's political system
export const getBillProgressionWorkflow = (politicalSystemId, level = 'state') => {
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
  
  return {
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
    const legislatureSize = (legislature?.lowerHouse?.length || 0) + (legislature?.upperHouse?.length || 0);
    const majorityNeeded = Math.floor(legislatureSize / 2) + 1;
    
    const yeaVotes = Object.values(aiVotes || {}).filter(v => v === 'yea' || v === 'YEA').length;
    stageResult = yeaVotes >= majorityNeeded ? 'passed' : 'failed';
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