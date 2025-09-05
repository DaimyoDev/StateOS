// src/data/randomEventsData.js

/**
 * Random events data and templates for the game
 * Events can trigger news responses based on outlet biases and relevance
 */

export const RANDOM_EVENT_TEMPLATES = {
  // Healthcare Events
  healthcare: [
    {
      id: 'hospital_closure',
      name: 'Hospital Closure Announcement',
      description: 'Major hospital announces closure due to funding issues',
      category: 'healthcare',
      relevantPolicies: ['healthcare_spending', 'public_health_investment'],
      relevantIdeologies: ['progressive', 'socialist', 'conservative'],
      severity: 'major',
      newsWorthiness: 8,
      contextGenerator: (location) => ({
        hospitalName: `${location} General Hospital`,
        jobsLost: Math.floor(Math.random() * 500) + 200,
        patientsAffected: Math.floor(Math.random() * 10000) + 5000
      })
    },
    {
      id: 'medical_breakthrough',
      name: 'Medical Research Breakthrough',
      description: 'Local research institution announces major medical breakthrough',
      category: 'healthcare',
      relevantPolicies: ['healthcare_spending', 'research_funding'],
      relevantIdeologies: ['progressive', 'technocratic'],
      severity: 'moderate',
      newsWorthiness: 6,
      contextGenerator: (location) => ({
        institution: `${location} Medical Research Center`,
        disease: ['cancer', 'diabetes', 'heart disease', 'alzheimer'][Math.floor(Math.random() * 4)],
        timeline: `${Math.floor(Math.random() * 5) + 2} years`
      })
    },
    {
      id: 'drug_shortage',
      name: 'Critical Drug Shortage',
      description: 'Pharmacies report shortage of critical medications',
      category: 'healthcare',
      relevantPolicies: ['healthcare_spending', 'drug_price_regulation'],
      relevantIdeologies: ['progressive', 'socialist'],
      severity: 'major',
      newsWorthiness: 7,
      contextGenerator: () => ({
        medications: ['insulin', 'antibiotics', 'heart medication', 'cancer drugs'][Math.floor(Math.random() * 4)],
        duration: `${Math.floor(Math.random() * 8) + 2} weeks`
      })
    }
  ],

  // Economic Events
  economic: [
    {
      id: 'factory_closure',
      name: 'Major Factory Closure',
      description: 'Large manufacturing facility announces shutdown',
      category: 'economic',
      relevantPolicies: ['corporate_tax_rate', 'trade_policy', 'minimum_wage'],
      relevantIdeologies: ['socialist', 'populist', 'conservative'],
      severity: 'major',
      newsWorthiness: 8,
      contextGenerator: (location) => ({
        companyName: ['AutoTech Industries', 'Global Manufacturing Inc', 'National Steel Corp'][Math.floor(Math.random() * 3)],
        jobsLost: Math.floor(Math.random() * 2000) + 500,
        reason: ['outsourcing', 'automation', 'market conditions', 'regulatory burden'][Math.floor(Math.random() * 4)]
      })
    },
    {
      id: 'tech_expansion',
      name: 'Tech Company Expansion',
      description: 'Major technology company announces new facility',
      category: 'economic',
      relevantPolicies: ['corporate_tax_rate', 'infrastructure_spending'],
      relevantIdeologies: ['libertarian', 'technocratic', 'progressive'],
      severity: 'moderate',
      newsWorthiness: 6,
      contextGenerator: (location) => ({
        companyName: ['DataCore Systems', 'CloudNet Solutions', 'AI Innovations'][Math.floor(Math.random() * 3)],
        jobsCreated: Math.floor(Math.random() * 1000) + 200,
        investment: `$${Math.floor(Math.random() * 500) + 100} million`
      })
    },
    {
      id: 'housing_crisis',
      name: 'Housing Affordability Crisis',
      description: 'Report reveals severe housing affordability issues',
      category: 'economic',
      relevantPolicies: ['housing_policy', 'rent_control', 'zoning_laws'],
      relevantIdeologies: ['progressive', 'socialist', 'populist'],
      severity: 'major',
      newsWorthiness: 7,
      contextGenerator: () => ({
        percentIncrease: Math.floor(Math.random() * 30) + 15,
        averageRent: Math.floor(Math.random() * 1000) + 1500,
        homelessIncrease: Math.floor(Math.random() * 40) + 10
      })
    }
  ],

  // Environmental Events
  environmental: [
    {
      id: 'pollution_spike',
      name: 'Air Quality Emergency',
      description: 'Dangerous air pollution levels trigger health warnings',
      category: 'environmental',
      relevantPolicies: ['environmental_regulation', 'carbon_tax', 'green_energy'],
      relevantIdeologies: ['green', 'progressive', 'conservative'],
      severity: 'major',
      newsWorthiness: 7,
      contextGenerator: () => ({
        pollutantLevel: Math.floor(Math.random() * 100) + 150,
        duration: `${Math.floor(Math.random() * 5) + 2} days`,
        source: ['industrial emissions', 'wildfires', 'vehicle exhaust'][Math.floor(Math.random() * 3)]
      })
    },
    {
      id: 'renewable_milestone',
      name: 'Renewable Energy Milestone',
      description: 'Region reaches significant renewable energy milestone',
      category: 'environmental',
      relevantPolicies: ['green_energy', 'carbon_tax'],
      relevantIdeologies: ['green', 'progressive'],
      severity: 'moderate',
      newsWorthiness: 5,
      contextGenerator: () => ({
        percentage: Math.floor(Math.random() * 30) + 20,
        energyType: ['solar', 'wind', 'hydroelectric'][Math.floor(Math.random() * 3)],
        timeline: 'ahead of schedule'
      })
    }
  ],

  // Crime & Justice Events
  crime: [
    {
      id: 'crime_wave',
      name: 'Crime Rate Surge',
      description: 'Police report significant increase in criminal activity',
      category: 'crime',
      relevantPolicies: ['police_funding', 'criminal_justice_reform', 'gun_control'],
      relevantIdeologies: ['conservative', 'libertarian', 'progressive'],
      severity: 'major',
      newsWorthiness: 8,
      contextGenerator: () => ({
        crimeType: ['violent crime', 'property crime', 'drug-related offenses'][Math.floor(Math.random() * 3)],
        percentIncrease: Math.floor(Math.random() * 50) + 20,
        neighborhoods: Math.floor(Math.random() * 10) + 5
      })
    },
    {
      id: 'police_reform',
      name: 'Police Reform Initiative',
      description: 'Law enforcement announces new community policing program',
      category: 'crime',
      relevantPolicies: ['police_funding', 'criminal_justice_reform'],
      relevantIdeologies: ['progressive', 'moderate', 'conservative'],
      severity: 'moderate',
      newsWorthiness: 6,
      contextGenerator: () => ({
        programType: ['body cameras', 'de-escalation training', 'community outreach'][Math.floor(Math.random() * 3)],
        officers: Math.floor(Math.random() * 200) + 50,
        budget: `$${Math.floor(Math.random() * 10) + 2} million`
      })
    }
  ],

  // Education Events
  education: [
    {
      id: 'school_crisis',
      name: 'School Funding Crisis',
      description: 'School district faces severe budget shortfall',
      category: 'education',
      relevantPolicies: ['education_spending', 'school_choice', 'teacher_pay'],
      relevantIdeologies: ['progressive', 'conservative'],
      severity: 'major',
      newsWorthiness: 7,
      contextGenerator: (location) => ({
        district: `${location} School District`,
        shortfall: `$${Math.floor(Math.random() * 50) + 10} million`,
        schoolsAffected: Math.floor(Math.random() * 20) + 10,
        teachersLaidOff: Math.floor(Math.random() * 100) + 50
      })
    },
    {
      id: 'education_achievement',
      name: 'Education Achievement Award',
      description: 'Local schools receive national recognition',
      category: 'education',
      relevantPolicies: ['education_spending', 'teacher_pay'],
      relevantIdeologies: ['progressive', 'technocratic'],
      severity: 'minor',
      newsWorthiness: 4,
      contextGenerator: (location) => ({
        achievement: ['STEM excellence', 'literacy rates', 'graduation rates'][Math.floor(Math.random() * 3)],
        ranking: Math.floor(Math.random() * 10) + 1,
        award: `National Education Excellence Award`
      })
    }
  ],

  // Infrastructure Events
  infrastructure: [
    {
      id: 'bridge_collapse',
      name: 'Infrastructure Emergency',
      description: 'Critical infrastructure failure causes major disruption',
      category: 'infrastructure',
      relevantPolicies: ['infrastructure_spending', 'public_works'],
      relevantIdeologies: ['progressive', 'moderate', 'conservative'],
      severity: 'critical',
      newsWorthiness: 9,
      contextGenerator: () => ({
        infrastructureType: ['bridge', 'water main', 'power grid'][Math.floor(Math.random() * 3)],
        peopleAffected: Math.floor(Math.random() * 50000) + 10000,
        repairTime: `${Math.floor(Math.random() * 12) + 3} months`
      })
    },
    {
      id: 'transit_expansion',
      name: 'Public Transit Expansion',
      description: 'Major public transportation project announced',
      category: 'infrastructure',
      relevantPolicies: ['infrastructure_spending', 'public_transit'],
      relevantIdeologies: ['progressive', 'green'],
      severity: 'moderate',
      newsWorthiness: 5,
      contextGenerator: () => ({
        projectType: ['light rail', 'subway extension', 'bus rapid transit'][Math.floor(Math.random() * 3)],
        investment: `$${Math.floor(Math.random() * 500) + 100} million`,
        completion: `${Math.floor(Math.random() * 5) + 2} years`
      })
    }
  ],

  // Social Events
  social: [
    {
      id: 'protest_march',
      name: 'Large Scale Protest',
      description: 'Major protest march draws thousands',
      category: 'social',
      relevantPolicies: ['civil_rights', 'police_funding', 'social_justice'],
      relevantIdeologies: ['progressive', 'socialist', 'conservative'],
      severity: 'moderate',
      newsWorthiness: 7,
      contextGenerator: () => ({
        cause: ['racial justice', 'economic inequality', 'climate action', 'workers rights'][Math.floor(Math.random() * 4)],
        attendance: Math.floor(Math.random() * 10000) + 2000,
        duration: `${Math.floor(Math.random() * 5) + 1} days`
      })
    },
    {
      id: 'community_achievement',
      name: 'Community Achievement',
      description: 'Local community group receives national recognition',
      category: 'social',
      relevantPolicies: ['community_development'],
      relevantIdeologies: ['progressive', 'moderate'],
      severity: 'minor',
      newsWorthiness: 3,
      contextGenerator: () => ({
        organization: ['Community Action Network', 'Neighbors United', 'Local Heroes'][Math.floor(Math.random() * 3)],
        achievement: ['poverty reduction', 'youth programs', 'elderly care'][Math.floor(Math.random() * 3)],
        award: 'National Community Excellence Award'
      })
    }
  ],

  // Technology Events
  technology: [
    {
      id: 'data_breach',
      name: 'Major Data Breach',
      description: 'Large-scale cyberattack affects thousands',
      category: 'technology',
      relevantPolicies: ['data_privacy', 'cybersecurity'],
      relevantIdeologies: ['technocratic', 'libertarian', 'progressive'],
      severity: 'major',
      newsWorthiness: 7,
      contextGenerator: () => ({
        organization: ['government systems', 'hospital network', 'financial institution'][Math.floor(Math.random() * 3)],
        recordsAffected: Math.floor(Math.random() * 100000) + 10000,
        dataType: ['personal information', 'financial records', 'medical records'][Math.floor(Math.random() * 3)]
      })
    },
    {
      id: 'ai_innovation',
      name: 'AI Innovation Announcement',
      description: 'Local company announces breakthrough in artificial intelligence',
      category: 'technology',
      relevantPolicies: ['tech_regulation', 'research_funding'],
      relevantIdeologies: ['technocratic', 'progressive', 'libertarian'],
      severity: 'moderate',
      newsWorthiness: 5,
      contextGenerator: (location) => ({
        company: `${location} AI Labs`,
        application: ['healthcare diagnostics', 'autonomous vehicles', 'education'][Math.floor(Math.random() * 3)],
        jobsCreated: Math.floor(Math.random() * 200) + 50
      })
    }
  ]
};

