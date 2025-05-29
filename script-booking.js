    // Toggle dropdown visibility
    function toggleDropdown(header) {
      const content = header.nextElementSibling;
      content.classList.toggle('hidden');
    }

    // Show image preview
    function selectPackage(imageUrl) {
      document.getElementById('image-preview').innerHTML = `<img src="${imageUrl}" style="max-height: 100%; max-width: 100%; object-fit: cover;">`;
    }

    // Move to next section
    function nextSection(sectionId) {
      document.querySelector('.date-time').style.display = 'block';
      document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
    }

    // Set min date
    window.onload = () => {
      const datePicker = document.getElementById("date-picker");
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = (today.getMonth() + 1).toString().padStart(2, '0');
      const dd = today.getDate().toString().padStart(2, '0');
      datePicker.min = `${yyyy}-${mm}-${dd}`;
    };

    // Show available time buttons
    function showTimes() {
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
          document.querySelector('.booking-form').style.display = 'block';
          document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' });
        };
        container.appendChild(btn);
      }
    }