"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schemas/authSchema";
import { useAuthContext } from "@/context/AuthContext";
import Cookies from "js-cookie";
import FormInput from "@/components/FormInput";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange", // Validate on change for real-time feedback
  });

  const onSubmit = async (data) => {
    setError("");
    // Validate terms agreement
    if (!agreeToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    const loadingToast = toast.loading("Creating your account...");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Store token in localStorage
        localStorage.setItem("token", result.data.token);

        // Store user info and token in cookies
        Cookies.set("user", JSON.stringify(result.data.user), {
          expires: 7,
          path: "/",
          sameSite: "lax",
        });
        Cookies.set("token", result.data.token, {
          expires: 7,
          path: "/",
          sameSite: "lax",
        });

        // Update AuthContext
        login(result.data.user.name, result.data.user.email);

        toast.success("Account created successfully! Welcome aboard!", { id: loadingToast });

        // Redirect to dashboard using Next.js router
        setTimeout(() => router.push("/dashboard"), 500);
      } else {
        setError(result.message || "Signup failed");
        toast.error(result.message || "Signup failed", { id: loadingToast });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.", { id: loadingToast });
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SprintLite</h1>
          <p className="text-gray-400 text-sm">
            Join SprintLite and start managing sprints like a pro
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Create your account</h2>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800 p-3">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              type="text"
              register={register}
              error={errors.name?.message}
              placeholder="John Developer"
            />

            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email?.message}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password?.message}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-900 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-500 hover:text-blue-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isSubmitting ? "Creating account..." : "Create your workspace"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-500 mt-8">
          © 2024 SprintLite. All rights reserved.
        </div>
      </div>
    </div>
  );
}
