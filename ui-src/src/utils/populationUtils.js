import { distributeValueProportionally, getRandomInt } from "./core";
/**
 * Assigns random populations to a single country and its regions/provinces.
 * This is a pure function; it works on the object it's given and returns it.
 * @param {object} country - A raw country object from baseCountriesData.
 * @param {object} countryPopulationRanges - The object mapping country IDs to min/max populations.
 * @returns {object} The country object with populations assigned.
 */
export const assignPopulationToCountry = (country, countryPopulationRanges) => {
  if (!country) return null;

  // 1. Assign Country Population
  const range = countryPopulationRanges[country.id];
  if (range) {
    country.population = getRandomInt(range.min, range.max);
  } else {
    country.population = getRandomInt(1000000, 50000000);
  }

  // 2. Assign Populations to Primary Regions
  if (country.regions && country.regions.length > 0) {
    const regionPopulations = distributeValueProportionally(
      country.population,
      country.regions
    );
    country.regions.forEach((region, index) => {
      region.population = regionPopulations[index] || 0;
    });
  }

  // 3. Assign Populations to Secondary Regions within their parent regions
  if (country.regions && country.regions.length > 0) {
    country.regions.forEach((region) => {
      if (region.provinces && region.provinces.length > 0) {
        const provincePopulations = distributeValueProportionally(
          region.population,
          region.provinces
        );
        region.provinces.forEach((province, index) => {
          province.population = provincePopulations[index] || 0;
        });
      }
    });
  }

  return country;
};
