"use client";

import { useState, useEffect } from "react";

export default function SecurityHeadersDemo() {
  const [headers, setHeaders] = useState({});
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    fetchHeaders();
  }, []);

  const fetchHeaders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/");
      const headersList = {};
      response.headers.forEach((value, key) => {
        headersList[key] = value;
      });
      setHeaders(headersList);
      analyzeHeaders(headersList);
    } catch (error) {
      console.error("Error fetching headers:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeHeaders = (headersList) => {
    const securityTests = [
      {
        name: "HSTS (Strict-Transport-Security)",
        header: "strict-transport-security",
        description: "Forces browsers to use HTTPS connections",
        recommendation: "max-age=63072000; includeSubDomains; preload",
        importance: "critical",
      },
      {
        name: "Content-Security-Policy (CSP)",
        header: "content-security-policy",
        description: "Controls which resources can be loaded",
        recommendation: "default-src 'self'; script-src 'self'",
        importance: "critical",
      },
      {
        name: "X-Frame-Options",
        header: "x-frame-options",
        description: "Prevents clickjacking attacks",
        recommendation: "DENY or SAMEORIGIN",
        importance: "high",
      },
      {
        name: "X-Content-Type-Options",
        header: "x-content-type-options",
        description: "Prevents MIME type sniffing",
        recommendation: "nosniff",
        importance: "high",
      },
      {
        name: "Referrer-Policy",
        header: "referrer-policy",
        description: "Controls referrer information",
        recommendation: "strict-origin-when-cross-origin",
        importance: "medium",
      },
      {
        name: "Permissions-Policy",
        header: "permissions-policy",
        description: "Controls browser features",
        recommendation: "camera=(), microphone=(), geolocation=()",
        importance: "medium",
      },
    ];

    const results = securityTests.map((test) => {
      const headerValue = headersList[test.header];
      const present = !!headerValue;
      const status = present ? "pass" : "fail";

      return {
        ...test,
        present,
        value: headerValue || "Not Set",
        status,
      };
    });

    setTestResults(results);
  };

  const getStatusColor = (status) => {
    return status === "pass" ? "text-green-600" : "text-red-600";
  };

  const getStatusBadge = (status) => {
    return status === "pass" ? (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        ✓ Configured
      </span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
        ✗ Missing
      </span>
    );
  };

  const getImportanceBadge = (importance) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span className={`px-2 py-1 ${colors[importance]} rounded text-xs font-medium uppercase`}>
        {importance}
      </span>
    );
  };

  const passedTests = testResults.filter((t) => t.status === "pass").length;
  const totalTests = testResults.length;
  const scorePercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Security Headers Dashboard</h1>
          <p className="text-gray-600">
            Verify your application&apos;s security headers and OWASP compliance
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Security Score</h2>
              <p className="text-blue-100">
                {passedTests} out of {totalTests} security headers configured
              </p>
            </div>
            <div className="text-center">
              <div
                className={`text-6xl font-bold ${scorePercentage >= 80 ? "text-white" : "text-yellow-200"}`}
              >
                {scorePercentage}%
              </div>
              <p className="text-sm mt-2">
                {scorePercentage >= 80 && "🎉 Excellent!"}
                {scorePercentage >= 50 && scorePercentage < 80 && "⚠️ Good, but improve"}
                {scorePercentage < 50 && "❌ Needs attention"}
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Security Headers Test</h2>
            <button
              onClick={fetchHeaders}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Testing..." : "🔄 Refresh Test"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing security headers...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        {getImportanceBadge(test.importance)}
                        {getStatusBadge(test.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Current Value:</p>
                      <code
                        className={`text-sm ${test.present ? "text-green-700" : "text-red-700"}`}
                      >
                        {test.value}
                      </code>
                    </div>

                    <div className="bg-blue-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Recommended:</p>
                      <code className="text-sm text-blue-700">{test.recommendation}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OWASP Compliance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛡️ OWASP Top 10 Protection</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-900 mb-2">A02:2021 - Cryptographic Failures</h3>
              <p className="text-sm text-green-800">
                Protected by HSTS enforcing HTTPS connections
              </p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-900 mb-2">A03:2021 - Injection</h3>
              <p className="text-sm text-green-800">CSP prevents script injection attacks</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-900 mb-2">A04:2021 - Insecure Design</h3>
              <p className="text-sm text-green-800">
                Security headers enforce secure design principles
              </p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-900 mb-2">
                A05:2021 - Security Misconfiguration
              </h3>
              <p className="text-sm text-green-800">
                Proper header configuration prevents common misconfigurations
              </p>
            </div>
          </div>
        </div>

        {/* External Tools */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 External Security Scanners</h2>
          <p className="text-gray-600 mb-4">
            Use these external tools to verify your security headers in production:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://securityheaders.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="font-bold text-blue-900 mb-2">SecurityHeaders.com</h3>
              <p className="text-sm text-gray-600 mb-2">
                Comprehensive security header analysis and grading
              </p>
              <span className="text-blue-600 text-sm font-medium">Visit Scanner →</span>
            </a>

            <a
              href="https://observatory.mozilla.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition"
            >
              <h3 className="font-bold text-purple-900 mb-2">Mozilla Observatory</h3>
              <p className="text-sm text-gray-600 mb-2">
                Security analysis by Mozilla with detailed recommendations
              </p>
              <span className="text-purple-600 text-sm font-medium">Visit Scanner →</span>
            </a>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> External scanners require a publicly accessible URL. Test your
              production or staging environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
