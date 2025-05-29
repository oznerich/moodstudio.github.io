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

  const recent = data.filter(app => new Date(app.appointment_date) > (Date.now() - 7 * 86400000));
  insight += ` You have ${recent.length} bookings this week.`;

  document.getElementById('ai-insights').textContent = insight;
}

// APPOINTMENTS
const addAppointmentForm = document.getElementById('addAppointmentForm');
const allAppointmentsList = document.getElementById('all-appointments');

addAppointmentForm.addEventListener('submit', async (e) => {
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
  if (error || !data) {
    allAppointmentsList.innerHTML = '<li>Failed to load appointments.</li>';
    return;
  }

  allAppointmentsList.innerHTML = data.map(app => `
    <li>
      <strong>${app.full_name}</strong> | ${app.package} | ${app.appointment_date} | ${app.appointment_time}
      <button data-id="${app.id}" class="delete-appointment">Delete</button>
    </li>
  `).join('');

  document.querySelectorAll('.delete-appointment').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      await supabase.from('appointments').delete().eq('id', id);
      loadAppointments();
      loadAnalytics();
    };
  });
}

// USERS
const addUserForm = document.getElementById('addUserForm');
const usersList = document.getElementById('users-list');

addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = {
    email: document.getElementById('userEmail').value,
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
  };

  const { error } = await supabase.from('profiles').insert(user);
  if (error) {
    alert('Failed to add user: ' + error.message);
    return;
  }
  addUserForm.reset();
  loadUsers();
});

async function loadUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error || !data) {
    usersList.innerHTML = '<li>Failed to load users.</li>';
    return;
  }

  usersList.innerHTML = data.map(user => `
    <li>
      ${user.first_name} ${user.last_name} - ${user.email}
      <button data-id="${user.id}" class="delete-user">Delete</button>
    </li>
  `).join('');

  document.querySelectorAll('.delete-user').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      await supabase.from('profiles').delete().eq('id', id);
      loadUsers();
    };
  });
}

// BOOKING HISTORY (for demo, showing all appointments again)
const bookingsList = document.getElementById('bookings-list');
async function loadBookingHistory() {
  const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: false });
  if (error || !data) {
    bookingsList.innerHTML = '<li>Failed to load booking history.</li>';
    return;
  }
  bookingsList.innerHTML = data.map(b => `
    <li>${b.full_name} - ${b.package} - ${b.appointment_date} - ${b.appointment_time}</li>
  `).join('');
}

// GALLERY (sample static for demo)
const galleryContent = document.getElementById('gallery-content');
function loadGallery() {
  const images = [
    'https://picsum.photos/id/1015/200/150',
    'https://picsum.photos/id/1020/200/150',
    'https://picsum.photos/id/1025/200/150',
  ];
  galleryContent.innerHTML = images.map(src => `<img src="${src}" alt="Gallery Image" width="200" height="150"/>`).join('');
}

// INITIAL LOAD
loadAnalytics();
loadAppointments();
loadUsers();
loadBookingHistory();
loadGallery();
