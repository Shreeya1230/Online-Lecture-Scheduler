"use client";

import React, { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Reusable eye icon toggle component
function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  id,
  required = false,
  className = "",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full text-sm bg-slate-50 border border-slate-200 p-3 rounded-xl custom-input dark:bg-slate-900 dark:border-slate-800 pr-10 ${className}`}
        required={required}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          // Eye-off icon
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 015.17 1.45M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
          </svg>
        ) : (
          // Eye icon
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "instructor">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  // Pre-fill Admin credentials for easier testing/grading
  useEffect(() => {
    setEmail("");
    setPassword("");
    setErrorMsg("");
  }, [role]);

  // Check Backend status on load
  useEffect(() => {
    // If they already have a valid session, auto-redirect
    const savedRole = localStorage.getItem("sched_role");
    const savedUser = localStorage.getItem("sched_user");
    if (savedRole && savedUser) {
      window.location.href = savedRole === "admin" ? "/admin" : "/instructor";
    }

    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses`);
        setIsBackendOnline(res.ok);
      } catch (e) {
        setIsBackendOnline(false);
      }
    };
    checkServer();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        // Save session credentials
        localStorage.setItem("sched_user", JSON.stringify(json.user));
        localStorage.setItem("sched_role", json.role);

        // Redirect based on role
        window.location.href = json.role === "admin" ? "/admin" : "/instructor";
      } else {
        setErrorMsg(json.message || "Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      console.error("Login failure:", err);
      setErrorMsg("Cannot contact authentication server. Please check that backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Background soft glowing blur elements */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
            IdeaSched
          </h1>
          <p className="text-[10px] text-slate-500 font-bold dark:text-slate-400 tracking-widest uppercase">
            Lecture Scheduler Portal
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border shadow-xl animate-fade-in">
        
        {/* Connection status notification */}
        {isBackendOnline === false && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 text-xs dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 leading-relaxed shadow-sm">
            <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold">Backend API is offline.</span> Login requests will fail until the Express server is running.
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Choose your account role to sign in</p>
        </div>

        {/* Role toggle tabs */}
        <div className="glass-panel p-1.5 rounded-xl flex gap-1 mb-6 border">
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === "admin"
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Panel
          </button>
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === "instructor"
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Instructor Portal
          </button>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex gap-2 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 shadow-sm leading-relaxed">
            <svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">Login Blocked:</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "admin" ? "admin@gmail.com" : "e.g. instructor@school.edu"}
              className="w-full text-sm bg-slate-50 border border-slate-200 p-3 rounded-xl custom-input dark:bg-slate-900 dark:border-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {role === "instructor" && (
              <div className="mt-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  Default password is <span className="font-bold font-mono bg-indigo-100 dark:bg-indigo-900/50 px-1 py-0.5 rounded">instructor123</span>. You can change it from your portal after logging in.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isBackendOnline === false}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl shadow-lg shadow-indigo-650/10 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Sign In to IdeaSched
          </button>
        </form>

      </div>
    </div>
  );
}
