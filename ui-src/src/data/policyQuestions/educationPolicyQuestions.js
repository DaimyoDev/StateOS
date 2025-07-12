export const EDUCATION_POLICY_QUESTIONS = [
  {
    id: "education_funding",
    category: "Education",
    questionText: "What is your approach to public education funding?",
    options: [
      {
        text: "Massively Increase National/Regional Government Funding for Public Schools",
        value: "massive_increase_public_funding",
        ideologyEffect: {
          // Original: econ: -2.5, scope: 3.0, societal: -1.5
          economic: -3.0,
          social_traditionalism: -1.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 1.0,
          personal_liberty: -0.5,
          authority_structure: 1.5, // Stronger central role
          state_intervention_scope: 3.5,
          societal_focus: -2.0,
          rural_priority: 0.5,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support School Choice Mechanisms (e.g., vouchers, independent publicly-funded schools)",
        value: "school_choice_mechanisms",
        ideologyEffect: {
          // Original: econ: 1.5, scope: -2.0, societal: 1.5, authority: -2.0, personal_liberty: 2.0
          economic: 2.5, // More market-oriented
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.5,
          digitalization: 0.0,
          personal_liberty: 2.5, // Stronger choice emphasis
          authority_structure: -2.5, // More decentralized
          state_intervention_scope: -2.5, // Less direct state control
          societal_focus: 2.0, // More individual choice
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Focus on Local Funding & Control with Standardized Performance Metrics",
        value: "local_control_performance_metrics",
        ideologyEffect: {
          // Original: econ: 0.5, scope: -1.0, authority: -2.5
          economic: 0.8,
          social_traditionalism: 0.5,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5, // Metrics might involve digital systems
          personal_liberty: 0.5,
          authority_structure: -2.8, // Strong local control
          state_intervention_scope: -1.5, // National role mainly for metrics
          societal_focus: 0.0,
          rural_priority: 1.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Increase Teacher Salaries and Resources within Existing Budget Frameworks",
        value: "teacher_salaries_resources_existing_budgets",
        ideologyEffect: {
          // This is a moderate option, keep its effects relatively smaller
          economic: -0.8, // Still implies resource allocation
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: -0.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "student_loan_debt_higher_ed",
    category: "Education",
    questionText:
      "What should be done about student loan debt and higher education affordability?",
    options: [
      {
        text: "Implement Widespread Forgiveness or Cancellation of Student Loan Debt",
        value: "widespread_student_loan_forgiveness",
        ideologyEffect: {
          // Original: econ: -3.8, scope: 3.0, societal: -2.5
          economic: -4.0, // Max effect
          social_traditionalism: -1.0, // Progressive social policy
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0, // Impact on taxpayers
          authority_structure: 1.0,
          state_intervention_scope: 3.5, // Major state intervention
          societal_focus: -3.0, // Strong collective relief
          rural_priority: 0.0,
          governance_approach: 1.5, // Strong populist demand
        },
      },
      {
        text: "Offer Targeted Forgiveness and Income-Based Repayment Reform",
        value: "targeted_forgiveness_income_repayment_reform",
        ideologyEffect: {
          // Original: econ: -1.5, scope: 1.5, societal: -1.0
          economic: -2.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: 0.0,
          state_intervention_scope: 2.0,
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "No Widespread Forgiveness; Focus on Personal Responsibility and Existing Loan Terms",
        value: "no_forgiveness_personal_responsibility_loans",
        ideologyEffect: {
          // Original: econ: 2.5, scope: -2.0, societal: 3.0
          economic: 3.0,
          social_traditionalism: 1.0, // Emphasis on responsibility
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -0.5,
          state_intervention_scope: -2.5, // Less state intervention
          societal_focus: 3.5, // Strong individualism
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Make Public Higher Education Tuition-Free or Debt-Free",
        value: "tuition_free_debt_free_public_higher_ed",
        ideologyEffect: {
          // Original: econ: -3.8, scope: 3.8, societal: -3.0
          economic: -4.0, // Max effect
          social_traditionalism: -2.0, // Highly progressive
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Taxpayer burden, less choice
          authority_structure: 2.0,
          state_intervention_scope: 4.0, // Max state role
          societal_focus: -3.5, // Strong collective right
          rural_priority: 0.5,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "history_education_curriculum_national_narrative",
    category: "Education",
    questionText:
      "How should national history be taught in schools, particularly regarding controversial or difficult periods?",
    options: [
      {
        text: "Emphasize a Patriotic Narrative Focusing on National Achievements and Unity, Downplaying Divisive Aspects",
        value:
          "patriotic_narrative_national_achievements_unity_downplay_divisive_history",
        ideologyEffect: {
          // Original: social_trad: 3, sovereignty: 2, authority: 2, governance: -2
          economic: 0,
          social_traditionalism: 3.5, // Max traditional narrative
          sovereignty: 2.5, // Stronger nationalist narrative
          ecology: 0,
          theocratic: 0.5, // Can align with national religious identity
          digitalization: 0,
          personal_liberty: -1.0, // Less freedom of inquiry
          authority_structure: 2.0,
          state_intervention_scope: 1.5, // State influencing curriculum
          societal_focus: -0.5, // National unity as a collective goal
          rural_priority: 0,
          governance_approach: -2.5, // Strong institutional imposition
        },
      },
      {
        text: "Teach a Comprehensive and Critical History, Including Multiple Perspectives and Addressing Past Injustices and Controversies Openly",
        value:
          "comprehensive_critical_history_multiple_perspectives_past_injustices_controversies",
        ideologyEffect: {
          // Original: social_trad: -3, sovereignty: -1, authority: -1, governance: 1
          economic: 0,
          social_traditionalism: -3.8, // Max progressive/critical
          sovereignty: -1.5,
          ecology: 0,
          theocratic: -1.0, // Critical history often secular
          digitalization: 0,
          personal_liberty: 1.5, // Freedom of inquiry
          authority_structure: -1.5,
          state_intervention_scope: -0.5, // Less state narrative control
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 1.5, // Stronger populist "truth" appeal
        },
      },
      {
        text: "Allow Local Education Authorities and Teachers to Determine History Curriculum Based on Professional Standards and Community Input",
        value:
          "local_teacher_control_history_curriculum_professional_standards_community_input",
        ideologyEffect: {
          // Original: authority: -3, scope: -2, governance: 2
          economic: 0,
          social_traditionalism: 0.0, // Outcome varies by locality
          sovereignty: 0.8, // Local sovereignty
          ecology: 0,
          theocratic: 0.0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: -3.8, // Max decentralization
          state_intervention_scope: -2.5, // Max reduction in central state role
          societal_focus: 0.0,
          rural_priority: 0.5,
          governance_approach: 2.5, // Stronger local popular will
        },
      },
      {
        text: "Focus on Developing Historical Thinking Skills and Analysis of Primary Sources, Rather Than Prescribing a Single Narrative",
        value:
          "historical_thinking_skills_primary_source_analysis_no_single_narrative_history",
        ideologyEffect: {
          // Original: social_trad: -1, governance: 1
          economic: 0,
          social_traditionalism: -1.5, // Progressive pedagogy
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Accessing sources can be digital
          personal_liberty: 1.0,
          authority_structure: -0.5,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: 1.5, // Stronger student empowerment
        },
      },
    ],
  },
  {
    id: "sex_education_school_curriculum",
    category: "Education",
    questionText:
      "What should be the approach to sex education in public schools?",
    options: [
      {
        text: "Mandate Comprehensive, Medically Accurate Sex Education Including Consent, Contraception, and LGBTQ+ Issues",
        value: "comprehensive_medically_accurate_sex_ed_consent_lgbtq",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -3.8, // Highly progressive curriculum content
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -2.5, // Challenges traditional religious views on sex ed
          digitalization: 0.0,
          personal_liberty: 2.5, // Promotes bodily autonomy, informed choice for students
          authority_structure: 1.0, // National mandate implies central curriculum influence
          state_intervention_scope: 1.8, // State mandating specific curriculum
          societal_focus: -1.5, // Aimed at broad public health & social awareness
          rural_priority: 0.0,
          governance_approach: -0.5, // Usually expert/medically guided
        },
      },
      {
        text: "Emphasize Abstinence-Focused Education, with Limited Information on Contraception",
        value: "abstinence_focused_sex_ed_limited_contraception",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 3.8, // Highly traditional moral stance
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 2.8, // Often aligns with religious conservative views
          digitalization: 0.0,
          personal_liberty: -2.5, // Limits information, choice for students
          authority_structure: 0.5, // State/school enforcing a moral stance
          state_intervention_scope: 1.0, // State promoting specific moral curriculum
          societal_focus: -1.0, // Community moral standards prioritized
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Allow Local School Districts or Parents to Determine the Content of Sex Education Curriculum",
        value: "local_parental_control_sex_ed_curriculum",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 1.8, // Allows for traditional views to dominate locally
          sovereignty: 0.8, // Local community sovereignty
          ecology: 0.0,
          theocratic: 1.5, // Facilitates religiously influenced local curricula
          digitalization: 0.0,
          personal_liberty: 0.8, // Parental liberty over child's education content
          authority_structure: -3.5, // Highly decentralized to local/parental level
          state_intervention_scope: -2.5, // Minimal central state mandate
          societal_focus: 0.8, // Family/local community focus
          rural_priority: 0.5,
          governance_approach: 1.8, // Can be framed as populist "parental rights"
        },
      },
      {
        text: "Focus on Healthy Relationships, Disease Prevention, and Bodily Autonomy",
        value:
          "healthy_relationships_disease_prevention_bodily_autonomy_sex_ed",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.5, // Progressive framing
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.8, // Secular health focus
          digitalization: 0.0,
          personal_liberty: 1.8, // Emphasizes bodily autonomy
          authority_structure: -0.5,
          state_intervention_scope: 0.8, // Public health education
          societal_focus: -0.8, // Public health good
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "higher_education_cost_access", // From Amplification Batch 2
    category: "Education",
    questionText:
      "How should the government address the high cost of higher education and student access?",
    options: [
      {
        text: "Make Public Higher Education Tuition-Free and Cancel Existing Student Debt",
        value: "tuition_free_cancel_debt_higher_ed",
        ideologyEffect: {
          economic: -3.8,
          social_traditionalism: -2.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: -0.5,
          digitalization: 0,
          personal_liberty: -1.5, // Tax burden
          authority_structure: 1.5,
          state_intervention_scope: 3.8, // Max state role
          societal_focus: -3.5, // Strong collectivist
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Offer Targeted Aid, Income-Based Repayment, and Encourage Universities to Control Costs",
        value: "targeted_aid_income_based_repayment_higher_ed",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 1.8, // Stronger scope
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Promote Private Sector Solutions, Online Education, and Vocational Training as Alternatives",
        value: "private_solutions_online_vocational_higher_ed",
        ideologyEffect: {
          economic: 2.5,
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.5, // Stronger digital focus
          personal_liberty: 2.0,
          authority_structure: -1.0,
          state_intervention_scope: -2.0,
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Hold Universities Accountable for Costs and Student Outcomes; No Widespread Debt Forgiveness",
        value: "universities_accountable_costs_student_outcomes_higher_ed",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: 1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.0,
          personal_liberty: 0.5, // Personal responsibility for loans
          authority_structure: 0.5,
          state_intervention_scope: -1.0, // Focus on accountability not direct funding increase/forgiveness
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "standardized_testing_education_assessment",
    category: "Education",
    questionText:
      "What role should standardized testing play in K-12 education assessment and accountability?",
    options: [
      {
        text: "Significantly Reduce Reliance on Standardized Tests; Focus on Diverse Assessment Methods (e.g., Portfolios, Projects, Teacher Evaluations)",
        value: "reduce_reliance_standardized_tests_diverse_assessment_methods",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -2.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -0.5,
          personal_liberty: 1.8,
          authority_structure: -2.8,
          state_intervention_scope: -1.5,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: 2.8,
        },
      },
      {
        text: "Use Standardized Tests as One Key Tool for Accountability, Identifying Achievement Gaps, and Ensuring Educational Standards",
        value:
          "standardized_tests_key_tool_accountability_achievement_gaps_standards",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 1.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: -1.0,
          authority_structure: 2.8,
          state_intervention_scope: 1.8,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -2.8,
        },
      },
      {
        text: "Eliminate Nationally Mandated Standardized Tests; Leave Assessment Decisions to Regional or Local Education Authorities",
        value:
          "eliminate_national_standardized_tests_leave_regional_local_assessment",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5,
          sovereignty: 0.8,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -3.8,
          state_intervention_scope: -2.8,
          societal_focus: 0.8,
          rural_priority: 0.5,
          governance_approach: 1.8,
        },
      },
      {
        text: "Reform Standardized Tests to Better Measure Critical Thinking, Problem-Solving, and Creativity, Rather Than Rote Memorization",
        value: "reform_standardized_tests_measure_critical_thinking_creativity",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -2.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: -0.8,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "arts_humanities_stem_education_balance",
    category: "Education",
    questionText:
      "How should funding and emphasis be balanced between STEM fields (Science, Technology, Engineering, Math) and Arts/Humanities in education?",
    options: [
      {
        text: "Increase Funding and Curricular Emphasis on Arts and Humanities to Foster Creativity, Critical Thinking, and Cultural Understanding",
        value:
          "increase_arts_humanities_funding_emphasis_creativity_critical_thinking",
        ideologyEffect: {
          economic: -1.8,
          social_traditionalism: -2.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -1.5,
          personal_liberty: 0.5,
          authority_structure: 0.5,
          state_intervention_scope: 1.8,
          societal_focus: -1.8,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Prioritize STEM Funding and Education to Meet Economic Demands, Drive Innovation, and Ensure Global Competitiveness",
        value:
          "prioritize_stem_funding_education_economic_demands_innovation_competitiveness",
        ideologyEffect: {
          economic: 1.8,
          social_traditionalism: 0.5,
          sovereignty: 1.8,
          ecology: 0,
          theocratic: 0,
          digitalization: 3.0,
          personal_liberty: 0,
          authority_structure: 1.0,
          state_intervention_scope: 1.8,
          societal_focus: 1.8,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Maintain a Balanced Approach with Equitable Funding and Emphasis for All Disciplines, Recognizing Their Interconnectedness",
        value: "balanced_funding_emphasis_all_disciplines_interconnectedness",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Promote Integration of Arts and Design into STEM Education (STEAM) to Enhance Innovation and Holistic Learning",
        value:
          "integrate_arts_design_steam_education_innovation_holistic_learning",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: -1.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 0.5,
          authority_structure: 0,
          state_intervention_scope: 0.8,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
];
