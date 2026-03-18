import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase service role client — RLS bypass için
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  // Raw body — Stripe imza doğrulaması için şart
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Sadece başarılı ödeme event'ini işle
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Ödeme gerçekten tamamlandı mı?
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const { user_id, package: pkg, credits } = session.metadata ?? {};

    if (!user_id || !credits) {
      console.error("[Webhook] Missing metadata:", session.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const creditsNum = parseInt(credits, 10);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      console.error("[Webhook] Invalid credits value:", credits);
      return NextResponse.json({ error: "Invalid credits" }, { status: 400 });
    }

    // Kredi ekle — RPC üzerinden (ledger'a da yazar)
    const { error } = await supabaseAdmin.rpc("add_paid_credits", {
      p_user_id: user_id,
      p_credits: creditsNum,
      p_reason:  `stripe_${pkg}_${session.id}`,
    });

    if (error) {
      console.error("[Webhook] add_paid_credits error:", error);
      return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
    }

    console.log(`[Webhook] ✅ ${creditsNum} credits added to user ${user_id} (${pkg})`);
  }

  return NextResponse.json({ received: true });
}

// Next.js body parser'ı devre dışı bırak — Stripe raw body ister
export const config = {
  api: { bodyParser: false },
};
