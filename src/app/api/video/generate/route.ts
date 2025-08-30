// src/app/api/video/generate/route.ts
import { startGeneration, type Provider } from "../../../../lib/providers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt || "").toString().slice(0, 1000);
    const provider = (body?.provider || "auto") as Provider;

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    const res = await startGeneration(prompt, provider); // { id, provider }
    return new Response(JSON.stringify(res), {
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
