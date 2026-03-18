import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Lazy init — build sırasında değil, runtime'da initialize edilir
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const { package: pkg } = await req.json();

    let priceId = "";

    if (pkg === "single") {
      priceId = process.env.STRIPE_PRICE_SINGLE!;
    }

    if (pkg === "bundle") {
      priceId = process.env.STRIPE_PRICE_BUNDLE!;
    }

    if (!priceId) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: "https://vibraxx.com/payment-success",
      cancel_url: "https://vibraxx.com/payment-cancel",
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    return NextResponse.json({ error: "Stripe session error" }, { status: 500 });
  }
}
