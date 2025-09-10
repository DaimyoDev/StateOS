// Legislative Committee System Definitions
// Defines committee structures for different political systems

// Committee types by political system
export const COMMITTEE_SYSTEMS = {
  // Presidential systems typically have standing committees with strong oversight powers
  PRESIDENTIAL_REPUBLIC: {
    systemName: "Congressional Committee System",
    features: ["strong_oversight", "subpoena_power", "budget_control", "confirmation_hearings"],
    legislativeProcess: {
      introduction: ["committee_assignment", "committee_markup", "committee_vote"],
      passage: ["floor_debate", "floor_vote", "second_chamber", "reconciliation"],
      executive: ["presidential_signature", "veto_override"]
    }
  },
  
  // Parliamentary systems have select committees and government-controlled legislative agenda
  PARLIAMENTARY_REPUBLIC: {
    systemName: "Parliamentary Committee System",
    features: ["select_committees", "government_priority", "party_discipline", "confidence_votes"],
    legislativeProcess: {
      introduction: ["government_agenda", "committee_review", "party_consultation"],
      passage: ["first_reading", "committee_stage", "report_stage", "third_reading"],
      executive: ["royal_assent", "automatic_passage"]
    }
  },
  
  // Parliamentary monarchies similar to parliamentary republics but with ceremonial elements
  PARLIAMENTARY_MONARCHY_CONSTITUTIONAL: {
    systemName: "Westminster Committee System", 
    features: ["select_committees", "government_priority", "royal_assent", "parliamentary_sovereignty"],
    legislativeProcess: {
      introduction: ["government_agenda", "committee_review", "party_consultation"],
      passage: ["first_reading", "committee_stage", "report_stage", "third_reading"],
      executive: ["royal_assent", "ceremonial_approval"]
    }
  },
  
  // Federal parliamentary monarchies with additional federalism considerations
  PARLIAMENTARY_MONARCHY_FEDERAL: {
    systemName: "Federal Parliamentary Committee System",
    features: ["select_committees", "federal_oversight", "provincial_consultation", "royal_assent"],
    legislativeProcess: {
      introduction: ["government_agenda", "federal_review", "committee_review"],
      passage: ["first_reading", "committee_stage", "federal_consultation", "third_reading"],
      executive: ["royal_assent", "federal_coordination"]
    }
  },
  
  // Semi-presidential systems with shared executive power complicating committee oversight
  SEMI_PRESIDENTIAL_REPUBLIC: {
    systemName: "Dual Executive Committee System",
    features: ["shared_oversight", "presidential_influence", "prime_minister_control", "cohabitation_potential"],
    legislativeProcess: {
      introduction: ["committee_assignment", "executive_consultation", "committee_markup"],
      passage: ["floor_debate", "amendment_process", "final_vote"],
      executive: ["dual_signature", "constitutional_review"]
    }
  },
  
  // Swiss-style directorial system with collegial decision making
  DIRECTORIAL_FEDERAL_REPUBLIC: {
    systemName: "Collegial Committee System",
    features: ["consensual_committees", "federal_coordination", "collegial_oversight", "direct_democracy"],
    legislativeProcess: {
      introduction: ["committee_consensus", "federal_consultation", "canton_review"],
      passage: ["committee_approval", "federal_council_review", "referendum_potential"],
      executive: ["collegial_approval", "federal_implementation"]
    }
  }
};

