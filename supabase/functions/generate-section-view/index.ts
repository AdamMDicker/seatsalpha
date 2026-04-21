import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Section descriptors used to build a high-quality prompt per Rogers Centre section.
// Keep descriptions concrete and visual — what the camera would see.
const ROGERS_CENTRE_SECTION_PROMPTS: Record<
  string,
  { label: string; description: string }
> = {
  "500L": {
    label: "500 Level Left",
    description:
      "From the upper deck (5th level) on the third-base side, looking down and across at the entire diamond. Very high vantage point, steep angle, shallow depth.",
  },
  "500C": {
    label: "500 Level Centre",
    description:
      "From the highest centre-field upper deck looking back toward home plate. Panoramic view of the entire field, infield, and seating bowl below.",
  },
  "500R": {
    label: "500 Level Right",
    description:
      "From the upper deck (5th level) on the first-base side, looking down and across at the diamond. Very high vantage point, steep angle.",
  },
  "500B": {
    label: "500 Level Behind Home",
    description:
      "From the highest upper deck directly behind home plate. Looking out toward centre field with the entire diamond below. Wide panoramic view.",
  },
  "200L": {
    label: "200 Level Left",
    description:
      "From the second deck on the third-base side. Mid-elevation view of the diamond with infield clearly visible and a good angle on home plate.",
  },
  "200C": {
    label: "200 Level Centre",
    description:
      "From the second-deck centre-field area looking back at the entire diamond. Mid-elevation, balanced view of the whole field.",
  },
  "200R": {
    label: "200 Level Right",
    description:
      "From the second deck on the first-base side. Mid-elevation view of the diamond with the infield in clear sight.",
  },
  TDT: {
    label: "TD Terrace",
    description:
      "From an outdoor terrace seating area in the outfield, looking back at the diamond. Includes part of the railing in foreground and a panoramic view of the field.",
  },
  PTML: {
    label: "Premium Ticketmaster Lounge (Left)",
    description:
      "From a premium lounge area on the third-base side at the field level. Excellent close view of the infield, dugout area visible.",
  },
  PTMR: {
    label: "Premium Ticketmaster Lounge (Right)",
    description:
      "From a premium lounge area on the first-base side at the field level. Excellent close view of the infield.",
  },
  "100L": {
    label: "100 Level Infield Left",
    description:
      "From the lower bowl on the third-base side, mid-level rows. Close, clear view of the infield, players, and pitcher's mound.",
  },
  "100R": {
    label: "100 Level Infield Right",
    description:
      "From the lower bowl on the first-base side, mid-level rows. Close, clear view of the infield and pitcher's mound.",
  },
  "100B": {
    label: "100 Level Behind Home",
    description:
      "From the lower bowl directly behind home plate, mid rows. Premium straight-on view of the pitcher's mound and the entire diamond.",
  },
  RPBL: {
    label: "Rogers Premium Banner Lounge (Left)",
    description:
      "From a premium banner-level lounge on the third-base side. Elevated view above the lower bowl with the diamond clearly visible.",
  },
  RPBR: {
    label: "Rogers Premium Banner Lounge (Right)",
    description:
      "From a premium banner-level lounge on the first-base side. Elevated view above the lower bowl with the diamond clearly visible.",
  },
  KPMG: {
    label: "KPMG Premium Blueprint Lounge",
    description:
      "From a premium club lounge on the third-base side at lower-bowl height. Refined indoor-outdoor view of the field with railing in the foreground.",
  },
  PTD: {
    label: "Premium TD Lounge",
    description:
      "From a premium club lounge on the first-base side at lower-bowl height. Refined view of the field with railing in the foreground.",
  },
  SBL: {
    label: "Scorebet Seats (Left)",
    description:
      "From the Scorebet seating area in the outfield corner on the third-base side. Side-on view down the foul line toward home plate.",
  },
  SBR: {
    label: "Scorebet Seats (Right)",
    description:
      "From the Scorebet seating area in the outfield corner on the first-base side. Side-on view down the foul line toward home plate.",
  },
  "100OL": {
    label: "100 Level Outfield Left",
    description:
      "From the lower-bowl outfield seats in left field. Looking back at the infield from beyond the outfield wall area.",
  },
  "100OR": {
    label: "100 Level Outfield Right",
    description:
      "From the lower-bowl outfield seats in right field. Looking back at the infield from beyond the outfield wall area.",
  },
};

function buildPrompt(sectionId: string): string {
  const meta = ROGERS_CENTRE_SECTION_PROMPTS[sectionId];
  const description =
    meta?.description ||
    `Generic stadium seat view inside Rogers Centre, section ${sectionId}.`;

  return [
    "Photorealistic phone photo taken by a fan from their seat at Rogers Centre in Toronto during a Toronto Blue Jays MLB baseball game.",
    `Vantage point: ${description}`,
    "The retractable dome roof is closed. Bright stadium lighting, natural-looking colours.",
    "Visible details: the green baseball diamond, dirt infield, white bases, players in Blue Jays uniforms, the large centre-field scoreboard, the stadium's upper and lower seating bowls filled with fans, and the iconic Rogers Centre interior architecture.",
    "Composition: wide-angle 4:3 phone photo, no people in foreground, no text overlays, no logos in foreground, no watermarks, no UI. Just a clean view as if the viewer is sitting in the seat.",
    "Style: realistic, slightly amateur smartphone photograph, sharp focus, daylight-equivalent dome lighting.",
  ].join(" ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleCheck } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const venue: string = body.venue || "Rogers Centre";
    const sectionId: string = body.section_id;

    if (!sectionId || typeof sectionId !== "string") {
      return new Response(JSON.stringify({ error: "section_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(sectionId);

    // Call Lovable AI Gateway for image generation (Nano Banana 2 — fast + good quality)
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded — try again in a minute." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Add funds to your Lovable AI workspace.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "Image generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiResp.json();
    const dataUrl: string | undefined =
      aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      console.error("No image returned:", JSON.stringify(aiData).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Model did not return an image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Decode base64 -> bytes
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = header.match(/data:(image\/[a-zA-Z+]+);base64/);
    const mime = mimeMatch?.[1] || "image/png";
    const ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const venueSlug = venue
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const objectPath = `ai-generated/${venueSlug}/sec-${sectionId.toLowerCase()}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await admin.storage
      .from("seat-images")
      .upload(objectPath, bytes, { contentType: mime, upsert: true });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      return new Response(JSON.stringify({ error: uploadErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = admin.storage.from("seat-images").getPublicUrl(objectPath);
    const imageUrl = pub.publicUrl;

    // Upsert into venue_section_views
    const { error: upsertErr } = await admin
      .from("venue_section_views")
      .upsert(
        { venue, section_id: sectionId, image_url: imageUrl, generated_at: new Date().toISOString() },
        { onConflict: "venue,section_id" },
      );

    if (upsertErr) {
      console.error("Upsert error:", upsertErr);
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, image_url: imageUrl, venue, section_id: sectionId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-section-view error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
