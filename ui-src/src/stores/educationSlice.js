// src/stores/educationSlice.js

import { 
  createSchoolDistrict, 
  generateStudentCoalitions,
  applyEducationPolicy,
  calculateStudentOutcomes,
  educationOptimizer
} from '../education/educationSystem.js';

const getInitialEducationState = () => ({
  // School districts by city
  schoolDistricts: new Map(),
  
  // Student coalitions across all districts
  studentCoalitions: new Map(),
  
  // Education policies in effect
  activePolicies: [],
  
  // Historical outcomes for tracking
  historicalOutcomes: [],
  
  // Aggregate statistics
  nationalStats: {
    averageGraduationRate: 0,
    averageDropoutRate: 0,
    averageTestScore: 0,
    collegeEnrollmentRate: 0,
    tradeEnrollmentRate: 0,
    educationBudget: 0,
    studentTeacherRatio: 0
  },
  
  // Policy effectiveness tracking
  policyEffectiveness: new Map(),
  
  // Economic impact from education
  economicImpact: {
    totalTaxRevenue: 0,
    socialCosts: 0,
    workforceQuality: 50,
    innovationIndex: 50
  }
});

export const createEducationSlice = (set, get) => ({
  ...getInitialEducationState(),
  
  educationActions: {
    /**
     * Initialize school districts for all cities
     */
    initializeEducationSystem: () => {
      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign?.startingCity) return state;
        
        const districts = new Map();
        const allCoalitions = new Map();
        
        // Create district for the main city
        const mainCity = activeCampaign.startingCity;
        const mainDistrict = createSchoolDistrict(mainCity);
        districts.set(mainDistrict.id, mainDistrict);
        
        // Generate student coalitions
        const cityDemo = {
          medianIncome: mainCity.demographics?.medianIncome || 50000,
          type: mainCity.type || 'urban',
          population: mainCity.population
        };
        
        const coalitions = generateStudentCoalitions(mainDistrict, cityDemo);
        coalitions.forEach((coalition, id) => {
          allCoalitions.set(id, coalition);
        });
        
        mainDistrict.studentCoalitions = coalitions;
        
        // Calculate initial statistics
        const nationalStats = calculateNationalStats(districts, allCoalitions);
        
        return {
          ...state,
          schoolDistricts: districts,
          studentCoalitions: allCoalitions,
          nationalStats
        };
      });
    },
    
    /**
     * Apply an education policy
     */
    implementEducationPolicy: (policy) => {
      set((state) => {
        const { schoolDistricts, studentCoalitions } = state;
        const updatedCoalitions = new Map();
        const outcomes = [];
        
        // Apply policy to all student coalitions
        studentCoalitions.forEach((coalition, id) => {
          const district = schoolDistricts.get(coalition.districtId);
          if (!district) return;
          
          const updatedCoalition = applyEducationPolicy(
            coalition, 
            policy, 
            district.metrics
          );
          
          updatedCoalitions.set(id, updatedCoalition);
        });
        
        // Add policy to active policies
        const activePolicies = [...state.activePolicies, {
          ...policy,
          implementedDate: state.currentDate,
          id: `policy_${Date.now()}`
        }];
        
        // Calculate new outcomes
        updatedCoalitions.forEach((coalition) => {
          const district = schoolDistricts.get(coalition.districtId);
          if (!district) return;
          
          const coalitionOutcomes = calculateStudentOutcomes(
            coalition,
            district.metrics,
            { unemployment: state.economicData?.unemployment || 5 }
          );
          
          outcomes.push({
            coalitionId: coalition.id,
            districtId: coalition.districtId,
            outcomes: coalitionOutcomes,
            date: state.currentDate
          });
        });
        
        // Update national statistics
        const nationalStats = calculateNationalStats(schoolDistricts, updatedCoalitions);
        
        // Calculate economic impact
        const economicImpact = calculateTotalEconomicImpact(outcomes);
        
        // Track policy effectiveness
        const effectiveness = measurePolicyEffectiveness(
          policy,
          state.nationalStats,
          nationalStats
        );
        
        const policyEffectiveness = new Map(state.policyEffectiveness);
        policyEffectiveness.set(policy.id, effectiveness);
        
        return {
          ...state,
          studentCoalitions: updatedCoalitions,
          activePolicies,
          historicalOutcomes: [...state.historicalOutcomes, ...outcomes],
          nationalStats,
          economicImpact,
          policyEffectiveness
        };
      });
      
      // Show toast notification
      get().actions.addToast({
        message: `Education policy "${policy.name}" has been implemented`,
        type: 'success'
      });
    },
    
    /**
     * Update funding for a specific district
     */
    updateDistrictFunding: (districtId, fundingChange) => {
      set((state) => {
        const districts = new Map(state.schoolDistricts);
        const district = districts.get(districtId);
        
        if (!district) return state;
        
        district.funding.perStudent += fundingChange;
        
        // Funding affects various metrics
        const fundingRatio = district.funding.perStudent / 10000; // Normalized to $10k baseline
        district.metrics.teacherQualityIndex = Math.min(100, 
          district.metrics.teacherQualityIndex * fundingRatio);
        district.metrics.infrastructureScore = Math.min(100,
          district.metrics.infrastructureScore * fundingRatio);
        district.metrics.technologyAccess = Math.min(100,
          district.metrics.technologyAccess * fundingRatio);
        
        districts.set(districtId, district);
        
        return {
          ...state,
          schoolDistricts: districts
        };
      });
    },
    
    /**
     * Improve teacher-student ratio in a district
     */
    improveTeacherRatio: (districtId, improvement) => {
      set((state) => {
        const districts = new Map(state.schoolDistricts);
        const district = districts.get(districtId);
        
        if (!district) return state;
        
        district.metrics.teacherStudentRatio = Math.max(10,
          district.metrics.teacherStudentRatio - improvement);
        
        districts.set(districtId, district);
        
        // Recalculate outcomes with improved ratio
        const updatedCoalitions = new Map();
        state.studentCoalitions.forEach((coalition, id) => {
          if (coalition.districtId === districtId) {
            const policy = { type: 'classSize', strength: improvement / 10 };
            const updated = applyEducationPolicy(coalition, policy, district.metrics);
            updatedCoalitions.set(id, updated);
          } else {
            updatedCoalitions.set(id, coalition);
          }
        });
        
        return {
          ...state,
          schoolDistricts: districts,
          studentCoalitions: updatedCoalitions
        };
      });
    },
    
    /**
     * Process monthly education tick
     */
    processEducationMonth: () => {
      set((state) => {
        const { schoolDistricts, studentCoalitions, activePolicies } = state;
        const monthlyOutcomes = [];
        
        // Process each district
        schoolDistricts.forEach((district) => {
          // Apply ongoing policy effects
          activePolicies.forEach(policy => {
            // Policies have diminishing returns over time
            const monthsSinceImplementation = 
              calculateMonthsSince(policy.implementedDate, state.currentDate);
            const effectiveness = Math.max(0.5, 1 - (monthsSinceImplementation * 0.02));
            
            policy.currentEffectiveness = effectiveness;
          });
          
          // Calculate monthly outcomes for each coalition
          district.studentCoalitions.forEach((coalition) => {
            const outcomes = calculateStudentOutcomes(
              coalition,
              district.metrics,
              { unemployment: state.economicData?.unemployment || 5 }
            );
            
            monthlyOutcomes.push({
              coalitionId: coalition.id,
              districtId: district.id,
              outcomes,
              date: state.currentDate
            });
          });
        });
        
        // Update historical data
        const historicalOutcomes = [...state.historicalOutcomes, ...monthlyOutcomes];
        
        // Trim historical data to last 24 months for performance
        if (historicalOutcomes.length > 24 * studentCoalitions.size) {
          historicalOutcomes.splice(0, historicalOutcomes.length - 24 * studentCoalitions.size);
        }
        
        // Recalculate national statistics
        const nationalStats = calculateNationalStats(schoolDistricts, studentCoalitions);
        
        return {
          ...state,
          historicalOutcomes,
          nationalStats
        };
      });
    },
    
    /**
     * Get education report for UI display
     */
    getEducationReport: (districtId = null) => {
      const state = get();
      const { schoolDistricts, studentCoalitions, nationalStats } = state;
      
      if (districtId) {
        const district = schoolDistricts.get(districtId);
        if (!district) return null;
        
        const districtCoalitions = Array.from(studentCoalitions.values())
          .filter(c => c.districtId === districtId);
        
        return {
          district,
          coalitions: districtCoalitions,
          outcomes: calculateDistrictOutcomes(district, districtCoalitions),
          metrics: district.metrics
        };
      }
      
      return {
        nationalStats,
        totalStudents: Array.from(studentCoalitions.values())
          .reduce((sum, c) => sum + c.studentCount, 0),
        totalDistricts: schoolDistricts.size,
        economicImpact: state.economicImpact
      };
    },
    
    /**
     * Batch process multiple districts efficiently
     */
    batchProcessDistricts: (cityDataArray) => {
      set((state) => {
        const newDistricts = new Map(state.schoolDistricts);
        const newCoalitions = new Map(state.studentCoalitions);
        
        // Use optimizer for batch generation
        const districtsToProcess = cityDataArray.map(city => createSchoolDistrict(city));
        const cityDemoMap = new Map(cityDataArray.map(city => [
          city.id,
          {
            medianIncome: city.demographics?.medianIncome || 50000,
            type: city.type || 'urban',
            population: city.population
          }
        ]));
        
        const batchedCoalitions = educationOptimizer.batchGenerateCoalitions(
          districtsToProcess,
          cityDemoMap
        );
        
        // Merge results
        districtsToProcess.forEach(district => {
          newDistricts.set(district.id, district);
          const coalitions = batchedCoalitions.get(district.id);
          coalitions.forEach((coalition, id) => {
            newCoalitions.set(id, coalition);
          });
          district.studentCoalitions = coalitions;
        });
        
        return {
          ...state,
          schoolDistricts: newDistricts,
          studentCoalitions: newCoalitions
        };
      });
    }
  }
});

