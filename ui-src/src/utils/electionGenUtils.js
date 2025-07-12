// src/utils/electionGenUtils.js

/**
 * Helper to build a consistent base ID for an election instance.
 * @param {string} typeId - The ID of the election type (e.g., "mayor_usa").
 * @param {string} entitySpecificIdSuffix - The ID of the entity (e.g., city ID).
 * @returns {string}
 */

/**
 * Determines if a given election type is for a mayor-like (single city/municipal executive) position.
 * This includes mayors and vice-mayors (common in PHL context).
 * @param {object} electionType - The election type configuration object.
 * @param {string} countryId - The ID of the current country.
 * @returns {boolean}
 */
export const isMayorLikeElection = (electionType, countryId) => {
  if (!electionType || !electionType.generatesOneWinner) {
    return false; // Must be a single-winner election
  }

  const isCityLevel =
    electionType.level === "local_city" ||
    electionType.level === "local_city_or_municipality";
  if (!isCityLevel) {
    return false; // Must be at a city/municipality level
  }

  // Check if the election ID or office name template explicitly mentions "mayor"
  const idIncludesMayor = electionType.id?.toLowerCase().includes("mayor");
  const templateIncludesMayor = electionType.officeNameTemplate
    ?.toLowerCase()
    .includes("mayor");

  if (idIncludesMayor || templateIncludesMayor) {
    return true;
  }

  // Specific check for PHL Vice-Mayor, which acts as a single city-level executive
  if (
    countryId === "PHL" &&
    electionType.id?.toLowerCase().includes("vice_mayor")
  ) {
    return true;
  }

  // A more generic check if it's a single winner at city level and the template clearly refers to the city name.
  // This is to catch roles like "Chief Executive of {cityName}" if not explicitly named "mayor".
  const templateRefersToCity =
    electionType.officeNameTemplate?.includes("{cityName}") ||
    electionType.officeNameTemplate?.includes("{cityNameOrMunicipalityName}");
  if (templateRefersToCity) {
    // This condition is true if it's a single-winner, city-level election with a city-referencing template.
    // It's broad enough to catch mayors even if "mayor" isn't in the ID/template string.
    return true;
  }

  return false;
};

/**
 * Generates election instances for mayor-like elections (single executive for a city/municipality).
 * @param {object} electionType - The election type configuration object.
 * @param {object} cityEntity - The city/municipality object from activeCampaign.startingCity.
 * @param {string} countryId - The ID of the current country.
 * @param {function} buildIdBaseFunc - Function to build the instance ID base (can be passed from caller).
 * @returns {Array<object>} An array of election instance objects, or an empty array.
 */
export const generateMayorElectionInstances = (
  electionType,
  cityEntity,
  countryId,
  buildIdBaseFunc
) => {
  const instances = [];

  if (!cityEntity || !cityEntity.id || !cityEntity.name) {
    console.warn(
      `[electionGenUtils.generateMayorElectionInstances] Insufficient city data for election type: ${electionType.id}, City ID: ${cityEntity?.id}`
    );
    return instances;
  }

  let resolvedOfficeName = electionType.officeNameTemplate;
  if (resolvedOfficeName.includes("{cityName}")) {
    resolvedOfficeName = resolvedOfficeName.replace(
      "{cityName}",
      cityEntity.name
    );
  } else if (resolvedOfficeName.includes("{cityNameOrMunicipalityName}")) {
    // This placeholder is common in PHL election types
    resolvedOfficeName = resolvedOfficeName.replace(
      "{cityNameOrMunicipalityName}",
      cityEntity.name
    );
  } else {
    console.warn(
      `[electionGenUtils.generateMayorElectionInstances] Office name template "${electionType.officeNameTemplate}" for ${electionType.id} might not use standard city placeholders for city: ${cityEntity.name}. Using as-is or with partial replacement.`
    );
    // Attempt a generic replacement if a generic placeholder exists
    if (resolvedOfficeName.includes("{entityName}")) {
      resolvedOfficeName = resolvedOfficeName.replace(
        "{entityName}",
        cityEntity.name
      );
    }
  }

  instances.push({
    instanceIdBase: buildIdBaseFunc(electionType.id, cityEntity.id),
    entityType:
      electionType.level === "local_city_or_municipality"
        ? "city_or_municipality"
        : "city",
    entityData: { ...cityEntity }, // Pass all city data
    resolvedOfficeName: resolvedOfficeName,
    _isSingleSeatContest: true,
    _effectiveElectoralSystem: electionType.electoralSystem,
    _effectiveGeneratesOneWinner: true, // By definition of isMayorLikeElection
    // Add any other specific properties derived from electionType or context for this instance
    // For example, to ensure the electionType specific details are preserved:
    ...electionType, // Spread the original electionType to carry over all its properties
    id: electionType.id, // Ensure the original electionType id is preserved if spreading overwrites it
  });

  return instances;
};

