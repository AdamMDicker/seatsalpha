import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image, Check } from "lucide-react";

import heroCanada from "@/assets/hero-arena.jpg";
import heroBaseball from "@/assets/hero-baseball.jpg";
import heroHockey from "@/assets/hero-hockey.jpg";
import heroBasketball from "@/assets/hero-basketball.jpg";
import heroFootball from "@/assets/hero-football.jpg";
import heroSoccer from "@/assets/hero-soccer.jpg";
import heroConcerts from "@/assets/hero-concerts.jpg";

const HERO_OPTIONS = [
  { id: "canada", label: "Canada", image: heroCanada },
  { id: "baseball", label: "Baseball", image: heroBaseball },
  { id: "hockey", label: "Hockey", image: heroHockey },
  { id: "basketball", label: "Basketball", image: heroBasketball },
  { id: "football", label: "Football", image: heroFootball },
  { id: "soccer", label: "Soccer", image: heroSoccer },
  { id: "concerts", label: "Concerts", image: heroConcerts },
];

const AdminHeroImage = () => {
  const [selected, setSelected] = useState("baseball");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image")
        .single();
      if (data) setSelected(data.value);
    };
    fetch();
  }, []);

  const handleSave = async (id: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: id, updated_at: new Date().toISOString() })
      .eq("key", "hero_image");

    if (error) {
      toast.error("Failed to update hero image");
    } else {
      setSelected(id);
      toast.success(`Hero image set to ${HERO_OPTIONS.find(o => o.id === id)?.label}`);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Image className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Hero Image</h2>
      </div>
      <p className="text-sm text-muted-foreground">Select the hero background image for the homepage. Changes apply instantly.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {HERO_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSave(option.id)}
            disabled={saving}
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 group ${
              selected === option.id
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <img
              src={option.image}
              alt={option.label}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-3 text-white text-sm font-semibold">
              {option.label}
            </div>
            {selected === option.id && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminHeroImage;
