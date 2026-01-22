// Test security headers from the application
import http from "http";

async function testHeaders() {
  console.log("\n🔒 Testing Security Headers...\n");
  console.log("=".repeat(80));

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      console.log("\n✅ Response Status:", res.statusCode);
      console.log("\n📋 Security Headers Detected:\n");

      const securityHeaders = [
        "strict-transport-security",
        "content-security-policy",
        "x-frame-options",
        "x-content-type-options",
        "referrer-policy",
        "permissions-policy",
        "x-dns-prefetch-control",
        "x-download-options",
        "x-permitted-cross-domain-policies",
      ];

      let foundCount = 0;

      securityHeaders.forEach((header) => {
        const value = res.headers[header];
        if (value) {
          foundCount++;
          console.log(`✓ ${header}:`);
          console.log(`  ${value}`);
          console.log("");
        } else {
          console.log(`✗ ${header}: NOT FOUND`);
          console.log("");
        }
      });

      console.log("=".repeat(80));
      console.log(`\n📊 Summary: ${foundCount}/${securityHeaders.length} security headers found\n`);

      if (foundCount === 0) {
        console.log("⚠️  WARNING: No security headers detected!");
        console.log("   Make sure middleware.js is properly configured.\n");
      } else if (foundCount < securityHeaders.length) {
        console.log("⚠️  Some security headers are missing.");
        console.log("   Consider adding all recommended headers.\n");
      } else {
        console.log("✅ All security headers are properly configured!\n");
      }

      resolve();
    });

    req.on("error", (error) => {
      console.error("❌ Error testing headers:", error.message);
      console.log("\nMake sure the development server is running:");
      console.log("  npm run dev\n");
      reject(error);
    });

    req.end();
  });
}

testHeaders().catch(console.error);
