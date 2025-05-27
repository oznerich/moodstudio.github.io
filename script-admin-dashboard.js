import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ UI Tab Handling
function showTab(tabId, element) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add("active");
  if (element) element.classList.add("active");

  if (tabId === 'user-management') loadUsers();
}

// ✅ Load users from Supabase
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
        <span>${user.first_name} ${user.last_name} - ${user.email}</span>
        <button onclick="editUser('${user.id}')">Edit</button>
        <button onclick="deleteUser('${user.id}')">Delete</button>
      </li>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error.message);
  }
}

// Placeholder editUser function
function editUser(userId) {
  alert(`Edit user: ${userId} (functionality to be implemented)`);
}

// Placeholder deleteUser function
async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    alert("User deleted successfully.");
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error.message);
  }
}

// ✅ Toggle password visibility
function togglePassword() {
  const passInput = document.getElementById('password');
  if (passInput) {
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
  }
}

// ✅ Filter bookings placeholder
function filterBookings() {
  const filter = document.getElementById('bookingFilter').value;
  console.log('Filter bookings by:', filter);
  // Implement booking filtering logic here
}

// Expose functions globally so inline onclick can access them
window.showTab = showTab;
window.togglePassword = togglePassword;
window.filterBookings = filterBookings;
window.editUser = editUser;
window.deleteUser = deleteUser;

// TODO: Add other logic for appointment and booking loading/manipulation here

