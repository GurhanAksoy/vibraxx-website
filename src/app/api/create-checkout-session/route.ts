import Stripe from "stripe";
import { NextResponse } from "next/server";

// Paket → kredi miktarı mapping
const PACKAGE_CREDITS: Record<string, number> = {
  single: 3,
  bundle: 30,
};

// Paket → Stripe Price ID mapping
const PACKAGE_PRICE_IDS: Record<string, string> = {
  single: "price_1TBy6HHXgvgwDNBOzy4kUb4C",  // Starter Pack (3 Rounds) — £3.00
  bundle: "price_1TByLbHXgvgwDNBO2c3EsG4K",  // Champion Bundle (30 Rounds) — £18.00
};

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const { package: pkg, user_id } = await req.json();

    if (!pkg || !PACKAGE_PRICE_IDS[pkg]) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const priceId = PACKAGE_PRICE_IDS[pkg];
    const credits = PACKAGE_CREDITS[pkg];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      // Webhook'ta kimin ödeme yaptığını ve kaç kredi ekleyeceğimizi bilmek için
      metadata: {
        user_id,
        package: pkg,
        credits: credits.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/buy`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("[Stripe] Checkout session error:", error);
    return NextResponse.json({ error: "Stripe session error" }, { status: 500 });
  }
}
