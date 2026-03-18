import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Global — her request'te yeniden oluşturma
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[Webhook] No stripe-signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[Webhook] Event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("[Webhook] Session ID:", session.id);
    console.log("[Webhook] Payment status:", session.payment_status);
    console.log("[Webhook] Metadata:", session.metadata);

    if (session.payment_status !== "paid") {
      console.log("[Webhook] Payment not completed, skipping");
      return NextResponse.json({ received: true });
    }

    const { user_id, package: pkg, credits } = session.metadata ?? {};

    if (!user_id || !credits) {
      console.error("[Webhook] Missing metadata — user_id:", user_id, "credits:", credits);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const creditsNum = parseInt(credits, 10);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      console.error("[Webhook] Invalid credits value:", credits);
      return NextResponse.json({ error: "Invalid credits" }, { status: 400 });
    }

    // Idempotency key — session.id Stripe tarafından her ödeme için unique
    const reason = `stripe_${pkg}_${session.id}`;

    const { error } = await supabaseAdmin.rpc("add_paid_credits", {
      p_user_id: user_id,
      p_credits: creditsNum,
      p_reason:  reason,
    });

    if (error) {
      console.error("[Webhook] add_paid_credits error:", error);
      return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
    }

    console.log(`[Webhook] ✅ ${creditsNum} credits added → user: ${user_id} | pkg: ${pkg} | reason: ${reason}`);
  }

  return NextResponse.json({ received: true });
}
