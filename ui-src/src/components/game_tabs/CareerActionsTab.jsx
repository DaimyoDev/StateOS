// ui-src/src/scenes/CareerActionsTab.jsx
import React, { useMemo, useState, useEffect } from "react";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./CareerActionsTab.css";
import { getTimeUntil, createDateObj } from "../../utils/generalUtils";
import BillAuthoringModal from "../modals/BillAuthoringModal";
import ResumeViewerModal from "../modals/ResumeViewerModal";
import NegotiationModal from "../modals/NegotiationModal";
import StaffQuizModal from "../modals/StaffQuizModal";
import StaffInterviewModal from "../modals/StaffInterviewModal";

// Updated helper function
const formatTimeUntil = (currentDateObj, futureDateObj, outcomeStatus) => {
  if (
    ["passed", "failed", "enacted", "concluded"].includes(
      outcomeStatus?.toLowerCase()
    )
  ) {
    return outcomeStatus.charAt(0).toUpperCase() + outcomeStatus.slice(1);
  }
  if (
    !currentDateObj ||
    !futureDateObj ||
    isNaN(currentDateObj.getTime()) ||
    isNaN(futureDateObj.getTime())
  ) {
    return "Date N/A";
  }
  return getTimeUntil(currentDateObj, futureDateObj, outcomeStatus);
};

// --- Sub-Tab Components ---

