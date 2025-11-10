export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Vibraxx respects your privacy. We collect only essential information required for gameplay,
        payment processing, and leaderboard display.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Data Collected</h2>
      <p className="mb-4">
        We store user ID, score data, and minimal analytics (e.g. region, browser type).
        Payment details are securely processed by Stripe; we never store card information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. GDPR Compliance</h2>
      <p className="mb-4">
        Vibraxx operates under GDPR and UK Data Protection Act 2018. You may request data deletion
        at any time by emailing contact@sermin.uk.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Cookies</h2>
      <p className="mb-4">
        Essential cookies are used for login sessions only. No tracking or advertising cookies are employed.
      </p>
    </main>
  );
}


