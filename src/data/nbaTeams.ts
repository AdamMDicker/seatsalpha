export interface NBATeamConfig {
  slug: string;
  name: string;
  shortName: string;
  venue: string;
  city: string;
  province: string;
  season: string;
  searchTerm: string;
  primaryColor: string;
  division: "Atlantic" | "Central" | "Southeast" | "Northwest" | "Pacific" | "Southwest";
}

export const NBA_TEAMS_CONFIG: NBATeamConfig[] = [
  // Atlantic
  { slug: "celtics", name: "Boston Celtics", shortName: "Celtics", venue: "TD Garden", city: "Boston", province: "MA", season: "2025–26 NBA Season", searchTerm: "Celtics", primaryColor: "hsl(140, 50%, 22%)", division: "Atlantic" },
  { slug: "nets", name: "Brooklyn Nets", shortName: "Nets", venue: "Barclays Center", city: "Brooklyn", province: "NY", season: "2025–26 NBA Season", searchTerm: "Nets", primaryColor: "hsl(0, 0%, 12%)", division: "Atlantic" },
  { slug: "knicks", name: "New York Knicks", shortName: "Knicks", venue: "Madison Square Garden", city: "New York", province: "NY", season: "2025–26 NBA Season", searchTerm: "Knicks", primaryColor: "hsl(215, 70%, 25%)", division: "Atlantic" },
  { slug: "76ers", name: "Philadelphia 76ers", shortName: "76ers", venue: "Wells Fargo Center", city: "Philadelphia", province: "PA", season: "2025–26 NBA Season", searchTerm: "76ers", primaryColor: "hsl(215, 65%, 25%)", division: "Atlantic" },
  { slug: "raptors", name: "Toronto Raptors", shortName: "Raptors", venue: "Scotiabank Arena", city: "Toronto", province: "ON", season: "2025–26 NBA Season", searchTerm: "Raptors", primaryColor: "hsl(0, 70%, 30%)", division: "Atlantic" },
  // Central
  { slug: "bulls", name: "Chicago Bulls", shortName: "Bulls", venue: "United Center", city: "Chicago", province: "IL", season: "2025–26 NBA Season", searchTerm: "Bulls", primaryColor: "hsl(0, 70%, 30%)", division: "Central" },
  { slug: "cavaliers", name: "Cleveland Cavaliers", shortName: "Cavaliers", venue: "Rocket Mortgage FieldHouse", city: "Cleveland", province: "OH", season: "2025–26 NBA Season", searchTerm: "Cavaliers", primaryColor: "hsl(340, 60%, 25%)", division: "Central" },
  { slug: "pistons", name: "Detroit Pistons", shortName: "Pistons", venue: "Little Caesars Arena", city: "Detroit", province: "MI", season: "2025–26 NBA Season", searchTerm: "Pistons", primaryColor: "hsl(0, 65%, 28%)", division: "Central" },
  { slug: "pacers", name: "Indiana Pacers", shortName: "Pacers", venue: "Gainbridge Fieldhouse", city: "Indianapolis", province: "IN", season: "2025–26 NBA Season", searchTerm: "Pacers", primaryColor: "hsl(220, 55%, 20%)", division: "Central" },
  { slug: "bucks", name: "Milwaukee Bucks", shortName: "Bucks", venue: "Fiserv Forum", city: "Milwaukee", province: "WI", season: "2025–26 NBA Season", searchTerm: "Bucks", primaryColor: "hsl(140, 40%, 18%)", division: "Central" },
  // Southeast
  { slug: "hawks", name: "Atlanta Hawks", shortName: "Hawks", venue: "State Farm Arena", city: "Atlanta", province: "GA", season: "2025–26 NBA Season", searchTerm: "Hawks", primaryColor: "hsl(0, 70%, 28%)", division: "Southeast" },
  { slug: "hornets", name: "Charlotte Hornets", shortName: "Hornets", venue: "Spectrum Center", city: "Charlotte", province: "NC", season: "2025–26 NBA Season", searchTerm: "Hornets", primaryColor: "hsl(195, 60%, 22%)", division: "Southeast" },
  { slug: "heat", name: "Miami Heat", shortName: "Heat", venue: "Kaseya Center", city: "Miami", province: "FL", season: "2025–26 NBA Season", searchTerm: "Heat", primaryColor: "hsl(0, 60%, 25%)", division: "Southeast" },
  { slug: "magic", name: "Orlando Magic", shortName: "Magic", venue: "Amway Center", city: "Orlando", province: "FL", season: "2025–26 NBA Season", searchTerm: "Magic", primaryColor: "hsl(215, 65%, 22%)", division: "Southeast" },
  { slug: "wizards", name: "Washington Wizards", shortName: "Wizards", venue: "Capital One Arena", city: "Washington", province: "DC", season: "2025–26 NBA Season", searchTerm: "Wizards", primaryColor: "hsl(220, 55%, 20%)", division: "Southeast" },
  // Northwest
  { slug: "nuggets", name: "Denver Nuggets", shortName: "Nuggets", venue: "Ball Arena", city: "Denver", province: "CO", season: "2025–26 NBA Season", searchTerm: "Nuggets", primaryColor: "hsl(220, 50%, 22%)", division: "Northwest" },
  { slug: "timberwolves", name: "Minnesota Timberwolves", shortName: "Timberwolves", venue: "Target Center", city: "Minneapolis", province: "MN", season: "2025–26 NBA Season", searchTerm: "Timberwolves", primaryColor: "hsl(220, 55%, 18%)", division: "Northwest" },
  { slug: "thunder", name: "Oklahoma City Thunder", shortName: "Thunder", venue: "Paycom Center", city: "Oklahoma City", province: "OK", season: "2025–26 NBA Season", searchTerm: "Thunder", primaryColor: "hsl(210, 70%, 25%)", division: "Northwest" },
  { slug: "trail-blazers", name: "Portland Trail Blazers", shortName: "Trail Blazers", venue: "Moda Center", city: "Portland", province: "OR", season: "2025–26 NBA Season", searchTerm: "Trail Blazers", primaryColor: "hsl(0, 65%, 25%)", division: "Northwest" },
  { slug: "jazz", name: "Utah Jazz", shortName: "Jazz", venue: "Delta Center", city: "Salt Lake City", province: "UT", season: "2025–26 NBA Season", searchTerm: "Jazz", primaryColor: "hsl(220, 50%, 18%)", division: "Northwest" },
  // Pacific
  { slug: "warriors", name: "Golden State Warriors", shortName: "Warriors", venue: "Chase Center", city: "San Francisco", province: "CA", season: "2025–26 NBA Season", searchTerm: "Warriors", primaryColor: "hsl(215, 70%, 25%)", division: "Pacific" },
  { slug: "clippers", name: "LA Clippers", shortName: "Clippers", venue: "Intuit Dome", city: "Inglewood", province: "CA", season: "2025–26 NBA Season", searchTerm: "Clippers", primaryColor: "hsl(0, 65%, 28%)", division: "Pacific" },
  { slug: "lakers", name: "Los Angeles Lakers", shortName: "Lakers", venue: "Crypto.com Arena", city: "Los Angeles", province: "CA", season: "2025–26 NBA Season", searchTerm: "Lakers", primaryColor: "hsl(270, 50%, 25%)", division: "Pacific" },
  { slug: "suns", name: "Phoenix Suns", shortName: "Suns", venue: "Footprint Center", city: "Phoenix", province: "AZ", season: "2025–26 NBA Season", searchTerm: "Suns", primaryColor: "hsl(25, 80%, 28%)", division: "Pacific" },
  { slug: "kings", name: "Sacramento Kings", shortName: "Kings", venue: "Golden 1 Center", city: "Sacramento", province: "CA", season: "2025–26 NBA Season", searchTerm: "Kings", primaryColor: "hsl(270, 40%, 22%)", division: "Pacific" },
  // Southwest
  { slug: "mavericks", name: "Dallas Mavericks", shortName: "Mavericks", venue: "American Airlines Center", city: "Dallas", province: "TX", season: "2025–26 NBA Season", searchTerm: "Mavericks", primaryColor: "hsl(215, 65%, 22%)", division: "Southwest" },
  { slug: "rockets", name: "Houston Rockets", shortName: "Rockets", venue: "Toyota Center", city: "Houston", province: "TX", season: "2025–26 NBA Season", searchTerm: "Rockets", primaryColor: "hsl(0, 70%, 28%)", division: "Southwest" },
  { slug: "grizzlies", name: "Memphis Grizzlies", shortName: "Grizzlies", venue: "FedExForum", city: "Memphis", province: "TN", season: "2025–26 NBA Season", searchTerm: "Grizzlies", primaryColor: "hsl(215, 50%, 20%)", division: "Southwest" },
  { slug: "pelicans", name: "New Orleans Pelicans", shortName: "Pelicans", venue: "Smoothie King Center", city: "New Orleans", province: "LA", season: "2025–26 NBA Season", searchTerm: "Pelicans", primaryColor: "hsl(220, 55%, 20%)", division: "Southwest" },
  { slug: "spurs", name: "San Antonio Spurs", shortName: "Spurs", venue: "Frost Bank Center", city: "San Antonio", province: "TX", season: "2025–26 NBA Season", searchTerm: "Spurs", primaryColor: "hsl(0, 0%, 15%)", division: "Southwest" },
];

export const NBA_DIVISIONS = ["Atlantic", "Central", "Southeast", "Northwest", "Pacific", "Southwest"] as const;

export const getNBATeamBySlug = (slug: string): NBATeamConfig | undefined =>
  NBA_TEAMS_CONFIG.find((t) => t.slug === slug);
