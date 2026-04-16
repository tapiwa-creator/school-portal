import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getCountFromServer } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "../../../Firebase/Firebase";
import { useAuth } from "../../../context/Authcontext";
import {
    AlertTriangle, GraduationCap, Lock, CheckCircle,
    MessageSquare, Info, Shield, Users, Briefcase, Clock
} from "lucide-react";

const TABS = ["Personal Details", "Staff Information", "Change Password"];

// ── Info row ───────────────────────────────────────────────────────────────
function InfoRow({ label, value, highlight = false }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-44 flex-shrink-0 pt-0.5">
                {label}
            </span>
            <span className={`text-sm font-medium text-right ${highlight ? "text-green-700 font-semibold" : "text-gray-800"}`}>
                {value || "—"}
            </span>
        </div>
    );
}

// ── Info section card ──────────────────────────────────────────────────────
function InfoCard({ title, icon, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                <span className="text-lg">{icon}</span>
                <span className="font-semibold text-gray-800">{title}</span>
            </div>
            {children}
        </div>
    );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <div className={`${color} rounded-2xl p-5 border border-white`}>
            <div className="text-2xl mb-2">{icon}</div>
            <div className={`text-xl font-bold ${color.replace("bg-", "text-").replace("-50", "-700")} mb-1`}>
                {value ?? "—"}
            </div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}

