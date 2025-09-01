// src/lib/providers/runway.ts
export async function startRunway(prompt: string) {
  const apiKey = process.env.RUNWAY_API_KEY!;
  const version = process.env.RUNWAY_VERSION || "2024-11-06";
  const model = process.env.RUNWAY_MODEL || "gen4_turbo";
  const ratio = process.env.RUNWAY_RATIO || "1280:720";
  const duration = Number(process.env.RUNWAY_DURATION || 10);

  if (!apiKey) throw new Error("RUNWAY_API_KEY not set");

  const r = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "x-runway-version": version,
    },
    body: JSON.stringify({
      promptText: prompt,
      // Runway bu endpointte bir başlangıç görüntüsü bekliyor.
      // Demo için dummy bir public görsel: (prod'da kendi placeholder'ını koy)
      promptImage: "https://picsum.photos/800/450",
      model,
      ratio,
      duration,
      seed: Math.floor(Math.random() * 4294967295),
    }),
  });

  if (!r.ok) throw new Error(`Runway start failed: ${r.status} ${await r.text()}`);
  return (await r.json()) as { id: string };
}

export async function statusRunway(id: string) {
  const apiKey = process.env.RUNWAY_API_KEY!;
  const version = process.env.RUNWAY_VERSION || "2024-11-06";
  if (!apiKey) throw new Error("RUNWAY_API_KEY not set");

  const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${id}`, {
    headers: { authorization: `Bearer ${apiKey}`, "x-runway-version": version },
  });
  if (!r.ok) throw new Error(`Runway status failed: ${r.status} ${await r.text()}`);
  return await r.json();
}
