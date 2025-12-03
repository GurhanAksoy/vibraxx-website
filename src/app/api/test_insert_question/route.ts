import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error, data } = await supabase
    .from("questions")
    .insert({
      question_text: "RLS TEST",
      option_a: "A",
      option_b: "B",
      option_c: "C",
      option_d: "D"
    });

  return Response.json({ error, data });
}
