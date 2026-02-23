import celtics from "@/assets/teams/nba/celtics.png";
import nets from "@/assets/teams/nba/nets.png";
import knicks from "@/assets/teams/nba/knicks.png";
import sixers from "@/assets/teams/nba/76ers.png";
import raptors from "@/assets/teams/nba/raptors.png";
import bulls from "@/assets/teams/nba/bulls.png";
import cavaliers from "@/assets/teams/nba/cavaliers.png";
import pistons from "@/assets/teams/nba/pistons.png";
import pacers from "@/assets/teams/nba/pacers.png";
import bucks from "@/assets/teams/nba/bucks.png";
import hawks from "@/assets/teams/nba/hawks.png";
import hornets from "@/assets/teams/nba/hornets.png";
import heat from "@/assets/teams/nba/heat.png";
import magic from "@/assets/teams/nba/magic.png";
import wizards from "@/assets/teams/nba/wizards.png";
import nuggets from "@/assets/teams/nba/nuggets.png";
import timberwolves from "@/assets/teams/nba/timberwolves.png";
import thunder from "@/assets/teams/nba/thunder.png";
import trailBlazers from "@/assets/teams/nba/trail-blazers.png";
import jazz from "@/assets/teams/nba/jazz.png";
import warriors from "@/assets/teams/nba/warriors.png";
import clippers from "@/assets/teams/nba/clippers.png";
import lakers from "@/assets/teams/nba/lakers.png";
import suns from "@/assets/teams/nba/suns.png";
import kings from "@/assets/teams/nba/kings.png";
import mavericks from "@/assets/teams/nba/mavericks.png";
import rockets from "@/assets/teams/nba/rockets.png";
import grizzlies from "@/assets/teams/nba/grizzlies.png";
import pelicans from "@/assets/teams/nba/pelicans.png";
import spurs from "@/assets/teams/nba/spurs.png";

export const NBA_LOGOS: Record<string, string> = {
  celtics, nets, knicks, "76ers": sixers, raptors,
  bulls, cavaliers, pistons, pacers, bucks,
  hawks, hornets, heat, magic, wizards,
  nuggets, timberwolves, thunder, "trail-blazers": trailBlazers, jazz,
  warriors, clippers, lakers, suns, kings,
  mavericks, rockets, grizzlies, pelicans, spurs,
};

export const getNBALogo = (slug: string): string | undefined => NBA_LOGOS[slug];
