import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeagueRow {
  league: string;
  is_visible: boolean;
  ticketCount?: number;
}

const AdminLeagueVisibility = () => {
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    // Fetch visibility settings
    const { data: visData } = await supabase
      .from("league_visibility")
      .select("*")
      .order("league");

    if (!visData) { setLoading(false); return; }

    // Fetch ticket counts per league by checking events with active tickets
    const { data: events } = await supabase
      .from("events")
      .select("id, title");

    const { data: tickets } = await supabase
      .from("tickets")
      .select("event_id, quantity, quantity_sold")
      .eq("is_active", true);

    // Map event IDs to available ticket count
    const eventTickets: Record<string, number> = {};
    tickets?.forEach((t) => {
      const avail = t.quantity - t.quantity_sold;
      if (avail > 0) eventTickets[t.event_id] = (eventTickets[t.event_id] || 0) + avail;
    });

    // Determine league by team name keywords in event titles
    const leagueKeywords: Record<string, string[]> = {
      MLB: ["Blue Jays", "Yankees", "Red Sox", "Dodgers", "Cubs", "Mets", "Braves", "Astros", "Phillies", "Padres", "Cardinals", "Giants", "Guardians", "Orioles", "Twins", "Mariners", "Rangers", "Rays", "Tigers", "Royals", "Brewers", "Diamondbacks", "Pirates", "Reds", "Rockies", "Angels", "Athletics", "White Sox", "Marlins", "Nationals"],
      NHL: ["Maple Leafs", "Canadiens", "Senators", "Jets", "Flames", "Oilers", "Canucks", "Bruins", "Rangers", "Penguins", "Blackhawks", "Lightning", "Panthers", "Hurricanes", "Devils", "Islanders", "Capitals", "Flyers", "Blue Jackets", "Red Wings", "Sabres", "Predators", "Stars", "Wild", "Blues", "Avalanche", "Golden Knights", "Kraken", "Kings", "Ducks", "Sharks", "Utah HC"],
      NBA: ["Raptors", "Celtics", "Lakers", "Warriors", "Bucks", "76ers", "Nets", "Knicks", "Heat", "Bulls", "Cavaliers", "Hawks", "Mavericks", "Suns", "Nuggets", "Clippers", "Thunder", "Grizzlies", "Kings", "Pelicans", "Trail Blazers", "Timberwolves", "Pacers", "Hornets", "Wizards", "Pistons", "Magic", "Spurs", "Jazz", "Rockets"],
      NFL: ["Bills", "Dolphins", "Patriots", "Jets", "Ravens", "Bengals", "Browns", "Steelers", "Texans", "Colts", "Jaguars", "Titans", "Broncos", "Chiefs", "Raiders", "Chargers", "Cowboys", "Giants", "Eagles", "Commanders", "Bears", "Lions", "Packers", "Vikings", "Falcons", "Panthers", "Saints", "Buccaneers", "Cardinals", "Rams", "49ers", "Seahawks"],
      MLS: ["Toronto FC", "Inter Miami", "LAFC", "Nashville SC", "FC Cincinnati"],
      CFL: ["Argonauts", "Tiger-Cats", "Redblacks", "Alouettes", "ELKS", "Stampeders", "Blue Bombers", "Roughriders", "Lions"],
      WNBA: ["Liberty", "Aces", "Storm", "Sun", "Lynx", "Fever", "Mercury", "Wings", "Sky", "Mystics", "Sparks", "Dream", "Valkyries", "Tempo"],
    };

    // Count tickets per league
    const leagueCounts: Record<string, number> = {};
    events?.forEach((ev) => {
      const count = eventTickets[ev.id] || 0;
      if (count === 0) return;
      for (const [league, keywords] of Object.entries(leagueKeywords)) {
        if (keywords.some((kw) => ev.title.toLowerCase().includes(kw.toLowerCase()))) {
          leagueCounts[league] = (leagueCounts[league] || 0) + count;
          break;
        }
      }
    });

    setLeagues(
      visData.map((v) => ({
        league: v.league,
        is_visible: v.is_visible,
        ticketCount: leagueCounts[v.league] || 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleLeague = async (league: string, visible: boolean) => {
    setLeagues((prev) => prev.map((l) => (l.league === league ? { ...l, is_visible: visible } : l)));
    const { error } = await supabase
      .from("league_visibility")
      .update({ is_visible: visible, updated_at: new Date().toISOString() })
      .eq("league", league);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      fetchData();
    } else {
      toast({ title: `${league} ${visible ? "shown" : "hidden"}` });
    }
  };

  const hideAllEmpty = async () => {
    const empty = leagues.filter((l) => l.ticketCount === 0);
    if (empty.length === 0) {
      toast({ title: "All leagues have inventory" });
      return;
    }
    for (const l of empty) {
      await supabase
        .from("league_visibility")
        .update({ is_visible: false, updated_at: new Date().toISOString() })
        .eq("league", l.league);
    }
    toast({ title: `Hidden ${empty.length} empty league(s)` });
    fetchData();
  };

  const showAll = async () => {
    await supabase
      .from("league_visibility")
      .update({ is_visible: true, updated_at: new Date().toISOString() })
      .neq("league", "");
    toast({ title: "All leagues visible" });
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="destructive" size="sm" onClick={hideAllEmpty}>
          <EyeOff className="h-4 w-4 mr-1" /> Hide All Empty Leagues
        </Button>
        <Button variant="secondary" size="sm" onClick={showAll}>
          <Eye className="h-4 w-4 mr-1" /> Show All
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leagues.map((l) => (
          <div
            key={l.league}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              l.is_visible ? "bg-card border-border" : "bg-muted/50 border-border/50 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{l.league}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  {l.ticketCount} tickets available
                </span>
              </div>
            </div>
            <Switch
              checked={l.is_visible}
              onCheckedChange={(v) => toggleLeague(l.league, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLeagueVisibility;
