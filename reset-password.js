document.addEventListener('DOMContentLoaded', () => {
  const supabase = supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU' // replace with your anon key
  );

  const emailInput = document.getElementById('email');
  const otpInput = document.getElementById('otp');
  const passwordInput = document.getElementById('new-password');
  const resetBtn = document.getElementById('reset-btn');
  const messageEl = document.getElementById('message');

  function showMessage(msg, isError = false) {
    messageEl.textContent = msg;
    messageEl.className = isError ? 'error' : 'success';
  }

  resetBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    const newPassword = passwordInput.value.trim();

    if (!email) {
      showMessage('Please enter your email.', true);
      return;
    }
    if (!otp || otp.length !== 6) {
      showMessage('Please enter the 6-digit code from your email.', true);
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters.', true);
      return;
    }

    resetBtn.disabled = true;
    showMessage('Verifying code and resetting password...', false);

    // Step 1: Verify OTP token
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'recovery',
    });

    if (verifyError) {
      showMessage('Failed to verify code: ' + verifyError.message, true);
      resetBtn.disabled = false;
      return;
    }

    // Step 2: Update password for the logged in user
    const { data: user, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      showMessage('Failed to update password: ' + updateError.message, true);
      resetBtn.disabled = false;
      return;
    }

    showMessage('Password updated successfully! Redirecting...', false);

    setTimeout(() => {
      window.location.href = '/'; // Redirect to home or login page
    }, 1500);
  });
});

