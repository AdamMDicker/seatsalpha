import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function extractCDATA(text: string): string {
  const match = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1].trim() : text.trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const team = url.searchParams.get('team') || 'blue-jays';
    
    // Use MLB.com RSS feed for Blue Jays
    const feedUrls: Record<string, string> = {
      'blue-jays': 'https://rss.app/feed/0u6Xk4rUZEEuFzRj',
    };

    const feedUrl = feedUrls[team] || feedUrls['blue-jays'];
    
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    
    // Parse XML items
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

      const title = titleMatch ? extractCDATA(titleMatch[1]) : '';
      const description = descMatch ? stripHtml(extractCDATA(descMatch[1])) : '';

      if (title) {
        items.push({
          title,
          link: linkMatch ? extractCDATA(linkMatch[1]) : '',
          pubDate: pubDateMatch ? extractCDATA(pubDateMatch[1]) : '',
          description: description.substring(0, 200),
        });
      }
    }

    return new Response(JSON.stringify({ news: items.slice(0, 8) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ news: [], error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
