import { getRandomElement, getRandomInt } from "../utils/core";

const MOCK_DATA = {
  companies: [
    "Stark Industries",
    "Wayne Enterprises",
    "Acme Corp.",
    "Cyberdyne Systems",
    "Globex Corporation",
  ],
  schools: [
    "State University",
    "Metropolis University",
    "Coast City College",
    "Empire State University",
  ],
  descriptions: {
    "Campaign Manager": [
      "Led a team of 20+ to secure a key mayoral victory.",
      "Developed and executed a multi-million dollar campaign strategy.",
      "Oversaw all communications and fundraising efforts for a gubernatorial race.",
    ],
    "Communications Director": [
      "Managed all press relations and crisis communications.",
      "Authored speeches and op-eds for a national campaign.",
      "Increased positive media mentions by 300% over one election cycle.",
    ],
    "Fundraising Manager": [
      "Exceeded fundraising goals by 50% through targeted donor outreach.",
      "Organized high-profile fundraising galas and events.",
      "Cultivated relationships with major corporate and private donors.",
    ],
    "Policy Advisor": [
      "Drafted key legislative proposals on economic and social policy.",
      "Provided in-depth research and analysis to the candidate.",
      "Briefed the politician on complex geopolitical issues daily.",
    ],
  },
  skills: [
    "Public Speaking",
    "Data Analysis",
    "Crisis Management",
    "Digital Marketing",
    "Grassroots Organizing",
    "Policy Research",
  ],
  achievements: {
    strategy: [
      "Developed and executed a multi-million dollar campaign strategy that flipped a historically opposed district.",
      "Pioneered a data-driven approach to voter targeting, resulting in a 5% increase in turnout.",
    ],
    communication: [
      "Managed all press relations during a high-profile crisis, resulting in zero negative long-term impact.",
      "Authored key speeches that are credited with turning the tide in three major televised debates.",
    ],
    fundraising: [
      "Spearheaded a new donor outreach program that broke all previous state fundraising records by 40%.",
      "Organized a series of high-profile galas that secured over $10M in campaign contributions.",
    ],
    loyalty: [
      "Served as the sole advisor to the candidate for over a decade, through both electoral victories and defeats.",
      "Turned down a more lucrative offer to stay with a campaign during a period of intense public scrutiny.",
    ],
  },
};

export const generateResume = (role) => {
  const years = getRandomInt(4, 15);
  const clueAttribute = getRandomElement(Object.keys(MOCK_DATA.achievements));
  const clueText = getRandomElement(MOCK_DATA.achievements[clueAttribute]);

  return {
    summary: `A dedicated ${role} with over ${years} years of experience in high-stakes political environments.`,
    workHistory: [
      {
        role: role,
        employer: getRandomElement(MOCK_DATA.companies),
        duration: `20${getRandomInt(15, 20)} - Present`,
        description: clueText,
      },
      {
        role: "Deputy " + role,
        employer: getRandomElement(MOCK_DATA.companies),
        duration: `20${getRandomInt(10, 14)} - 20${getRandomInt(15, 20)}`,
        description:
          "Assisted in all major campaign functions, gaining foundational experience.",
      },
    ],
    education: {
      degree: "B.A. in Political Science",
      school: getRandomElement(MOCK_DATA.schools),
    },
    keySkills: [
      getRandomElement(MOCK_DATA.skills),
      getRandomElement(MOCK_DATA.skills),
    ],
    clueAttribute: clueAttribute,
  };
};
