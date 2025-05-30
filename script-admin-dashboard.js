// Import Supabase client with Service Role Key
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzczMjk5MCwiZXhwIjoyMDYzMzA4OTkwfQ.zILANJgS0HHNhgv40m6yYxHCceV3J9Upaoi_hJ4dTsU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let isEditing = false;
let editingUserId = null;

// Make functions globally accessible for inline HTML onclicks
window.showTab = showTab;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.togglePassword = togglePassword;
window.filterBookings = filterBookings;
window.showAppointmentForm = showAppointmentForm;
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;
window.cancelAppointmentEdit = cancelAppointmentEdit;

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

    document.getElementById('new-bookings').textContent = newBookingsCount ?? 0;
    document.getElementById('refund-bookings').textContent = refundBookingsCount ?? 0;
    document.getElementById('user-queue').textContent = userQueueCount ?? 0;

    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' });

    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' });

    document.getElementById('total-bookings').textContent = totalBookings ?? 0;
    document.getElementById('reviews-count').textContent = reviewsCount ?? 0;

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

function showAppointmentForm() {
  const container = document.getElementById('appointmentFormContainer');
  document.getElementById('appointmentFormTitle').textContent = 'Add Appointment';
  document.getElementById('appointmentSubmitBtn').textContent = 'Add Appointment';
  document.getElementById('addAppointmentForm').reset();
  delete document.getElementById('addAppointmentForm').dataset.editingId;
  container.style.display = 'block';
}

function cancelAppointmentEdit() {
  document.getElementById('appointmentFormContainer').style.display = 'none';
  document.getElementById('addAppointmentForm').reset();
}

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

    if (allAppointments.length === 0) {
      allAppointmentsList.innerHTML = '<li>No appointments found</li>';
      return;
    }

    allAppointments.forEach(appointment => {
      const li = document.createElement('li');
      li.className = 'user-item';
      li.dataset.id = appointment.id;

      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      li.innerHTML = `
        <div class="appointment-info">
          <strong>${appointment.first_name} ${appointment.last_name || ''}</strong>
          <div>${appointment.email} | ${appointment.phone}</div>
          <div>${appointment.package_name} on ${formattedDate} at ${appointment.time}</div>
          <div>Status: <span class="status-badge ${appointment.payment_status.toLowerCase()}">${appointment.payment_status}</span> | ₱${appointment.total_price ? appointment.total_price.toLocaleString('en-PH') : '0'}</div>
          ${appointment.payment_method ? `<div>Payment: ${appointment.payment_method}</div>` : ''}
        </div>
        <div class="appointment-actions">
          <button class="edit-btn" onclick="editAppointment('${appointment.id}')">Edit</button>
          <button class="edit-btn" style="background-color:#dc3545" onclick="deleteAppointment('${appointment.id}')">Delete</button>
        </div>
      `;

      allAppointmentsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
    document.getElementById('all-appointments').innerHTML = '<li class="error">Error loading appointments</li>';
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

    document.getElementById('appointmentFormTitle').textContent = 'Edit Appointment';
    document.getElementById('appointmentSubmitBtn').textContent = 'Update Appointment';
    form.dataset.editingId = appointmentId;
    document.getElementById('appointmentFormContainer').style.display = 'block';
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
    total_price: parseFloat(addAppointmentForm.querySelector('#appointmentTotalPrice').value) || 0,
    payment_method: addAppointmentForm.querySelector('#appointmentPaymentMethod').value.trim(),
  };

  try {
    if (addAppointmentForm.dataset.editingId) {
      // Update existing appointment
      const { error } = await supabase
        .from('appointments')
        .update(formData)
        .eq('id', addAppointmentForm.dataset.editingId);

      if (error) throw error;
      alert('Appointment updated successfully!');
      delete addAppointmentForm.dataset.editingId;
    } else {
      // Insert new appointment
      const { error } = await supabase
        .from('appointments')
        .insert(formData);

      if (error) throw error;
      alert('Appointment added successfully!');
    }
    addAppointmentForm.reset();
    document.getElementById('appointmentFormContainer').style.display = 'none';
    loadAppointments();
  } catch (error) {
    alert('Error saving appointment: ' + error.message);
  }
});

