import React, { useState } from 'react';
import useGameStore from '../store';
import './WikiScene.css';

// Import policy definitions
import {CITY_POLICIES} from '../data/cityPolicyDefinitions';
import {STATE_POLICIES} from '../data/statePolicyDefinitions';
import {FEDERAL_POLICIES} from '../data/nationalPolicyDefinitions';
import {GENERAL_POLICIES} from '../data/generalPolicyDefinitions'; 

/**
 * A reusable component to display the details of a single policy.
 * @param {object} policy - The policy object to display.
 */
const PolicyDetails = ({ policy }) => {
  // The 'area' property seems to be an object from POLICY_AREAS.
  // We'll try to access its name property, but fall back to a string representation.
  const areaName = policy.area?.name || String(policy.area).split('.').pop() || 'General';

  return (
    <div className="policy-details-card">
      <h4>{policy.name}</h4>
      <p>{policy.description}</p>
      <div className="policy-meta">
        <span><strong>Area:</strong> {areaName}</span>
        <span><strong>Cost:</strong> {policy.cost.politicalCapital} PC</span>
        <span><strong>Implementation:</strong> {policy.durationToImplement} months</span>
        {policy.isParameterized && <span><strong>Parameterized:</strong> Yes</span>}
      </div>
      {policy.effects && policy.effects.length > 0 && (
        <>
          <h5>Key Effects</h5>
          <ul>
            {policy.effects.map((effect, index) => (
              <li key={index}>
                {effect.description_template || `Targets stat: ${effect.targetStat}`}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};


// Define sections in a structured way to keep content manageable
const sections = [
  {
    id: 'core-mechanics',
    title: 'Core Mechanics',
    content: (
      <p>This section explains the fundamental concepts of the game. Explore the sidebar to learn about specific systems.</p>
    ),
  },
  {
    id: 'legislation-system',
    title: 'Legislation',
    content: (
      <>
        <p>
          The legislative system allows elected officials to propose and vote on bills that shape 
          your city, state, and nation. Bills contain policies that, when passed, become active 
          legislation with real effects on society.
        </p>

        <h3>Current Implementation</h3>
        
        <h4>Government Levels</h4>
        <ul>
          <li><strong>City Level</strong>: Local ordinances affecting your city</li>
          <li><strong>State Level</strong>: Regional policies affecting all cities in the state</li>
          <li><strong>National Level</strong>: Federal policies affecting the entire country</li>
        </ul>

        <h4>Bill Proposal Process</h4>
        <ul>
          <li><strong>Proposing Bills</strong>: Any legislator (including you) can propose a bill containing one or more policies</li>
          <li><strong>Bill Naming</strong>: Bills can be given custom names or auto-generated titles</li>
          <li><strong>Policy Selection</strong>: Choose from available policies for your government level</li>
          <li><strong>Parameterized Policies</strong>: Some policies allow you to set specific values (e.g., tax rates, budget amounts)</li>
          <li><strong>Vote Scheduling</strong>: Bills are scheduled for a vote 7-21 days after proposal</li>
        </ul>

        <h4>Voting System</h4>
        <ul>
          <li><strong>Simple Majority</strong>: Bills require 50% + 1 votes to pass</li>
          <li><strong>AI Voting</strong>: AI legislators vote based on ideology, fiscal situation, and policy alignment</li>
          <li><strong>Player Voting</strong>: You cast your vote when the bill comes up</li>
          <li><strong>Vote Recording</strong>: All votes are recorded and can be viewed</li>
          <li><strong>Public Stances</strong>: Legislators may announce their voting intentions before the vote</li>
        </ul>

        <h4>Bill Types</h4>
        <ul>
          <li><strong>New Bills</strong>: Introduce new policies and laws</li>
          <li><strong>Amendment Bills</strong>: Modify existing legislation (planned feature)</li>
          <li><strong>Repeal Bills</strong>: Remove existing laws (planned feature)</li>
        </ul>

        <h3>Policy Implementation</h3>
        
        <h4>Implementation Timeline</h4>
        <ul>
          <li><strong>Months Until Effective</strong>: Each policy has a delay before taking effect (typically 1-6 months)</li>
          <li><strong>Countdown System</strong>: The game tracks when each policy will become active</li>
          <li><strong>Immediate Notification</strong>: You're notified when policies take effect</li>
        </ul>

        <h4>Policy Effects</h4>
        <ul>
          <li><strong>Direct Effects</strong>: Immediate changes to statistics when policy activates</li>
          <li><strong>Budget Effects</strong>: Changes to revenue, expenses, or specific budget lines</li>
          <li><strong>Service Effects</strong>: Impact on service quality ratings</li>
          <li><strong>Demographic Effects</strong>: Changes to population statistics</li>
        </ul>

        <h4>Parameterized Policies</h4>
        <ul>
          <li><strong>Budget Adjustments</strong>: Set specific funding levels for services</li>
          <li><strong>Tax Rate Changes</strong>: Adjust various tax rates by percentage points</li>
          <li><strong>Minimum Wage</strong>: Set specific wage levels</li>
          <li><strong>Dynamic Calculation</strong>: AI legislators propose values based on current needs</li>
        </ul>

        <h3>AI Legislative Behavior</h3>
        
        <h4>AI Proposal System</h4>
        <ul>
          <li><strong>Need-Based Proposals</strong>: AI analyzes current problems and proposes solutions</li>
          <li><strong>Ideological Alignment</strong>: Proposals match the AI's political ideology</li>
          <li><strong>Fiscal Awareness</strong>: AI considers budget situation when proposing</li>
          <li><strong>Failed Bill Memory</strong>: AI avoids re-proposing recently failed policies</li>
          <li><strong>Bill Bundling</strong>: AI may combine related policies into single bills</li>
        </ul>

        <h4>AI Voting Logic</h4>
        <ul>
          <li><strong>Ideological Scoring</strong>: Votes based on policy alignment with beliefs</li>
          <li><strong>Financial Impact</strong>: Considers fiscal effects and current budget health</li>
          <li><strong>Service Needs</strong>: Supports policies addressing poor service ratings</li>
          <li><strong>Issue Priority</strong>: Favors bills addressing main city issues</li>
          <li><strong>Personal Variation</strong>: Individual AI personalities affect decisions</li>
        </ul>

        <h4>Strategic AI Features</h4>
        <ul>
          <li><strong>Vote Prediction</strong>: AI calculates probability of bills passing</li>
          <li><strong>Bill Modification</strong>: AI may moderate proposals to gain support</li>
          <li><strong>Coalition Analysis</strong>: AI identifies supporting and opposing members</li>
        </ul>

        <h3>Legislative Archives</h3>
        
        <h4>Active Legislation</h4>
        <ul>
          <li><strong>Current Laws</strong>: View all active legislation at each level</li>
          <li><strong>Policy Details</strong>: See effects and parameters of each law</li>
          <li><strong>Implementation Status</strong>: Track which policies are pending activation</li>
        </ul>

        <h4>Bill History</h4>
        <ul>
          <li><strong>Passed Bills Archive</strong>: Complete record of successful legislation</li>
          <li><strong>Failed Bills History</strong>: Last 50 failed bills tracked for AI memory</li>
          <li><strong>Vote Records</strong>: See how each legislator voted on past bills</li>
        </ul>

        <h4>Bill Templates</h4>
        <ul>
          <li><strong>Save Templates</strong>: Store bill configurations for reuse</li>
          <li><strong>Quick Proposal</strong>: Use templates to quickly propose similar bills</li>
        </ul>

        <h3>Political Capital System</h3>
        
        <h4>Capital Costs</h4>
        <ul>
          <li><strong>Base Cost</strong>: Each policy has a political capital requirement</li>
          <li><strong>Bill Total</strong>: Capital needed is sum of all policies in the bill</li>
          <li><strong>Spending Capital</strong>: Proposing bills consumes your political capital</li>
        </ul>

        <h3>Budget Integration</h3>
        
        <h4>Automatic Recalculation</h4>
        <ul>
          <li><strong>City Budget</strong>: Updates when city-level policies take effect</li>
          <li><strong>State Budget</strong>: Recalculates for state-level changes</li>
          <li><strong>National Budget</strong>: Adjusts based on federal policy implementation</li>
        </ul>

        <h4>Budget Policy Types</h4>
        <ul>
          <li><strong>Revenue Policies</strong>: Tax changes, fees, and income generation</li>
          <li><strong>Expense Policies</strong>: Service funding, program costs</li>
          <li><strong>Allocation Policies</strong>: Redistribute existing budget lines</li>
        </ul>

        <h3>Planned Features (Not Yet Implemented)</h3>
        
        <h4>Advanced Legislative Process</h4>
        <ul>
          <li><strong>Committee System</strong>: Bills reviewed by specialized committees</li>
          <li><strong>Floor Amendments</strong>: Modify bills during debate</li>
          <li><strong>Executive Veto</strong>: Mayors/Governors/President can veto bills</li>
          <li><strong>Veto Override</strong>: Legislature can override with supermajority</li>
          <li><strong>Filibuster</strong>: Extended debate to delay votes</li>
        </ul>

        <h4>Additional Bill Types</h4>
        <ul>
          <li><strong>Emergency Legislation</strong>: Fast-track critical bills</li>
          <li><strong>Constitutional Amendments</strong>: Fundamental law changes</li>
          <li><strong>Resolutions</strong>: Non-binding legislative statements</li>
          <li><strong>Referendum & Initiative</strong>: Direct voter legislation</li>
        </ul>

        <h4>Enhanced Features</h4>
        <ul>
          <li><strong>Co-Sponsorship</strong>: Multiple legislators backing bills</li>
          <li><strong>Omnibus Bills</strong>: Large packages combining many policies</li>
          <li><strong>Sunset Provisions</strong>: Laws that expire automatically</li>
          <li><strong>Interstate Compacts</strong>: Multi-state agreements</li>
          <li><strong>Line-Item Veto</strong>: Partial bill rejection</li>
        </ul>

        <h3>Tips for Effective Legislation</h3>
        
        <ul>
          <li><strong>Check Support</strong>: Count likely votes before proposing</li>
          <li><strong>Bundle Wisely</strong>: Combine compatible policies for broader appeal</li>
          <li><strong>Time Strategically</strong>: Propose when political climate is favorable</li>
          <li><strong>Watch Finances</strong>: Consider budget impact of your proposals</li>
          <li><strong>Build Coalitions</strong>: Work with legislators who share your goals</li>
          <li><strong>Learn from Failures</strong>: Review why bills failed to improve future proposals</li>
        </ul>
      </>
    ),
  },
  {
    id: 'general-policies',
    title: 'General Policies',
    content: (
      <div>
        <p>These policies are generally available at multiple levels of government, such as city, state, or national.</p>
        {GENERAL_POLICIES.map(policy => <PolicyDetails key={policy.id} policy={policy} />)}
      </div>
    )
  },
  {
    id: 'city-policies',
    title: 'City Policies',
    content: (
      <div>
        <p>These policies can be enacted at the city level, affecting local ordinances, services, and budgets.</p>
        {CITY_POLICIES.map(policy => <PolicyDetails key={policy.id} policy={policy} />)}
      </div>
    )
  },
  {
    id: 'state-policies',
    title: 'State Policies',
    content: (
      <div>
        <p>These policies are available at the state level and affect all cities within that state.</p>
        {STATE_POLICIES.map(policy => <PolicyDetails key={policy.id} policy={policy} />)}
      </div>
    )
  },
  {
    id: 'national-policies',
    title: 'National Policies',
    content: (
      <div>
        <p>These federal policies have a nationwide impact, setting the direction for the entire country.</p>
        {FEDERAL_POLICIES.map(policy => <PolicyDetails key={policy.id} policy={policy} />)}
      </div>
    )
  },
  {
    id: 'campaigning-elections',
    title: 'Campaigning & Elections',
    content: (
      <>
        <p>
          Elections are the cornerstone of democratic governance, determining who holds office and 
          shapes policy. The game features a comprehensive electoral system with realistic campaign 
          mechanics, polling, and voting behavior.
        </p>

        <h3>Election Types & Scheduling</h3>
        <ul>
          <li><strong>Local Elections</strong>: Mayor, city council, and local offices</li>
          <li><strong>State Elections</strong>: Governor, state legislature, and state-wide offices</li>
          <li><strong>Federal Elections</strong>: President, Congress (House & Senate)</li>
          <li><strong>Frequency</strong>: Elections occur based on term lengths and constitutional cycles</li>
          <li><strong>Filing Deadlines</strong>: Candidates must register before the deadline to appear on ballots</li>
        </ul>

        <h3>Electoral Systems</h3>
        <p>Different offices use various voting methods:</p>
        <ul>
          <li><strong>First-Past-The-Post (FPTP)</strong>: Winner takes all, used for most single-winner races</li>
          <li><strong>Electoral College</strong>: Presidential elections with state-by-state winner-take-all</li>
          <li><strong>Party List PR</strong>: Proportional representation for some multi-member districts</li>
          <li><strong>Block Vote</strong>: Multiple winners selected simultaneously</li>
          <li><strong>Mixed Systems</strong>: Some offices combine different methods</li>
        </ul>

        <h3>Campaign Mechanics</h3>
        <h4>Player Campaigns</h4>
        <ul>
          <li><strong>Declare Candidacy</strong>: File to run for office before the deadline</li>
          <li><strong>Campaign Funds</strong>: Raise money through donations and fundraising events</li>
          <li><strong>Staff Management</strong>: Hire campaign managers, communications directors, and field organizers</li>
          <li><strong>Issue Positioning</strong>: Take stances on policies that matter to voters</li>
          <li><strong>Endorsements</strong>: Seek support from parties, organizations, and prominent figures</li>
          <li><strong>Media Strategy</strong>: Manage relationships with news outlets and control messaging</li>
        </ul>

        <h4>Campaign Activities</h4>
        <ul>
          <li><strong>Fundraising Events</strong>: Host dinners, rallies, and donor meetings</li>
          <li><strong>Town Halls</strong>: Direct voter engagement and policy discussions</li>
          <li><strong>Media Interviews</strong>: Television, radio, and press appearances</li>
          <li><strong>Door-to-Door Canvassing</strong>: Personal voter outreach</li>
          <li><strong>Digital Campaigns</strong>: Social media and online advertising</li>
          <li><strong>Debates</strong>: Public forums with other candidates</li>
        </ul>

        <h3>Polling & Public Opinion</h3>
        <h4>Polling Firms</h4>
        <ul>
          <li><strong>Independent Pollsters</strong>: Various firms with different methodologies and biases</li>
          <li><strong>Credibility Ratings</strong>: Firms have track records affecting poll reliability</li>
          <li><strong>Reach & Coverage</strong>: Some focus on local races, others on state/national contests</li>
          <li><strong>Methodology Bias</strong>: Pollsters may oversample certain demographics</li>
          <li><strong>Ideological Skew</strong>: Some firms lean toward particular political perspectives</li>
        </ul>

        <h4>Coalition System</h4>
        <p>Voter behavior is modeled through dynamic coalition groups:</p>
        <ul>
          <li><strong>Demographic Coalitions</strong>: Voters grouped by age, education, occupation, location</li>
          <li><strong>Ideological Alignment</strong>: Coalitions have political preferences and issue priorities</li>
          <li><strong>Mobilization Effects</strong>: Events and campaigns can energize or discourage coalition turnout</li>
          <li><strong>Coalition Breakdown</strong>: See detailed support levels across different voter groups</li>
          <li><strong>Population Weighting</strong>: Coalition influence reflects actual voter representation</li>
        </ul>

        <h4>Player Election Advantages</h4>
        <p>As a player candidate, you benefit from additional factors beyond base coalition support:</p>
        <ul>
          <li><strong>Name Recognition</strong>: Higher visibility from your political activities</li>
          <li><strong>Approval Rating</strong>: Public perception of your performance and character</li>
          <li><strong>Media Buzz</strong>: Recent news coverage and public attention</li>
          <li><strong>Campaign Spending</strong>: Financial resources translate to voter outreach</li>
          <li><strong>Endorsement Network</strong>: Support from parties and organizations</li>
          <li><strong>Incumbency</strong>: Advantages or disadvantages from current office</li>
        </ul>

        <h3>Election Day & Results</h3>
        <h4>Voter Turnout</h4>
        <ul>
          <li><strong>Expected Turnout</strong>: Calculated based on coalition engagement and historical patterns</li>
          <li><strong>Election Level Effects</strong>: National races typically have higher turnout than local</li>
          <li><strong>Mobilization Impact</strong>: Campaign activities and coalition mood affect participation</li>
          <li><strong>Weather & Events</strong>: External factors can influence actual turnout</li>
        </ul>

        <h4>Vote Counting</h4>
        <ul>
          <li><strong>District-by-District</strong>: Results calculated for each electoral unit</li>
          <li><strong>Coalition Voting</strong>: Each coalition votes based on candidate appeal and mobilization</li>
          <li><strong>Statistical Variation</strong>: Polls aren't perfect - expect some surprises</li>
          <li><strong>Electoral Math</strong>: Different systems produce different winner determination</li>
        </ul>

        <h3>Post-Election</h3>
        <ul>
          <li><strong>Victory Conditions</strong>: Winners determined by electoral system rules</li>
          <li><strong>Government Formation</strong>: New office holders take their positions</li>
          <li><strong>Political Capital</strong>: Election results affect your influence and relationships</li>
          <li><strong>Mandate Effects</strong>: Large victories provide more governing authority</li>
          <li><strong>Coalition Shifts</strong>: Election outcomes can realign political coalitions</li>
        </ul>

        <h3>Strategic Considerations</h3>
        <ul>
          <li><strong>Target Demographics</strong>: Focus resources on winnable coalition groups</li>
          <li><strong>Issue Selection</strong>: Emphasize policies that resonate with key voters</li>
          <li><strong>Opponent Research</strong>: Understand competitor strengths and weaknesses</li>
          <li><strong>Resource Management</strong>: Balance fundraising, spending, and time allocation</li>
          <li><strong>Media Relations</strong>: Maintain positive coverage while avoiding scandals</li>
          <li><strong>Coalition Building</strong>: Unite diverse voter groups behind your candidacy</li>
        </ul>
      </>
    )
  },
  {
    id: 'political-parties',
    title: 'Political Parties',
    content: (
      <>
        <p>
          Political parties are organized groups that share common ideological goals and work together 
          to advance their political agenda through elections and governance.
        </p>

        <h3>Party Structure</h3>
        <ul>
          <li><strong>Leadership</strong>: Each party has a chairperson and other key officers</li>
          <li><strong>Committees</strong>: Specialized groups focusing on different areas like finance, outreach, and policy</li>
          <li><strong>Internal Factions</strong>: Organized subgroups within parties with distinct viewpoints</li>
          <li><strong>Members</strong>: Politicians and committee members who belong to the party</li>
          <li><strong>Ideology</strong>: Core beliefs and policy positions that define the party</li>
        </ul>

        <h3>Committee System</h3>
        <p>Parties organize their work through various committees:</p>
        <ul>
          <li><strong>Finance Committee</strong>: Manages fundraising and budget oversight</li>
          <li><strong>Policy Committee</strong>: Develops party platform and legislative priorities</li>
          <li><strong>Campaign Committee</strong>: Coordinates electoral strategy and candidate support</li>
          <li><strong>Outreach Committee</strong>: Handles public relations and community engagement</li>
          <li><strong>Rules Committee</strong>: Governs internal party procedures and discipline</li>
        </ul>
        <p>Each committee has a chair and several members with relevant expertise and backgrounds.</p>

        <h3>Internal Factions</h3>
        <p>Most parties contain organized factions that represent different wings or ideological perspectives:</p>
        <ul>
          <li><strong>Faction Leaders</strong>: Prominent politicians who lead and represent each faction</li>
          <li><strong>Ideological Differences</strong>: Factions may emphasize different policy priorities or approaches</li>
          <li><strong>Influence Levels</strong>: Factions vary in size and power within the party structure</li>
          <li><strong>Coalition Building</strong>: Factions often work together or compete for party direction</li>
          <li><strong>Electoral Impact</strong>: Faction support can influence primary elections and endorsements</li>
        </ul>
        <p>
          Understanding faction dynamics is crucial for navigating party politics. Some factions may be 
          more progressive or conservative relative to the party mainstream, while others focus on 
          specific issues like economic policy, social issues, or foreign affairs.
        </p>

        <h3>Party Finances</h3>
        <p>Parties maintain complex financial operations including:</p>
        <ul>
          <li><strong>Monthly Budget</strong>: Regular income and expenditures</li>
          <li><strong>Donations</strong>: Individual and organizational contributions</li>
          <li><strong>Merchandise Sales</strong>: Campaign materials and branded items</li>
          <li><strong>Event Revenue</strong>: Fundraisers and speaking engagements</li>
          <li><strong>Operational Costs</strong>: Staff salaries, office expenses, and campaigns</li>
        </ul>

        <h3>Player Interactions</h3>
        <ul>
          <li><strong>Join a Party</strong>: Affiliate with a party that matches your ideology</li>
          <li><strong>Donate</strong>: Support parties financially to improve relationships</li>
          <li><strong>Request Endorsement</strong>: Seek party backing for your campaigns</li>
          <li><strong>Attend Events</strong>: Network at fundraisers and party gatherings</li>
          <li><strong>View Finances</strong>: Request access to detailed financial records</li>
        </ul>

        <h3>Party Relationships</h3>
        <p>
          Your standing with different parties affects your political career. Supporting a party 
          through donations and alignment can lead to endorsements and resources, while opposing 
          their agenda may create political obstacles.
        </p>
      </>
    )
  },
  {
    id: 'education-system',
    title: 'Education System',
    content: (
      <div className="wiki-cards-container">
        <div className="wiki-card">
          <h3>System Overview</h3>
          <p>
            The education system is fully integrated with city government, featuring realistic student populations, 
            academic performance tracking, budget management, and employment calculations. Education departments 
            are major budget consumers with thousands of employees serving diverse student demographics.
          </p>
        </div>

        <div className="wiki-card">
          <h3>Student Demographics & Coalitions</h3>
          <ul>
            <li><strong>Coalition-Based Students</strong>: Student populations mirror city demographic coalitions</li>
            <li><strong>Realistic Numbers</strong>: Districts serve 10,000-50,000+ students depending on city size</li>
            <li><strong>Demographic Diversity</strong>: Students represent all community backgrounds and socioeconomic levels</li>
            <li><strong>Geographic Distribution</strong>: Students come from different neighborhoods with varying characteristics</li>
            <li><strong>Performance Tracking</strong>: Academic outcomes tracked by demographic group</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Socioeconomic Status Breakdown</h3>
          <ul>
            <li><strong>Upper Class (10-15%)</strong>: High-income families, private tutoring, excellent home support</li>
            <li><strong>Upper-Middle Class (20-25%)</strong>: Professional families, strong parental involvement, college-bound expectations</li>
            <li><strong>Middle Class (25-30%)</strong>: Moderate resources, average home support, mixed academic outcomes</li>
            <li><strong>Working Class (20-25%)</strong>: Limited resources, variable family support, economic pressures affecting education</li>
            <li><strong>Lower Class (15-20%)</strong>: Financial hardship, minimal educational resources, higher dropout risk</li>
            <li><strong>Poverty Level (5-10%)</strong>: Severe economic disadvantage, homelessness risk, emergency needs priority</li>
          </ul>
        </div>


        <div className="wiki-card">
          <h3>Academic Performance System</h3>
          <ul>
            <li><strong>Coalition-Based Scoring</strong>: Each demographic coalition has academic performance ratings</li>
            <li><strong>Color-Coded Indicators</strong>: Red (struggling), Yellow (average), Green (excelling) performance levels</li>
            <li><strong>Funding Impact</strong>: Education budget directly affects academic outcomes</li>
            <li><strong>Service Quality Rating</strong>: Education quality contributes to overall city service ratings</li>
            <li><strong>Performance Factors</strong>: Student-teacher ratios, resources, and community support affect outcomes</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Academic Scoring & Assessment Details</h3>
          <ul>
            <li><strong>Performance Scale (0-100)</strong>: Standardized scoring system for all academic metrics</li>
            <li><strong>Reading Proficiency</strong>: 0-40 (Below Basic), 41-60 (Basic), 61-80 (Proficient), 81-100 (Advanced)</li>
            <li><strong>Math Achievement</strong>: Similar scale with emphasis on problem-solving and analytical skills</li>
            <li><strong>Science Literacy</strong>: STEM comprehension and practical application assessment</li>
            <li><strong>Graduation Rates</strong>: Percentage of students completing high school education</li>
            <li><strong>College Readiness</strong>: SAT/ACT equivalent scores and preparatory course completion</li>
            <li><strong>Attendance Rates</strong>: Daily attendance as indicator of engagement and support</li>
            <li><strong>Disciplinary Incidents</strong>: Behavioral metrics affecting learning environment</li>
            <li><strong>Special Programs</strong>: AP courses, vocational training, arts participation rates</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Performance by Socioeconomic Status</h3>
          <ul>
            <li><strong>Upper Class Students</strong>: Typically score 85-95, high college enrollment, extensive extracurriculars</li>
            <li><strong>Upper-Middle Class</strong>: Average 75-90 scores, strong graduation rates, good college prep</li>
            <li><strong>Middle Class</strong>: Range 65-80, mixed outcomes, moderate support systems</li>
            <li><strong>Working Class</strong>: Average 55-70, economic pressures affect performance</li>
            <li><strong>Lower Class</strong>: Struggle with 45-65 range, higher dropout risk, limited resources</li>
            <li><strong>Poverty Level</strong>: Often below 50, requires intensive intervention and support</li>
            <li><strong>Achievement Gaps</strong>: 30-40 point spreads between highest and lowest performing groups</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Employment & Staffing</h3>
          <ul>
            <li><strong>Major Employer</strong>: Education departments typically employ 15,000-30,000+ people in large cities</li>
            <li><strong>Teacher Ratios</strong>: Calculated at approximately 20:1 student-teacher ratio</li>
            <li><strong>Administrative Staff</strong>: Principals, counselors, and support staff (typically 25% of total employees)</li>
            <li><strong>Support Personnel</strong>: Custodians, food service, transportation, and paraprofessionals</li>
            <li><strong>Budget Impact</strong>: Employee salaries consume 70-80% of education department budgets</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Budget Integration</h3>
          <ul>
            <li><strong>Major Budget Line</strong>: Education typically represents 40-60% of city budgets</li>
            <li><strong>Per-Student Spending</strong>: Budget automatically calculated per student for analysis</li>
            <li><strong>Realistic Costs</strong>: Teacher salaries based on actual regional wage data</li>
            <li><strong>Policy Impact</strong>: Education funding policies directly affect budget and performance</li>
            <li><strong>Efficiency Metrics</strong>: Cost per student and academic outcome analysis available</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Data Visualization & Analytics</h3>
          <ul>
            <li><strong>Student Coalition Charts</strong>: Visual breakdown of student demographics</li>
            <li><strong>Performance Dashboards</strong>: Academic achievement by coalition group</li>
            <li><strong>Budget Analytics</strong>: Spending per student and departmental comparisons</li>
            <li><strong>Trend Analysis</strong>: Historical performance and spending data</li>
            <li><strong>Employment Tracking</strong>: Teacher and staff headcount visualization</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Policy & Government Integration (Current System)</h3>
          <ul>
            <li><strong>Budget Policies ✓</strong>: Education funding adjustments through legislative process (IMPLEMENTED)</li>
            <li><strong>Multi-Level Budgets ✓</strong>: City, state, and federal education funding interact (IMPLEMENTED)</li>
            <li><strong>Employment Integration ✓</strong>: Teacher hiring affects city employment statistics (IMPLEMENTED)</li>
            <li><strong>Service Quality ✓</strong>: Education performance impacts city service ratings (IMPLEMENTED)</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Planned Policy Features (Not Yet Implemented)</h3>
          <ul>
            <li><strong>Performance Standards</strong>: Academic requirements set through policy legislation</li>
            <li><strong>Teacher Policies</strong>: Compensation and working condition regulations via bills</li>
            <li><strong>Curriculum Standards</strong>: Subject requirements and educational approaches</li>
            <li><strong>School Choice Policies</strong>: Charter schools, vouchers, and district transfers</li>
            <li><strong>Special Education</strong>: Disabilities services and inclusion requirements</li>
            <li><strong>Technology Integration</strong>: Digital learning and infrastructure policies</li>
            <li><strong>Testing & Assessment</strong>: Standardized testing requirements and accountability</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Community Impact (Current System)</h3>
          <ul>
            <li><strong>Budget Competition ✓</strong>: Education competes with other services for funding (IMPLEMENTED)</li>
            <li><strong>Employment Impact ✓</strong>: Major employer affecting city job statistics (IMPLEMENTED)</li>
            <li><strong>Service Integration ✓</strong>: Performance affects overall city service quality (IMPLEMENTED)</li>
            <li><strong>Demographic Analysis ✓</strong>: Performance tracked by population groups (IMPLEMENTED)</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Planned Community Features (Not Yet Implemented)</h3>
          <ul>
            <li><strong>Economic Development</strong>: Educated workforce attracts businesses and investment</li>
            <li><strong>Property Values</strong>: Good schools increase neighborhood desirability and real estate prices</li>
            <li><strong>Social Mobility</strong>: Education provides pathways for demographic advancement between classes</li>
            <li><strong>Crime Reduction</strong>: Better education correlates with lower neighborhood crime rates</li>
            <li><strong>Civic Engagement</strong>: Educated citizens participate more in democracy and voting</li>
            <li><strong>Cultural Programs</strong>: Arts, sports, and community activities through schools</li>
            <li><strong>Adult Education</strong>: Continuing education and workforce development programs</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Planned Education Sub-Coalitions (Not Yet Implemented)</h3>
          <p><em>These would be specialized coalitions within existing demographic coalitions, focused on education:</em></p>
          <ul>
            <li><strong>Progressive Education Coalition</strong>: Advocates for increased education funding, teacher unions, equity programs</li>
            <li><strong>Conservative Education Coalition</strong>: Supports school choice, traditional curricula, fiscal responsibility</li>
            <li><strong>Moderate Education Coalition</strong>: Seeks balanced approaches, pragmatic solutions, bi-partisan support</li>
            <li><strong>Business Education Coalition</strong>: Focuses on workforce development, STEM education, career preparation</li>
            <li><strong>Parent Coalition</strong>: Prioritizes student safety, academic achievement, transparent communication</li>
            <li><strong>Teacher Coalition</strong>: Advocates for professional development, competitive wages, classroom resources</li>
            <li><strong>Community Education Coalition</strong>: Emphasizes local engagement, cultural programs, neighborhood schools</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Planned Curriculum & Instruction Policies</h3>
          <p><em>These policies would determine how subjects are taught and which academic areas are prioritized:</em></p>
          <ul>
            <li><strong>Early Literacy Initiative</strong>: Phonics-based "Science of Reading" curriculum for K-3. +10-15 Reading Proficiency for Poverty/Lower/Working Class over 2-3 years</li>
            <li><strong>Advanced Placement Acceleration</strong>: Expand AP course offerings. +10 College Readiness for Upper-Middle/Middle Class, higher per-pupil costs</li>
            <li><strong>STEM Excellence Program</strong>: Focus on science, technology, engineering, math curricula and resources</li>
            <li><strong>Arts Integration Initiative</strong>: Comprehensive arts education across all grade levels</li>
            <li><strong>Multilingual Education</strong>: Dual-language programs and ESL support expansion</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Planned Student Support & Environment Policies</h3>
          <p><em>These policies would focus on mitigating out-of-school factors that create achievement gaps:</em></p>
          <ul>
            <li><strong>Community Schools Initiative</strong>: Schools as community hubs with wraparound services. +15-20% Attendance, major reduction in Disciplinary Incidents for Poverty/Lower Class</li>
            <li><strong>Restorative Justice Program</strong>: Replace zero tolerance with mediation/conflict resolution. Sharp drop in Disciplinary Incidents, +2-3 point bonus to all academic scores</li>
            <li><strong>Mental Health Support</strong>: On-site counselors and therapy services for students</li>
            <li><strong>Nutrition & Wellness</strong>: Comprehensive meal programs and health services</li>
            <li><strong>Extended Learning Time</strong>: After-school and summer programs to prevent learning loss</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Planned Teacher Development & Specialization</h3>
          <p><em>These policies would focus on improving instruction quality and providing specialized support:</em></p>
          <ul>
            <li><strong>Targeted Professional Development Grants</strong>: Intensive teacher training in specific subjects. +5-7 point improvement in chosen subject area for 1-2 years</li>
            <li><strong>Specialized Instructor Hiring Initiative</strong>: Hire reading specialists, special ed teachers, counselors. Major Reading Proficiency boost for lowest tiers, improved College Readiness for upper tiers</li>
            <li><strong>Master Teacher Program</strong>: Advanced certification and mentorship opportunities</li>
            <li><strong>Technology Integration Training</strong>: Digital literacy and educational technology skills</li>
            <li><strong>Retention & Recruitment Incentives</strong>: Competitive compensation and benefits packages</li>
          </ul>
        </div>

        <div className="wiki-card">
          <h3>Strategic Considerations</h3>
          <ul>
            <li><strong>Budget Balancing</strong>: Education competes with other services for funding</li>
            <li><strong>Performance Monitoring</strong>: Track outcomes to guide policy decisions</li>
            <li><strong>Demographic Equity</strong>: Ensure all coalition groups receive quality education</li>
            <li><strong>Long-term Investment</strong>: Education improvements take time to show results</li>
            <li><strong>Political Considerations</strong>: Education is often a major campaign issue</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'news-media-system',
    title: 'News & Media System',
    content: (
      <>
        <p>
          The News & Media System simulates a comprehensive media landscape that generates dynamic news content 
          based on game events, political biases, and player actions. It includes news outlets, journalists, 
          article generation, and player interactions with media organizations.
        </p>

        <h3>News Outlets</h3>
        <h4>Outlet Types & Structure</h4>
        <ul>
          <li><strong>Media Types</strong>: Newspaper, TV/Radio, and Online outlets</li>
          <li><strong>Geographic Levels</strong>: National (6-10 outlets), State (4-7 outlets), Local (3-6 outlets)</li>
          <li><strong>Reach System</strong>: Each outlet has national, state, and local audience percentages</li>
          <li><strong>Credibility Ratings</strong>: Base credibility (30-90) with contextual modifiers based on viewer alignment</li>
        </ul>

        <h4>Political Bias & Alignment</h4>
        <ul>
          <li><strong>Ideological Stance</strong>: Primary ideology (centrist, conservative, liberal) with intensity ratings</li>
          <li><strong>Party Biases</strong>: Specific favorability ratings (-10 to +10) toward political parties</li>
          <li><strong>Policy Positions</strong>: Stance on specific policy areas affecting coverage tone</li>
          <li><strong>Coalition Affiliations</strong>: Alignment with voter coalitions influencing target demographics</li>
        </ul>

        <h4>Geographic Influence</h4>
        <p>Outlets maintain stronghold areas based on their ideological alignment:</p>
        <ul>
          <li><strong>Conservative Outlets</strong>: Rural Districts, Traditional Towns, Industrial Areas</li>
          <li><strong>Liberal Outlets</strong>: University Districts, Urban Centers, Cultural Quarters</li>
          <li><strong>Neutral Outlets</strong>: Mixed Communities, Suburban Centers, Commercial Districts</li>
        </ul>

        <h3>Journalists & Staffing</h3>
        <ul>
          <li><strong>Staff Size</strong>: Each outlet employs 2-4 journalists</li>
          <li><strong>Journalist Attributes</strong>: Integrity, writing skill, investigation ability, and on-screen presence</li>
          <li><strong>Ideological Alignment</strong>: Journalists inherit their outlet's political leanings</li>
          <li><strong>Bylines & Attribution</strong>: Articles are attributed to specific journalists with backgrounds</li>
        </ul>

        <h3>Article Generation</h3>
        <h4>Content Types</h4>
        <ul>
          <li><strong>Policy Votes</strong>: Coverage of legislative decisions with bias-specific framing</li>
          <li><strong>Election Results</strong>: Winner announcements and analysis based on outlet preferences</li>
          <li><strong>Economic Updates</strong>: Statistical changes presented through ideological lens</li>
          <li><strong>Random Events</strong>: Community developments with contextual coverage angles</li>
          <li><strong>Player Actions</strong>: Interview results and campaign activity coverage</li>
        </ul>

        <h4>Bias Implementation</h4>
        <p>Outlets generate different coverage for the same events:</p>
        <ul>
          <li><strong>Supporting Stance</strong>: "Landmark Reform Passes Council" (positive framing)</li>
          <li><strong>Opposing Stance</strong>: "Controversial Bill Forced Through Council" (negative framing)</li>
          <li><strong>Neutral Stance</strong>: "Council Enacts Policy After 7-3 Vote" (factual reporting)</li>
        </ul>

        <h4>Article Structure</h4>
        <ul>
          <li><strong>Dynamic Headlines</strong>: Adjust language and emotional descriptors based on bias</li>
          <li><strong>Rich Content</strong>: Multi-paragraph articles with contextual information</li>
          <li><strong>Quote System</strong>: Stance-based citizen reactions, expert analysis, and official statements</li>
          <li><strong>Attribution</strong>: Articles linked to specific journalists and publication dates</li>
        </ul>

        <h3>Contextual Credibility System</h3>
        <p>Outlet credibility varies for different viewers based on alignment factors:</p>
        <ul>
          <li><strong>Ideological Alignment</strong>: ±20 points based on viewer-outlet ideological similarity</li>
          <li><strong>Party Bias Effects</strong>: ±30 points based on party favorability alignment</li>
          <li><strong>Coalition Bonuses</strong>: +10 points per shared coalition affiliation</li>
          <li><strong>Geographic Factors</strong>: Stronghold area influence on local credibility</li>
        </ul>

        <h3>Player Interactions</h3>
        <h4>Available Media Actions</h4>
        <ul>
          <li><strong>Grant Interview</strong>: Success based on oratory skill, affects public coverage</li>
          <li><strong>Submit Press Release</strong>: Control narrative on specific issues (planned feature)</li>
          <li><strong>Buy Advertising</strong>: Purchase ad space for campaign messaging (planned feature)</li>
          <li><strong>View Outlet Details</strong>: Access comprehensive outlet information and recent articles</li>
        </ul>

        <h4>Interview System</h4>
        <ul>
          <li><strong>Success Rate</strong>: (Player Oratory Skill / 10) × 0.5 + 0.25</li>
          <li><strong>Positive Outcome</strong>: Favorable coverage and reputation boost</li>
          <li><strong>Negative Outcome</strong>: Critical coverage and reputation damage</li>
          <li><strong>Outlet Bias</strong>: Interview results influenced by outlet's political alignment</li>
        </ul>

        <h3>News Feed & Distribution</h3>
        <ul>
          <li><strong>Rolling History</strong>: System maintains up to 200 recent news items</li>
          <li><strong>Event Coverage</strong>: Major events generate articles from all relevant outlets</li>
          <li><strong>Publication Timing</strong>: Articles published with realistic date progression</li>
          <li><strong>Archive Management</strong>: Older articles automatically removed to maintain performance</li>
        </ul>

        <h3>Integration with Game Systems</h3>
        <h4>Election Coverage</h4>
        <ul>
          <li><strong>Campaign Tracking</strong>: Coverage of player and AI candidate activities</li>
          <li><strong>Election Night</strong>: Real-time results reporting with outlet-specific analysis</li>
          <li><strong>Coalition Impact</strong>: Coverage influences voter coalition opinions and turnout</li>
        </ul>

        <h4>Government Integration</h4>
        <ul>
          <li><strong>Policy Coverage</strong>: Legislative votes generate appropriate government-level coverage</li>
          <li><strong>Official Quotes</strong>: Government officials referenced in relevant articles</li>
          <li><strong>Jurisdictional Accuracy</strong>: Coverage matches proper governmental jurisdiction levels</li>
        </ul>

        <h3>Strategic Media Considerations</h3>
        <ul>
          <li><strong>Relationship Building</strong>: Maintain positive relationships with key outlets</li>
          <li><strong>Bias Navigation</strong>: Understand outlet positions to predict coverage angles</li>
          <li><strong>Credibility Management</strong>: Work with outlets that your target demographics trust</li>
          <li><strong>Message Control</strong>: Use interviews strategically to shape public narrative</li>
          <li><strong>Coalition Targeting</strong>: Engage outlets affiliated with your voter coalition base</li>
        </ul>
      </>
    )
  },
];

const WikiScene = () => {
  const { actions } = useGameStore();
  const [activeTab, setActiveTab] = useState(sections[0]?.id || '');

  const activeSectionData = sections.find((section) => section.id === activeTab);

  return (
    <div className="wiki-scene">
      <header className="wiki-header">
        <div className="wiki-header-content">
          <h1>Game Wiki</h1>
          <p>An overview of key game mechanics and systems.</p>
        </div>
        <button onClick={() => actions.navigateBack()} className="wiki-back-button menu-button">
          Back
        </button>
      </header>

      <div className="wiki-body">
        <aside className="wiki-sidebar">
          <nav className="wiki-tabs">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`wiki-tab-button ${activeTab === section.id ? 'active' : ''}`}
                onClick={() => setActiveTab(section.id)}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="wiki-content">
          {activeSectionData && (
            <div className="wiki-section-card">
              <h2>{activeSectionData.title}</h2>
              <div className="wiki-section-content">{activeSectionData.content}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WikiScene;
