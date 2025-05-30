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
    // Fetch counts from bookings table for analytics
    // Adjust table and columns names to your schema

    const { count: newBookingsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('status', 'new');

    const { count: refundBookingsCount } = await supabase
      .from('appointments')
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
      
      // Format date for display
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
    document.getElementById('appointmentFormContainer').style.display = 'none';
    loadAppointments();

  } catch (error) {
    alert('Error saving appointment: ' + error.message);
  }
});


//
// BOOKING HISTORY
//

// Booking History Variables
let currentPage = 1;
const bookingsPerPage = 10;
let allAppointments = [];

// Initialize Booking History
async function initBookingHistory() {
  await loadAppointments();
  setupEventListeners();
}

// Load Appointments from Supabase
async function loadAppointments(filter = 'all', searchQuery = '') {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    // Apply filters
    if (filter !== 'all') {
      const now = new Date();
      let fromDate = new Date();

      switch (filter) {
        case 'today':
          fromDate.setHours(0, 0, 0, 0);
          query = query.gte('date', fromDate.toISOString().split('T')[0]);
          break;
        case 'week':
          fromDate.setDate(now.getDate() - now.getDay());
          fromDate.setHours(0, 0, 0, 0);
          query = query.gte('date', fromDate.toISOString().split('T')[0]);
          break;
        case 'month':
          fromDate.setDate(1);
          fromDate.setHours(0, 0, 0, 0);
          query = query.gte('date', fromDate.toISOString().split('T')[0]);
          break;
        case 'completed':
          query = query.eq('payment_status', 'Paid');
          break;
        case 'cancelled':
          query = query.eq('payment_status', 'Cancelled');
          break;
      }
    }

    // Apply search
    if (searchQuery) {
      query = query.or(
        `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
      );
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    allAppointments = appointments || [];
    updateBookingStats();
    renderAppointments();
  } catch (error) {
    console.error('Error loading appointments:', error);
    document.getElementById('bookingList').innerHTML = `
      <div class="booking-error">Error loading appointments. Please try again.</div>
    `;
  }
}

// Render Appointments to UI
function renderAppointments() {
  const startIdx = (currentPage - 1) * bookingsPerPage;
  const endIdx = startIdx + bookingsPerPage;
  const paginatedAppointments = allAppointments.slice(startIdx, endIdx);

  const bookingList = document.getElementById('bookingList');
  bookingList.innerHTML = '';

  if (paginatedAppointments.length === 0) {
    bookingList.innerHTML = '<div class="no-bookings">No appointments found</div>';
    return;
  }

  paginatedAppointments.forEach(appointment => {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item';
    bookingItem.innerHTML = `
      <div class="booking-client">
        <span class="booking-client-name">${appointment.first_name} ${appointment.last_name || ''}</span>
        <span class="booking-client-email">${appointment.email || ''}</span>
      </div>
      <div class="booking-package">${appointment.package_name || '-'}</div>
      <div class="booking-date">${formattedDate} at ${appointment.time}</div>
      <div class="booking-amount">₱${appointment.total_price?.toLocaleString('en-PH') || '0'}</div>
      <div class="booking-status status-${appointment.payment_status.toLowerCase()}">${appointment.payment_status}</div>
    `;
    bookingItem.addEventListener('click', () => showAppointmentDetails(appointment.id));
    bookingList.appendChild(bookingItem);
  });

  updatePagination();
}

// Show Appointment Details Modal
async function showAppointmentDetails(appointmentId) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) throw error;

    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const detailsHtml = `
      <div class="detail-row">
        <span class="detail-label">Client:</span>
        <span>${appointment.first_name} ${appointment.last_name || ''}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contact:</span>
        <span>${appointment.email || ''} ${appointment.phone ? `• ${appointment.phone}` : ''}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Package:</span>
        <span>${appointment.package_name || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date & Time:</span>
        <span>${formattedDate} at ${appointment.time}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="booking-status status-${appointment.payment_status.toLowerCase()}">
          ${appointment.payment_status}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount:</span>
        <span>₱${appointment.total_price?.toLocaleString('en-PH') || '0'}</span>
      </div>
      ${appointment.payment_method ? `
      <div class="detail-row">
        <span class="detail-label">Payment Method:</span>
        <span>${appointment.payment_method}</span>
      </div>` : ''}
      ${appointment.image_url ? `
      <div class="detail-row">
        <span class="detail-label">Image:</span>
        <img src="${appointment.image_url}" style="max-width: 200px; margin-top: 10px;">
      </div>` : ''}
      <div class="detail-actions">
        <button class="btn" onclick="closeModal()">Close</button>
      </div>
    `;

    document.getElementById('bookingDetails').innerHTML = detailsHtml;
    document.getElementById('bookingModal').style.display = 'block';
  } catch (error) {
    alert('Error loading appointment details: ' + error.message);
  }
}

// Update Booking Stats
function updateBookingStats() {
  const totalAppointments = allAppointments.length;
  const totalRevenue = allAppointments.reduce((sum, appt) => sum + (appt.total_price || 0), 0);
  const paidAppointments = allAppointments.filter(a => a.payment_status === 'Paid').length;

  document.getElementById('totalBookings').textContent = 
    `${totalAppointments} appointments (${paidAppointments} paid)`;
  document.getElementById('totalRevenue').textContent = 
    `₱${totalRevenue.toLocaleString('en-PH')} revenue`;
}

// Update Pagination Controls
function updatePagination() {
  const totalPages = Math.ceil(allAppointments.length / bookingsPerPage);
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Export Appointments to CSV
async function exportAppointments() {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    if (!appointments || appointments.length === 0) {
      alert('No appointments to export');
      return;
    }

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Package', 'Date', 'Time', 'Status', 'Amount', 'Payment Method'];
    const csvRows = [
      headers.join(','),
      ...appointments.map(appt => [
        `"${appt.first_name || ''}"`,
        `"${appt.last_name || ''}"`,
        `"${appt.email || ''}"`,
        `"${appt.phone || ''}"`,
        `"${appt.package_name || ''}"`,
        `"${new Date(appt.date).toLocaleDateString()}"`,
        `"${appt.time || ''}"`,
        `"${appt.payment_status || ''}"`,
        `"₱${appt.total_price?.toLocaleString('en-PH') || '0'}"`,
        `"${appt.payment_method || ''}"`
      ].join(','))
    ];

    // Download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting appointments:', error);
    alert('Error exporting appointments: ' + error.message);
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Filter change
  document.getElementById('bookingFilter').addEventListener('change', (e) => {
    currentPage = 1;
    loadAppointments(e.target.value, document.getElementById('bookingSearch').value);
  });

  // Search input
  document.getElementById('bookingSearch').addEventListener('input', (e) => {
    currentPage = 1;
    loadAppointments(document.getElementById('bookingFilter').value, e.target.value);
  });

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderAppointments();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(allAppointments.length / bookingsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderAppointments();
    }
  });

  // Export button
  document.getElementById('exportBookings').addEventListener('click', exportAppointments);

  // Modal close
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('bookingModal')) {
      closeModal();
    }
  });
}

// Close Modal
function closeModal() {
  document.getElementById('bookingModal').style.display = 'none';
}

// Initialize when booking history tab is shown
function loadBookings() {
  initBookingHistory();
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
document.getElementById('cancelEditBtn').addEventListener('click', cancelAppointmentEdit);

loadGallery();
