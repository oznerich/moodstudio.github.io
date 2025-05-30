import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

// Minimal password check
function isValidPassword(pwd) {
  return pwd.length >= 6
}

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  
  if (!isValidPassword(password)) {
    showMessage('Password must be at least 6 characters')
    return
  }

  try {
    // Get token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const token = hashParams.get('access_token') || hashParams.get('token')
    
    if (!token) {
      showMessage('Invalid reset link')
      return
    }

    // Bypass session setting and update password directly
    const { error } = await supabase.auth.api.updateUser(token, {
      password: password
    })

    if (error) throw error
    
    showMessage('Password changed successfully! Redirecting...', false)
    setTimeout(() => window.location.href = 'index.html', 1500)
  } catch (error) {
    showMessage(error.message.includes('JWT') 
      ? 'Expired link. Request a new reset email.' 
      : error.message)
  }
}

function showMessage(text, isError = true) {
  const el = document.getElementById('message')
  el.textContent = text
  el.className = isError ? 'error' : 'success'
}

// Make function available to button click
window.resetPassword = resetPassword
