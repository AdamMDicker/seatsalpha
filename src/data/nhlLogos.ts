import mapleLeafs from "@/assets/teams/nhl/maple-leafs.svg";
import canadiens from "@/assets/teams/nhl/canadiens.svg";
import senators from "@/assets/teams/nhl/senators.svg";
import bruins from "@/assets/teams/nhl/bruins.svg";
import sabres from "@/assets/teams/nhl/sabres.svg";
import redWings from "@/assets/teams/nhl/red-wings.svg";
import panthers from "@/assets/teams/nhl/panthers.svg";
import lightning from "@/assets/teams/nhl/lightning.svg";
import hurricanes from "@/assets/teams/nhl/hurricanes.svg";
import blueJackets from "@/assets/teams/nhl/blue-jackets.svg";
import devils from "@/assets/teams/nhl/devils.svg";
import islanders from "@/assets/teams/nhl/islanders.svg";
import rangers from "@/assets/teams/nhl/rangers.svg";
import flyers from "@/assets/teams/nhl/flyers.svg";
import penguins from "@/assets/teams/nhl/penguins.svg";
import capitals from "@/assets/teams/nhl/capitals.svg";
import jets from "@/assets/teams/nhl/jets.svg";
import blackhawks from "@/assets/teams/nhl/blackhawks.svg";
import avalanche from "@/assets/teams/nhl/avalanche.svg";
import stars from "@/assets/teams/nhl/stars.svg";
import wild from "@/assets/teams/nhl/wild.svg";
import predators from "@/assets/teams/nhl/predators.svg";
import blues from "@/assets/teams/nhl/blues.svg";
import utahHC from "@/assets/teams/nhl/utah-hc.svg";
import ducks from "@/assets/teams/nhl/ducks.svg";
import flames from "@/assets/teams/nhl/flames.svg";
import oilers from "@/assets/teams/nhl/oilers.svg";
import kings from "@/assets/teams/nhl/kings.svg";
import sharks from "@/assets/teams/nhl/sharks.svg";
import kraken from "@/assets/teams/nhl/kraken.svg";
import canucks from "@/assets/teams/nhl/canucks.svg";
import goldenKnights from "@/assets/teams/nhl/golden-knights.svg";

export const NHL_LOGOS: Record<string, string> = {
  "maple-leafs": mapleLeafs,
  "canadiens": canadiens,
  "senators": senators,
  "bruins": bruins,
  "sabres": sabres,
  "red-wings": redWings,
  "panthers": panthers,
  "lightning": lightning,
  "hurricanes": hurricanes,
  "blue-jackets": blueJackets,
  "devils": devils,
  "islanders": islanders,
  "nhl-rangers": rangers,
  "flyers": flyers,
  "penguins": penguins,
  "capitals": capitals,
  "jets": jets,
  "blackhawks": blackhawks,
  "avalanche": avalanche,
  "stars": stars,
  "wild": wild,
  "predators": predators,
  "blues": blues,
  "utah-hc": utahHC,
  "ducks": ducks,
  "flames": flames,
  "oilers": oilers,
  "kings": kings,
  "sharks": sharks,
  "kraken": kraken,
  "canucks": canucks,
  "golden-knights": goldenKnights,
};

export const getNHLLogo = (slug: string): string | undefined => NHL_LOGOS[slug];
