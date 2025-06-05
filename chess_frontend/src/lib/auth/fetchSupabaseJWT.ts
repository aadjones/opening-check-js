import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function fetchSupabaseJWT({
  sub,
  email,
  lichess_username,
}: {
  sub: string;
  email?: string;
  lichess_username?: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke("sign-jwt", {
    body: { sub, email, lichess_username },
  });
  if (error) throw error;
  return data.token as string;
}
