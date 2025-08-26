import React from 'react';
import useGameStore from '../store';
import './WikiScene.css';

const WikiScene = () => {
  const { actions } = useGameStore();
  return (
    <div className="wiki-scene">
      <div className="wiki-container">
        <header className="wiki-hero">
          <h1>Game Wiki</h1>
          <p className="wiki-lead">Welcome to the State of Power wiki. Here you will find information about game mechanics, strategies, and more.</p>
          <nav className="wiki-toc">
            <a href="#core-mechanics" className="menu-button">Core Mechanics</a>
            <a href="#legislation-system" className="menu-button">Legislation</a>
          </nav>
        </header>

        <div className="wiki-section wiki-card" id="core-mechanics">
          <h2>Core Mechanics</h2>
          <p>This section explains the fundamental concepts of the game.</p>
        </div>

        <div className="wiki-section wiki-card" id="legislation-system">
          <h2>Legislation System</h2>
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

          <h3>Proposing Bills</h3>
          <ul>
            <li><strong>Bill Contents</strong>: One or more policies with optional parameters (e.g., set a rate).</li>
            <li><strong>Bill Types</strong>: New laws, amendments to existing laws, or repeals.</li>
            <li><strong>Scheduling</strong>: Votes are scheduled days after proposal; AI may also author and merge bills.</li>
          </ul>

          <h3>Voting and Passage</h3>
          <ul>
            <li><strong>Vote Threshold</strong>: Simple majority of the current legislature size.</li>
            <li><strong>Outcomes</strong>: Passed bills are archived and become active laws; failed bills are recorded for AI memory.</li>
            <li><strong>Public Stances</strong>: AI may announce leanings during the pending period.</li>
          </ul>

          <h3>When Effects Apply</h3>
          <ul>
            <li><strong>Delay</strong>: Each policy has <code>monthsUntilEffective</code>. When it reaches 0, effects are applied once.</li>
            <li><strong>News</strong>: Enactment triggers news events for in-game media.</li>
          </ul>

          <h3>Policy Effects</h3>
          <ul>
            <li>
              <strong>Standard Effects</strong>: Immediate changes defined by the policy’s effect list.
            </li>
            <li>
              <strong>Parameterized Policies</strong>: Some policies require a value. Two common targets:
              <ul>
                <li><em>Budget Lines</em>: Adjust spending categories (absolute or percentage-point changes).</li>
                <li><em>Tax Rates</em>: Adjust tax percentages (percentage-point or absolute changes).</li>
              </ul>
            </li>
            <li>
              <strong>Simulation Variables (Sets)</strong>: Policies can directly set simulation stats (e.g., minimum wage)
              using an adjustment type like <code>set_value</code> (applies as an absolute set). Values persist under the relevant
              law structure.
            </li>
          </ul>

          <h3>Multi‑Level Law Structures</h3>
          <ul>
            <li><strong>City</strong>: Stored under city laws (e.g., city-level minimum wage).</li>
            <li><strong>State</strong>: Stored under state laws and influences all cities in the state.</li>
            <li><strong>Federal</strong>: Stored under national laws and influences the whole country.</li>
            <li><strong>Escalation</strong>: Higher levels usually carry higher political costs and stronger effects.</li>
          </ul>

          <h3>Budgets and Recalculation</h3>
          <ul>
            <li><strong>Recompute</strong>: After effects apply, state and national budgets are recalculated.</li>
            <li><strong>City Budgets</strong>: Updated via the normal monthly tick cycle.</li>
          </ul>

          <h3>Example: Minimum Wage</h3>
          <ul>
            <li><strong>City Minimum Wage</strong>: Sets a local floor (e.g., $15) with modest effects on poverty and employment.</li>
            <li><strong>State Minimum Wage</strong>: Higher cost and broader impact (e.g., $18) across all cities in the state.</li>
            <li><strong>Federal Minimum Wage</strong>: Highest cost and strongest effects nationwide.</li>
          </ul>
        </div>

        <div className="wiki-footer">
          <button onClick={() => actions.navigateBack()} className="wiki-back-button menu-button">
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default WikiScene;
