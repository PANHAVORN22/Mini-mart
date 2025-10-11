// Test script to verify user registration
// Run this with: node scripts/test-registration.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nwzfnypcgkzfoulylcvc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53emZueXBjZ2t6Zm91bHlsY3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MzI4MjYsImV4cCI6MjA3MjAwODgyNn0.mof9MAnJvHk-RGpqDb5lxqe8wVdJgCQ9dPXZR8b33JQ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  console.log("Testing user registration...");

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "testpassword123";

  try {
    // Test customer registration
    console.log("Testing customer registration...");
    const { data: customerData, error: customerError } =
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Test Customer",
            role: "customer",
          },
        },
      });

    if (customerError) {
      console.error("Customer registration error:", customerError.message);
    } else {
      console.log("Customer registration successful:", {
        email: customerData.user?.email,
        confirmed: customerData.user?.email_confirmed_at,
        needsConfirmation:
          !customerData.user?.email_confirmed_at &&
          customerData.user?.identities?.length === 0,
      });
    }

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test admin registration
    console.log("Testing admin registration...");
    const adminEmail = `admin-${Date.now()}@example.com`;
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: adminEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Test Admin",
          role: "admin",
        },
      },
    });

    if (adminError) {
      console.error("Admin registration error:", adminError.message);
    } else {
      console.log("Admin registration successful:", {
        email: adminData.user?.email,
        confirmed: adminData.user?.email_confirmed_at,
        needsConfirmation:
          !adminData.user?.email_confirmed_at &&
          adminData.user?.identities?.length === 0,
      });
    }

    // Check if users were created in the users table
    console.log("Checking users table...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (usersError) {
      console.error("Error fetching users:", usersError.message);
    } else {
      console.log("Recent users:", users);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testRegistration();
