import { GCLOUD_BUCKET_URL, idToLeagueMap } from "../consts";
import find from "lodash/find";
import { NCAA_TEAMS } from "../fixtures/ncaa.js";
import slugify from "slugify";

export const getFirstWord = (fullword) => {
  const foundCity = find(NCAA_TEAMS, { fullName: fullword });

  if (foundCity) return foundCity.name;

  const first = fullword.split(" ").slice(0, -1).join(" ");
  return first;
};

export const getLastWord = (fullword) => {
  const foundMascot = find(NCAA_TEAMS, { fullName: fullword });

  if (foundMascot) return foundMascot.mascot;

  const last = fullword.split(" ").slice(-1).join(" ");
  return last;
};

export const getLogoName = (team, sportID = 2) => {
  if (team === "LA Clippers") team = "los angeles clippers";
  const logo = team;

  if (sportID === 5) {
    const foundTeam = find(NCAA_TEAMS, { fullName: logo });
    return `${GCLOUD_BUCKET_URL}/team-images/${idToLeagueMap[sportID]}/${foundTeam?.logoUrl}.png`;
  }

  const slugifyLogo = slugify(logo, {
    replacement: "_",
    remove: /[()'"&.]/g,
    lower: true,
    strict: true,
  });

  return `${GCLOUD_BUCKET_URL}/team-images/${idToLeagueMap[sportID]}/${slugifyLogo}.png`;
};

export const getTeams = (teamName) => {
  const foundTeamName = find(NCAA_TEAMS, { fullName: teamName });

  if (foundTeamName) {
    return foundTeamName.mascot;
  }

  if (teamName === "Portland Trail Blazers") {
    teamName = "Trail Blazers";
  } else {
    teamName = teamName.split(" ");
    teamName = teamName[teamName.length - 1];
  }
  return teamName;
};

export const getCity = (city) => {
  const foundTeamCity = find(NCAA_TEAMS, { fullName: city });

  if (foundTeamCity) {
    return foundTeamCity.name;
  }

  const count1 = city.split(" ").length - 1;
  if (count1 < 2) {
    city = city.split(" ", 1);
    city = city[0];
  } else if (city === "Portland Trail Blazers") {
    city = "Portland";
  } else {
    city = city.split(" ", 2);
    city = `${city[0]} ${city[1]}`;
  }
  return city;
};

export const timeZone = {
  "(Atlantic Daylight Time)": "ADT",
  "(Alaska Daylight Time)": "AKDT",
  "(Alaska Standard Time)": "AKST",
  "(Atlantic Standard Time)": "AST",
  "(Atlantic Time)": "AT",
  "(Central Daylight Time)": "CDT",
  "(Central Standard Time)": "CST",
  "(Central Time)": "CT",
  "(Eastern Daylight Time)": "EDT",
  "(Eastern Greenland Summer Time)": "EGST",
  "(East Greenland Time)": "EGT",
  "(Eastern Standard Time)": "EST",
  "(Eastern Time)": "ET",
  "(Greenwich Mean Time)": "GMT",
  "(Hawaii-Aleutian Daylight Time)": "HDT",
  "(Hawaii Standard Time)": "HST",
  "(Mountain Daylight Time)": "MDT",
  "(Mountain Standard Time)": "MST",
  "(Mountain Time)": "MT",
  "(Newfoundland Daylight Time)": "NDT",
  "(Newfoundland Standard Time)": "NST",
  "(Pacific Daylight Time)": "PDT",
  "(Pierre & Miquelon Daylight Time)": "PMDT",
  "(Pierre & Miquelon Standard Time)": "PMST",
  "(Pacific Standard Time)": "PST",
  "(Pacific Time)": "PT",
  "(Western Greenland Summer Time)": "WGST",
  "(West Greenland Time)": "WGT",
};
