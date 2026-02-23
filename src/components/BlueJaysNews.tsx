import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

const BlueJaysNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("fetch-team-news", {
        body: null,
      });

      if (fnError) throw fnError;
      setNews(data?.news || []);
    } catch (e) {
      console.error("Failed to fetch news:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          Latest Blue Jays News
        </h2>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">Unable to load news right now.</p>
          <button onClick={fetchNews} className="text-primary text-sm mt-2 hover:underline">
            Try again
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">No Blue Jays news found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl p-4 hover:border-primary/40 transition-all group block"
            >
              <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground/70">{formatDate(item.pubDate)}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlueJaysNews;
