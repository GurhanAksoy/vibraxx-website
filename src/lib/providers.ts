// src/lib/providers.ts
export type Provider = "auto" | "runway" | "luma" | "demo";

const DEMO = (process.env.DEMO_MODE || "off").toLowerCase() === "on";

/** "auto" seçilirse hangi sağlayıcıya gideceğimizi belirler */
function pickAuto(): Provider {
  if (process.env.RUNWAY_API_KEY) return "runway";
  if (process.env.LUMA_API_KEY) return "luma";
  return "demo";
}

/** Dışarıya açtığımız: üretimi başlat */
export async function startGeneration(prompt: string, provider: Provider) {
  const chosen: Provider = provider === "auto" ? pickAuto() : provider;

  if (DEMO || chosen === "demo") {
    // Demo mod: direkt sahte id döneriz; status endpoint hep succeeded döndürecek
    return { id: "demo", provider: "demo" as const };
  }

  if (chosen === "runway") {
    return await startRunway(prompt);
  }
  if (chosen === "luma") {
    // NOT: Luma entegrasyonunu bilerek stub bıraktık; sonra gerçek endpoint ile dolduracağız.
    throw new Error("Luma provider is not enabled yet. Use provider='runway' or turn DEMO_MODE=on.");
  }

  // Fallback
  return { id: "demo", provider: "demo" as const };
}

/** Dışarıya açtığımız: durum sorgula */
export async function getStatus(id: string, provider: Provider) {
  const chosen: Provider = provider === "auto" ? pickAuto() : provider;

  if (DEMO || chosen === "demo" || id === "demo") {
    return demoStatus();
  }
  if (chosen === "runway") {
    return await runwayStatus(id);
  }
  if (chosen === "luma") {
    throw new Error("Luma status is not implemented yet.");
  }

  return demoStatus();
}

/* --------------------------- RUNWAY --------------------------- */

async function startRunway(prompt: string) {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) throw new Error("RUNWAY_API_KEY missing");

  const version = process.env.RUNWAY_VERSION || "2024-11-06";
  const model = process.env.RUNWAY_MODEL || "gen4_turbo";
  const ratio = process.env.RUNWAY_RATIO || "1280:720";
  const duration = Number(process.env.RUNWAY_DURATION || 10);
  const seed = Math.floor(Math.random() * 4294967295);

  const resp = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`,
      "x-runway-version": version,
    } as any,
    body: JSON.stringify({
      promptText: prompt,
      promptImage: "https://picsum.photos/960/540", // zorunlu alanı dummy ile dolduruyoruz
      model,
      ratio,
      duration,
      seed,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Runway start failed: ${resp.status} ${txt}`);
  }
  const json: any = await resp.json();
  return { id: json.id as string, provider: "runway" as const };
}

async function runwayStatus(id: string) {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) throw new Error("RUNWAY_API_KEY missing");

  const version = process.env.RUNWAY_VERSION || "2024-11-06";
  const resp = await fetch(`https://api.dev.runwayml.com/v1/tasks/${id}`, {
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "x-runway-version": version,
    } as any,
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Runway status failed: ${resp.status} ${txt}`);
  }

  const js: any = await resp.json();
  // Normalleştirilmiş çıktı
  let output: any[] | undefined = undefined;
  if (js?.result?.video?.url) {
    output = [{ asset_url: js.result.video.url }];
  } else if (Array.isArray(js?.output) && js.output[0]?.asset_url) {
    output = js.output;
  }

  return {
    provider: "runway",
    status: js?.status || "unknown",
    output,
    raw: js,
  };
}

/* --------------------------- DEMO --------------------------- */

function demoStatus() {
  // Eğer public/sample/demo.mp4 dosyasını koyarsan buradan servis edilir.
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const url = `${base}/sample/demo.mp4`;
  return {
    provider: "demo",
    status: "succeeded",
    output: [{ asset_url: url }],
    raw: { note: "demo mode" },
  };
}
