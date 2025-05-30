import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('reset-btn').addEventListener('click', resetPassword)
  
  // Extract token from URL immediately
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const access_token = hashParams.get('access_token')
  
  if (!access_token) {
    showMessage('Invalid reset link format', true)
    return
  }

  // Set session silently without throwing errors
  const { error } = await supabase.auth.setSession({
    access_token: access_token,
    refresh_token: access_token // Using same token for both
  })
  
  if (error) {
    showMessage('Link expired or invalid. Please request a new reset link.', true)
  }
})

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', true)
    return
  }

  try {
    // Verify we have a user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('No active session. Please use a valid reset link.')
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) throw updateError
    
    showMessage('Password updated successfully! Redirecting...', false)
    setTimeout(() => window.location.href = 'index.html', 1500)
  } catch (error) {
    showMessage(error.message || 'Failed to update password', true)
  }
}

function showMessage(text, isError = true) {
  const el = document.getElementById('message')
  el.textContent = text
  el.className = isError ? 'error' : 'success'
}
