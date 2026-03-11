import { MLB_TEAMS_CONFIG } from "@/data/mlbTeams";
import { NHL_TEAMS_CONFIG } from "@/data/nhlTeams";
import { NBA_TEAMS_CONFIG } from "@/data/nbaTeams";
import { NFL_TEAMS_CONFIG } from "@/data/nflTeams";
import { MLS_TEAMS_CONFIG } from "@/data/mlsTeams";
import { CFL_TEAMS_CONFIG } from "@/data/cflTeams";
import { WNBA_TEAMS_CONFIG } from "@/data/wnbaTeams";

interface TeamRoute {
  league: string;
  slug: string;
}

const LEAGUE_TEAMS: { league: string; teams: { slug: string; searchTerm: string }[] }[] = [
  { league: "mlb", teams: MLB_TEAMS_CONFIG },
  { league: "nhl", teams: NHL_TEAMS_CONFIG },
  { league: "nba", teams: NBA_TEAMS_CONFIG },
  { league: "nfl", teams: NFL_TEAMS_CONFIG },
  { league: "mls", teams: MLS_TEAMS_CONFIG },
  { league: "cfl", teams: CFL_TEAMS_CONFIG },
  { league: "wnba", teams: WNBA_TEAMS_CONFIG },
];

/**
 * Given an event title, find the first matching team and return its route.
 * Prioritizes Canadian teams (Blue Jays, Maple Leafs, Raptors, etc.) as "home" team.
 */
export function getTeamRouteFromTitle(title: string): TeamRoute | null {
  const lower = title.toLowerCase();

  for (const { league, teams } of LEAGUE_TEAMS) {
    for (const team of teams) {
      if (lower.includes(team.searchTerm.toLowerCase())) {
        return { league, slug: team.slug };
      }
    }
  }

  return null;
}

/**
 * Build the full path to the team page with a game query param.
 */
export function getEventTeamPath(eventTitle: string, eventId: string): string {
  const route = getTeamRouteFromTitle(eventTitle);
  if (route) {
    return `/teams/${route.league}/${route.slug}?game=${eventId}`;
  }
  // Fallback to event detail page
  return `/event/${eventId}`;
}
