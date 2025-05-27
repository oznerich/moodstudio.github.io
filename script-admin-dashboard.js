// Initialize Supabase - REPLACE THESE WITH YOUR ACTUAL CREDENTIALS
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Tab Management
function showTab(tabId, element) {
  // Hide all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove 'active' class from all sidebar items
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Show the selected tab
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Set clicked sidebar item as active
  if (element) {
    element.classList.add("active");
  }

  // Load data when specific tabs are shown
  if (tabId === 'user management') {
    loadUsers();
  }
}

// User Management Functions
async function loadUsers() {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userList = document.querySelector('#user management .user-list');
    userList.innerHTML = users.map(user => `
      <li class="user-item" data-id="${user.id}">
        <span>
          ${user.first_name} ${user.last_name} 
          <small>(${user.email})</small>
          <br>
          <small>Role: ${user.role} | Contact: ${user.contact}</small>
        </span>
        <div>
          <button class="edit-btn" onclick="editUser('${user.id}')">Edit</button>
          <button class="edit-btn" style="background-color:#dc3545" onclick="deleteUser('${user.id}')">Delete</button>
        </div>
      </li>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Error loading users');
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
    role: 'User' // Default role
  };

  try {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: form.querySelector('input[type="password"]').value,
    });

    if (authError) throw authError;

    // Then create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        ...userData,
        id: authData.user.id
      }])
      .select();

    if (profileError) throw profileError;

    alert('User created successfully!');
    form.reset();
    loadUsers();
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Error creating user: ' + error.message);
  }
}

async function editUser(userId) {
  try {
    // Fetch user data
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Create modal for editing
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
  } catch (error) {
    console.error('Error editing user:', error);
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
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', userId)
      .select();

    if (error) throw error;

    alert('User updated successfully!');
    form.closest('.modal').remove();
    loadUsers();
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Error updating user');
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    // First delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    // Then delete the profile (this should happen automatically due to the foreign key cascade)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    alert('User deleted successfully!');
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user: ' + error.message);
  }
}

// Password toggle
function togglePassword() {
  const passwordField = document.getElementById("password");
  passwordField.type = passwordField.type === "password" ? "text" : "password";
}

// Appointment validation
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

// Booking History
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
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        show = bookingDate >= startOfWeek && bookingDate <= endOfWeek;
        break;
      case 'month':
        show = bookingDate.getMonth() === new Date().getMonth() &&
               bookingDate.getFullYear() === new Date().getFullYear();
        break;
      case 'year':
        show = bookingDate.getFullYear() === new Date().getFullYear();
        break;
      default:
        show = true;
    }

    item.style.display = show ? 'flex' : 'none';
  });
}

// Initialize form submission
document.getElementById('addUserForm')?.addEventListener('submit', addUser);

// Load users when page loads if on user management tab
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('user management')?.classList.contains('active')) {
    loadUsers();
  }
});
