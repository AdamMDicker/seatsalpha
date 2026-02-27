// WNBA logos - placeholder until real assets are added
export const WNBA_LOGOS: Record<string, string> = {};

export const getWNBALogo = (slug: string): string | undefined => WNBA_LOGOS[slug];
