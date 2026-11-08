import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_URL = "https://flcqouvjmuhfuemybokk.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY3FvdXZqbXVoZnVlbXlib2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTQ0MzIsImV4cCI6MjEwOTczMDQzMn0.dcbkiDMt04w4M_e1Jplzz7lS_VqJsgfz9200AG2MpgM";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