/**
 * Get all events from a specific category
 */
export const getEventsByCategory = (category) => {
  return RANDOM_EVENT_TEMPLATES[category] || [];
};

/**
 * Get all events relevant to a specific policy
 */
export const getEventsByPolicy = (policyId) => {
  const relevantEvents = [];
  
  Object.values(RANDOM_EVENT_TEMPLATES).forEach(categoryEvents => {
    categoryEvents.forEach(event => {
      if (event.relevantPolicies && event.relevantPolicies.includes(policyId)) {
        relevantEvents.push(event);
      }
    });
  });
  
  return relevantEvents;
};

/**
 * Get all events relevant to a specific ideology
 */
export const getEventsByIdeology = (ideology) => {
  const relevantEvents = [];
  
  Object.values(RANDOM_EVENT_TEMPLATES).forEach(categoryEvents => {
    categoryEvents.forEach(event => {
      if (event.relevantIdeologies && event.relevantIdeologies.includes(ideology.toLowerCase())) {
        relevantEvents.push(event);
      }
    });
  });
  
  return relevantEvents;
};

/**
 * Get a random event from all available events
 */
export const getRandomEvent = () => {
  const allCategories = Object.keys(RANDOM_EVENT_TEMPLATES);
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
  const categoryEvents = RANDOM_EVENT_TEMPLATES[randomCategory];
  
  if (categoryEvents && categoryEvents.length > 0) {
    return categoryEvents[Math.floor(Math.random() * categoryEvents.length)];
  }
  
  return null;
};

/**
 * Get events filtered by severity
 */
export const getEventsBySeverity = (severity) => {
  const relevantEvents = [];
  
  Object.values(RANDOM_EVENT_TEMPLATES).forEach(categoryEvents => {
    categoryEvents.forEach(event => {
      if (event.severity === severity) {
        relevantEvents.push(event);
      }
    });
  });
  
  return relevantEvents;
};