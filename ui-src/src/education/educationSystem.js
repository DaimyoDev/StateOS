// src/education/educationSystem.js

import { getRandomInt, getRandomElement } from "../utils/core.js";

/**
 * Education System with Student Coalitions
 * Tracks different student groups and their educational outcomes based on policies
 */

// Student coalition templates based on SES and cultural backgrounds
export const STUDENT_COALITION_TEMPLATES = [
  {
    id: 'affluent_academic',
    name: 'Affluent Academic Achievers',
    ses: 'high',
    culture: 'achievement_oriented',
    baseAcademicScore: 85,
    collegeAspiration: 0.90,
    tradeInterest: 0.05,
    dropoutRisk: 0.02,
    careerPotential: ['medicine', 'law', 'engineering', 'business', 'research'],
    policyResponsiveness: {
      funding: 0.3,
      teacherTraining: 0.4,
      classSize: 0.5,
      curriculum: 0.6,
      vocationalPrograms: 0.1,
      tutoring: 0.3,
      technology: 0.7
    },
    baseSize: 0.15
  },
  {
    id: 'middle_class_strivers',
    name: 'Middle Class Strivers',
    ses: 'middle',
    culture: 'balanced',
    baseAcademicScore: 72,
    collegeAspiration: 0.65,
    tradeInterest: 0.20,
    dropoutRisk: 0.08,
    careerPotential: ['teaching', 'nursing', 'accounting', 'IT', 'management'],
    policyResponsiveness: {
      funding: 0.5,
      teacherTraining: 0.5,
      classSize: 0.6,
      curriculum: 0.5,
      vocationalPrograms: 0.4,
      tutoring: 0.6,
      technology: 0.5
    },
    baseSize: 0.35
  },
  {
    id: 'working_class_practical',
    name: 'Working Class Practical',
    ses: 'low',
    culture: 'practical_skills',
    baseAcademicScore: 65,
    collegeAspiration: 0.30,
    tradeInterest: 0.45,
    dropoutRisk: 0.15,
    careerPotential: ['construction', 'automotive', 'culinary', 'retail', 'manufacturing'],
    policyResponsiveness: {
      funding: 0.6,
      teacherTraining: 0.4,
      classSize: 0.5,
      curriculum: 0.3,
      vocationalPrograms: 0.8,
      tutoring: 0.5,
      technology: 0.3
    },
    baseSize: 0.25
  },
  {
    id: 'immigrant_aspirational',
    name: 'Immigrant Aspirational',
    ses: 'low_to_middle',
    culture: 'immigrant_first_gen',
    baseAcademicScore: 68,
    collegeAspiration: 0.75,
    tradeInterest: 0.15,
    dropoutRisk: 0.10,
    careerPotential: ['healthcare', 'engineering', 'small_business', 'hospitality', 'education'],
    policyResponsiveness: {
      funding: 0.5,
      teacherTraining: 0.6,
      classSize: 0.7,
      curriculum: 0.4,
      vocationalPrograms: 0.3,
      tutoring: 0.8,
      technology: 0.4,
      esl_programs: 0.9
    },
    baseSize: 0.12
  },
  {
    id: 'at_risk_disengaged',
    name: 'At-Risk Disengaged',
    ses: 'very_low',
    culture: 'survival_focused',
    baseAcademicScore: 52,
    collegeAspiration: 0.15,
    tradeInterest: 0.25,
    dropoutRisk: 0.35,
    careerPotential: ['service', 'logistics', 'entry_level', 'gig_economy'],
    policyResponsiveness: {
      funding: 0.7,
      teacherTraining: 0.3,
      classSize: 0.4,
      curriculum: 0.2,
      vocationalPrograms: 0.5,
      tutoring: 0.7,
      technology: 0.2,
      mentorship: 0.9,
      meal_programs: 0.8
    },
    baseSize: 0.08
  },
  {
    id: 'rural_traditional',
    name: 'Rural Traditional',
    ses: 'low_to_middle',
    culture: 'rural_community',
    baseAcademicScore: 64,
    collegeAspiration: 0.35,
    tradeInterest: 0.40,
    dropoutRisk: 0.12,
    careerPotential: ['agriculture', 'trades', 'military', 'local_business', 'public_service'],
    policyResponsiveness: {
      funding: 0.6,
      teacherTraining: 0.4,
      classSize: 0.4,
      curriculum: 0.3,
      vocationalPrograms: 0.7,
      tutoring: 0.3,
      technology: 0.4,
      agricultural_programs: 0.9
    },
    baseSize: 0.05
  }
];