/**
 * Determines if an election type is for a city council.
 * @param {object} electionType - The election type object.
 * @param {string} countryId - The ID of the country.
 * @returns {boolean} True if it's a city council election.
 */
export const isCityCouncilElectionType = (electionType) => {
  return (
    electionType.level.includes("local_city_council") ||
    electionType.level.includes("local_city") || // Broad match
    electionType.level.includes("local_municipality") || // Broad match
    electionType.level.includes("local_city_or_municipality_council") || // PHL
    electionType.id.includes("city_council") || // General ID check
    electionType.id.includes("municipal_council") // PHL
  );
};

/**
 * Generates election instances for a city council office.
 * This function handles both district-based and at-large councils.
 * @param {object} electionType - The election type definition.
 * @param {object} cityData - The city data.
 * @param {string} countryId - The country ID.
 * @param {object} countryConfig - The country's configuration data.
 * @param {Function} buildInstanceIdBaseLocal - Local instance ID builder.
 * @returns {Array<object>} Array of instance contexts.
 */
export const generateCityCouncilElectionInstances = (
  electionType,
  cityData,
  countryId,
  countryConfig,
  buildInstanceIdBaseLocal
) => {
  const instances = [];
  let baseOfficeNameTemplate = electionType.officeNameTemplate;

  // Resolve {cityName} and {cityNameOrMunicipalityName}
  if (cityData?.name) {
    baseOfficeNameTemplate = baseOfficeNameTemplate.replace(
      /{cityName}/g,
      cityData.name
    );
    baseOfficeNameTemplate = baseOfficeNameTemplate.replace(
      /{cityNameOrMunicipalityName}/g,
      cityData.name
    );
  }

  // Determine if this city has predefined council districts
  const hasPredefinedDistricts =
    cityData.councilDistricts && cityData.councilDistricts.length > 0;

  if (countryId === "USA" && hasPredefinedDistricts) {
    // USA: If a city has defined districts, create one instance per district (single winner per district)
    cityData.councilDistricts.forEach((district) => {
      let resolvedOfficeName = baseOfficeNameTemplate;
      resolvedOfficeName = resolvedOfficeName.replace(
        /{districtName}/g,
        district.name
      );
      // Ensure {districtNameOrAtLarge} is resolved based on district context
      resolvedOfficeName = resolvedOfficeName.replace(
        /{districtNameOrAtLarge}/g,
        district.name // Replace with district name directly if districted
      );
      // Remove any leftover placeholder pattern if it didn't match anything
      resolvedOfficeName = resolvedOfficeName.replace(
        /\s*\(?\{districtNameOrAtLarge\}\)?/g,
        ""
      );

      instances.push({
        instanceIdBase: buildInstanceIdBaseLocal(electionType.id, district.id),
        entityType: "city_council_district",
        entityData: { ...district, parentCityId: cityData.id },
        resolvedOfficeName: resolvedOfficeName,
        _isSingleSeatContest: true,
        _effectiveElectoralSystem: "FPTP", // Assuming FPTP for district elections
        _effectiveGeneratesOneWinner: true,
      });
    });
  } else {
    // For all other countries, or USA cities without predefined districts, assume at-large or treat as single MMD contest.
    let resolvedOfficeName = baseOfficeNameTemplate;

    // Fix: Ensure {districtNameOrAtLarge} is resolved to "At-Large" for non-districted MMDs
    if (resolvedOfficeName.includes("{districtNameOrAtLarge}")) {
      if (
        electionType.electoralSystem === "PluralityMMD" ||
        electionType.electoralSystem === "BlockVote" ||
        electionType.electoralSystem === "SNTV_MMD"
      ) {
        resolvedOfficeName = resolvedOfficeName.replace(
          /{districtNameOrAtLarge}/g,
          "At-Large"
        );
      } else {
        // For other systems (like PartyListPR which doesn't use this phrasing), just remove the placeholder
        resolvedOfficeName = resolvedOfficeName.replace(
          /\s*\(?\{districtNameOrAtLarge\}\)?/g,
          ""
        );
      }
    }

    // Add a single instance representing the entire city council contest
    instances.push({
      instanceIdBase: buildInstanceIdBaseLocal(electionType.id, cityData.id), // Base instance ID for the whole council
      entityType: "city_council",
      entityData: { ...cityData }, // Pass the whole city data
      resolvedOfficeName: resolvedOfficeName,
      _isSingleSeatContest: false, // This single instance covers multiple seats
      _effectiveElectoralSystem: electionType.electoralSystem, // Use original system
      _effectiveGeneratesOneWinner: electionType.generatesOneWinner, // Use original GOW
    });
  }
  return instances;
};

