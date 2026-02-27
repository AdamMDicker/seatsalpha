// MLB team configuration for team pages
export interface MLBTeamConfig {
  slug: string;
  name: string;
  shortName: string;
  venue: string;
  city: string;
  province: string; // state/province code
  season: string;
  searchTerm: string; // used in DB query to find events
  primaryColor: string; // HSL for hero banner
  division: "AL East" | "AL Central" | "AL West" | "NL East" | "NL Central" | "NL West";
}

export const MLB_TEAMS_CONFIG: MLBTeamConfig[] = [
  // AL East
  { slug: "blue-jays", name: "Toronto Blue Jays", shortName: "Blue Jays", venue: "Skydome", city: "Toronto", province: "ON", season: "2026 MLB Season", searchTerm: "Blue Jays", primaryColor: "hsl(220, 60%, 20%)", division: "AL East" },
  { slug: "yankees", name: "New York Yankees", shortName: "Yankees", venue: "Yankee Stadium", city: "New York", province: "NY", season: "2026 MLB Season", searchTerm: "Yankees", primaryColor: "hsl(220, 30%, 18%)", division: "AL East" },
  { slug: "red-sox", name: "Boston Red Sox", shortName: "Red Sox", venue: "Fenway Park", city: "Boston", province: "MA", season: "2026 MLB Season", searchTerm: "Red Sox", primaryColor: "hsl(0, 70%, 30%)", division: "AL East" },
  { slug: "rays", name: "Tampa Bay Rays", shortName: "Rays", venue: "Tropicana Field", city: "St. Petersburg", province: "FL", season: "2026 MLB Season", searchTerm: "Rays", primaryColor: "hsl(220, 60%, 25%)", division: "AL East" },
  { slug: "orioles", name: "Baltimore Orioles", shortName: "Orioles", venue: "Camden Yards", city: "Baltimore", province: "MD", season: "2026 MLB Season", searchTerm: "Orioles", primaryColor: "hsl(25, 80%, 25%)", division: "AL East" },
  // AL Central
  { slug: "guardians", name: "Cleveland Guardians", shortName: "Guardians", venue: "Progressive Field", city: "Cleveland", province: "OH", season: "2026 MLB Season", searchTerm: "Guardians", primaryColor: "hsl(0, 65%, 28%)", division: "AL Central" },
  { slug: "tigers", name: "Detroit Tigers", shortName: "Tigers", venue: "Comerica Park", city: "Detroit", province: "MI", season: "2026 MLB Season", searchTerm: "Tigers", primaryColor: "hsl(220, 40%, 20%)", division: "AL Central" },
  { slug: "royals", name: "Kansas City Royals", shortName: "Royals", venue: "Kauffman Stadium", city: "Kansas City", province: "MO", season: "2026 MLB Season", searchTerm: "Royals", primaryColor: "hsl(215, 70%, 25%)", division: "AL Central" },
  { slug: "twins", name: "Minnesota Twins", shortName: "Twins", venue: "Target Field", city: "Minneapolis", province: "MN", season: "2026 MLB Season", searchTerm: "Twins", primaryColor: "hsl(0, 60%, 28%)", division: "AL Central" },
  { slug: "white-sox", name: "Chicago White Sox", shortName: "White Sox", venue: "Guaranteed Rate Field", city: "Chicago", province: "IL", season: "2026 MLB Season", searchTerm: "White Sox", primaryColor: "hsl(0, 0%, 12%)", division: "AL Central" },
  // AL West
  { slug: "astros", name: "Houston Astros", shortName: "Astros", venue: "Minute Maid Park", city: "Houston", province: "TX", season: "2026 MLB Season", searchTerm: "Astros", primaryColor: "hsl(25, 80%, 25%)", division: "AL West" },
  { slug: "rangers", name: "Texas Rangers", shortName: "Rangers", venue: "Globe Life Field", city: "Arlington", province: "TX", season: "2026 MLB Season", searchTerm: "Rangers", primaryColor: "hsl(215, 70%, 22%)", division: "AL West" },
  { slug: "mariners", name: "Seattle Mariners", shortName: "Mariners", venue: "T-Mobile Park", city: "Seattle", province: "WA", season: "2026 MLB Season", searchTerm: "Mariners", primaryColor: "hsl(200, 50%, 20%)", division: "AL West" },
  { slug: "angels", name: "Los Angeles Angels", shortName: "Angels", venue: "Angel Stadium", city: "Anaheim", province: "CA", season: "2026 MLB Season", searchTerm: "Angels", primaryColor: "hsl(0, 70%, 30%)", division: "AL West" },
  { slug: "athletics", name: "Oakland Athletics", shortName: "Athletics", venue: "Oakland Coliseum", city: "Oakland", province: "CA", season: "2026 MLB Season", searchTerm: "Athletics", primaryColor: "hsl(120, 40%, 22%)", division: "AL West" },
  // NL East
  { slug: "braves", name: "Atlanta Braves", shortName: "Braves", venue: "Truist Park", city: "Atlanta", province: "GA", season: "2026 MLB Season", searchTerm: "Braves", primaryColor: "hsl(220, 40%, 18%)", division: "NL East" },
  { slug: "mets", name: "New York Mets", shortName: "Mets", venue: "Citi Field", city: "New York", province: "NY", season: "2026 MLB Season", searchTerm: "Mets", primaryColor: "hsl(215, 70%, 25%)", division: "NL East" },
  { slug: "phillies", name: "Philadelphia Phillies", shortName: "Phillies", venue: "Citizens Bank Park", city: "Philadelphia", province: "PA", season: "2026 MLB Season", searchTerm: "Phillies", primaryColor: "hsl(0, 65%, 30%)", division: "NL East" },
  { slug: "marlins", name: "Miami Marlins", shortName: "Marlins", venue: "LoanDepot Park", city: "Miami", province: "FL", season: "2026 MLB Season", searchTerm: "Marlins", primaryColor: "hsl(0, 0%, 15%)", division: "NL East" },
  { slug: "nationals", name: "Washington Nationals", shortName: "Nationals", venue: "Nationals Park", city: "Washington", province: "DC", season: "2026 MLB Season", searchTerm: "Nationals", primaryColor: "hsl(0, 65%, 28%)", division: "NL East" },
  // NL Central
  { slug: "cubs", name: "Chicago Cubs", shortName: "Cubs", venue: "Wrigley Field", city: "Chicago", province: "IL", season: "2026 MLB Season", searchTerm: "Cubs", primaryColor: "hsl(215, 70%, 22%)", division: "NL Central" },
  { slug: "brewers", name: "Milwaukee Brewers", shortName: "Brewers", venue: "American Family Field", city: "Milwaukee", province: "WI", season: "2026 MLB Season", searchTerm: "Brewers", primaryColor: "hsl(220, 40%, 18%)", division: "NL Central" },
  { slug: "cardinals", name: "St. Louis Cardinals", shortName: "Cardinals", venue: "Busch Stadium", city: "St. Louis", province: "MO", season: "2026 MLB Season", searchTerm: "Cardinals", primaryColor: "hsl(0, 70%, 30%)", division: "NL Central" },
  { slug: "reds", name: "Cincinnati Reds", shortName: "Reds", venue: "Great American Ball Park", city: "Cincinnati", province: "OH", season: "2026 MLB Season", searchTerm: "Reds", primaryColor: "hsl(0, 70%, 28%)", division: "NL Central" },
  { slug: "pirates", name: "Pittsburgh Pirates", shortName: "Pirates", venue: "PNC Park", city: "Pittsburgh", province: "PA", season: "2026 MLB Season", searchTerm: "Pirates", primaryColor: "hsl(45, 80%, 30%)", division: "NL Central" },
  // NL West
  { slug: "dodgers", name: "Los Angeles Dodgers", shortName: "Dodgers", venue: "Dodger Stadium", city: "Los Angeles", province: "CA", season: "2026 MLB Season", searchTerm: "Dodgers", primaryColor: "hsl(215, 70%, 22%)", division: "NL West" },
  { slug: "padres", name: "San Diego Padres", shortName: "Padres", venue: "Petco Park", city: "San Diego", province: "CA", season: "2026 MLB Season", searchTerm: "Padres", primaryColor: "hsl(40, 50%, 22%)", division: "NL West" },
  { slug: "giants", name: "San Francisco Giants", shortName: "Giants", venue: "Oracle Park", city: "San Francisco", province: "CA", season: "2026 MLB Season", searchTerm: "Giants", primaryColor: "hsl(25, 80%, 25%)", division: "NL West" },
  { slug: "diamondbacks", name: "Arizona Diamondbacks", shortName: "D-backs", venue: "Chase Field", city: "Phoenix", province: "AZ", season: "2026 MLB Season", searchTerm: "Diamondbacks", primaryColor: "hsl(0, 65%, 25%)", division: "NL West" },
  { slug: "rockies", name: "Colorado Rockies", shortName: "Rockies", venue: "Coors Field", city: "Denver", province: "CO", season: "2026 MLB Season", searchTerm: "Rockies", primaryColor: "hsl(275, 40%, 22%)", division: "NL West" },
];

export const getMLBTeamBySlug = (slug: string): MLBTeamConfig | undefined =>
  MLB_TEAMS_CONFIG.find((t) => t.slug === slug);
