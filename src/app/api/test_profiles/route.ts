import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error, data } = await supabase
    .from("profiles")
    .insert({
      id: crypto.randomUUID(),
      username: "hack_user",
      country: "TR"
    });

  return Response.json({ error, data });
}
