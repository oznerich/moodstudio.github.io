import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Initialize Supabase
const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reset-btn').addEventListener('click', resetPassword)
})

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  
  // Basic validation
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters')
    return
  }

  try {
    // Get token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const token = hashParams.get('access_token')
    
    if (!token) {
      showMessage('Invalid reset link. Please use the link from your email.')
      return
    }

    // Verify the token first
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token: token
    })

    if (verifyError) throw verifyError

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) throw updateError
    
    showMessage('Password changed successfully! Redirecting...', false)
    setTimeout(() => window.location.href = 'index.html', 1500)
  } catch (error) {
    console.error('Password reset error:', error)
    showMessage(
      error.message.includes('JWT') ? 
      'Expired or invalid link. Please request a new password reset.' :
      error.message
    )
  }
}

function showMessage(text, isSuccess = false) {
  const el = document.getElementById('message')
  el.textContent = text
  el.className = isSuccess ? 'success' : 'error'
}
