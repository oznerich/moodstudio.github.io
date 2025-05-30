document.addEventListener('DOMContentLoaded', () => {
  const supabase = window.supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'your-anon-public-key-here'
  );

  const resetBtn = document.getElementById('reset-btn');
  const messageEl = document.getElementById('message');

  resetBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const token = document.getElementById('otp').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();

    if (!email) {
      showMessage('Please enter your email.', true);
      return;
    }
    if (!token || token.length !== 6) {
      showMessage('Please enter the 6-digit code from your email.', true);
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters.', true);
      return;
    }

    // Verify OTP token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (verifyError) {
      showMessage('Error verifying OTP: ' + verifyError.message, true);
      return;
    }

    // Update password after verification
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
