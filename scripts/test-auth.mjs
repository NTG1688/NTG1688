import { createClient } from '@supabase/supabase-js';

const url = 'https://flcqouvjmuhfuemybokk.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY3FvdXZqbXVoZnVlbXlib2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTQ0MzIsImV4cCI6MjEwOTczMDQzMn0.dcbkiDMt04w4M_e1Jplzz7lS_VqJsgfz9200AG2MpgM';

const supabase = createClient(url, anonKey);

async function checkAuth() {
  console.log("=== TESTING SUPABASE AUTH ===");
  // Test signing in or signing up
  const testEmail = 'customer.test@namtrunglog.com';
  const testPassword = 'NamTrungLog@2026';

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log("Sign in test:", signInError.message);
    console.log("Creating test user...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    if (signUpError) {
      console.log("Sign up test error:", signUpError.message);
    } else {
      console.log("Sign up test success! User ID:", signUpData.user?.id);
    }
  } else {
    console.log("Sign in test success! User ID:", signInData.user?.id);
  }
}

checkAuth();
