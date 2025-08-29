// ui-src/src/utils/legislationUtils.js

export const getLegislatureDetails = (campaign, level) => {
  if (!campaign || !level) return { members: [], size: 0, officeName: '' };

  const officeMapping = {
    city: "City Council",
    state: "State Legislature",
    national: "National Congress",
  };

  const officeName = officeMapping[level];
  
  // Helper function to flatten hierarchical government offices structure
  const flattenGovernmentOffices = (hierarchicalStructure) => {
    if (!hierarchicalStructure) return [];
    const flattened = [];
    
    // Add national offices
    if (hierarchicalStructure.national) {
      if (hierarchicalStructure.national.executive) flattened.push(...hierarchicalStructure.national.executive);
      if (hierarchicalStructure.national.legislative?.lowerHouse) flattened.push(...hierarchicalStructure.national.legislative.lowerHouse);
      if (hierarchicalStructure.national.legislative?.upperHouse) flattened.push(...hierarchicalStructure.national.legislative.upperHouse);
      if (hierarchicalStructure.national.judicial) flattened.push(...hierarchicalStructure.national.judicial);
    }
    
    // Add state offices
    if (hierarchicalStructure.states) {
      Object.values(hierarchicalStructure.states).forEach(state => {
        if (state.executive) flattened.push(...state.executive);
        if (state.legislative?.lowerHouse) flattened.push(...state.legislative.lowerHouse);
        if (state.legislative?.upperHouse) flattened.push(...state.legislative.upperHouse);
        if (state.judicial) flattened.push(...state.judicial);
      });
    }
    
    // Add city offices
    if (hierarchicalStructure.cities) {
      Object.values(hierarchicalStructure.cities).forEach(city => {
        if (city.executive) flattened.push(...city.executive);
        if (city.legislative) flattened.push(...city.legislative);
        if (city.judicial) flattened.push(...city.judicial);
      });
    }
    
    return flattened.filter(Boolean);
  };

  // Get flattened offices from hierarchical structure
  const flatOffices = flattenGovernmentOffices(campaign.governmentOffices);
  const office = flatOffices.find((o) => o && o.name === officeName);

  if (!office) {
    // For state and national levels, aggregate all individual legislative offices
    let aggregatedMembers = [];
    
    if (level === "city") {
      // City councils are typically multi-member bodies
      const cityOffice = flatOffices.find((o) => 
        o && o.level?.includes("city") && (o.officeNameTemplateId?.includes("council") || o.officeNameTemplateId?.includes("city_council"))
      );
      if (cityOffice) {
        return {
          members: cityOffice.members || [],
          size: cityOffice.members?.length || 0,
          officeName: cityOffice.name,
        };
      }
    } else if (level === "state") {
      // Aggregate all state legislative offices (house + senate)
      const stateOffices = flatOffices.filter((o) => 
        o && (o.level?.includes("state_lower_house") || o.level?.includes("state_upper_house")) && 
        (o.officeNameTemplateId?.includes("state_hr") || o.officeNameTemplateId?.includes("state_senate"))
      );
      
      stateOffices?.forEach(office => {
        // Handle both individual office holders and multi-member offices
        if (office.holder) aggregatedMembers.push(office.holder);
        if (office.members && office.members.length > 0) aggregatedMembers.push(...office.members);
      });
      
    } else if (level === "national") {
      // Aggregate all national legislative offices (house + senate)
      const nationalOffices = flatOffices.filter((o) => 
        o && (o.level?.includes("national_lower_house") || o.level?.includes("national_upper_house")) && 
        (o.officeNameTemplateId?.includes("national_hr") || o.officeNameTemplateId?.includes("national_senate"))
      );
      
      nationalOffices?.forEach(office => {
        // Handle both individual office holders and multi-member offices
        if (office.holder) aggregatedMembers.push(office.holder);
        if (office.members && office.members.length > 0) aggregatedMembers.push(...office.members);
      });
    }
    
    return {
      members: aggregatedMembers,
      size: aggregatedMembers.length,
      officeName: `${level.charAt(0).toUpperCase() + level.slice(1)} Legislature`,
    };
  }

  return {
    members: office.members || [],
    size: office.members?.length || 0,
    officeName,
  };
};

export const getStatsForLevel = (campaign, level) => {
  if (!campaign) return null;
  switch (level) {
    case 'city':
      return campaign.startingCity?.stats || null;
    case 'state':
      // Assuming you have a way to identify the relevant state
      // This might need to be more sophisticated, e.g., finding the state the city belongs to
      return campaign.regions?.find(r => r.id === campaign.startingCity.regionId)?.stats || null;
    case 'national':
      return campaign.country?.stats || null;
    default:
      return null;
  }
};
