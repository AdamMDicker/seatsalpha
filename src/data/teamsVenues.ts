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
  // ===== NHL =====
  // Atlantic
  { team: "Toronto Maple Leafs", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "NHL", latitude: 43.6435, longitude: -79.3791 },
  { team: "Montreal Canadiens", venue: "Bell Centre", city: "Montreal", province: "QC", league: "NHL", latitude: 45.4961, longitude: -73.5693 },
  { team: "Ottawa Senators", venue: "Canadian Tire Centre", city: "Ottawa", province: "ON", league: "NHL", latitude: 45.2969, longitude: -75.9270 },
  { team: "Boston Bruins", venue: "TD Garden", city: "Boston", province: "MA", league: "NHL", latitude: 42.3662, longitude: -71.0621 },
  { team: "Buffalo Sabres", venue: "KeyBank Center", city: "Buffalo", province: "NY", league: "NHL", latitude: 42.8750, longitude: -78.8764 },
  { team: "Detroit Red Wings", venue: "Little Caesars Arena", city: "Detroit", province: "MI", league: "NHL", latitude: 42.3411, longitude: -83.0553 },
  { team: "Florida Panthers", venue: "Amerant Bank Arena", city: "Sunrise", province: "FL", league: "NHL", latitude: 26.1584, longitude: -80.3256 },
  { team: "Tampa Bay Lightning", venue: "Amalie Arena", city: "Tampa", province: "FL", league: "NHL", latitude: 27.9426, longitude: -82.4519 },
  // Metropolitan
  { team: "Carolina Hurricanes", venue: "PNC Arena", city: "Raleigh", province: "NC", league: "NHL", latitude: 35.8033, longitude: -78.7220 },
  { team: "Columbus Blue Jackets", venue: "Nationwide Arena", city: "Columbus", province: "OH", league: "NHL", latitude: 39.9692, longitude: -83.0061 },
  { team: "New Jersey Devils", venue: "Prudential Center", city: "Newark", province: "NJ", league: "NHL", latitude: 40.7334, longitude: -74.1712 },
  { team: "New York Islanders", venue: "UBS Arena", city: "Elmont", province: "NY", league: "NHL", latitude: 40.7172, longitude: -73.7257 },
  { team: "New York Rangers", venue: "Madison Square Garden", city: "New York", province: "NY", league: "NHL", latitude: 40.7505, longitude: -73.9934 },
  { team: "Philadelphia Flyers", venue: "Wells Fargo Center", city: "Philadelphia", province: "PA", league: "NHL", latitude: 39.9012, longitude: -75.1720 },
  { team: "Pittsburgh Penguins", venue: "PPG Paints Arena", city: "Pittsburgh", province: "PA", league: "NHL", latitude: 40.4396, longitude: -79.9891 },
  { team: "Washington Capitals", venue: "Capital One Arena", city: "Washington", province: "DC", league: "NHL", latitude: 38.8981, longitude: -77.0209 },
  // Central
  { team: "Winnipeg Jets", venue: "Canada Life Centre", city: "Winnipeg", province: "MB", league: "NHL", latitude: 49.8928, longitude: -97.1436 },
  { team: "Chicago Blackhawks", venue: "United Center", city: "Chicago", province: "IL", league: "NHL", latitude: 41.8807, longitude: -87.6742 },
  { team: "Colorado Avalanche", venue: "Ball Arena", city: "Denver", province: "CO", league: "NHL", latitude: 39.7487, longitude: -105.0077 },
  { team: "Dallas Stars", venue: "American Airlines Center", city: "Dallas", province: "TX", league: "NHL", latitude: 32.7905, longitude: -96.8103 },
  { team: "Minnesota Wild", venue: "Xcel Energy Center", city: "Saint Paul", province: "MN", league: "NHL", latitude: 44.9448, longitude: -93.1010 },
  { team: "Nashville Predators", venue: "Bridgestone Arena", city: "Nashville", province: "TN", league: "NHL", latitude: 36.1592, longitude: -86.7785 },
  { team: "St. Louis Blues", venue: "Enterprise Center", city: "St. Louis", province: "MO", league: "NHL", latitude: 38.6268, longitude: -90.2025 },
  { team: "Utah Hockey Club", venue: "Delta Center", city: "Salt Lake City", province: "UT", league: "NHL", latitude: 40.7683, longitude: -111.9011 },
  // Pacific
  { team: "Anaheim Ducks", venue: "Honda Center", city: "Anaheim", province: "CA", league: "NHL", latitude: 33.8078, longitude: -117.8765 },
  { team: "Calgary Flames", venue: "Scotiabank Saddledome", city: "Calgary", province: "AB", league: "NHL", latitude: 51.0375, longitude: -114.0519 },
  { team: "Edmonton Oilers", venue: "Rogers Place", city: "Edmonton", province: "AB", league: "NHL", latitude: 53.5461, longitude: -113.4938 },
  { team: "Los Angeles Kings", venue: "Crypto.com Arena", city: "Los Angeles", province: "CA", league: "NHL", latitude: 34.0430, longitude: -118.2673 },
  { team: "San Jose Sharks", venue: "SAP Center", city: "San Jose", province: "CA", league: "NHL", latitude: 37.3328, longitude: -121.9010 },
  { team: "Seattle Kraken", venue: "Climate Pledge Arena", city: "Seattle", province: "WA", league: "NHL", latitude: 47.6221, longitude: -122.3541 },
  { team: "Vancouver Canucks", venue: "Rogers Arena", city: "Vancouver", province: "BC", league: "NHL", latitude: 49.2778, longitude: -123.1089 },
  { team: "Vegas Golden Knights", venue: "T-Mobile Arena", city: "Las Vegas", province: "NV", league: "NHL", latitude: 36.1029, longitude: -115.1785 },

  // ===== NBA =====
  // Atlantic
  { team: "Boston Celtics", venue: "TD Garden", city: "Boston", province: "MA", league: "NBA", latitude: 42.3662, longitude: -71.0621 },
  { team: "Brooklyn Nets", venue: "Barclays Center", city: "Brooklyn", province: "NY", league: "NBA", latitude: 40.6826, longitude: -73.9754 },
  { team: "New York Knicks", venue: "Madison Square Garden", city: "New York", province: "NY", league: "NBA", latitude: 40.7505, longitude: -73.9934 },
  { team: "Philadelphia 76ers", venue: "Wells Fargo Center", city: "Philadelphia", province: "PA", league: "NBA", latitude: 39.9012, longitude: -75.1720 },
  { team: "Toronto Raptors", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "NBA", latitude: 43.6435, longitude: -79.3791 },
  // Central
  { team: "Chicago Bulls", venue: "United Center", city: "Chicago", province: "IL", league: "NBA", latitude: 41.8807, longitude: -87.6742 },
  { team: "Cleveland Cavaliers", venue: "Rocket Mortgage FieldHouse", city: "Cleveland", province: "OH", league: "NBA", latitude: 41.4965, longitude: -81.6882 },
  { team: "Detroit Pistons", venue: "Little Caesars Arena", city: "Detroit", province: "MI", league: "NBA", latitude: 42.3411, longitude: -83.0553 },
  { team: "Indiana Pacers", venue: "Gainbridge Fieldhouse", city: "Indianapolis", province: "IN", league: "NBA", latitude: 39.7641, longitude: -86.1555 },
  { team: "Milwaukee Bucks", venue: "Fiserv Forum", city: "Milwaukee", province: "WI", league: "NBA", latitude: 43.0451, longitude: -87.9174 },
  // Southeast
  { team: "Atlanta Hawks", venue: "State Farm Arena", city: "Atlanta", province: "GA", league: "NBA", latitude: 33.7573, longitude: -84.3963 },
  { team: "Charlotte Hornets", venue: "Spectrum Center", city: "Charlotte", province: "NC", league: "NBA", latitude: 35.2251, longitude: -80.8392 },
  { team: "Miami Heat", venue: "Kaseya Center", city: "Miami", province: "FL", league: "NBA", latitude: 25.7814, longitude: -80.1870 },
  { team: "Orlando Magic", venue: "Amway Center", city: "Orlando", province: "FL", league: "NBA", latitude: 28.5392, longitude: -81.3839 },
  { team: "Washington Wizards", venue: "Capital One Arena", city: "Washington", province: "DC", league: "NBA", latitude: 38.8981, longitude: -77.0209 },
  // Northwest
  { team: "Denver Nuggets", venue: "Ball Arena", city: "Denver", province: "CO", league: "NBA", latitude: 39.7487, longitude: -105.0077 },
  { team: "Minnesota Timberwolves", venue: "Target Center", city: "Minneapolis", province: "MN", league: "NBA", latitude: 44.9795, longitude: -93.2761 },
  { team: "Oklahoma City Thunder", venue: "Paycom Center", city: "Oklahoma City", province: "OK", league: "NBA", latitude: 35.4634, longitude: -97.5151 },
  { team: "Portland Trail Blazers", venue: "Moda Center", city: "Portland", province: "OR", league: "NBA", latitude: 45.5316, longitude: -122.6668 },
  { team: "Utah Jazz", venue: "Delta Center", city: "Salt Lake City", province: "UT", league: "NBA", latitude: 40.7683, longitude: -111.9011 },
  // Pacific
  { team: "Golden State Warriors", venue: "Chase Center", city: "San Francisco", province: "CA", league: "NBA", latitude: 37.7680, longitude: -122.3877 },
  { team: "LA Clippers", venue: "Intuit Dome", city: "Inglewood", province: "CA", league: "NBA", latitude: 33.9536, longitude: -118.3413 },
  { team: "Los Angeles Lakers", venue: "Crypto.com Arena", city: "Los Angeles", province: "CA", league: "NBA", latitude: 34.0430, longitude: -118.2673 },
  { team: "Phoenix Suns", venue: "Footprint Center", city: "Phoenix", province: "AZ", league: "NBA", latitude: 33.4457, longitude: -112.0712 },
  { team: "Sacramento Kings", venue: "Golden 1 Center", city: "Sacramento", province: "CA", league: "NBA", latitude: 38.5802, longitude: -121.4997 },
  // Southwest
  { team: "Dallas Mavericks", venue: "American Airlines Center", city: "Dallas", province: "TX", league: "NBA", latitude: 32.7905, longitude: -96.8103 },
  { team: "Houston Rockets", venue: "Toyota Center", city: "Houston", province: "TX", league: "NBA", latitude: 29.7508, longitude: -95.3621 },
  { team: "Memphis Grizzlies", venue: "FedExForum", city: "Memphis", province: "TN", league: "NBA", latitude: 35.1382, longitude: -90.0506 },
  { team: "New Orleans Pelicans", venue: "Smoothie King Center", city: "New Orleans", province: "LA", league: "NBA", latitude: 29.9490, longitude: -90.0821 },
  { team: "San Antonio Spurs", venue: "Frost Bank Center", city: "San Antonio", province: "TX", league: "NBA", latitude: 29.4270, longitude: -98.4375 },

  // ===== MLB =====
  // AL East
  { team: "Toronto Blue Jays", venue: "Skydome", city: "Toronto", province: "ON", league: "MLB", latitude: 43.6414, longitude: -79.3894 },
  { team: "Toronto Blue Jays", venue: "Rogers Centre", city: "Toronto", province: "ON", league: "MLB", latitude: 43.6414, longitude: -79.3894 },
  { team: "New York Yankees", venue: "Yankee Stadium", city: "New York", province: "NY", league: "MLB", latitude: 40.8296, longitude: -73.9262 },
  { team: "Boston Red Sox", venue: "Fenway Park", city: "Boston", province: "MA", league: "MLB", latitude: 42.3467, longitude: -71.0972 },
  { team: "Tampa Bay Rays", venue: "Tropicana Field", city: "St. Petersburg", province: "FL", league: "MLB", latitude: 27.7682, longitude: -82.6534 },
  { team: "Baltimore Orioles", venue: "Camden Yards", city: "Baltimore", province: "MD", league: "MLB", latitude: 39.2838, longitude: -76.6216 },
  // AL Central
  { team: "Cleveland Guardians", venue: "Progressive Field", city: "Cleveland", province: "OH", league: "MLB", latitude: 41.4962, longitude: -81.6852 },
  { team: "Detroit Tigers", venue: "Comerica Park", city: "Detroit", province: "MI", league: "MLB", latitude: 42.3390, longitude: -83.0485 },
  { team: "Kansas City Royals", venue: "Kauffman Stadium", city: "Kansas City", province: "MO", league: "MLB", latitude: 39.0517, longitude: -94.4803 },
  { team: "Minnesota Twins", venue: "Target Field", city: "Minneapolis", province: "MN", league: "MLB", latitude: 44.9818, longitude: -93.2775 },
  { team: "Chicago White Sox", venue: "Guaranteed Rate Field", city: "Chicago", province: "IL", league: "MLB", latitude: 41.8300, longitude: -87.6339 },
  // AL West
  { team: "Houston Astros", venue: "Minute Maid Park", city: "Houston", province: "TX", league: "MLB", latitude: 29.7573, longitude: -95.3555 },
  { team: "Texas Rangers", venue: "Globe Life Field", city: "Arlington", province: "TX", league: "MLB", latitude: 32.7473, longitude: -97.0845 },
  { team: "Seattle Mariners", venue: "T-Mobile Park", city: "Seattle", province: "WA", league: "MLB", latitude: 47.5914, longitude: -122.3326 },
  { team: "Los Angeles Angels", venue: "Angel Stadium", city: "Anaheim", province: "CA", league: "MLB", latitude: 33.8003, longitude: -117.8827 },
  { team: "Oakland Athletics", venue: "Oakland Coliseum", city: "Oakland", province: "CA", league: "MLB", latitude: 37.7516, longitude: -122.2005 },
  // NL East
  { team: "Atlanta Braves", venue: "Truist Park", city: "Atlanta", province: "GA", league: "MLB", latitude: 33.8908, longitude: -84.4678 },
  { team: "New York Mets", venue: "Citi Field", city: "New York", province: "NY", league: "MLB", latitude: 40.7571, longitude: -73.8458 },
  { team: "Philadelphia Phillies", venue: "Citizens Bank Park", city: "Philadelphia", province: "PA", league: "MLB", latitude: 39.9061, longitude: -75.1665 },
  { team: "Miami Marlins", venue: "LoanDepot Park", city: "Miami", province: "FL", league: "MLB", latitude: 25.7781, longitude: -80.2197 },
  { team: "Washington Nationals", venue: "Nationals Park", city: "Washington", province: "DC", league: "MLB", latitude: 38.8730, longitude: -77.0074 },
  // NL Central
  { team: "Chicago Cubs", venue: "Wrigley Field", city: "Chicago", province: "IL", league: "MLB", latitude: 41.9484, longitude: -87.6553 },
  { team: "Milwaukee Brewers", venue: "American Family Field", city: "Milwaukee", province: "WI", league: "MLB", latitude: 43.0280, longitude: -87.9712 },
  { team: "St. Louis Cardinals", venue: "Busch Stadium", city: "St. Louis", province: "MO", league: "MLB", latitude: 38.6226, longitude: -90.1928 },
  { team: "Cincinnati Reds", venue: "Great American Ball Park", city: "Cincinnati", province: "OH", league: "MLB", latitude: 39.0975, longitude: -84.5085 },
  { team: "Pittsburgh Pirates", venue: "PNC Park", city: "Pittsburgh", province: "PA", league: "MLB", latitude: 40.4469, longitude: -80.0058 },
  // NL West
  { team: "Los Angeles Dodgers", venue: "Dodger Stadium", city: "Los Angeles", province: "CA", league: "MLB", latitude: 34.0739, longitude: -118.2400 },
  { team: "San Diego Padres", venue: "Petco Park", city: "San Diego", province: "CA", league: "MLB", latitude: 32.7076, longitude: -117.1570 },
  { team: "San Francisco Giants", venue: "Oracle Park", city: "San Francisco", province: "CA", league: "MLB", latitude: 37.7786, longitude: -122.3893 },
  { team: "Arizona Diamondbacks", venue: "Chase Field", city: "Phoenix", province: "AZ", league: "MLB", latitude: 33.4455, longitude: -112.0667 },
  { team: "Colorado Rockies", venue: "Coors Field", city: "Denver", province: "CO", league: "MLB", latitude: 39.7559, longitude: -104.9942 },

  // ===== NFL =====
  // AFC East
  { team: "Buffalo Bills", venue: "Highmark Stadium", city: "Orchard Park", province: "NY", league: "NFL", latitude: 42.7738, longitude: -78.7870 },
  { team: "Miami Dolphins", venue: "Hard Rock Stadium", city: "Miami Gardens", province: "FL", league: "NFL", latitude: 25.9580, longitude: -80.2389 },
  { team: "New England Patriots", venue: "Gillette Stadium", city: "Foxborough", province: "MA", league: "NFL", latitude: 42.0909, longitude: -71.2643 },
  { team: "New York Jets", venue: "MetLife Stadium", city: "East Rutherford", province: "NJ", league: "NFL", latitude: 40.8128, longitude: -74.0742 },
  // AFC North
  { team: "Baltimore Ravens", venue: "M&T Bank Stadium", city: "Baltimore", province: "MD", league: "NFL", latitude: 39.2780, longitude: -76.6227 },
  { team: "Cincinnati Bengals", venue: "Paycor Stadium", city: "Cincinnati", province: "OH", league: "NFL", latitude: 39.0955, longitude: -84.5161 },
  { team: "Cleveland Browns", venue: "Cleveland Browns Stadium", city: "Cleveland", province: "OH", league: "NFL", latitude: 41.5061, longitude: -81.6995 },
  { team: "Pittsburgh Steelers", venue: "Acrisure Stadium", city: "Pittsburgh", province: "PA", league: "NFL", latitude: 40.4468, longitude: -80.0158 },
  // AFC South
  { team: "Houston Texans", venue: "NRG Stadium", city: "Houston", province: "TX", league: "NFL", latitude: 29.6847, longitude: -95.4107 },
  { team: "Indianapolis Colts", venue: "Lucas Oil Stadium", city: "Indianapolis", province: "IN", league: "NFL", latitude: 39.7601, longitude: -86.1639 },
  { team: "Jacksonville Jaguars", venue: "EverBank Stadium", city: "Jacksonville", province: "FL", league: "NFL", latitude: 30.3239, longitude: -81.6373 },
  { team: "Tennessee Titans", venue: "Nissan Stadium", city: "Nashville", province: "TN", league: "NFL", latitude: 36.1665, longitude: -86.7713 },
  // AFC West
  { team: "Denver Broncos", venue: "Empower Field at Mile High", city: "Denver", province: "CO", league: "NFL", latitude: 39.7439, longitude: -105.0201 },
  { team: "Kansas City Chiefs", venue: "GEHA Field at Arrowhead Stadium", city: "Kansas City", province: "MO", league: "NFL", latitude: 39.0489, longitude: -94.4839 },
  { team: "Los Angeles Chargers", venue: "SoFi Stadium", city: "Inglewood", province: "CA", league: "NFL", latitude: 33.9535, longitude: -118.3392 },
  { team: "Las Vegas Raiders", venue: "Allegiant Stadium", city: "Las Vegas", province: "NV", league: "NFL", latitude: 36.0909, longitude: -115.1833 },
  // NFC East
  { team: "Dallas Cowboys", venue: "AT&T Stadium", city: "Arlington", province: "TX", league: "NFL", latitude: 32.7473, longitude: -97.0945 },
  { team: "New York Giants", venue: "MetLife Stadium", city: "East Rutherford", province: "NJ", league: "NFL", latitude: 40.8128, longitude: -74.0742 },
  { team: "Philadelphia Eagles", venue: "Lincoln Financial Field", city: "Philadelphia", province: "PA", league: "NFL", latitude: 39.9008, longitude: -75.1675 },
  { team: "Washington Commanders", venue: "Northwest Stadium", city: "Landover", province: "MD", league: "NFL", latitude: 38.9076, longitude: -76.8645 },
  // NFC North
  { team: "Chicago Bears", venue: "Soldier Field", city: "Chicago", province: "IL", league: "NFL", latitude: 41.8623, longitude: -87.6167 },
  { team: "Detroit Lions", venue: "Ford Field", city: "Detroit", province: "MI", league: "NFL", latitude: 42.3400, longitude: -83.0456 },
  { team: "Green Bay Packers", venue: "Lambeau Field", city: "Green Bay", province: "WI", league: "NFL", latitude: 44.5013, longitude: -88.0622 },
  { team: "Minnesota Vikings", venue: "U.S. Bank Stadium", city: "Minneapolis", province: "MN", league: "NFL", latitude: 44.9736, longitude: -93.2575 },
  // NFC South
  { team: "Atlanta Falcons", venue: "Mercedes-Benz Stadium", city: "Atlanta", province: "GA", league: "NFL", latitude: 33.7554, longitude: -84.4010 },
  { team: "Carolina Panthers", venue: "Bank of America Stadium", city: "Charlotte", province: "NC", league: "NFL", latitude: 35.2258, longitude: -80.8528 },
  { team: "New Orleans Saints", venue: "Caesars Superdome", city: "New Orleans", province: "LA", league: "NFL", latitude: 29.9511, longitude: -90.0812 },
  { team: "Tampa Bay Buccaneers", venue: "Raymond James Stadium", city: "Tampa", province: "FL", league: "NFL", latitude: 27.9759, longitude: -82.5033 },
  // NFC West
  { team: "Arizona Cardinals", venue: "State Farm Stadium", city: "Glendale", province: "AZ", league: "NFL", latitude: 33.5276, longitude: -112.2626 },
  { team: "Los Angeles Rams", venue: "SoFi Stadium", city: "Inglewood", province: "CA", league: "NFL", latitude: 33.9535, longitude: -118.3392 },
  { team: "San Francisco 49ers", venue: "Levi's Stadium", city: "Santa Clara", province: "CA", league: "NFL", latitude: 37.4033, longitude: -121.9694 },
  { team: "Seattle Seahawks", venue: "Lumen Field", city: "Seattle", province: "WA", league: "NFL", latitude: 47.5952, longitude: -122.3316 },

  // ===== MLS =====
  // Eastern
  { team: "Atlanta United FC", venue: "Mercedes-Benz Stadium", city: "Atlanta", province: "GA", league: "MLS", latitude: 33.7554, longitude: -84.4010 },
  { team: "Charlotte FC", venue: "Bank of America Stadium", city: "Charlotte", province: "NC", league: "MLS", latitude: 35.2258, longitude: -80.8528 },
  { team: "Chicago Fire FC", venue: "Soldier Field", city: "Chicago", province: "IL", league: "MLS", latitude: 41.8623, longitude: -87.6167 },
  { team: "FC Cincinnati", venue: "TQL Stadium", city: "Cincinnati", province: "OH", league: "MLS", latitude: 39.1110, longitude: -84.5219 },
  { team: "Columbus Crew", venue: "Lower.com Field", city: "Columbus", province: "OH", league: "MLS", latitude: 39.9685, longitude: -83.0170 },
  { team: "D.C. United", venue: "Audi Field", city: "Washington", province: "DC", league: "MLS", latitude: 38.8687, longitude: -77.0128 },
  { team: "Inter Miami CF", venue: "Chase Stadium", city: "Fort Lauderdale", province: "FL", league: "MLS", latitude: 26.1929, longitude: -80.1601 },
  { team: "CF Montréal", venue: "Saputo Stadium", city: "Montreal", province: "QC", league: "MLS", latitude: 45.5622, longitude: -73.5528 },
  { team: "Nashville SC", venue: "GEODIS Park", city: "Nashville", province: "TN", league: "MLS", latitude: 36.1303, longitude: -86.7656 },
  { team: "New England Revolution", venue: "Gillette Stadium", city: "Foxborough", province: "MA", league: "MLS", latitude: 42.0909, longitude: -71.2643 },
  { team: "New York City FC", venue: "Yankee Stadium", city: "New York", province: "NY", league: "MLS", latitude: 40.8296, longitude: -73.9262 },
  { team: "New York Red Bulls", venue: "Red Bull Arena", city: "Harrison", province: "NJ", league: "MLS", latitude: 40.7368, longitude: -74.1503 },
  { team: "Orlando City SC", venue: "Exploria Stadium", city: "Orlando", province: "FL", league: "MLS", latitude: 28.5411, longitude: -81.3893 },
  { team: "Philadelphia Union", venue: "Subaru Park", city: "Chester", province: "PA", league: "MLS", latitude: 39.8328, longitude: -75.3789 },
  { team: "Toronto FC", venue: "BMO Field", city: "Toronto", province: "ON", league: "MLS", latitude: 43.6332, longitude: -79.4186 },
  // Western
  { team: "Austin FC", venue: "Q2 Stadium", city: "Austin", province: "TX", league: "MLS", latitude: 30.3881, longitude: -97.7191 },
  { team: "Colorado Rapids", venue: "Dick's Sporting Goods Park", city: "Commerce City", province: "CO", league: "MLS", latitude: 39.8056, longitude: -104.8920 },
  { team: "FC Dallas", venue: "Toyota Stadium", city: "Frisco", province: "TX", league: "MLS", latitude: 33.1543, longitude: -96.8353 },
  { team: "Houston Dynamo FC", venue: "Shell Energy Stadium", city: "Houston", province: "TX", league: "MLS", latitude: 29.7522, longitude: -95.3524 },
  { team: "LA Galaxy", venue: "Dignity Health Sports Park", city: "Carson", province: "CA", league: "MLS", latitude: 33.8644, longitude: -118.2611 },
  { team: "Los Angeles FC", venue: "BMO Stadium", city: "Los Angeles", province: "CA", league: "MLS", latitude: 34.0128, longitude: -118.2847 },
  { team: "Minnesota United FC", venue: "Allianz Field", city: "Saint Paul", province: "MN", league: "MLS", latitude: 44.9531, longitude: -93.1652 },
  { team: "Portland Timbers", venue: "Providence Park", city: "Portland", province: "OR", league: "MLS", latitude: 45.5215, longitude: -122.6916 },
  { team: "Real Salt Lake", venue: "America First Field", city: "Sandy", province: "UT", league: "MLS", latitude: 40.5830, longitude: -111.8934 },
  { team: "San Jose Earthquakes", venue: "PayPal Park", city: "San Jose", province: "CA", league: "MLS", latitude: 37.3512, longitude: -121.9250 },
  { team: "Seattle Sounders FC", venue: "Lumen Field", city: "Seattle", province: "WA", league: "MLS", latitude: 47.5952, longitude: -122.3316 },
  { team: "Sporting Kansas City", venue: "Children's Mercy Park", city: "Kansas City", province: "KS", league: "MLS", latitude: 39.1218, longitude: -94.8233 },
  { team: "St. Louis City SC", venue: "CityPark", city: "St. Louis", province: "MO", league: "MLS", latitude: 38.6327, longitude: -90.2093 },
  { team: "Vancouver Whitecaps FC", venue: "BC Place", city: "Vancouver", province: "BC", league: "MLS", latitude: 49.2768, longitude: -123.1118 },

  // ===== CFL =====
  { team: "Toronto Argonauts", venue: "BMO Field", city: "Toronto", province: "ON", league: "CFL", latitude: 43.6332, longitude: -79.4186 },
  { team: "Hamilton Tiger-Cats", venue: "Tim Hortons Field", city: "Hamilton", province: "ON", league: "CFL", latitude: 43.2543, longitude: -79.8327 },
  { team: "Ottawa Redblacks", venue: "TD Place Stadium", city: "Ottawa", province: "ON", league: "CFL", latitude: 45.3985, longitude: -75.6837 },
  { team: "Montreal Alouettes", venue: "Percival Molson Memorial Stadium", city: "Montreal", province: "QC", league: "CFL", latitude: 45.5112, longitude: -73.5814 },
  { team: "Winnipeg Blue Bombers", venue: "IG Field", city: "Winnipeg", province: "MB", league: "CFL", latitude: 49.8076, longitude: -97.1454 },
  { team: "Saskatchewan Roughriders", venue: "Mosaic Stadium", city: "Regina", province: "SK", league: "CFL", latitude: 50.4543, longitude: -104.5851 },
  { team: "Calgary Stampeders", venue: "McMahon Stadium", city: "Calgary", province: "AB", league: "CFL", latitude: 51.0704, longitude: -114.1213 },
  { team: "Edmonton Elks", venue: "Commonwealth Stadium", city: "Edmonton", province: "AB", league: "CFL", latitude: 53.5594, longitude: -113.4762 },
  { team: "BC Lions", venue: "BC Place", city: "Vancouver", province: "BC", league: "CFL", latitude: 49.2768, longitude: -123.1118 },

  // ===== WNBA =====
  // Eastern
  { team: "New York Liberty", venue: "Barclays Center", city: "Brooklyn", province: "NY", league: "WNBA", latitude: 40.6826, longitude: -73.9754 },
  { team: "Connecticut Sun", venue: "Mohegan Sun Arena", city: "Uncasville", province: "CT", league: "WNBA", latitude: 41.4929, longitude: -72.0898 },
  { team: "Indiana Fever", venue: "Gainbridge Fieldhouse", city: "Indianapolis", province: "IN", league: "WNBA", latitude: 39.7641, longitude: -86.1555 },
  { team: "Atlanta Dream", venue: "Gateway Center Arena", city: "College Park", province: "GA", league: "WNBA", latitude: 33.6487, longitude: -84.4471 },
  { team: "Washington Mystics", venue: "Entertainment & Sports Arena", city: "Washington", province: "DC", league: "WNBA", latitude: 38.8689, longitude: -76.9731 },
  { team: "Chicago Sky", venue: "Wintrust Arena", city: "Chicago", province: "IL", league: "WNBA", latitude: 41.8557, longitude: -87.6164 },
  { team: "Toronto Tempo", venue: "Scotiabank Arena", city: "Toronto", province: "ON", league: "WNBA", latitude: 43.6435, longitude: -79.3791 },
  // Western
  { team: "Las Vegas Aces", venue: "Michelob Ultra Arena", city: "Las Vegas", province: "NV", league: "WNBA", latitude: 36.0909, longitude: -115.1761 },
  { team: "Seattle Storm", venue: "Climate Pledge Arena", city: "Seattle", province: "WA", league: "WNBA", latitude: 47.6221, longitude: -122.3541 },
  { team: "Phoenix Mercury", venue: "Footprint Center", city: "Phoenix", province: "AZ", league: "WNBA", latitude: 33.4457, longitude: -112.0712 },
  { team: "Los Angeles Sparks", venue: "Crypto.com Arena", city: "Los Angeles", province: "CA", league: "WNBA", latitude: 34.0430, longitude: -118.2673 },
  { team: "Minnesota Lynx", venue: "Target Center", city: "Minneapolis", province: "MN", league: "WNBA", latitude: 44.9795, longitude: -93.2761 },
  { team: "Dallas Wings", venue: "College Park Center", city: "Arlington", province: "TX", league: "WNBA", latitude: 32.7309, longitude: -97.1083 },
  { team: "Golden State Valkyries", venue: "Chase Center", city: "San Francisco", province: "CA", league: "WNBA", latitude: 37.7680, longitude: -122.3877 },
];

export const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT", "NY"];

export const LEAGUES_LIST = ["NHL", "NBA", "WNBA", "MLB", "NFL", "MLS", "CFL"];
