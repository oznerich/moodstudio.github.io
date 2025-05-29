// Import Supabase client
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let isEditing = false;
let editingUserId = null;

// Make functions globally accessible for inline HTML onclicks
window.showTab = showTab;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.togglePassword = togglePassword;
window.filterBookings = filterBookings;

//
// TAB SWITCHING
//
function showTab(tabId, element) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add("active");
  if (element) element.classList.add("active");

  // Load relevant data when switching tabs
  if (tabId === 'user-management') loadUsers();
  if (tabId === 'appointments') loadAppointments();
  if (tabId === 'booking-history') loadBookings();
  if (tabId === 'dashboard') loadDashboardAnalytics();
}

//
// DASHBOARD ANALYTICS
//
async function loadDashboardAnalytics() {
  try {
    // Fetch counts from bookings table for analytics
    // Adjust table and columns names to your schema

    const { count: newBookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('status', 'new');

    const { count: refundBookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('status', 'refund');

    const { count: userQueueCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Set counts in dashboard
    document.getElementById('new-bookings').textContent = newBookingsCount ?? 0;
    document.getElementById('refund-bookings').textContent = refundBookingsCount ?? 0;
    document.getElementById('user-queue').textContent = userQueueCount ?? 0;

    // Booking Analytics - total bookings & reviews count
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' });

    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' });

    document.getElementById('total-bookings').textContent = totalBookings ?? 0;
    document.getElementById('reviews-count').textContent = reviewsCount ?? 0;

    // Availed Packages counts for Keepsake, Euphoria, Serendipity
    const keepsakeCount = await countBookingsByPackage('keepsake');
    const euphoriaCount = await countBookingsByPackage('euphoria');
    const serendipityCount = await countBookingsByPackage('serendipity');

    document.getElementById('keepsake-count').textContent = keepsakeCount;
    document.getElementById('euphoria-count').textContent = euphoriaCount;
    document.getElementById('serendipity-count').textContent = serendipityCount;

  } catch (error) {
    console.error('Error loading dashboard analytics:', error);
  }
}

async function countBookingsByPackage(packageName) {
  try {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('package', packageName);
    return count ?? 0;
  } catch {
    return 0;
  }
}

//
// APPOINTMENTS
//

async function loadAppointments() {
  try {
    const { data: allAppointments, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const allAppointmentsList = document.getElementById('all-appointments');
    const pendingAppointmentsList = document.getElementById('pending-appointments');

    allAppointmentsList.innerHTML = '';
    pendingAppointmentsList.innerHTML = '';

    allAppointments.forEach(appointment => {
      const li = document.createElement('li');
      li.textContent = `${appointment.full_name} - ${appointment.package} on ${appointment.date} at ${appointment.time} (${appointment.status ?? 'pending'})`;

      allAppointmentsList.appendChild(li);

      if ((appointment.status ?? 'pending') === 'pending') {
        const pendingLi = li.cloneNode(true);
        pendingAppointmentsList.appendChild(pendingLi);
      }
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

// Handle adding appointment form submit
const addAppointmentForm = document.getElementById('addAppointmentForm');
addAppointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = addAppointmentForm.querySelector('input[placeholder="Full Name"]').value.trim();
  const phone = addAppointmentForm.querySelector('input[placeholder="Phone Number"]').value.trim();
  const email = addAppointmentForm.querySelector('input[placeholder="Email"]').value.trim();
  const packageName = addAppointmentForm.querySelector('select').value;
  const time = addAppointmentForm.querySelector('#appointmentTime').value;
  const date = addAppointmentForm.querySelector('#appointmentDate').value;

  if (!fullName || !phone || !email || !packageName || !time || !date) {
    alert('Please fill in all appointment fields.');
    return;
  }

  try {
    const { error } = await supabase.from('appointments').insert({
      full_name: fullName,
      phone: phone,
      email: email,
      package: packageName,
      time: time,
      date: date,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    alert('Appointment added successfully!');
    addAppointmentForm.reset();
    loadAppointments();

  } catch (error) {
    alert('Error adding appointment: ' + error.message);
  }
});

//
// BOOKING HISTORY
//

async function loadBookings(filter = 'all') {
  try {
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    // Filter by timeframe
    if (filter !== 'all') {
      const now = new Date();
      let fromDate = new Date();

      switch (filter) {
        case 'day':
          fromDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          const dayOfWeek = now.getDay(); // Sunday=0
          fromDate.setDate(now.getDate() - dayOfWeek);
          fromDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          fromDate.setDate(1);
          fromDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          fromDate.setMonth(0, 1);
          fromDate.setHours(0, 0, 0, 0);
          break;
      }

      query = query.gte('created_at', fromDate.toISOString());
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    const bookingsList = document.getElementById('bookings-list');
    bookingsList.innerHTML = '';

    bookings.forEach(b => {
      const li = document.createElement('li');
      li.textContent = `${b.full_name ?? 'Unknown'} - ${b.package ?? ''} on ${b.date ?? ''} (${b.status ?? 'unknown'})`;
      bookingsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

function filterBookings() {
  const filter = document.getElementById('bookingFilter').value;
  loadBookings(filter);
}

//
// USER MANAGEMENT
//

async function loadUsers() {
  try {
    const { data: users, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
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

async function editUser(userId) {
  try {
    const { data: user, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;

    const form = document.getElementById('addUserForm');
    form.querySelector('input[placeholder="First Name"]').value = user.first_name || '';
    form.querySelector('input[placeholder="Last Name"]').value = user.last_name || '';
    form.querySelector('input[placeholder="Birthday"]').value = user.birthday || '';
    form.querySelector('input[placeholder="Contact No."]').value = user.contact || '';
    form.querySelector('input[type="email"]').value = user.email || '';
    form.querySelector('#password').value = ''; // clear password on edit

    form.querySelector('button[type="submit"]').textContent = 'Update User';
    cancelEditBtn.style.display = 'inline-block';

    isEditing = true;
    editingUserId = userId;
  } catch (error) {
    alert('Error loading user data: ' + error.message);
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;

    alert('User deleted (auth user deletion must be handled separately).');
    loadUsers();
  } catch (error) {
    alert('Error deleting user: ' + error.message);
  }
}

function togglePassword() {
  const pwdInput = document.getElementById('password');
  pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
}

// Add or update user on form submit
const addUserForm = document.getElementById('addUserForm');
const cancelEditBtn = document.createElement('button');
cancelEditBtn.textContent = 'Cancel Edit';
cancelEditBtn.style.marginLeft = '10px';
cancelEditBtn.style.display = 'none';
addUserForm.appendChild(cancelEditBtn);

cancelEditBtn.addEventListener('click', () => {
  isEditing = false;
  editingUserId = null;
  addUserForm.reset();
  addUserForm.querySelector('button[type="submit"]').textContent = 'Add User';
  cancelEditBtn.style.display = 'none';
});

addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = addUserForm.querySelector('input[placeholder="First Name"]').value.trim();
  const lastName = addUserForm.querySelector('input[placeholder="Last Name"]').value.trim();
  const birthday = addUserForm.querySelector('input[placeholder="Birthday"]').value;
  const contact = addUserForm.querySelector('input[placeholder="Contact No."]').value.trim();
  const email = addUserForm.querySelector('input[type="email"]').value.trim();
  const password = addUserForm.querySelector('#password').value;

  if (!firstName || !lastName || !birthday || !contact || !email || (!isEditing && !password)) {
    alert('Please fill all required fields.');
    return;
  }

  try {
    if (isEditing) {
      // Update user profile
      const updates = {
        first_name: firstName,
        last_name: lastName,
        birthday: birthday,
        contact: contact,
        email: email,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', editingUserId);
      if (error) throw error;

      alert('User updated successfully!');
    } else {
      // Register user via auth + insert profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Insert profile record
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        birthday,
        contact,
        role: 'User',
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      alert('User registered successfully! Check email to verify.');
    }

    addUserForm.reset();
    isEditing = false;
    editingUserId = null;
    addUserForm.querySelector('button[type="submit"]').textContent = 'Add User';
    cancelEditBtn.style.display = 'none';

    loadUsers();

  } catch (error) {
    alert('Error: ' + error.message);
  }
});

//
// GALLERY (static for now, can add dynamic later)
//
function loadGallery() {
  const gallery = document.getElementById('gallery-content');
  gallery.innerHTML = '<p>Gallery feature coming soon...</p>';
}

// Initial load
showTab('dashboard', document.querySelector('.sidebar-item.active'));

// Add event listeners to timeframe selects on dashboard to refresh counts if changed
document.getElementById('analytics-timeframe').addEventListener('change', loadDashboardAnalytics);
document.getElementById('package-timeframe').addEventListener('change', loadDashboardAnalytics);

loadGallery();
