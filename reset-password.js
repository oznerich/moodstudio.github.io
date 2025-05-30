document.addEventListener('DOMContentLoaded', () => {
  // Now the supabase global is definitely available
  const supabase = window.supabase.createClient(
    'https://your-project-url.supabase.co',
    'your-anon-public-key'
  );

  const resetBtn = document.getElementById('reset-btn');
  const messageEl = document.getElementById('message');
  const passwordInput = document.getElementById('new-password');

  resetBtn.addEventListener('click', async () => {
    const newPassword = passwordInput.value.trim();
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }

    // Get token and email from URL or form (depending on your flow)
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email'); // if you have email in query string
    const token = passwordInput.dataset.token; // or get OTP token input by user

    if (!email || !token) {
      showMessage('Missing email or token.', true);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (error) {
      showMessage('Error verifying OTP: ' + error.message, true);
      return;
    }

    // Now update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      showMessage('Error updating password: ' + updateError.message, true);
      return;
    }

    showMessage('Password updated successfully! Redirecting...', false);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  });

  function showMessage(text, isError) {
    messageEl.textContent = text;
    messageEl.className = isError ? 'error' : 'success';
  }
});