// Helper functions

const calculateNationalStats = (districts, coalitions) => {
  let totalStudents = 0;
  let totalGraduates = 0;
  let totalDropouts = 0;
  let totalCollegeBound = 0;
  let totalTradeBound = 0;
  let totalTestScore = 0;
  let totalBudget = 0;
  let totalTeachers = 0;
  
  coalitions.forEach(coalition => {
    totalStudents += coalition.studentCount;
    totalTestScore += coalition.currentAcademicScore * coalition.studentCount;
    
    const outcomes = calculateStudentOutcomes(
      coalition,
      { teacherStudentRatio: 20, technologyAccess: 50 } // Default metrics
    );
    
    totalGraduates += outcomes.graduates;
    totalDropouts += outcomes.dropouts;
    totalCollegeBound += outcomes.collegeBound;
    totalTradeBound += outcomes.tradeBound;
  });
  
  districts.forEach(district => {
    totalBudget += district.funding.perStudent * district.totalStudents;
    totalTeachers += Math.floor(district.totalStudents / district.metrics.teacherStudentRatio);
  });
  
  return {
    averageGraduationRate: totalStudents > 0 ? 
      ((totalStudents - totalDropouts) / totalStudents * 100) : 0,
    averageDropoutRate: totalStudents > 0 ? 
      (totalDropouts / totalStudents * 100) : 0,
    averageTestScore: totalStudents > 0 ? 
      (totalTestScore / totalStudents) : 0,
    collegeEnrollmentRate: totalGraduates > 0 ? 
      (totalCollegeBound / totalGraduates * 100) : 0,
    tradeEnrollmentRate: totalGraduates > 0 ? 
      (totalTradeBound / totalGraduates * 100) : 0,
    educationBudget: totalBudget,
    studentTeacherRatio: totalTeachers > 0 ? 
      (totalStudents / totalTeachers) : 20
  };
};

