import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase credentials
const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Dropdown toggle
window.toggleDropdown = function(header) {
  const content = header.nextElementSibling;
  content.classList.toggle('hidden');
};

// State vars
let selectedPackage = { name: '', imageUrl: '' };
let selectedTime = '';

// Select package
window.selectPackage = function(imageUrl, name) {
  document.getElementById('image-preview').innerHTML = `<img src="${imageUrl}" style="max-height: 100%; max-width: 100%; object-fit: cover;">`;
  selectedPackage = { name, imageUrl };
};

// Scroll to section
window.nextSection = function(sectionId) {
  document.querySelector('.date-time').style.display = 'block';
  document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
};

// Restrict min date
window.onload = () => {
  const datePicker = document.getElementById("date-picker");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const dd = today.getDate().toString().padStart(2, '0');
  datePicker.min = `${yyyy}-${mm}-${dd}`;
};

// Show time buttons
window.showTimes = function() {
  const selectedDate = new Date(document.getElementById('date-picker').value);
  const day = selectedDate.getDay();
  if (day === 1) {
    alert("Closed on Mondays. Please choose another day.");
    return;
  }

  const container = document.getElementById('time-buttons');
  container.innerHTML = '';
  for (let hour = 12; hour <= 18; hour++) {
    const timeStr = `${hour}:00`;
    const btn = document.createElement("button");
    btn.textContent = timeStr;
    btn.onclick = () => {
      selectedTime = timeStr;
      document.querySelector('.booking-form').style.display = 'block';
      document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' });
    };
    container.appendChild(btn);
  }
};

// Submit booking
window.submitBooking = async function() {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const date = document.getElementById('date-picker').value;

  if (!firstName || !email || !phone || !date || !selectedTime || !selectedPackage.name) {
    alert("Please fill in all required fields.");
    return;
  }

  const { error } = await supabase.from('appointments').insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      package_name: selectedPackage.name,
      date,
      time: selectedTime,
      image_url: selectedPackage.imageUrl
    }
  ]);

  if (error) {
    alert("Error booking: " + error.message);
  } else {
  alert("Booking successful! Redirecting you to the main page...");
  setTimeout(() => {
    window.location.href = "user-mainpage.html"; // Redirects after 1.5 seconds
  }, 1500);
  }
};
