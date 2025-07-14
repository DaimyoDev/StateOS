import { getRandomInt } from "../generalUtils";
import { distributeValueProportionally } from "../populationUtils";

export const initializeJapanStructures = (jpnCountryData, jpnTierData) => {
  if (!jpnCountryData.nationalLowerHouseDistricts) {
    jpnCountryData.nationalLowerHouseDistricts = [];
  }

  if (jpnCountryData.regions && jpnCountryData.regions.length > 0) {
    jpnCountryData.regions.forEach((prefecture) => {
      if (prefecture.population > 0) {
        let hocSeats = 1;
        for (const tier of jpnTierData.JPN_HOC_SEAT_ALLOCATION_TIERS) {
          if (prefecture.population >= tier.popThreshold) {
            hocSeats = getRandomInt(tier.seatsRange[0], tier.seatsRange[1]);
            break;
          }
        }
        prefecture.seatsForHoCPerCycle = Math.max(1, hocSeats);

        let numHrDistrictsForPrefecture = 1;
        for (const tier of jpnTierData.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS) {
          if (prefecture.population >= tier.popThreshold) {
            numHrDistrictsForPrefecture = getRandomInt(
              tier.numDistrictsRange[0],
              tier.numDistrictsRange[1]
            );
            break;
          }
        }
        numHrDistrictsForPrefecture = Math.max(1, numHrDistrictsForPrefecture);

        const hrDistrictPopulations = distributeValueProportionally(
          prefecture.population,
          numHrDistrictsForPrefecture
        );

        for (let i = 0; i < numHrDistrictsForPrefecture; i++) {
          const districtNumber = i + 1;
          jpnCountryData.nationalLowerHouseDistricts.push({
            id: `${prefecture.id}_HRD${districtNumber}`,
            name: `${prefecture.name} HR District ${districtNumber}`,
            prefectureId: prefecture.id,
            prefectureName: prefecture.name,
            population: hrDistrictPopulations[i] || 0,
            stats: {},
            politicalLandscape: [],
            issues: [],
            politicalLeaning: "Moderate",
          });
        }
      }
    });
  }
};
