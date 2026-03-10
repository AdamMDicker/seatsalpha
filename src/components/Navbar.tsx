import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket, LogOut, Shield, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MLB_TEAMS_CONFIG } from "@/data/mlbTeams";
import { MLB_LOGOS } from "@/data/mlbLogos";
import { NHL_TEAMS_CONFIG, NHL_DIVISIONS } from "@/data/nhlTeams";
import { NHL_LOGOS } from "@/data/nhlLogos";
import { NBA_TEAMS_CONFIG, NBA_DIVISIONS } from "@/data/nbaTeams";
import { NBA_LOGOS } from "@/data/nbaLogos";
import { NFL_TEAMS_CONFIG, NFL_DIVISIONS } from "@/data/nflTeams";
import { NFL_LOGOS } from "@/data/nflLogos";
import { MLS_TEAMS_CONFIG, MLS_CONFERENCES } from "@/data/mlsTeams";
import { MLS_LOGOS } from "@/data/mlsLogos";
import { CFL_TEAMS_CONFIG, CFL_DIVISIONS } from "@/data/cflTeams";
import { CFL_LOGOS } from "@/data/cflLogos";
import { WNBA_TEAMS_CONFIG, WNBA_CONFERENCES } from "@/data/wnbaTeams";
import { WNBA_LOGOS } from "@/data/wnbaLogos";

// Group teams by division for the dropdown
const MLB_DIVISIONS = ["AL East", "AL Central", "AL West", "NL East", "NL Central", "NL West"] as const;

interface NavTeam {
  name: string;
  path: string;
  division: string;
  logo?: string;
}

const MLB_TEAMS: NavTeam[] = MLB_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/mlb/${t.slug}`,
  division: t.division,
  logo: MLB_LOGOS[t.slug],
}));

const NHL_TEAMS: NavTeam[] = NHL_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/nhl/${t.slug}`,
  division: t.division,
  logo: NHL_LOGOS[t.slug],
}));

const NBA_TEAMS: NavTeam[] = NBA_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/nba/${t.slug}`,
  division: t.division,
  logo: NBA_LOGOS[t.slug],
}));

const NFL_TEAMS: NavTeam[] = NFL_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/nfl/${t.slug}`,
  division: t.division,
  logo: NFL_LOGOS[t.slug],
}));

const MLS_TEAMS: NavTeam[] = MLS_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/mls/${t.slug}`,
  division: t.conference,
  logo: MLS_LOGOS[t.slug],
}));

const CFL_TEAMS_NAV: NavTeam[] = CFL_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/cfl/${t.slug}`,
  division: t.division,
  logo: CFL_LOGOS[t.slug],
}));

const WNBA_TEAMS: NavTeam[] = WNBA_TEAMS_CONFIG.map((t) => ({
  name: t.name,
  path: `/teams/wnba/${t.slug}`,
  division: t.conference,
  logo: WNBA_LOGOS[t.slug],
}));

const LEAGUES_WITH_DROPDOWNS: Record<string, { teams: NavTeam[]; divisions: readonly string[] }> = {
  NHL: { teams: NHL_TEAMS, divisions: NHL_DIVISIONS },
  NBA: { teams: NBA_TEAMS, divisions: NBA_DIVISIONS },
  MLB: { teams: MLB_TEAMS, divisions: MLB_DIVISIONS },
  NFL: { teams: NFL_TEAMS, divisions: NFL_DIVISIONS },
  MLS: { teams: MLS_TEAMS, divisions: MLS_CONFERENCES },
  CFL: { teams: CFL_TEAMS_NAV, divisions: CFL_DIVISIONS },
  WNBA: { teams: WNBA_TEAMS, divisions: WNBA_CONFERENCES },
};

const ALL_LEAGUES = ["NHL", "NBA", "WNBA", "MLB", "NFL", "MLS", "CFL", "Concerts", "Theatre"];

