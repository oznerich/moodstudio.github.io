// Initialize Supabase when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create Supabase client
  const supabase = supabase.createClient(
    'https://rdgahcjjbewvyqcfdtih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
  )

  document.getElementById('reset-btn').addEventListener('click', async function() {
    const password = document.getElementById('new-password').value.trim()
    const messageEl = document.getElementById('message')
    
    // Basic validation
    if (password.length < 6) {
      messageEl.textContent = "Password must be at least 6 characters"
      messageEl.className = "error"
      return
    }

    try {
      // Extract token from URL hash
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      
      if (!access_token) {
        throw new Error("Invalid reset link - missing token")
      }

      // Debug: Log the token (remove in production)
      console.log("Token received:", access_token)

      // Set session with the token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: access_token,
        refresh_token: access_token
      })
      
      if (sessionError) throw sessionError

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError
      
      // Success
      messageEl.textContent = "Password updated successfully! Redirecting..."
      messageEl.className = "success"
      setTimeout(() => window.location.href = "/", 1500)
      
    } catch (error) {
      console.error("Password reset error:", error)
      messageEl.textContent = error.message.includes("JWT") 
        ? "Expired or invalid link. Please request a new reset email."
        : error.message || "Failed to reset password"
      messageEl.className = "error"
    }
  })
})
