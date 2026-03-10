

## Homepage Visual Refresh

You've raised great points — the current dark theme makes everything blend together. Here's the plan to address each issue:

### 1. Hero Section Overhaul
- **Background image visibility**: Reduce the dark overlay opacity so the hero image is actually visible (currently `via-background/80` makes it almost invisible)
- **"Pay No Fees" badge**: Make it pop with a solid bright background, larger text, and a subtle glow/pulse animation instead of the current faint `bg-primary/15`
- **"Canada's First No-Fee Ticket Platform"**: Increase size and add a white/light color so it doesn't compete with the background image
- **Search bar**: Give it a solid white or light background with stronger border contrast so it's clearly visible as an input field
- **"100% Guaranteed"**: Link it to a tooltip or small expandable that explains what it means (authentic tickets, buyer protection, full refund if event cancelled)

### 2. Features Section ("Why seats.ca?")
- **Feature cards**: Replace the transparent `glass` style with solid card backgrounds that have visible borders/shadows so they don't melt into the dark background
- **Not clickable**: Keep them non-interactive (they're informational) but make them visually distinct with a lighter card background
- **HST wording**: Change "No hidden charges, no surprises at checkout" to be more specific: "What you see is what you pay — taxes included, no service fees added"

### 3. Events Section
- **Event cards**: Add clearer card backgrounds with more visible borders/separation between cards
- **Category/badge corners**: Tone down the bright corner badges — make them smaller or use more subtle colors so they don't overpower the card content
- **Date/venue differentiation**: Add stronger visual hierarchy — bolder dates, subtle dividers between cards

### 4. Color & Contrast Tweaks (CSS variables)
- Lighten `--card` slightly (from 10% to ~13% lightness) for more card/background contrast
- Lighten `--border` (from 18% to ~25%) so borders are actually visible
- Lighten `--muted-foreground` (from 55% to ~65%) for better text readability

### Files to Change
- `src/index.css` — adjust CSS variables for better contrast
- `src/components/HeroSection.tsx` — overlay opacity, badge styling, search bar styling, guarantee tooltip
- `src/components/FeaturesSection.tsx` — card styling, HST copy update
- `src/components/EventCard.tsx` — card contrast, tone down corner badges
- `src/components/EventsSection.tsx` — minor spacing adjustments

