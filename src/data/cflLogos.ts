// CFL logos - placeholder approach, logos can be added later
// Teams will show a letter fallback in the UI

export const CFL_LOGOS: Record<string, string | undefined> = {};

export const getCFLLogo = (slug: string): string | undefined => CFL_LOGOS[slug];
