

## Live Chat Widget with AI-Powered FAQ

### Overview
Add a floating chat widget that appears on every page, powered by AI (Lovable AI / Gemini Flash) to answer common questions about seats.ca. The chat will include pre-built sample questions and use a knowledge base of site-specific FAQs.

### Components

1. **`src/components/LiveChat.tsx`** — Floating chat bubble (bottom-right corner) that opens a chat panel. Includes:
   - Chat bubble button with message icon
   - Expandable chat panel with header, message list, input field
   - Pre-built quick-ask buttons for common questions
   - Markdown rendering for AI responses
   - Smooth open/close animations

2. **`supabase/functions/chat-support/index.ts`** — Edge function that calls Lovable AI (Gemini 2.5 Flash) with a system prompt containing seats.ca knowledge base (membership details, beta status, refund policy, etc.) and returns answers.

3. **`src/App.tsx`** — Add `<LiveChat />` globally so it appears on every page.

### Sample Quick Questions
- "How do I buy tickets?"
- "What is the membership and how much does it cost?"
- "Are there service fees?"
- "What is your refund policy?"
- "Which teams are available?"
- "How do I become a seller?"

### Knowledge Base (embedded in edge function system prompt)
The AI will be given context about:
- Beta status (Blue Jays only currently)
- Membership ($20/year, zero fees)
- How purchasing works
- Refund/exchange policy
- Becoming a reseller
- Contact info

### Technical Details
- Uses Lovable AI (`google/gemini-2.5-flash`) — no API key needed
- Chat state is local (not persisted to DB)
- No authentication required to use chat
- Responsive design: full-width on mobile, fixed-width panel on desktop

