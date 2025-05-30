import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://rdgahcjjbewvyqcfdtih.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function handleSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const access_token = urlParams.get("access_token");

  if (!access_token) {
    alert("Invalid reset link: no access token found.");
    return false;
  }

  const { error } = await supabase.auth.setSession({ access_token });
  if (error) {
    alert("Error setting session: " + error.message);
    return false;
  }
  return true;
}

async function resetPassword() {
  const newPassword = document.getElementById("new-password").value.trim();

  if (!newPassword) {
    alert("Please enter a new password.");
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    alert("Error updating password: " + error.message);
  } else {
    alert("Password updated successfully! Redirecting to login...");
    window.location.href = "index.html";
  }
}

handleSession();
document.getElementById("submit-btn").addEventListener("click", resetPassword);
