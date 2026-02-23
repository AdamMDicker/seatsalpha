// NHL team configuration for team pages
export interface NHLTeamConfig {
  slug: string;
  name: string;
  shortName: string;
  venue: string;
  city: string;
  province: string;
  season: string;
  searchTerm: string;
  primaryColor: string;
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
}

export const NHL_TEAMS_CONFIG: NHLTeamConfig[] = [
  // Atlantic
  { slug: "maple-leafs", name: "Toronto Maple Leafs", shortName: "Maple Leafs", venue: "Scotiabank Arena", city: "Toronto", province: "ON", season: "2025–26 NHL Season", searchTerm: "Maple Leafs", primaryColor: "hsl(220, 60%, 22%)", division: "Atlantic" },
  { slug: "canadiens", name: "Montréal Canadiens", shortName: "Canadiens", venue: "Bell Centre", city: "Montréal", province: "QC", season: "2025–26 NHL Season", searchTerm: "Canadiens", primaryColor: "hsl(0, 70%, 30%)", division: "Atlantic" },
  { slug: "senators", name: "Ottawa Senators", shortName: "Senators", venue: "Canadian Tire Centre", city: "Ottawa", province: "ON", season: "2025–26 NHL Season", searchTerm: "Senators", primaryColor: "hsl(0, 65%, 28%)", division: "Atlantic" },
  { slug: "bruins", name: "Boston Bruins", shortName: "Bruins", venue: "TD Garden", city: "Boston", province: "MA", season: "2025–26 NHL Season", searchTerm: "Bruins", primaryColor: "hsl(45, 80%, 25%)", division: "Atlantic" },
  { slug: "sabres", name: "Buffalo Sabres", shortName: "Sabres", venue: "KeyBank Center", city: "Buffalo", province: "NY", season: "2025–26 NHL Season", searchTerm: "Sabres", primaryColor: "hsl(220, 60%, 20%)", division: "Atlantic" },
  { slug: "red-wings", name: "Detroit Red Wings", shortName: "Red Wings", venue: "Little Caesars Arena", city: "Detroit", province: "MI", season: "2025–26 NHL Season", searchTerm: "Red Wings", primaryColor: "hsl(0, 70%, 30%)", division: "Atlantic" },
  { slug: "panthers", name: "Florida Panthers", shortName: "Panthers", venue: "Amerant Bank Arena", city: "Sunrise", province: "FL", season: "2025–26 NHL Season", searchTerm: "Panthers", primaryColor: "hsl(0, 65%, 28%)", division: "Atlantic" },
  { slug: "lightning", name: "Tampa Bay Lightning", shortName: "Lightning", venue: "Amalie Arena", city: "Tampa", province: "FL", season: "2025–26 NHL Season", searchTerm: "Lightning", primaryColor: "hsl(220, 60%, 25%)", division: "Atlantic" },
  // Metropolitan
  { slug: "hurricanes", name: "Carolina Hurricanes", shortName: "Hurricanes", venue: "PNC Arena", city: "Raleigh", province: "NC", season: "2025–26 NHL Season", searchTerm: "Hurricanes", primaryColor: "hsl(0, 70%, 30%)", division: "Metropolitan" },
  { slug: "blue-jackets", name: "Columbus Blue Jackets", shortName: "Blue Jackets", venue: "Nationwide Arena", city: "Columbus", province: "OH", season: "2025–26 NHL Season", searchTerm: "Blue Jackets", primaryColor: "hsl(220, 50%, 20%)", division: "Metropolitan" },
  { slug: "devils", name: "New Jersey Devils", shortName: "Devils", venue: "Prudential Center", city: "Newark", province: "NJ", season: "2025–26 NHL Season", searchTerm: "Devils", primaryColor: "hsl(0, 70%, 28%)", division: "Metropolitan" },
  { slug: "islanders", name: "New York Islanders", shortName: "Islanders", venue: "UBS Arena", city: "Elmont", province: "NY", season: "2025–26 NHL Season", searchTerm: "Islanders", primaryColor: "hsl(215, 60%, 22%)", division: "Metropolitan" },
  { slug: "nhl-rangers", name: "New York Rangers", shortName: "Rangers", venue: "Madison Square Garden", city: "New York", province: "NY", season: "2025–26 NHL Season", searchTerm: "Rangers", primaryColor: "hsl(215, 70%, 25%)", division: "Metropolitan" },
  { slug: "flyers", name: "Philadelphia Flyers", shortName: "Flyers", venue: "Wells Fargo Center", city: "Philadelphia", province: "PA", season: "2025–26 NHL Season", searchTerm: "Flyers", primaryColor: "hsl(25, 80%, 28%)", division: "Metropolitan" },
  { slug: "penguins", name: "Pittsburgh Penguins", shortName: "Penguins", venue: "PPG Paints Arena", city: "Pittsburgh", province: "PA", season: "2025–26 NHL Season", searchTerm: "Penguins", primaryColor: "hsl(45, 70%, 25%)", division: "Metropolitan" },
  { slug: "capitals", name: "Washington Capitals", shortName: "Capitals", venue: "Capital One Arena", city: "Washington", province: "DC", season: "2025–26 NHL Season", searchTerm: "Capitals", primaryColor: "hsl(0, 65%, 28%)", division: "Metropolitan" },
  // Central
  { slug: "jets", name: "Winnipeg Jets", shortName: "Jets", venue: "Canada Life Centre", city: "Winnipeg", province: "MB", season: "2025–26 NHL Season", searchTerm: "Jets", primaryColor: "hsl(220, 50%, 20%)", division: "Central" },
  { slug: "blackhawks", name: "Chicago Blackhawks", shortName: "Blackhawks", venue: "United Center", city: "Chicago", province: "IL", season: "2025–26 NHL Season", searchTerm: "Blackhawks", primaryColor: "hsl(0, 70%, 28%)", division: "Central" },
  { slug: "avalanche", name: "Colorado Avalanche", shortName: "Avalanche", venue: "Ball Arena", city: "Denver", province: "CO", season: "2025–26 NHL Season", searchTerm: "Avalanche", primaryColor: "hsl(340, 50%, 25%)", division: "Central" },
  { slug: "stars", name: "Dallas Stars", shortName: "Stars", venue: "American Airlines Center", city: "Dallas", province: "TX", season: "2025–26 NHL Season", searchTerm: "Stars", primaryColor: "hsl(140, 50%, 20%)", division: "Central" },
  { slug: "wild", name: "Minnesota Wild", shortName: "Wild", venue: "Xcel Energy Center", city: "Saint Paul", province: "MN", season: "2025–26 NHL Season", searchTerm: "Wild", primaryColor: "hsl(140, 40%, 18%)", division: "Central" },
  { slug: "predators", name: "Nashville Predators", shortName: "Predators", venue: "Bridgestone Arena", city: "Nashville", province: "TN", season: "2025–26 NHL Season", searchTerm: "Predators", primaryColor: "hsl(45, 80%, 28%)", division: "Central" },
  { slug: "blues", name: "St. Louis Blues", shortName: "Blues", venue: "Enterprise Center", city: "St. Louis", province: "MO", season: "2025–26 NHL Season", searchTerm: "Blues", primaryColor: "hsl(215, 70%, 22%)", division: "Central" },
  { slug: "utah-hc", name: "Utah Hockey Club", shortName: "Utah HC", venue: "Delta Center", city: "Salt Lake City", province: "UT", season: "2025–26 NHL Season", searchTerm: "Utah", primaryColor: "hsl(200, 40%, 18%)", division: "Central" },
  // Pacific
  { slug: "ducks", name: "Anaheim Ducks", shortName: "Ducks", venue: "Honda Center", city: "Anaheim", province: "CA", season: "2025–26 NHL Season", searchTerm: "Ducks", primaryColor: "hsl(25, 70%, 22%)", division: "Pacific" },
  { slug: "flames", name: "Calgary Flames", shortName: "Flames", venue: "Scotiabank Saddledome", city: "Calgary", province: "AB", season: "2025–26 NHL Season", searchTerm: "Flames", primaryColor: "hsl(0, 70%, 30%)", division: "Pacific" },
  { slug: "oilers", name: "Edmonton Oilers", shortName: "Oilers", venue: "Rogers Place", city: "Edmonton", province: "AB", season: "2025–26 NHL Season", searchTerm: "Oilers", primaryColor: "hsl(215, 65%, 22%)", division: "Pacific" },
  { slug: "kings", name: "Los Angeles Kings", shortName: "Kings", venue: "Crypto.com Arena", city: "Los Angeles", province: "CA", season: "2025–26 NHL Season", searchTerm: "Kings", primaryColor: "hsl(0, 0%, 15%)", division: "Pacific" },
  { slug: "sharks", name: "San Jose Sharks", shortName: "Sharks", venue: "SAP Center", city: "San Jose", province: "CA", season: "2025–26 NHL Season", searchTerm: "Sharks", primaryColor: "hsl(185, 60%, 20%)", division: "Pacific" },
  { slug: "kraken", name: "Seattle Kraken", shortName: "Kraken", venue: "Climate Pledge Arena", city: "Seattle", province: "WA", season: "2025–26 NHL Season", searchTerm: "Kraken", primaryColor: "hsl(200, 40%, 18%)", division: "Pacific" },
  { slug: "canucks", name: "Vancouver Canucks", shortName: "Canucks", venue: "Rogers Arena", city: "Vancouver", province: "BC", season: "2025–26 NHL Season", searchTerm: "Canucks", primaryColor: "hsl(215, 60%, 20%)", division: "Pacific" },
  { slug: "golden-knights", name: "Vegas Golden Knights", shortName: "Golden Knights", venue: "T-Mobile Arena", city: "Las Vegas", province: "NV", season: "2025–26 NHL Season", searchTerm: "Golden Knights", primaryColor: "hsl(45, 60%, 22%)", division: "Pacific" },
];

export const NHL_DIVISIONS = ["Atlantic", "Metropolitan", "Central", "Pacific"] as const;

export const getNHLTeamBySlug = (slug: string): NHLTeamConfig | undefined =>
  NHL_TEAMS_CONFIG.find((t) => t.slug === slug);