//
// BOOKINGS
//
async function loadBookings() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const bookingList = document.getElementById('bookingHistory');
    bookingList.innerHTML = '';

    if (!bookings || bookings.length === 0) {
      bookingList.innerHTML = '<li>No booking history found.</li>';
      return;
    }

    bookings.forEach(booking => {
      const li = document.createElement('li');
      li.className = 'user-item';
      li.innerHTML = `
        <div><strong>${booking.customer_name || 'Unknown'}</strong></div>
        <div>${booking.email || ''} | ${booking.phone || ''}</div>
        <div>${booking.package_name || ''} on ${new Date(booking.date).toLocaleDateString()}</div>
        <div>Status: ${booking.status || ''}</div>
      `;
      bookingList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading booking history:', error);
  }
}

function filterBookings() {
  // Placeholder for any booking filtering logic you want to add
  loadBookings();
}

//
// USER MANAGEMENT
//

// Load all users from profiles table
async function loadUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    if (!data || data.length === 0) {
      userList.innerHTML = '<li>No users found.</li>';
      return;
    }

    data.forEach(user => {
      const li = document.createElement('li');
      li.className = 'user-item';
      li.dataset.id = user.id;

      li.innerHTML = `
        <div>
          <strong>${user.first_name} ${user.last_name || ''}</strong><br>
          ${user.email}<br>
          Role: <span class="role">${user.role}</span>
        </div>
        <div class="user-actions">
          <button class="edit-btn" onclick="editUser('${user.id}')">Edit</button>
          <button class="edit-btn" style="background-color:#dc3545" onclick="deleteUser('${user.id}')">Delete</button>
        </div>
      `;

      userList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('userList').innerHTML = '<li class="error">Error loading users</li>';
  }
}

// Edit user form handling
async function editUser(userId) {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Populate the edit form fields
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserFirstName').value = user.first_name || '';
    document.getElementById('editUserLastName').value = user.last_name || '';
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserRole').value = user.role || 'User';
    document.getElementById('editUserPassword').value = '';

    document.getElementById('editUserFormContainer').style.display = 'block';
  } catch (error) {
    alert('Error loading user: ' + error.message);
  }
}

function cancelUserEdit() {
  document.getElementById('editUserFormContainer').style.display = 'none';
  document.getElementById('editUserForm').reset();
}

async function updateUser() {
  const userId = document.getElementById('editUserId').value;
  const firstName = document.getElementById('editUserFirstName').value.trim();
  const lastName = document.getElementById('editUserLastName').value.trim();
  const email = document.getElementById('editUserEmail').value.trim();
  const role = document.getElementById('editUserRole').value;
  const newPassword = document.getElementById('editUserPassword').value;

  try {
    // Update profile fields
    let { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        role,
      })
      .eq('id', userId);

    if (error) throw error;

    // If password is set, update the user's password via Supabase Auth admin API
    if (newPassword) {
      const { error: pwError } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
      if (pwError) throw pwError;
    }

    alert('User updated successfully!');
    cancelUserEdit();
    loadUsers();
  } catch (error) {
    alert('Error updating user: ' + error.message);
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action is irreversible.')) return;

  try {
    // Delete user from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    alert('User deleted successfully!');
    loadUsers();
  } catch (error) {
    alert('Error deleting user: ' + error.message);
  }
}

//
// PASSWORD TOGGLE
//
function togglePassword(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const toggleBtn = document.getElementById(toggleBtnId);
  if (input.type === "password") {
    input.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    input.type = "password";
    toggleBtn.textContent = "Show";
  }
}

// Load dashboard analytics on page load
document.addEventListener('DOMContentLoaded', () => {
  showTab('dashboard', document.querySelector('.sidebar-item'));
});
