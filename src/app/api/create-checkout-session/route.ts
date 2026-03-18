import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Paket → para birimi → price ID
const PRICE_IDS: Record<string, Record<string, string>> = {
  single: {
    GBP: "price_1TBy6HHXgvgwDNBOzy4kUb4C",
    USD: "price_1TByHpHXgvgwDNBOu2bgqzn3",
    AUD: "price_1TByHpHXgvgwDNBOYSgUaE8m",
    CAD: "price_1TByHpHXgvgwDNBObfcxgfqV",
    EUR: "price_1TByEoHXgvgwDNBOCX6oBWBo",
  },
  bundle: {
    GBP: "price_1TByLbHXgvgwDNBO2c3EsG4K",
    USD: "price_1TBySdHXgvgwDNBOWGTB0AIM",
    AUD: "price_1TBySdHXgvgwDNBOHa0YVcaV",
    CAD: "price_1TBySdHXgvgwDNBOgzSTNCK4",
    EUR: "price_1TBySdHXgvgwDNBOnhPlewFQ",
  },
};

// Paket → kredi miktarı
const PACKAGE_CREDITS: Record<string, number> = {
  single: 3,
  bundle: 30,
};

// Desteklenen para birimleri
const SUPPORTED_CURRENCIES = ["GBP", "USD", "AUD", "CAD", "EUR"];

export async function POST(req: Request) {
  try {
    const { package: pkg, user_id, currency: requestedCurrency } = await req.json();

    if (!pkg || !PRICE_IDS[pkg]) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Currency doğrula — desteklenmiyorsa GBP'ye düş
    const currency = SUPPORTED_CURRENCIES.includes(requestedCurrency?.toUpperCase())
      ? requestedCurrency.toUpperCase()
      : "GBP";

    const priceId  = PRICE_IDS[pkg][currency];
    const credits  = PACKAGE_CREDITS[pkg];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      metadata: {
        user_id,
        package: pkg,
        credits: credits.toString(),
        currency,
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