/**
 * Determines if a given election type is for a state/prefecture/province-level legislative body.
 * This is a broad check based on level; specific handling will be done in the generation function.
 * @param {object} electionType - The election type configuration object.
 * @param {string} countryId - The ID of the current country.
 * @returns {boolean}
 */
export const isStateLegislativeElectionType = (electionType, countryId) => {
  if (!electionType || !electionType.level) {
    return false;
  }

  const legislativeLevels = [
    "local_state_lower_house", // e.g., USA State House of Reps districts
    "local_state_upper_house", // e.g., USA State Senate districts
    "local_prefecture", // Used by JPN Prefectural Assembly (at-large)
    "local_province_board", // e.g., PHL Sangguniang Panlalawigan (districted within province)
    "local_state_parliament", // e.g., GER Landtag (MMP for the whole state)
    // Potentially "local_state" or "local_province" if !generatesOneWinner for other at-large assemblies
  ];

  if (!legislativeLevels.includes(electionType.level)) {
    return false;
  }

  // Specific checks to ensure we are targeting the correct legislative bodies
  // and not, for example, a state-level single executive if "local_state" was too broad.

  if (electionType.level === "local_prefecture") {
    // For JPN, "local_prefecture" is used for Governor (singleWinner) and Assembly (multiWinner)
    return (
      countryId === "JPN" &&
      electionType.id === "prefectural_assembly" &&
      !electionType.generatesOneWinner
    );
  }

  // If it's one of the explicitly legislative levels like *_lower_house, *_upper_house, *_board, *_parliament,
  // it's highly likely a state legislative election.
  // The generatesOneWinner flag will distinguish between a single district seat vs. an entire at-large body election.
  return true;
};

/**
 * Generates election instances for various state/prefecture/province legislative chambers.
 * Handles districted (USA), at-large (JPN Prefectural Assembly),
 * board districts (PHL), and MMP (GER state parliaments).
 *
 * @param {object} electionType - The election type configuration object.
 * @param {object} activeCampaign - Contains countryId, regionId (context for the state/prefecture/province).
 * @param {object} currentCountryData - The full data object for the current country.
 * @param {function} buildIdBaseFunc - Function to build the instance ID base.
 * @returns {Array<object>} An array of election instance objects.
 */
