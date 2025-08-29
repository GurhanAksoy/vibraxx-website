// src/app/api/video/generate/route.ts
import { startGeneration, type Provider } from "@/lib/providers";

export async function POST(req: Request) {
  try {
    // --- DEMO MODE: gerçek API'ye gitme, sample döndür ---
    if (process.env.DEMO_MODE === "on") {
      // İstersen burada body’den prompt'u yine de alıp loglayabilirsin
      return new Response(
        JSON.stringify({
          id: "demo-task",
          provider: "demo",
          // public/sample/demo.mp4 dosyan olsun
          demoUrl: "/sample/demo.mp4",
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    // --- MAINTENANCE MODE: kapalıysa 503 dön ---
    if (process.env.MAINTENANCE === "on") {
      return new Response(
        JSON.stringify({ error: "Service under maintenance" }),
        { status: 503, headers: { "content-type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt || "").toString().slice(0, 1000);
    const provider = ((body?.provider || "auto") as Provider) || "auto";

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    // Gerçek üretim: Runway/Luma'ya gider
    const result = await startGeneration(prompt, provider); // { id, provider }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}