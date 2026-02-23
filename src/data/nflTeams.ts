export interface NFLTeamConfig {
  slug: string;
  name: string;
  shortName: string;
  venue: string;
  city: string;
  province: string;
  season: string;
  searchTerm: string;
  primaryColor: string;
  division: "AFC East" | "AFC North" | "AFC South" | "AFC West" | "NFC East" | "NFC North" | "NFC South" | "NFC West";
}

export const NFL_TEAMS_CONFIG: NFLTeamConfig[] = [
  // AFC East
  { slug: "bills", name: "Buffalo Bills", shortName: "Bills", venue: "Highmark Stadium", city: "Orchard Park", province: "NY", season: "2025–26 NFL Season", searchTerm: "Bills", primaryColor: "hsl(215, 65%, 25%)", division: "AFC East" },
  { slug: "dolphins", name: "Miami Dolphins", shortName: "Dolphins", venue: "Hard Rock Stadium", city: "Miami Gardens", province: "FL", season: "2025–26 NFL Season", searchTerm: "Dolphins", primaryColor: "hsl(175, 60%, 22%)", division: "AFC East" },
  { slug: "patriots", name: "New England Patriots", shortName: "Patriots", venue: "Gillette Stadium", city: "Foxborough", province: "MA", season: "2025–26 NFL Season", searchTerm: "Patriots", primaryColor: "hsl(220, 55%, 18%)", division: "AFC East" },
  { slug: "jets", name: "New York Jets", shortName: "Jets", venue: "MetLife Stadium", city: "East Rutherford", province: "NJ", season: "2025–26 NFL Season", searchTerm: "Jets", primaryColor: "hsl(140, 50%, 18%)", division: "AFC East" },
  // AFC North
  { slug: "ravens", name: "Baltimore Ravens", shortName: "Ravens", venue: "M&T Bank Stadium", city: "Baltimore", province: "MD", season: "2025–26 NFL Season", searchTerm: "Ravens", primaryColor: "hsl(270, 40%, 18%)", division: "AFC North" },
  { slug: "bengals", name: "Cincinnati Bengals", shortName: "Bengals", venue: "Paycor Stadium", city: "Cincinnati", province: "OH", season: "2025–26 NFL Season", searchTerm: "Bengals", primaryColor: "hsl(25, 80%, 28%)", division: "AFC North" },
  { slug: "browns", name: "Cleveland Browns", shortName: "Browns", venue: "Cleveland Browns Stadium", city: "Cleveland", province: "OH", season: "2025–26 NFL Season", searchTerm: "Browns", primaryColor: "hsl(25, 70%, 22%)", division: "AFC North" },
  { slug: "steelers", name: "Pittsburgh Steelers", shortName: "Steelers", venue: "Acrisure Stadium", city: "Pittsburgh", province: "PA", season: "2025–26 NFL Season", searchTerm: "Steelers", primaryColor: "hsl(45, 80%, 30%)", division: "AFC North" },
  // AFC South
  { slug: "texans", name: "Houston Texans", shortName: "Texans", venue: "NRG Stadium", city: "Houston", province: "TX", season: "2025–26 NFL Season", searchTerm: "Texans", primaryColor: "hsl(215, 60%, 18%)", division: "AFC South" },
  { slug: "colts", name: "Indianapolis Colts", shortName: "Colts", venue: "Lucas Oil Stadium", city: "Indianapolis", province: "IN", season: "2025–26 NFL Season", searchTerm: "Colts", primaryColor: "hsl(215, 65%, 25%)", division: "AFC South" },
  { slug: "jaguars", name: "Jacksonville Jaguars", shortName: "Jaguars", venue: "EverBank Stadium", city: "Jacksonville", province: "FL", season: "2025–26 NFL Season", searchTerm: "Jaguars", primaryColor: "hsl(180, 60%, 18%)", division: "AFC South" },
  { slug: "titans", name: "Tennessee Titans", shortName: "Titans", venue: "Nissan Stadium", city: "Nashville", province: "TN", season: "2025–26 NFL Season", searchTerm: "Titans", primaryColor: "hsl(215, 50%, 22%)", division: "AFC South" },
  // AFC West
  { slug: "broncos", name: "Denver Broncos", shortName: "Broncos", venue: "Empower Field at Mile High", city: "Denver", province: "CO", season: "2025–26 NFL Season", searchTerm: "Broncos", primaryColor: "hsl(25, 80%, 28%)", division: "AFC West" },
  { slug: "chiefs", name: "Kansas City Chiefs", shortName: "Chiefs", venue: "GEHA Field at Arrowhead Stadium", city: "Kansas City", province: "MO", season: "2025–26 NFL Season", searchTerm: "Chiefs", primaryColor: "hsl(0, 70%, 28%)", division: "AFC West" },
  { slug: "chargers", name: "Los Angeles Chargers", shortName: "Chargers", venue: "SoFi Stadium", city: "Inglewood", province: "CA", season: "2025–26 NFL Season", searchTerm: "Chargers", primaryColor: "hsl(210, 70%, 25%)", division: "AFC West" },
  { slug: "raiders", name: "Las Vegas Raiders", shortName: "Raiders", venue: "Allegiant Stadium", city: "Las Vegas", province: "NV", season: "2025–26 NFL Season", searchTerm: "Raiders", primaryColor: "hsl(0, 0%, 15%)", division: "AFC West" },
  // NFC East
  { slug: "cowboys", name: "Dallas Cowboys", shortName: "Cowboys", venue: "AT&T Stadium", city: "Arlington", province: "TX", season: "2025–26 NFL Season", searchTerm: "Cowboys", primaryColor: "hsl(215, 50%, 18%)", division: "NFC East" },
  { slug: "giants", name: "New York Giants", shortName: "Giants", venue: "MetLife Stadium", city: "East Rutherford", province: "NJ", season: "2025–26 NFL Season", searchTerm: "Giants", primaryColor: "hsl(215, 60%, 22%)", division: "NFC East" },
  { slug: "eagles", name: "Philadelphia Eagles", shortName: "Eagles", venue: "Lincoln Financial Field", city: "Philadelphia", province: "PA", season: "2025–26 NFL Season", searchTerm: "Eagles", primaryColor: "hsl(165, 55%, 18%)", division: "NFC East" },
  { slug: "commanders", name: "Washington Commanders", shortName: "Commanders", venue: "Northwest Stadium", city: "Landover", province: "MD", season: "2025–26 NFL Season", searchTerm: "Commanders", primaryColor: "hsl(340, 55%, 22%)", division: "NFC East" },
  // NFC North
  { slug: "bears", name: "Chicago Bears", shortName: "Bears", venue: "Soldier Field", city: "Chicago", province: "IL", season: "2025–26 NFL Season", searchTerm: "Bears", primaryColor: "hsl(220, 55%, 18%)", division: "NFC North" },
  { slug: "lions", name: "Detroit Lions", shortName: "Lions", venue: "Ford Field", city: "Detroit", province: "MI", season: "2025–26 NFL Season", searchTerm: "Lions", primaryColor: "hsl(210, 60%, 22%)", division: "NFC North" },
  { slug: "packers", name: "Green Bay Packers", shortName: "Packers", venue: "Lambeau Field", city: "Green Bay", province: "WI", season: "2025–26 NFL Season", searchTerm: "Packers", primaryColor: "hsl(140, 55%, 18%)", division: "NFC North" },
  { slug: "vikings", name: "Minnesota Vikings", shortName: "Vikings", venue: "U.S. Bank Stadium", city: "Minneapolis", province: "MN", season: "2025–26 NFL Season", searchTerm: "Vikings", primaryColor: "hsl(270, 50%, 20%)", division: "NFC North" },
  // NFC South
  { slug: "falcons", name: "Atlanta Falcons", shortName: "Falcons", venue: "Mercedes-Benz Stadium", city: "Atlanta", province: "GA", season: "2025–26 NFL Season", searchTerm: "Falcons", primaryColor: "hsl(0, 65%, 22%)", division: "NFC South" },
  { slug: "panthers", name: "Carolina Panthers", shortName: "Panthers", venue: "Bank of America Stadium", city: "Charlotte", province: "NC", season: "2025–26 NFL Season", searchTerm: "Panthers", primaryColor: "hsl(200, 60%, 22%)", division: "NFC South" },
  { slug: "saints", name: "New Orleans Saints", shortName: "Saints", venue: "Caesars Superdome", city: "New Orleans", province: "LA", season: "2025–26 NFL Season", searchTerm: "Saints", primaryColor: "hsl(40, 60%, 25%)", division: "NFC South" },
  { slug: "buccaneers", name: "Tampa Bay Buccaneers", shortName: "Buccaneers", venue: "Raymond James Stadium", city: "Tampa", province: "FL", season: "2025–26 NFL Season", searchTerm: "Buccaneers", primaryColor: "hsl(0, 65%, 22%)", division: "NFC South" },
  // NFC West
  { slug: "cardinals", name: "Arizona Cardinals", shortName: "Cardinals", venue: "State Farm Stadium", city: "Glendale", province: "AZ", season: "2025–26 NFL Season", searchTerm: "Cardinals", primaryColor: "hsl(0, 60%, 28%)", division: "NFC West" },
  { slug: "rams", name: "Los Angeles Rams", shortName: "Rams", venue: "SoFi Stadium", city: "Inglewood", province: "CA", season: "2025–26 NFL Season", searchTerm: "Rams", primaryColor: "hsl(215, 60%, 22%)", division: "NFC West" },
  { slug: "49ers", name: "San Francisco 49ers", shortName: "49ers", venue: "Levi's Stadium", city: "Santa Clara", province: "CA", season: "2025–26 NFL Season", searchTerm: "49ers", primaryColor: "hsl(0, 60%, 28%)", division: "NFC West" },
  { slug: "seahawks", name: "Seattle Seahawks", shortName: "Seahawks", venue: "Lumen Field", city: "Seattle", province: "WA", season: "2025–26 NFL Season", searchTerm: "Seahawks", primaryColor: "hsl(220, 55%, 18%)", division: "NFC West" },
];

export const NFL_DIVISIONS = ["AFC East", "AFC North", "AFC South", "AFC West", "NFC East", "NFC North", "NFC South", "NFC West"] as const;

export const getNFLTeamBySlug = (slug: string): NFLTeamConfig | undefined =>
  NFL_TEAMS_CONFIG.find((t) => t.slug === slug);
