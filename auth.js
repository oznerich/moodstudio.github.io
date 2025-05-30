import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://rdgahcjjbewvyqcfdtih.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.togglePassword = (id, checkbox) => {
  const input = document.getElementById(id);
  input.type = checkbox.checked ? "text" : "password";
};

window.togglePasswordGroup = () => {
  const pw1 = document.getElementById("register-password");
  const pw2 = document.getElementById("confirm-password");
  const show = event.target.checked;
  pw1.type = pw2.type = show ? "text" : "password";
};

window.showForm = (formId) => {
  document
    .querySelectorAll(".form-section")
    .forEach((f) => f.classList.remove("active"));
  document.getElementById(formId).classList.add("active");
};

// Register
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const first_name = document.getElementById("first-name").value;
    const last_name = document.getElementById("last-name").value;
    const birthday = document.getElementById("birthday").value;
    const contact = document.getElementById("contact").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // 1. Sign up user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(`Registration failed: ${signUpError.message}`);
      return;
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      alert("Registration succeeded but user ID is missing.");
      return;
    }

    // 2. Insert profile row with user ID
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      first_name,
      last_name,
      birthday,
      contact,
      role: "User",
    });

    if (insertError) {
      alert(`Profile creation failed: ${insertError.message}`);
    } else {
      alert("Registration successful! You can now log in.");
      showForm("loginForm");
    }
  });

// Login (with role-based redirect)
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    alert(`Login failed: ${authError.message}`);
    return;
  }

  const user = authData?.user;
  if (!user) {
    alert("Login succeeded but user info is missing.");
    return;
  }

  // Fetch role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    alert(`Failed to fetch profile: ${profileError.message}`);
    return;
  }

  const role = profile?.role;

  // Redirect based on role
  if (role === "Super Admin") {
    window.location.href = "superadmin-dashboard.html";
  }
  else if (role === "Admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "user-mainpage.html";
  }
});

// Forgot Password
document.getElementById("forgot-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgot-email").value;
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    alert(`Reset failed: ${error.message}`);
  } else {
    alert("Reset link sent! Check your inbox.");
    showForm("loginForm");
  }
});
