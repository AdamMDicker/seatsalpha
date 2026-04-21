import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Loader2, RefreshCw, ImageOff } from "lucide-react";

const ROGERS_CENTRE_SECTIONS: { id: string; label: string }[] = [
  { id: "500L", label: "500 Level Left" },
  { id: "500C", label: "500 Level Centre" },
  { id: "500R", label: "500 Level Right" },
  { id: "500B", label: "500 Level Behind Home" },
  { id: "200L", label: "200 Level Left" },
  { id: "200C", label: "200 Level Centre" },
  { id: "200R", label: "200 Level Right" },
  { id: "TDT", label: "TD Terrace" },
  { id: "PTML", label: "Premium Ticketmaster Lounge (L)" },
  { id: "PTMR", label: "Premium Ticketmaster Lounge (R)" },
  { id: "100L", label: "100 Level Infield Left" },
  { id: "100R", label: "100 Level Infield Right" },
  { id: "100B", label: "100 Level Behind Home" },
  { id: "RPBL", label: "Rogers Premium Banner Lounge (L)" },
  { id: "RPBR", label: "Rogers Premium Banner Lounge (R)" },
  { id: "KPMG", label: "KPMG Premium Blueprint Lounge" },
  { id: "PTD", label: "Premium TD Lounge" },
  { id: "SBL", label: "Scorebet Seats (L)" },
  { id: "SBR", label: "Scorebet Seats (R)" },
  { id: "100OL", label: "100 Level Outfield Left" },
  { id: "100OR", label: "100 Level Outfield Right" },
];

const VENUE = "Rogers Centre";

interface SectionView {
  section_id: string;
  image_url: string;
  generated_at: string;
}

const AdminSectionViews = () => {
  const { toast } = useToast();
  const [views, setViews] = useState<Record<string, SectionView>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);

  const fetchViews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("venue_section_views")
      .select("section_id, image_url, generated_at")
      .eq("venue", VENUE);
    if (error) {
      toast({ title: "Error loading section views", description: error.message, variant: "destructive" });
    } else {
      const map: Record<string, SectionView> = {};
      (data || []).forEach((v) => {
        map[v.section_id] = v as SectionView;
      });
      setViews(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchViews();
  }, []);

  const generateOne = async (sectionId: string) => {
    setGenerating((prev) => new Set(prev).add(sectionId));
    try {
      const { data, error } = await supabase.functions.invoke("generate-section-view", {
        body: { venue: VENUE, section_id: sectionId },
      });
      if (error) throw error;
      if (data?.image_url) {
        setViews((prev) => ({
          ...prev,
          [sectionId]: { section_id: sectionId, image_url: data.image_url, generated_at: new Date().toISOString() },
        }));
        toast({ title: "Generated", description: `Section ${sectionId} reference view ready.` });
      }
    } catch (err: any) {
      const msg = err?.context ? await err.context.json().then((b: any) => b?.error).catch(() => null) : null;
      toast({
        title: "Generation failed",
        description: msg || err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }
  };

  const generateAllMissing = async () => {
    setBulkRunning(true);
    const missing = ROGERS_CENTRE_SECTIONS.filter((s) => !views[s.id]);
    for (const s of missing) {
      await generateOne(s.id);
      // small spacing to avoid rate limits
      await new Promise((r) => setTimeout(r, 1500));
    }
    setBulkRunning(false);
  };

  const deleteOne = async (sectionId: string) => {
    if (!confirm(`Delete AI reference for section ${sectionId}?`)) return;
    const { error } = await supabase
      .from("venue_section_views")
      .delete()
      .eq("venue", VENUE)
      .eq("section_id", sectionId);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setViews((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
    toast({ title: "Deleted", description: `Section ${sectionId} reference removed.` });
  };

  const generatedCount = Object.keys(views).length;
  const totalCount = ROGERS_CENTRE_SECTIONS.length;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Seat Views — Rogers Centre
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Generate a photorealistic reference image for each section. Buyers see these as a fallback when no real
              seller-uploaded seat photo exists. Real photos always take priority.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {generatedCount} / {totalCount} sections generated
            </p>
          </div>
          <Button
            onClick={generateAllMissing}
            disabled={bulkRunning || generatedCount === totalCount}
            className="bg-primary hover:bg-primary/90"
          >
            {bulkRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate all missing ({totalCount - generatedCount})
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ROGERS_CENTRE_SECTIONS.map((section) => {
            const view = views[section.id];
            const isGenerating = generating.has(section.id);
            return (
              <div key={section.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-muted relative flex items-center justify-center">
                  {view ? (
                    <img
                      src={view.image_url}
                      alt={`Section ${section.id} reference view`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No reference yet</p>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-mono text-muted-foreground">{section.id}</p>
                  <p className="text-sm font-medium leading-tight">{section.label}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateOne(section.id)}
                      disabled={isGenerating || bulkRunning}
                      className="flex-1"
                    >
                      {view ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                    {view && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteOne(section.id)}
                        disabled={isGenerating || bulkRunning}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSectionViews;
