const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ UI Tab Handling
function showTab(tabId, element) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add("active");
  if (element) element.classList.add("active");

  if (tabId === 'user-management') loadUsers();
}

// ✅ Load users from Supabase
async function loadUsers() {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

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
    document.getElementById('users-list').innerHTML = `
      <li class="user-item error">Error loading users</li>
    `;
  }
}

// ✅ Add new user (auth + profile)
async function addUser(event) {
  event.preventDefault();
  const form = event.target;
  const userData = {
    email: form.querySelector('input[type="email"]').value,
    first_name: form.querySelector('input[placeholder="First Name"]').value,
    last_name: form.querySelector('input[placeholder="Last Name"]').value,
    birthday: form.querySelector('input[type="date"]').value,
    contact: form.querySelector('input[placeholder="Contact No."]').value
  };

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: form.querySelector('input[type="password"]').value
    });
    if (authError) throw authError;

    const { error } = await supabase.from('profiles').insert([{
      ...userData,
      id: authData.user.id,
      role: 'User'
    }]);
    if (error) throw error;

    alert('User created successfully!');
    form.reset();
    loadUsers();
  } catch (error) {
    alert('Error creating user: ' + error.message);
  }
}

// ✅ Password toggle
function togglePassword() {
  const passwordField = document.getElementById("password");
  passwordField.type = passwordField.type === "password" ? "text" : "password";
}

// ✅ Time validation
document.getElementById("appointmentTime")?.addEventListener("input", function (e) {
  const time = e.target.value;
  if (time < "12:00" || time > "19:00") {
    alert("Please select a time between 12:00 PM and 7:00 PM.");
    e.target.value = "";
  }
});

// ✅ Date validation
document.getElementById("appointmentDate")?.addEventListener("input", function (e) {
  const date = new Date(e.target.value);
  if (date.getDay() === 1) {
    alert("Appointments are not available on Mondays.");
    e.target.value = "";
  }
});

// ✅ Print booking receipt
function printReceipt(name, packageName, date) {
  const receiptWindow = window.open('', '_blank');
  receiptWindow.document.write(`
    <html><head><title>Receipt</title></head><body>
      <h2>Official Receipt</h2>
      <p>Name: ${name}</p>
      <p>Package: ${packageName}</p>
      <p>Date: ${date}</p>
      <hr><p>Thank you for booking!</p>
      <script>window.print();</script>
    </body></html>
  `);
  receiptWindow.document.close();
}

// ✅ Filter bookings by timeframe
function filterBookings() {
  const filter = document.getElementById('bookingFilter').value;
  const items = document.querySelectorAll('#bookingList .user-item');
  const now = new Date();

  items.forEach(item => {
    const dateStr = item.getAttribute('data-date');
    const bookingDate = new Date(dateStr);
    let show = false;

    switch (filter) {
      case 'day':
        show = bookingDate.toDateString() === now.toDateString(); break;
      case 'week':
        const start = new Date(now.setDate(now.getDate() - now.getDay()));
        const end = new Date(start); end.setDate(end.getDate() + 6);
        show = bookingDate >= start && bookingDate <= end; break;
      case 'month':
        show = bookingDate.getMonth() === now.getMonth(); break;
      case 'year':
        show = bookingDate.getFullYear() === now.getFullYear(); break;
      default:
        show = true;
    }

    item.style.display = show ? 'flex' : 'none';
  });
}

// ✅ Initialize listeners
document.getElementById('addUserForm')?.addEventListener('submit', addUser);
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('user-management')?.classList.contains('active')) {
    loadUsers();
  }
});
