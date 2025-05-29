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

//
// APPOINTMENTS
//

async function loadAppointments() {
  try {
    const { data: allAppointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

    const allAppointmentsList = document.getElementById('all-appointments');
    allAppointmentsList.innerHTML = '';

    allAppointments.forEach(appointment => {
      const li = document.createElement('li');
      li.className = 'user-item';
      li.dataset.id = appointment.id;
      
      li.innerHTML = `
        <div class="appointment-info">
          <strong>${appointment.first_name} ${appointment.last_name || ''}</strong>
          <div>${appointment.email} | ${appointment.phone}</div>
          <div>${appointment.package_name} on ${appointment.date} at ${appointment.time}</div>
          <div>Status: ${appointment.payment_status} | $${appointment.total_price || '0'}</div>
        </div>
        <div class="appointment-actions">
          <select class="status-select" onchange="updateAppointmentStatus('${appointment.id}', this.value)">
            <option value="Pending" ${appointment.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Paid" ${appointment.payment_status === 'Paid' ? 'selected' : ''}>Paid</option>
            <option value="Cancelled" ${appointment.payment_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button class="edit-btn" onclick="editAppointment('${appointment.id}')">Edit</button>
          <button class="edit-btn" style="background-color:#dc3545" onclick="deleteAppointment('${appointment.id}')">Delete</button>
        </div>
      `;
      
      allAppointmentsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

async function editAppointment(appointmentId) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (error) throw error;

    const form = document.getElementById('addAppointmentForm');
    form.querySelector('#appointmentFirstName').value = appointment.first_name;
    form.querySelector('#appointmentLastName').value = appointment.last_name || '';
    form.querySelector('#appointmentEmail').value = appointment.email;
    form.querySelector('#appointmentPhone').value = appointment.phone;
    form.querySelector('#appointmentPackage').value = appointment.package_name;
    form.querySelector('#appointmentDate').value = appointment.date;
    form.querySelector('#appointmentTime').value = appointment.time;
    form.querySelector('#appointmentPaymentStatus').value = appointment.payment_status;
    form.querySelector('#appointmentTotalPrice').value = appointment.total_price || '';
    form.querySelector('#appointmentPaymentMethod').value = appointment.payment_method || '';

    form.querySelector('button[type="submit"]').textContent = 'Update Appointment';
    form.dataset.editingId = appointmentId;
  } catch (error) {
    alert('Error loading appointment: ' + error.message);
  }
}

async function deleteAppointment(appointmentId) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    alert('Appointment deleted successfully!');
    loadAppointments();
  } catch (error) {
    alert('Error deleting appointment: ' + error.message);
  }
}

async function updateAppointmentStatus(appointmentId, newStatus) {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        payment_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    // Optional: Show a success message or update UI
  } catch (error) {
    alert('Error updating appointment status: ' + error.message);
    // Reload to reset to previous state
    loadAppointments();
  }
}

// Handle adding/updating appointment form submit
const addAppointmentForm = document.getElementById('addAppointmentForm');
addAppointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    first_name: addAppointmentForm.querySelector('#appointmentFirstName').value.trim(),
    last_name: addAppointmentForm.querySelector('#appointmentLastName').value.trim(),
    email: addAppointmentForm.querySelector('#appointmentEmail').value.trim(),
    phone: addAppointmentForm.querySelector('#appointmentPhone').value.trim(),
    package_name: addAppointmentForm.querySelector('#appointmentPackage').value,
    date: addAppointmentForm.querySelector('#appointmentDate').value,
    time: addAppointmentForm.querySelector('#appointmentTime').value,
    payment_status: addAppointmentForm.querySelector('#appointmentPaymentStatus').value,
    total_price: parseFloat(addAppointmentForm.querySelector('#appointmentTotalPrice').value) || null,
    payment_method: addAppointmentForm.querySelector('#appointmentPaymentMethod').value.trim() || null,
    updated_at: new Date().toISOString()
  };

  if (!formData.first_name || !formData.email || !formData.phone || 
      !formData.package_name || !formData.date || !formData.time) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    if (addAppointmentForm.dataset.editingId) {
      // Update existing appointment
      const { error } = await supabase
        .from('appointments')
        .update(formData)
        .eq('id', addAppointmentForm.dataset.editingId);
      
      if (error) throw error;
      
      alert('Appointment updated successfully!');
    } else {
      // Create new appointment
      formData.created_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('appointments')
        .insert(formData);
      
      if (error) throw error;
      
      alert('Appointment created successfully!');
    }

    addAppointmentForm.reset();
    delete addAppointmentForm.dataset.editingId;
    addAppointmentForm.querySelector('button[type="submit"]').textContent = 'Add Appointment';
    loadAppointments();

  } catch (error) {
    alert('Error saving appointment: ' + error.message);
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
