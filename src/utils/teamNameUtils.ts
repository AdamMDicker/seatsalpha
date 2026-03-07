import { MLB_TEAMS_CONFIG } from "@/data/mlbTeams";
import { NHL_TEAMS_CONFIG } from "@/data/nhlTeams";
import { NBA_TEAMS_CONFIG } from "@/data/nbaTeams";
import { NFL_TEAMS_CONFIG } from "@/data/nflTeams";
import { MLS_TEAMS_CONFIG } from "@/data/mlsTeams";
import { CFL_TEAMS_CONFIG } from "@/data/cflTeams";
import { WNBA_TEAMS_CONFIG } from "@/data/wnbaTeams";

// Build a map from searchTerm (nickname) -> full name
const NICKNAME_TO_FULL: Record<string, string> = {};

[
  ...MLB_TEAMS_CONFIG,
  ...NHL_TEAMS_CONFIG,
  ...NBA_TEAMS_CONFIG,
  ...NFL_TEAMS_CONFIG,
  ...MLS_TEAMS_CONFIG,
  ...CFL_TEAMS_CONFIG,
  ...WNBA_TEAMS_CONFIG,
].forEach((t) => {
  NICKNAME_TO_FULL[t.searchTerm.toLowerCase()] = t.name;
});

/**
 * Expands team nicknames in a game title to full team names.
 * e.g. "Blue Jays vs Athletics" -> "Toronto Blue Jays vs Oakland Athletics"
 */
export const expandTeamNames = (title: string): string => {
  // Handle "vs" and "@" separators
  const separators = [" vs ", " @ "];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      if (parts.length === 2) {
        const left = expandSingleTeam(parts[0].trim());
        const right = expandSingleTeam(parts[1].trim());
        return `${left}${sep}${right}`;
      }
    }
  }
  return title;
};

function expandSingleTeam(name: string): string {
  const lower = name.toLowerCase();
  // Try exact match first
  if (NICKNAME_TO_FULL[lower]) return NICKNAME_TO_FULL[lower];
  // Try finding a key that the name ends with or contains
  for (const [key, fullName] of Object.entries(NICKNAME_TO_FULL)) {
    if (lower === key || lower.endsWith(key)) return fullName;
  }
  return name;
}
