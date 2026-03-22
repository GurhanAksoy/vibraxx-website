import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

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

  // === SADECE PAID CHECKOUT ===
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log("[Webhook] Payment not completed, skipping");
      return NextResponse.json({ received: true });
    }

    const { user_id, package: pkg, credits } = session.metadata ?? {};

    if (!user_id || !credits) {
      console.error("[Webhook] Missing metadata");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const creditsNum = parseInt(credits, 10);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      console.error("[Webhook] Invalid credits:", credits);
      return NextResponse.json({ error: "Invalid credits" }, { status: 400 });
    }

    // =========================================
    // 🧠 1. STRIPE EVENT INGEST (CRITICAL FIX)
    // =========================================
    const { data: inserted, error: ingestError } =
      await supabaseAdmin.rpc("v2_stripe_ingest_event", {
        p_event_id: event.id,
        p_details: event,
      });

    if (ingestError) {
      console.error("[Webhook] ingest error:", ingestError);
      return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
    }

    // Eğer event daha önce işlendi ise → STOP
    if (!inserted) {
      console.log("[Webhook] Duplicate event, skipping");
      return NextResponse.json({ received: true });
    }

    // =========================================
    // 💰 2. CREDIT YÜKLE (MEVCUT SİSTEM)
    // =========================================
    const reason = `stripe_${pkg}_${session.id}`;

    const { error: creditError } = await supabaseAdmin.rpc("add_paid_credits", {
      p_user_id: user_id,
      p_credits: creditsNum,
      p_reason: reason,
    });

    if (creditError) {
      console.error("[Webhook] add_paid_credits error:", creditError);
      return NextResponse.json({ error: "Credit failed" }, { status: 500 });
    }

    console.log(
      `[Webhook] ✅ ${creditsNum} credits added | user=${user_id} | pkg=${pkg}`
    );
  }

  return NextResponse.json({ received: true });
}