// Predefined teams and their venues for consistent event creation
export interface TeamVenue {
  team: string;
  venue: string;
  city: string;
  province: string;
  league: string;
}

export const TEAMS_VENUES: TeamVenue[] = [
  // NHL
  { team: "Toronto Maple Leafs", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "NHL" },
  { team: "Montreal Canadiens", venue: "Bell Centre", city: "Montreal", province: "QC", league: "NHL" },
  { team: "Ottawa Senators", venue: "Canadian Tire Centre", city: "Ottawa", province: "ON", league: "NHL" },
  { team: "Vancouver Canucks", venue: "Rogers Arena", city: "Vancouver", province: "BC", league: "NHL" },
  { team: "Calgary Flames", venue: "Scotiabank Saddledome", city: "Calgary", province: "AB", league: "NHL" },
  { team: "Edmonton Oilers", venue: "Rogers Place", city: "Edmonton", province: "AB", league: "NHL" },
  { team: "Winnipeg Jets", venue: "Canada Life Centre", city: "Winnipeg", province: "MB", league: "NHL" },
  // NBA
  { team: "Toronto Raptors", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "NBA" },
  // MLB
  { team: "Toronto Blue Jays", venue: "Rogers Centre", city: "Toronto", province: "ON", league: "MLB" },
  // NFL – Canadian interest (away games)
  { team: "Buffalo Bills", venue: "Highmark Stadium", city: "Orchard Park", province: "NY", league: "NFL" },
  // MLS
  { team: "Toronto FC", venue: "BMO Field", city: "Toronto", province: "ON", league: "MLS" },
  { team: "CF Montréal", venue: "Stade Saputo", city: "Montreal", province: "QC", league: "MLS" },
  { team: "Vancouver Whitecaps", venue: "BC Place", city: "Vancouver", province: "BC", league: "MLS" },
  // CFL
  { team: "Toronto Argonauts", venue: "BMO Field", city: "Toronto", province: "ON", league: "CFL" },
  { team: "Hamilton Tiger-Cats", venue: "Tim Hortons Field", city: "Hamilton", province: "ON", league: "CFL" },
  { team: "Ottawa Redblacks", venue: "TD Place Stadium", city: "Ottawa", province: "ON", league: "CFL" },
  { team: "Montreal Alouettes", venue: "Percival Molson Memorial Stadium", city: "Montreal", province: "QC", league: "CFL" },
  { team: "Winnipeg Blue Bombers", venue: "IG Field", city: "Winnipeg", province: "MB", league: "CFL" },
  { team: "Saskatchewan Roughriders", venue: "Mosaic Stadium", city: "Regina", province: "SK", league: "CFL" },
  { team: "Calgary Stampeders", venue: "McMahon Stadium", city: "Calgary", province: "AB", league: "CFL" },
  { team: "Edmonton Elks", venue: "Commonwealth Stadium", city: "Edmonton", province: "AB", league: "CFL" },
  { team: "BC Lions", venue: "BC Place", city: "Vancouver", province: "BC", league: "CFL" },
];

export const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT", "NY"];

export const LEAGUES_LIST = ["NHL", "NBA", "MLB", "NFL", "MLS", "CFL"];
