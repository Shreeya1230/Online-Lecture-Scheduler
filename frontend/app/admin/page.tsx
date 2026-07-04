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

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"courses" | "instructors" | "lectures" | "add-course">("courses");

  // State arrays
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);

  // Loading states
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [loadingLectures, setLoadingLectures] = useState(true);

  // Form states - Add Course
  const [courseName, setCourseName] = useState("");
  const [courseLevel, setCourseLevel] = useState("Beginner");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Form states - Add Instructor
  const [instName, setInstName] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [submittingInstructor, setSubmittingInstructor] = useState(false);

  // Form states - Schedule Lecture
  const [scheduleCourseId, setScheduleCourseId] = useState("");
  const [scheduleInstructorId, setScheduleInstructorId] = useState("");
  const [scheduleBatchName, setScheduleBatchName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [submittingLecture, setSubmittingLecture] = useState(false);

  // Global Notification Banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Route protection
  useEffect(() => {
    const role = localStorage.getItem("sched_role");
    const user = localStorage.getItem("sched_user");
    if (role !== "admin" || !user) {
      window.location.href = "/";
    } else {
      setAuthorized(true);
    }
  }, []);

  // Fetch data
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await fetch(`${API_BASE}/courses`);
      const json = await res.json();
      if (json.success) setCourses(json.data);
    } catch (e) {
      console.error("Error fetching courses:", e);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const res = await fetch(`${API_BASE}/instructors`);
      const json = await res.json();
      if (json.success) setInstructors(json.data);
    } catch (e) {
      console.error("Error fetching instructors:", e);
    } finally {
      setLoadingInstructors(false);
    }
  };

  const fetchLectures = async () => {
    try {
      setLoadingLectures(true);
      const res = await fetch(`${API_BASE}/lectures`);
      const json = await res.json();
      if (json.success) setLectures(json.data);
    } catch (e) {
      console.error("Error fetching lectures:", e);
    } finally {
      setLoadingLectures(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchCourses();
      fetchInstructors();
      fetchLectures();
    }
  }, [authorized]);

  // Helpers
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseImageFile(file);
      setCourseImageUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !courseDesc) {
      showToast("error", "Please fill in all required course fields.");
      return;
    }

    setSubmittingCourse(true);
    try {
      const formData = new FormData();
      formData.append("name", courseName);
      formData.append("level", courseLevel);
      formData.append("description", courseDesc);

      if (courseImageFile) {
        formData.append("image", courseImageFile);
      } else if (courseImageUrl) {
        formData.append("image", courseImageUrl);
      }

      const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", `Course "${courseName}" added successfully.`);
        // Reset states
        setCourseName("");
        setCourseDesc("");
        setCourseLevel("Beginner");
        setCourseImageFile(null);
        setCourseImageUrl("");
        setImagePreview(null);
        fetchCourses();
        setActiveTab("courses");
      } else {
        showToast("error", json.message || "Failed to create course.");
      }
    } catch (err) {
      showToast("error", "Error contacting server to create course.");
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !instEmail) {
      showToast("error", "Please fill in all instructor fields.");
      return;
    }

    setSubmittingInstructor(true);
    try {
      const res = await fetch(`${API_BASE}/instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: instName, email: instEmail }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", `Instructor "${instName}" registered successfully.`);
        setInstName("");
        setInstEmail("");
        fetchInstructors();
      } else {
        showToast("error", json.message || "Failed to add instructor.");
      }
    } catch (err) {
      showToast("error", "Error contacting server to register instructor.");
    } finally {
      setSubmittingInstructor(false);
    }
  };

  const handleScheduleLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleCourseId || !scheduleInstructorId || !scheduleBatchName || !scheduleDate) {
      showToast("error", "Please fill in all scheduling fields.");
      return;
    }

    setSubmittingLecture(true);
    try {
      const res = await fetch(`${API_BASE}/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: scheduleCourseId,
          instructorId: scheduleInstructorId,
          batchName: scheduleBatchName,
          lectureDate: scheduleDate,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", `Lecture batch scheduled successfully.`);
        setScheduleBatchName("");
        setScheduleDate("");
        fetchLectures();
        setActiveTab("courses"); // Redirect to courses to see the scheduled batch
      } else {
        showToast("error", json.message || "Scheduling conflict or server error.");
      }
    } catch (err) {
      showToast("error", "Error contacting server to schedule lecture.");
    } finally {
      setSubmittingLecture(false);
    }
  };

  const triggerScheduleForCourse = (courseId: string) => {
    setScheduleCourseId(courseId);
    setActiveTab("lectures"); // Toggle tab to scheduling/lectures view
  };

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
          <span className="text-sm font-semibold">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans flex flex-col dark:bg-slate-950 dark:text-slate-555 transition-colors duration-300">
      
      {/* Top Banner Global Connection Header */}
      <Navbar role="admin" title="Administrator Control Deck" />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Floating Notification Panel */}
        {notification && (
          <div 
            id="admin-toast-notification"
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-xl flex gap-3 items-start border animate-fade-in ${
              notification.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400" 
                : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450"
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {notification.type === "success" ? (
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <span className="font-bold text-xs uppercase tracking-wider block">
                {notification.type === "success" ? "Operation Succeeded" : "Action Blocked"}
              </span>
              <p className="text-sm mt-1 font-medium leading-relaxed">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-2 shadow-sm border">
          <button
            id="tab-btn-courses"
            onClick={() => setActiveTab("courses")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "courses"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:text-slate-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Courses Catalog
          </button>
          
          <button
            id="tab-btn-instructors"
            onClick={() => setActiveTab("instructors")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "instructors"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:text-slate-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Instructors List
          </button>

          <button
            id="tab-btn-lectures"
            onClick={() => setActiveTab("lectures")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "lectures"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:text-slate-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Clashes & Master Timeline
          </button>

          <button
            id="tab-btn-add-course"
            onClick={() => setActiveTab("add-course")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 md:ml-auto ${
              activeTab === "add-course"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500"
                : "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-900 dark:text-indigo-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Course
          </button>
        </div>

        {/* 1. COURSES VIEW */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Course Offerings</h2>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Manage batches, timeline lectures, and view courses catalog</p>
              </div>
            </div>

            {loadingCourses ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-xs">Loading course assets...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="glass-panel p-16 text-center rounded-3xl border">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-900 border text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Courses Registered</h3>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Get started by creating your first catalog offering</p>
                <button
                  onClick={() => setActiveTab("add-course")}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const imgSrc = course.image ? (course.image.startsWith("http") ? course.image : `http://localhost:5000${course.image}`) : null;
                  return (
                    <div key={course._id} className="glass-panel rounded-3xl overflow-hidden shadow-md flex flex-col border border-slate-100 dark:border-slate-800/80 animate-fade-in group hover:shadow-lg transition-all duration-300">
                      
                      {/* Image Header Area */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden dark:bg-slate-900 border-b">
                        {imgSrc ? (
                          <img src={imgSrc} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500/25 to-violet-500/25 flex flex-col items-center justify-center p-4 text-center">
                            <span className="font-bold text-sm text-indigo-700 dark:text-indigo-400">{course.name}</span>
                            <span className="text-[10px] text-slate-400 mt-1">Cover gradient placeholder</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-md shadow uppercase ${
                            course.level === "Beginner"
                              ? "bg-emerald-500 text-white"
                              : course.level === "Intermediate"
                              ? "bg-amber-500 text-white"
                              : "bg-rose-500 text-white"
                          }`}>
                            {course.level}
                          </span>
                        </div>
                      </div>

                      {/* Content details and schedules */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-base leading-tight text-slate-800 dark:text-slate-100">{course.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{course.description}</p>
                          
                          {/* List of multiple batches/lectures for this course */}
                          {(() => {
                            const courseLectures = lectures.filter(l => l.courseId?._id === course._id);
                            if (courseLectures.length > 0) {
                              return (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Scheduled Batches ({courseLectures.length})</span>
                                  <div className="mt-1.5 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                    {courseLectures.map((l) => (
                                      <div key={l._id} className="text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex flex-col gap-0.5 dark:bg-slate-900/50 dark:border-slate-800/80">
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">{l.batchName}</span>
                                          <span className="text-[9px] text-indigo-600 font-bold dark:text-indigo-400">{formatFriendlyDate(l.lectureDate)}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 dark:text-slate-400">
                                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                          <span>{l.instructorId?.name || "Unassigned"}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="mt-3 pt-3 border-t border-slate-100 border-dashed dark:border-slate-800 text-center">
                                <span className="text-[10px] text-slate-400 italic">No batches scheduled yet</span>
                              </div>
                            );
                          })()}
                        </div>
                        <button
                          onClick={() => triggerScheduleForCourse(course._id)}
                          className="w-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-indigo-600 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-indigo-500 dark:text-indigo-400 mt-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Schedule batch lecture
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. INSTRUCTORS VIEW */}
        {activeTab === "instructors" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left: Register Instructor Form */}
            <div className="glass-panel p-6 rounded-3xl border flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Add New Instructor</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register a faculty teacher account</p>
              </div>

              <form onSubmit={handleCreateInstructor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Instructor Full Name *</label>
                  <input
                    type="text"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    placeholder="john@school.edu"
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingInstructor}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {submittingInstructor && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Save Instructor
                </button>
              </form>
            </div>

            {/* Right: Faculty Grid List */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Registered Faculty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">All instructors registered in the dashboard</p>
              </div>

              {loadingInstructors ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-xs">Loading faculty...</p>
                </div>
              ) : instructors.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border">
                  <span className="text-xs text-slate-400 italic">No faculty instructors registered yet</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instructors.map((inst) => (
                    <div key={inst._id} className="glass-panel p-4.5 rounded-2xl flex items-center gap-4 border shadow-sm group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border font-extrabold text-indigo-600 dark:text-indigo-400 text-sm flex items-center justify-center">
                        {inst.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-slate-500 uppercase tracking-widest block">Instructor ID</span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate mt-0.5">{inst.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{inst.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. LECTURES SCHEDULES & SCHEDULER FORM */}
        {activeTab === "lectures" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left: Schedule Form */}
            <div className="glass-panel p-6 rounded-3xl border flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Schedule Lecture Batch</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assign course batch to instructor on a date</p>
              </div>

              <form onSubmit={handleScheduleLecture} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Course *</label>
                  <select
                    value={scheduleCourseId}
                    onChange={(e) => setScheduleCourseId(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Assign Instructor *</label>
                  <select
                    value={scheduleInstructorId}
                    onChange={(e) => setScheduleInstructorId(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  >
                    <option value="">-- Choose Instructor --</option>
                    {instructors.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name} ({inst.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Batch Name *</label>
                  <input
                    type="text"
                    value={scheduleBatchName}
                    onChange={(e) => setScheduleBatchName(e.target.value)}
                    placeholder="e.g. Batch A, Morning Intensive"
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Lecture Date *</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toLocaleDateString("en-CA")}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLecture}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {submittingLecture && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Publish Schedule
                </button>
              </form>
            </div>

            {/* Right: Master Schedule List */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Master Schedule Log</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronological timeline of all scheduled classes</p>
              </div>

              {loadingLectures ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-xs">Loading schedules...</p>
                </div>
              ) : lectures.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border">
                  <span className="text-xs text-slate-400 italic">No scheduled lectures found</span>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {lectures.map((l) => (
                    <div key={l._id} className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 border shadow-sm hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                      <div className="flex items-start gap-3.5">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100">{l.batchName}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-100/40">
                              {l.courseId?.name || "Deleted Course"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-450 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Instructor: <span className="font-semibold text-slate-700 dark:text-slate-350">{l.instructorId?.name || "Deleted"}</span></span>
                            </div>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[11px] truncate max-w-[150px]">{l.instructorId?.email || ""}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block">Scheduled Date</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatFriendlyDate(l.lectureDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. ADD COURSE FORM VIEW */}
        {activeTab === "add-course" && (
          <div className="max-w-2xl mx-auto w-full animate-fade-in">
            <div className="glass-panel p-8 rounded-3xl border shadow-md flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New Course Offering</h2>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Introduce a new course catalog module into the database system</p>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Course Title / Name *</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Advanced Fullstack Web Dev"
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-3 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Skill Level *</label>
                    <select
                      value={courseLevel}
                      onChange={(e) => setCourseLevel(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 p-3 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Image File Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 dark:file:bg-indigo-950/40 dark:file:text-indigo-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Or Image Asset URL (Fallback)</label>
                  <input
                    type="text"
                    value={courseImageUrl}
                    onChange={(e) => {
                      setCourseImageUrl(e.target.value);
                      setCourseImageFile(null);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/... or /next.svg"
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-3 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                  />
                </div>

                {imagePreview && (
                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-2.5 bg-slate-50 dark:bg-slate-900/40">
                    <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-2 block">Cover Image Preview</span>
                    <div className="h-36 w-full rounded-xl overflow-hidden relative border bg-slate-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Description *</label>
                  <textarea
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    rows={3}
                    placeholder="Provide a comprehensive course details summary..."
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-3 rounded-xl custom-input dark:bg-slate-900/50 dark:border-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all text-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {submittingCourse && (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Save Course
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
