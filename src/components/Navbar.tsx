import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket, LogOut, Shield, ChevronDown } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
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

const MLB_DIVISIONS_LIST = ["AL East", "AL Central", "AL West", "NL East", "NL Central", "NL West"] as const;

interface NavTeam {
  name: string;
  path: string;
  division: string;
  logo?: string;
}

const MLB_TEAMS: NavTeam[] = MLB_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/mlb/${t.slug}`, division: t.division, logo: MLB_LOGOS[t.slug],
}));
const NHL_TEAMS: NavTeam[] = NHL_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/nhl/${t.slug}`, division: t.division, logo: NHL_LOGOS[t.slug],
}));
const NBA_TEAMS: NavTeam[] = NBA_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/nba/${t.slug}`, division: t.division, logo: NBA_LOGOS[t.slug],
}));
const NFL_TEAMS: NavTeam[] = NFL_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/nfl/${t.slug}`, division: t.division, logo: NFL_LOGOS[t.slug],
}));
const MLS_TEAMS: NavTeam[] = MLS_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/mls/${t.slug}`, division: t.conference, logo: MLS_LOGOS[t.slug],
}));
const CFL_TEAMS_NAV: NavTeam[] = CFL_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/cfl/${t.slug}`, division: t.division, logo: CFL_LOGOS[t.slug],
}));
const WNBA_TEAMS: NavTeam[] = WNBA_TEAMS_CONFIG.map((t) => ({
  name: t.name, path: `/teams/wnba/${t.slug}`, division: t.conference, logo: WNBA_LOGOS[t.slug],
}));

const LEAGUES_WITH_DROPDOWNS: Record<string, { teams: NavTeam[]; divisions: readonly string[] }> = {
  NHL: { teams: NHL_TEAMS, divisions: NHL_DIVISIONS },
  NBA: { teams: NBA_TEAMS, divisions: NBA_DIVISIONS },
  MLB: { teams: MLB_TEAMS, divisions: MLB_DIVISIONS_LIST },
  NFL: { teams: NFL_TEAMS, divisions: NFL_DIVISIONS },
  MLS: { teams: MLS_TEAMS, divisions: MLS_CONFERENCES },
  CFL: { teams: CFL_TEAMS_NAV, divisions: CFL_DIVISIONS },
  WNBA: { teams: WNBA_TEAMS, divisions: WNBA_CONFERENCES },
};

const ALL_LEAGUES = ["NHL", "NBA", "WNBA", "MLB", "NFL", "MLS", "CFL", "Concerts", "Theatre"];

