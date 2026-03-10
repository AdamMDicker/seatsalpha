import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MLB_TEAMS_CONFIG } from "@/data/mlbTeams";
import { NHL_TEAMS_CONFIG } from "@/data/nhlTeams";
import { NBA_TEAMS_CONFIG } from "@/data/nbaTeams";
import { NFL_TEAMS_CONFIG } from "@/data/nflTeams";
import { MLS_TEAMS_CONFIG } from "@/data/mlsTeams";
import { CFL_TEAMS_CONFIG } from "@/data/cflTeams";
import { WNBA_TEAMS_CONFIG } from "@/data/wnbaTeams";

interface LeagueRow {
  league: string;
  is_visible: boolean;
  ticketCount?: number;
}

const LEAGUE_TEAMS: Record<string, { slug: string; name: string }[]> = {
  MLB: MLB_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
  NHL: NHL_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
  NBA: NBA_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
  NFL: NFL_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
  MLS: MLS_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
  CFL: CFL_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
  WNBA: WNBA_TEAMS_CONFIG.map((t) => ({ slug: t.slug, name: t.name })),
};

const AdminLeagueVisibility = () => {
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [singleTeamSettings, setSingleTeamSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: visData } = await supabase
      .from("league_visibility")
      .select("*")
      .order("league");

    if (!visData) { setLoading(false); return; }

    // Fetch single-team settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .like("key", "%_single_team");

    const stSettings: Record<string, string> = {};
    settings?.forEach((s) => {
      const league = s.key.replace("_single_team", "").toUpperCase();
      stSettings[league] = s.value;
    });
    setSingleTeamSettings(stSettings);

    const { data: events } = await supabase
      .from("events")
      .select("id, title");

    const { data: tickets } = await supabase
      .from("tickets")
      .select("event_id, quantity, quantity_sold")
      .eq("is_active", true);

    const eventTickets: Record<string, number> = {};
    tickets?.forEach((t) => {
      const avail = t.quantity - t.quantity_sold;
      if (avail > 0) eventTickets[t.event_id] = (eventTickets[t.event_id] || 0) + avail;
    });

    const leagueKeywords: Record<string, string[]> = {
      MLB: ["Blue Jays", "Yankees", "Red Sox", "Dodgers", "Cubs", "Mets", "Braves", "Astros", "Phillies", "Padres", "Cardinals", "Giants", "Guardians", "Orioles", "Twins", "Mariners", "Rangers", "Rays", "Tigers", "Royals", "Brewers", "Diamondbacks", "Pirates", "Reds", "Rockies", "Angels", "Athletics", "White Sox", "Marlins", "Nationals"],
      NHL: ["Maple Leafs", "Canadiens", "Senators", "Jets", "Flames", "Oilers", "Canucks", "Bruins", "Rangers", "Penguins", "Blackhawks", "Lightning", "Panthers", "Hurricanes", "Devils", "Islanders", "Capitals", "Flyers", "Blue Jackets", "Red Wings", "Sabres", "Predators", "Stars", "Wild", "Blues", "Avalanche", "Golden Knights", "Kraken", "Kings", "Ducks", "Sharks", "Utah HC"],
      NBA: ["Raptors", "Celtics", "Lakers", "Warriors", "Bucks", "76ers", "Nets", "Knicks", "Heat", "Bulls", "Cavaliers", "Hawks", "Mavericks", "Suns", "Nuggets", "Clippers", "Thunder", "Grizzlies", "Kings", "Pelicans", "Trail Blazers", "Timberwolves", "Pacers", "Hornets", "Wizards", "Pistons", "Magic", "Spurs", "Jazz", "Rockets"],
      NFL: ["Bills", "Dolphins", "Patriots", "Jets", "Ravens", "Bengals", "Browns", "Steelers", "Texans", "Colts", "Jaguars", "Titans", "Broncos", "Chiefs", "Raiders", "Chargers", "Cowboys", "Giants", "Eagles", "Commanders", "Bears", "Lions", "Packers", "Vikings", "Falcons", "Panthers", "Saints", "Buccaneers", "Cardinals", "Rams", "49ers", "Seahawks"],
      MLS: ["Toronto FC", "Inter Miami", "LAFC", "Nashville SC", "FC Cincinnati"],
      CFL: ["Argonauts", "Tiger-Cats", "Redblacks", "Alouettes", "ELKS", "Stampeders", "Blue Bombers", "Roughriders", "Lions"],
      WNBA: ["Liberty", "Aces", "Storm", "Sun", "Lynx", "Fever", "Mercury", "Wings", "Sky", "Mystics", "Sparks", "Dream", "Valkyries", "Tempo"],
    };

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

  const setSingleTeam = async (league: string, slug: string) => {
    const key = `${league.toLowerCase()}_single_team`;
    const value = slug === "all" ? "" : slug;
    setSingleTeamSettings((prev) => ({ ...prev, [league]: value }));

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: value ? `${league} showing single team` : `${league} showing all teams` });
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
            className={`p-4 rounded-xl border transition-all space-y-3 ${
              l.is_visible ? "bg-card border-border" : "bg-muted/50 border-border/50 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
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

            {/* Single-team mode selector */}
            {LEAGUE_TEAMS[l.league] && l.is_visible && (
              <div className="pt-1">
                <label className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3" /> Menu display
                </label>
                <Select
                  value={singleTeamSettings[l.league] || "all"}
                  onValueChange={(v) => setSingleTeam(l.league, v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams (dropdown)</SelectItem>
                    {LEAGUE_TEAMS[l.league].map((t) => (
                      <SelectItem key={t.slug} value={t.slug}>
                        {t.name} only
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLeagueVisibility;
