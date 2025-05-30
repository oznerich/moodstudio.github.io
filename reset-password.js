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
  const email = document.getElementById('email').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  if (!email || !newPassword) {
    showMessage('Please enter both email and new password.', true);
    return;
  }

  const { data, error: fetchError } = await supabase.auth.admin.listUsers({
    email: email,
  });

  if (fetchError) {
    showMessage('Error fetching user: ' + fetchError.message, true);
    return;
  }

  const users = data?.users;

  if (!users || users.length === 0) {
    showMessage('No user found with that email.', true);
    return;
  }

  const user = users[0];

  const { error: resetError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (resetError) {
    showMessage('Error resetting password: ' + resetError.message, true);
    return;
  }

  showMessage('Password reset successfully for user: ' + email, false);
});
