document.addEventListener('DOMContentLoaded', async function () {
  const supabase = window.supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
  );

  const resetBtn = document.getElementById('reset-btn');

  // ⛔ Disable button until session is confirmed
  resetBtn.disabled = true;

  // ✅ Wait for Supabase to detect session from URL
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    showMessage("Invalid or expired reset link. Please request a new one.", true);
    return;
  }

  // ✅ Enable button now that session is ready
  resetBtn.disabled = false;

  resetBtn.addEventListener('click', async function () {
    const password = document.getElementById('new-password').value.trim();

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", true);
      return;
    }

    try {
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
