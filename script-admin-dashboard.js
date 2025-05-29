import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --------- TAB SWITCHING ---------
document.getElementById('sidebar-list').addEventListener('click', (e) => {
  const clickedItem = e.target.closest('.sidebar-item');
  if (!clickedItem) return;

  // Remove active classes
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));

  // Activate clicked sidebar item and corresponding tab
  clickedItem.classList.add('active');
  const tabId = clickedItem.getAttribute('data-tab');
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
});

// --------- PASSWORD TOGGLE ---------
document.querySelector('.show-pass input[type="checkbox"]').addEventListener('change', (e) => {
  const passwordInput = document.getElementById('password');
  passwordInput.type = e.target.checked ? 'text' : 'password';
});

// ---------------------------
// APPOINTMENTS AND GALLERY HANDLING
// ---------------------------

const addAppointmentForm = document.getElementById('addAppointmentForm');
const allAppointmentsList = document.getElementById('all-appointments');
const pendingAppointmentsList = document.getElementById('pending-appointments');
const galleryContent = document.getElementById('gallery-content');

addAppointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const packageType = document.getElementById('package').value;
  const appointmentTime = document.getElementById('appointmentTime').value;
  const appointmentDate = document.getElementById('appointmentDate').value;
  const appointmentImageInput = document.getElementById('appointmentImage');
  const imageFile = appointmentImageInput.files[0];

  if (!fullName || !phone || !email || !packageType || !appointmentTime || !appointmentDate) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    let imageUrl = null;

    if (imageFile) {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `appointments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')  // Make sure this bucket exists
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL of uploaded image
      const { data: publicUrlData } = supabase.storage.from('user-uploads').getPublicUrl(filePath);
      imageUrl = publicUrlData.publicUrl;
    }

    // Insert new appointment
    const { error: insertError } = await supabase.from('appointments').insert({
      full_name: fullName,
      phone: phone,
      email: email,
      package: packageType,
      appointment_time: appointmentTime,
      appointment_date: appointmentDate,
      image_url: imageUrl,
      status: 'pending',
    });

    if (insertError) throw insertError;

    alert('Appointment added successfully!');
    addAppointmentForm.reset();

    await loadAppointments();
    await loadGalleryImages();

  } catch (error) {
    alert('Error adding appointment: ' + error.message);
    console.error('Add appointment error:', error);
  }
});

// Load all appointments and pending ones
async function loadAppointments() {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) throw error;

    allAppointmentsList.innerHTML = appointments.map(app => `
      <li>
        <strong>${app.full_name}</strong> | ${app.package} | ${app.appointment_date} ${app.appointment_time} | Status: ${app.status}
        ${app.image_url ? `<br><img src="${app.image_url}" alt="Uploaded image" style="max-width:100px; margin-top:5px;" />` : ''}
      </li>
    `).join('');

    const pending = appointments.filter(a => a.status === 'pending');
    pendingAppointmentsList.innerHTML = pending.length
      ? pending.map(app => `
        <li>
          <strong>${app.full_name}</strong> | ${app.package} | ${app.appointment_date} ${app.appointment_time}
          ${app.image_url ? `<br><img src="${app.image_url}" alt="Uploaded image" style="max-width:100px; margin-top:5px;" />` : ''}
        </li>
      `).join('')
      : '<li>No pending appointments</li>';

  } catch (error) {
    allAppointmentsList.innerHTML = '<li>Error loading appointments</li>';
    pendingAppointmentsList.innerHTML = '<li>Error loading appointments</li>';
    console.error('Load appointments error:', error);
  }
}

// Load images for gallery from storage
async function loadGalleryImages() {
  try {
    const { data: files, error } = await supabase.storage
      .from('user-uploads')
      .list('appointments', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) throw error;

    if (!files.length) {
      galleryContent.innerHTML = '<p>No images in the gallery yet.</p>';
      return;
    }

    const imagesHtml = files.map(file => {
      const { data: publicUrlData } = supabase.storage.from('user-uploads').getPublicUrl(`appointments/${file.name}`);
      return `<img src="${publicUrlData.publicUrl}" alt="${file.name}" style="max-width:150px; margin: 5px; border-radius: 4px; object-fit: cover;" />`;
    });

    galleryContent.innerHTML = imagesHtml.join('');

  } catch (error) {
    galleryContent.innerHTML = `<p>Error loading gallery images: ${error.message}</p>`;
    console.error('Gallery load error:', error);
  }
}

// INITIAL LOAD
loadAppointments();
loadGalleryImages();
