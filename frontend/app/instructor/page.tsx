"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface Course {
  _id: string;
  name: string;
  level: string;
  description: string;
  image?: string;
}

interface Instructor {
  _id: string;
  name: string;
  email: string;
}

interface Lecture {
  _id: string;
  courseId: Course | null;
  instructorId: Instructor | null;
  batchName: string;
  lectureDate: string;
}

export default function InstructorDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [instructorName, setInstructorName] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("sched_role");
    const userStr = localStorage.getItem("sched_user");
    
    if (role !== "instructor" || !userStr) {
      window.location.href = "/";
    } else {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          setInstructorId(user.id);
          setInstructorName(user.name);
          setInstructorEmail(user.email);
          setAuthorized(true);
        } else {
          window.location.href = "/";
        }
      } catch (e) {
        console.error("Error loading instructor session:", e);
        window.location.href = "/";
      }
    }
  }, []);

  const fetchMyLectures = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/lectures/instructor/${id}`);
      const json = await res.json();
      if (json.success) {
        setLectures(json.data);
      }
    } catch (e) {
      console.error("Error fetching instructor lectures:", e);
    } finally {
      setLoading(false);
    }
  };
const handleChangePassword = async () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return alert("Please fill all fields.");
  }

  if (newPassword !== confirmPassword) {
    return alert("New password and Confirm password do not match.");
  }

  try {
    setChangingPassword(true);

    const res = await fetch(`${API_BASE}/auth/change-password/${instructorId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Unable to change password.");
  } finally {
    setChangingPassword(false);
  }
};
  useEffect(() => {
    if (authorized && instructorId) {
      fetchMyLectures(instructorId);
    }
  }, [authorized, instructorId]);

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold">Loading instructor portal...</span>
        </div>
      </div>
    );
  }

  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  const upcomingLectures = lectures.filter((l) => new Date(l.lectureDate) >= todayUTC);
  const pastLectures = lectures.filter((l) => new Date(l.lectureDate) < todayUTC);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans flex flex-col dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      
      {/* Shared Navbar */}
      <Navbar role="instructor" title={`Faculty Member Portal`} />

      {/* Main timeline page container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-fade-in">
        
        {/* Welcome Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-indigo-650/20">
              {instructorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-indigo-600 font-bold dark:text-indigo-400 tracking-widest uppercase">Logged In Faculty</span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">Welcome, {instructorName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{instructorEmail}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider uppercase block">Scheduled Classes</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{lectures.length} Total</span>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">{upcomingLectures.length} Upcoming</p>
          </div>
        </div>

        {/* Schedule Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Timeline of upcoming schedules (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">Your Upcoming Lectures</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Classes assigned to your timetable calendar</p>
              </div>
              <button 
                id="btn-refresh-instructor-schedule"
                onClick={() => fetchMyLectures(instructorId!)}
                className="p-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border rounded-xl transition-all dark:bg-slate-900 dark:hover:bg-slate-800"
                title="Refresh schedule logs"
              >
                <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-xs">Fetching schedule dates...</p>
              </div>
            ) : upcomingLectures.length === 0 ? (
              <div className="glass-panel p-16 text-center rounded-3xl border">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-900 border text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Upcoming Lectures</h4>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">You are completely free! No class schedules are assigned to you.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {upcomingLectures.map((l) => {
                  const course = l.courseId;
                  const imgSrc = course?.image ? (course.image.startsWith("http") ? course.image : `${process.env.NEXT_PUBLIC_API_BASE}${course.image}`) : null;
                  return (
                    <div key={l._id} className="relative group">
                      
                      {/* Timeline indicator node */}
                      <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-slate-50 bg-indigo-600 dark:border-slate-950 group-hover:scale-110 transition-transform" />

                      <div className="glass-panel p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                        
                        {/* Course Image or Fallback */}
                        <div className="w-full sm:w-24 h-20 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 border">
                          {imgSrc ? (
                            <img src={imgSrc} alt={course?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center p-2 text-center">
                              <span className="font-bold text-[9px] text-indigo-700 dark:text-indigo-400 line-clamp-2">{course?.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{l.batchName}</h4>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50">
                                {course?.level}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-indigo-300 block mt-0.5">{course?.name}</span>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{course?.description}</p>
                          </div>
                        </div>

                        {/* Calendar Badge */}
                        <div className="sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-850">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Class Date</span>
                          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{formatFriendlyDate(l.lectureDate)}</span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past History sidebar panel (1 col) */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">Lecture History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Classes previously completed</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : pastLectures.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl border">
                <span className="text-xs text-slate-450 italic">No past lecture logs</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pastLectures.map((l) => (
                  <div key={l._id} className="glass-panel p-3.5 rounded-2xl border shadow-sm bg-slate-50/50 flex flex-col gap-1 hover:border-slate-200 dark:hover:border-slate-800 transition-all opacity-70">
                    <span className="text-[10px] text-slate-400 font-bold block">{formatFriendlyDate(l.lectureDate)}</span>
                    <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">{l.batchName}</h5>
                    <p className="text-[11px] text-slate-500">{l.courseId?.name}</p>
                  </div>
                ))}
              </div>

            ) }
            <div className="glass-panel p-6 rounded-2xl border">
  <h3 className="text-lg font-bold mb-4">
    Change Password
  </h3>

  <div className="space-y-2">

    <input
      type="password"
      placeholder="Current Password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      className="w-full border rounded-xl p-2"
    />

    <input
      type="password"
      placeholder="New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full border rounded-xl p-2"
    />

    <input
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="w-full border rounded-xl p-2"
    />

    <button
      onClick={handleChangePassword}
      disabled={changingPassword}
      className="w-full bg-indigo-600 text-white rounded-xl py-2 font-semibold hover:bg-indigo-700 disabled:opacity-50"
    >
      {changingPassword ? "Updating..." : "Update Password"}
    </button>

  </div>
</div>
            
          </div>

        </div>

      </main>
    </div>
  );
}
