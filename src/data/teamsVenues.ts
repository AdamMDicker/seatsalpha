// Predefined teams and their venues for consistent event creation
export interface TeamVenue {
  team: string;
  venue: string;
  city: string;
  province: string;
  league: string;
  latitude?: number;
  longitude?: number;
}

export const TEAMS_VENUES: TeamVenue[] = [
  // NHL
  { team: "Toronto Maple Leafs", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "NHL", latitude: 43.6435, longitude: -79.3791 },
  { team: "Montreal Canadiens", venue: "Bell Centre", city: "Montreal", province: "QC", league: "NHL", latitude: 45.4961, longitude: -73.5693 },
  { team: "Ottawa Senators", venue: "Canadian Tire Centre", city: "Ottawa", province: "ON", league: "NHL", latitude: 45.2969, longitude: -75.9270 },
  { team: "Vancouver Canucks", venue: "Rogers Arena", city: "Vancouver", province: "BC", league: "NHL", latitude: 49.2778, longitude: -123.1089 },
  { team: "Calgary Flames", venue: "Scotiabank Saddledome", city: "Calgary", province: "AB", league: "NHL", latitude: 51.0375, longitude: -114.0519 },
  { team: "Edmonton Oilers", venue: "Rogers Place", city: "Edmonton", province: "AB", league: "NHL", latitude: 53.5461, longitude: -113.4938 },
  { team: "Winnipeg Jets", venue: "Canada Life Centre", city: "Winnipeg", province: "MB", league: "NHL", latitude: 49.8928, longitude: -97.1436 },
  // NBA
  { team: "Toronto Raptors", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "NBA", latitude: 43.6435, longitude: -79.3791 },
  // MLB
  { team: "Toronto Blue Jays", venue: "Skydome", city: "Toronto", province: "ON", league: "MLB", latitude: 43.6414, longitude: -79.3894 },
  // NFL – Canadian interest (away games)
  { team: "Buffalo Bills", venue: "Highmark Stadium", city: "Orchard Park", province: "NY", league: "NFL", latitude: 42.7738, longitude: -78.7870 },
  // MLS
  { team: "Toronto FC", venue: "BMO Field", city: "Toronto", province: "ON", league: "MLS", latitude: 43.6332, longitude: -79.4186 },
  { team: "CF Montréal", venue: "Stade Saputo", city: "Montreal", province: "QC", league: "MLS", latitude: 45.5622, longitude: -73.5528 },
  { team: "Vancouver Whitecaps", venue: "BC Place", city: "Vancouver", province: "BC", league: "MLS", latitude: 49.2768, longitude: -123.1118 },
  // CFL
  { team: "Toronto Argonauts", venue: "BMO Field", city: "Toronto", province: "ON", league: "CFL", latitude: 43.6332, longitude: -79.4186 },
  { team: "Hamilton Tiger-Cats", venue: "Tim Hortons Field", city: "Hamilton", province: "ON", league: "CFL", latitude: 43.2543, longitude: -79.8327 },
  { team: "Ottawa Redblacks", venue: "TD Place Stadium", city: "Ottawa", province: "ON", league: "CFL", latitude: 45.3985, longitude: -75.6837 },
  { team: "Montreal Alouettes", venue: "Percival Molson Memorial Stadium", city: "Montreal", province: "QC", league: "CFL", latitude: 45.5112, longitude: -73.5814 },
  { team: "Winnipeg Blue Bombers", venue: "IG Field", city: "Winnipeg", province: "MB", league: "CFL", latitude: 49.8076, longitude: -97.1454 },
  { team: "Saskatchewan Roughriders", venue: "Mosaic Stadium", city: "Regina", province: "SK", league: "CFL", latitude: 50.4543, longitude: -104.5851 },
  { team: "Calgary Stampeders", venue: "McMahon Stadium", city: "Calgary", province: "AB", league: "CFL", latitude: 51.0704, longitude: -114.1213 },
  { team: "Edmonton Elks", venue: "Commonwealth Stadium", city: "Edmonton", province: "AB", league: "CFL", latitude: 53.5594, longitude: -113.4762 },
  { team: "BC Lions", venue: "BC Place", city: "Vancouver", province: "BC", league: "CFL", latitude: 49.2768, longitude: -123.1118 },
  // WNBA
  { team: "Toronto Tempo", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "WNBA", latitude: 43.6435, longitude: -79.3791 },
];

export const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT", "NY"];

export const LEAGUES_LIST = ["NHL", "NBA", "WNBA", "MLB", "NFL", "MLS", "CFL"];
