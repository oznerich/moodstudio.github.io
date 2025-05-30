document.addEventListener('DOMContentLoaded', function() {
  // Initialize Supabase client AFTER the library is loaded
  const supabase = window.supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
  );

  const resetBtn = document.getElementById('reset-btn');
  
  resetBtn.addEventListener('click', async function() {
    const password = document.getElementById('new-password').value.trim();
    const messageEl = document.getElementById('message');
    
    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", true);
      return;
    }

    try {
      // Extract token from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get('access_token');
      
      if (!access_token) {
        throw new Error("Invalid reset link - please use the link from your email");
      }

      // Set session with the token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: access_token,
        refresh_token: access_token
      });
      
      if (sessionError) throw sessionError;

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
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
