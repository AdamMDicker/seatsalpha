// NBA team logos - using placeholder approach, can be replaced with real logos
// For now we map slugs; logos can be added to src/assets/teams/nba/ later
const NBA_LOGO_MAP: Record<string, string | undefined> = {};

export const NBA_LOGOS: Record<string, string | undefined> = NBA_LOGO_MAP;

export const getNBALogo = (slug: string): string | undefined => NBA_LOGOS[slug];
