import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

function showMessage(text, isError = true) {
  const messageEl = document.getElementById('message')
  messageEl.textContent = text
  messageEl.className = isError ? 'error' : 'success'
}

async function setSessionFromUrl() {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const access_token = hashParams.get('access_token')
  const refresh_token = hashParams.get('refresh_token')

  if (!access_token) {
    showMessage('No access token found in URL. Please use the link from your email.')
    return false
  }

  try {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })
    
    if (error) throw error
    return true
  } catch (error) {
    showMessage(`Error setting session: ${error.message}`)
    return false
  }
}

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  
  if (!password) {
    showMessage('Please enter a new password.')
    return
  }

  const sessionSet = await setSessionFromUrl()
  if (!sessionSet) return

  try {
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) throw error
    
    showMessage('Password updated successfully! You will be redirected shortly.', false)
    setTimeout(() => {
      window.location.href = 'index.html'
    }, 2000)
  } catch (error) {
    showMessage(`Error updating password: ${error.message}`)
  }
}

window.resetPassword = resetPassword

// Check the URL when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  await setSessionFromUrl()
})
