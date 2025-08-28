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
          Laws shape your city, state, and nation. Bills are proposed, voted on, and—if passed—become active
          legislation whose effects apply when they take effect.
        </p>

        <h3>Government Levels</h3>
        <ul>
          <li><strong>City</strong>: Local ordinances and budget/tax changes.</li>
          <li><strong>State</strong>: Regional policies that affect all cities in the state.</li>
          <li><strong>National</strong>: Federal policies that influence the entire country.</li>
        </ul>

        <h3>Proposing & Voting</h3>
        <ul>
          <li>Bills contain one or more policies and are voted on after a pending period.</li>
          <li>A simple majority of the legislature is required for a bill to pass.</li>
          <li>Passed bills are archived and become active laws; failed bills are recorded for AI memory.</li>
        </ul>

        <h3>Policy Effects</h3>
        <ul>
          <li><strong>Effective Date</strong>: Each policy has a delay (<code>monthsUntilEffective</code>). When it reaches 0, its effects are applied.</li>
          <li><strong>Standard Effects</strong>: Immediate changes defined by the policy’s effect list.</li>
          <li><strong>Parameterized Policies</strong>: Adjust budget lines or tax rates by a specific amount.</li>
          <li><strong>Simulation Variables</strong>: Directly set or modify core game stats like minimum wage.</li>
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
