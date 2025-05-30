const supabase = supabase.createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  
  if (password.length < 6) {
    showMessage("Password must be at least 6 characters")
    return
  }

  try {
    // Get token from URL
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    
    if (!token) throw new Error("Invalid reset link")

    // Update password directly
    const { error } = await supabase.auth.api.updateUser(token, {
      password: password
    })

    if (error) throw error
    
    showMessage("Password changed! Redirecting...", true)
    setTimeout(() => window.location.href = "/", 1500)
  } catch (error) {
    showMessage(error.message || "Failed to reset password")
  }
}

function showMessage(text, isSuccess = false) {
  const el = document.getElementById('message')
  el.textContent = text
  el.style.color = isSuccess ? 'green' : 'red'
}
