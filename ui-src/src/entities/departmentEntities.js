// ui-src/src/entities/departmentEntities.js

import { DEPARTMENT_LEVELS, REGIONAL_DEPARTMENT_VARIATIONS } from "../data/governmentDepartments.js";
import { 
  generateId, 
  getRandomElement, 
  getRandomInt 
} from "../utils/core.js";
import { generateFullAIPolitician } from "./personnel.js";
import { useGameStore } from "../store.js";

/**
 * Creates a government department object with a department head
 * @param {object} params - The parameters for the department
 * @returns {object} A new department object
 */
export const createDepartmentObject = (params = {}) => ({
  id: params.id || `dept_${generateId()}`,
  departmentId: params.departmentId || "unknown_department",
  name: params.name || "Department",
  level: params.level || "city", // city, county, state, national
  governmentEntityId: params.governmentEntityId || null, // ID of city, county, state, or country
  head: params.head || null, // Department head politician object
  description: params.description || "A government department",
  budget: params.budget || getRandomInt(100000, 5000000),
  employees: params.employees || getRandomInt(10, 500),
  responsibilities: params.responsibilities || [],
  createdYear: params.createdYear || new Date().getFullYear(),
  isActive: params.isActive !== undefined ? params.isActive : true,
});

/**
 * Gets the formatted department name based on level and department ID
 * @param {string} departmentId - The department identifier
 * @param {string} level - The government level (city, county, state, national)
 * @param {string} entityName - Name of the government entity (city name, state name, etc.)
 * @returns {string} Formatted department name
 */