export const generateStateLegislativeElectionInstances = (
  electionType,
  activeCampaign,
  currentCountryData,
  buildIdBaseFunc
) => {
  const instances = [];
  const { countryId, regionId } = activeCampaign;
  const baseOfficeName = electionType.officeNameTemplate;

  // --- USA State Legislatures (Lower & Upper House - Districted) ---
  if (
    countryId === "USA" &&
    (electionType.level === "local_state_lower_house" ||
      electionType.level === "local_state_upper_house")
  ) {
    const currentActiveState = currentCountryData.regions?.find(
      (r) => r.id === regionId
    );
    if (currentActiveState) {
      const districtsForThisChamber =
        currentActiveState.legislativeDistricts?.[electionType.id];
      if (districtsForThisChamber && Array.isArray(districtsForThisChamber)) {
        districtsForThisChamber.forEach((district) => {
          if (!district || !district.id || !district.name) {
            console.warn(
              `[electionGenUtils.generateStateLegislative] Skipping invalid US state district in ${currentActiveState.name}:`,
              district
            );
            return;
          }
          instances.push({
            instanceIdBase: buildIdBaseFunc(
              electionType.id,
              `${currentActiveState.id}_${district.id}`
            ),
            entityType: "state_legislative_district",
            entityData: {
              ...district,
              stateId: currentActiveState.id,
              stateName: currentActiveState.name,
            },
            resolvedOfficeName: baseOfficeName
              .replace("{stateName}", currentActiveState.name)
              .replace("{districtName}", district.name),
            _isSingleSeatContest: true, // Each district is a contest for one seat
            _effectiveElectoralSystem: electionType.electoralSystem, // Typically FPTP for US
            _effectiveGeneratesOneWinner: true, // From the perspective of this district election
            ...electionType,
            id: electionType.id,
          });
        });
      } else {
        // console.warn(`[electionGenUtils.generateStateLegislative] USA: No legislative districts found for type '${electionType.id}' in state '${currentActiveState.name}'.`);
      }
    } else if (electionType.level.startsWith("local_state_")) {
      // console.warn(`[electionGenUtils.generateStateLegislative] USA: State with regionId '${regionId}' not found for legislative district elections.`);
    }
  }
  // --- JPN Prefectural Assembly (At-large for the entire prefecture) ---
  else if (
    countryId === "JPN" &&
    electionType.id === "prefectural_assembly" &&
    electionType.level === "local_prefecture" && // Ensures it's not the Governor
    !electionType.generatesOneWinner
  ) {
    let prefecturesToProcess = [];
    // If regionId is a specific JPN prefecture, process only that one.
    // Otherwise, if no regionId or it's the countryId, process all JPN prefectures.
    if (
      regionId &&
      currentCountryData.regions?.find(
        (r) => r.id === regionId && r.id.startsWith("JPN_")
      )
    ) {
      const pref = currentCountryData.regions.find((r) => r.id === regionId);
      if (pref) prefecturesToProcess.push(pref);
    } else if (!regionId || regionId === countryId) {
      // National context or no specific region
      prefecturesToProcess =
        currentCountryData.regions?.filter((r) => r.id.startsWith("JPN_")) ||
        [];
    }

    prefecturesToProcess.forEach((prefecture) => {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, prefecture.id),
        entityType: "prefecture", // The election entity is the whole prefecture
        entityData: { ...prefecture },
        resolvedOfficeName: baseOfficeName.replace(
          "{prefectureName}",
          prefecture.name
        ),
        _isSingleSeatContest: false, // Assembly election is multi-winner
        _effectiveElectoralSystem: electionType.electoralSystem, // SNTV_MMD
        _effectiveGeneratesOneWinner: false,
        // _numberOfSeatsForThisInstance will be set by calculateSeatDetailsForInstance later
        ...electionType,
        id: electionType.id,
      });
    });
  }
  // --- PHL Provincial Boards (Sangguniang Panlalawigan - Districted within a province) ---
  else if (
    countryId === "PHL" &&
    electionType.level === "local_province_board"
    // This implies !electionType.generatesOneWinner from its nature
  ) {
    let provincesToProcess = [];
    // Determine which province(s) to process based on regionId context
    if (
      regionId &&
      currentCountryData.provinces?.find(
        (p) => p.id === regionId && p.id.startsWith("PHL_PROV_")
      )
    ) {
      const prov = currentCountryData.provinces.find((p) => p.id === regionId);
      if (prov) provincesToProcess.push(prov);
    } else if (
      regionId &&
      currentCountryData.regions?.find(
        (r) => r.id === regionId && r.id.startsWith("PHL_R")
      )
    ) {
      // Admin region context
      provincesToProcess =
        currentCountryData.provinces?.filter(
          (p) => p.adminRegionId === regionId
        ) || [];
    } else if (!regionId || regionId === countryId) {
      // National context or unrecognized regionId
      provincesToProcess =
        currentCountryData.provinces?.filter((p) =>
          p.id.startsWith("PHL_PROV_")
        ) || [];
    }

    provincesToProcess.forEach((province) => {
      if (province.boardDistricts && Array.isArray(province.boardDistricts)) {
        province.boardDistricts.forEach((boardDistrict) => {
          if (
            !boardDistrict ||
            !boardDistrict.id ||
            !boardDistrict.name ||
            boardDistrict.seatsToElect == null
          ) {
            console.warn(
              `[electionGenUtils.generateStateLegislative] Skipping invalid PHL board district in ${province.name}:`,
              boardDistrict
            );
            return;
          }
          instances.push({
            instanceIdBase: buildIdBaseFunc(
              electionType.id,
              `${province.id}_${boardDistrict.id}`
            ),
            entityType: "provincial_board_district",
            entityData: {
              ...boardDistrict,
              provinceId: province.id,
              provinceName: province.name,
            },
            resolvedOfficeName: baseOfficeName
              .replace("{provinceName}", province.name)
              .replace("{districtName}", boardDistrict.name),
            _isSingleSeatContest: false, // Each board district election is multi-winner for its seats
            _effectiveElectoralSystem: electionType.electoralSystem, // BlockVote
            _effectiveGeneratesOneWinner: false,
            _numberOfSeatsForThisInstance: boardDistrict.seatsToElect, // Seats for this specific board district
            ...electionType,
            id: electionType.id,
          });
        });
      } else {
        // console.warn(`[electionGenUtils.generateStateLegislative] PHL: Province '${province.name}' missing 'boardDistricts' for election type ${electionType.id}.`);
      }
    });
  }
  // --- GER State Parliaments (Landtage - MMP, one instance for the whole state parliament) ---
  else if (
    countryId === "GER" &&
    electionType.id === "state_parliament_deu" &&
    electionType.level === "local_state_parliament"
  ) {
    let statesToProcess = [];
    // Determine which German state(s) to process
    if (
      regionId &&
      currentCountryData.regions?.find(
        (r) => r.id === regionId && r.id.startsWith("DEU_")
      )
    ) {
      const state = currentCountryData.regions.find((r) => r.id === regionId);
      if (state) statesToProcess.push(state);
    } else if (!regionId || regionId === countryId) {
      // National context or no specific region
      statesToProcess =
        currentCountryData.regions?.filter((r) => r.id.startsWith("DEU_")) ||
        [];
    }

    statesToProcess.forEach((stateEntity) => {
      if (!stateEntity || !stateEntity.id || !stateEntity.name) return;
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, stateEntity.id),
        entityType: "state", // Or "land"
        entityData: { ...stateEntity },
        resolvedOfficeName: baseOfficeName.replace(
          "{stateName}",
          stateEntity.name
        ),
        _isSingleSeatContest: false, // Overall MMP election for the parliament is multi-winner
        _effectiveElectoralSystem: "MMP",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats, // Base number of seats for the Landtag
        // MMP also involves constituency seats; this instance is for the overall proportional allocation.
        // Constituency instances would need to be generated separately if your model is that detailed for GER states.
        // However, your ELECTION_TYPES_BY_COUNTRY defines state_parliament_deu as a single MMP election.
        ...electionType,
        id: electionType.id,
      });
    });
  }
  // Add other countries' state/provincial/regional legislative bodies here if they have unique structures.
  else {
    // This 'else' implies it was identified as a state legislative type by `isStateLegislativeElectionType`
    // but didn't match any specific country logic above.
    // Could be a generic at-large state assembly for a new country.
    if (
      electionType.level.startsWith("local_state") ||
      electionType.level.startsWith("local_province") ||
      electionType.level.startsWith("local_prefecture")
    ) {
      const regionEntity = currentCountryData.regions?.find(
        (r) => r.id === regionId
      );
      if (regionEntity && !electionType.generatesOneWinner) {
        // Generic at-large assembly
        console.warn(
          `[electionGenUtils.generateStateLegislative] Using generic at-large logic for legislative body: ${electionType.id} in ${regionEntity.name}.`
        );
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, regionEntity.id),
          entityType: "state_or_equivalent",
          entityData: { ...regionEntity },
          resolvedOfficeName: baseOfficeName
            .replace("{stateName}", regionEntity.name)
            .replace("{provinceName}", regionEntity.name)
            .replace("{prefectureName}", regionEntity.name),
          _isSingleSeatContest: false,
          _effectiveElectoralSystem: electionType.electoralSystem,
          _effectiveGeneratesOneWinner: false,
          ...electionType,
          id: electionType.id,
        });
      }
    }
  }

  return instances;
};

