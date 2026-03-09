import { TEAMS_VENUES } from "@/data/teamsVenues";

export function getUberDeepLink(venueName: string): string | null {
  const venue = TEAMS_VENUES.find((tv) => tv.venue === venueName);
  if (!venue?.latitude || !venue?.longitude) return null;

  const params = new URLSearchParams({
    action: "setPickup",
    "dropoff[latitude]": venue.latitude.toString(),
    "dropoff[longitude]": venue.longitude.toString(),
    "dropoff[nickname]": venue.venue,
  });

  return `https://m.uber.com/ul/?${params.toString()}`;
}
