export interface Event {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  category: "sports" | "concerts" | "theatre";
  priceFrom: number;
  image: string;
  isOwn: boolean; // true = our tickets, false = reseller
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Toronto Maple Leafs vs Montreal Canadiens",
    venue: "Scotiabank Arena",
    city: "Toronto, ON",
    date: "Mar 15, 2026",
    time: "7:00 PM",
    category: "sports",
    priceFrom: 89,
    image: "https://images.unsplash.com/photo-1580748142004-fcd0a75f3ea8?w=600&h=400&fit=crop",
    isOwn: true,
  },
  {
    id: "2",
    title: "The Weeknd – After Hours Tour",
    venue: "Rogers Centre",
    city: "Toronto, ON",
    date: "Apr 2, 2026",
    time: "8:00 PM",
    category: "concerts",
    priceFrom: 120,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop",
    isOwn: true,
  },
  {
    id: "3",
    title: "Vancouver Canucks vs Edmonton Oilers",
    venue: "Rogers Arena",
    city: "Vancouver, BC",
    date: "Mar 22, 2026",
    time: "7:30 PM",
    category: "sports",
    priceFrom: 75,
    image: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=600&h=400&fit=crop",
    isOwn: true,
  },
  {
    id: "4",
    title: "Hamilton – The Musical",
    venue: "Princess of Wales Theatre",
    city: "Toronto, ON",
    date: "Apr 10, 2026",
    time: "2:00 PM",
    category: "theatre",
    priceFrom: 95,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop",
    isOwn: false,
  },
  {
    id: "5",
    title: "Calgary Flames vs Winnipeg Jets",
    venue: "Scotiabank Saddledome",
    city: "Calgary, AB",
    date: "Mar 28, 2026",
    time: "8:00 PM",
    category: "sports",
    priceFrom: 65,
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&h=400&fit=crop",
    isOwn: true,
  },
  {
    id: "6",
    title: "Drake – Canadian Tour",
    venue: "Bell Centre",
    city: "Montreal, QC",
    date: "May 5, 2026",
    time: "9:00 PM",
    category: "concerts",
    priceFrom: 150,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    isOwn: false,
  },
];

export const categories = [
  { id: "all", label: "All Events" },
  { id: "sports", label: "Sports" },
  { id: "concerts", label: "Concerts" },
  { id: "theatre", label: "Theatre" },
];
