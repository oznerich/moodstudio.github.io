import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
);

// Tab switching
window.showTab = (id, el) => {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
};

// AI Analytics
async function loadAnalytics() {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error || !data) {
    document.getElementById('ai-insights').textContent = 'Failed to load data.';
    return;
  }

  const insights = [];
  const packages = data.reduce((acc, app) => {
    acc[app.package] = (acc[app.package] || 0) + 1;
    return acc;
  }, {});

  if ((packages.euphoria || 0) > (packages.serendipity || 0) && (packages.euphoria || 0) > (packages.keepsake || 0)) {
    insights.push('Euphoria is the most popular package.');
  }

  const recent = data.filter(app => new Date(app.appointment_date) > new Date(Date.now() - 7 * 86400000));
  insights.push(`You have ${recent.length} bookings this week.`);

  document.getElementById('ai-insights').textContent = insights.join(' ');
}

// Appointments
const form = document.getElementById('addAppointmentForm');
const list = document.getElementById('all-appointments');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const newApp = {
    full_name: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    package: document.getElementById('package').value,
    appointment_time: document.getElementById('appointmentTime').value,
    appointment_date: document.getElementById('appointmentDate').value,
    status: 'pending'
  };
  const { error } = await supabase.from('appointments').insert(newApp);
  if (!error) {
    form.reset();
    loadAppointments();
    loadAnalytics();
  }
});

async function loadAppointments() {
  const { data } = await supabase.from('appointments').select('*');
  list.innerHTML = data.map(app => `
    <li>
      <strong>${app.full_name}</strong> | ${app.package} | ${app.appointment_date}
      <button onclick="deleteAppointment(${app.id})">Delete</button>
    </li>
  `).join('');
}

window.deleteAppointment = async (id) => {
  await supabase.from('appointments').delete().eq('id', id);
  loadAppointments();
  loadAnalytics();
};

// Users
const userForm = document.getElementById('addUserForm');
const userList = document.getElementById('users-list');

userForm.addEventListener('submit', async e => {
  e.preventDefault();
  const user = {
    email: document.getElementById('userEmail').value,
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value
  };
  const { error } = await supabase.from('profiles').insert(user);
  if (!error) {
    userForm.reset();
    loadUsers();
  }
});

async function loadUsers() {
  const { data } = await supabase.from('profiles').select('*');
  userList.innerHTML = data.map(user => `
    <li>
      ${user.first_name} ${user.last_name} - ${user.email}
      <button onclick="deleteUser('${user.id}')">Delete</button>
    </li>
  `).join('');
}

window.deleteUser = async (id) => {
  await supabase.from('profiles').delete().eq('id', id);
  loadUsers();
};

// Booking History
async function loadBookingHistory() {
  const { data } = await supabase.from('appointments').select('*');
  document.getElementById('bookings-list').innerHTML = data.map(app => `
    <li>${app.full_name} | ${app.package} | ${app.appointment_date}</li>
  `).join('');
}

// Gallery
async function loadGallery() {
  const { data, error } = await supabase.storage.from('user-uploads').list('appointments');
  if (error) return;

  const container = document.getElementById('gallery-content');
  const images = await Promise.all(data.map(async file => {
    const { data: pub } = supabase.storage.from('user-uploads').getPublicUrl(`appointments/${file.name}`);
    return `<img src="${pub.publicUrl}" width="100" height="100" />`;
  }));

  container.innerHTML = images.join('');
}

// Initial load
loadAppointments();
loadUsers();
loadBookingHistory();
loadGallery();
loadAnalytics();
