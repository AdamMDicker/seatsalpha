// MLS logos - only teams with successfully downloaded logos are mapped
// Teams without logos will show a letter fallback in the UI

const tryImport = (path: string): string | undefined => {
  try { return path; } catch { return undefined; }
};

// Available logos
import fcCincinnati from "@/assets/teams/mls/fc-cincinnati.png";
import lafc from "@/assets/teams/mls/lafc.png";
import interMiami from "@/assets/teams/mls/inter-miami.png";
import nashvilleSc from "@/assets/teams/mls/nashville-sc.png";
import torontoFc from "@/assets/teams/mls/toronto-fc.png";

export const MLS_LOGOS: Record<string, string | undefined> = {
  "fc-cincinnati": fcCincinnati,
  "lafc": lafc,
  "inter-miami": interMiami,
  "nashville-sc": nashvilleSc,
  "toronto-fc": torontoFc,
};

export const getMLSLogo = (slug: string): string | undefined => MLS_LOGOS[slug];
