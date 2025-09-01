// src/lib/providers/index.ts
import { startRunway, statusRunway } from "./runway";
import { startLuma, statusLuma } from "./luma";

export type Provider = "runway" | "luma" | "auto";

export async function startGeneration(prompt: string, provider: Provider) {
  const p = provider === "auto" ? chooseProvider() : provider;
  if (p === "runway") return { provider: "runway", ...(await startRunway(prompt)) };
  if (p === "luma")   return { provider: "luma",   ...(await startLuma(prompt)) };
  throw new Error("Unknown provider");
}

export async function getStatus(id: string, provider: Provider) {
  const p = provider === "auto" ? chooseProvider() : provider;
  if (p === "runway") return await statusRunway(id);
  if (p === "luma")   return await statusLuma(id);
  throw new Error("Unknown provider");
}

// Basit seçim kuralı: Luma anahtar varsa Luma, yoksa Runway
function chooseProvider(): Provider {
  if (process.env.LUMA_API_KEY) return "luma";
  if (process.env.RUNWAY_API_KEY) return "runway";
  throw new Error("No provider configured");
}