// ── Password field ─────────────────────────────────────────────────────────
function PasswordField({ label, value, onChange, show, onToggle, error }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 bg-gray-50 outline-none transition-colors pr-10
            ${error ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-green-400"}`}
                    placeholder="••••••••"
                />
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {show ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ── Password strength ──────────────────────────────────────────────────────
function PasswordStrength({ password }) {
    const checks = [
        { label: "At least 8 characters", pass: password.length >= 8 },
        { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
        { label: "Number", pass: /[0-9]/.test(password) },
        { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password) },
    ];
    const strength = checks.filter(c => c.pass).length;
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
    const labels = ["Weak", "Fair", "Good", "Strong"];
    if (!password) return null;
    return (
        <div className="mt-3 space-y-2">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : "bg-gray-100"}`} />
                ))}
            </div>
            <p className={`text-xs font-semibold ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-orange-500" :
                strength === 3 ? "text-yellow-600" : "text-green-600"
                }`}>{strength === 0 ? "" : labels[strength - 1]}</p>
            <div className="grid grid-cols-2 gap-1 pt-1">
                {checks.map(({ label, pass }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <span className={`text-xs ${pass ? "text-green-500" : "text-gray-300"}`}>{pass ? "✓" : "○"}</span>
                        <span className={`text-xs ${pass ? "text-gray-600" : "text-gray-400"}`}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ className }) {
    return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminProfile() {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Live counts fetched from Firestore — no hardcoded values
    const [stats, setStats] = useState({
        totalStudents: null,
        totalStaff: null,
        totalClasses: null,
        activeAssignments: null,
    });

    // Password state
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState("");
    const [pwLoading, setPwLoading] = useState(false);

    // ── Load admin profile from Firestore ─────────────────────────────────
    // Fields come from CreateAccount.js → setDoc(doc(db, "users", user.uid), profileData)
    // profileData contains: uid, fullName, email, phone, role, createdAt, updatedAt
    useEffect(() => {
        if (!currentUser?.uid) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const userSnap = await getDoc(doc(db, "users", currentUser.uid));

                if (userSnap.exists()) {
                    // All fields as saved by CreateAccount.js — no overrides
                    setProfile(userSnap.data());
                } else {
                    // Minimal fallback using only Firebase Auth data (no invented values)
                    setProfile({
                        fullName: currentUser.displayName || "",
                        email: currentUser.email || "",
                        role: "admin",
                        phone: "",
                        createdAt: null,
                        updatedAt: null,
                    });
                }

                // ── Live Firestore counts (no hardcoded numbers) ──────────
                const [studentSnap, staffSnap, classSnap, assignSnap] = await Promise.all([
                    getCountFromServer(query(collection(db, "users"), where("role", "==", "student"))),
                    getCountFromServer(query(collection(db, "users"), where("role", "==", "staff"))),
                    getCountFromServer(collection(db, "classes")),
                    getCountFromServer(query(collection(db, "assignments"), where("status", "==", "active"))),
                ]);

                setStats({
                    totalStudents: studentSnap.data().count,
                    totalStaff: staffSnap.data().count,
                    totalClasses: classSnap.data().count,
                    activeAssignments: assignSnap.data().count,
                });

            } catch (err) {
                console.error("Error loading admin profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser]);

    // ── Change password ────────────────────────────────────────────────────
    const handleChangePassword = async () => {
        setPwError("");
        if (!currentPw) return setPwError("Please enter your current password.");
        if (newPw.length < 8) return setPwError("New password must be at least 8 characters.");
        if (newPw !== confirmPw) return setPwError("Passwords do not match.");

        setPwLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPw);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPw);
            setPwSuccess(true);
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
            setTimeout(() => setPwSuccess(false), 4000);
        } catch (err) {
            console.error("Password change error:", err);
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setPwError("Current password is incorrect.");
            } else if (err.code === "auth/weak-password") {
                setPwError("New password is too weak.");
            } else {
                setPwError(err.message || "Failed to update password. Please try again.");
            }
        } finally {
            setPwLoading(false);
        }
    };

    // ── Derived display values — sourced only from Firestore / Auth ────────
    // fullName is saved by CreateAccount.js from form.fullName
    const name = profile?.fullName || currentUser?.displayName || "";

    // Initials from the actual stored name — no "AD" default
    const initials = name
        ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "??";

    // Role display maps the role string saved by CreateAccount.js
    const getRoleDisplay = (role) => {
        const roleMap = {
            admin: "Administrator",
            super_admin: "Super Administrator",
            manager: "School Manager",
            staff: "Staff Member",
            student: "Student",
        };
        return role ? (roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1)) : "";
    };

    // Format Firestore Timestamp or plain date string
    const formatDate = (val) => {
        if (!val) return null;
        if (val?.toDate) return val.toDate().toLocaleDateString();
        if (typeof val === "string") return val;
        return null;
    };

    // ── Loading skeleton ───────────────────────────────────────────────────
    if (loadingProfile) {
        return (
            <div className="p-3 md:p-6 space-y-4 pt-16 md:pt-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-10 w-64 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-5 pt-16 md:pt-6">

            {/* ── Hero Banner ── */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div
                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl md:text-2xl font-bold text-white"
                            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)" }}
                        >
                            {initials}
                        </div>
                        <div>
                            {/* Logged-in user's actual name from Firestore */}
                            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">{name || "—"}</h1>
                            <p className="text-green-300 text-xs md:text-sm">
                                {/* uid is the only reliable ID until staffId is added to the form */}
                                {profile?.staffId || currentUser?.uid?.slice(0, 8) || ""}
                                {profile?.department ? ` | ${profile.department}` : ""}
                                {profile?.position ? ` · ${profile.position}` : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 md:gap-4">
                        {[
                            { value: getRoleDisplay(profile?.role), label: "Role" },
                            // department & status only shown if actually stored in Firestore
                            { value: profile?.department || null, label: "Department" },
                            { value: profile?.status || null, label: "Status" },
                        ]
                            .filter(item => item.value)   // hide tiles with no data
                            .map(({ value, label }) => (
                                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]">
                                    <div className="text-white text-base md:text-lg font-bold leading-tight">{value}</div>
                                    <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full md:w-fit overflow-x-auto">
                {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)}
                        className={`px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-1 md:flex-none ${activeTab === i ? "bg-white text-gray-900 shadow-sm font-semibold" : "text-gray-500 hover:text-gray-700"
                            }`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab 0: Personal Details ── */}
            {activeTab === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <InfoCard title="Personal Information" icon={<Shield className="w-5 h-5" />}>
                        {/* All values from Firestore fields set in CreateAccount.js */}
                        <InfoRow label="Full Name" value={profile?.fullName} />
                        <InfoRow label="Email" value={profile?.email} />
                        <InfoRow label="Phone" value={profile?.phone} />
                        {/* gender & dob are not collected in CreateAccount.js — show only if stored */}
                        {profile?.gender && <InfoRow label="Gender" value={profile.gender} />}
                        {profile?.dob && <InfoRow label="Date of Birth" value={profile.dob} />}
                        <InfoRow label="Account Created" value={formatDate(profile?.createdAt)} />
                    </InfoCard>

                    <InfoCard title="Contact Details" icon={<MessageSquare className="w-5 h-5" />}>
                        <InfoRow label="Email Address" value={profile?.email} />
                        <InfoRow label="Phone Number" value={profile?.phone} />
                        {/* Only show fields if they exist in Firestore */}
                        {profile?.extension && <InfoRow label="Office Extension" value={profile.extension} />}
                        {profile?.emergencyContact && <InfoRow label="Emergency Contact" value={profile.emergencyContact} />}
                    </InfoCard>

                    <InfoCard title="Employment Details" icon={<Briefcase className="w-5 h-5" />}>
                        {/* staffId is not yet in CreateAccount.js — display uid prefix as fallback */}
                        <InfoRow
                            label="Staff ID"
                            value={profile?.staffId || currentUser?.uid?.slice(0, 8)}
                            highlight
                        />
                        {profile?.position && <InfoRow label="Position" value={profile.position} />}
                        {profile?.department && <InfoRow label="Department" value={profile.department} />}
                        {profile?.hireDate && <InfoRow label="Hire Date" value={profile.hireDate} />}
                        {profile?.employmentType && <InfoRow label="Employment Type" value={profile.employmentType} />}
                        <InfoRow label="Last Updated" value={formatDate(profile?.updatedAt)} />
                    </InfoCard>

                    <InfoCard title="Account & Access" icon={<Lock className="w-5 h-5" />}>
                        {/* role is saved by CreateAccount.js */}
                        <InfoRow label="Account Type" value={getRoleDisplay(profile?.role)} highlight />
                        {profile?.accessLevel && <InfoRow label="Access Level" value={profile.accessLevel} highlight />}
                        <InfoRow label="Email (Login)" value={profile?.email || currentUser?.email} />
                        {profile?.status && <InfoRow label="Status" value={profile.status} highlight />}
                        <div className="mt-4 bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600 leading-relaxed">
                                <Info className="w-5 h-5 inline-block mr-1" /> Admin accounts have full access to school management features.
                            </p>
                        </div>
                    </InfoCard>
                </div>
            )}

            {/* ── Tab 1: Staff Information ── */}
            {activeTab === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <InfoCard title="Staff Details" icon={<GraduationCap className="w-5 h-5" />}>
                        <InfoRow label="Staff ID" value={profile?.staffId || currentUser?.uid?.slice(0, 8)} highlight />
                        <InfoRow label="Role" value={getRoleDisplay(profile?.role)} />
                        {profile?.department && <InfoRow label="Department" value={profile.department} />}
                        {profile?.supervisor && <InfoRow label="Supervisor" value={profile.supervisor} />}
                        {profile?.qualifications && <InfoRow label="Qualifications" value={profile.qualifications} />}
                        <InfoRow label="Member Since" value={formatDate(profile?.createdAt)} />
                    </InfoCard>

                    <InfoCard title="School Information" icon={<Briefcase className="w-5 h-5" />}>
                        {/* School name is a fixed institutional fact, not user data */}
                        <InfoRow label="School" value="Corner Stone Primary School" />
                        {profile?.campus && <InfoRow label="Campus" value={profile.campus} />}
                        {profile?.office && <InfoRow label="Office" value={profile.office} />}
                        <InfoRow label="Work Email" value={profile?.email} />

                        <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-green-800">
                                    {profile?.status === "Active" ? "Active Staff Member" : "Staff Account"}
                                </p>
                                <p className="text-xs text-green-600 mt-0.5">
                                    {profile?.status === "Active"
                                        ? "You have full administrative access to the school system."
                                        : "Logged in as " + getRoleDisplay(profile?.role)}
                                </p>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Live stats fetched from Firestore — no hardcoded numbers */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatCard
                                icon={<Users className="w-5 h-5" />}
                                label="Total Students"
                                value={stats.totalStudents}
                                color="bg-blue-50"
                            />
                            <StatCard
                                icon={<Shield className="w-5 h-5" />}
                                label="Total Staff"
                                value={stats.totalStaff}
                                color="bg-green-50"
                            />
                            <StatCard
                                icon={<GraduationCap className="w-5 h-5" />}
                                label="Active Classes"
                                value={stats.totalClasses}
                                color="bg-purple-50"
                            />
                            <StatCard
                                icon={<Clock className="w-5 h-5" />}
                                label="Active Assignments"
                                value={stats.activeAssignments}
                                color="bg-yellow-50"
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <InfoCard title="Administrative Permissions" icon={<Shield className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    "Student Management",
                                    "Staff Management",
                                    "Timetable Management",
                                    "Assignment Management",
                                    "Event Management",
                                    "Reports & Analytics",
                                    "System Settings",
                                    "User Permissions",
                                    "Data Export",
                                ].map(permission => (
                                    <div key={permission} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-green-500">✓</span>
                                        <span>{permission}</span>
                                    </div>
                                ))}
                            </div>
                        </InfoCard>
                    </div>
                </div>
            )}

            {/* ── Tab 2: Change Password ── */}
            {activeTab === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
                            <span className="text-lg"><Lock className="w-5 h-5 inline-block" /></span>
                            <span className="font-semibold text-gray-800">Change Password</span>
                        </div>

                        {pwSuccess && (
                            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                                <span className="text-green-500 text-lg"><CheckCircle className="w-5 h-5 inline-block" /></span>
                                <p className="text-sm font-semibold text-green-700">Password changed successfully!</p>
                            </div>
                        )}
                        {pwError && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
                                <span className="text-red-500 text-lg"><AlertTriangle className="w-5 h-5 inline-block" /></span>
                                <p className="text-sm font-medium text-red-600">{pwError}</p>
                            </div>
                        )}

                        <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw}
                            show={showCurrent} onToggle={() => setShowCurrent(p => !p)} />

                        <PasswordField label="New Password" value={newPw} onChange={setNewPw}
                            show={showNew} onToggle={() => setShowNew(p => !p)} />

                        <PasswordStrength password={newPw} />

                        <PasswordField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw}
                            show={showConfirm} onToggle={() => setShowConfirm(p => !p)}
                            error={confirmPw && newPw !== confirmPw ? "Passwords do not match" : ""} />

                        <button onClick={handleChangePassword} disabled={pwLoading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-85 transition-opacity disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #0d2818, #1a4d2a)" }}>
                            {pwLoading ? "Updating..." : "Update Password"}
                        </button>
                    </div>

                    {/* Tips & security */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                                <span className="text-lg">🔒</span>
                                <span className="font-semibold text-gray-800">Password Tips</span>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Use at least 8 characters",
                                    "Mix uppercase, lowercase, numbers & symbols",
                                    "Avoid using your name or staff ID",
                                    "Don't reuse passwords from other accounts",
                                    "Change your password every 3–6 months",
                                ].map(text => (
                                    <li key={text} className="flex items-start gap-2.5">
                                        <span className="font-bold text-sm flex-shrink-0 mt-0.5 text-green-500">•</span>
                                        <span className="text-sm text-gray-600">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg"><AlertTriangle className="w-5 h-5 inline-block" /></span>
                                <span className="font-semibold text-orange-700">Security Notice</span>
                            </div>
                            <p className="text-sm text-orange-600 leading-relaxed">
                                As an administrator, your account has elevated privileges. Never share your password
                                with anyone, including IT staff. Corner Stone will never ask for your password.
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg"><MessageSquare className="w-5 h-5 inline-block" /></span>
                                <span className="font-semibold text-gray-700">Need Help?</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Forgot your password or locked out? Contact IT helpdesk.</p>
                            <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
                                Contact IT Support →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}