// Standard committee types found across different systems
export const COMMITTEE_TYPES = {
  // Standing/Permanent Committees
  STANDING: {
    JUDICIARY: {
      name: "Judiciary Committee",
      jurisdiction: ["legal_reform", "court_system", "constitutional_matters", "civil_rights"],
      keyPowers: ["judicial_nominations", "legal_oversight", "constitutional_review"]
    },
    FINANCE: {
      name: "Finance/Budget Committee", 
      jurisdiction: ["budget_approval", "taxation", "fiscal_policy", "debt_management"],
      keyPowers: ["budget_markup", "tax_legislation", "spending_oversight"]
    },
    FOREIGN_AFFAIRS: {
      name: "Foreign Affairs Committee",
      jurisdiction: ["international_relations", "trade_policy", "defense_cooperation", "treaties"],
      keyPowers: ["treaty_ratification", "ambassador_confirmation", "foreign_aid_oversight"]
    },
    DEFENSE: {
      name: "Defense/Security Committee",
      jurisdiction: ["military_affairs", "national_security", "intelligence_oversight", "veteran_affairs"],
      keyPowers: ["defense_budget", "military_nominations", "classified_oversight"]
    },
    EDUCATION: {
      name: "Education Committee",
      jurisdiction: ["education_policy", "research_funding", "student_affairs", "institutional_oversight"],
      keyPowers: ["education_budget", "policy_reform", "institutional_regulation"]
    },
    HEALTH: {
      name: "Health Committee",
      jurisdiction: ["healthcare_policy", "public_health", "medical_regulation", "health_insurance"],
      keyPowers: ["health_budget", "regulatory_oversight", "public_health_policy"]
    },
    COMMERCE: {
      name: "Commerce/Trade Committee",
      jurisdiction: ["business_regulation", "trade_policy", "consumer_protection", "market_oversight"],
      keyPowers: ["regulatory_approval", "trade_agreements", "antitrust_oversight"]
    },
    ENVIRONMENT: {
      name: "Environment Committee",
      jurisdiction: ["environmental_protection", "climate_policy", "natural_resources", "energy_policy"],
      keyPowers: ["environmental_regulation", "resource_management", "climate_legislation"]
    },
    AGRICULTURE: {
      name: "Agriculture Committee",
      jurisdiction: ["farm_policy", "food_safety", "rural_development", "agricultural_trade"],
      keyPowers: ["agricultural_subsidies", "food_regulation", "rural_programs"]
    },
    TRANSPORTATION: {
      name: "Transportation Committee",
      jurisdiction: ["infrastructure", "transportation_policy", "public_transit", "highway_systems"],
      keyPowers: ["infrastructure_funding", "transportation_regulation", "transit_policy"]
    }
  },
  
  // Select/Special Committees (more common in parliamentary systems)
  SELECT: {
    ETHICS: {
      name: "Ethics Committee",
      jurisdiction: ["member_conduct", "conflict_of_interest", "lobbying_oversight", "transparency"],
      keyPowers: ["disciplinary_action", "ethics_investigation", "conduct_rules"]
    },
    INTELLIGENCE: {
      name: "Intelligence Oversight Committee", 
      jurisdiction: ["intelligence_agencies", "surveillance_oversight", "national_security_secrets"],
      keyPowers: ["classified_oversight", "agency_budgets", "operational_review"]
    },
    AUDIT: {
      name: "Public Accounts/Audit Committee",
      jurisdiction: ["government_spending", "audit_oversight", "financial_accountability"],
      keyPowers: ["spending_review", "audit_authority", "accountability_measures"]
    }
  },
  
  // Conference/Reconciliation Committees (bicameral systems)
  CONFERENCE: {
    RECONCILIATION: {
      name: "Conference Committee",
      jurisdiction: ["bicameral_differences", "bill_reconciliation", "compromise_negotiation"],
      keyPowers: ["final_bill_text", "compromise_authority", "bicameral_coordination"]
    }
  }
};

