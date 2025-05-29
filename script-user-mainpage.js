import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase credentials
const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // replace with your full anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const joinNow = document.getElementById('joinNow');
  const userMenu = document.getElementById('userMenu');
  const userNameBtn = document.getElementById('userName');

  if (!user) {
    joinNow.classList.remove('hidden');
    userMenu.classList.add('hidden');
    return;
  }

  // Hide Join Now, show dropdown
  joinNow.classList.add('hidden');
  userMenu.classList.remove('hidden');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  if (!error && profile) {
    const fullName = `${profile.first_name} ${profile.last_name}`.trim();
    userNameBtn.textContent = `${fullName} ▾`;
  }

  userNameBtn.onclick = () => {
    userMenu.querySelector('.dropdown').classList.toggle('hidden');
  };
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.reload();
};
