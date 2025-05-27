// Import Supabase client as ES module
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Make functions global so onclick handlers in HTML can find them
window.showTab = showTab;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.togglePassword = togglePassword;
window.filterBookings = filterBookings;

// Show/hide tabs and set active sidebar item
function showTab(tabId, element) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add("active");
  if (element) element.classList.add("active");

  if (tabId === 'user-management') loadUsers();
}

// Load users from Supabase
async function loadUsers() {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userList = document.getElementById('users-list');
    userList.innerHTML = users.map(user => `
      <li class="user-item" data-id="${user.id}">
        <span>${user.first_name} ${user.last_name} (${user.email})</span>
        <div>
          <button class="edit-btn" onclick="editUser('${user.id}')">Edit</button>
          <button class="edit-btn" style="background-color:#dc3545" onclick="deleteUser('${user.id}')">Delete</button>
        </div>
      </li>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('users-list').innerHTML = `<li class="user-item error">Error loading users</li>`;
  }
}

// Add new user (auth + profile)
async function addUser(event) {
  event.preventDefault();
  const form = event.target;
  const userData = {
    email: form.querySelector('input[type="email"]').value,
    first_name: form.querySelector('input[placeholder="First Name"]').value,
    last_name: form.querySelector('input[placeholder="Last Name"]').value,
    birthday: form.querySelector('input[placeholder="Birthday"]').value,
    contact: form.querySelector('input[placeholder="Contact No."]').value,
    password: form.querySelector('#password').value,
  };

  try {
    // Signup via Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    // Insert profile row linked to auth user
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      birthday: userData.birthday,
      contact: userData.contact,
      role: 'User',
    });

    if (profileError) throw profileError;

    alert('User added successfully!');
    form.reset();
    loadUsers();
  } catch (error) {
    alert('Error adding user: ' + error.message);
  }
}

// Edit user (simplified example)
function editUser(userId) {
  alert('Edit user feature coming soon for user ID: ' + userId);
}

// Delete user by ID
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    // Delete profile row
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
    if (profileError) throw profileError;

    // Delete auth user (requires supabase admin API, not possible client-side)
    alert('Profile deleted, but auth user deletion must be handled separately.');

    loadUsers();
  } catch (error) {
    alert('Error deleting user: ' + error.message);
  }
}

// Toggle password visibility in form
function togglePassword() {
  const pwdInput = document.getElementById('password');
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
  } else {
    pwdInput.type = 'password';
  }
}

// Filter booking list by timeframe (placeholder function)
function filterBookings() {
  const filter = document.getElementById('bookingFilter').value;
  alert('Booking filter applied: ' + filter);
}

// Add user form submit handler
document.getElementById('addUserForm').addEventListener('submit', addUser);

// Initialize: load users if on user management tab
if (document.getElementById('user-management').classList.contains('active')) {
  loadUsers();
}
