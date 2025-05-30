import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? 'error' : 'success';
}

// Get token from URL fragment
const hash = window.location.hash.substring(1);
const params = new URLSearchParams(hash);
const access_token = params.get("access_token");
const type = params.get("type");

if (type !== "recovery" || !access_token) {
  showMessage("Invalid or missing token in URL.", true);
}

resetBtn.addEventListener('click', async () => {
  const newPassword = document.getElementById('new-password').value.trim();
  if (newPassword.length < 6) {
    return showMessage("Password must be at least 6 characters.", true);
  }

  // Set session using the token
  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token: access_token // For recovery flow, refresh_token isn't needed
  });

  if (sessionError) {
    return showMessage("Invalid or expired token. Please try resetting again.", true);
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return showMessage("Failed to update password: " + updateError.message, true);
  }

  showMessage("Password updated successfully! Redirecting...");
  setTimeout(() => {
    window.location.href = "/";
  }, 2000);
});
