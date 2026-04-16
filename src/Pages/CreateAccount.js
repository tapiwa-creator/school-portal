

// src/Pages/CreateAccount.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../Firebase/Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { AlertTriangle, GraduationCap } from "lucide-react";


const CreateAccount = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = personal info, 2 = credentials

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    grade: "Grade 1",       // for students
    studentId: "",          // for students
    password: "",
    confirmPassword: "",
  });

  const isAdmin = role === "admin";

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setError("");
  };

  const handleNext = () => {
    if (!form.fullName.trim()) { setError("Full name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email."); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) { setError("Password is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    setError("");

    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = credential.user;

      // 2. Update display name
      await updateProfile(user, { displayName: form.fullName });

      // 2.5 Generate unique student ID if student and not provided
      let finalStudentId = form.studentId ? form.studentId.trim() : "";
      if (role === "student" && !finalStudentId) {
        let isUnique = false;
        while (!isUnique) {
          finalStudentId = "C" + Math.floor(100000 + Math.random() * 900000).toString();
          const q = query(collection(db, "users"), where("studentId", "==", finalStudentId));
          const snap = await getDocs(q);
          if (snap.empty) {
            isUnique = true;
          }
        }
      }

      // 3. Save profile to Firestore
      const profileData = {
        uid: user.uid,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || "",
        role,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...(role === "student" && {
          grade: form.grade,
          studentId: finalStudentId,
          status: "Pending",
          academic: [],
          attendance: { present: 0, absent: 0, late: 0, total: 0 },
          remarks: [],
          discipline: [],
        }),
      };

      // Save to 'users' collection (all users)
      await setDoc(doc(db, "users", user.uid), profileData);

      // Also save to 'students' collection if student role
      if (role === "student") {
        await setDoc(doc(db, "students", user.uid), {
          ...profileData,
          name: form.fullName,
          avatar: form.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
          enrolled: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        });
      }

      // 4. Redirect to login
      navigate("/login", {
        state: { message: "Account created successfully! Please sign in." }
      });

    } catch (err) {
      console.error("CreateAccount error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .card-in { animation: cardIn 0.55s cubic-bezier(.22,1,.36,1) both; }
        .loading-spinner {
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          width: 20px; height: 20px;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
        }
        .step-fade {
          animation: cardIn 0.3s cubic-bezier(.22,1,.36,1) both;
        }
        .createaccount-bg {
          background-image: url('/login1.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: scroll;
          background-position: center center;
        }
      `}</style>

      <div
        className="createaccount-bg min-h-screen flex items-center justify-center px-4 py-16 relative"
      >
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Form container shifted slightly to the right of center */}
        <div className="relative z-10 w-full max-w-sm translate-x-8 md:translate-x-12 lg:translate-x-16">
          <div
            className="card-in bg-white/95 backdrop-blur-sm w-full rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 28px 70px rgba(0,0,0,0.25), 0 4px 18px rgba(0,0,0,0.15)" }}
          >
            {/* ── Green Banner ── */}
            <div className="bg-[#0d4a2f] px-6 py-6 flex flex-col items-center gap-3">
              <Link
                to="/login"
                className="self-start flex items-center gap-1.5 text-white hover:text-white/70 text-xs font-medium transition-colors duration-200 mb-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Login
              </Link>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#22a86a] shadow-lg flex-shrink-0">
                  <img src="/image.png" alt="Corner Stone Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-white font-bold text-lg font-serif tracking-wide">
                  Corner Stone Primary School
                </span>
              </div>
              <p className="text-white/60 text-xs tracking-wide">Create your account to get started</p>

              {/* Role toggle */}
              <div className="mt-3 flex bg-[#0a3d26] rounded-full p-1 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => { setRole("student"); setError(""); }}
                  disabled={loading}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${!isAdmin ? "bg-[#22a86a] text-white shadow-md" : "text-white/50 hover:text-white/80"
                    }`}
                ><GraduationCap className="w-4 h-4 inline-block mr-1" /> Student</button>
                <button
                  type="button"
                  onClick={() => { setRole("admin"); setError(""); }}
                  disabled={loading}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isAdmin ? "bg-[#22a86a] text-white shadow-md" : "text-white/50 hover:text-white/80"
                    }`}
                >️ Admin</button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-2">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${step === s ? "bg-[#22a86a] text-white" :
                      step > s ? "bg-white/30 text-white" : "bg-white/10 text-white/40"
                      }`}>{s}</div>
                    {s < 2 && <div className={`w-6 h-0.5 rounded transition-all duration-300 ${step > s ? "bg-[#22a86a]" : "bg-white/20"}`} />}
                  </div>
                ))}
                <span className="text-white/50 text-[10px] ml-1">
                  {step === 1 ? "Personal Info" : "Set Password"}
                </span>
              </div>
            </div>

            {/* ── Form Body ── */}
            <div className="px-6 py-6">
              <h2 className="text-xl font-black font-serif text-[#0d2018] mb-1">
                {step === 1 ? "Your Details" : "Secure Your Account"}
              </h2>
              <p className="text-xs text-[#6b8f7a] mb-5">
                {step === 1
                  ? `Fill in your ${isAdmin ? "admin" : "student"} information below.`
                  : "Choose a strong password for your account."}
              </p>

              {/* Step 1 — Personal Info */}
              {step === 1 && (
                <div className="step-fade flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Full Name *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text" value={form.fullName}
                        onChange={e => set("fullName", e.target.value)}
                        placeholder="e.g. Emma Kamau"
                        disabled={loading}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Email Address *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </span>
                      <input
                        type="email" value={form.email}
                        onChange={e => set("email", e.target.value)}
                        placeholder="your@email.com"
                        disabled={loading}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input
                        type="tel" value={form.phone}
                        onChange={e => set("phone", e.target.value)}
                        placeholder="+263 77 123 4567"
                        disabled={loading}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                      />
                    </div>
                  </div>

                  {!isAdmin && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Grade</label>
                        <select
                          value={form.grade}
                          onChange={e => set("grade", e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                        >
                          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map(g => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Student ID (Optional)</label>
                        <input
                          type="text" value={form.studentId}
                          onChange={e => set("studentId", e.target.value)}
                          placeholder="e.g. C123456"
                          disabled={loading}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                      <span><AlertTriangle className="w-4 h-4 inline-block" /></span> {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-[#0d4a2f] hover:bg-[#1a6b43] text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform mt-1"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2 — Password */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="step-fade flex flex-col gap-4">

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Password *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={e => set("password", e.target.value)}
                        placeholder="Minimum 6 characters"
                        disabled={loading}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8f7a] hover:text-[#22a86a] transition-colors duration-200">
                        {showPassword
                          ? <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {form.password && (
                      <div className="mt-1">
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${form.password.length < 6 ? "w-1/4 bg-red-400" :
                            form.password.length < 10 ? "w-2/4 bg-orange-400" :
                              form.password.length < 14 ? "w-3/4 bg-blue-400" : "w-full bg-[#22a86a]"
                            }`} />
                        </div>
                        <p className={`text-[10px] mt-1 font-medium ${form.password.length < 6 ? "text-red-400" :
                          form.password.length < 10 ? "text-orange-400" :
                            form.password.length < 14 ? "text-blue-400" : "text-[#22a86a]"
                          }`}>
                          {form.password.length < 6 ? "Too short" :
                            form.password.length < 10 ? "Weak" :
                              form.password.length < 14 ? "Good" : "Strong "}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Confirm Password *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={e => set("confirmPassword", e.target.value)}
                        placeholder="Re-enter your password"
                        disabled={loading}
                        className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-white/90 text-[#0d2018] text-sm placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 ${form.confirmPassword && form.confirmPassword !== form.password
                          ? "border-red-300 focus:ring-red-400/40 focus:border-red-400"
                          : form.confirmPassword && form.confirmPassword === form.password
                            ? "border-[#22a86a] focus:ring-[#22a86a]/40 focus:border-[#22a86a]"
                            : "border-gray-200 focus:ring-[#22a86a]/40 focus:border-[#22a86a]"
                          }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8f7a] hover:text-[#22a86a] transition-colors duration-200">
                        {showConfirm
                          ? <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    </div>
                    {form.confirmPassword && form.confirmPassword !== form.password && (
                      <p className="text-[10px] text-red-400 font-medium mt-0.5">Passwords do not match</p>
                    )}
                    {form.confirmPassword && form.confirmPassword === form.password && (
                      <p className="text-[10px] text-[#22a86a] font-medium mt-0.5">Passwords match </p>
                    )}
                  </div>

                  {/* Role badge */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${isAdmin
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-[#e6f7f0] text-[#1a6b43] border border-[#22a86a]/20"
                    }`}>
                    <span>{isAdmin ? "️" : <GraduationCap className="w-4 h-4" />}</span>
                    Creating {isAdmin ? "Administrator" : "Student"} account for{" "}
                    <span className="font-bold">{form.fullName}</span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                      <span><AlertTriangle className="w-4 h-4 inline-block" /></span> {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(""); }}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#0d4a2f] hover:bg-[#1a6b43] text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="loading-spinner" />
                          <span>Creating...</span>
                        </div>
                      ) : "Create Account →"}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-center text-xs text-[#6b8f7a] mt-5">
                Already have an account?{" "}
                <Link to="/login" className="text-[#22a86a] hover:text-[#1a6b43] font-semibold transition-colors duration-200">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAccount;