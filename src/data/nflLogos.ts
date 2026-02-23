import bills from "@/assets/teams/nfl/bills.png";
import dolphins from "@/assets/teams/nfl/dolphins.png";
import patriots from "@/assets/teams/nfl/patriots.png";
import jets from "@/assets/teams/nfl/jets.png";
import ravens from "@/assets/teams/nfl/ravens.png";
import bengals from "@/assets/teams/nfl/bengals.png";
import browns from "@/assets/teams/nfl/browns.png";
import steelers from "@/assets/teams/nfl/steelers.png";
import texans from "@/assets/teams/nfl/texans.png";
import colts from "@/assets/teams/nfl/colts.png";
import jaguars from "@/assets/teams/nfl/jaguars.png";
import titans from "@/assets/teams/nfl/titans.png";
import broncos from "@/assets/teams/nfl/broncos.png";
import chiefs from "@/assets/teams/nfl/chiefs.png";
import chargers from "@/assets/teams/nfl/chargers.png";
import raiders from "@/assets/teams/nfl/raiders.png";
import cowboys from "@/assets/teams/nfl/cowboys.png";
import giants from "@/assets/teams/nfl/giants.png";
import eagles from "@/assets/teams/nfl/eagles.png";
import commanders from "@/assets/teams/nfl/commanders.png";
import bears from "@/assets/teams/nfl/bears.png";
import lions from "@/assets/teams/nfl/lions.png";
import packers from "@/assets/teams/nfl/packers.png";
import vikings from "@/assets/teams/nfl/vikings.png";
import falcons from "@/assets/teams/nfl/falcons.png";
import panthers from "@/assets/teams/nfl/panthers.png";
import saints from "@/assets/teams/nfl/saints.png";
import buccaneers from "@/assets/teams/nfl/buccaneers.png";
import cardinals from "@/assets/teams/nfl/cardinals.png";
import rams from "@/assets/teams/nfl/rams.png";
import niners from "@/assets/teams/nfl/49ers.png";
import seahawks from "@/assets/teams/nfl/seahawks.png";

export const NFL_LOGOS: Record<string, string> = {
  bills, dolphins, patriots, jets,
  ravens, bengals, browns, steelers,
  texans, colts, jaguars, titans,
  broncos, chiefs, chargers, raiders,
  cowboys, giants, eagles, commanders,
  bears, lions, packers, vikings,
  falcons, panthers, saints, buccaneers,
  cardinals, rams, "49ers": niners, seahawks,
};

export const getNFLLogo = (slug: string): string | undefined => NFL_LOGOS[slug];
