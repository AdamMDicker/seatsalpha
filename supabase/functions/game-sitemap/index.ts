import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
};

// Map league to route prefix and team search terms
const LEAGUE_TEAMS: Record<string, { route: string; teams: { slug: string; searchTerm: string }[] }> = {
  mlb: {
    route: "mlb",
    teams: [
      { slug: "blue-jays", searchTerm: "Blue Jays" },
      { slug: "yankees", searchTerm: "Yankees" },
      { slug: "red-sox", searchTerm: "Red Sox" },
      { slug: "rays", searchTerm: "Rays" },
      { slug: "orioles", searchTerm: "Orioles" },
      { slug: "white-sox", searchTerm: "White Sox" },
      { slug: "guardians", searchTerm: "Guardians" },
      { slug: "tigers", searchTerm: "Tigers" },
      { slug: "royals", searchTerm: "Royals" },
      { slug: "twins", searchTerm: "Twins" },
      { slug: "astros", searchTerm: "Astros" },
      { slug: "angels", searchTerm: "Angels" },
      { slug: "athletics", searchTerm: "Athletics" },
      { slug: "mariners", searchTerm: "Mariners" },
      { slug: "rangers", searchTerm: "Rangers" },
      { slug: "mets", searchTerm: "Mets" },
      { slug: "braves", searchTerm: "Braves" },
      { slug: "phillies", searchTerm: "Phillies" },
      { slug: "marlins", searchTerm: "Marlins" },
      { slug: "nationals", searchTerm: "Nationals" },
      { slug: "cubs", searchTerm: "Cubs" },
      { slug: "brewers", searchTerm: "Brewers" },
      { slug: "cardinals", searchTerm: "Cardinals" },
      { slug: "reds", searchTerm: "Reds" },
      { slug: "pirates", searchTerm: "Pirates" },
      { slug: "dodgers", searchTerm: "Dodgers" },
      { slug: "padres", searchTerm: "Padres" },
      { slug: "giants", searchTerm: "Giants" },
      { slug: "diamondbacks", searchTerm: "Diamondbacks" },
      { slug: "rockies", searchTerm: "Rockies" },
    ],
  },
  nhl: {
    route: "nhl",
    teams: [
      { slug: "maple-leafs", searchTerm: "Maple Leafs" },
      { slug: "canadiens", searchTerm: "Canadiens" },
      { slug: "senators", searchTerm: "Senators" },
      { slug: "bruins", searchTerm: "Bruins" },
      { slug: "red-wings", searchTerm: "Red Wings" },
      { slug: "sabres", searchTerm: "Sabres" },
      { slug: "panthers", searchTerm: "Panthers" },
      { slug: "lightning", searchTerm: "Lightning" },
      { slug: "rangers", searchTerm: "Rangers" },
      { slug: "islanders", searchTerm: "Islanders" },
      { slug: "devils", searchTerm: "Devils" },
      { slug: "penguins", searchTerm: "Penguins" },
      { slug: "capitals", searchTerm: "Capitals" },
      { slug: "flyers", searchTerm: "Flyers" },
      { slug: "hurricanes", searchTerm: "Hurricanes" },
      { slug: "blue-jackets", searchTerm: "Blue Jackets" },
      { slug: "blackhawks", searchTerm: "Blackhawks" },
      { slug: "blues", searchTerm: "Blues" },
      { slug: "predators", searchTerm: "Predators" },
      { slug: "stars", searchTerm: "Stars" },
      { slug: "wild", searchTerm: "Wild" },
      { slug: "jets", searchTerm: "Jets" },
      { slug: "avalanche", searchTerm: "Avalanche" },
      { slug: "oilers", searchTerm: "Oilers" },
      { slug: "flames", searchTerm: "Flames" },
      { slug: "canucks", searchTerm: "Canucks" },
      { slug: "kraken", searchTerm: "Kraken" },
      { slug: "sharks", searchTerm: "Sharks" },
      { slug: "kings", searchTerm: "Kings" },
      { slug: "ducks", searchTerm: "Ducks" },
      { slug: "golden-knights", searchTerm: "Golden Knights" },
      { slug: "utah-hc", searchTerm: "Utah" },
    ],
  },
  nba: {
    route: "nba",
    teams: [
      { slug: "raptors", searchTerm: "Raptors" },
      { slug: "celtics", searchTerm: "Celtics" },
      { slug: "nets", searchTerm: "Nets" },
      { slug: "knicks", searchTerm: "Knicks" },
      { slug: "76ers", searchTerm: "76ers" },
      { slug: "bulls", searchTerm: "Bulls" },
      { slug: "cavaliers", searchTerm: "Cavaliers" },
      { slug: "pistons", searchTerm: "Pistons" },
      { slug: "pacers", searchTerm: "Pacers" },
      { slug: "bucks", searchTerm: "Bucks" },
      { slug: "hawks", searchTerm: "Hawks" },
      { slug: "hornets", searchTerm: "Hornets" },
      { slug: "heat", searchTerm: "Heat" },
      { slug: "magic", searchTerm: "Magic" },
      { slug: "wizards", searchTerm: "Wizards" },
      { slug: "nuggets", searchTerm: "Nuggets" },
      { slug: "timberwolves", searchTerm: "Timberwolves" },
      { slug: "thunder", searchTerm: "Thunder" },
      { slug: "trail-blazers", searchTerm: "Trail Blazers" },
      { slug: "jazz", searchTerm: "Jazz" },
      { slug: "warriors", searchTerm: "Warriors" },
      { slug: "clippers", searchTerm: "Clippers" },
      { slug: "lakers", searchTerm: "Lakers" },
      { slug: "suns", searchTerm: "Suns" },
      { slug: "kings", searchTerm: "Kings" },
      { slug: "mavericks", searchTerm: "Mavericks" },
      { slug: "rockets", searchTerm: "Rockets" },
      { slug: "grizzlies", searchTerm: "Grizzlies" },
      { slug: "pelicans", searchTerm: "Pelicans" },
      { slug: "spurs", searchTerm: "Spurs" },
    ],
  },
  nfl: {
    route: "nfl",
    teams: [
      { slug: "bills", searchTerm: "Bills" },
      { slug: "dolphins", searchTerm: "Dolphins" },
      { slug: "patriots", searchTerm: "Patriots" },
      { slug: "jets", searchTerm: "Jets" },
      { slug: "ravens", searchTerm: "Ravens" },
      { slug: "bengals", searchTerm: "Bengals" },
      { slug: "browns", searchTerm: "Browns" },
      { slug: "steelers", searchTerm: "Steelers" },
      { slug: "texans", searchTerm: "Texans" },
      { slug: "colts", searchTerm: "Colts" },
      { slug: "jaguars", searchTerm: "Jaguars" },
      { slug: "titans", searchTerm: "Titans" },
      { slug: "broncos", searchTerm: "Broncos" },
      { slug: "chiefs", searchTerm: "Chiefs" },
      { slug: "raiders", searchTerm: "Raiders" },
      { slug: "chargers", searchTerm: "Chargers" },
      { slug: "cowboys", searchTerm: "Cowboys" },
      { slug: "giants", searchTerm: "Giants" },
      { slug: "eagles", searchTerm: "Eagles" },
      { slug: "commanders", searchTerm: "Commanders" },
      { slug: "bears", searchTerm: "Bears" },
      { slug: "lions", searchTerm: "Lions" },
      { slug: "packers", searchTerm: "Packers" },
      { slug: "vikings", searchTerm: "Vikings" },
      { slug: "falcons", searchTerm: "Falcons" },
      { slug: "panthers", searchTerm: "Panthers" },
      { slug: "saints", searchTerm: "Saints" },
      { slug: "buccaneers", searchTerm: "Buccaneers" },
      { slug: "cardinals", searchTerm: "Cardinals" },
      { slug: "rams", searchTerm: "Rams" },
      { slug: "49ers", searchTerm: "49ers" },
      { slug: "seahawks", searchTerm: "Seahawks" },
    ],
  },
  mls: {
    route: "mls",
    teams: [
      { slug: "toronto-fc", searchTerm: "Toronto FC" },
      { slug: "cf-montreal", searchTerm: "CF Montréal" },
      { slug: "vancouver-whitecaps", searchTerm: "Vancouver Whitecaps" },
      { slug: "atlanta-united", searchTerm: "Atlanta United" },
      { slug: "charlotte-fc", searchTerm: "Charlotte FC" },
      { slug: "chicago-fire", searchTerm: "Chicago Fire" },
      { slug: "fc-cincinnati", searchTerm: "FC Cincinnati" },
      { slug: "columbus-crew", searchTerm: "Columbus Crew" },
      { slug: "dc-united", searchTerm: "D.C. United" },
      { slug: "inter-miami", searchTerm: "Inter Miami" },
      { slug: "nashville-sc", searchTerm: "Nashville SC" },
      { slug: "new-england-revolution", searchTerm: "New England Revolution" },
      { slug: "nycfc", searchTerm: "NYCFC" },
      { slug: "new-york-red-bulls", searchTerm: "New York Red Bulls" },
      { slug: "orlando-city", searchTerm: "Orlando City" },
      { slug: "philadelphia-union", searchTerm: "Philadelphia Union" },
    ],
  },
  cfl: {
    route: "cfl",
    teams: [
      { slug: "bc-lions", searchTerm: "BC Lions" },
      { slug: "calgary-stampeders", searchTerm: "Calgary Stampeders" },
      { slug: "edmonton-elks", searchTerm: "Edmonton Elks" },
      { slug: "saskatchewan-roughriders", searchTerm: "Saskatchewan Roughriders" },
      { slug: "winnipeg-blue-bombers", searchTerm: "Winnipeg Blue Bombers" },
      { slug: "hamilton-tiger-cats", searchTerm: "Hamilton Tiger-Cats" },
      { slug: "montreal-alouettes", searchTerm: "Montreal Alouettes" },
      { slug: "ottawa-redblacks", searchTerm: "Ottawa Redblacks" },
      { slug: "toronto-argonauts", searchTerm: "Toronto Argonauts" },
    ],
  },
  wnba: {
    route: "wnba",
    teams: [
      { slug: "aces-ny", searchTerm: "Liberty" },
      { slug: "sun", searchTerm: "Sun" },
      { slug: "fever", searchTerm: "Fever" },
      { slug: "dream", searchTerm: "Dream" },
      { slug: "mystics", searchTerm: "Mystics" },
      { slug: "sky", searchTerm: "Sky" },
      { slug: "lynx", searchTerm: "Lynx" },
      { slug: "aces", searchTerm: "Aces" },
      { slug: "storm", searchTerm: "Storm" },
      { slug: "mercury", searchTerm: "Mercury" },
      { slug: "sparks", searchTerm: "Sparks" },
      { slug: "wings", searchTerm: "Wings" },
    ],
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const league = url.searchParams.get("league");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    // If a specific league is requested, only generate for that league
    const leaguesToProcess = league && LEAGUE_TEAMS[league]
      ? { [league]: LEAGUE_TEAMS[league] }
      : LEAGUE_TEAMS;

    // Fetch all future events in one query
    const { data: events } = await supabase
      .from("events")
      .select("id, title, event_date")
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(5000);

    let urls = "";

    for (const [leagueKey, config] of Object.entries(leaguesToProcess)) {
      for (const team of config.teams) {
        // Find events matching this team's searchTerm
        const teamEvents = (events || []).filter((e) =>
          e.title.includes(team.searchTerm)
        );
        for (const event of teamEvents) {
          const date = event.event_date.split("T")[0];
          urls += `
  <url>
    <loc>https://seats.ca/teams/${config.route}/${team.slug}?game=${event.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Error generating sitemap", { status: 500 });
  }
});