/**
 * School District entity structure
 */
export const createSchoolDistrict = (cityData) => {
  const districtId = `district_${cityData.id}_${Date.now()}`;
  
  return {
    id: districtId,
    cityId: cityData.id,
    name: `${cityData.name} School District`,
    
    // Basic stats
    totalStudents: Math.floor(cityData.population * 0.18), // ~18% of population are school-age
    schools: Math.ceil(cityData.population / 10000), // 1 school per 10k population
    
    // Resources
    funding: {
      perStudent: 8000, // Base funding per student
      federal: 0.10,    // Percentage from federal
      state: 0.45,      // Percentage from state
      local: 0.45       // Percentage from local taxes
    },
    
    // Quality metrics
    metrics: {
      teacherStudentRatio: 20,
      teacherQualityIndex: 50, // 0-100 scale
      infrastructureScore: 50,  // 0-100 scale
      technologyAccess: 50,     // 0-100 scale
      curriculumQuality: 50     // 0-100 scale
    },
    
    // Student coalitions (to be generated)
    studentCoalitions: new Map(),
    
    // Outcomes tracking
    outcomes: {
      dropoutRate: 0,
      graduationRate: 0,
      collegeEnrollment: 0,
      tradeEnrollment: 0,
      employmentRate: 0,
      averageTestScore: 0
    },
    
    // Policy effects
    activePolicies: [],
    policyEffectiveness: new Map()
  };
};

/**
 * Generate student coalitions for a school district
 */
export const generateStudentCoalitions = (district, cityDemographics) => {
  const coalitions = new Map();
  const totalStudents = district.totalStudents;
  
  // Adjust coalition sizes based on city demographics
  const adjustedTemplates = STUDENT_COALITION_TEMPLATES.map(template => {
    let sizeMultiplier = 1.0;
    
    // Adjust based on city wealth
    if (cityDemographics.medianIncome) {
      if (cityDemographics.medianIncome > 70000 && template.ses === 'high') {
        sizeMultiplier *= 1.5;
      } else if (cityDemographics.medianIncome < 40000 && template.ses === 'very_low') {
        sizeMultiplier *= 1.5;
      }
    }
    
    // Adjust based on city type
    if (cityDemographics.type === 'rural' && template.culture === 'rural_community') {
      sizeMultiplier *= 2.0;
    } else if (cityDemographics.type === 'urban' && template.culture === 'immigrant_first_gen') {
      sizeMultiplier *= 1.3;
    }
    
    return {
      ...template,
      adjustedSize: template.baseSize * sizeMultiplier
    };
  });
  
  // Normalize sizes to sum to 1
  const totalSize = adjustedTemplates.reduce((sum, t) => sum + t.adjustedSize, 0);
  
  adjustedTemplates.forEach(template => {
    const coalition = {
      id: `${district.id}_${template.id}`,
      districtId: district.id,
      templateId: template.id,
      name: template.name,
      
      // Demographics
      ses: template.ses,
      culture: template.culture,
      studentCount: Math.floor(totalStudents * (template.adjustedSize / totalSize)),
      
      // Academic metrics
      currentAcademicScore: template.baseAcademicScore,
      baseAcademicScore: template.baseAcademicScore,
      
      // Aspirations (can be modified by policies)
      collegeAspiration: template.collegeAspiration,
      tradeInterest: template.tradeInterest,
      dropoutRisk: template.dropoutRisk,
      
      // Career paths
      careerPotential: template.careerPotential,
      
      // Policy responsiveness
      policyResponsiveness: template.policyResponsiveness,
      
      // Current outcomes
      outcomes: {
        dropouts: 0,
        graduates: 0,
        collegeBound: 0,
        tradeBound: 0,
        employed: 0
      },
      
      // Satisfaction and engagement
      satisfaction: 50,
      engagement: 50,
      parentInvolvement: template.ses === 'high' ? 80 : 
                        template.ses === 'middle' ? 60 : 40
    };
    
    coalitions.set(coalition.id, coalition);
  });
  
  return coalitions;
};

