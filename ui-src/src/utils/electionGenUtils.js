// src/utils/electionGenUtils.js
import {
  nationalElectionIds,
  stateElectionIds,
} from "../data/elections/electionData";

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
export const isStateLegislativeElectionType = (electionType) => {
  if (!electionType || !electionType.level) {
    return false;
  }

  const legislativeLevels = [
    "local_state_lower_house",
    "local_state_upper_house",
    "local_prefecture",
    "local_province_board",
    "local_state_parliament",
  ];

  if (!legislativeLevels.includes(electionType.level)) {
    return false;
  }

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
  const { regionId, countryId } = activeCampaign; // countryId is still needed for filtering entitiesToProcess if regionId is absent
  const baseOfficeName = electionType.officeNameTemplate;

  let entitiesToProcess = [];

  // Determine which sub-national entities (states/prefectures/provinces) to process.
  // If a specific regionId is provided, process only that entity.
  // Otherwise, if regionId is null or matches countryId, process ALL sub-national entities for that country.
  if (regionId && currentCountryData.regions?.find((r) => r.id === regionId)) {
    entitiesToProcess.push(
      currentCountryData.regions.find((r) => r.id === regionId)
    );
  } else if (
    regionId &&
    currentCountryData.provinces?.find((p) => p.id === regionId)
  ) {
    entitiesToProcess.push(
      currentCountryData.provinces.find((p) => p.id === regionId)
    );
  } else if (!regionId || regionId === countryId) {
    // Process all regions and provinces for the current country
    entitiesToProcess = [
      ...(currentCountryData.regions || []),
      ...(currentCountryData.provinces || []),
    ].filter((e) => e.id.startsWith(countryId)); // Ensure we only get entities for the current country
  }

  entitiesToProcess.forEach((entity) => {
    if (!entity || !entity.id || !entity.name || !entity.population) {
      console.warn(
        `[electionGenUtils.generateStateLegislative] Skipping invalid entity for election type ${electionType.id}:`,
        entity
      );
      return;
    }

    let entityNamePlaceholder = "{stateName}";

    // Resolve the basic office name template once for this entity
    let resolvedOfficeNameBase = baseOfficeName.replace(
      entityNamePlaceholder,
      entity.name
    );

    // --- General Logic for Districted Legislative Bodies (FPTP, SNTV_MMD, BlockVote) ---
    // This covers US state houses/senates, JPN prefectural assembly (SNTV_MMD), PHL provincial boards, KOR provincial assemblies
    // These elections have districts (even if multi-member) generated and stored on the entity.
    if (
      (electionType.electoralSystem === "FPTP" &&
        electionType.generatesOneWinner) || // Single-winner districts
      (electionType.electoralSystem === "SNTV_MMD" &&
        !electionType.generatesOneWinner) || // Multi-member districts (e.g., JPN, KOR, some PHL)
      (electionType.electoralSystem === "BlockVote" &&
        !electionType.generatesOneWinner) // Multi-member districts (e.g., other PHL)
    ) {
      // Prioritize legislativeDistricts, then boardDistricts (for PHL-specific naming)
      const districtsForThisChamber =
        entity.legislativeDistricts?.[electionType.id] ||
        (electionType.id === stateElectionIds.state_hr && entity.boardDistricts // Check if it's the specific electionType AND boardDistricts exist
          ? entity.boardDistricts // If so, use the entire boardDistricts array
          : null); // Otherwise, fall back to null (or an empty array, depending on desired behavior if no match)

      if (districtsForThisChamber && Array.isArray(districtsForThisChamber)) {
        districtsForThisChamber.forEach((district) => {
          if (!district || !district.id || !district.name) {
            console.warn(
              `[electionGenUtils.generateStateLegislative] Skipping invalid district in ${entity.name} for type ${electionType.id}:`,
              district
            );
            return;
          }

          // Resolve office name with district name
          const finalResolvedOfficeName = resolvedOfficeNameBase.replace(
            "{districtName}",
            district.name
          );

          instances.push({
            instanceIdBase: buildIdBaseFunc(
              electionType.id,
              `${entity.id}_${district.id}`
            ),
            entityType:
              district.entityType || "subnational_legislative_district", // Use a generic entity type
            entityData: {
              ...district,
              parentId: entity.id, // Consistent parent ID link
              parentName: entity.name,
              // You might want to add a `countryId` and `countryName` to entityData as well for full context
            },
            resolvedOfficeName: finalResolvedOfficeName,
            _isSingleSeatContest: electionType.generatesOneWinner, // True for FPTP, false for SNTV_MMD/BlockVote
            _effectiveElectoralSystem: electionType.electoralSystem,
            _effectiveGeneratesOneWinner: electionType.generatesOneWinner,
            // _numberOfSeatsForThisInstance will be set by calculateSeatDetailsForInstance using tiers
            ...electionType, // Spread to carry over all original electionType properties
            id: electionType.id,
          });
        });
      } else if (!electionType.generatesOneWinner) {
        // If it's a multi-winner election, but no districts were generated (e.g., entire entity is one MMD)
        console.warn(
          `[electionGenUtils.generateStateLegislative] Multi-winner election type ${electionType.id} in ${entity.name} has no explicit districts. Treating entire entity as one at-large district.`
        );
        // Create a single instance representing the entire entity as one multi-member district
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, entity.id), // Instance ID for the whole entity
          entityType: entity.entityType || "subnational_legislative_at_large",
          entityData: { ...entity },
          resolvedOfficeName: resolvedOfficeNameBase, // Office name without district placeholder
          _isSingleSeatContest: false, // It's multi-winner
          _effectiveElectoralSystem: electionType.electoralSystem,
          _effectiveGeneratesOneWinner: false,
          // _numberOfSeatsForThisInstance determined by calculateSeatDetailsForInstance
          ...electionType,
          id: electionType.id,
        });
      }
    }
    // --- Specific Logic for MMP Systems (e.g., Germany's Landtage) ---
    // MMP systems are often treated as a single election for the entire legislative body within the entity.
    else if (electionType.electoralSystem === "MMP") {
      // This block applies to any sub-national entity using MMP.
      // This is for the overall parliamentary election, not individual constituencies (which are handled by national HR typically)
      // or would need separate MMP constituency generation if modeled in depth.
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, entity.id),
        entityType: entity.entityType || "subnational_parliament",
        entityData: { ...entity },
        resolvedOfficeName: resolvedOfficeNameBase,
        _isSingleSeatContest: false, // Overall MMP election for the parliament is multi-winner
        _effectiveElectoralSystem: "MMP",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats, // Base number of seats for the Landtag
        ...electionType,
        id: electionType.id,
      });
    }
    // --- Fallback/Warning for unhandled state legislative types ---
    else {
      // This 'else' implies it was identified as a state legislative type by `isStateLegislativeElectionType`
      // but didn't match any specific generation pattern above (e.g., districted, MMP).
      // This might catch generic at-large assemblies.
      console.warn(
        `[electionGenUtils.generateStateLegislative] No specific generation logic matched for type '${electionType.id}' (System: ${electionType.electoralSystem}, Generates One: ${electionType.generatesOneWinner}) in entity: ${entity.name}. Falling back to generic at-large if applicable.`
      );
      // If it's a generic, non-districted, multi-winner assembly not specifically handled
      if (!electionType.generatesOneWinner) {
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, entity.id),
          entityType: entity.entityType || "subnational_at_large_assembly",
          entityData: { ...entity },
          resolvedOfficeName: resolvedOfficeNameBase,
          _isSingleSeatContest: false,
          _effectiveElectoralSystem: electionType.electoralSystem,
          _effectiveGeneratesOneWinner: false,
          _numberOfSeatsForThisInstance: electionType.minCouncilSeats,
          ...electionType,
          id: electionType.id,
        });
      } else {
        console.warn(
          `[electionGenUtils.generateStateLegislative] No instances generated for '${electionType.id}' in ${entity.name} as it requires specific logic.`
        );
      }
    }
  });

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

  if (electionType.id === "national_hr") {
    let districtsToProcess =
      currentCountryData.nationalLowerHouseDistricts || [];
    if (regionId) {
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
      const stateName = stateForDistrict ? stateForDistrict.name : "N/A State";
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, district.id),
        entityType: "national_hr_constituency",
        entityData: { ...district, stateName },
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
  if (electionType.id === "national_senate") {
    let statesToProcess = [];
    if (regionId) {
      const stateObj = currentCountryData.regions.find(
        (s) => s.id === regionId
      );
      if (stateObj) statesToProcess.push(stateObj);
    } else {
      statesToProcess = currentCountryData.regions || [];
    }

    statesToProcess.forEach((stateEntity) => {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, stateEntity.id),
        entityType: "state_as_national_district",
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
  } else if (electionType.electoralSystem === "MMP") {
    if (
      electionType.id === nationalElectionIds.national_hr &&
      electionType.level === "national_lower_house"
    ) {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, countryId),
        entityType: "nation",
        entityData: { ...currentCountryData },
        resolvedOfficeName: baseOfficeName,
        _isSingleSeatContest: false,
        _effectiveElectoralSystem: "MMP",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats,
        ...electionType,
        id: electionType.id,
      });
    }
  } else if (
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
