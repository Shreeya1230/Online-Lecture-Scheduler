"use client";

import React, { useEffect, useState } from "react";

interface NavbarProps {
  role: "admin" | "instructor";
  title?: string;
}

export default function Navbar({ role, title }: NavbarProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sched_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    const checkConnection = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/courses`);
        setIsBackendConnected(res.ok);
      } catch (e) {
        setIsBackendConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sched_user");
    localStorage.removeItem("sched_role");
    window.location.href = "/";
  };

  return (
    <header className="glass-panel sticky top-0 z-30 border-b shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/20 text-white flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              IdeaSched
            </h1>
            <p className="text-[10px] text-slate-500 font-medium dark:text-slate-400 tracking-wide uppercase">
              {role === "admin" ? "Admin Management Portal" : "Instructor Schedule Portal"}
            </p>
          </div>
        </div>

        {/* Current title or state banner */}
        {title && (
          <div className="hidden md:block font-semibold text-sm text-slate-500 dark:text-slate-400">
            {title}
          </div>
        )}

        {/* Right Area: User Profile, Connection & Logout */}
        <div className="flex items-center gap-5">
          {/* Status Check */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${
              isBackendConnected === true ? "bg-emerald-500 animate-pulse" : isBackendConnected === false ? "bg-rose-500" : "bg-amber-500"
            }`} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBackendConnected === true ? "Online" : isBackendConnected === false ? "Offline" : "Checking..."}
            </span>
          </div>

          {/* User Details Profile info */}
          {user && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{user.email}</span>
            </div>
          )}

          {/* Profile Circle Initials */}
          {user && (
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border text-xs font-extrabold flex items-center justify-center text-slate-700 dark:text-slate-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold rounded-lg transition-all dark:bg-slate-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-slate-650"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}
