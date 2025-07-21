// src/elections/electionInstance.js
// This file is responsible for determining WHICH specific election instances should be generated
// based on the game's context (country, region, city) and the election type definitions.

import {
  nationalElectionIds,
  stateElectionIds,
} from "../data/elections/electionData";

/**
 * Determines if a given election type is for a mayor-like (single city executive) position.
 * @param {object} electionType - The election type configuration object.
 * @param {string} countryId - The ID of the current country.
 * @returns {boolean}
 */
export const isMayorLikeElection = (electionType, countryId) => {
  if (!electionType || !electionType.generatesOneWinner) {
    return false;
  }
  const isCityLevel =
    electionType.level === "local_city" ||
    electionType.level === "local_city_or_municipality";
  if (!isCityLevel) {
    return false;
  }
  const idIncludesMayor = electionType.id?.toLowerCase().includes("mayor");
  const templateIncludesMayor = electionType.officeNameTemplate
    ?.toLowerCase()
    .includes("mayor");
  if (idIncludesMayor || templateIncludesMayor) {
    return true;
  }
  if (
    countryId === "PHL" &&
    electionType.id?.toLowerCase().includes("vice_mayor")
  ) {
    return true;
  }
  return false;
};

/**
 * Generates election instances for mayor-like elections.
 * @param {object} electionType - The election type configuration object.
 * @param {object} cityEntity - The city/municipality object.
 * @param {string} countryId - The ID of the current country.
 * @param {function} buildIdBaseFunc - Function to build the instance ID base.
 * @returns {Array<object>} An array of election instance objects.
 */
export const generateMayorElectionInstances = (
  electionType,
  cityEntity,
  countryId,
  buildIdBaseFunc
) => {
  const instances = [];
  if (!cityEntity || !cityEntity.id || !cityEntity.name) {
    return instances;
  }

  let resolvedOfficeName = electionType.officeNameTemplate
    .replace("{cityName}", cityEntity.name)
    .replace("{cityNameOrMunicipalityName}", cityEntity.name);

  instances.push({
    instanceIdBase: buildIdBaseFunc(electionType.id, cityEntity.id),
    entityType: "city",
    entityData: { ...cityEntity },
    resolvedOfficeName: resolvedOfficeName,
    _isSingleSeatContest: true,
    _effectiveElectoralSystem: electionType.electoralSystem,
    _effectiveGeneratesOneWinner: true,
  });

  return instances;
};

/**
 * Determines if an election type is for a city council.
 * @param {object} electionType - The election type object.
 * @returns {boolean} True if it's a city council election.
 */
export const isCityCouncilElectionType = (electionType) => {
  return (
    electionType.level.includes("local_city_council") ||
    electionType.level.includes("local_city") ||
    electionType.level.includes("local_municipality") ||
    electionType.level.includes("local_city_or_municipality_council") ||
    electionType.id.includes("city_council") ||
    electionType.id.includes("municipal_council")
  );
};

/**
 * Generates election instances for a city council office.
 * @param {object} electionType - The election type definition.
 * @param {object} cityData - The city data.
 * @param {string} countryId - The country ID.
 * @param {object} countryConfig - The full country data object (used to align parameters).
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

  if (cityData?.name) {
    baseOfficeNameTemplate = baseOfficeNameTemplate
      .replace(/{cityName}/g, cityData.name)
      .replace(/{cityNameOrMunicipalityName}/g, cityData.name);
  }

  const hasPredefinedDistricts =
    cityData.councilDistricts && cityData.councilDistricts.length > 0;

  if (countryId === "USA" && hasPredefinedDistricts) {
    cityData.councilDistricts.forEach((district) => {
      let resolvedOfficeName = baseOfficeNameTemplate
        .replace(/{districtName}/g, district.name)
        .replace(/{districtNameOrAtLarge}/g, district.name);
      resolvedOfficeName = resolvedOfficeName.replace(
        /\s*\(?\{districtNameOrAtLarge\}\)?/g,
        ""
      );
      instances.push({
        instanceIdBase: buildInstanceIdBaseLocal(electionType.id, district.id),
        entityType: "city_council_district",
        entityData: { ...district, parentCityId: cityData.id },
        resolvedOfficeName,
        _isSingleSeatContest: true,
        _effectiveElectoralSystem: "FPTP",
        _effectiveGeneratesOneWinner: true,
      });
    });
  } else {
    let resolvedOfficeName = baseOfficeNameTemplate;
    if (resolvedOfficeName.includes("{districtNameOrAtLarge}")) {
      if (
        ["PluralityMMD", "BlockVote", "SNTV_MMD"].includes(
          electionType.electoralSystem
        )
      ) {
        resolvedOfficeName = resolvedOfficeName.replace(
          /{districtNameOrAtLarge}/g,
          "At-Large"
        );
      } else {
        resolvedOfficeName = resolvedOfficeName.replace(
          /\s*\(?\{districtNameOrAtLarge\}\)?/g,
          ""
        );
      }
    }
    instances.push({
      instanceIdBase: buildInstanceIdBaseLocal(electionType.id, cityData.id),
      entityType: "city_council",
      entityData: { ...cityData },
      resolvedOfficeName,
      _isSingleSeatContest: false,
      _effectiveElectoralSystem: electionType.electoralSystem,
      _effectiveGeneratesOneWinner: electionType.generatesOneWinner,
    });
  }
  return instances;
};

/**
 * Determines if a given election type is for a state/prefecture/province-level legislative body.
 * @param {object} electionType - The election type configuration object.
 * @returns {boolean}
 */
