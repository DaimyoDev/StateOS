// ui-src/src/data/namesData.js
import {
  JAPANESE_MALE_NAMES,
  JAPANESE_FEMALE_NAMES,
  JAPANESE_LAST_NAMES,
} from "./names/japaneseNames";
import {
  ENGLISH_MALE_NAMES,
  ENGLISH_FEMALE_NAMES,
  ENGLISH_LAST_NAMES,
} from "./names/englishNames";
import {
  FILIPINO_MALE_NAMES,
  FILIPINO_FEMALE_NAMES,
  FILIPINO_LAST_NAMES,
} from "./names/filipinoNames";
import {
  GERMAN_MALE_NAMES,
  GERMAN_FEMALE_NAMES,
  GERMAN_LAST_NAMES,
} from "./names/germanNames";
import {
  KOREAN_MALE_NAMES,
  KOREAN_FEMALE_NAMES,
  KOREAN_LAST_NAMES,
} from "./names/koreanNames";

export const NAMES_BY_COUNTRY = {
  JPN: {
    male: JAPANESE_MALE_NAMES,
    female: JAPANESE_FEMALE_NAMES,
    last: JAPANESE_LAST_NAMES,
  },
  USA: {
    male: ENGLISH_MALE_NAMES,
    female: ENGLISH_FEMALE_NAMES,
    last: ENGLISH_LAST_NAMES,
  },
  GER: {
    // Or use "DEU" if that's your consistent ID from countriesData.js
    male: GERMAN_MALE_NAMES,
    female: GERMAN_FEMALE_NAMES,
    last: GERMAN_LAST_NAMES,
  },
  PHL: {
    male: FILIPINO_MALE_NAMES,
    female: FILIPINO_FEMALE_NAMES,
    last: FILIPINO_LAST_NAMES,
  },
  KOR: {
    male: KOREAN_MALE_NAMES,
    female: KOREAN_LAST_NAMES,
    last: KOREAN_LAST_NAMES,
  },
  CAN: {
    male: ENGLISH_MALE_NAMES,
    female: ENGLISH_FEMALE_NAMES,
    last: ENGLISH_LAST_NAMES,
  },
};

export const GENERIC_FIRST_NAMES_MALE = ["Alex", "Chris", "Jordan", "Taylor"];
export const GENERIC_FIRST_NAMES_FEMALE = [
  "Alex",
  "Chris",
  "Jordan",
  "Taylor",
  "Jamie",
  "Morgan",
];
export const GENERIC_LAST_NAMES = [
  "Dev",
  "Test",
  "User",
  "Player",
  "Alpha",
  "Beta",
];
