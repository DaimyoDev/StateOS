// src/components/game_tabs/EducationTab.jsx

import React, { useState, useEffect } from "react";
import useGameStore from "../../store";
import "./EducationTab.css";

const EducationTab = () => {
  const {
    schoolDistricts,
    studentCoalitions,
    nationalStats,
    economicImpact,
    policyEffectiveness,
    actions
  } = useGameStore();

  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Initialize education system on first load
  useEffect(() => {
    if (schoolDistricts.size === 0) {
      actions.initializeEducationSystem();
    }
  }, [schoolDistricts.size, actions]);

  const selectedDistrict = selectedDistrictId ? 
    schoolDistricts.get(selectedDistrictId) : 
    Array.from(schoolDistricts.values())[0];
  
  const districtCoalitions = selectedDistrict ? 
    Array.from(studentCoalitions.values()).filter(c => c.districtId === selectedDistrict.id) : 
    [];

  const handlePolicyImplementation = (policyType, strength = 0.5) => {
    actions.implementEducationPolicy({
      id: `${policyType}_${Date.now()}`,
      name: formatPolicyName(policyType),
      type: policyType,
      strength: strength,
      cost: calculatePolicyCost(policyType, strength),
      description: getPolicyDescription(policyType)
    });
  };

  const formatPolicyName = (type) => {
    const names = {
      funding: "Increase Education Funding",
      vocationalPrograms: "Expand Vocational Programs", 
      classSize: "Reduce Class Sizes",
      tutoring: "After-School Tutoring Programs",
      technology: "Technology Upgrade Initiative",
      mentorship: "Student Mentorship Program"
    };
    return names[type] || type;
  };

  const getPolicyDescription = (type) => {
    const descriptions = {
      funding: "Increase per-pupil funding to improve resources and teacher quality",
      vocationalPrograms: "Create more trade and technical education pathways",
      classSize: "Hire more teachers to reduce student-to-teacher ratios",
      tutoring: "Provide additional academic support for struggling students",
      technology: "Upgrade computer labs and digital learning resources",
      mentorship: "Connect students with community mentors and role models"
    };
    return descriptions[type] || "";
  };

  const calculatePolicyCost = (type, strength) => {
    const baseCosts = {
      funding: 1000000,
      vocationalPrograms: 500000,
      classSize: 750000,
      tutoring: 300000,
      technology: 400000,
      mentorship: 200000
    };
    return Math.floor((baseCosts[type] || 500000) * strength);
  };

  if (schoolDistricts.size === 0) {
    return (
      <div className="education-tab-container">
        <h2 className="tab-title">Education System</h2>
        <div className="loading-message">
          <p>Initializing education system...</p>
          <button 
            className="action-button"
            onClick={() => actions.initializeEducationSystem()}
          >
            Initialize Education System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="education-tab-container">
      <h2 className="tab-title">Education Management</h2>
      <p className="tab-description">
        Manage your city's education system through policy decisions that affect different student populations.
      </p>

      {/* Tab Navigation */}
      <div className="education-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "districts" ? "active" : ""}
          onClick={() => setActiveTab("districts")}
        >
          School Districts
        </button>
        <button
          className={activeTab === "policies" ? "active" : ""}
          onClick={() => setActiveTab("policies")}
        >
          Policy Tools
        </button>
        <button
          className={activeTab === "outcomes" ? "active" : ""}
          onClick={() => setActiveTab("outcomes")}
        >
          Outcomes & Impact
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="tab-content">
          <section className="info-card national-stats">
            <h3>National Education Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Graduation Rate</span>
                <span className="stat-value">{nationalStats.averageGraduationRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dropout Rate</span>
                <span className="stat-value danger">{nationalStats.averageDropoutRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Test Score</span>
                <span className="stat-value">{nationalStats.averageTestScore?.toFixed(0) || 0}/100</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">College Enrollment</span>
                <span className="stat-value">{nationalStats.collegeEnrollmentRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trade Enrollment</span>
                <span className="stat-value">{nationalStats.tradeEnrollmentRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Student-Teacher Ratio</span>
                <span className="stat-value">{nationalStats.studentTeacherRatio?.toFixed(1) || 20}:1</span>
              </div>
            </div>
          </section>

          <section className="info-card economic-impact">
            <h3>Economic Impact</h3>
            <div className="impact-grid">
              <div className="impact-item">
                <span className="impact-label">Annual Tax Revenue</span>
                <span className="impact-value positive">${(economicImpact.totalTaxRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Social Costs</span>
                <span className="impact-value negative">${(economicImpact.socialCosts || 0).toLocaleString()}</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Workforce Quality Index</span>
                <span className="impact-value">{economicImpact.workforceQuality || 50}/100</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Districts Tab */}
      {activeTab === "districts" && (
        <div className="tab-content">
          <section className="info-card district-selector">
            <h3>Select School District</h3>
            <select 
              value={selectedDistrictId || ""}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="district-dropdown"
            >
              {Array.from(schoolDistricts.values()).map(district => (
                <option key={district.id} value={district.id}>
                  {district.name} ({district.totalStudents} students)
                </option>
              ))}
            </select>
          </section>

          {selectedDistrict && (
            <>
              <section className="info-card district-info">
                <h3>{selectedDistrict.name}</h3>
                <div className="district-stats">
                  <p><strong>Total Students:</strong> {selectedDistrict.totalStudents.toLocaleString()}</p>
                  <p><strong>Schools:</strong> {selectedDistrict.schools}</p>
                  <p><strong>Per-Student Funding:</strong> ${selectedDistrict.funding.perStudent.toLocaleString()}</p>
                  <p><strong>Teacher-Student Ratio:</strong> {selectedDistrict.metrics.teacherStudentRatio}:1</p>
                </div>
              </section>

              <section className="info-card student-coalitions">
                <h3>Student Populations</h3>
                <div className="coalitions-grid">
                  {districtCoalitions.map(coalition => (
                    <div key={coalition.id} className="coalition-card">
                      <h4 className="coalition-name">{coalition.name}</h4>
                      <div className="coalition-details">
                        <p><span className="detail-label">Students:</span> {coalition.studentCount}</p>
                        <p><span className="detail-label">SES Level:</span> {coalition.ses.replace('_', ' ')}</p>
                        <p><span className="detail-label">Academic Score:</span> {coalition.currentAcademicScore.toFixed(0)}/100</p>
                        <p><span className="detail-label">College Aspiration:</span> {(coalition.collegeAspiration * 100).toFixed(0)}%</p>
                        <p><span className="detail-label">Trade Interest:</span> {(coalition.tradeInterest * 100).toFixed(0)}%</p>
                        <p><span className="detail-label">Dropout Risk:</span> {(coalition.dropoutRisk * 100).toFixed(1)}%</p>
                        <p><span className="detail-label">Engagement:</span> {coalition.engagement.toFixed(0)}/100</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === "policies" && (
        <div className="tab-content">
          <section className="info-card policy-tools">
            <h3>Education Policy Tools</h3>
            <p>Implement policies to improve educational outcomes for different student populations.</p>
            
            <div className="policies-grid">
              <div className="policy-card">
                <h4>Increase Funding</h4>
                <p>Boost per-student funding to improve resources and attract better teachers.</p>
                <p><strong>Best for:</strong> All students, especially low SES</p>
                <button 
                  className="action-button"
                  onClick={() => handlePolicyImplementation("funding", 0.6)}
                >
                  Implement (+$1M cost)
                </button>
              </div>

              <div className="policy-card">
                <h4>Vocational Programs</h4>
                <p>Expand trade and technical education to provide career pathways.</p>
                <p><strong>Best for:</strong> Working class, practical-oriented students</p>
                <button 
                  className="action-button"
                  onClick={() => handlePolicyImplementation("vocationalPrograms", 0.7)}
                >
                  Implement (+$500K cost)
                </button>
              </div>

              <div className="policy-card">
                <h4>Reduce Class Sizes</h4>
                <p>Hire more teachers to provide more individualized attention.</p>
                <p><strong>Best for:</strong> All students, improves engagement</p>
                <button 
                  className="action-button"
                  onClick={() => handlePolicyImplementation("classSize", 0.5)}
                >
                  Implement (+$750K cost)
                </button>
              </div>

              <div className="policy-card">
                <h4>Tutoring Programs</h4>
                <p>After-school support for struggling students.</p>
                <p><strong>Best for:</strong> At-risk students, low SES families</p>
                <button 
                  className="action-button"
                  onClick={() => handlePolicyImplementation("tutoring", 0.8)}
                >
                  Implement (+$300K cost)
                </button>
              </div>

              <div className="policy-card">
                <h4>Technology Upgrade</h4>
                <p>Modernize computer labs and digital learning resources.</p>
                <p><strong>Best for:</strong> High-achieving, tech-oriented students</p>
                <button 
                  className="action-button"
                  onClick={() => handlePolicyImplementation("technology", 0.6)}
                >
                  Implement (+$400K cost)
                </button>
              </div>

              <div className="policy-card">
                <h4>Mentorship Programs</h4>
                <p>Connect students with community mentors and role models.</p>
                <p><strong>Best for:</strong> At-risk students, immigrant families</p>
                <button 
                  className="action-button"
                  onClick={() => handlePolicyImplementation("mentorship", 0.9)}
                >
                  Implement (+$200K cost)
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Outcomes Tab */}
      {activeTab === "outcomes" && (
        <div className="tab-content">
          <section className="info-card policy-effectiveness">
            <h3>Policy Effectiveness</h3>
            {policyEffectiveness.size > 0 ? (
              <div className="effectiveness-list">
                {Array.from(policyEffectiveness.entries()).map(([policyId, effectiveness]) => (
                  <div key={policyId} className="effectiveness-item">
                    <h4>{effectiveness.policy}</h4>
                    <p><strong>Effectiveness Score:</strong> {effectiveness.effectivenessScore?.toFixed(1) || 0}</p>
                    <p><strong>Graduation Rate Impact:</strong> {effectiveness.improvements?.graduationRate?.toFixed(1) || 0}%</p>
                    <p><strong>Dropout Rate Reduction:</strong> {effectiveness.improvements?.dropoutRate?.toFixed(1) || 0}%</p>
                    <p><strong>Test Score Improvement:</strong> {effectiveness.improvements?.testScore?.toFixed(1) || 0} points</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No policies implemented yet. Use the Policy Tools tab to implement education policies.</p>
            )}
          </section>

          <section className="info-card future-projections">
            <h3>Long-term Economic Impact</h3>
            <p>Education investments today will affect your city's economy in the future:</p>
            <ul>
              <li><strong>Higher graduation rates</strong> → More skilled workforce → Higher tax revenue</li>
              <li><strong>Lower dropout rates</strong> → Reduced social costs → More budget for other priorities</li>
              <li><strong>More trade graduates</strong> → Stronger middle class → Economic stability</li>
              <li><strong>More college graduates</strong> → Innovation economy → Higher-paying jobs</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default EducationTab;