export const isStateLegislativeElectionType = (electionType) => {
  if (!electionType || !electionType.level) return false;
  const legislativeLevels = [
    "local_state_lower_house",
    "local_state_upper_house",
    "local_prefecture",
    "local_province_board",
    "local_state_parliament",
  ];
  return legislativeLevels.includes(electionType.level);
};

/**
 * Generates election instances for various state/prefecture/province legislative chambers.
 * @param {object} electionType - The election type configuration object.
 * @param {object} activeCampaign - Contains countryId, regionId.
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
  const { regionId, countryId } = activeCampaign;
  const baseOfficeName = electionType.officeNameTemplate;
  let entitiesToProcess = [];

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
    entitiesToProcess = [
      ...(currentCountryData.regions || []),
      ...(currentCountryData.provinces || []),
    ].filter((e) => e.id.startsWith(countryId));
  }

  entitiesToProcess.forEach((entity) => {
    if (!entity || !entity.id || !entity.name || !entity.population) return;
    let resolvedOfficeNameBase = baseOfficeName.replace(
      "{stateName}",
      entity.name
    );

    if (
      ["FPTP", "SNTV_MMD", "BlockVote"].includes(electionType.electoralSystem)
    ) {
      const districtsForThisChamber =
        entity.legislativeDistricts?.[electionType.id] ||
        (electionType.id === stateElectionIds.state_hr && entity.boardDistricts
          ? entity.boardDistricts
          : null);
      if (districtsForThisChamber && Array.isArray(districtsForThisChamber)) {
        districtsForThisChamber.forEach((district) => {
          if (!district || !district.id || !district.name) return;
          const finalResolvedOfficeName = resolvedOfficeNameBase.replace(
            "{districtName}",
            district.name
          );
          instances.push({
            instanceIdBase: buildIdBaseFunc(
              electionType.id,
              `${entity.id}_${district.id}`
            ),
            entityType: "subnational_legislative_district",
            entityData: {
              ...district,
              parentId: entity.id,
              parentName: entity.name,
            },
            resolvedOfficeName: finalResolvedOfficeName,
            _isSingleSeatContest: electionType.generatesOneWinner,
            _effectiveElectoralSystem: electionType.electoralSystem,
            _effectiveGeneratesOneWinner: electionType.generatesOneWinner,
          });
        });
      } else if (!electionType.generatesOneWinner) {
        instances.push({
          instanceIdBase: buildIdBaseFunc(electionType.id, entity.id),
          entityType: "subnational_legislative_at_large",
          entityData: { ...entity },
          resolvedOfficeName: resolvedOfficeNameBase,
          _isSingleSeatContest: false,
          _effectiveElectoralSystem: electionType.electoralSystem,
          _effectiveGeneratesOneWinner: false,
        });
      }
    } else if (electionType.electoralSystem === "MMP") {
      instances.push({
        instanceIdBase: buildIdBaseFunc(electionType.id, entity.id),
        entityType: "subnational_parliament",
        entityData: { ...entity },
        resolvedOfficeName: resolvedOfficeNameBase,
        _isSingleSeatContest: false,
        _effectiveElectoralSystem: "MMP",
        _effectiveGeneratesOneWinner: false,
        _numberOfSeatsForThisInstance: electionType.minCouncilSeats,
      });
    }
  });
  return instances;
};

/**
 * Determines if a given election type is for a national legislative body.
 * @param {object} electionType - The election type configuration object.
 * @returns {boolean}
 */
export const isNationalLegislativeElectionType = (electionType) => {
  if (
    !electionType ||
    !electionType.level ||
    !electionType.level.startsWith("national_")
  ) {
    return false;
  }
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
  return true;
};

/**
 * Generates election instances for various national legislative chambers.
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
      if (!district || !district.id || !district.name) return;
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
      });
    });
  } else if (electionType.id === "national_senate") {
    let statesToProcess = regionId
      ? currentCountryData.regions.filter((s) => s.id === regionId)
      : currentCountryData.regions || [];
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
      });
    }
  }
  return instances;
};
