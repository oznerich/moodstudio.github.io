import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
)

async function resetPassword() {
  const password = document.getElementById('new-password').value.trim()
  if (!password) {
    alert('Please enter a new password.')
    return
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    alert('Error: ' + error.message)
  } else {
    alert('Password updated successfully!')
    window.location.href = 'index.html'
  }
}

// Expose to global scope so onclick works in HTML
window.resetPassword = resetPassword
