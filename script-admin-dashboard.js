import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sidebar tab switching
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

    item.classList.add('active');
    const tabId = item.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// DASHBOARD INSIGHTS (placeholder AI-powered text)
async function loadAnalytics() {
  // For demo, just a static insight:
  const aiInsightsEl = document.getElementById('ai-insights');
  aiInsightsEl.textContent = 'Loading insights...';

  // Imagine here you fetch from an AI API or generate analytics
  setTimeout(() => {
    aiInsightsEl.textContent = 'You have 10 upcoming appointments and 5 new users this week.';
  }, 1000);
}

// APPOINTMENTS
const addAppointmentForm = document.getElementById('addAppointmentForm');
const allAppointmentsList = document.getElementById('all-appointments');

addAppointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const packageSelected = document.getElementById('package').value;
  const appointmentTime = document.getElementById('appointmentTime').value;
  const appointmentDate = document.getElementById('appointmentDate').value;

  if (!fullName || !phone || !email || !packageSelected || !appointmentTime || !appointmentDate) {
    alert('Please fill in all appointment fields.');
    return;
  }

  const { error } = await supabase.from('appointments').insert([{
    full_name: fullName,
    phone: phone,
    email: email,
    package: packageSelected,
    appointment_time: appointmentTime,
    appointment_date: appointmentDate,
  }]);

  if (error) {
    alert('Failed to add appointment: ' + error.message);
    return;
  }

  addAppointmentForm.reset();
  loadAppointments();
  loadAnalytics();
});

async function loadAppointments() {
  const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true });

  allAppointmentsList.innerHTML = '';

  if (error) {
    allAppointmentsList.innerHTML = '<li>Error loading appointments.</li>';
    return;
  }

  if (!data || data.length === 0) {
    allAppointmentsList.innerHTML = '<li>No appointments found.</li>';
    return;
  }

  data.forEach(app => {
    const li = document.createElement('li');
    li.textContent = `${app.full_name} | ${app.package} | ${app.appointment_date} @ ${app.appointment_time}`;

    // Edit button (placeholder)
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.backgroundColor = '#007bff';
    editBtn.style.color = 'white';
    editBtn.style.border = 'none';
    editBtn.style.marginLeft = '10px';
    editBtn.style.borderRadius = '4px';
    editBtn.onclick = () => alert('Edit functionality coming soon.');

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '5px';
    deleteBtn.onclick = async () => {
      if (confirm(`Delete appointment for ${app.full_name}?`)) {
        const { error } = await supabase.from('appointments').delete().eq('id', app.id);
        if (error) {
          alert('Failed to delete: ' + error.message);
          return;
        }
        loadAppointments();
        loadAnalytics();
      }
    };

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    allAppointmentsList.appendChild(li);
  });
}

// BOOKING HISTORY
const bookingsList = document.getElementById('bookings-list');

async function loadBookingHistory() {
  const { data, error } = await supabase.from('booking_history').select('*').order('booking_date', { ascending: false });

  bookingsList.innerHTML = '';

  if (error) {
    bookingsList.innerHTML = '<li>Error loading booking history.</li>';
    return;
  }

  if (!data || data.length === 0) {
    bookingsList.innerHTML = '<li>No booking history found.</li>';
    return;
  }

  data.forEach(booking => {
    const li = document.createElement('li');
    li.textContent = `${booking.user_name} booked ${booking.package_name} on ${booking.booking_date}`;
    bookingsList.appendChild(li);
  });
}

// USER MANAGEMENT
const addUserForm = document.getElementById('addUserForm');
const usersList = document.getElementById('users-list');

addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const userEmail = document.getElementById('userEmail').value.trim();

  if (!firstName || !lastName || !userEmail) {
    alert('Please fill all user fields.');
    return;
  }

  const { error } = await supabase.from('profiles').insert([{
    first_name: firstName,
    last_name: lastName,
    email: userEmail,
    role: 'User',
  }]);

  if (error) {
    alert('Error adding user: ' + error.message);
    return;
  }

  addUserForm.reset();
  loadUsers();
});

async function loadUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

  usersList.innerHTML = '';

  if (error) {
    usersList.innerHTML = '<li>Error loading users.</li>';
    return;
  }

  if (!data || data.length === 0) {
    usersList.innerHTML = '<li>No users found.</li>';
    return;
  }

  data.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.first_name} ${user.last_name} (${user.email})`;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.onclick = async () => {
      if (confirm(`Delete user ${user.first_name} ${user.last_name}?`)) {
        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        if (error) {
          alert('Failed to delete user: ' + error.message);
          return;
        }
        loadUsers();
      }
    };

    li.appendChild(deleteBtn);
    usersList.appendChild(li);
  });
}

// GALLERY
const galleryContent = document.getElementById('gallery-content');

async function loadGallery() {
  const { data, error } = await supabase.storage.from('gallery').list();

  galleryContent.innerHTML = '';

  if (error) {
    galleryContent.textContent = 'Failed to load gallery images.';
    return;
  }

  if (!data || data.length === 0) {
    galleryContent.textContent = 'No images found in gallery.';
    return;
  }

  for (const item of data) {
    if (item.type === 'file') {
      const { publicURL, error: urlError } = supabase.storage.from('gallery').getPublicUrl(item.name);
      if (!urlError) {
        const img = document.createElement('img');
        img.src = publicURL;
        img.alt = item.name;
        img.style.maxWidth = '150px';
        img.style.borderRadius = '8px';
        img.style.margin = '5px';
        galleryContent.appendChild(img);
      }
    }
  }
}

// Initialize dashboard data
async function init() {
  await loadAnalytics();
  await loadAppointments();
  await loadBookingHistory();
  await loadUsers();
  await loadGallery();
}

window.addEventListener('DOMContentLoaded', init);
