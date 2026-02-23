// Auto-generated MLB team logo imports
import blueJays from "@/assets/teams/mlb/blue-jays.png";
import yankees from "@/assets/teams/mlb/yankees.png";
import redSox from "@/assets/teams/mlb/red-sox.png";
import rays from "@/assets/teams/mlb/rays.png";
import orioles from "@/assets/teams/mlb/orioles.png";
import guardians from "@/assets/teams/mlb/guardians.png";
import tigers from "@/assets/teams/mlb/tigers.png";
import royals from "@/assets/teams/mlb/royals.png";
import twins from "@/assets/teams/mlb/twins.png";
import whiteSox from "@/assets/teams/mlb/white-sox.png";
import astros from "@/assets/teams/mlb/astros.png";
import rangers from "@/assets/teams/mlb/rangers.png";
import mariners from "@/assets/teams/mlb/mariners.png";
import angels from "@/assets/teams/mlb/angels.png";
import athletics from "@/assets/teams/mlb/athletics.png";
import braves from "@/assets/teams/mlb/braves.png";
import mets from "@/assets/teams/mlb/mets.png";
import phillies from "@/assets/teams/mlb/phillies.png";
import marlins from "@/assets/teams/mlb/marlins.png";
import nationals from "@/assets/teams/mlb/nationals.png";
import cubs from "@/assets/teams/mlb/cubs.png";
import brewers from "@/assets/teams/mlb/brewers.png";
import cardinals from "@/assets/teams/mlb/cardinals.png";
import reds from "@/assets/teams/mlb/reds.png";
import pirates from "@/assets/teams/mlb/pirates.png";
import dodgers from "@/assets/teams/mlb/dodgers.png";
import padres from "@/assets/teams/mlb/padres.png";
import giants from "@/assets/teams/mlb/giants.png";
import diamondbacks from "@/assets/teams/mlb/diamondbacks.png";
import rockies from "@/assets/teams/mlb/rockies.png";

export const MLB_LOGOS: Record<string, string> = {
  "blue-jays": blueJays,
  "yankees": yankees,
  "red-sox": redSox,
  "rays": rays,
  "orioles": orioles,
  "guardians": guardians,
  "tigers": tigers,
  "royals": royals,
  "twins": twins,
  "white-sox": whiteSox,
  "astros": astros,
  "rangers": rangers,
  "mariners": mariners,
  "angels": angels,
  "athletics": athletics,
  "braves": braves,
  "mets": mets,
  "phillies": phillies,
  "marlins": marlins,
  "nationals": nationals,
  "cubs": cubs,
  "brewers": brewers,
  "cardinals": cardinals,
  "reds": reds,
  "pirates": pirates,
  "dodgers": dodgers,
  "padres": padres,
  "giants": giants,
  "diamondbacks": diamondbacks,
  "rockies": rockies,
};

export const getMLBLogo = (slug: string): string | undefined => MLB_LOGOS[slug];
