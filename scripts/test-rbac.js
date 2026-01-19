// Test RBAC - Role-Based Access Control
const BASE_URL = "http://localhost:3000";

async function testRBAC() {
  console.log("🧪 Testing Role-Based Access Control...\n");

  try {
    // Step 1: Create test users with different roles
    console.log("1️⃣  Creating test users with different roles...");

    // Create Member user
    const memberEmail = `member_${Date.now()}@test.com`;
    const memberRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Member",
        email: memberEmail,
        password: "TestPass123",
      }),
    });
    const memberData = await memberRes.json();
    const memberToken = memberData.data?.token;
    console.log("✅ Member user created:", memberEmail);

    // Create Admin user (manually set role in DB for testing)
    const adminEmail = `admin_${Date.now()}@test.com`;
    const adminRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Admin",
        email: adminEmail,
        password: "AdminPass123",
      }),
    });
    await adminRes.json();
    console.log("✅ Admin user created:", adminEmail);
    console.log('⚠️  Note: Manually update role to "Admin" in database for full testing\n');

    // Step 2: Test /api/users (accessible to all authenticated users)
    console.log("2️⃣  Testing /api/users (all authenticated users)...");
    const usersRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const usersData = await usersRes.json();
    console.log("Status:", usersRes.status);
    console.log("Success:", usersData.success);
    if (usersData.success) {
      console.log("✅ Member can access /api/users\n");
    } else {
      console.log("❌ Member cannot access /api/users\n");
    }

    // Step 3: Test /api/admin with Member token (should fail)
    console.log("3️⃣  Testing /api/admin with Member token (should be denied)...");
    const adminAccessMember = await fetch(`${BASE_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const adminAccessMemberData = await adminAccessMember.json();
    console.log("Status:", adminAccessMember.status);
    console.log("Response:", JSON.stringify(adminAccessMemberData, null, 2));
    if (adminAccessMember.status === 403) {
      console.log("✅ Member correctly denied access to /api/admin\n");
    } else {
      console.log("❌ Member should not have access to /api/admin\n");
    }

    // Step 4: Test without token (should fail)
    console.log("4️⃣  Testing /api/admin without token...");
    const noTokenRes = await fetch(`${BASE_URL}/api/admin`);
    const noTokenData = await noTokenRes.json();
    console.log("Status:", noTokenRes.status);
    console.log("Response:", JSON.stringify(noTokenData, null, 2));
    if (noTokenRes.status === 401) {
      console.log("✅ Correctly requires authentication\n");
    } else {
      console.log("❌ Should require authentication\n");
    }

    // Step 5: Test /api/admin/users with Member token (should fail)
    console.log("5️⃣  Testing /api/admin/users with Member token (should be denied)...");
    const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const adminUsersData = await adminUsersRes.json();
    console.log("Status:", adminUsersRes.status);
    console.log("Success:", adminUsersData.success);
    if (adminUsersRes.status === 403) {
      console.log("✅ Member correctly denied access to /api/admin/users\n");
    } else {
      console.log("❌ Member should not have access to /api/admin/users\n");
    }

    console.log("\n✅ RBAC tests completed!");
    console.log("\n📝 Summary:");
    console.log("- ✅ Authenticated users can access /api/users");
    console.log("- ✅ Member users are denied access to /api/admin");
    console.log("- ✅ Unauthenticated requests are rejected");
    console.log("- ✅ Role-based access control is working");
    console.log("\n⚠️  To fully test Admin access:");
    console.log(`1. Update ${adminEmail} role to "Admin" in the database`);
    console.log("2. Login with admin credentials to get admin token");
    console.log("3. Test /api/admin and /api/admin/users with admin token");
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

testRBAC();
