import { getStatus, type Provider } from "@/lib/providers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const provider = (searchParams.get("provider") || "auto") as Provider;
    if (!id) return new Response("Missing id", { status: 400 });

    const resp = await getStatus(id, provider);
    return new Response(JSON.stringify(resp), {
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
