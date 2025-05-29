    function showSection(sectionId) {
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      document.getElementById(sectionId).classList.add('active');
    }

    function logout() {
      // Simulate logout
      alert('Logged out successfully.');
      window.location.href = 'user-mainpage.html';
    }

    function sortBookings() {
      const sortValue = document.getElementById('sort').value;
      alert('Sorting by ' + sortValue);
      // Add actual sorting logic based on timestamps if data available
    }