export const formatDepartmentName = (departmentId, level, entityName = "") => {
  const departmentNameMap = {
    // Common department names across levels
    education: {
      city: "Department of Education",
      county: "County Education Department", 
      state: "Department of Education",
      national: "Department of Education"
    },
    transportation: {
      city: "Department of Transportation",
      county: "County Transportation Department",
      state: "Department of Transportation", 
      national: "Department of Transportation"
    },
    health_human_services: {
      city: "Health & Human Services Department",
      county: "County Health & Human Services",
      state: "Department of Health & Human Services",
      national: "Department of Health & Human Services"
    },
    public_safety: {
      city: "Department of Public Safety",
      county: "County Public Safety Department", 
      state: "Department of Public Safety",
      national: "Department of Homeland Security"
    },
    finance_budget: {
      city: "Finance Department",
      county: "County Finance Department",
      state: "Department of Finance", 
      national: "Department of Treasury"
    },
    environmental_protection: {
      city: "Environmental Services Department",
      county: "County Environmental Department",
      state: "Department of Environmental Protection",
      national: "Environmental Protection Agency"
    },
    parks_recreation: {
      city: "Parks & Recreation Department",
      county: "County Parks & Recreation",
      state: "Department of Parks & Wildlife",
      national: "National Park Service"
    },
    public_works: {
      city: "Department of Public Works",
      county: "County Public Works",
      state: "Department of Public Works",
      national: "Department of Infrastructure"
    },
    police: {
      city: `${entityName} Police Department`,
      county: "County Sheriff's Office",
      state: "State Police",
      national: "Federal Law Enforcement"
    },
    fire_emergency: {
      city: `${entityName} Fire Department`,
      county: "County Fire & Emergency Services",
      state: "State Fire Marshal's Office",
      national: "Federal Emergency Management Agency"
    },
    housing_development: {
      city: "Housing & Development Department",
      county: "County Housing Authority", 
      state: "Department of Housing & Community Development",
      national: "Department of Housing & Urban Development"
    },
    agriculture: {
      city: "Agricultural Services",
      county: "County Agricultural Extension",
      state: "Department of Agriculture",
      national: "Department of Agriculture"
    },
    commerce_economic_development: {
      city: "Economic Development Office",
      county: "County Economic Development",
      state: "Department of Commerce & Economic Development", 
      national: "Department of Commerce"
    },
    veterans_affairs: {
      city: "Veterans Services Office",
      county: "County Veterans Affairs",
      state: "Department of Veterans Affairs",
      national: "Department of Veterans Affairs"
    },
    // Default fallback
    default: {
      city: `Department of ${departmentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      county: `County ${departmentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Department`,
      state: `Department of ${departmentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      national: `Department of ${departmentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
    }
  };

  const departmentNames = departmentNameMap[departmentId] || departmentNameMap.default;
  return departmentNames[level] || departmentNames.default[level];
};

/**
 * Gets the department head title based on department and level
 * @param {string} departmentId - The department identifier
 * @param {string} level - The government level
 * @returns {string} Department head title
 */
export const getDepartmentHeadTitle = (departmentId, level) => {
  const titleMap = {
    // Special cases
    police: {
      city: "Police Chief",
      county: "Sheriff", 
      state: "State Police Commissioner",
      national: "Director"
    },
    fire_emergency: {
      city: "Fire Chief",
      county: "Fire Chief",
      state: "State Fire Marshal",
      national: "Administrator"
    },
    education: {
      city: "Superintendent",
      county: "County Superintendent",
      state: "Commissioner of Education",
      national: "Secretary of Education"
    },
    // National level special titles
    treasury_finance: {
      national: "Secretary of Treasury"
    },
    defense: {
      national: "Secretary of Defense"
    },
    justice_attorney_general: {
      national: "Attorney General"
    },
    state_foreign_affairs: {
      national: "Secretary of State"
    },
    // Default patterns
    default: {
      city: "Director",
      county: "Director", 
      state: level === "state" ? "Commissioner" : "Director",
      national: "Secretary"
    }
  };

  const titles = titleMap[departmentId] || titleMap.default;
  return titles[level] || titles.default[level] || "Director";
};

/**
 * Maps city budget expense allocations to department budgets
 * @param {object} cityBudget - The city's budget with expense allocations
 * @returns {object} Object mapping department IDs to their budget allocations
 */
export const mapCityBudgetToDepartments = (cityBudget) => {
  if (!cityBudget?.expenseAllocations) return {};
  
  const { expenseAllocations } = cityBudget;
  
  // Map budget categories to department IDs
  const budgetMapping = {
    // Public Safety
    "police": expenseAllocations.policeDepartment || 0,
    "fire_emergency": expenseAllocations.fireDepartment + (expenseAllocations.emergencyServices || 0),
    
    // Infrastructure & Transportation
    "public_works": expenseAllocations.roadInfrastructure || 0,
    "transportation": expenseAllocations.publicTransit || 0,
    "water_utilities": expenseAllocations.waterAndSewer || 0,
    "sanitation_waste": expenseAllocations.wasteManagement || 0,
    
    // Education & Social Services
    "education": expenseAllocations.publicEducation || 0,
    "public_health": expenseAllocations.publicHealthServices || 0,
    "social_services": expenseAllocations.socialWelfarePrograms || 0,
    
    // Community Services
    "parks_recreation": expenseAllocations.parksAndRecreation || 0,
    "libraries": expenseAllocations.librariesAndCulture || 0,
    
    // Administration & Planning  
    "planning_zoning": expenseAllocations.cityPlanningAndDevelopment || 0,
    "finance_budget": expenseAllocations.generalAdministration || 0, // Remaining general admin
    
    // Direct budget allocations for new departments
    "human_resources": expenseAllocations.humanResources || 0,
    "legal_affairs": expenseAllocations.legalAffairs || 0,
    "information_technology": expenseAllocations.informationTechnology || 0,
    "code_enforcement": expenseAllocations.codeEnforcement || 0,
    "permits_licensing": expenseAllocations.permitsLicensing || 0,
    "housing_development": expenseAllocations.housingDevelopment || 0,
    "economic_development": expenseAllocations.economicDevelopment || 0,
    "environmental_services": expenseAllocations.environmentalServices || 0,
  };
  
  return budgetMapping;
};

/**
 * Calculates realistic employee count based on department type, budget, and context
 * @param {string} departmentId - The department identifier
 * @param {string} level - The government level
 * @param {number} budget - Department budget
 * @param {object} context - Additional context (city population, student count, etc.)
 * @returns {number} Realistic employee count
 */
export const calculateRealisticEmployeeCount = (departmentId, level, budget, context = {}) => {
  // Average salary estimates by department type and level
  const averageSalaries = {
    education: {
      city: 65000,    // Teachers, administrators
      county: 68000,
      state: 75000,
      national: 85000
    },
    police: {
      city: 70000,    // Police officers, detectives, support
      county: 72000,
      state: 78000,
      national: 90000
    },
    fire_emergency: {
      city: 68000,    // Firefighters, paramedics
      county: 70000,
      state: 76000,
      national: 88000
    },
    public_health: {
      city: 60000,    // Health inspectors, nurses
      county: 62000,
      state: 68000,
      national: 80000
    },
    public_works: {
      city: 55000,    // Engineers, maintenance crew
      county: 57000,
      state: 65000,
      national: 75000
    },
    transportation: {
      city: 58000,    // Transit operators, planners
      county: 60000,
      state: 68000,
      national: 78000
    },
    default: {
      city: 55000,    // General administrative
      county: 57000,
      state: 65000,
      national: 75000
    }
  };

  // Get average salary for this department and level
  const avgSalary = averageSalaries[departmentId]?.[level] || averageSalaries.default[level];
  
  // Personnel costs typically represent 70-80% of government department budgets
  const personnelBudgetRatio = 0.75;
  const availableForSalaries = budget * personnelBudgetRatio;
  
  // Calculate base employee count from budget
  let employeeCount = Math.max(1, Math.round(availableForSalaries / avgSalary));

  // Apply department-specific adjustments based on workload
  if (departmentId === 'education' && context.studentCount) {
    // Education: Need proper teacher-to-student ratios
    const targetTeacherRatio = 20; // 20:1 student-teacher ratio
    const neededTeachers = Math.ceil(context.studentCount / targetTeacherRatio);
    // Add 25% for administrators, support staff, etc.
    const totalEducationStaff = Math.ceil(neededTeachers * 1.25);
    
    // Use the higher of budget-based or ratio-based calculation
    employeeCount = Math.max(employeeCount, totalEducationStaff);
  }
  
  if (departmentId === 'police' && context.cityPopulation) {
    // Police: Typical ratio is 2-3 officers per 1000 residents
    const targetRatio = 2.5 / 1000;
    const neededOfficers = Math.ceil(context.cityPopulation * targetRatio);
    // Add 40% for detectives, administration, support
    const totalPoliceStaff = Math.ceil(neededOfficers * 1.4);
    
    employeeCount = Math.max(employeeCount, totalPoliceStaff);
  }
  
  if (departmentId === 'fire_emergency' && context.cityPopulation) {
    // Fire: Typical ratio is 1-1.5 firefighters per 1000 residents
    const targetRatio = 1.2 / 1000;
    const neededFirefighters = Math.ceil(context.cityPopulation * targetRatio);
    // Add 30% for paramedics, administration, support
    const totalFireStaff = Math.ceil(neededFirefighters * 1.3);
    
    employeeCount = Math.max(employeeCount, totalFireStaff);
  }

  // Apply level-based minimums and maximums
  const levelLimits = {
    city: { min: 5, max: 15000 },
    county: { min: 15, max: 25000 },
    state: { min: 50, max: 100000 },
    national: { min: 200, max: 500000 }
  };
  
  const limits = levelLimits[level] || levelLimits.city;
  return Math.min(Math.max(employeeCount, limits.min), limits.max);
};

/**
 * Gets appropriate department responsibilities based on department type and level
 * @param {string} departmentId - The department identifier
 * @param {string} level - The government level
 * @returns {Array<string>} Array of responsibilities
 */
export const getDepartmentResponsibilities = (departmentId, level) => {
  const responsibilityMap = {
    education: {
      city: ["Manage public schools", "Educational programs", "School safety"],
      county: ["County schools", "Educational services", "Special programs"],
      state: ["State education policy", "University system", "Teacher certification"],
      national: ["Federal education policy", "Student loans", "Educational standards"]
    },
    transportation: {
      city: ["City streets", "Traffic signals", "Public transit"],
      county: ["County roads", "Bridge maintenance", "Traffic management"],
      state: ["State highways", "Motor vehicle registration", "Transportation planning"],
      national: ["Interstate highways", "Aviation", "Maritime transportation"]
    },
    public_safety: {
      city: ["Law enforcement", "Emergency response", "Crime prevention"],
      county: ["Sheriff services", "County jail", "Emergency management"],
      state: ["State police", "Criminal investigations", "Emergency coordination"],
      national: ["National security", "Federal law enforcement", "Counter-terrorism"]
    },
    health_human_services: {
      city: ["Public health", "Social services", "Health inspections"],
      county: ["County health services", "Social welfare", "Mental health"],
      state: ["State health policy", "Medicaid", "Public health programs"],
      national: ["National health policy", "Disease control", "Healthcare regulations"]
    },
    environmental_protection: {
      city: ["Environmental compliance", "Waste management", "Air quality"],
      county: ["County environmental programs", "Natural resource management"],
      state: ["Environmental regulations", "Pollution control", "Conservation"],
      national: ["National environmental policy", "Climate change", "EPA regulations"]
    }
  };

  const defaultResponsibilities = {
    city: ["Local administration", "Service delivery", "Community programs"],
    county: ["County services", "Regional coordination", "Public assistance"],
    state: ["State policy", "Regulatory oversight", "Program administration"],
    national: ["Federal policy", "National programs", "Interstate coordination"]
  };

  return responsibilityMap[departmentId]?.[level] || defaultResponsibilities[level] || ["Administrative duties"];
};

/**
 * Generates department heads for all departments at a specific government level
 * @param {object} params - Parameters for generation
 * @param {string} params.level - Government level (city, county, state, national)
 * @param {string} params.governmentEntityId - ID of the government entity
 * @param {string} params.entityName - Name of the government entity
 * @param {string} params.countryId - Country ID for context
 * @param {Array} params.availableParties - Available political parties
 * @param {object} params.countryData - Country data for context
 * @param {object} params.cityBudget - City budget for budget-based department allocations (city level only)
 * @returns {Array<object>} Array of department objects with heads
 */
export const generateDepartmentsForGovernmentLevel = ({
  level,
  governmentEntityId,
  entityName = "",
  countryId,
  availableParties = [],
  countryData = null,
  cityBudget = null,
  contextData = {},
}) => {
  const departments = [];
  
  // Get the appropriate department list for this level
  let departmentList = [];
  
  switch (level) {
    case "city":
      departmentList = [...DEPARTMENT_LEVELS.CITY];
      break;
    case "county":
      departmentList = [...DEPARTMENT_LEVELS.COUNTY];
      break;
    case "state":
      departmentList = [...DEPARTMENT_LEVELS.STATE];
      break;
    case "national":
      departmentList = [...DEPARTMENT_LEVELS.NATIONAL];
      
      // Add regional variations for national level based on political system
      if (countryData?.politicalSystem) {
        const system = countryData.politicalSystem.toLowerCase();
        if (system.includes("parliamentary")) {
          departmentList.push(...(REGIONAL_DEPARTMENT_VARIATIONS.PARLIAMENTARY.NATIONAL || []));
        }
        if (system.includes("federal")) {
          departmentList.push(...(REGIONAL_DEPARTMENT_VARIATIONS.FEDERAL.NATIONAL || []));
        }
        if (system.includes("monarchy")) {
          departmentList.push(...(REGIONAL_DEPARTMENT_VARIATIONS.MONARCHY.NATIONAL || []));
        }
      }
      break;
    default:
      console.warn(`Unknown government level: ${level}`);
      return departments;
  }

  // Generate departments
  departmentList.forEach(departmentId => {
    const departmentName = formatDepartmentName(departmentId, level, entityName);
    const headTitle = getDepartmentHeadTitle(departmentId, level);
    const responsibilities = getDepartmentResponsibilities(departmentId, level);
    
    // Generate department head as a specialized politician
    const departmentHead = generateFullAIPolitician(
      countryId,
      availableParties,
      {
        regionId: level === "state" ? governmentEntityId : null,
        cityId: level === "city" ? governmentEntityId : null,
        isIncumbent: true,
        // Department heads are often less partisan or independent
        forcePartyId: Math.random() < 0.3 ? "independent" : null,
      }
    );
    
    // Add department-specific information to the head
    if (departmentHead) {
      departmentHead.currentOffice = {
        title: headTitle,
        department: departmentName,
        level: level,
        appointmentDate: {
          year: getRandomInt(2020, 2025),
          month: getRandomInt(1, 12),
          day: getRandomInt(1, 28)
        }
      };
    }

    // Determine budget based on level and department type
    let departmentBudget = 0;
    
    if (level === "city" && cityBudget) {
      // Use city budget allocations for city departments
      const budgetMapping = mapCityBudgetToDepartments(cityBudget);
      departmentBudget = Math.floor(budgetMapping[departmentId] || 0);
      
      // If no specific mapping exists, use a small portion of general administration
      if (departmentBudget === 0 && cityBudget.expenseAllocations?.generalAdministration) {
        departmentBudget = Math.floor(cityBudget.expenseAllocations.generalAdministration * 0.05);
      }
    } else {
      // Fall back to random budget ranges for non-city levels or when no budget provided
      let budgetRange = { min: 100000, max: 1000000 };
      
      switch (level) {
        case "city":
          budgetRange = { min: 500000, max: 10000000 };
          break;
        case "county": 
          budgetRange = { min: 1000000, max: 50000000 };
          break;
        case "state":
          budgetRange = { min: 50000000, max: 1000000000 };
          break;
        case "national":
          budgetRange = { min: 1000000000, max: 100000000000 };
          break;
      }
      
      // Adjust for department importance
      const importantDepts = ["education", "health_human_services", "transportation", "public_safety", "defense"];
      if (importantDepts.includes(departmentId)) {
        budgetRange.min *= 2;
        budgetRange.max *= 3;
      }
      
      departmentBudget = getRandomInt(budgetRange.min, budgetRange.max);
    }

    const department = createDepartmentObject({
      departmentId: departmentId,
      name: departmentName,
      level: level,
      governmentEntityId: governmentEntityId,
      head: departmentHead,
      description: `Responsible for ${responsibilities.join(", ").toLowerCase()}`,
      budget: departmentBudget,
      employees: calculateRealisticEmployeeCount(departmentId, level, departmentBudget, contextData),
      responsibilities: responsibilities,
      createdYear: getRandomInt(1950, 2020),
    });

    departments.push(department);
  });

  return departments;
};

/**
 * Generates all government departments for a complete government setup
 * @param {object} params - Parameters for generation
 * @param {string} params.countryId - Country ID
 * @param {object} params.countryData - Country data object
 * @param {Array} params.availableParties - Available political parties
 * @param {string} params.selectedRegionId - Selected state/region ID
 * @param {string} params.selectedCityId - Selected city ID
 * @param {object} params.cityBudget - City budget for department allocation
 * @returns {object} Object containing all generated departments by level
 */
export const generateAllGovernmentDepartments = ({
  countryId,
  countryData,
  availableParties = [],
  selectedRegionId,
  selectedCityId,
  cityBudget = null,
}) => {
  const allDepartments = {
    national: [],
    state: [],
    county: [],
    city: [],
  };

  // Generate national departments
  allDepartments.national = generateDepartmentsForGovernmentLevel({
    level: "national",
    governmentEntityId: countryId,
    entityName: countryData?.name || "Nation",
    countryId,
    availableParties,
    countryData,
  });

  // Generate state departments if region is selected
  if (selectedRegionId && countryData?.regions) {
    const selectedRegion = countryData.regions.find(r => r.id === selectedRegionId);
    if (selectedRegion) {
      allDepartments.state = generateDepartmentsForGovernmentLevel({
        level: "state", 
        governmentEntityId: selectedRegionId,
        entityName: selectedRegion.name,
        countryId,
        availableParties,
        countryData,
      });
    }
  }

  // Generate county departments if available
  if (selectedRegionId && countryData?.secondAdminRegions) {
    const regionCounties = countryData.secondAdminRegions.filter(
      county => county.stateId === selectedRegionId
    );
    
    regionCounties.forEach(county => {
      const countyDepartments = generateDepartmentsForGovernmentLevel({
        level: "county",
        governmentEntityId: county.id,
        entityName: county.name,
        countryId,
        availableParties,
        countryData,
      });
      allDepartments.county.push(...countyDepartments);
    });
  }

  // Generate city departments for the starting city
  if (selectedCityId && selectedRegionId && countryData?.regions) {
    const selectedRegion = countryData.regions.find(r => r.id === selectedRegionId);
    const selectedCity = selectedRegion?.cities?.find(c => c.id === selectedCityId);
    
    if (selectedCity) {
      // Prepare context data for realistic employee calculations
      const contextData = {
        cityPopulation: selectedCity.population || selectedCity.stats?.population || 100000, // Default if not available
        studentCount: selectedCity.schoolDistrict?.totalStudents || 0,
      };
      
      allDepartments.city = generateDepartmentsForGovernmentLevel({
        level: "city",
        governmentEntityId: selectedCityId,
        entityName: selectedCity.name,
        countryId,
        availableParties,
        countryData,
        cityBudget,
        contextData,
      });
    }
  }

  return allDepartments;
};