// Committee membership rules by political system
export const COMMITTEE_MEMBERSHIP_RULES = {
  PRESIDENTIAL_REPUBLIC: {
    chairSelection: "majority_party",
    membershipRatio: "proportional_with_majority_control",
    termLength: "session_based",
    specialPowers: ["subpoena", "contempt", "investigation"]
  },
  PARLIAMENTARY_REPUBLIC: {
    chairSelection: "government_appointment",
    membershipRatio: "government_majority",
    termLength: "government_term",
    specialPowers: ["inquiry", "report", "recommendation"]
  },
  PARLIAMENTARY_MONARCHY_CONSTITUTIONAL: {
    chairSelection: "government_appointment", 
    membershipRatio: "government_majority",
    termLength: "government_term",
    specialPowers: ["inquiry", "report", "select_committee_creation"]
  },
  PARLIAMENTARY_MONARCHY_FEDERAL: {
    chairSelection: "government_appointment",
    membershipRatio: "federal_consultation",
    termLength: "government_term", 
    specialPowers: ["federal_inquiry", "provincial_coordination", "joint_committee"]
  },
  SEMI_PRESIDENTIAL_REPUBLIC: {
    chairSelection: "legislative_majority",
    membershipRatio: "legislative_control",
    termLength: "legislative_term",
    specialPowers: ["dual_oversight", "executive_inquiry", "constitutional_review"]
  },
  DIRECTORIAL_FEDERAL_REPUBLIC: {
    chairSelection: "consensual_rotation",
    membershipRatio: "cantonal_representation", 
    termLength: "federal_term",
    specialPowers: ["federal_coordination", "referendum_oversight", "collegial_review"]
  }
};

// Bills must go through different committee processes based on political system AND level
export const BILL_PROGRESSION_WORKFLOWS = {
  // City-level workflows (no committees for most US cities)
  CITY_COUNCIL: {
    introduction: {
      step: "proposal_submitted",
      requirements: ["sponsor_member"],
      duration: { min: 1, max: 3, unit: "days" }
    },
    public_review: {
      step: "public_comment_period",
      requirements: ["public_notice"],
      duration: { min: 7, max: 14, unit: "days" }
    },
    council_vote: {
      step: "council_vote",
      requirements: ["council_majority"],
      duration: { min: 1, max: 7, unit: "days" }
    }
  },
  
  // State/Federal workflows with committee systems
  PRESIDENTIAL_REPUBLIC: {
    introduction: {
      step: "committee_assignment",
      requirements: ["sponsor_member", "subject_matter_jurisdiction"],
      duration: { min: 1, max: 3, unit: "days" }
    },
    committee_stage: {
      step: "committee_markup",
      requirements: ["committee_majority", "public_hearing_option"],
      duration: { min: 14, max: 60, unit: "days" }
    },
    floor_stage: {
      step: "floor_consideration", 
      requirements: ["committee_approval", "scheduling"],
      duration: { min: 7, max: 30, unit: "days" }
    },
    second_chamber: {
      step: "other_chamber",
      requirements: ["bicameral_approval", "potential_conference"],
      duration: { min: 14, max: 90, unit: "days" }
    },
    executive: {
      step: "presidential_action",
      requirements: ["signature_or_veto", "veto_override_option"],
      duration: { min: 10, max: 10, unit: "days" }
    }
  },
  
  PARLIAMENTARY_REPUBLIC: {
    introduction: {
      step: "first_reading",
      requirements: ["government_agenda_or_private_member"],
      duration: { min: 1, max: 7, unit: "days" }
    },
    committee_stage: {
      step: "committee_review",
      requirements: ["select_committee_assignment", "party_whip_coordination"],
      duration: { min: 7, max: 30, unit: "days" }
    },
    report_stage: {
      step: "report_back",
      requirements: ["committee_report", "amendment_consideration"],
      duration: { min: 3, max: 14, unit: "days" }
    },
    final_reading: {
      step: "third_reading",
      requirements: ["final_debate", "party_vote"],
      duration: { min: 1, max: 7, unit: "days" }
    },
    executive: {
      step: "automatic_assent",
      requirements: ["ceremonial_approval_only"],
      duration: { min: 1, max: 3, unit: "days" }
    }
  },
  
  // Other systems follow similar patterns with variations...
};

export default {
  COMMITTEE_SYSTEMS,
  COMMITTEE_TYPES,
  COMMITTEE_MEMBERSHIP_RULES,
  BILL_PROGRESSION_WORKFLOWS
};