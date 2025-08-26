// ui-src/src/utils/legislationUtils.js

export const getLegislatureDetails = (campaign, level) => {
  if (!campaign || !level) return { members: [], size: 0, officeName: '' };

  const officeMapping = {
    city: "City Council",
    state: "State Legislature",
    national: "National Congress",
  };

  const officeName = officeMapping[level];
  
  const office = campaign.governmentOffices?.find((o) => o && o.name === officeName);

  if (!office) {
    // For state and national levels, aggregate all individual legislative offices
    let aggregatedMembers = [];
    
    if (level === "city") {
      // City councils are typically multi-member bodies
      const cityOffice = campaign.governmentOffices?.find((o) => 
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
      const stateOffices = campaign.governmentOffices?.filter((o) => 
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
      const nationalOffices = campaign.governmentOffices?.filter((o) => 
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
