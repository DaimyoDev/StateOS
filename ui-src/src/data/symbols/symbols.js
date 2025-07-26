import { WHEAT } from "./agrarian/wheat";
import { A_LOGO } from "./anarchist/alogo";
import { BALANCE } from "./centrist/balance";
import { SICKLE_HAMMER } from "./communist/sicklehammer";
import { LION_HEAD } from "./conservative/lionhead";
import { POL_COMPBALL } from "./default/polcompball";
import { TREE } from "./green/tree";
import { TORCH } from "./liberal/torch";
import { CROWN } from "./monarchist/crown";
import { WINGED_EAGLE } from "./nationalist/wingedeagle";
import { MEGAPHONE } from "./populist/megaphone";
import { LIGHTBULB } from "./pragmatist/lightbulb";
import { PILLAR } from "./reactionary/pillar";
import { CROSS } from "./religiouscon/cross";
import { WORKER_FIST } from "./socialist/workerfist";
import { BRAIN } from "./technocratic/brain";
import { DNA } from "./transhumanist/dna";
import { SNAKE } from "./libertarian/snake";
import { ROSE } from "./socialDemocrat/rose";

export const SYMBOLS = {
  socialist: [WORKER_FIST],
  conservative: [LION_HEAD],
  liberal: [TORCH],
  nationalist: [WINGED_EAGLE],
  centrist: [BALANCE],
  green: [TREE],
  communist: [SICKLE_HAMMER],
  agrarian: [WHEAT],
  populist: [MEGAPHONE],
  religious_conservative: [CROSS],
  technocratic: [BRAIN],
  monarchist: [CROWN],
  anarchist: [A_LOGO],
  reactionary: [PILLAR],
  pragmatist: [LIGHTBULB],
  transhumanist: [DNA],
  libertarian: [SNAKE],
  social_democrat: [ROSE],
  default: [POL_COMPBALL],
};
