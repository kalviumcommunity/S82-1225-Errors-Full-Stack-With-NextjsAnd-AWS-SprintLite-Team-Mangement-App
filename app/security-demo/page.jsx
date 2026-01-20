"use client";

/**
 * Security Attack Demonstration Page
 *
 * Demonstrates XSS and SQLi attack prevention
 * Shows before/after examples with sanitization
 *
 * ⚠️ FOR EDUCATIONAL PURPOSES ONLY
 */

import React, { useState } from "react";
import {
  SafeHTML,
  SafeText,
  SafeLink,
  SecureInput,
  SecureTextarea,
  sanitizeHTML,
  containsXSS,
} from "@/components/SafeRender";
import { sanitizeInput, sanitizeRichText, detectXSS, detectSQLi } from "@/lib/sanitization";

export default function SecurityDemoPage() {
  const [xssInput, setXssInput] = useState("");
  const [sqliInput, setSqliInput] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // Common XSS attack vectors
  const xssAttacks = [
    { name: "Script Tag", payload: '<script>alert("XSS Attack!")</script>Hello World' },
    { name: "Image onerror", payload: "<img src=x onerror=\"alert('XSS')\">" },
    { name: "Event Handler", payload: "<div onclick=\"alert('XSS')\">Click me</div>" },
    { name: "JavaScript Protocol", payload: "<a href=\"javascript:alert('XSS')\">Link</a>" },
    {
      name: "Data URI",
      payload: "<iframe src=\"data:text/html,<script>alert('XSS')</script>\"></iframe>",
    },
  ];

  // Common SQLi attack patterns
  const sqliAttacks = [
    { name: "Classic OR Injection", payload: "' OR '1'='1" },
    { name: "Union Select", payload: "' UNION SELECT * FROM users--" },
    { name: "Comment Attack", payload: "admin'--" },
    { name: "Stacked Queries", payload: "'; DROP TABLE users;--" },
    { name: "Boolean Blind", payload: "' OR 1=1--" },
  ];

  const testXSS = (payload) => {
    setXssInput(payload);
  };

  const testSQLi = (payload) => {
    setSqliInput(payload);
  };

  const xssResult = detectXSS(xssInput);
  const sqliResult = detectSQLi(sqliInput);
  const taskTitleXSS = detectXSS(taskTitle);
  const taskDescXSS = detectXSS(taskDescription);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🛡️ Security Attack Prevention Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demonstrating XSS and SQL Injection prevention with OWASP best practices
          </p>
        </div>

        {/* XSS Demonstration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚨 XSS (Cross-Site Scripting) Prevention
          </h2>

          {/* Quick Attack Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Common XSS Attack Vectors:
            </h3>
            <div className="flex flex-wrap gap-2">
              {xssAttacks.map((attack) => (
                <button
                  key={attack.name}
                  onClick={() => testXSS(attack.payload)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  {attack.name}
                </button>
              ))}
            </div>
          </div>

          {/* XSS Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Malicious HTML/Script:
            </label>
            <SecureTextarea
              value={xssInput}
              onChange={(e) => setXssInput(e.target.value)}
              detectXSS={true}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder='Try: <script>alert("XSS")</script>'
            />
          </div>

          {/* XSS Detection */}
          {xssInput && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                🔍 Threat Detection:
              </h4>
              {!xssResult.safe ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-red-700 dark:text-red-400 font-semibold mb-2">
                    ⚠️ XSS THREAT DETECTED!
                  </p>
                  <ul className="list-disc list-inside text-red-600 dark:text-red-300 text-sm">
                    {xssResult.threats.map((threat, idx) => (
                      <li key={idx}>{threat}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <p className="text-green-700 dark:text-green-400">✅ No XSS threats detected</p>
                </div>
              )}
            </div>
          )}

          {/* Before/After Comparison */}
          {xssInput && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* UNSAFE */}
              <div className="border-2 border-red-500 rounded-lg p-4">
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                  <span className="text-2xl mr-2">❌</span>
                  UNSAFE (Vulnerable)
                </h4>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded">
                  <code className="text-xs text-red-600 dark:text-red-400 block mb-2">
                    {"<div dangerouslySetInnerHTML={{ __html: userInput }} />"}
                  </code>
                  <div className="border-t border-red-200 dark:border-red-800 pt-2 mt-2">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                      Raw HTML (Scripts Execute):
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border border-red-300">
                      {/* This would be dangerous in real code */}
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                        {xssInput}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAFE */}
              <div className="border-2 border-green-500 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  SAFE (Sanitized)
                </h4>
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded">
                  <code className="text-xs text-green-600 dark:text-green-400 block mb-2">
                    {"<SafeHTML html={sanitizeHTML(userInput)} />"}
                  </code>
                  <div className="border-t border-green-200 dark:border-green-800 pt-2 mt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                      Sanitized Output:
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border border-green-300">
                      <SafeHTML
                        html={xssInput}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      />
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">Actual HTML:</p>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                      {sanitizeHTML(xssInput) || "(empty - all malicious code removed)"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SQLi Demonstration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            💉 SQL Injection Prevention
          </h2>

          {/* Quick Attack Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Common SQLi Attack Patterns:
            </h3>
            <div className="flex flex-wrap gap-2">
              {sqliAttacks.map((attack) => (
                <button
                  key={attack.name}
                  onClick={() => testSQLi(attack.payload)}
                  className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-sm font-medium transition-colors"
                >
                  {attack.name}
                </button>
              ))}
            </div>
          </div>

          {/* SQLi Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter SQL Injection Attempt:
            </label>
            <SecureInput
              value={sqliInput}
              onChange={(e) => setSqliInput(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Try: ' OR '1'='1"
            />
          </div>

          {/* SQLi Detection */}
          {sqliInput && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                🔍 Threat Detection:
              </h4>
              {!sqliResult.safe ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-3">
                  <p className="text-purple-700 dark:text-purple-400 font-semibold mb-2">
                    ⚠️ SQL INJECTION ATTEMPT DETECTED!
                  </p>
                  <ul className="list-disc list-inside text-purple-600 dark:text-purple-300 text-sm">
                    {sqliResult.threats.map((threat, idx) => (
                      <li key={idx}>{threat}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <p className="text-green-700 dark:text-green-400">✅ No SQLi patterns detected</p>
                </div>
              )}
            </div>
          )}

          {/* Before/After Comparison */}
          {sqliInput && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* UNSAFE */}
              <div className="border-2 border-red-500 rounded-lg p-4">
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                  <span className="text-2xl mr-2">❌</span>
                  UNSAFE (Vulnerable)
                </h4>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded">
                  <code className="text-xs text-red-600 dark:text-red-400 block mb-2 whitespace-pre-wrap">
                    {`// String concatenation - DANGEROUS!\nconst query = "SELECT * FROM users WHERE email = '" + userInput + "'";\ndb.query(query);`}
                  </code>
                  <div className="border-t border-red-200 dark:border-red-800 pt-2 mt-2">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">Resulting Query:</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-red-300 whitespace-pre-wrap">
                      {`SELECT * FROM users WHERE email = '${sqliInput}'`}
                    </pre>
                    {!sqliResult.safe && (
                      <p className="text-xs text-red-700 dark:text-red-400 mt-2 font-semibold">
                        ☠️ This query would execute malicious SQL!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SAFE */}
              <div className="border-2 border-green-500 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  SAFE (Parameterized)
                </h4>
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded">
                  <code className="text-xs text-green-600 dark:text-green-400 block mb-2 whitespace-pre-wrap">
                    {`// Prisma ORM - Parameterized queries\nconst user = await prisma.user.findUnique({\n  where: { email: userInput }\n});`}
                  </code>
                  <div className="border-t border-green-200 dark:border-green-800 pt-2 mt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                      Safe Execution:
                    </p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-green-300 whitespace-pre-wrap">
                      {`// Prisma escapes and parameterizes automatically\n// Input treated as data, not SQL code\nParameter: email = "${sanitizeInput(sqliInput)}"`}
                    </pre>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-2 font-semibold">
                      ✅ Malicious SQL is neutralized - treated as plain text!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-World Task Example */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📝 Real-World Example: Task Creation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try entering malicious content in the form below. Our sanitization will detect and
            neutralize threats.
          </p>

          <div className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title:
              </label>
              <SecureInput
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                detectXSS={true}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task title"
                maxLength={100}
              />
              {!taskTitleXSS.safe && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">
                  <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                    Threats: {taskTitleXSS.threats.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Description:
              </label>
              <SecureTextarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                detectXSS={true}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task description"
                rows={4}
                maxLength={5000}
              />
              {!taskDescXSS.safe && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">
                  <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                    Threats: {taskDescXSS.threats.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            {(taskTitle || taskDescription) && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ✅ Sanitized Output (Safe for Display):
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-blue-300">
                  <h5 className="font-bold text-lg mb-2">
                    <SafeText text={sanitizeInput(taskTitle)} />
                  </h5>
                  <SafeHTML
                    html={sanitizeRichText(taskDescription)}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OWASP Best Practices */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">🛡️ OWASP Security Principles Applied</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">✅ Implemented:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Input validation and sanitization</li>
                <li>• Output encoding for safe rendering</li>
                <li>• Parameterized queries (Prisma ORM)</li>
                <li>• Content Security Policy headers</li>
                <li>• XSS threat detection and logging</li>
                <li>• SQL injection pattern blocking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📚 OWASP Top 10:</h3>
              <ul className="space-y-1 text-sm">
                <li>• A03:2021 - Injection (SQLi, XSS)</li>
                <li>• A07:2021 - Identification & Auth</li>
                <li>• A08:2021 - Software & Data Integrity</li>
                <li>• Defense in depth strategy</li>
                <li>• Continuous security validation</li>
                <li>• Security logging and monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
