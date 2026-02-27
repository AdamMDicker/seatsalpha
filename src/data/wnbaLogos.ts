import liberty from "@/assets/teams/wnba/liberty.png";
import sun from "@/assets/teams/wnba/sun.png";
import fever from "@/assets/teams/wnba/fever.png";
import dream from "@/assets/teams/wnba/dream.png";
import mystics from "@/assets/teams/wnba/mystics.png";
import sky from "@/assets/teams/wnba/sky.png";
import aces from "@/assets/teams/wnba/aces.png";
import storm from "@/assets/teams/wnba/storm.png";
import mercury from "@/assets/teams/wnba/mercury.png";
import sparks from "@/assets/teams/wnba/sparks.png";
import lynx from "@/assets/teams/wnba/lynx.png";
import wings from "@/assets/teams/wnba/wings.png";
import valkyries from "@/assets/teams/wnba/valkyries.png";
import tempo from "@/assets/teams/wnba/tempo.png";

export const WNBA_LOGOS: Record<string, string> = {
  "aces-ny": liberty,
  sun,
  fever,
  dream,
  mystics,
  sky,
  tempo,
  aces,
  storm,
  mercury,
  sparks,
  lynx,
  wings,
  valkyries,
};

export const getWNBALogo = (slug: string): string | undefined => WNBA_LOGOS[slug];