/**
 * Calculate policy effects on student coalitions
 */
export const applyEducationPolicy = (coalition, policy, districtMetrics) => {
  const responsiveness = coalition.policyResponsiveness[policy.type] || 0.5;
  const effect = policy.strength * responsiveness;
  
  const updatedCoalition = { ...coalition };
  
  switch(policy.type) {
    case 'funding':
      // More funding helps all groups but especially low SES
      updatedCoalition.currentAcademicScore += effect * 5;
      updatedCoalition.dropoutRisk *= (1 - effect * 0.1);
      break;
      
    case 'vocationalPrograms':
      // Vocational programs increase trade interest and reduce dropout
      updatedCoalition.tradeInterest = Math.min(1, updatedCoalition.tradeInterest + effect * 0.15);
      updatedCoalition.dropoutRisk *= (1 - effect * 0.15);
      break;
      
    case 'classSize':
      // Smaller classes improve academic scores and engagement
      const classEffect = (30 - districtMetrics.teacherStudentRatio) / 30;
      updatedCoalition.currentAcademicScore += classEffect * effect * 8;
      updatedCoalition.engagement += classEffect * effect * 10;
      break;
      
    case 'tutoring':
      // Tutoring programs especially help struggling students
      if (coalition.ses === 'low' || coalition.ses === 'very_low') {
        updatedCoalition.currentAcademicScore += effect * 10;
        updatedCoalition.collegeAspiration += effect * 0.1;
      } else {
        updatedCoalition.currentAcademicScore += effect * 5;
      }
      break;
      
    case 'technology':
      // Technology access improves scores for tech-savvy groups
      updatedCoalition.currentAcademicScore += effect * 4;
      if (coalition.culture === 'achievement_oriented') {
        updatedCoalition.currentAcademicScore += effect * 3;
      }
      break;
      
    case 'mentorship':
      // Mentorship reduces dropout risk and improves aspirations
      updatedCoalition.dropoutRisk *= (1 - effect * 0.2);
      updatedCoalition.collegeAspiration += effect * 0.05;
      updatedCoalition.engagement += effect * 15;
      break;
  }
  
  // Clamp values
  updatedCoalition.currentAcademicScore = Math.max(0, Math.min(100, updatedCoalition.currentAcademicScore));
  updatedCoalition.dropoutRisk = Math.max(0, Math.min(1, updatedCoalition.dropoutRisk));
  updatedCoalition.collegeAspiration = Math.max(0, Math.min(1, updatedCoalition.collegeAspiration));
  updatedCoalition.tradeInterest = Math.max(0, Math.min(1, updatedCoalition.tradeInterest));
  updatedCoalition.engagement = Math.max(0, Math.min(100, updatedCoalition.engagement));
  
  return updatedCoalition;
};

/**
 * Calculate student outcomes for a coalition
 */
