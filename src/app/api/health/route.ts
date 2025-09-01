export async function GET() {
  // Sadece "VAR MI/YOK MU" bilgisini döndürüyoruz; değerlerin kendisini göstermiyoruz.
  const flags = {
    LUMA_API_KEY: !!process.env.LUMA_API_KEY,
    RUNWAY_API_KEY: !!process.env.RUNWAY_API_KEY,   // ✅ Bunu ekledik
    NEXT_PUBLIC_PADDLE_ENV: !!process.env.NEXT_PUBLIC_PADDLE_ENV,
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    PADDLE_WEBHOOK_SECRET: !!process.env.PADDLE_WEBHOOK_SECRET,
    MAINTENANCE: process.env.MAINTENANCE ?? null,
  };

  return new Response(JSON.stringify({ ok: true, env: flags }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
