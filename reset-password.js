import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
);

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters")
    return
  }

  try {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.hash.substring(1))
    const token = urlParams.get('token')

    if (!token) {
      showMessage("Invalid reset link. Use the email link.")
      return
    }

    // Verify the token & update password
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token: token
    })

    if (error) throw error

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) throw updateError

    showMessage("Password updated! Redirecting...", true)
    setTimeout(() => window.location.href = "/", 1500)
  } catch (error) {
    showMessage(error.message || "Failed to reset password")
  }
}

function showMessage(text, isSuccess = false) {
  const el = document.getElementById('message')
  el.textContent = text
  el.className = isSuccess ? 'success' : 'error'
}

window.resetPassword = resetPassword
