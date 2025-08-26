import React, { useState, useMemo } from 'react';
import useGameStore from '../store';
import './CitySelector.css';

const CitySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    activeCampaign, 
    currentCityId, 
    availableCities,
    availableCountries,
    actions 
  } = useGameStore();

  // Get cities from the selected region in the campaign
  const availableCitiesInRegion = useMemo(() => {
    if (!activeCampaign?.countryId || !activeCampaign?.regionId || !availableCountries) {
      return [];
    }
    
    const country = availableCountries.find(c => c.id === activeCampaign.countryId);
    const region = country?.regions?.find(r => r.id === activeCampaign.regionId);
    
    return region?.cities || [];
  }, [activeCampaign, availableCountries]);

  const filteredCities = useMemo(() => {
    return availableCitiesInRegion.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCitiesInRegion, searchTerm]);

  const currentCity = availableCitiesInRegion.find(city => city.id === currentCityId) || 
                     activeCampaign?.startingCity || 
                     availableCitiesInRegion[0];

  const handleCitySwitch = (cityId) => {
    const cityData = availableCitiesInRegion.find(city => city.id === cityId);
    if (cityData && cityId !== currentCityId) {
      actions.switchToCity(cityId, cityData);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  if (!activeCampaign) return null;

  return (
    <div className="city-selector">
      <button 
        className="city-selector-trigger menu-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="city-icon">🏙️</span>
        <span className="city-name">{currentCity.name}</span>
        <span className="city-population">({(currentCity.population / 1000).toFixed(0)}k)</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="city-selector-dropdown">
          <div className="city-search">
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="city-search-input"
            />
          </div>
          
          <div className="city-list">
            {filteredCities.map(city => (
              <button
                key={city.id}
                className={`city-option ${city.id === currentCityId ? 'current' : ''}`}
                onClick={() => handleCitySwitch(city.id)}
              >
                <div className="city-option-main">
                  <span className="city-option-name">{city.name}</span>
                  {city.id === currentCityId && <span className="current-indicator">Current</span>}
                </div>
                <div className="city-option-details">
                  <span className="city-option-population">
                    Population: {city.population.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {filteredCities.length === 0 && (
            <div className="no-cities-found">
              No cities found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySelector;
