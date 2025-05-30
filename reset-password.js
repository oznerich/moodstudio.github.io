import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzczMjk5MCwiZXhwIjoyMDYzMzA4OTkwfQ.zILANJgS0HHNhgv40m6yYxHCceV3J9Upaoi_hJ4dTsU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const resetBtn = document.getElementById('reset-btn');
const messageEl = document.getElementById('message');

function showMessage(text, isError) {
  messageEl.textContent = text;
  messageEl.className = isError ? 'error' : 'success';
}

resetBtn.addEventListener('click', async () => {
  const userId = document.getElementById('user-id').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  if (!userId || !newPassword) {
    showMessage('All fields are required.', true);
    return;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    showMessage('Error: ' + error.message, true);
    return;
  }

  showMessage('Password reset successfully!', false);
});
