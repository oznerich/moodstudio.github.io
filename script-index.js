import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase credentials
const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const joinNow = document.getElementById('joinNow');
  const userMenu = document.getElementById('userMenu');
  const userNameBtn = document.getElementById('userName');
  const dropdown = userMenu?.querySelector('.dropdown');

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Logged in
    joinNow.classList.add('hidden');
    userMenu.classList.remove('hidden');

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "User";
    userNameBtn.textContent = `${fullName} ▾`;

    userNameBtn.onclick = () => {
      dropdown?.classList.toggle('hidden');
    };

  } else {
    // Not logged in
    joinNow.classList.remove('hidden');
    userMenu.classList.add('hidden');
    dropdown?.classList.add('hidden');
    userNameBtn.textContent = '';
  }
});

window.logout = async function () {
  await supabase.auth.signOut();

  // Clean up UI manually to prevent flash
  document.getElementById('joinNow')?.classList.remove('hidden');
  const userMenu = document.getElementById('userMenu');
  const dropdown = userMenu?.querySelector('.dropdown');
  const userNameBtn = document.getElementById('userName');

  userMenu?.classList.add('hidden');
  dropdown?.classList.add('hidden');
  if (userNameBtn) userNameBtn.textContent = '';

  location.reload();
};
