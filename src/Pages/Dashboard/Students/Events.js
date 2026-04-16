// src/Pages/Dashboard/Student/Events.js
import { useState, useEffect } from "react";
import EventServices from "../../../service/student/EventServices";

// ── Data ──────────────────────────────────────────────────────────────────────
const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
const CLASSES = GRADES.flatMap(g => [`${g}A`, `${g}B`]);
const STAFF = ["Mr. Moyo", "Mrs. Dube", "Mr. Ncube", "Ms. Sibanda", "Mrs. Mpofu", "Mr. Ndlovu", "Ms. Chikwanda", "Administration"];

const EVENT_TYPES = {
    "Sports": { pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    "Academic": { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    "Cultural": { pill: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    "Health": { pill: "bg-red-100 text-red-700", dot: "bg-red-500" },
    "Meeting": { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
    "Ceremony": { pill: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    "Trip": { pill: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
    "Fundraiser": { pill: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
};

const STATUS_STYLES = {
    "Upcoming": { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    "Active": { pill: "bg-green-100 text-green-700", dot: "bg-green-500" },
    "Completed": { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
    "Cancelled": { pill: "bg-red-100 text-red-600", dot: "bg-red-500" },
    "Postponed": { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
};

const AUDIENCE_OPTIONS = ["All", "Parents & Guardians", "Staff Only", ...GRADES, "Grade 6 & 7", "Grade 1–3", "Grade 4–7"];
const VENUES = ["School Grounds", "Hall A", "Room 101", "Room 102", "Room 103", "Lab 1", "Gym", "Art Room", "Sports Field", "Off-Campus"];

const FILE_ICONS = {
    pdf: { bg: "bg-red-50", icon: "text-red-500", label: "PDF" },
    docx: { bg: "bg-blue-50", icon: "text-blue-500", label: "DOCX" },
    xlsx: { bg: "bg-green-50", icon: "text-green-600", label: "XLSX" },
    pptx: { bg: "bg-orange-50", icon: "text-orange-500", label: "PPTX" },
    jpg: { bg: "bg-purple-50", icon: "text-purple-500", label: "IMG" },
    png: { bg: "bg-purple-50", icon: "text-purple-500", label: "IMG" },
    other: { bg: "bg-gray-50", icon: "text-gray-500", label: "FILE" },
};

function getFileStyle(name) {
    if (!name) return FILE_ICONS.other;
    return FILE_ICONS[name.split(".").pop().toLowerCase()] || FILE_ICONS.other;
}

function formatDate(iso) {
    if (!iso) return "–";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function daysUntil(iso) {
    return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
}

// Events are fetched from Firestore via EventServices

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500" }) => (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }} />
    </div>
);

// ── Event Card (Student View - No Edit/Delete) ────────────────────────────────────────────────
function EventCard({ event }) {
    const [expanded, setExpanded] = useState(false);
    const typeStyle = EVENT_TYPES[event.type] || { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
    const statStyle = STATUS_STYLES[event.status] || STATUS_STYLES.Upcoming;
    const fileStyle = getFileStyle(event.fileName);
    const days = daysUntil(event.eventDate);
    
    // Safety checks for undefined data
    const desc = event.description || "";
    const isLong = desc.length > 160;
    const audience = event.audience || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="p-5">

                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${typeStyle.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeStyle.dot}`} />
                            {event.type}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statStyle.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statStyle.dot}`} />
                            {event.status}
                        </span>
                        {event.ticketed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                Ticketed
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-gray-900 font-bold text-base mb-2 leading-snug">{event.title}</h3>

                {/* Key info row */}
                <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        {formatDate(event.eventDate)}
                    </div>
                    {event.startTime && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.venue}
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                    {isLong && !expanded ? desc.slice(0, 160) + "..." : desc}
                </p>
                {isLong && (
                    <button onClick={() => setExpanded(e => !e)} className="text-green-600 text-xs font-semibold mt-1 hover:underline">
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}

                {/* Audience tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {audience.map(a => (
                        <span key={a} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                </div>

                {/* File */}
                {event.fileName && (
                    <div className={`flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl border border-gray-100 ${fileStyle.bg}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-gray-100">
                            <svg className={`w-4 h-4 ${fileStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-700 truncate">{event.fileName}</div>
                            <div className="text-[10px] text-gray-400">{event.fileSize} · {fileStyle.label}</div>
                        </div>
                        <button className="text-xs font-bold text-green-700 hover:text-green-900 transition-colors flex items-center gap-1 flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <span className="text-xs text-gray-400">{event.organiser}</span>
                    </div>
                    {event.status !== "Completed" && event.status !== "Cancelled" && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${days < 0 ? "bg-red-50 text-red-500"
                                : days === 0 ? "bg-green-50 text-green-600"
                                    : days <= 3 ? "bg-orange-50 text-orange-500"
                                        : days <= 7 ? "bg-yellow-50 text-yellow-600"
                                            : "bg-gray-50 text-gray-400"
                            }`}>
                            {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `In ${days} day${days !== 1 ? "s" : ""}`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Component (Student View) ────────────────────────────────────────────
export default function StudentEvents() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = EventServices.subscribeToEvents((data) => {
            setEvents(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const filtered = events.filter(e =>
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.type.toLowerCase().includes(search.toLowerCase()) ||
        e.organiser.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase())
    );

    const total = events.length;
    const upcoming = events.filter(e => e.status === "Upcoming").length;
    const active = events.filter(e => e.status === "Active").length;
    const completed = events.filter(e => e.status === "Completed").length;
    const ticketed = events.filter(e => e.ticketed).length;
    const withFile = events.filter(e => e.fileName).length;

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

            {/* ── Hero Banner ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
                    <div>
                        <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">School Events</h1>
                        <p className="text-green-300 text-xs md:text-sm">
                            Upcoming and Past Events &nbsp;|&nbsp; Corner Stone Primary School
                        </p>
                    </div>
                    <div className="flex gap-3 md:gap-4 flex-wrap">
                        {[
                            { value: total, label: "Total" },
                            { value: upcoming, label: "Upcoming" },
                            { value: active, label: "Active" },
                        ].map(({ value, label }) => (
                            <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]">
                                <div className="text-white text-xl md:text-2xl font-bold">{value}</div>
                                <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">

                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">All</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{total}</div>
                    <div className="text-gray-400 text-sm mb-3 md:mb-4">Total Events</div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>All events</span><span>{total}</span></div>
                    <ProgressBar value={total} max={total} color="bg-green-500" />
                </div>

                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Soon</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{upcoming}</div>
                    <div className="text-gray-400 text-sm mb-3 md:mb-4">Upcoming</div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
                    <ProgressBar value={upcoming} max={total} color="bg-blue-500" />
                </div>

                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Done</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{completed}</div>
                    <div className="text-gray-400 text-sm mb-3 md:mb-4">Completed</div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
                    <ProgressBar value={completed} max={total} color="bg-gray-400" />
                </div>

                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Tickets</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{ticketed}</div>
                    <div className="text-gray-400 text-sm mb-3 md:mb-4">Ticketed Events</div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
                    <ProgressBar value={ticketed} max={total} color="bg-amber-400" />
                </div>

            </div>

            {/* ── Events List Card ── */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="font-semibold text-gray-800">All Events</span>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
                    </div>
                    <div className="relative">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-green-400 transition-colors w-72" />
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-sm font-medium">No events found</p>
                            <p className="text-xs mt-1">Try adjusting your search</p>
                        </div>
                    ) : (
                        filtered.map(e => (
                            <EventCard key={e.id} event={e} />
                        ))
                    )}
                </div>

                {/* Legend */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Event Types</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(EVENT_TYPES).map(([type, style]) => (
                            <div key={type} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom two-col ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-5">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        <span className="font-semibold text-gray-800">Events by Type</span>
                    </div>
                    {Object.keys(EVENT_TYPES).map(type => {
                        const count = events.filter(e => e.type === type).length;
                        if (!count) return null;
                        return (
                            <div key={type} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                                <span className="text-sm font-semibold text-gray-800 w-32 shrink-0">{type}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${EVENT_TYPES[type].dot}`} style={{ width: `${(count / total) * 100}%` }} />
                                </div>
                                <span className="text-sm font-bold text-gray-800 w-6 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-5">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span className="font-semibold text-gray-800">Event Overview</span>
                    </div>
                    <div className="flex justify-center mb-6">
                        <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ border: "8px solid #4caf6a" }}>
                            <span className="text-3xl font-bold text-gray-900">{total}</span>
                            <span className="text-xs text-gray-400 mt-0.5">Events</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { lbl: "Upcoming", val: `${upcoming}`, cls: "text-blue-600", bg: "bg-blue-50" },
                            { lbl: "Active", val: `${active}`, cls: "text-green-600", bg: "bg-green-50" },
                            { lbl: "Completed", val: `${completed}`, cls: "text-gray-600", bg: "bg-gray-50" },
                            { lbl: "Ticketed", val: `${ticketed}`, cls: "text-amber-600", bg: "bg-amber-50" },
                        ].map(({ lbl, val, cls, bg }) => (
                            <div key={lbl} className={`${bg} rounded-xl p-3.5 text-center`}>
                                <div className="text-xs text-gray-400 mb-1">{lbl}</div>
                                <div className={`text-base font-bold ${cls}`}>{val}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-7 right-7 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl"
                    style={{ background: toast.type === "error" ? "linear-gradient(135deg,#c0392b,#e74c3c)" : "linear-gradient(135deg,#1a4d2a,#2d6e3e)", animation: "slideUp .3s ease" }}>
                    {toast.msg}
                </div>
            )}

            <style>{`
        @keyframes slideUp { from { transform: translateY(14px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      `}</style>
        </div>
    );
}