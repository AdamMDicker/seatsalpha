export interface MLSTeamConfig {
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

export const MLS_TEAMS_CONFIG: MLSTeamConfig[] = [
  // Eastern Conference
  { slug: "atlanta-united", name: "Atlanta United FC", shortName: "Atlanta", venue: "Mercedes-Benz Stadium", city: "Atlanta", province: "GA", season: "2025 MLS Season", searchTerm: "Atlanta United", primaryColor: "hsl(0, 60%, 25%)", conference: "Eastern" },
  { slug: "charlotte-fc", name: "Charlotte FC", shortName: "Charlotte", venue: "Bank of America Stadium", city: "Charlotte", province: "NC", season: "2025 MLS Season", searchTerm: "Charlotte FC", primaryColor: "hsl(210, 55%, 20%)", conference: "Eastern" },
  { slug: "chicago-fire", name: "Chicago Fire FC", shortName: "Chicago", venue: "Soldier Field", city: "Chicago", province: "IL", season: "2025 MLS Season", searchTerm: "Chicago Fire", primaryColor: "hsl(0, 65%, 28%)", conference: "Eastern" },
  { slug: "fc-cincinnati", name: "FC Cincinnati", shortName: "Cincinnati", venue: "TQL Stadium", city: "Cincinnati", province: "OH", season: "2025 MLS Season", searchTerm: "FC Cincinnati", primaryColor: "hsl(210, 70%, 22%)", conference: "Eastern" },
  { slug: "columbus-crew", name: "Columbus Crew", shortName: "Columbus", venue: "Lower.com Field", city: "Columbus", province: "OH", season: "2025 MLS Season", searchTerm: "Columbus Crew", primaryColor: "hsl(45, 80%, 30%)", conference: "Eastern" },
  { slug: "dc-united", name: "D.C. United", shortName: "D.C. United", venue: "Audi Field", city: "Washington", province: "DC", season: "2025 MLS Season", searchTerm: "D.C. United", primaryColor: "hsl(0, 0%, 12%)", conference: "Eastern" },
  { slug: "inter-miami", name: "Inter Miami CF", shortName: "Inter Miami", venue: "Chase Stadium", city: "Fort Lauderdale", province: "FL", season: "2025 MLS Season", searchTerm: "Inter Miami", primaryColor: "hsl(340, 60%, 40%)", conference: "Eastern" },
  { slug: "cf-montreal", name: "CF Montréal", shortName: "CF Montréal", venue: "Saputo Stadium", city: "Montreal", province: "QC", season: "2025 MLS Season", searchTerm: "CF Montréal", primaryColor: "hsl(220, 55%, 18%)", conference: "Eastern" },
  { slug: "nashville-sc", name: "Nashville SC", shortName: "Nashville", venue: "GEODIS Park", city: "Nashville", province: "TN", season: "2025 MLS Season", searchTerm: "Nashville SC", primaryColor: "hsl(45, 80%, 30%)", conference: "Eastern" },
  { slug: "new-england-revolution", name: "New England Revolution", shortName: "Revolution", venue: "Gillette Stadium", city: "Foxborough", province: "MA", season: "2025 MLS Season", searchTerm: "New England Revolution", primaryColor: "hsl(220, 55%, 18%)", conference: "Eastern" },
  { slug: "nycfc", name: "New York City FC", shortName: "NYCFC", venue: "Yankee Stadium", city: "New York", province: "NY", season: "2025 MLS Season", searchTerm: "New York City FC", primaryColor: "hsl(205, 70%, 30%)", conference: "Eastern" },
  { slug: "ny-red-bulls", name: "New York Red Bulls", shortName: "Red Bulls", venue: "Red Bull Arena", city: "Harrison", province: "NJ", season: "2025 MLS Season", searchTerm: "Red Bulls", primaryColor: "hsl(0, 65%, 28%)", conference: "Eastern" },
  { slug: "orlando-city", name: "Orlando City SC", shortName: "Orlando", venue: "Exploria Stadium", city: "Orlando", province: "FL", season: "2025 MLS Season", searchTerm: "Orlando City", primaryColor: "hsl(270, 55%, 28%)", conference: "Eastern" },
  { slug: "philadelphia-union", name: "Philadelphia Union", shortName: "Union", venue: "Subaru Park", city: "Chester", province: "PA", season: "2025 MLS Season", searchTerm: "Philadelphia Union", primaryColor: "hsl(215, 55%, 18%)", conference: "Eastern" },
  { slug: "toronto-fc", name: "Toronto FC", shortName: "Toronto FC", venue: "BMO Field", city: "Toronto", province: "ON", season: "2025 MLS Season", searchTerm: "Toronto FC", primaryColor: "hsl(0, 65%, 28%)", conference: "Eastern" },
  // Western Conference
  { slug: "austin-fc", name: "Austin FC", shortName: "Austin", venue: "Q2 Stadium", city: "Austin", province: "TX", season: "2025 MLS Season", searchTerm: "Austin FC", primaryColor: "hsl(140, 60%, 18%)", conference: "Western" },
  { slug: "colorado-rapids", name: "Colorado Rapids", shortName: "Rapids", venue: "Dick's Sporting Goods Park", city: "Commerce City", province: "CO", season: "2025 MLS Season", searchTerm: "Colorado Rapids", primaryColor: "hsl(340, 55%, 22%)", conference: "Western" },
  { slug: "fc-dallas", name: "FC Dallas", shortName: "FC Dallas", venue: "Toyota Stadium", city: "Frisco", province: "TX", season: "2025 MLS Season", searchTerm: "FC Dallas", primaryColor: "hsl(0, 60%, 25%)", conference: "Western" },
  { slug: "houston-dynamo", name: "Houston Dynamo FC", shortName: "Dynamo", venue: "Shell Energy Stadium", city: "Houston", province: "TX", season: "2025 MLS Season", searchTerm: "Houston Dynamo", primaryColor: "hsl(25, 80%, 28%)", conference: "Western" },
  { slug: "la-galaxy", name: "LA Galaxy", shortName: "Galaxy", venue: "Dignity Health Sports Park", city: "Carson", province: "CA", season: "2025 MLS Season", searchTerm: "LA Galaxy", primaryColor: "hsl(215, 55%, 18%)", conference: "Western" },
  { slug: "lafc", name: "Los Angeles FC", shortName: "LAFC", venue: "BMO Stadium", city: "Los Angeles", province: "CA", season: "2025 MLS Season", searchTerm: "LAFC", primaryColor: "hsl(0, 0%, 10%)", conference: "Western" },
  { slug: "minnesota-united", name: "Minnesota United FC", shortName: "Minnesota", venue: "Allianz Field", city: "Saint Paul", province: "MN", season: "2025 MLS Season", searchTerm: "Minnesota United", primaryColor: "hsl(0, 0%, 15%)", conference: "Western" },
  { slug: "portland-timbers", name: "Portland Timbers", shortName: "Timbers", venue: "Providence Park", city: "Portland", province: "OR", season: "2025 MLS Season", searchTerm: "Portland Timbers", primaryColor: "hsl(140, 50%, 18%)", conference: "Western" },
  { slug: "real-salt-lake", name: "Real Salt Lake", shortName: "RSL", venue: "America First Field", city: "Sandy", province: "UT", season: "2025 MLS Season", searchTerm: "Real Salt Lake", primaryColor: "hsl(0, 60%, 25%)", conference: "Western" },
  { slug: "san-jose-earthquakes", name: "San Jose Earthquakes", shortName: "Earthquakes", venue: "PayPal Park", city: "San Jose", province: "CA", season: "2025 MLS Season", searchTerm: "San Jose Earthquakes", primaryColor: "hsl(215, 60%, 22%)", conference: "Western" },
  { slug: "seattle-sounders", name: "Seattle Sounders FC", shortName: "Sounders", venue: "Lumen Field", city: "Seattle", province: "WA", season: "2025 MLS Season", searchTerm: "Seattle Sounders", primaryColor: "hsl(155, 60%, 20%)", conference: "Western" },
  { slug: "sporting-kc", name: "Sporting Kansas City", shortName: "Sporting KC", venue: "Children's Mercy Park", city: "Kansas City", province: "KS", season: "2025 MLS Season", searchTerm: "Sporting Kansas City", primaryColor: "hsl(210, 60%, 20%)", conference: "Western" },
  { slug: "st-louis-city", name: "St. Louis City SC", shortName: "St. Louis", venue: "CityPark", city: "St. Louis", province: "MO", season: "2025 MLS Season", searchTerm: "St. Louis City", primaryColor: "hsl(0, 60%, 28%)", conference: "Western" },
  { slug: "vancouver-whitecaps", name: "Vancouver Whitecaps FC", shortName: "Whitecaps", venue: "BC Place", city: "Vancouver", province: "BC", season: "2025 MLS Season", searchTerm: "Vancouver Whitecaps", primaryColor: "hsl(215, 55%, 18%)", conference: "Western" },
];

export const MLS_CONFERENCES = ["Eastern", "Western"] as const;

export const getMLSTeamBySlug = (slug: string): MLSTeamConfig | undefined =>
  MLS_TEAMS_CONFIG.find((t) => t.slug === slug);