export const calculateStudentOutcomes = (coalition, districtMetrics, economicFactors = {}) => {
  const outcomes = {
    dropouts: 0,
    graduates: 0,
    collegeBound: 0,
    tradeBound: 0,
    employed: 0,
    unemployed: 0
  };
  
  const totalStudents = coalition.studentCount;
  
  // Calculate dropout rate (affected by engagement and academic score)
  const dropoutModifier = (100 - coalition.engagement) / 100 * 
                          (100 - coalition.currentAcademicScore) / 100;
  const actualDropoutRate = coalition.dropoutRisk * (1 + dropoutModifier);
  outcomes.dropouts = Math.floor(totalStudents * actualDropoutRate);
  
  const graduatingStudents = totalStudents - outcomes.dropouts;
  
  // Calculate college vs trade vs direct employment
  const collegeModifier = coalition.currentAcademicScore / 100;
  const actualCollegeRate = coalition.collegeAspiration * collegeModifier;
  outcomes.collegeBound = Math.floor(graduatingStudents * actualCollegeRate);
  
  // Trade school enrollment
  const remainingStudents = graduatingStudents - outcomes.collegeBound;
  const tradeModifier = districtMetrics.technologyAccess / 100; // Better tech = better trade programs
  const actualTradeRate = coalition.tradeInterest * tradeModifier;
  outcomes.tradeBound = Math.floor(remainingStudents * actualTradeRate);
  
  // Direct employment
  outcomes.employed = remainingStudents - outcomes.tradeBound;
  
  // Calculate future economic impact
  const economicImpact = {
    averageIncome: calculateAverageIncome(outcomes, coalition),
    taxRevenue: calculateTaxRevenue(outcomes, coalition),
    socialCosts: calculateSocialCosts(outcomes, coalition)
  };
  
  return {
    ...outcomes,
    economicImpact
  };
};

/**
 * Helper function to calculate average income based on outcomes
 */
const calculateAverageIncome = (outcomes, coalition) => {
  const incomeByPath = {
    dropout: 25000,
    highSchool: 35000,
    trade: 45000,
    college: 65000
  };
  
  // Adjust based on SES background
  const sesMultiplier = coalition.ses === 'high' ? 1.3 :
                        coalition.ses === 'middle' ? 1.0 :
                        coalition.ses === 'low' ? 0.85 : 0.7;
  
  const weightedIncome = 
    (outcomes.dropouts * incomeByPath.dropout +
     outcomes.employed * incomeByPath.highSchool +
     outcomes.tradeBound * incomeByPath.trade +
     outcomes.collegeBound * incomeByPath.college) /
    coalition.studentCount;
  
  return Math.floor(weightedIncome * sesMultiplier);
};

/**
 * Helper function to calculate tax revenue
 */
const calculateTaxRevenue = (outcomes, coalition) => {
  const avgIncome = calculateAverageIncome(outcomes, coalition);
  const taxRate = 0.15; // Simplified tax rate
  return Math.floor(avgIncome * taxRate * coalition.studentCount);
};

/**
 * Helper function to calculate social costs
 */
const calculateSocialCosts = (outcomes, coalition) => {
  // Higher dropout rates = higher social costs
  const dropoutCost = outcomes.dropouts * 10000; // Annual social cost per dropout
  const unemploymentCost = (outcomes.dropouts * 0.3) * 15000; // Assume 30% unemployment among dropouts
  
  return dropoutCost + unemploymentCost;
};

/**
 * Fast coalition generation using optimized algorithms
 */
export class EducationCoalitionOptimizer {
  constructor() {
    this.cache = new Map();
    this.lastCacheClean = Date.now();
  }
  
  /**
   * Batch generate coalitions for multiple districts
   */
  batchGenerateCoalitions = (districts, cityDemographicsMap) => {
    const results = new Map();
    
    districts.forEach(district => {
      const cityDemo = cityDemographicsMap.get(district.cityId) || {};
      const coalitions = this.generateOptimizedCoalitions(district, cityDemo);
      results.set(district.id, coalitions);
    });
    
    return results;
  };
  
  /**
   * Optimized coalition generation with caching
   */
  generateOptimizedCoalitions = (district, cityDemographics) => {
    const cacheKey = `${district.cityId}_${district.totalStudents}_${cityDemographics.medianIncome || 0}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // Cache for 1 minute
        return cached.coalitions;
      }
    }
    
    // Generate new coalitions
    const coalitions = generateStudentCoalitions(district, cityDemographics);
    
    // Cache result
    this.cache.set(cacheKey, {
      coalitions,
      timestamp: Date.now()
    });
    
    // Clean cache periodically
    if (Date.now() - this.lastCacheClean > 300000) { // Clean every 5 minutes
      this.cache.clear();
      this.lastCacheClean = Date.now();
    }
    
    return coalitions;
  };
}

// Export singleton instance
export const educationOptimizer = new EducationCoalitionOptimizer();