// Map of league -> { slug, name, path } for single-team overrides
const SINGLE_TEAM_MAP: Record<string, Record<string, { name: string; path: string }>> = {
  MLB: Object.fromEntries(MLB_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/mlb/${t.slug}` }])),
  NHL: Object.fromEntries(NHL_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/nhl/${t.slug}` }])),
  NBA: Object.fromEntries(NBA_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/nba/${t.slug}` }])),
  NFL: Object.fromEntries(NFL_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/nfl/${t.slug}` }])),
  MLS: Object.fromEntries(MLS_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/mls/${t.slug}` }])),
  CFL: Object.fromEntries(CFL_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/cfl/${t.slug}` }])),
  WNBA: Object.fromEntries(WNBA_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/wnba/${t.slug}` }])),
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [visibleLeagues, setVisibleLeagues] = useState<Set<string>>(new Set(ALL_LEAGUES));
  const [teamsWithInventory, setTeamsWithInventory] = useState<Set<string> | null>(null);
  const [singleTeamOverrides, setSingleTeamOverrides] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const fetchVisibility = async () => {
      const { data } = await supabase.from("league_visibility").select("league, is_visible");
      if (data) {
        setVisibleLeagues(new Set(data.filter((r) => r.is_visible).map((r) => r.league)));
      }
    };

    const fetchSingleTeamSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "%_single_team");
      if (data) {
        const overrides: Record<string, string> = {};
        data.forEach((s) => {
          // key format: mlb_single_team -> league = MLB
          const league = s.key.replace("_single_team", "").toUpperCase();
          if (s.value) overrides[league] = s.value;
        });
        setSingleTeamOverrides(overrides);
      }
    };

    const fetchTeamsWithInventory = async () => {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("event_id")
        .eq("is_active", true);

      if (!tickets || tickets.length === 0) return;

      const eventIds = [...new Set(tickets.map((t) => t.event_id))];

      const { data: events } = await supabase
        .from("events")
        .select("title")
        .in("id", eventIds);

      if (!events) return;

      const titles = events.map((e) => e.title.toLowerCase());
      const allTeams = [...MLB_TEAMS, ...NHL_TEAMS, ...NBA_TEAMS, ...NFL_TEAMS, ...MLS_TEAMS, ...CFL_TEAMS_NAV, ...WNBA_TEAMS];
      const paths = new Set<string>();

      for (const team of allTeams) {
        if (titles.some((t) => t.includes(team.name.toLowerCase()))) {
          paths.add(team.path);
        }
      }
      setTeamsWithInventory(paths);
    };

    fetchVisibility();
    fetchSingleTeamSettings();
    fetchTeamsWithInventory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Ticket className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold tracking-tight">
                seats<span className="text-primary">.ca</span>
              </span>
            </Link>
            <Link to="/membership" className="text-sm font-semibold text-gold hover:text-gold/80 transition-colors">
              Become a Member
            </Link>
            <Link to="/reseller" className="text-sm font-semibold text-gold hover:text-gold/80 transition-colors">
              Become a Seller
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6" ref={dropdownRef}>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              All Events
            </Link>
            {ALL_LEAGUES.filter((l) => visibleLeagues.has(l)).map((league) => {
              // Check for single-team override
              const singleSlug = singleTeamOverrides[league];
              if (singleSlug && SINGLE_TEAM_MAP[league]?.[singleSlug]) {
                const team = SINGLE_TEAM_MAP[league][singleSlug];
                return (
                  <Link
                    key={league}
                    to={team.path}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {team.name} Tickets
                  </Link>
                );
              }

              const config = LEAGUES_WITH_DROPDOWNS[league];
              if (config) {
                const { teams, divisions } = config;
                return (
                  <div key={league} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === league ? null : league)}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {league}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === league ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === league && (
                      <div className="absolute top-full left-0 mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-50 py-2 animate-fade-in">
                {divisions.map((div) => {
                          const divTeams = teams.filter((t) => t.division === div && (!teamsWithInventory || teamsWithInventory.has(t.path)));
                          if (divTeams.length === 0) return null;
                          return (
                            <div key={div}>
                              <p className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{div}</p>
                                {divTeams.map((team) => (
                                <Link
                                  key={team.path}
                                  to={team.path}
                                  onClick={() => setOpenDropdown(null)}
                                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors"
                                >
                                  {team.logo && <img src={team.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />}
                                  {team.name}
                                </Link>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={league}
                  to={`/?category=${league.toLowerCase()}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {league}
                </Link>
              );
            })}
            <Link to="/about" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/membership#faq" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user && (
              <Link to="/reseller" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Reseller
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{user.email}</span>
                <Button variant="glass" size="sm" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <Link to="/" className="block py-2 text-sm text-muted-foreground hover:text-foreground">Events</Link>
            {isAdmin && <Link to="/admin" className="block py-2 text-sm text-gold">Admin Dashboard</Link>}
            {user ? (
              <Button variant="glass" size="sm" className="w-full" onClick={signOut}>Sign Out</Button>
            ) : (
              <Link to="/auth"><Button variant="hero" size="sm" className="w-full">Sign In</Button></Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
