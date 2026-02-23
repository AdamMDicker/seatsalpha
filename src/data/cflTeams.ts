export interface CFLTeamConfig {
  slug: string;
  name: string;
  shortName: string;
  venue: string;
  city: string;
  province: string;
  season: string;
  searchTerm: string;
  primaryColor: string;
  division: "West" | "East";
}

export const CFL_TEAMS_CONFIG: CFLTeamConfig[] = [
  // West Division
  { slug: "bc-lions", name: "BC Lions", shortName: "Lions", venue: "BC Place", city: "Vancouver", province: "BC", season: "2025 CFL Season", searchTerm: "BC Lions", primaryColor: "hsl(25, 80%, 28%)", division: "West" },
  { slug: "calgary-stampeders", name: "Calgary Stampeders", shortName: "Stampeders", venue: "McMahon Stadium", city: "Calgary", province: "AB", season: "2025 CFL Season", searchTerm: "Calgary Stampeders", primaryColor: "hsl(0, 65%, 28%)", division: "West" },
  { slug: "edmonton-elks", name: "Edmonton Elks", shortName: "Elks", venue: "Commonwealth Stadium", city: "Edmonton", province: "AB", season: "2025 CFL Season", searchTerm: "Edmonton Elks", primaryColor: "hsl(140, 55%, 18%)", division: "West" },
  { slug: "saskatchewan-roughriders", name: "Saskatchewan Roughriders", shortName: "Roughriders", venue: "Mosaic Stadium", city: "Regina", province: "SK", season: "2025 CFL Season", searchTerm: "Saskatchewan Roughriders", primaryColor: "hsl(140, 60%, 20%)", division: "West" },
  { slug: "winnipeg-blue-bombers", name: "Winnipeg Blue Bombers", shortName: "Blue Bombers", venue: "IG Field", city: "Winnipeg", province: "MB", season: "2025 CFL Season", searchTerm: "Winnipeg Blue Bombers", primaryColor: "hsl(215, 65%, 22%)", division: "West" },
  // East Division
  { slug: "hamilton-tiger-cats", name: "Hamilton Tiger-Cats", shortName: "Tiger-Cats", venue: "Tim Hortons Field", city: "Hamilton", province: "ON", season: "2025 CFL Season", searchTerm: "Hamilton Tiger-Cats", primaryColor: "hsl(45, 80%, 30%)", division: "East" },
  { slug: "montreal-alouettes", name: "Montréal Alouettes", shortName: "Alouettes", venue: "Percival Molson Memorial Stadium", city: "Montreal", province: "QC", season: "2025 CFL Season", searchTerm: "Montreal Alouettes", primaryColor: "hsl(0, 60%, 28%)", division: "East" },
  { slug: "ottawa-redblacks", name: "Ottawa Redblacks", shortName: "Redblacks", venue: "TD Place Stadium", city: "Ottawa", province: "ON", season: "2025 CFL Season", searchTerm: "Ottawa Redblacks", primaryColor: "hsl(0, 0%, 12%)", division: "East" },
  { slug: "toronto-argonauts", name: "Toronto Argonauts", shortName: "Argonauts", venue: "BMO Field", city: "Toronto", province: "ON", season: "2025 CFL Season", searchTerm: "Toronto Argonauts", primaryColor: "hsl(215, 60%, 22%)", division: "East" },
];

export const CFL_DIVISIONS = ["West", "East"] as const;

export const getCFLTeamBySlug = (slug: string): CFLTeamConfig | undefined =>
  CFL_TEAMS_CONFIG.find((t) => t.slug === slug);
