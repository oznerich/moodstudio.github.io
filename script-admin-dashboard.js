import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://rdgahcjjbewvyqcfdtih.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showTab(tabId, element) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add("active");
  if (element) element.classList.add("active");

  if (tabId === 'user-management') {
    document.getElementById('addUserForm')?.addEventListener('submit', addUser);
    loadUsers();
  }
}

async function loadUsers() {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userList = document.querySelector('#user-management .user-list');
    userList.innerHTML = users.map(user => `
      <li class="user-item" data-id="${user.id}">
        <span>
          ${user.first_name} ${user.last_name} 
          <small>(${user.email})</small><br>
          <small>Role: ${user.role} | Contact: ${user.contact}</small>
        </span>
        <div>
          <button class="edit-btn" onclick="editUser('${user.id}')">Edit</button>
          <button class="edit-btn" style="background-color:#dc3545" onclick="deleteUser('${user.id}')">Delete</button>
        </div>
      </li>
    `).join('');
  } catch (err) {
    console.error('Error loading users:', err);
    alert(`Error loading users: ${err.message}`);
  }
}

async function addUser(event) {
  event.preventDefault();
  const form = event.target;

  const userData = {
    email: form.querySelector('input[type="email"]').value,
    first_name: form.querySelector('input[placeholder="First Name"]').value,
    last_name: form.querySelector('input[placeholder="Last Name"]').value,
    birthday: form.querySelector('input[type="date"]').value,
    contact: form.querySelector('input[placeholder="Contact No."]').value,
    role: 'User'
  };

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: form.querySelector('input[type="password"]').value,
    });
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ ...userData, id: authData.user.id }]);

    if (profileError) throw profileError;

    alert('User created successfully!');
    form.reset();
    loadUsers();
  } catch (err) {
    console.error('Error creating user:', err);
    alert('Error creating user: ' + err.message);
  }
}

async function editUser(userId) {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Edit User</h3>
        <form id="editUserForm">
          <input type="hidden" name="id" value="${user.id}">
          <div class="form-group">
            <input type="text" name="first_name" value="${user.first_name || ''}" placeholder="First Name" required>
            <input type="text" name="last_name" value="${user.last_name || ''}" placeholder="Last Name" required>
          </div>
          <div class="form-group">
            <input type="date" name="birthday" value="${user.birthday || ''}" placeholder="Birthday">
            <input type="tel" name="contact" value="${user.contact || ''}" placeholder="Contact No." required>
          </div>
          <div class="form-group">
            <input type="email" name="email" value="${user.email || ''}" placeholder="Email" readonly>
            <select name="role" required>
              <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
              <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="Super Admin" ${user.role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
            </select>
          </div>
          <button type="submit">Update User</button>
          <button type="button" onclick="this.closest('.modal').remove()">Cancel</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('editUserForm').addEventListener('submit', updateUser);
  } catch (err) {
    console.error('Error editing user:', err);
    alert('Error editing user');
  }
}

async function updateUser(event) {
  event.preventDefault();
  const form = event.target;
  const userId = form.querySelector('input[name="id"]').value;

  const updatedData = {
    first_name: form.querySelector('input[name="first_name"]').value,
    last_name: form.querySelector('input[name="last_name"]').value,
    birthday: form.querySelector('input[name="birthday"]').value,
    contact: form.querySelector('input[name="contact"]').value,
    role: form.querySelector('select[name="role"]').value,
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', userId);

    if (error) throw error;

    alert('User updated successfully!');
    form.closest('.modal').remove();
    loadUsers();
  } catch (err) {
    console.error('Error updating user:', err);
    alert('Error updating user');
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    alert('User deleted successfully!');
    loadUsers();
  } catch (err) {
    console.error('Error deleting user:', err);
    alert('Error deleting user: ' + err.message);
  }
}

function togglePassword() {
  const passwordField = document.getElementById("password");
  passwordField.type = passwordField.type === "password" ? "text" : "password";
}

document.getElementById("appointmentTime")?.addEventListener("input", function (e) {
  const time = e.target.value;
  if (time < "12:00" || time > "19:00") {
    alert("Please select a time between 12:00 PM and 7:00 PM.");
    e.target.value = "";
  }
});

document.getElementById("appointmentDate")?.addEventListener("input", function (e) {
  const date = new Date(e.target.value);
  const day = date.getDay();
  if (day === 1) {
    alert("Appointments are not available on Mondays.");
    e.target.value = "";
  }
});

function printReceipt(name, packageName, date) {
  const receiptWindow = window.open('', '_blank');
  receiptWindow.document.write(`
    <html>
    <head><title>Official Receipt</title></head>
    <body>
      <h2>Official Receipt</h2>
      <p>Name: ${name}</p>
      <p>Package: ${packageName}</p>
      <p>Date: ${date}</p>
      <hr>
      <p>Thank you for booking at Mood Studios!</p>
      <script>window.print();</script>
    </body>
    </html>
  `);
  receiptWindow.document.close();
}

function filterBookings() {
  const filter = document.getElementById('bookingFilter').value;
  const items = document.querySelectorAll('#bookingList .user-item');
  const now = new Date();

  items.forEach((item) => {
    const dateStr = item.getAttribute('data-date');
    const bookingDate = new Date(dateStr);
    let show = false;

    switch (filter) {
      case 'day':
        show = bookingDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        show = bookingDate >= startOfWeek && bookingDate <= endOfWeek;
        break;
      case 'month':
        show = bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
        break;
      case 'year':
        show = bookingDate.getFullYear() === now.getFullYear();
        break;
      default:
        show = true;
    }

    item.style.display = show ? 'flex' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('user-management')?.classList.contains('active')) {
    showTab('user-management', document.querySelector('.sidebar-item.active'));
  }
});
