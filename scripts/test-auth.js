// Test Auth Flow - Signup, Login, Protected Routes
const BASE_URL = "http://localhost:3000";

async function testAuthFlow() {
  console.log("🧪 Testing Authentication Flow...\n");

  // Generate unique test email
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "SecurePass123";

  try {
    // 1️⃣ Test Signup
    console.log("1️⃣  Testing Signup...");
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: testPassword,
      }),
    });
    const signupData = await signupRes.json();
    console.log("Status:", signupRes.status);
    console.log("Response:", JSON.stringify(signupData, null, 2));

    if (!signupData.success) {
      console.error("❌ Signup failed!");
      return;
    }

    console.log("✅ Signup successful!\n");
    const token = signupData.data.token;
    console.log("JWT Token received:", token.substring(0, 20) + "...\n");

    // 2️⃣ Test Login
    console.log("2️⃣  Testing Login...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    console.log("Status:", loginRes.status);
    console.log("Response:", JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      console.error("❌ Login failed!");
      return;
    }

    console.log("✅ Login successful!\n");
    const loginToken = loginData.data.token;

    // 3️⃣ Test Protected Route (without token)
    console.log("3️⃣  Testing Protected Route (without token)...");
    const noAuthRes = await fetch(`${BASE_URL}/api/users`);
    const noAuthData = await noAuthRes.json();
    console.log("Status:", noAuthRes.status);
    console.log("Response:", JSON.stringify(noAuthData, null, 2));

    if (noAuthRes.status === 401) {
      console.log("✅ Protected route correctly rejects unauthorized requests!\n");
    } else {
      console.error("❌ Protected route should return 401 without token!\n");
    }

    // 4️⃣ Test Protected Route (with valid token)
    console.log("4️⃣  Testing Protected Route (with valid token)...");
    const authRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${loginToken}` },
    });
    const authData = await authRes.json();
    console.log("Status:", authRes.status);
    console.log("Response:", JSON.stringify(authData, null, 2));

    if (authData.success) {
      console.log("✅ Protected route accessible with valid token!\n");
    } else {
      console.error("❌ Protected route failed with valid token!\n");
    }

    // 5️⃣ Test Login with Invalid Credentials
    console.log("5️⃣  Testing Login with Invalid Password...");
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword",
      }),
    });
    const badLoginData = await badLoginRes.json();
    console.log("Status:", badLoginRes.status);
    console.log("Response:", JSON.stringify(badLoginData, null, 2));

    if (badLoginRes.status === 401) {
      console.log("✅ Invalid credentials correctly rejected!\n");
    } else {
      console.error("❌ Should reject invalid credentials!\n");
    }

    // 6️⃣ Test Duplicate Signup
    console.log("6️⃣  Testing Duplicate Signup...");
    const dupSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate User",
        email: testEmail,
        password: testPassword,
      }),
    });
    const dupSignupData = await dupSignupRes.json();
    console.log("Status:", dupSignupRes.status);
    console.log("Response:", JSON.stringify(dupSignupData, null, 2));

    if (dupSignupRes.status === 409) {
      console.log("✅ Duplicate email correctly rejected!\n");
    } else {
      console.error("❌ Should reject duplicate email!\n");
    }

    console.log("\n✅ All authentication tests completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

testAuthFlow();