const ElectionsSubTab = ({
  availableElectionsToRunIn,
  handleDeclareCandidacy,
  currentDate,
  playerIsCurrentlyCandidate,
}) => {
  const activePlayerElection = useGameStore((state) =>
    state.activeCampaign.elections.find(
      (e) => e.playerIsCandidate && e.outcome?.status === "upcoming"
    )
  );

  return (
    <div className="sub-tab-content">
      <section className="info-card available-offices-card">
        <h3>Run for Office</h3>
        {availableElectionsToRunIn.length > 0 ? (
          <ul className="office-list">
            {availableElectionsToRunIn.map((election) => {
              const currentDateObj = createDateObj(currentDate);
              const electionDateObj = createDateObj(election.electionDate);
              return (
                <li key={election.id} className="office-list-item">
                  <div className="office-info">
                    <span className="office-name1">{election.officeName}</span>
                    <span className="office-details">
                      Level: {election.level?.replace(/_/g, " ") || "N/A"} |
                      Election: {election.electionDate?.month}/
                      {election.electionDate?.day}/{election.electionDate?.year}{" "}
                      (
                      {currentDateObj && electionDateObj
                        ? formatTimeUntil(
                            currentDateObj,
                            electionDateObj,
                            election.outcome?.status
                          )
                        : "Date N/A"}
                      )
                    </span>
                  </div>
                  <button
                    className="action-button small-button"
                    onClick={() => handleDeclareCandidacy(election.id)}
                    disabled={playerIsCurrentlyCandidate}
                    title={
                      playerIsCurrentlyCandidate
                        ? "You are already running in an election."
                        : `Declare candidacy for ${election.officeName}`
                    }
                  >
                    Declare
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>
            No immediate suitable offices available to run for (check filing
            deadlines and if you are already a candidate in an upcoming
            election).
          </p>
        )}
      </section>
      {playerIsCurrentlyCandidate && (
        <section className="info-card current-campaign-info">
          <h4>Your Current Campaign</h4>
          {activePlayerElection ? (
            <p>You are running for: {activePlayerElection.officeName}</p>
          ) : (
            <p>You are not currently registered in an upcoming election.</p>
          )}
        </section>
      )}
    </div>
  );
};

const JobsSubTab = ({ campaignData, actions }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const playerPolitician = campaignData?.politician;
  const currentJob = playerPolitician?.currentJob;

  // Available jobs with different career paths
  const availableJobs = useMemo(() => [
    {
      id: "law_firm_associate",
      title: "Law Firm Associate",
      category: "Legal",
      salary: 8500,
      timeCommitment: 6, // hours per day
      requirements: {
        education: "Law Degree",
        skills: ["Negotiation", "Research"]
      },
      benefits: {
        income: 8500,
        networkingBonus: 15,
        skillDevelopment: ["Oratory", "Strategy"]
      },
      description: "Work at a prestigious law firm, building legal expertise and professional networks."
    },
    {
      id: "consultant_analyst",
      title: "Political Consultant",
      category: "Consulting",
      salary: 7200,
      timeCommitment: 5,
      requirements: {
        experience: "Some political experience",
        skills: ["Analysis", "Communication"]
      },
      benefits: {
        income: 7200,
        politicalConnections: 20,
        skillDevelopment: ["Strategy", "Fundraising"]
      },
      description: "Advise clients on political strategy and campaign management."
    },
    {
      id: "nonprofit_director",
      title: "Nonprofit Director",
      category: "Public Service",
      salary: 5800,
      timeCommitment: 4,
      requirements: {
        experience: "Management experience",
        skills: ["Leadership", "Community Relations"]
      },
      benefits: {
        income: 5800,
        communityStanding: 25,
        skillDevelopment: ["Public Speaking", "Organization"]
      },
      description: "Lead a nonprofit organization focused on community issues."
    },
    {
      id: "business_executive",
      title: "Corporate Executive",
      category: "Business",
      salary: 12000,
      timeCommitment: 7,
      requirements: {
        education: "Business degree preferred",
        skills: ["Management", "Finance"]
      },
      benefits: {
        income: 12000,
        businessConnections: 30,
        skillDevelopment: ["Fundraising", "Negotiation"]
      },
      description: "High-paying executive role with significant business networking opportunities."
    },
    {
      id: "university_lecturer",
      title: "University Lecturer",
      category: "Academia",
      salary: 6200,
      timeCommitment: 4,
      requirements: {
        education: "Advanced degree",
        skills: ["Research", "Teaching"]
      },
      benefits: {
        income: 6200,
        intellectualCredibility: 20,
        skillDevelopment: ["Oratory", "Research"]
      },
      description: "Teach and conduct research while maintaining flexible schedule for political activities."
    },
    {
      id: "media_commentator",
      title: "Media Commentator",
      category: "Media",
      salary: 7800,
      timeCommitment: 3,
      requirements: {
        experience: "Public speaking experience",
        skills: ["Communication", "Current Affairs"]
      },
      benefits: {
        income: 7800,
        publicVisibility: 35,
        skillDevelopment: ["Public Speaking", "Media Relations"]
      },
      description: "Regular appearances on news programs and political shows."
    }
  ], []);

  const handleApplyForJob = (jobId) => {
    const job = availableJobs.find(j => j.id === jobId);
    if (job && actions.applyForJob) {
      actions.applyForJob(job);
      actions.addToast?.({
        message: `Applied for ${job.title}! You will start earning $${job.salary.toLocaleString()}/month.`,
        type: "success"
      });
    }
  };

  const handleQuitJob = () => {
    if (actions.quitJob) {
      actions.quitJob();
      actions.addToast?.({
        message: "You have quit your job.",
        type: "info"
      });
    }
  };

  return (
    <div className="sub-tab-content">
      {currentJob && (
        <section className="info-card current-job-card">
          <h3>Current Employment</h3>
          <div className="job-details">
            <p><strong>Position:</strong> {currentJob.title}</p>
            <p><strong>Category:</strong> {currentJob.category}</p>
            <p><strong>Monthly Salary:</strong> ${currentJob.salary?.toLocaleString()}</p>
            <p><strong>Daily Time:</strong> {currentJob.timeCommitment} hours</p>
            <p><strong>Remaining Work Hours:</strong> {playerPolitician.workingHours || 0}</p>
          </div>
          <button 
            className="button-delete small-button"
            onClick={handleQuitJob}
          >
            Quit Job
          </button>
        </section>
      )}
      
      <section className="info-card available-jobs-card">
        <h3>Available Positions</h3>
        {!currentJob ? (
          <p>Choose a career path to generate income and build your political profile:</p>
        ) : (
          <p>Other career opportunities (you can switch jobs, but will lose current position):</p>
        )}
        
        <ul className="jobs-list">
          {availableJobs.map((job) => (
            <li key={job.id} className="job-list-item">
              <div className="job-info">
                <span className="job-title">{job.title}</span>
                <span className="job-category">({job.category})</span>
                <div className="job-details">
                  <p><strong>Salary:</strong> ${job.salary.toLocaleString()}/month</p>
                  <p><strong>Time:</strong> {job.timeCommitment} hours/day</p>
                  <p><strong>Benefits:</strong> 
                    {Object.entries(job.benefits)
                      .filter(([key]) => key !== 'income')
                      .map(([key, value]) => 
                        ` ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: +${value}`
                      )
                      .join(',')}
                  </p>
                </div>
                <p className="job-description">{job.description}</p>
              </div>
              <button
                className="action-button small-button"
                onClick={() => handleApplyForJob(job.id)}
                disabled={currentJob?.id === job.id}
                title={
                  currentJob?.id === job.id 
                    ? "You already have this job" 
                    : `Apply for ${job.title}`
                }
              >
                {currentJob?.id === job.id ? "Current" : "Apply"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const OfficeSubTab = ({
  campaignData,
  actions,
  canPerformMajorAction,
  selectedIssueToAddress,
  setSelectedIssueToAddress,
  setIsBillModalOpen,
}) => {
  const playerPolitician = campaignData?.politician;
  const playerCurrentOfficeName = playerPolitician?.currentOffice;
  const treasury = playerPolitician?.treasury;
  const startingCity = campaignData?.startingCity;
  const addressIssueCost = 250;
  const addressIssueTimeCost = 4; // Takes 4 hours
  const { addressKeyCityIssue } = actions;

  if (!playerCurrentOfficeName) {
    return (
      <div className="sub-tab-content">
        <section className="info-card">
          <h3>My Office</h3>
          <p>
            You do not currently hold a public office. Consider running in an
            election!
          </p>
        </section>
      </div>
    );
  }

  const officeDetailsInCampaign = campaignData.governmentOffices?.find(
    (off) =>
      off.officeName === playerCurrentOfficeName &&
      off.holder?.id === playerPolitician?.id
  );

  return (
    <div className="sub-tab-content">
      <section className="info-card current-office-details">
        <h3>Details: {playerCurrentOfficeName}</h3>
        {officeDetailsInCampaign?.termEnds && (
          <p>
            <strong>Term Ends:</strong>{" "}
            {`${officeDetailsInCampaign.termEnds.month}/${officeDetailsInCampaign.termEnds.day}/${officeDetailsInCampaign.termEnds.year}`}
          </p>
        )}
        <p>
          <strong>Responsibilities:</strong> (Placeholder)
        </p>
        <p>
          <strong>Powers:</strong> (Placeholder)
        </p>
      </section>

      <section className="info-card current-role-actions">
        <h3>Actions as {playerCurrentOfficeName}</h3>
        <div className="action-group">
          <label htmlFor="issueSelect">Address Key City Issue:</label>
          <select
            id="issueSelect"
            value={selectedIssueToAddress}
            onChange={(e) => setSelectedIssueToAddress(e.target.value)}
            disabled={playerPolitician.workingHours < addressIssueTimeCost}
          >
            {startingCity?.stats?.mainIssues &&
            startingCity.stats.mainIssues.length > 0 ? (
              startingCity.stats.mainIssues.map((issue) => (
                <option key={issue} value={issue}>
                  {issue}
                </option>
              ))
            ) : (
              <option value="">No key issues identified</option>
            )}
          </select>
          <button
            className="action-button"
            onClick={() => {
              if (playerPolitician.workingHours < addressIssueTimeCost) {
                actions.addToast({
                  message: "Not enough time left today to do this.",
                  type: "info",
                });
                return;
              }
              if (
                selectedIssueToAddress &&
                startingCity?.stats?.mainIssues?.includes(
                  selectedIssueToAddress
                )
              ) {
                addressKeyCityIssue(selectedIssueToAddress);
              } else if (actions.addToast) {
                actions.addToast({
                  message: "Please select a valid issue to address.",
                  type: "info",
                });
              }
            }}
            disabled={
              !selectedIssueToAddress ||
              (treasury || 0) < addressIssueCost ||
              (!(
                startingCity?.stats?.mainIssues &&
                startingCity.stats.mainIssues.length > 0
              ) &&
                playerPolitician.workingHours < addressIssueTimeCost)
            }
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major action already taken today"
                : (treasury || 0) < addressIssueCost
                ? `Need $${addressIssueCost} (Personal Treasury)`
                : !selectedIssueToAddress ||
                  !(
                    startingCity?.stats?.mainIssues &&
                    startingCity.stats.mainIssues.length > 0
                  )
                ? "No issue selected or available"
                : `Address "${selectedIssueToAddress}" (Cost: $${addressIssueCost})`
            }
          >
            Address Issue (${addressIssueCost})
          </button>
        </div>
        <div className="action-sub-group">
          <button
            className="action-button"
            onClick={() => setIsBillModalOpen(true)} // Change this onClick
            disabled={!canPerformMajorAction}
            title={
              !canPerformMajorAction
                ? "Major action already taken today"
                : "Author a new bill"
            }
          >
            Author & Propose Bill
          </button>
        </div>
        <div className="action-button-group">
          <button className="action-button" disabled title="Coming Soon!">
            Attend Key Meeting
          </button>
          <button className="action-button" disabled title="Coming Soon!">
            Address Constituents
          </button>
        </div>
      </section>
    </div>
  );
};

const ActionsSubTab = ({
  campaignData,
  actions,
  canPerformMajorAction,
  oratorySkillCost,
  publicAppearanceCost,
}) => {
  const {
    fundraise,
    improveSkillOratory,
    networkWithParty,
    makePublicAppearance,
  } = actions;
  const playerPolitician = campaignData?.politician;
  const partyInfo = campaignData?.partyInfo;
  const treasury = playerPolitician?.treasury;
  const campaignFunds = playerPolitician?.campaignFunds;

  return (
    <div className="sub-tab-content">
      <section className="info-card personal-actions">
        <h3>Personal & Political Development</h3>
        <p>
          <strong>Personal Treasury:</strong> $
          {treasury != null ? treasury.toLocaleString() : "N/A"}
        </p>
        <p>
          <strong>Campaign Funds:</strong> $
          {campaignFunds != null ? campaignFunds.toLocaleString() : "N/A"}
        </p>
        <div className="action-button-group">
          <button
            className="action-button"
            onClick={fundraise}
            disabled={!canPerformMajorAction}
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major campaign action already taken today."
                : "Raise funds for your campaign efforts."
            }
          >
            Campaign Fundraising
          </button>
          <button
            className="action-button"
            onClick={improveSkillOratory}
            disabled={(treasury || 0) < oratorySkillCost}
            title={
              // REINTRODUCED TITLE
              (treasury || 0) < oratorySkillCost
                ? `Need $${oratorySkillCost} (Personal Treasury)`
                : `Cost: $${oratorySkillCost} (Personal Treasury)`
            }
          >
            Improve Skill: Oratory
          </button>
          <button
            className="action-button"
            onClick={networkWithParty}
            disabled={!partyInfo || partyInfo.type === "independent"}
            title={
              // REINTRODUCED TITLE
              !partyInfo || partyInfo.type === "independent"
                ? "Join a party to network"
                : "Strengthen party ties"
            }
          >
            Network with Party Officials
          </button>
          <button
            className="action-button"
            onClick={makePublicAppearance}
            disabled={
              !canPerformMajorAction || (treasury || 0) < publicAppearanceCost
            }
            title={
              // REINTRODUCED TITLE
              !canPerformMajorAction
                ? "Major action already taken today"
                : (treasury || 0) < publicAppearanceCost
                ? `Need $${publicAppearanceCost} (Personal Treasury)`
                : `Cost: $${publicAppearanceCost} (Personal Treasury), Boosts Approval`
            }
          >
            Make Public Appearance
          </button>
        </div>
      </section>
    </div>
  );
};

const EMPTY_ARRAY = [];

const StaffSubTab = () => {
  // State to control modal visibility
  const [viewingResumeId, setViewingResumeId] = useState(null);
  const [negotiatingId, setNegotiatingId] = useState(null);
  const [quizzingId, setQuizzingId] = useState(null);
  const [interviewingId, setInterviewingId] = useState(null);

  // Select state from the store individually for performance
  const talentPool = useGameStore((state) => state.talentPool || EMPTY_ARRAY);
  const hiredStaff = useGameStore((state) => state.hiredStaff || EMPTY_ARRAY);
  const actions = useGameStore((state) => state.actions);

  // Memoized check to see if an HR Director is currently hired
  const hasHRDirector = useMemo(
    () => hiredStaff.some((s) => s.role === "HR Director"),
    [hiredStaff]
  );

  const { scoutStaffCandidate, reviewResume, fireStaff, vetCandidateWithHR } =
    actions;

  // Renders the correct sequence of action buttons based on scouting progress
  const getScoutingActions = (staff) => {
    switch (staff.scoutingLevel) {
      case "unscouted":
        return (
          <button
            className="menu-button small-button"
            onClick={() => scoutStaffCandidate(staff.id)}
          >
            Scout ($250)
          </button>
        );
      case "scouted":
        return (
          <button
            className="action-button small-button"
            onClick={() => {
              reviewResume(staff.id);
              setViewingResumeId(staff.id);
            }}
          >
            Review Resume
          </button>
        );
      case "resume_reviewed":
        return (
          <>
            <button
              className="action-button small-button"
              onClick={() => setViewingResumeId(staff.id)}
            >
              View Resume
            </button>
            <button
              className="action-button small-button"
              onClick={() => setInterviewingId(staff.id)}
            >
              Conduct Interview
            </button>
            <button
              className="action-button small-button"
              onClick={() => setQuizzingId(staff.id)}
            >
              Take Quiz
            </button>
          </>
        );
      case "interviewed":
        return (
          <>
            <button
              className="action-button small-button"
              onClick={() => setViewingResumeId(staff.id)}
            >
              View Resume
            </button>
            {staff.quizScore === null && (
              <button
                className="action-button small-button"
                onClick={() => setQuizzingId(staff.id)}
              >
                Take Quiz
              </button>
            )}
            {hasHRDirector && (
              <button
                className="action-button small-button"
                onClick={() => vetCandidateWithHR(staff.id)}
              >
                Vet with HR
              </button>
            )}
            <button
              className="action-button small-button success-button"
              onClick={() => setNegotiatingId(staff.id)}
            >
              Negotiate
            </button>
          </>
        );
      case "quizzed":
        return (
          <>
            <button
              className="action-button small-button"
              onClick={() => setViewingResumeId(staff.id)}
            >
              View Resume
            </button>
            {!staff.revealedPriorities.length && (
              <button
                className="action-button small-button"
                onClick={() => setInterviewingId(staff.id)}
              >
                Conduct Interview
              </button>
            )}
            {hasHRDirector && (
              <button
                className="action-button small-button"
                onClick={() => vetCandidateWithHR(staff.id)}
              >
                Vet with HR
              </button>
            )}
            <button
              className="action-button small-button success-button"
              onClick={() => setNegotiatingId(staff.id)}
            >
              Negotiate
            </button>
          </>
        );
      case "vetted":
        return (
          <>
            <button
              className="action-button small-button"
              onClick={() => setViewingResumeId(staff.id)}
            >
              View Resume
            </button>
            <button
              className="action-button small-button success-button"
              onClick={() => setNegotiatingId(staff.id)}
            >
              Offer Job
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Render modals conditionally based on state */}
      {viewingResumeId && (
        <ResumeViewerModal
          staffId={viewingResumeId}
          onClose={() => setViewingResumeId(null)}
        />
      )}
      {negotiatingId && (
        <NegotiationModal
          staffId={negotiatingId}
          onClose={() => setNegotiatingId(null)}
        />
      )}
      {quizzingId && (
        <StaffQuizModal
          staffId={quizzingId}
          onClose={() => setQuizzingId(null)}
        />
      )}
      {interviewingId && (
        <StaffInterviewModal
          staffId={interviewingId}
          onClose={() => setInterviewingId(null)}
        />
      )}

      <div className="sub-tab-content">
        <section className="info-card hired-staff-card">
          <h3>My Staff</h3>
          {hiredStaff.length > 0 ? (
            <ul className="staff-list">
              {hiredStaff.map((staff) => (
                <li key={staff.id} className="staff-list-item">
                  <div className="staff-info">
                    <span className="staff-name">
                      {staff.name}{" "}
                      <span className="staff-role">({staff.role})</span>
                    </span>
                    <span className="staff-details">
                      STR: {staff.trueAttributes.strategy} | COM:{" "}
                      {staff.trueAttributes.communication} | FUN:{" "}
                      {staff.trueAttributes.fundraising} | LOY:{" "}
                      {staff.trueAttributes.loyalty}
                    </span>
                    <span className="staff-salary">
                      Salary: ${staff.salary.toLocaleString()}/month
                    </span>
                  </div>
                  <button
                    className="button-delete small-button"
                    onClick={() => fireStaff(staff.id)}
                  >
                    Fire
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have not hired any staff.</p>
          )}
        </section>

        <section className="info-card scouting-pool-card">
          <h3>Scouting Pool</h3>
          {!hasHRDirector && (
            <p className="hr-warning">
              Hire an HR Director to unlock final vetting and discover hidden
              gems or busts.
            </p>
          )}
          {talentPool.length > 0 ? (
            <ul className="staff-list">
              {talentPool.map((staff) => (
                <li key={staff.id} className="staff-list-item">
                  <div className="staff-info">
                    <span className="staff-name">
                      {staff.name}{" "}
                      <span className="staff-role">({staff.role})</span>
                    </span>
                    {Object.keys(staff.revealedAttributes).length > 0 ? (
                      <span className="staff-details">
                        Known Skills:
                        {Object.entries(staff.revealedAttributes)
                          .map(
                            ([key, value]) =>
                              ` ${key.substring(0, 3).toUpperCase()}: ${value}`
                          )
                          .join(" | ")}
                      </span>
                    ) : (
                      <span className="staff-details-hidden">
                        {staff.scoutingLevel === "unscouted"
                          ? "Unknown Candidate. Scout to reveal info."
                          : "Skills unconfirmed. Further vetting required."}
                      </span>
                    )}
                    <span className="staff-details biases">
                      Focus: {staff.biases.strategicFocus.replace("_", " ")} |
                      Lean: {staff.biases.ideologicalLean}
                    </span>
                    {staff.revealedPriorities &&
                      staff.revealedPriorities.length > 0 && (
                        <div className="staff-priorities">
                          <span>
                            <strong>Priorities:</strong>{" "}
                            {staff.revealedPriorities
                              .map((p) => p.replace(/_/g, " "))
                              .join(", ")}
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="staff-actions">
                    {getScoutingActions(staff)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No candidates currently available for scouting.</p>
          )}
        </section>
      </div>
    </>
  );
};

function CareerActionsTab({ campaignData }) {
  const [activeSubTab, setActiveSubTab] = useState("Elections");
  const [selectedIssueToAddress, setSelectedIssueToAddress] = useState("");

  const store = useGameStore();
  const storeActions = store.actions;
  const allElectionsFromStore = store.activeCampaign.elections;
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const addressIssueCost = 250;

  const {
    politician: playerPolitician,
    currentDate,
    startingCity,
    regionId: playerRegionId,
    countryId: playerCountryId,
    partyInfo,
    generatedPartiesSnapshot = [],
    customPartiesSnapshot = [],
    governmentOffices,
  } = campaignData || {};

  //const politicalCapital = playerPolitician?.politicalCapital;

  useEffect(() => {
    if (
      startingCity?.stats?.mainIssues &&
      startingCity.stats.mainIssues.length > 0
    ) {
      if (
        !selectedIssueToAddress ||
        !startingCity.stats.mainIssues.includes(selectedIssueToAddress)
      ) {
        setSelectedIssueToAddress(startingCity.stats.mainIssues[0]);
      }
    } else {
      setSelectedIssueToAddress("");
    }
  }, [startingCity?.stats?.mainIssues, selectedIssueToAddress]);

  const partyDisplayName = useMemo(() => {
    if (!partyInfo || !partyInfo.type) return "N/A (No Affiliation)";
    if (partyInfo.type === "independent") return "Independent";
    if (partyInfo.type === "join_generated") {
      const party = generatedPartiesSnapshot.find((p) => p.id === partyInfo.id);
      return party ? party.name : "Affiliated (Generated Party Error)";
    }
    if (partyInfo.type === "use_custom") {
      const party = customPartiesSnapshot.find((p) => p.id === partyInfo.id);
      return party ? party.name : "Affiliated (Custom Party Error)";
    }
    return "N/A";
  }, [partyInfo, generatedPartiesSnapshot, customPartiesSnapshot]);

  const availableElectionsToRunIn = useMemo(() => {
    if (
      !allElectionsFromStore ||
      !currentDate ||
      !playerCountryId ||
      !playerPolitician
    )
      return [];

    const todayObj = createDateObj(currentDate);
    if (!todayObj) return [];

    return allElectionsFromStore
      .filter((election) => {
        if (
          election.playerIsCandidate &&
          election.outcome?.status === "upcoming"
        )
          return false;
        if (election.outcome?.status === "concluded") return false;

        if (!election.filingDeadline?.year || !election.electionDate?.year)
          return false;

        const deadlineObj = createDateObj(election.filingDeadline);
        const electionDateObj = createDateObj(election.electionDate);

        if (!deadlineObj || !electionDateObj) return false;
        if (todayObj.getTime() > deadlineObj.getTime()) return false;
        if (todayObj.getTime() >= electionDateObj.getTime()) return false;

        const yearsUntilElection =
          election.electionDate.year - currentDate.year;
        const maxYearsView = election.maxYearsOutForCandidacyView || 3;
        if (yearsUntilElection > maxYearsView || yearsUntilElection < 0) {
          return false;
        }

        const electionCountry =
          election.countryId ||
          election.entityDataSnapshot?.countryId ||
          campaignData?.countryId;
        if (electionCountry !== playerCountryId) {
          return false;
        }

        switch (election.level) {
          case "local_city":
          case "local_city_or_municipality":
          case "local_city_council":
          case "local_city_or_municipality_council":
            return election.entityDataSnapshot?.id.includes(startingCity.id);

          case "local_state":
          case "local_prefecture":
          case "local_province":
          case "local_state_parliament":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "local_state_lower_house":
          case "local_state_upper_house":
          case "local_province_board":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "national_head_of_state_and_government":
          case "national_vice_head_of_state_and_government":
          case "national_upper_house":
          case "national_lower_house_partylist":
          case "national_upper_house_pr_national":
          case "national_lower_house":
            return true;

          case "national_upper_house_state_rep":
          case "national_upper_house_prefectural_district":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "national_lower_house_constituency":
            return election.entityDataSnapshot?.id.includes(playerRegionId);

          case "national_lower_house_pr_bloc":
            // TODO: Refine eligibility for PR Blocs based on player's specific region within the bloc if possible
            return true;

          default:
            return false;
        }
      })
      .sort(
        (a, b) =>
          createDateObj(a.electionDate).getTime() -
          createDateObj(b.electionDate).getTime()
      );
  }, [
    allElectionsFromStore,
    currentDate,
    startingCity?.id,
    playerRegionId,
    playerCountryId,
    campaignData?.countryId,
    playerPolitician,
  ]);

  const playerIsCurrentlyCandidate = useMemo(() => {
    return allElectionsFromStore.some(
      (e) => e.playerIsCandidate && e.outcome?.status === "upcoming"
    );
  }, [allElectionsFromStore]);

  const handleDeclareCandidacy = (electionId) => {
    if (
      storeActions.declareCandidacy &&
      playerPolitician &&
      !playerIsCurrentlyCandidate
    ) {
      storeActions.declareCandidacy(electionId);
    } else if (playerIsCurrentlyCandidate && storeActions.addToast) {
      storeActions.addToast({
        message: "You are already running in an upcoming election.",
        type: "info",
      });
    } else if (!playerPolitician && storeActions.addToast) {
      storeActions.addToast({
        message: "Player politician data not found.",
        type: "error",
      });
    }
  };

  if (!campaignData || !playerPolitician) {
    return (
      <div className="tab-content-container ui-panel">
        <h2 className="tab-title">Career & Actions</h2>
        <p>No campaign data or politician data available.</p>
      </div>
    );
  }

  const oratorySkillCost = 500;
  const publicAppearanceCost = 100;

  const canPerformMajorAction = !playerPolitician?.campaignActionToday;

  const renderSubTabContent = () => {
    const subTabProps = {
      campaignData,
      actions: storeActions,
      canPerformMajorAction,
    };

    switch (activeSubTab) {
      case "Elections":
        return (
          <ElectionsSubTab
            availableElectionsToRunIn={availableElectionsToRunIn}
            handleDeclareCandidacy={handleDeclareCandidacy}
            currentDate={currentDate}
            playerIsCurrentlyCandidate={playerIsCurrentlyCandidate}
          />
        );
      case "Jobs":
        return <JobsSubTab {...subTabProps} />;
      case "Office":
        return (
          <OfficeSubTab
            {...subTabProps}
            selectedIssueToAddress={selectedIssueToAddress}
            setSelectedIssueToAddress={setSelectedIssueToAddress}
            setIsBillModalOpen={setIsBillModalOpen}
            addressIssueCost={addressIssueCost}
          />
        );
      case "Staff":
        return <StaffSubTab />;
      case "Actions":
        return (
          <ActionsSubTab
            {...subTabProps}
            oratorySkillCost={oratorySkillCost}
            publicAppearanceCost={publicAppearanceCost}
          />
        );
      default:
        return <p>Select a section.</p>;
    }
  };

  return (
    <>
      <div className="tab-content-container career-actions-tab ui-panel">
        <h2 className="tab-title">Career & Political Actions</h2>
        <section className="info-card current-status-card">
          <h3>Current Status Overview</h3>
          {playerPolitician && (
            <>
              <p>
                <strong>Politician:</strong> {playerPolitician.firstName}{" "}
                {playerPolitician.lastName}
              </p>
              <p>
                <strong>Current Role:</strong>{" "}
                {playerPolitician.currentOffice || "Aspiring Politician"}
              </p>
              <p>
                <strong>Ideology:</strong> {playerPolitician.calculatedIdeology}
              </p>
              <p>
                <strong>Party Affiliation:</strong> {partyDisplayName}
              </p>
              <p>
                <strong>Overall Approval:</strong>{" "}
                {playerPolitician.approvalRating != null
                  ? `${playerPolitician.approvalRating}%`
                  : "N/A"}
              </p>
              <p>
                <strong>Personal Treasury:</strong> $
                {playerPolitician.treasury != null
                  ? playerPolitician.treasury.toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Campaign Funds:</strong> $
                {playerPolitician.campaignFunds != null
                  ? playerPolitician.campaignFunds.toLocaleString()
                  : "N/A"}
              </p>
              {playerPolitician.currentOffice &&
                governmentOffices?.find(
                  (off) =>
                    off.officeName === playerPolitician.currentOffice &&
                    off.holder?.id === playerPolitician.id
                )?.termEnds && (
                  <p>
                    <strong>Term Ends:</strong>{" "}
                    {(() => {
                      const office = governmentOffices.find(
                        (off) =>
                          off.officeName === playerPolitician.currentOffice &&
                          off.holder?.id === playerPolitician.id
                      );
                      return office
                        ? `${office.termEnds.month}/${office.termEnds.day}/${office.termEnds.year}`
                        : "N/A";
                    })()}
                  </p>
                )}
              <p
                style={{
                  color: canPerformMajorAction
                    ? "var(--success-text, green)"
                    : "var(--warning-text, orange)",
                }}
              >
                Major Action Available Today:{" "}
                {canPerformMajorAction ? "Yes" : "No"}
              </p>
            </>
          )}
        </section>

        <div className="sub-tab-navigation ca-sub-nav">
          <button
            onClick={() => setActiveSubTab("Elections")}
            className={activeSubTab === "Elections" ? "active" : ""}
          >
            Elections
          </button>
          <button
            onClick={() => setActiveSubTab("Jobs")}
            className={activeSubTab === "Jobs" ? "active" : ""}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveSubTab("Office")}
            className={activeSubTab === "Office" ? "active" : ""}
          >
            My Office
          </button>
          <button
            onClick={() => setActiveSubTab("Staff")}
            className={activeSubTab === "Staff" ? "active" : ""}
          >
            Staff & Scouting
          </button>
          <button
            onClick={() => setActiveSubTab("Actions")}
            className={activeSubTab === "Actions" ? "active" : ""}
          >
            Actions
          </button>
        </div>
        <div className="sub-tab-content-area">{renderSubTabContent()}</div>
      </div>

      <BillAuthoringModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />
    </>
  );
}

export default CareerActionsTab;
