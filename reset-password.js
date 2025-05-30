document.addEventListener('DOMContentLoaded', async function() {
  const supabase = window.supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'public-anon-key-here' // use anon key, NOT service role
  );

  const resetBtn = document.getElementById('reset-btn');

  resetBtn.addEventListener('click', async function () {
    const password = document.getElementById('new-password').value.trim();
    const messageEl = document.getElementById('message');

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", true);
      return;
    }

    try {
      // Supabase auto-initializes session from URL on password reset
      const { data: user, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      showMessage("Password updated successfully! Redirecting...", false);
      setTimeout(() => window.location.href = "/", 1500);

    } catch (error) {
      console.error("Reset error:", error);
      showMessage(
        error.message.includes("JWT") ? 
          "Expired or invalid link. Please request a new reset email." : 
          error.message || "Failed to reset password",
        true
      );
    }
  });

  function showMessage(text, isError) {
    const el = document.getElementById('message');
    el.textContent = text;
    el.className = isError ? 'error' : 'success';
  }
});
