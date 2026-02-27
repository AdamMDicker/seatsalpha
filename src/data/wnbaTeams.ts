export interface WNBATeamConfig {
  slug: string;
  name: string;
  shortName: string;
  venue: string;
  city: string;
  province: string;
  season: string;
  searchTerm: string;
  primaryColor: string;
  conference: "Eastern" | "Western";
}

export const WNBA_TEAMS_CONFIG: WNBATeamConfig[] = [
  // Eastern Conference
  { slug: "aces-ny", name: "New York Liberty", shortName: "Liberty", venue: "Barclays Center", city: "Brooklyn", province: "NY", season: "2025 WNBA Season", searchTerm: "Liberty", primaryColor: "hsl(165, 60%, 22%)", conference: "Eastern" },
  { slug: "sun", name: "Connecticut Sun", shortName: "Sun", venue: "Mohegan Sun Arena", city: "Uncasville", province: "CT", season: "2025 WNBA Season", searchTerm: "Sun", primaryColor: "hsl(25, 80%, 30%)", conference: "Eastern" },
  { slug: "fever", name: "Indiana Fever", shortName: "Fever", venue: "Gainbridge Fieldhouse", city: "Indianapolis", province: "IN", season: "2025 WNBA Season", searchTerm: "Fever", primaryColor: "hsl(0, 65%, 30%)", conference: "Eastern" },
  { slug: "dream", name: "Atlanta Dream", shortName: "Dream", venue: "Gateway Center Arena", city: "College Park", province: "GA", season: "2025 WNBA Season", searchTerm: "Dream", primaryColor: "hsl(0, 60%, 28%)", conference: "Eastern" },
  { slug: "mystics", name: "Washington Mystics", shortName: "Mystics", venue: "Entertainment & Sports Arena", city: "Washington", province: "DC", season: "2025 WNBA Season", searchTerm: "Mystics", primaryColor: "hsl(215, 60%, 25%)", conference: "Eastern" },
  { slug: "sky", name: "Chicago Sky", shortName: "Sky", venue: "Wintrust Arena", city: "Chicago", province: "IL", season: "2025 WNBA Season", searchTerm: "Sky", primaryColor: "hsl(200, 60%, 25%)", conference: "Eastern" },
  // Western Conference
  { slug: "aces", name: "Las Vegas Aces", shortName: "Aces", venue: "Michelob Ultra Arena", city: "Las Vegas", province: "NV", season: "2025 WNBA Season", searchTerm: "Aces", primaryColor: "hsl(0, 0%, 12%)", conference: "Western" },
  { slug: "storm", name: "Seattle Storm", shortName: "Storm", venue: "Climate Pledge Arena", city: "Seattle", province: "WA", season: "2025 WNBA Season", searchTerm: "Storm", primaryColor: "hsl(140, 50%, 20%)", conference: "Western" },
  { slug: "mercury", name: "Phoenix Mercury", shortName: "Mercury", venue: "Footprint Center", city: "Phoenix", province: "AZ", season: "2025 WNBA Season", searchTerm: "Mercury", primaryColor: "hsl(25, 75%, 30%)", conference: "Western" },
  { slug: "sparks", name: "Los Angeles Sparks", shortName: "Sparks", venue: "Crypto.com Arena", city: "Los Angeles", province: "CA", season: "2025 WNBA Season", searchTerm: "Sparks", primaryColor: "hsl(270, 50%, 25%)", conference: "Western" },
  { slug: "lynx", name: "Minnesota Lynx", shortName: "Lynx", venue: "Target Center", city: "Minneapolis", province: "MN", season: "2025 WNBA Season", searchTerm: "Lynx", primaryColor: "hsl(215, 55%, 20%)", conference: "Western" },
  { slug: "wings", name: "Dallas Wings", shortName: "Wings", venue: "College Park Center", city: "Arlington", province: "TX", season: "2025 WNBA Season", searchTerm: "Wings", primaryColor: "hsl(200, 55%, 22%)", conference: "Western" },
  { slug: "valkyries", name: "Golden State Valkyries", shortName: "Valkyries", venue: "Chase Center", city: "San Francisco", province: "CA", season: "2025 WNBA Season", searchTerm: "Valkyries", primaryColor: "hsl(270, 45%, 28%)", conference: "Western" },
];

export const WNBA_CONFERENCES = ["Eastern", "Western"] as const;

export const getWNBATeamBySlug = (slug: string): WNBATeamConfig | undefined =>
  WNBA_TEAMS_CONFIG.find((t) => t.slug === slug);