/**
 * Determines if a given election type is for a national legislative body.
 * This excludes national single-executive roles like President/Vice-President.
 * @param {object} electionType - The election type configuration object.
 * @returns {boolean}
 */
export const isNationalLegislativeElectionType = (electionType) => {
  if (
    !electionType ||
    !electionType.level ||
    !electionType.level.startsWith("national_")
  ) {
    return false; // Must be a national level
  }

  // Exclude single-executive national roles (President, VP)
  const executiveLevels = [
    "national_head_of_state_and_government",
    "national_vice_head_of_state_and_government",
  ];
  if (
    executiveLevels.includes(electionType.level) &&
    electionType.generatesOneWinner
  ) {
    return false;
  }

  // If it starts with "national_" and isn't an executive, it's likely legislative.
  // Examples: national_lower_house, national_upper_house, national_lower_house_constituency, etc.
  return true;
};

/**
 * Generates election instances for various national legislative chambers.
 * Handles districted representatives, PR blocs, and nationwide PR lists.
 *
 * @param {object} electionType - The election type configuration object.
 * @param {object} activeCampaign - Contains countryId, regionId for context.
 * @param {object} currentCountryData - The full data object for the current country.
 * @param {function} buildIdBaseFunc - Function to build the instance ID base.
 * @returns {Array<object>} An array of election instance objects.
 */
