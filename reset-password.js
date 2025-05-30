(async () => {
  const supabase = window.supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
  );

  const messageEl = document.getElementById('message');
  const resetBtn = document.getElementById('reset-btn');
  const passwordInput = document.getElementById('new-password');

  // Extract access_token from URL hash
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const access_token = hashParams.get('access_token');

  if (!access_token) {
    showMessage('Invalid or missing reset token. Please request a new reset email.', true);
    resetBtn.disabled = true;
    passwordInput.disabled = true;
    return;
  }

  // Set the Supabase session with the access_token from URL hash
  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token: access_token,
  });

  if (sessionError) {
    showMessage('Session error: ' + sessionError.message, true);
    resetBtn.disabled = true;
    passwordInput.disabled = true;
    return;
  }

  // On button click, update password
  resetBtn.addEventListener('click', async () => {
    const newPassword = passwordInput.value.trim();

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters.', true);
      return;
    }

    resetBtn.disabled = true;
    showMessage('Updating password...', false);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      showMessage('Error updating password: ' + updateError.message, true);
      resetBtn.disabled = false;
      return;
    }

    showMessage('Password updated successfully! Redirecting...', false);

    setTimeout(() => {
      window.location.href = '/'; // Redirect after success
    }, 1500);
  });

  function showMessage(text, isError) {
    messageEl.textContent = text;
    messageEl.className = isError ? 'error' : 'success';
  }
})();
