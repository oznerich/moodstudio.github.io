import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('reset-btn');
  const messageEl = document.getElementById('message');

  function showMessage(text, isError) {
    messageEl.textContent = text;
    messageEl.style.color = isError ? 'red' : 'green';
  }

  resetBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const token = document.getElementById('otp').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();

    if (!email) return showMessage('Please enter your email.', true);
    if (!token || token.length !== 6) return showMessage('Please enter the 6-digit code.', true);
    if (newPassword.length < 6) return showMessage('Password must be at least 6 characters.', true);

    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
    if (verifyError) return showMessage('OTP verification error: ' + verifyError.message, true);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) return showMessage('Update error: ' + updateError.message, true);

    showMessage('Password updated successfully! Redirecting...', false);
    setTimeout(() => window.location.href = '/', 1500);
  });
});
