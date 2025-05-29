import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase credentials
const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log("User loaded:", user);

  const joinNow = document.getElementById('joinNow');
  const userMenu = document.getElementById('userMenu');
  const userNameBtn = document.getElementById('userName');

  if (!user) {
    console.log("No user logged in.");
    joinNow.classList.remove('hidden');
    userMenu.classList.add('hidden');
    return;
  }

  // Hide Join Now, show user menu
  joinNow.classList.add('hidden');
  userMenu.classList.remove('hidden');

  // Get user's full name from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error("Could not load profile:", profileError);
    userNameBtn.textContent = "User ▾";
  } else {
    const fullName = `${profile.first_name} ${profile.last_name}`.trim();
    userNameBtn.textContent = `${fullName} ▾`;
  }

  // Toggle dropdown visibility
  userNameBtn.onclick = () => {
    userMenu.classList.toggle('show');
  };
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.reload();
};