export const generateNationalLegislativeElectionInstances = (
  electionType,
  activeCampaign,
  currentCountryData,
  buildIdBaseFunc
) => {
  const instances = [];
  const { countryId, regionId } = activeCampaign;
  const baseOfficeName = electionType.officeNameTemplate;

  // --- USA National Legislature ---
  if (countryId === "USA") {
    // U.S. House of Representatives (Congressional Districts)
    if (
      electionType.id === "national_hr_usa" &&
      electionType.level === "national_lower_house_constituency"
    ) {
      let districtsToProcess =
        currentCountryData.nationalLowerHouseDistricts || [];
      // If regionId is a specific US state, filter districts for that state.
      if (
        regionId &&
        currentCountryData.regions?.some(
          (r) => r.id === regionId && r.id.startsWith("USA_")
        )
      ) {
        districtsToProcess = districtsToProcess.filter(
          (d) => d.stateId === regionId
        );
      }

      districtsToProcess.forEach((district) => {
        if (!district || !district.id || !district.name) {
          console.warn(
            "[electionGenUtils.generateNationalLegislative] Skipping invalid US HR district:",
            district
          );
          return;
        }
        const stateForDistrict = currentCountryData.regions?.find(
          (s) => s.id === district.stateId
        );
        const stateName = stateForDistrict
          ? stateForDistrict.name
          : "N/A State";
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, district.id),
          entityType: "national_hr_constituency",
          entityData: { ...district, stateName }, // stateName for template resolving
          resolvedOfficeName: baseOfficeName
            .replace("{stateName}", stateName)
            .replace("{districtName}", district.name),
          _isSingleSeatContest: true,
          _effectiveElectoralSystem: electionType.electoralSystem || "FPTP",
          _effectiveGeneratesOneWinner: true,
          ...electionType,
          id: electionType.id,
        });
      });
    }
    // U.S. Senate (Each state elects senators; this instance is for *a* senate race in a state)
    else if (
      electionType.id === "national_senate_usa" &&
      electionType.level === "national_upper_house_state_rep"
    ) {
      let statesToProcess = [];
      if (
        regionId &&
        currentCountryData.regions?.some(
          (r) => r.id === regionId && r.id.startsWith("USA_")
        )
      ) {
        const stateObj = currentCountryData.regions.find(
          (s) => s.id === regionId
        );
        if (stateObj) statesToProcess.push(stateObj);
      } else {
        // If no specific state context, process for all US states
        statesToProcess =
          currentCountryData.regions?.filter((r) => r.id.startsWith("USA_")) ||
          [];
      }

      statesToProcess.forEach((stateEntity) => {
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, stateEntity.id), // Could add a "class" suffix if your game tracks staggered terms
          entityType: "state_as_national_district", // A state acting as an electoral district for a national office
          entityData: { ...stateEntity },
          resolvedOfficeName: baseOfficeName.replace(
            "{stateName}",
            stateEntity.name
          ),
          _isSingleSeatContest: true,
          _effectiveElectoralSystem: electionType.electoralSystem || "FPTP",
          _effectiveGeneratesOneWinner: true,
          ...electionType,
          id: electionType.id,
        });
      });
    }
  }
  // --- JPN National Legislature ---
  else if (countryId === "JPN") {
    // JPN House of Councillors (HoC) - District Elections (Prefectures as districts)
    if (
      electionType.id === "national_hc_district" &&
      electionType.level === "national_upper_house_prefectural_district"
    ) {
      (
        currentCountryData.regions?.filter((r) => r.id.startsWith("JPN_")) || []
      ).forEach((prefecture) => {
        const seatsThisCycle = prefecture.seatsForHoCPerCycle || 1;
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, prefecture.id),
          entityType: "prefecture_as_national_district",
          entityData: { ...prefecture }, // Includes seatsForHoCPerCycle
          resolvedOfficeName: baseOfficeName.replace(
            "{prefectureName}",
            prefecture.name
          ),
          _isSingleSeatContest: seatsThisCycle === 1,
          _effectiveElectoralSystem: electionType.electoralSystem, // SNTV_MMD
          _effectiveGeneratesOneWinner: seatsThisCycle === 1,
          _numberOfSeatsForThisHoCInstance: seatsThisCycle,
          ...electionType,
          id: electionType.id,
        });
      });
    }
    // JPN House of Councillors (HoC) - Nationwide PR Election
    else if (
      electionType.id === "national_hc_pr" &&
      electionType.level === "national_upper_house_pr_national"
    ) {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, countryId), // Nationwide instance
        entityType: "nation",
        entityData: { ...currentCountryData },
        resolvedOfficeName: baseOfficeName, // Template is usually fixed like "Member of House of Councillors (Nationwide PR)"
        _isSingleSeatContest: false,
        _effectiveElectoralSystem: "PartyListPR",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats, // e.g., 50 for this part of HoC
        ...electionType,
        id: electionType.id,
      });
    }
    // JPN House of Representatives (HoR) - Constituency (SMD) Elections
    else if (
      electionType.id === "national_hr_constituency" &&
      electionType.level === "national_lower_house_constituency"
    ) {
      (
        currentCountryData.nationalLowerHouseDistricts?.filter((d) =>
          d.prefectureId?.startsWith("JPN_")
        ) || []
      ).forEach((district) => {
        if (!district || !district.id || !district.name) return;
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, district.id),
          entityType: "national_hr_constituency",
          entityData: { ...district }, // district should have id, name, prefectureId
          resolvedOfficeName: baseOfficeName.replace(
            "{districtName}",
            district.name
          ),
          _isSingleSeatContest: true,
          _effectiveElectoralSystem: "FPTP",
          _effectiveGeneratesOneWinner: true,
          ...electionType,
          id: electionType.id,
        });
      });
    }
    // JPN House of Representatives (HoR) - PR Bloc Elections
    else if (
      electionType.id === "national_hr_pr_bloc" &&
      electionType.level === "national_lower_house_pr_bloc"
    ) {
      (
        currentCountryData.nationalPrBlocs?.filter((b) =>
          b.id.startsWith("JPN_PR_")
        ) || []
      ).forEach((bloc) => {
        if (!bloc || !bloc.id || !bloc.name) return;
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, bloc.id),
          entityType: "national_pr_bloc",
          entityData: { ...bloc }, // bloc should have id, name, numberOfSeats
          resolvedOfficeName: baseOfficeName.replace("{blocName}", bloc.name),
          _isSingleSeatContest: false,
          _effectiveElectoralSystem: "PartyListPR",
          _effectiveGeneratesOneWinner: false,
          _numberOfSeatsForThisInstance:
            bloc.numberOfSeats || electionType.minCouncilSeats,
          ...electionType,
          id: electionType.id,
        });
      });
    }
  }
  // --- PHL National Legislature ---
  else if (countryId === "PHL") {
    // PHL House of Representatives - District Representatives
    if (
      electionType.id === "national_hr_district_phl" &&
      electionType.level === "national_lower_house_constituency"
    ) {
      let districtsToProcess =
        currentCountryData.nationalLowerHouseDistricts?.filter((d) =>
          d.id.includes("_HRD")
        ) || [];
      // Optional: Filter by province if regionId is a PHL province
      if (
        regionId &&
        currentCountryData.provinces?.some(
          (p) => p.id === regionId && p.id.startsWith("PHL_PROV_")
        )
      ) {
        districtsToProcess = districtsToProcess.filter(
          (d) => d.provinceId === regionId
        );
      }
      districtsToProcess.forEach((hrDistrict) => {
        if (!hrDistrict || !hrDistrict.id || !hrDistrict.name) return;
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, hrDistrict.id),
          entityType: "national_hr_constituency",
          entityData: { ...hrDistrict }, // hrDistrict should have name, provinceName, etc.
          resolvedOfficeName: baseOfficeName.replace(
            "{districtName}",
            hrDistrict.name
          ),
          _isSingleSeatContest: true,
          _effectiveElectoralSystem: "FPTP",
          _effectiveGeneratesOneWinner: true,
          ...electionType,
          id: electionType.id,
        });
      });
    }
    // PHL House of Representatives - Party-List Representatives (Nationwide)
    else if (
      electionType.id === "national_hr_partylist_phl" &&
      electionType.level === "national_lower_house_partylist"
    ) {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, countryId), // Nationwide
        entityType: "nation",
        entityData: { ...currentCountryData },
        resolvedOfficeName: baseOfficeName, // Usually "Party-List Representative"
        _isSingleSeatContest: false,
        _effectiveElectoralSystem: "PartyListPR",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats, // Total PartyList seats
        ...electionType,
        id: electionType.id,
      });
    }
    // PHL Senate (Nationwide)
    else if (
      electionType.id === "national_senate_phl" &&
      electionType.level === "national_upper_house"
    ) {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, countryId), // Nationwide
        entityType: "nation",
        entityData: { ...currentCountryData },
        resolvedOfficeName: baseOfficeName, // Usually "Senator of the Philippines"
        _isSingleSeatContest: false, // Elects multiple senators (e.g., 12 at a time)
        _effectiveElectoralSystem: "BlockVote", // Or "PluralityMMD"
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats, // e.g., 12 seats per election cycle
        ...electionType,
        id: electionType.id,
      });
    }
  }
  // --- GER National Legislature (Bundestag - MMP) ---
  else if (countryId === "GER") {
    if (
      electionType.id === "national_bundestag_deu" &&
      electionType.level === "national_lower_house"
    ) {
      // For MMP, instance generation can be complex.
      // Option 1: This single instance represents the *overall* Bundestag election.
      //           Constituency results would need to be fed into its results processing.
      // Option 2: Generate separate instances for each constituency + one for the list component.
      //           Your ELECTION_TYPES_BY_COUNTRY defines it as one MMP election for the national_lower_house.
      // So, we'll create one instance representing the overall Bundestag election.
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, countryId),
        entityType: "nation",
        entityData: { ...currentCountryData },
        resolvedOfficeName: baseOfficeName, // Usually "Member of Bundestag"
        _isSingleSeatContest: false, // Overall it's multi-winner
        _effectiveElectoralSystem: "MMP",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats, // Base number of Bundestag seats
        ...electionType,
        id: electionType.id,
      });
    }
  }
  // --- Generic National Legislative Fallback (e.g., for a new country with a simple national PR list) ---
  else if (
    electionType.level.startsWith("national_") &&
    !electionType.generatesOneWinner &&
    (electionType.electoralSystem === "PartyListPR" ||
      electionType.electoralSystem === "MMP")
  ) {
    // This catches a nationwide PR or MMP list election not covered by specific country logic.
    console.warn(
      `[electionGenUtils.generateNationalLegislative] Using generic nationwide list logic for: ${electionType.id} in ${countryId}.`
    );
    instances.push({
      instanceIdBase: buildIdBaseFunc(electionType.id, countryId),
      entityType: "nation",
      entityData: { ...currentCountryData },
      resolvedOfficeName: baseOfficeName.replace(
        "{countryName}",
        currentCountryData.name
      ), // Assuming a {countryName} placeholder
      _isSingleSeatContest: false,
      _effectiveElectoralSystem: electionType.electoralSystem,
      _effectiveGeneratesOneWinner: false,
      _numberOfSeatsForThisInstance: electionType.minCouncilSeats,
      ...electionType,
      id: electionType.id,
    });
  }
  // Add more `else if` blocks here for other countries' national legislative structures if needed.

  return instances;
};