const calculateTotalEconomicImpact = (outcomes) => {
  let totalTaxRevenue = 0;
  let totalSocialCosts = 0;
  
  outcomes.forEach(outcome => {
    if (outcome.outcomes.economicImpact) {
      totalTaxRevenue += outcome.outcomes.economicImpact.taxRevenue || 0;
      totalSocialCosts += outcome.outcomes.economicImpact.socialCosts || 0;
    }
  });
  
  return {
    totalTaxRevenue,
    socialCosts: totalSocialCosts,
    workforceQuality: 50, // TODO: Calculate based on education levels
    innovationIndex: 50   // TODO: Calculate based on college graduation rates
  };
};

const measurePolicyEffectiveness = (policy, beforeStats, afterStats) => {
  const improvements = {
    graduationRate: afterStats.averageGraduationRate - beforeStats.averageGraduationRate,
    dropoutRate: beforeStats.averageDropoutRate - afterStats.averageDropoutRate,
    testScore: afterStats.averageTestScore - beforeStats.averageTestScore,
    collegeEnrollment: afterStats.collegeEnrollmentRate - beforeStats.collegeEnrollmentRate
  };
  
  // Calculate overall effectiveness score
  const effectiveness = 
    (improvements.graduationRate * 0.3) +
    (improvements.dropoutRate * 0.3) +
    (improvements.testScore * 0.2) +
    (improvements.collegeEnrollment * 0.2);
  
  return {
    policy: policy.name,
    improvements,
    effectivenessScore: effectiveness,
    costBenefit: effectiveness / (policy.cost || 1)
  };
};

const calculateDistrictOutcomes = (district, coalitions) => {
  let totalGraduates = 0;
  let totalDropouts = 0;
  
  coalitions.forEach(coalition => {
    const outcomes = calculateStudentOutcomes(coalition, district.metrics);
    totalGraduates += outcomes.graduates;
    totalDropouts += outcomes.dropouts;
  });
  
  const totalStudents = coalitions.reduce((sum, c) => sum + c.studentCount, 0);
  
  return {
    graduationRate: totalStudents > 0 ? (totalGraduates / totalStudents * 100) : 0,
    dropoutRate: totalStudents > 0 ? (totalDropouts / totalStudents * 100) : 0,
    totalStudents,
    totalGraduates,
    totalDropouts
  };
};

const calculateMonthsSince = (startDate, currentDate) => {
  if (!startDate || !currentDate) return 0;
  const months = (currentDate.year - startDate.year) * 12 + 
                 (currentDate.month - startDate.month);
  return Math.max(0, months);
};