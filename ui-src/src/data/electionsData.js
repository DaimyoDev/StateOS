import { japanElections } from "./elections/japanElections";
import { usaElections } from "./elections/usaElections";
import { germanElections } from "./elections/germanElections";
import { philippinesElections } from "./elections/philippinesElections";
import { koreanElections } from "./elections/koreanElections";
import { canadaElections } from "./elections/canadaElections";

export const ELECTION_TYPES_BY_COUNTRY = {
  JPN: japanElections,
  USA: usaElections,
  GER: germanElections,
  PHL: philippinesElections,
  KOR: koreanElections,
  CAN: canadaElections,
};