const SINGLE_TEAM_MAP: Record<string, Record<string, { name: string; path: string }>> = {
  MLB: Object.fromEntries(MLB_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/mlb/${t.slug}` }])),
  NHL: Object.fromEntries(NHL_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/nhl/${t.slug}` }])),
  NBA: Object.fromEntries(NBA_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/nba/${t.slug}` }])),
  NFL: Object.fromEntries(NFL_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/nfl/${t.slug}` }])),
  MLS: Object.fromEntries(MLS_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/mls/${t.slug}` }])),
  CFL: Object.fromEntries(CFL_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/cfl/${t.slug}` }])),
  WNBA: Object.fromEntries(WNBA_TEAMS_CONFIG.map((t) => [t.slug, { name: t.name, path: `/teams/wnba/${t.slug}` }])),
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [visibleLeagues, setVisibleLeagues] = useState<Set<string>>(new Set(ALL_LEAGUES));
  const [teamsWithInventory, setTeamsWithInventory] = useState<Set<string> | null>(null);
  const [singleTeamOverrides, setSingleTeamOverrides] = useState<Record<string, string>>({});
  const [scrolled, setScrolled] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchVisibility = async () => {
      const { data } = await supabase.from("league_visibility").select("league, is_visible");
      if (data) setVisibleLeagues(new Set(data.filter((r) => r.is_visible).map((r) => r.league)));
    };
    const fetchSingleTeamSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value").like("key", "%_single_team");
      if (data) {
        const overrides: Record<string, string> = {};
        data.forEach((s) => {
          const league = s.key.replace("_single_team", "").toUpperCase();
          if (s.value) overrides[league] = s.value;
        });
        setSingleTeamOverrides(overrides);
      }
    };
    const fetchTeamsWithInventory = async () => {
      const { data: tickets } = await (supabase.from("public_tickets" as any).select("event_id") as any);
      if (!tickets || tickets.length === 0) return;
      const eventIds = [...new Set((tickets as any[]).map((t: any) => t.event_id))] as string[];
      const { data: events } = await supabase.from("events").select("title").in("id", eventIds);
      if (!events) return;
      const titles = events.map((e) => e.title.toLowerCase());
      const allTeams = [...MLB_TEAMS, ...NHL_TEAMS, ...NBA_TEAMS, ...NFL_TEAMS, ...MLS_TEAMS, ...CFL_TEAMS_NAV, ...WNBA_TEAMS];
      const paths = new Set<string>();
      for (const team of allTeams) {
        if (titles.some((t) => t.includes(team.name.toLowerCase()))) paths.add(team.path);
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
        setShowTeams(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(sectionId), 300);
    } else {
      scrollToSection(sectionId);
    }
  };

  const pageLinks = [
    { label: "Home", action: () => { setIsOpen(false); navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); } },
    { label: "How It Works", action: () => handleNavClick("how-it-works") },
    { label: "Features", action: () => handleNavClick("features") },
    { label: "Membership", action: () => { setIsOpen(false); navigate("/membership"); } },
    { label: "Become a Seller", action: () => { setIsOpen(false); navigate("/reseller"); } },
    { label: "Contact", action: () => { setIsOpen(false); navigate("/contact"); } },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isOpen ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold tracking-tight">
              seats<span className="text-primary">.ca</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {/* Page links */}
            {pageLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-secondary/50"
              >
                {link.label}
              </button>
            ))}

            {/* Teams dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowTeams(!showTeams); setOpenDropdown(null); }}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-secondary/50 flex items-center gap-1"
              >
                Teams
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showTeams ? "rotate-180" : ""}`} />
              </button>

              {showTeams && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 py-2 animate-fade-in">
                  {ALL_LEAGUES.filter((l) => visibleLeagues.has(l)).map((league) => {
                    const singleSlug = singleTeamOverrides[league];
                    if (singleSlug && SINGLE_TEAM_MAP[league]?.[singleSlug]) {
                      const team = SINGLE_TEAM_MAP[league][singleSlug];
                      return (
                        <Link
                          key={league}
                          to={team.path}
                          onClick={() => setShowTeams(false)}
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {team.name}
                        </Link>
                      );
                    }

                    const config = LEAGUES_WITH_DROPDOWNS[league];
                    if (config) {
                      return (
                        <div key={league} className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === league ? null : league)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
                          >
                            {league}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === league ? "rotate-180" : ""}`} />
                          </button>
                          {openDropdown === league && (
                            <div className="absolute left-full top-0 ml-1 w-64 max-h-[70vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-50 py-2 animate-fade-in">
                              {config.divisions.map((div) => {
                                const divTeams = config.teams.filter((t) => t.division === div && (!teamsWithInventory || teamsWithInventory.has(t.path)));
                                if (divTeams.length === 0) return null;
                                return (
                                  <div key={div}>
                                    <p className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{div}</p>
                                    {divTeams.map((team) => (
                                      <Link
                                        key={team.path}
                                        to={team.path}
                                        onClick={() => { setOpenDropdown(null); setShowTeams(false); }}
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
                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-2" />

            {/* Auth / Admin */}
            {isAdmin && (
              <Link to="/admin" className="px-3 py-2 text-sm font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to="/my-orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  My Orders
                </Link>
                <NotificationBell />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</span>
                <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-8" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm" className="text-sm px-4 h-9">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-6 pt-3 space-y-1 animate-fade-in border-t border-border">
            {pageLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="block w-full text-left px-4 py-3.5 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors min-h-[48px]"
              >
                {link.label}
              </button>
            ))}

            <Link
              to="/teams/blue-jays"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3.5 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors min-h-[48px]"
            >
              Blue Jays Tickets
            </Link>

            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3.5 text-base font-medium text-gold rounded-lg min-h-[48px]">
                Admin Dashboard
              </Link>
            )}

            {user && (
              <>
                <Link to="/my-orders" onClick={() => setIsOpen(false)} className="block px-4 py-3.5 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors min-h-[48px]">
                  My Orders
                </Link>
                <div className="flex items-center gap-3 px-4 py-3.5 min-h-[48px]">
                  <NotificationBell />
                  <span className="text-base text-muted-foreground">Notifications</span>
                </div>
              </>
            )}

            <div className="px-4 pt-3">
              {user ? (
                <Button variant="ghost" size="lg" className="w-full justify-start min-h-[52px] text-base" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" size="lg" className="w-full min-h-[52px] text-base">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
