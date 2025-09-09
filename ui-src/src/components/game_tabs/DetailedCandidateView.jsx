import React, { useState, useMemo } from "react";
import "./DetailedCandidateView.css";
import { getRandomElement, getRandomInt, generateId } from "../../utils/core";

// On-demand donation generation functions
const generateRecentDate = () => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTime);
};

const generateRandomDonorName = () => {
  const firstNames = ["John", "Sarah", "Michael", "Jennifer", "David", "Lisa", "Robert", "Mary", "William", "Patricia", "James", "Linda", "Christopher", "Barbara", "Daniel", "Elizabeth"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"];
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
};

const generateRandomOrgName = () => {
  const prefixes = ["American", "National", "United", "Global", "Metropolitan", "Regional", "Citizens", "Progressive", "Conservative"];
  const focuses = ["Business Alliance", "Trade Association", "Workers Union", "Environmental Group", "Healthcare Foundation", "Education Coalition", "Technology Council", "Manufacturing Guild"];
  return `${getRandomElement(prefixes)} ${getRandomElement(focuses)}`;
};

const generateDonationsOnDemand = (totalFunds) => {
  const donations = [];
  let remainingFunds = totalFunds;
  
  // Generate 15-50 donations to make up the total
  const numDonations = getRandomInt(15, 50);
  
  for (let i = 0; i < numDonations && remainingFunds > 0; i++) {
    const isLastDonation = i === numDonations - 1;
    
    // For the last donation, use all remaining funds, otherwise use a portion
    const maxAmount = isLastDonation ? remainingFunds : Math.min(remainingFunds * 0.3, remainingFunds);
    const minAmount = Math.max(25, Math.min(500, maxAmount * 0.1));
    
    let amount = isLastDonation ? remainingFunds : getRandomInt(minAmount, maxAmount);
    amount = Math.min(amount, remainingFunds);
    
    if (amount <= 0) break;
    
    const donationType = Math.random() < 0.7 ? 'individual' : 'organization';
    const isAnonymous = Math.random() < 0.15; // 15% anonymous
    
    const donation = {
      id: generateId(),
      type: donationType,
      amount: amount,
      donorName: isAnonymous ? 'Anonymous' : (donationType === 'individual' ? generateRandomDonorName() : generateRandomOrgName()),
      date: generateRecentDate(),
      isAnonymous: isAnonymous,
      requiresDisclosure: amount >= 1000 // Simple threshold for disclosure
    };
    
    if (donationType === 'organization' && !isAnonymous) {
      donation.industry = getRandomElement(['Technology', 'Healthcare', 'Finance', 'Energy', 'Manufacturing', 'Education', 'Legal', 'Real Estate']);
    }
    
    donations.push(donation);
    remainingFunds -= amount;
  }
  
  // Sort donations by amount descending
  return donations.sort((a, b) => b.amount - a.amount);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatCurrency = (amount) => {
  if (amount == null) return "$0";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DonationItem = ({ donation }) => {
  const displayName = donation.isAnonymous ? 'Anonymous Donor' : donation.donorName;
  
  return (
    <div className={`donation-item ${donation.type}`}>
      <div className="donor-info">
        <span className="donor-name">{displayName}</span>
        {donation.industry && <span className="industry">({donation.industry})</span>}
        {donation.requiresDisclosure && <span className="disclosure-badge">Public</span>}
        {donation.isAnonymous && <span className="anonymous-badge">Anonymous</span>}
      </div>
      <div className="donation-details">
        <span className="amount">{formatCurrency(donation.amount)}</span>
        <span className="date">{formatDate(donation.date)}</span>
        <span className="type-badge">{donation.type === 'individual' ? 'Individual' : 'Organization'}</span>
      </div>
    </div>
  );
};

const DonationTracker = ({ donations = [] }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('amount');
  
  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    if (filter === 'disclosed') return donation.requiresDisclosure;
    if (filter === 'anonymous') return donation.isAnonymous;
    if (filter === 'organization') return donation.type === 'organization';
    if (filter === 'individual') return donation.type === 'individual';
    return true;
  });
  
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'name') return a.donorName.localeCompare(b.donorName);
    return 0;
  });
  
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDisclosed = donations.filter(d => d.requiresDisclosure).reduce((sum, d) => sum + d.amount, 0);
  const totalAnonymous = donations.filter(d => d.isAnonymous).reduce((sum, d) => sum + d.amount, 0);
  
  return (
    <div className="donation-tracker">
      <div className="donation-header">
        <h4>Campaign Donations</h4>
        <div className="donation-summary">
          <div className="summary-item">
            <span className="label">Total Raised:</span>
            <span className="value">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Donors:</span>
            <span className="value">{donations.length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Disclosed:</span>
            <span className="value">{formatCurrency(totalDisclosed)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Anonymous:</span>
            <span className="value">{formatCurrency(totalAnonymous)}</span>
          </div>
        </div>
      </div>
      
      <div className="donation-controls">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Donations ({donations.length})</option>
            <option value="disclosed">Disclosed Only ({donations.filter(d => d.requiresDisclosure).length})</option>
            <option value="anonymous">Anonymous ({donations.filter(d => d.isAnonymous).length})</option>
            <option value="individual">Individual ({donations.filter(d => d.type === 'individual').length})</option>
            <option value="organization">Organization ({donations.filter(d => d.type === 'organization').length})</option>
          </select>
        </div>
        <div className="sort-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="amount">Amount</option>
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      
      <div className="donations-list">
        {sortedDonations.length > 0 ? (
          sortedDonations.map(donation => (
            <DonationItem key={donation.id} donation={donation} />
          ))
        ) : (
          <div className="no-donations">
            No donations match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

const DetailedCandidateView = ({ candidate, onBack, electionInfo }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!candidate) {
    return (
      <div className="detailed-candidate-view">
        <button onClick={onBack} className="back-button">← Back to Election</button>
        <div className="error-message">Candidate data not found.</div>
      </div>
    );
  }

  // Update AI candidate data realistically based on time progression
  const updatedCandidate = useMemo(() => {
    if (!candidate || !electionInfo) return candidate;
    
    // Only update AI candidates, not the player
    if (candidate.isPlayer) return candidate;
    
    // Calculate time progression since election generation
    const currentDate = new Date(); // You might want to use game time here
    const electionDate = new Date(electionInfo.electionDate.year, electionInfo.electionDate.month - 1, electionInfo.electionDate.day);
    const monthsUntilElection = Math.max(0, (electionDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    // Time-based updates for AI candidates
    const progressFactor = Math.max(0, Math.min(1, (12 - monthsUntilElection) / 12)); // 0-1 over 12 months
    
    return {
      ...candidate,
      // Name recognition grows over campaign period
      nameRecognition: Math.min(100, (candidate.nameRecognition || 20) + (progressFactor * 30)),
      // Volunteers grow as campaign progresses
      volunteerCount: Math.floor((candidate.volunteerCount || 15) * (1 + progressFactor * 2)),
      // Campaign becomes active 6 months before election
      isInCampaign: monthsUntilElection < 6,
      campaignHoursRemainingToday: monthsUntilElection < 6 ? (candidate.campaignHoursPerDay || 8) : 0,
      // Endorsements might grow over time
      endorsements: candidate.endorsements || []
    };
  }, [candidate, electionInfo]);

  // Generate donations on-demand using useMemo to cache during this view session
  const donations = useMemo(() => {
    const existingDonations = updatedCandidate.campaignFinances?.donations;
    if (existingDonations && existingDonations.length > 0) {
      return existingDonations;
    }
    
    // Generate donations on-demand based on total funds
    const totalFunds = updatedCandidate.campaignFinances?.totalFunds || updatedCandidate.campaignFunds || 0;
    return totalFunds > 0 ? generateDonationsOnDemand(totalFunds) : [];
  }, [updatedCandidate.campaignFinances?.donations, updatedCandidate.campaignFinances?.totalFunds, updatedCandidate.campaignFunds]);

  // Update campaign finances with calculated donor count
  const updatedCampaignFinances = useMemo(() => {
    if (!updatedCandidate.campaignFinances) return null;
    
    return {
      ...updatedCandidate.campaignFinances,
      totalDonationCount: donations.length,
      lastDonationDate: donations.length > 0 ? donations[0].date : null
    };
  }, [updatedCandidate.campaignFinances, donations]);
  
  return (
    <div className="detailed-candidate-view">
      <button onClick={onBack} className="back-button">← Back to Election</button>
      
      <div className="candidate-header">
        <div className="candidate-title">
          <h2>{updatedCandidate.name}</h2>
          <span className="party-affiliation">
            ({updatedCandidate.partyName || updatedCandidate.partyId || 'Independent'})
          </span>
        </div>
        <div className="candidate-subtitle">
          <span>Running for {electionInfo?.officeName || 'Office'}</span>
          {electionInfo?.electionDate && (
            <span className="election-date">
              Election: {electionInfo.electionDate.month}/{electionInfo.electionDate.day}/{electionInfo.electionDate.year}
            </span>
          )}
        </div>
      </div>
      
      <div className="candidate-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => setActiveTab('finances')}
        >
          Campaign Finances
        </button>
      </div>
      
      <div className="candidate-content">
        {activeTab === 'overview' && (
          <div className="candidate-overview">
            <div className="metrics-grid">
              <div className="metric-card">
                <h4>Campaign Metrics</h4>
                <div className="metrics">
                  <div className="metric">
                    <span className="label">Name Recognition:</span>
                    <span className="value">{Math.round(updatedCandidate.nameRecognition || 0)}%</span>
                  </div>
                  <div className="metric">
                    <span className="label">Base Score:</span>
                    <span className="value">{updatedCandidate.baseScore || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Volunteers:</span>
                    <span className="value">{updatedCandidate.volunteerCount || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Working Hours/Day:</span>
                    <span className="value">{updatedCandidate.workingHours || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <h4>Campaign Status</h4>
                <div className="metrics">
                  <div className="metric">
                    <span className="label">Campaign Active:</span>
                    <span className="value">{updatedCandidate.isInCampaign ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Hours Remaining Today:</span>
                    <span className="value">{updatedCandidate.campaignHoursRemainingToday || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Endorsements:</span>
                    <span className="value">{(updatedCandidate.endorsements || []).length}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Polling:</span>
                    <span className="value">{updatedCandidate.polling ? `${Math.round(updatedCandidate.polling * 10) / 10}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <h4>Finance Overview</h4>
                <div className="metrics">
                  <div className="metric">
                    <span className="label">Total Campaign Funds:</span>
                    <span className="value">{formatCurrency(updatedCandidate.campaignFunds || updatedCampaignFinances?.totalFunds || 0)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Total Donors:</span>
                    <span className="value">{updatedCampaignFinances?.totalDonationCount || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Fundraising Target:</span>
                    <span className="value">{formatCurrency(updatedCampaignFinances?.monthlyFundraisingTarget || 0)}/month</span>
                  </div>
                  <div className="metric">
                    <span className="label">Last Donation:</span>
                    <span className="value">{formatDate(updatedCampaignFinances?.lastDonationDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {updatedCandidate.endorsements && updatedCandidate.endorsements.length > 0 && (
              <div className="endorsements-section">
                <h4>Endorsements</h4>
                <div className="endorsements-list">
                  {updatedCandidate.endorsements.map((endorsement, index) => (
                    <div key={index} className="endorsement-item">
                      {endorsement.name || endorsement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'finances' && (
          <div className="candidate-finances">
            <DonationTracker donations={donations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedCandidateView;