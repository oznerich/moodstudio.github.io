import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters')
    return
  }

  try {
    // Extract token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const token = hashParams.get('access_token') || hashParams.get('token')
    
    if (!token) {
      showMessage('Invalid reset link')
      return
    }

    // Set session first (required for updateUser to work)
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })
    
    if (sessionError) throw sessionError

    // Now update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) throw updateError
    
    showMessage('Password changed successfully! Redirecting...', false)
    setTimeout(() => window.location.href = 'index.html', 1500)
  } catch (error) {
    showMessage(error.message.includes('JWT') 
      ? 'Expired or invalid link. Request a new reset email.' 
      : error.message)
  }
}

function showMessage(text, isError = true) {
  const el = document.getElementById('message')
  el.textContent = text
  el.className = isError ? 'error' : 'success'
}

window.resetPassword = resetPassword
