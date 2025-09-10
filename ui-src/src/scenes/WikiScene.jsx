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
      <>
        <p>
          The education system manages public schools, student populations, academic performance, 
          and career pathways. It integrates with government departments, budgets, and political 
          decision-making to create a realistic educational environment.
        </p>

        <h3>School District Organization</h3>
        <h4>District Structure</h4>
        <ul>
          <li><strong>City School Districts</strong>: Each city manages its own public education system</li>
          <li><strong>Student Populations</strong>: Districts serve thousands to hundreds of thousands of students</li>
          <li><strong>Geographic Coverage</strong>: Districts encompass multiple neighborhoods and demographics</li>
          <li><strong>Administrative Oversight</strong>: Education departments manage district operations and budgets</li>
        </ul>

        <h4>Student Demographics</h4>
        <p>Students are organized into coalition groups representing different community segments:</p>
        <ul>
          <li><strong>Demographic Variety</strong>: Students from various backgrounds, ages, and socioeconomic levels</li>
          <li><strong>Coalition Representation</strong>: Student populations mirror broader community demographics</li>
          <li><strong>Geographic Distribution</strong>: Students from different areas of the city with varying characteristics</li>
          <li><strong>Population Tracking</strong>: Detailed counts for each demographic group within the district</li>
        </ul>

        <h3>Academic Performance System</h3>
        <h4>Performance Metrics</h4>
        <ul>
          <li><strong>Academic Scores</strong>: Standardized performance ratings by demographic group</li>
          <li><strong>Achievement Levels</strong>: Color-coded performance indicators (red=struggling, yellow=average, green=excelling)</li>
          <li><strong>Demographic Analysis</strong>: Performance tracking across different student populations</li>
          <li><strong>Trend Monitoring</strong>: Historical performance data and improvement tracking</li>
        </ul>

        <h4>Performance Factors</h4>
        <ul>
          <li><strong>Funding Levels</strong>: Education budget directly impacts academic outcomes</li>
          <li><strong>Teacher Ratios</strong>: Student-teacher ratios affect classroom effectiveness</li>
          <li><strong>Resource Availability</strong>: School facilities, technology, and materials</li>
          <li><strong>Community Support</strong>: Socioeconomic factors and family engagement</li>
        </ul>

        <h3>Career Pathways System</h3>
        <h4>Post-Graduation Tracking</h4>
        <p>The system tracks what happens to students after graduation:</p>
        <ul>
          <li><strong>College-Bound</strong>: Students pursuing higher education (typically 30-50%)</li>
          <li><strong>Trade Schools</strong>: Students entering vocational training programs (typically 15-25%)</li>
          <li><strong>Employment</strong>: Students joining the workforce directly (typically 20-35%)</li>
          <li><strong>Other Outcomes</strong>: Students with alternative paths or challenges (typically 5-15%)</li>
        </ul>

        <h4>Career Preparation</h4>
        <ul>
          <li><strong>Academic Tracks</strong>: College preparatory programs and advanced placement courses</li>
          <li><strong>Vocational Training</strong>: Technical education and trade skill development</li>
          <li><strong>Career Counseling</strong>: Guidance programs helping students choose appropriate paths</li>
          <li><strong>Industry Partnerships</strong>: Connections with local businesses for internships and job placement</li>
        </ul>

        <h3>Budget Integration</h3>
        <h4>Education Department Funding</h4>
        <ul>
          <li><strong>Budget Allocation</strong>: Education departments receive major portion of city budgets</li>
          <li><strong>Per-Student Spending</strong>: Budget divided by student population for spending analysis</li>
          <li><strong>Staff Compensation</strong>: Teacher salaries and benefits consume majority of education budget</li>
          <li><strong>Infrastructure Costs</strong>: School building maintenance, technology, and transportation</li>
        </ul>

        <h4>Staffing Requirements</h4>
        <ul>
          <li><strong>Teacher Employment</strong>: Calculated based on student-teacher ratios (typically 20:1)</li>
          <li><strong>Administrative Staff</strong>: Principals, counselors, and district administrators (typically 25% of total staff)</li>
          <li><strong>Support Personnel</strong>: Custodians, food service, transportation, and paraprofessionals</li>
          <li><strong>Realistic Headcounts</strong>: Employee counts match actual educational requirements</li>
        </ul>

        <h3>Data Visualization</h3>
        <h4>Student Coalition Charts</h4>
        <ul>
          <li><strong>Demographic Breakdown</strong>: Pie charts showing student population distribution</li>
          <li><strong>Performance Analysis</strong>: Bar charts displaying academic scores by demographic</li>
          <li><strong>Career Pathways</strong>: Visualization of post-graduation outcomes</li>
          <li><strong>Trend Tracking</strong>: Historical data showing changes over time</li>
        </ul>

        <h4>Budget Analytics</h4>
        <ul>
          <li><strong>Per-Student Metrics</strong>: Cost analysis and spending efficiency</li>
          <li><strong>Department Comparisons</strong>: Education spending versus other city services</li>
          <li><strong>Resource Allocation</strong>: Breakdown of where education dollars are spent</li>
          <li><strong>Performance ROI</strong>: Correlation between spending and academic outcomes</li>
        </ul>

        <h3>Policy Integration</h3>
        <h4>Education Policies</h4>
        <ul>
          <li><strong>Funding Policies</strong>: Legislation affecting education budget allocations</li>
          <li><strong>Academic Standards</strong>: Policies setting curriculum and performance requirements</li>
          <li><strong>Teacher Policies</strong>: Certification, compensation, and working condition regulations</li>
          <li><strong>School Choice</strong>: Charter schools, vouchers, and district transfer policies</li>
        </ul>

        <h4>Government Oversight</h4>
        <ul>
          <li><strong>City Level</strong>: Local school boards and education department management</li>
          <li><strong>State Level</strong>: State education standards and funding formulas</li>
          <li><strong>Federal Level</strong>: National education policy and federal funding programs</li>
          <li><strong>Regulatory Compliance</strong>: Meeting standards and reporting requirements</li>
        </ul>

        <h3>Community Impact</h3>
        <h4>Economic Effects</h4>
        <ul>
          <li><strong>Workforce Development</strong>: Educated graduates support local economic growth</li>
          <li><strong>Property Values</strong>: Good schools increase neighborhood desirability</li>
          <li><strong>Business Attraction</strong>: Companies prefer locations with strong school systems</li>
          <li><strong>Long-term Investment</strong>: Education spending pays dividends over decades</li>
        </ul>

        <h4>Social Outcomes</h4>
        <ul>
          <li><strong>Social Mobility</strong>: Education provides pathways out of poverty</li>
          <li><strong>Civic Engagement</strong>: Educated citizens participate more in democracy</li>
          <li><strong>Crime Reduction</strong>: Better education correlates with lower crime rates</li>
          <li><strong>Community Cohesion</strong>: Schools serve as neighborhood anchors and gathering places</li>
        </ul>

        <h3>Strategic Considerations</h3>
        <ul>
          <li><strong>Budget Priorities</strong>: Balance education funding with other essential services</li>
          <li><strong>Performance Monitoring</strong>: Track academic outcomes to guide policy decisions</li>
          <li><strong>Equity Concerns</strong>: Ensure all demographic groups receive quality education</li>
          <li><strong>Future Planning</strong>: Anticipate enrollment changes and infrastructure needs</li>
          <li><strong>Community Engagement</strong>: Involve parents and stakeholders in educational decisions</li>
          <li><strong>Teacher Retention</strong>: Competitive compensation and working conditions to attract quality educators</li>
        </ul>
      </>
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
