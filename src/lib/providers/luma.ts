// src/lib/providers/luma.ts

const BASE = "https://api.lumalabs.ai/dream-machine"; // Dokümandan teyit et

export async function startLuma(prompt: string) {
  const apiKey = process.env.LUMA_API_KEY!;
  const model = process.env.LUMA_MODEL || "ray-2";
  const ratio = process.env.LUMA_RATIO || "1280:720";
  const duration = Number(process.env.LUMA_DURATION || 10);

  if (!apiKey) throw new Error("LUMA_API_KEY not set");

  // Luma’da text->video endpoint adı dokümana göre değişebilir.
  // Sıklıkla /video/text-to-video veya /generations gibi geçer.
  // Panelde gördüğün "Ray 2 Text to Video" endpoint path’ini buraya yaz.
  const endpoint = `${BASE}/video/text-to-video`; // Gerekirse düzelt

  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      promptText: prompt,
      model,            // "ray-2" | "ray-flash-2" | "ray-1.6"
      ratio,            // "1280:720" vb.
      duration,         // 5–10 sn bandında
      fps: 24,          // varsa destekleniyorsa
      seed: Math.floor(Math.random() * 4294967295),
    }),
  });

  if (!r.ok) throw new Error(`Luma start failed: ${r.status} ${await r.text()}`);
  return (await r.json()) as { id: string };
}

export async function statusLuma(id: string) {
  const apiKey = process.env.LUMA_API_KEY!;
  if (!apiKey) throw new Error("LUMA_API_KEY not set");

  // Panelde “Get task detail” gibi bir endpoint olur. Yolunu kontrol et.
  const r = await fetch(`${BASE}/tasks/${id}`, {
    headers: { authorization: `Bearer ${apiKey}` },
  });

  if (!r.ok) throw new Error(`Luma status failed: ${r.status} ${await r.text()}`);
  return await r.json();
}
