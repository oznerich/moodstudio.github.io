function showTab(tabId, element) {
  // Hide all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove 'active' class from all sidebar items
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Show the selected tab
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Set clicked sidebar item as active
  if (element) {
    element.classList.add("active");
  }
}
