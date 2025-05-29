import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
);

// TAB SWITCHING
const sidebarItems = document.querySelectorAll('.sidebar-item');
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

    const tabId = item.getAttribute('data-tab');
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
  });
});

// AI-Powered Analytics
async function loadAnalytics() {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error || !data) {
    document.getElementById('ai-insights').textContent = 'Failed to load data.';
    return;
  }

  const packages = data.reduce((acc, app) => {
    acc[app.package] = (acc[app.package] || 0) + 1;
    return acc;
  }, {});

  let insight = '';
  const e = packages.euphoria || 0, s = packages.serendipity || 0, k = packages.keepsake || 0;
  if (e > s && e > k) {
    insight = 'Euphoria is the most popular package.';
  } else if (s > e && s > k) {
    insight = 'Serendipity is the most popular package.';
  } else if (k > e && k > s) {
    insight = 'Keepsake is the most popular package.';
  } else {
    insight = 'Packages are equally popular or no data.';
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const recent = data.filter(app => new Date(app.appointment_date) >= oneWeekAgo);
  insight += ` You have ${recent.length} bookings this week.`;

  document.getElementById('ai-insights').textContent = insight;
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
    alert('Please fill all fields.');
    return;
  }

  const { error } = await supabase.from('appointments').insert([{
    full_name: fullName,
    phone,
    email,
    package: packageSelected,
    appointment_time: appointmentTime,
    appointment_date: appointmentDate,
  }]);

  if (error) {
    alert('Error adding appointment: ' + error.message);
    return;
  }

  addAppointmentForm.reset();
  loadAppointments();
  loadAnalytics();
});

async function loadAppointments() {
  const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: false });

  if (error || !data) {
    allAppointmentsList.innerHTML = '<li>Error loading appointments.</li>';
    return;
  }

  allAppointmentsList.innerHTML = '';

  if (data.length === 0) {
    allAppointmentsList.innerHTML = '<li>No appointments found.</li>';
    return;
  }

  data.forEach(app => {
    const li = document.createElement('li');
    li.textContent = `${app.full_name} | ${app.package} | ${app.appointment_date} @ ${app.appointment_time}`;

    // Edit button (placeholder alert)
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.backgroundColor = '#0d6efd';
    editBtn.onclick = () => alert('Edit functionality to be implemented.');

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
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

  if (error || !data) {
    bookingsList.innerHTML = '<li>Error loading booking history.</li>';
    return;
  }

  bookingsList.innerHTML = '';

  if (data.length === 0) {
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

  if (error || !data) {
    usersList.innerHTML = '<li>Error loading users.</li>';
    return;
  }

  usersList.innerHTML = '';

  if (data.length === 0) {
    usersList.innerHTML = '<li>No users found.</li>';
    return;
  }

  data.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.first_name} ${user.last_name} (${user.email})`;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
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

  if (error || !data) {
    galleryContent.innerHTML = 'Failed to load gallery images.';
    return;
  }

  if (data.length === 0) {
    galleryContent.innerHTML = 'No images found in gallery.';
    return;
  }

  galleryContent.innerHTML = '';
  for (const item of data) {
    if (item.type === 'file') {
      const { publicURL, error: urlError } = supabase.storage.from('gallery').getPublicUrl(item.name);
      if (!urlError) {
        const img = document.createElement('img');
        img.src = publicURL;
        img.alt = item.name;
        galleryContent.appendChild(img);
      }
    }
  }
}

// Initialize dashboard
async function init() {
  await loadAnalytics();
  await loadAppointments();
  await loadBookingHistory();
  await loadUsers();
  await loadGallery();
}

window.addEventListener('DOMContentLoaded', init);
