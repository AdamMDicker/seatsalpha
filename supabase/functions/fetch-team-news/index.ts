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
    // Try multiple RSS sources for Blue Jays news
    const feedUrls = [
      'https://www.mlb.com/feeds/news/rss.xml',
      'https://www.sportsnet.ca/feed/',
    ];

    let items: NewsItem[] = [];

    for (const feedUrl of feedUrls) {
      if (items.length >= 8) break;
      
      try {
        const response = await fetch(feedUrl, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (compatible; SeatsCA/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        if (!response.ok) {
          console.log(`Feed ${feedUrl} returned ${response.status}, skipping`);
          continue;
        }

        const xml = await response.text();
        
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

          // Filter for Blue Jays related content
          const isBlueJaysRelated = 
            title.toLowerCase().includes('blue jay') ||
            title.toLowerCase().includes('jays') ||
            title.toLowerCase().includes('toronto') ||
            description.toLowerCase().includes('blue jay') ||
            description.toLowerCase().includes('jays');

          // From MLB.com feed, filter for Blue Jays. From Sportsnet, take baseball content.
          const isRelevant = feedUrl.includes('mlb.com') 
            ? isBlueJaysRelated 
            : isBlueJaysRelated;

          if (title && isRelevant) {
            items.push({
              title,
              link: linkMatch ? extractCDATA(linkMatch[1]) : '',
              pubDate: pubDateMatch ? extractCDATA(pubDateMatch[1]) : '',
              description: description.substring(0, 200),
            });
          }
        }
      } catch (feedError) {
        console.error(`Error fetching feed ${feedUrl}:`, feedError);
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
